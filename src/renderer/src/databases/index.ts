import { Dexie, type EntityTable } from 'dexie'
import type { Book } from '@renderer/types'

export const db = new Dexie('ElectronHello') as Dexie & {
  books: EntityTable<Book, 'id'>
  settings: EntityTable<{ id: string; value: any }, 'id'>
}

db.version(1).stores({
  books: '&id, title, author, isbn, price, stock, category, publishDate, createdAt, updatedAt',
  settings: '&id, value'
})

export default db
