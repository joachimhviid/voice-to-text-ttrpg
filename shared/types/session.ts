import { z } from 'zod'
import type { ParticipantRole } from '#server/db/schema'

export const sessionActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('join'),
    // role: z.enum(['host', 'participant']),
    sessionId: z.string().min(1),
  }),
  z.object({
    action: z.literal('setNickname'),
    nickname: z.string().min(1),
    sessionId: z.string().min(1),
  }),
  z.object({
    action: z.literal('requestStartRecording'),
  }),
  z.object({
    action: z.literal('requestStopRecording'),
  }),
  z.object({
    action: z.literal('closeSession'),
  }),
  z.object({
    action: z.literal('speaking'),
    transcript: z.string().min(1),
  }),
])

export const sessionEventSchema = z.discriminatedUnion('event', [
  z.object({
    event: z.literal('join'),
    // isUser: z.boolean(),
    nickname: z.string().min(1),
    participantId: z.number().int().positive(),
    peerId: z.string().min(1),
    sessionId: z.string().min(1),
  }),
  z.object({
    event: z.literal('startRecording'),
  }),
  z.object({
    event: z.literal('stopRecording'),
  }),
  z.object({
    event: z.literal('pauseRecording'),
  }),
])

export type Session = {
  combatStats?: string
  content?: string
  id: number
  inventoryStats?: string
  relations?: string
  summary?: string
  title: string
}

export type PeerParticipantContext = {
  nickname: string
  participantId: number
  role: ParticipantRole
  sessionId: string
}
