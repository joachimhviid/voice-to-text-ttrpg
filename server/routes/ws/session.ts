export default defineWebSocketHandler({
  close: (peer, details) => {
    peer.publish('chat', { message: `${peer} left!`, user: 'server' })
  },
  error: (peer, error) => {},
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
    peer.send({ message: `Welcome ${peer}!`, user: 'server' })
    peer.publish('chat', { message: `${peer} joined!`, user: 'server' })
    peer.subscribe('chat')
  },
  upgrade: (request) => {},
})
