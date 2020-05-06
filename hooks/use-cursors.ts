import {
  Cursor,
  CursorCreateMessage,
  CursorMessage,
  CursorMessageType,
  CursorNameMessage,
  CursorOnlineMessage,
  CursorValueMessage
} from '../lib/cursors'
import { MutableRefObject, useEffect } from 'react'

import QuillCursors from 'quill-cursors'
import { RangeStatic } from 'quill'
import ReactQuill from 'react-quill'
import ReconnectingWebSocket from 'reconnecting-websocket'

const generateColor = (): string => {
  const symbols = '0123456789ABCDEF'
  let result = '#'

  for (let i = 0; i < 6; i += 1) {
    result += symbols[Math.floor(Math.random() * 16)]
  }

  return result
} 

export default (quillRef: MutableRefObject<ReactQuill>, cursorId: string, initCursors: Cursor[]) => {
  useEffect(() => {
    if (quillRef.current === null) return

    const quill = quillRef.current.getEditor()
    const cursors: QuillCursors = quill.getModule('cursors')
    const socket = new ReconnectingWebSocket('ws://localhost:3000/cursors')
    const buffer = new Map<string, Cursor>()

    quill.on('selection-change', (range: RangeStatic) => {
      socket.send(JSON.stringify({
        type: CursorMessageType.UPDATE_VALUE,
        id: cursorId,
        ...range
      }))
    })

    console.log(initCursors)

    initCursors.forEach((cursor) => {
      const { id, index, length, name, online } = cursor
      const color = generateColor()

      cursors.removeCursor(id)
      cursors.createCursor(id, name, color)
      cursors.moveCursor(id, { index, length })
      buffer.set(id, {
        id, index, length, name, online
      })
    })

    socket.onmessage = ({ data }) => {
      const message: CursorMessage = JSON.parse(data)

      switch (message.type) {
        case CursorMessageType.CREATE:
          {
            const { id, index, length, name, online } = message as CursorCreateMessage
            cursors.createCursor(id, name, generateColor())
            cursors.moveCursor(id, { index, length })
            buffer.set(id, {
              id, index, length, name, online
            })
          }
          break

        case CursorMessageType.UPDATE_NAME:
          {
            const { id, name } = message as CursorNameMessage
            const { range: { index, length }, color } = cursors.cursors().find(cursor => cursor.id === id)
            cursors.removeCursor(id)
            cursors.createCursor(id, name, color)
            cursors.moveCursor(id, { index, length })
            buffer.set(id, {
              ...buffer.get(id),
              name
            })
          }
          break

        case CursorMessageType.UPDATE_ONLINE:
          {
            const { id, online } = message as CursorOnlineMessage
            if (online) {
              const { name, index, length } = buffer.get(id)
              cursors.createCursor(id, name, generateColor())
              cursors.moveCursor(id, { index, length })
            } else {
              cursors.removeCursor(id)
            }
            buffer.set(id, {
              ...buffer.get(id),
              name
            })
          }
          break

        case CursorMessageType.UPDATE_VALUE:
          {
            const { id, index, length } = message as CursorValueMessage
            cursors.moveCursor(id, { index, length })
            buffer.set(id, {
              ...buffer.get(id),
              index,
              length
            })
          }
          break
        
      }
    }

    return () => {
      socket.close()
    }
  }, [quillRef, cursorId, initCursors])
}