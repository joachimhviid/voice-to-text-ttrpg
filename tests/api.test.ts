import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import type { Session } from '../app/server/types'

describe('Session API Tests', async () => {
  await setup({
    server: true,
  })

  it('can create, retrieve, update, and delete a session', async () => {
    // 0. Check for existing test sessions and delete them
    const allSessions = await $fetch<Session[]>('/api/sessions')
    const existingTestSession = allSessions.find(
      (s) => s.title === 'Test Session' || s.title === 'Updated Session',
    )
    if (existingTestSession) {
      await $fetch(`/api/sessions/${existingTestSession.id}`, { method: 'DELETE' })
    }

    // 1. Create a new session
    const createResponse = await $fetch<{ id: number, title: string }>('/api/sessions', {
      body: {
        combatStats: 'Test Combat',
        content: 'Test Content',
        inventoryStats: 'Test Inventory',
        relations: 'Test Relations',
        summary: 'Test Summary',
        title: 'Test Session',
      },
      method: 'POST',
    })

    expect(createResponse).toBeDefined()
    expect(createResponse.title).toBe('Test Session')
    expect(createResponse.id).toBeDefined()

    const sessionId = createResponse.id

    // 2. Retrieve the created session
    const getResponse = await $fetch<Session>(`/api/sessions/${sessionId}`)

    expect(getResponse).toBeDefined()
    expect(getResponse.title).toBe('Test Session')
    expect(getResponse.content).toBe('Test Content')
    expect(getResponse.combatStats).toBe('Test Combat')
    expect(getResponse.inventoryStats).toBe('Test Inventory')
    expect(getResponse.relations).toBe('Test Relations')
    expect(getResponse.summary).toBe('Test Summary')

    // 3. Update the session
    const updateResponse = await $fetch<{ message: string }>(`/api/sessions/${sessionId}`, {
      body: {
        combatStats: 'Updated Combat',
        content: 'Updated Content',
        inventoryStats: 'Updated Inventory',
        relations: 'Updated Relations',
        summary: 'Updated Summary',
        title: 'Updated Session',
      },
      method: 'PUT',
    })

    expect(updateResponse.message).toBe('Session updated successfully')

    // 4. Verify the update
    const getUpdatedResponse = await $fetch<Session>(`/api/sessions/${sessionId}`)
    expect(getUpdatedResponse.title).toBe('Updated Session')
    expect(getUpdatedResponse.content).toBe('Updated Content')

    // 5. Cleanup the session after testing
    const deleteResponse = await $fetch<{ success: boolean }>(`/api/sessions/${sessionId}`, { method: 'DELETE' })
    expect(deleteResponse.success).toBe(true)
  })
})
