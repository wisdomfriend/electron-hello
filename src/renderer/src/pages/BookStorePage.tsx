import React, { useEffect, useState, useMemo } from 'react'
import { Table, Button, Input, Select, Space, Modal, Form, message, Popconfirm, Card } from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useAppDispatch, useAppSelector } from '@renderer/store'
import {
  setBooks,
  addBook,
  updateBook,
  deleteBook,
  setFilter,
  resetFilter
} from '@renderer/store/books'
import { useTheme } from '@renderer/context/ThemeProvider'
import db from '@renderer/databases'
import type { Book } from '@renderer/types'
import styled from 'styled-components'
import BookModal from './components/BookModal'
import BackupModal from './components/BackupModal'

const { Search } = Input
const { Option } = Select

const PageContainer = styled.div`
  padding: 24px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Header = styled.div`
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const FilterCard = styled(Card)`
  margin-bottom: 16px;
`

const TableContainer = styled.div`
  flex: 1;
  overflow: auto;
`

const categories = ['文学', '科技', '历史', '艺术', '教育', '其他']

const BookStorePage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { theme, toggleTheme } = useTheme()
  const { books, filter } = useAppSelector(state => state.books)
  const [loading, setLoading] = useState(false)
  const [bookModalVisible, setBookModalVisible] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [backupModalVisible, setBackupModalVisible] = useState(false)

  // 从数据库加载图书
  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    setLoading(true)
    try {
      const allBooks = await db.books.toArray()
      dispatch(setBooks(allBooks))
    } catch (error) {
      message.error('加载图书失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // 保存图书到数据库
  const saveBookToDB = async (book: Book) => {
    try {
      if (await db.books.get(book.id)) {
        await db.books.update(book.id, book)
      } else {
        await db.books.add(book)
      }
    } catch (error) {
      console.error('Save book to DB failed:', error)
      throw error
    }
  }

  // 删除图书
  const handleDelete = async (id: string) => {
    try {
      await db.books.delete(id)
      dispatch(deleteBook(id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
      console.error(error)
    }
  }

  // 处理新增/编辑
  const handleSave = async (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = Date.now()
      if (editingBook) {
        // 更新
        const updatedBook: Book = {
          ...editingBook,
          ...bookData,
          updatedAt: now
        }
        await saveBookToDB(updatedBook)
        dispatch(updateBook(updatedBook))
        message.success('更新成功')
      } else {
        // 新增
        const newBook: Book = {
          ...bookData,
          id: `book_${now}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now
        }
        await saveBookToDB(newBook)
        dispatch(addBook(newBook))
        message.success('添加成功')
      }
      setBookModalVisible(false)
      setEditingBook(null)
    } catch (error) {
      message.error('保存失败')
      console.error(error)
    }
  }

  // 打开编辑模态框
  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setBookModalVisible(true)
  }

  // 打开新增模态框
  const handleAdd = () => {
    setEditingBook(null)
    setBookModalVisible(true)
  }

  // 筛选和排序后的图书列表
  const filteredBooks = useMemo(() => {
    let result = [...books]

    // 搜索
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      result = result.filter(
        book =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower) ||
          book.isbn.toLowerCase().includes(searchLower)
      )
    }

    // 分类筛选
    if (filter.category) {
      result = result.filter(book => book.category === filter.category)
    }

    // 价格筛选
    if (filter.minPrice !== undefined) {
      result = result.filter(book => book.price >= filter.minPrice!)
    }
    if (filter.maxPrice !== undefined) {
      result = result.filter(book => book.price <= filter.maxPrice!)
    }

    // 排序
    if (filter.sortBy) {
      result.sort((a, b) => {
        let aValue: any = a[filter.sortBy!]
        let bValue: any = b[filter.sortBy!]

        if (filter.sortBy === 'createdAt' || filter.sortBy === 'updatedAt') {
          aValue = new Date(aValue).getTime()
          bValue = new Date(bValue).getTime()
        }

        if (filter.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    return result
  }, [books, filter])

  // 表格列定义
  const columns: ColumnsType<Book> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: text => text.substring(0, 8) + '...'
    },
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
      sorter: true
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author'
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn'
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      sorter: true,
      render: price => `¥${price.toFixed(2)}`
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      sorter: true
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      filters: categories.map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.category === value
    },
    {
      title: '出版日期',
      dataIndex: 'publishDate',
      key: 'publishDate',
      sorter: true,
      render: date => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <PageContainer>
      <Header>
        <h1 style={{ margin: 0 }}>图书商店 - React</h1>
        <Space>
          <Button icon={<CloudUploadOutlined />} onClick={() => setBackupModalVisible(true)}>
            备份
          </Button>
          <Button icon={<CloudDownloadOutlined />} onClick={() => setBackupModalVisible(true)}>
            恢复
          </Button>
          <Button onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</Button>
        </Space>
      </Header>

      <FilterCard>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <Search
              placeholder="搜索书名、作者、ISBN"
              allowClear
              style={{ width: 300 }}
              value={filter.search}
              onChange={e => dispatch(setFilter({ search: e.target.value }))}
              onSearch={value => dispatch(setFilter({ search: value }))}
            />
            <Select
              placeholder="选择分类"
              allowClear
              style={{ width: 150 }}
              value={filter.category}
              onChange={value => dispatch(setFilter({ category: value }))}
            >
              {categories.map(cat => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
            <Input
              type="number"
              placeholder="最低价格"
              style={{ width: 120 }}
              value={filter.minPrice}
              onChange={e =>
                dispatch(
                  setFilter({ minPrice: e.target.value ? Number(e.target.value) : undefined })
                )
              }
            />
            <Input
              type="number"
              placeholder="最高价格"
              style={{ width: 120 }}
              value={filter.maxPrice}
              onChange={e =>
                dispatch(
                  setFilter({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
                )
              }
            />
            <Select
              placeholder="创建时间"
              style={{ width: 120 }}
              value={filter.sortBy}
              onChange={value => dispatch(setFilter({ sortBy: value }))}
            >
              <Option value="createdAt">创建时间</Option>
              <Option value="price">价格</Option>
              <Option value="title">书名</Option>
            </Select>
            <Select
              placeholder="排序"
              style={{ width: 100 }}
              value={filter.sortOrder}
              onChange={value => dispatch(setFilter({ sortOrder: value }))}
            >
              <Option value="asc">升序</Option>
              <Option value="desc">降序</Option>
            </Select>
            <Button icon={<SearchOutlined />} onClick={loadBooks}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => dispatch(resetFilter())}>
              重置
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增图书
            </Button>
          </Space>
        </Space>
      </FilterCard>

      <TableContainer>
        <Table
          columns={columns}
          dataSource={filteredBooks}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ y: 'calc(100vh - 350px)' }}
        />
      </TableContainer>

      <BookModal
        visible={bookModalVisible}
        book={editingBook}
        onCancel={() => {
          setBookModalVisible(false)
          setEditingBook(null)
        }}
        onSave={handleSave}
      />

      <BackupModal
        visible={backupModalVisible}
        onCancel={() => setBackupModalVisible(false)}
        onBackup={loadBooks}
      />
    </PageContainer>
  )
}

export default BookStorePage
