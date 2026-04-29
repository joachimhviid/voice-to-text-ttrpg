import { db } from '#server/db'
import type { ParticipantRole } from '#server/db/schema'
import { participants, sessions, SessionStatus } from '#server/db/schema'
import { sessionActionSchema } from '#shared/types/session'
import { PARTICIPANT_SESSION_COOKIE, parseParticipantSessionCookie } from '#shared/utils/participantSessionCookie'
import { and, eq } from 'drizzle-orm'
import { match } from 'ts-pattern'
import { parse } from 'cookie-es'
import { combineTranscripts, saveTranscript } from '#server/utils/saveTranscript'

export type PeerParticipantContext = {
  nickname: string
  participantId: number
  role: ParticipantRole
  sessionId: string
}

type SessionPeerContext = {
  participant?: PeerParticipantContext
}

const getParticipantContext = (peer: { context?: unknown }) => (peer.context as SessionPeerContext)?.participant

export default defineWebSocketHandler({
  close: (peer, _details) => {
    const participant = getParticipantContext(peer)
    if (!participant) {
      return
    }

    db.update(participants)
      .set({ peerId: null })
      .where(and(eq(participants.id, participant.participantId), eq(participants.peerId, peer.id)))
      .run()
  },
  error: (_peer, error) => {
    console.error('WebSocket error', error)
  },
  message: (peer, message) => {
    const data = message.json()

    const result = sessionActionSchema.safeParse(data)
    if (!result.success) {
      peer.send({ error: 'Invalid payload format' })
      return
    }

    const participant = getParticipantContext(peer)

    match(result.data)
      .with({ action: 'join' }, (event) => {
        // const participant = getParticipantContext(peer)
        if (!participant) {
          peer.send(JSON.stringify({ error: 'Unauthorized websocket join' }))
          peer.close(1008)
          return
        }

        if (participant.sessionId !== event.sessionId) {
          peer.send(JSON.stringify({ error: 'Session mismatch for websocket join' }))
          return
        }

        db.update(participants)
          .set({ peerId: peer.id })
          .where(and(eq(participants.id, participant.participantId), eq(participants.sessionId, event.sessionId)))
          .run()

        peer.subscribe(event.sessionId)
        peer.publish(
          event.sessionId,
          JSON.stringify({
            event: 'join',
            nickname: participant.nickname,
            participantId: participant.participantId,
            peerId: peer.id,
            sessionId: participant.sessionId,
          }),
        )
      })
      .with({ action: 'requestStartRecording' }, (_event) => {
        if (!participant) {
          peer.send(JSON.stringify({ error: 'Participant not found' }))
          return
        }

        peer.publish(participant.sessionId, JSON.stringify({ event: 'startRecording' }))
        peer.send(JSON.stringify({ event: 'startRecording' }))
        db.update(sessions)
          .set({ status: SessionStatus.INPROGRESS })
          .where(eq(sessions.id, participant.sessionId))
          .run()
      })
      .with({ action: 'requestStopRecording' }, (_event) => {
        if (!participant) {
          peer.send(JSON.stringify({ error: 'Participant not found' }))
          return
        }

        peer.publish(participant.sessionId, JSON.stringify({ event: 'stopRecording' }))
        peer.send(JSON.stringify({ event: 'stopRecording' }))
      })
      .with({ action: 'closeSession' }, (_event) => {
        if (!participant) {
          peer.send(JSON.stringify({ error: 'Participant not found' }))
          return
        }

        combineTranscripts(participant)
        db.update(sessions).set({ status: SessionStatus.CLOSED }).where(eq(sessions.id, participant.sessionId)).run()

        peer.peers.forEach((p) => p.close(1000))
        peer.close(1000)
      })
      .with({ action: 'speaking' }, (event) => {
        // append speech to file
        if (!participant) {
          peer.send(JSON.stringify({ error: 'Participant not found' }))
          return
        }

        saveTranscript(participant, Date.now(), event.transcript)
        // This sends the recorded text back to the client for easier debugging
        peer.send(JSON.stringify({ recorded: event.transcript }))
      })
  },
  open: (peer) => {
    console.log('Peer connected', peer.id)
    console.log(`There are ${peer.peers.size} already in the room`)

    const newParticipant = getParticipantContext(peer)
    if (!newParticipant) {
      peer.send(JSON.stringify({ error: 'Missing participant context' }))
      return
    }

    peer.subscribe(newParticipant.sessionId)

    db.update(participants)
      .set({ peerId: peer.id })
      .where(
        and(eq(participants.id, newParticipant.participantId), eq(participants.sessionId, newParticipant.sessionId)),
      )
      .run()

    peer.peers.forEach((p) => {
      const participant = getParticipantContext(p)
      if (!participant) {
        peer.send(JSON.stringify({ error: 'Missing participant context' }))
        return
      }
      // Sends each connected peer to new participant
      peer.send(
        JSON.stringify({
          event: 'join',
          nickname: participant.nickname,
          participantId: participant.participantId,
          peerId: p.id,
          sessionId: participant.sessionId,
        }),
      )
    })

    // Announces new peer to channel
    peer.publish(
      newParticipant.sessionId,
      JSON.stringify({
        event: 'join',
        nickname: newParticipant.nickname,
        participantId: newParticipant.participantId,
        peerId: peer.id,
        sessionId: newParticipant.sessionId,
      }),
    )
  },
  upgrade: (request) => {
    const cookiesHeader = request.headers.get('Cookie')
    if (!cookiesHeader) {
      return
    }

    const parsedCookies = parse(cookiesHeader)
    const participantCookie = parsedCookies[PARTICIPANT_SESSION_COOKIE]
    if (!participantCookie) {
      return
    }

    const parsedParticipantCookie = parseParticipantSessionCookie(participantCookie)
    if (!parsedParticipantCookie.success) {
      return
    }

    const participant = db.query.participants
      .findFirst({
        where: (fields, { and, eq }) =>
          and(
            eq(fields.id, parsedParticipantCookie.data.participantId),
            eq(fields.sessionId, parsedParticipantCookie.data.sessionId),
          ),
      })
      .sync()

    if (!participant) {
      return
    }

    const session = db.query.sessions
      .findFirst({
        where: (fields, operators) =>
          operators.and(
            operators.eq(fields.id, participant.sessionId),
            operators.ne(fields.status, SessionStatus.CLOSED),
          ),
      })
      .sync()

    if (!session) {
      return
    }

    request.context.participant = {
      nickname: participant.participantName,
      participantId: participant.id,
      role: participant.role,
      sessionId: participant.sessionId,
    }
  },
})
