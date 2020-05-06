import WebSocket, { Server } from 'ws'

import WebSocketJSONStream from 'websocket-json-stream'
import embedWSPingPong from './embed-ws-ping-pong'
import shareDBServer from './sharedb.server'

const wsServer = new Server({ noServer: true })

embedWSPingPong(wsServer)

wsServer.on('connection', (ws: WebSocket) => {
  const stream = new WebSocketJSONStream(ws)

  shareDBServer.listen(stream)

  ws.on('error', (err) => {
    console.error(err)
  })
})

export default wsServer
