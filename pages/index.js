import 'ws'

import CursorsDB from '../server/cursors-db'
import Head from 'next/head'
import ReconnectingWebSocket from 'reconnecting-websocket'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'

const RichText = dynamic(import('../components/ShareDBRichText'), {
  ssr: false,
  loading: (arg) => {
    return null
  }
})

export default function Home({ cursorId, cursors }) {
  return (
    <div className="container">
      <h3>Cursor id: {cursorId}</h3>
      {RichText && <RichText
        collectionName='documents'
        documentId='shared-text'
        cursorId={cursorId}
        cursors={cursors}
      />}
    </div>
  )
}

export async function getServerSideProps(context) {
  const { cursorId, db } = context.req

  return {
    props: {
      cursorId,
      cursors: db.cursors.filter(cursor => cursor.id !== cursorId)
    }
  }
}
