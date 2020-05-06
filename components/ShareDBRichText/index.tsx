import ReactQuill, { ComponentProps } from 'react-quill'

import { Cursor } from '../../lib/cursors'
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import useCursors from '../../hooks/use-cursors'
import { useRef } from 'react'
import useShareDBRichText from '../../hooks/use-sharedb-rich-text'

Quill.register('modules/cursors', QuillCursors)

export interface ShareDBRichTextProps {
  collectionName: string,
  documentId: string,
  cursorId: string,
  cursors: Cursor[]
}

const ShareDBRichText = ({ collectionName, documentId, cursorId, cursors }: ShareDBRichTextProps) => {
  const ref = useRef<ReactQuill>(null)

  useShareDBRichText(ref, collectionName, documentId)
  useCursors(ref, cursorId, cursors)

  return (
    <ReactQuill
      ref={ref}
      modules={{ cursors: true }}
    />
  )
}

export default ShareDBRichText