import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Book } from '@renderer/types'

interface BooksState {
  books: Book[]
  filter: {
    search?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: 'createdAt' | 'price' | 'title'
    sortOrder?: 'asc' | 'desc'
  }
}

const initialState: BooksState = {
  books: [],
  filter: {
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
}

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setBooks: (state, action: PayloadAction<Book[]>) => {
      state.books = action.payload
    },
    addBook: (state, action: PayloadAction<Book>) => {
      state.books.push(action.payload)
    },
    updateBook: (state, action: PayloadAction<Book>) => {
      const index = state.books.findIndex(book => book.id === action.payload.id)
      if (index !== -1) {
        state.books[index] = action.payload
      }
    },
    deleteBook: (state, action: PayloadAction<string>) => {
      state.books = state.books.filter(book => book.id !== action.payload)
    },
    setFilter: (state, action: PayloadAction<Partial<BooksState['filter']>>) => {
      state.filter = { ...state.filter, ...action.payload }
    },
    resetFilter: state => {
      state.filter = {
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
    }
  }
})

export const { setBooks, addBook, updateBook, deleteBook, setFilter, resetFilter } =
  booksSlice.actions
export default booksSlice.reducer
