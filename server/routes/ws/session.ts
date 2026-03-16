import { db } from '#server/utils/db'
import { sessions } from '#server/db/schema'

export default defineWebSocketHandler({
  close: (peer, _details) => {
    peer.publish('chat', { message: `${peer} left!`, user: 'server' })
  },
  error: (_peer, error) => {
    console.error('WebSocket error', error)
  },
  message: (peer, message) => {
    if (message.text().includes('ping')) {
      peer.send({ message: 'pong', user: 'server' })
    } else {
      const msg = {
        message: message.toString(),
        user: peer.toString(),
      }
      peer.send(msg) // echo
      peer.publish('chat', msg)
    }
  },
  open: (peer) => {
    console.log('opening')
    peer.send({ message: `Welcome ${peer}!`, user: 'server' })
    peer.publish('chat', { message: `${peer} joined!`, user: 'server' })
    peer.subscribe('chat')
    const ses = db.select().from(sessions).get()
    console.log(ses)
  },
})
