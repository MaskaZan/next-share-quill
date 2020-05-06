import WebSocket, { Server } from 'ws'

interface PingPongWebSocket extends WebSocket {
  isAlive?: boolean
}

export default (wsServer: Server) => {
  wsServer.on('connection', (ws: PingPongWebSocket) => {
    ws.isAlive = true

    ws.on('pong', () => {
      ws.isAlive = true
    })
  })

  setInterval(() => {
    wsServer.clients.forEach((ws: PingPongWebSocket) => {
      if (!ws.isAlive) return ws.terminate()

      ws.isAlive = false
      ws.ping();
    })
  }, 10000)
}