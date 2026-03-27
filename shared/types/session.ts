import { z } from 'zod'

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
    action: z.literal('startRecording'),
    sessionId: z.string().min(1),
  }),
  z.object({
    action: z.literal('stopRecording'),
    sessionId: z.string().min(1),
  }),
  z.object({
    action: z.literal('closeSession'),
    sessionId: z.string().min(1),
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
    event: z.literal('setNickname'),
    nickname: z.string().min(1),
    participantId: z.number().int().positive(),
    userId: z.string().min(1),
  }),
])
