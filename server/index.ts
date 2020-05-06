import { IncomingMessage, Server } from 'http'
import express, { Request, Response } from 'express'

import CursorDB from './cursors-db'
import { Socket } from 'net'
import WebSocket from 'ws'
import cookieParser from 'cookie-parser'
import cursorsWSServer from './cursors.ws-server'
import devSession from './dev-session'
import jwt from 'jsonwebtoken'
import next from 'next'
import shareDBWSServer from './sharedb.ws-server'
import url from 'url'

const app = next({
  dev: process.env.NODE_ENV !== 'production'
})

const handle = app.getRequestHandler();

(async () => {
  try {
    await app.prepare()

    const expressApp = express()
    const server = new Server(expressApp)

    server.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
      const { pathname } = url.parse(req.url)

      if (pathname === '/rich-text') {
        shareDBWSServer.handleUpgrade(req, socket, head, (ws: WebSocket) => {
          shareDBWSServer.emit('connection', ws)
        })
      } else if (pathname === '/cursors') {
        cursorsWSServer.handleUpgrade(req, socket, head, (ws: WebSocket) => {
          cursorsWSServer.emit('connection', ws, req)
        })
      } else {
        socket.destroy()
      }
    })

    expressApp.use(cookieParser())

    expressApp.use((req, res, next) => {
      if (
        req.cookies.cursorToken === undefined ||
        (jwt.decode(req.cookies.cursorToken) as any).devSession !== devSession
      ) {
        const cursor = CursorDB.createNew()

        res.cookie(
          'cursorToken',
          jwt.sign({ id: cursor.id, devSession }, 'MaskaZan')
        );

        (req as any).cursorId = cursor.id
      } else {
        const jwtDecodeResult = jwt.decode(req.cookies.cursorToken)

        if (typeof jwtDecodeResult !== 'string') {
          const { id } = jwtDecodeResult;

          (req as any).cursorId = id;
          (req as any).db = CursorDB
        }
      }

      next()
    })

    expressApp.get('*', (req: Request, res: Response) => {
      return handle(req, res)
    })

    server.listen(3000, () => {
      console.log('> Ready on http://localhost:3000')
    })
  } catch (err) {
    console.error(err.stack)
    process.exit(1)
  }
})()