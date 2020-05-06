import { MutableRefObject, useEffect } from 'react'
import ShareDB, { Connection, Op } from 'sharedb/lib/client'

import Delta from 'quill-delta'
import QuillOp from 'quill-delta/dist/Op'
import ReactQuill from 'react-quill'
import ReconnectingWebSocket from 'reconnecting-websocket'
import RichText from 'rich-text'

(ShareDB as any).types.register(RichText.type)


export default (quillRef: MutableRefObject<ReactQuill>, collectionName: string, documentId: string) => {
  useEffect(() => {
    if (quillRef.current === null) return

    const quill = quillRef.current.getEditor()
    const socket = new ReconnectingWebSocket('ws://localhost:3000/rich-text')
    const connection = new Connection(socket as any)

    const doc = connection.get(collectionName, documentId)

    doc.on('error', (err) => console.log('doc err:', err))
    doc.on('*' as any, (err) => console.log('doc load:', err))

    doc.subscribe((err) => {
      if (err !== undefined) console.error(err)

      if (!doc.type) {
        doc.create([{
          insert: 'Works!!!\n'
        }], 'rich-text')
      }

      quill.setContents(doc.data)
      quill.on('text-change', (delta, oldDelta, source) => {
        if (source === 'user') {
          doc.submitOp(delta.ops as Op[], {
            source: true
          }, (err) => {
              if (err !== undefined) console.error(err)
          })
        }
      })
    })

    doc.on('op', (op, source) => {
      if (!source) {
        quill.updateContents(new Delta(op as QuillOp[]))
      }
    })

    return () => {
      doc.destroy()
      socket.close()
    }
  }, [quillRef.current, collectionName, documentId])
}