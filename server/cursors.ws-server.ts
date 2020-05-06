import { Cursor, CursorMessage, CursorMessageType, CursorNameMessage, CursorValueMessage } from '../lib/cursors'
import WebSocket, { Server } from 'ws'

import CursorsDB from './cursors-db'
import cookie from 'cookie'
import embedWSPingPong from './embed-ws-ping-pong'
import jwt from 'jsonwebtoken'

const wsServer = new Server({ noServer: true })
const connections = new Map<string, WebSocket>()

const sendToConnections = (targetId: string, data: { [key: string]: any }) => {
  connections.forEach((connection, id) =>
    targetId !== id && connection.send(JSON.stringify(data)))
}

embedWSPingPong(wsServer)

CursorsDB.on('create', (cursor: Cursor) => sendToConnections(cursor.id, {
  type: CursorMessageType.CREATE,
  ...cursor
}))

CursorsDB.on('update-cursor', (id: string, index: number, length: number) => sendToConnections(id, {
  type: CursorMessageType.UPDATE_VALUE,
  id, index, length
}))

CursorsDB.on('online', (id: string, online: boolean) => sendToConnections(id, {
  type: CursorMessageType.UPDATE_ONLINE,
  id, online
}))

CursorsDB.on('update-name', (id: string, name: string) => sendToConnections(id, {
  type: CursorMessageType.UPDATE_NAME,
  id, name
}))

wsServer.on('connection', (ws: WebSocket, req) => {
  const { cursorToken } = cookie.parse(req.headers.cookie)
  const jwtDecodeResult = jwt.decode(cursorToken)

  if (typeof jwtDecodeResult === 'string') {
    throw Error('JWT decode result error')
  }

  const { id } = jwtDecodeResult

  connections.set(id, ws)
  CursorsDB.setOnline(id)

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString('utf-8')) as CursorMessage
    const { id } = message

    switch (message.type) {
      case CursorMessageType.UPDATE_NAME:
        CursorsDB.updateName(id, (message as CursorNameMessage).name)
        break
      case CursorMessageType.UPDATE_VALUE:
        const { index, length } = message as CursorValueMessage
        CursorsDB.updateCursor(id, index, length)
        break
    }
  })

  ws.on('error', (err) => {
    ws.close()
    console.error(err)
  })

  ws.on('close', () => {
    connections.delete(id)
    CursorsDB.setOffline(id)
  })
})

export default wsServer