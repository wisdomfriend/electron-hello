export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  price: number
  stock: number
  category: string
  publishDate: string
  createdAt: number
  updatedAt: number
}

export interface BookFilter {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'createdAt' | 'price' | 'title'
  sortOrder?: 'asc' | 'desc'
}
