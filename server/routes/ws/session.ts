import { db } from '#server/db'
// import type { Peer } from 'crossws'
import { sessionActionSchema } from '#shared/types/session'
import { match } from 'ts-pattern'

// const rooms = new Map<string, Set<Peer>>()

export default defineWebSocketHandler({
  close: (peer, _details) => {
    // peer.websocket.
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

    // if (!rooms.has(result.data.sessionId)) {
    //   rooms.set(result.data.sessionId, new Set())
    // }

    // const room = rooms.get(result.data.sessionId)!

    match(result.data)
      .with({ action: 'join' }, (event) => {
        // room.add(peer)
        peer.subscribe(event.sessionId)
        peer.publish(event.sessionId, JSON.stringify({ event: 'join', userId: peer.id }))
      })
      .with({ action: 'setNickname' }, (event) => {
        peer.publish(
          event.sessionId,
          JSON.stringify({ event: 'setNickname', nickname: event.nickname, userId: peer.id }),
        )
      })
      .with({ action: 'startRecording' }, (event) => {})
      .with({ action: 'stopRecording' }, (event) => {})
      .with({ action: 'closeSession' }, (event) => {
        peer.close(1000)
        // for (const client of room) {
        //   client.send({ action: 'sessionClosed' })
        // }
        // rooms.delete(event.sessionId)
      })
  },
  open: (peer) => {
    console.log('Peer connected', peer.id)
  },
})
