import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator'

import { Cursor } from '../lib/cursors'
import { EventEmitter } from 'events'
import { v4 as uuid } from 'uuid'

const generateName = () => uniqueNamesGenerator({
  dictionaries: [colors, adjectives, animals],
  separator: '-'
})

export class CursorsDB extends EventEmitter {
  private db: Cursor[] = []

  constructor() {
    super()
  }

  public get cursors() {
    console.log('db', this.db)
    return [...this.db]
  }

  public createNew(): Cursor {
    const id = uuid()
    const name = generateName()

    const cursor: Cursor = {
      id,
      name,
      online: true,
      index: 0,
      length: 0
    }

    
    this.db.push(cursor)
    console.log('create', cursor, this.db)
    this.emit('create', cursor)

    return cursor
  }

  private findCursor(id: string) {
    const cursor = this.db.find((cursor) => cursor.id = id)

    if (cursor === undefined) {
      throw new Error(`Cursor ${id} not found`)
    }

    return cursor
  }

  public updateCursor(id: string, index: number, length: number) {
    const cursor = this.findCursor(id)

    cursor.index = index
    cursor.length = length
    this.emit('update-cursor', id, index, length)

    return this
  }

  public setOnline(id: string) {
    const cursor = this.findCursor(id)

    cursor.online = true
    this.emit('online', id, true)

    return this
  }

  public setOffline(id: string) {
    const cursor = this.findCursor(id)

    cursor.online = false
    this.emit('online', id, false)

    return this
  }

  public updateName(id: string, name: string) {
    const cursor = this.findCursor(id)

    cursor.name = name
    this.emit('update-name', id, name)
    
    return this
  }
}

export default new CursorsDB()