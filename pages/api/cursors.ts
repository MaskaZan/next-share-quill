import { IncomingMessage, OutgoingMessage } from 'http'

import { CursorsDB } from '../../server/cursors-db'
import express from 'express'

export default (req, res) => {
  const cursorId: string = (req as any).cursorId
  const db: CursorsDB = (req as any).db

  res.json(db.cursors)
}