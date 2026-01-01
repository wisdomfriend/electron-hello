import React, { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Select, DatePicker, message } from 'antd'
import dayjs from 'dayjs'
import type { Book } from '@renderer/types'

const { Option } = Select

interface BookModalProps {
  visible: boolean
  book: Book | null
  onCancel: () => void
  onSave: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => void
}

const categories = ['文学', '科技', '历史', '艺术', '教育', '其他']

const BookModal: React.FC<BookModalProps> = ({ visible, book, onCancel, onSave }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible) {
      if (book) {
        form.setFieldsValue({
          ...book,
          publishDate: dayjs(book.publishDate)
        })
      } else {
        form.resetFields()
      }
    }
  }, [visible, book, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onSave({
        ...values,
        publishDate: values.publishDate.format('YYYY-MM-DD')
      })
      form.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <Modal
      title={book ? '编辑图书' : '新增图书'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="书名" rules={[{ required: true, message: '请输入书名' }]}>
          <Input placeholder="请输入书名" />
        </Form.Item>
        <Form.Item name="author" label="作者" rules={[{ required: true, message: '请输入作者' }]}>
          <Input placeholder="请输入作者" />
        </Form.Item>
        <Form.Item name="isbn" label="ISBN" rules={[{ required: true, message: '请输入ISBN' }]}>
          <Input placeholder="请输入ISBN" />
        </Form.Item>
        <Form.Item
          name="price"
          label="价格"
          rules={[
            { required: true, message: '请输入价格' },
            { type: 'number', min: 0 }
          ]}
        >
          <InputNumber placeholder="请输入价格" style={{ width: '100%' }} precision={2} />
        </Form.Item>
        <Form.Item
          name="stock"
          label="库存"
          rules={[
            { required: true, message: '请输入库存' },
            { type: 'number', min: 0 }
          ]}
        >
          <InputNumber placeholder="请输入库存" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
          <Select placeholder="请选择分类">
            {categories.map(cat => (
              <Option key={cat} value={cat}>
                {cat}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="publishDate"
          label="出版日期"
          rules={[{ required: true, message: '请选择出版日期' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default BookModal
