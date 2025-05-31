import React, { useEffect, useState } from 'react';
import {
  Card, Col, Row, Button, Modal, Form, Input, InputNumber,
  message, Popconfirm, Pagination, Upload, Select, Tag, Spin
} from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const API_URL = 'https://quanlykhachsan-ozv3.onrender.com/api/Phong';

const getTrangThaiText = (value) => {
  switch (value) {
    case 1: return <Tag color="green">Trống</Tag>;
    case 2: return <Tag color="red">Đã đặt</Tag>;
    case 3: return <Tag color="orange">Bảo trì</Tag>;
    default: return <Tag>Mặc định</Tag>;
  }
};

const Phong = () => {
  const [phongs, setPhongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhong, setEditingPhong] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ page: 1, pageSize: 6, total: 0 });
  const [search, setSearch] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Lấy danh sách phòng (có phân trang, tìm kiếm)
  const fetchPhongs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/filter`, {
        params: {
          PageNumber: pagination.page,
          PageSize: pagination.pageSize,
          Search: search,
        },
      });
      setPhongs(res.data.items || []);
      setPagination(prev => ({ ...prev, total: res.data.totalRecords }));
    } catch (error) {
      message.error('Lỗi khi tải danh sách phòng!');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPhongs();
  }, [pagination.page, search]);

  // Mở modal thêm / xem / sửa phòng
  const openModal = async (phong = null) => {
    setModalLoading(true);
    setIsModalOpen(true);
    setImageFile(null);
    if (phong) {
      try {
        // Nếu cần fetch chi tiết, có thể làm axios.get tại đây
        form.setFieldsValue({
          ...phong,
          hide: phong.hide || false,
          dateBegin: phong.dateBegin ? phong.dateBegin.split('T')[0] : new Date().toISOString().slice(0, 10),
        });
        setEditingPhong(phong);
        setIsEdit(false);
      } catch (error) {
        message.error('Lỗi khi tải chi tiết phòng');
        setIsModalOpen(false);
      }
    } else {
      form.resetFields();
      form.setFieldsValue({
        hide: false,
        thuTuSapXep: 0,
        dateBegin: new Date().toISOString().slice(0, 10),
        idLoaiPhong: 1,
        trangThai: 1,
      });
      setEditingPhong(null);
      setIsEdit(true);
    }
    setModalLoading(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPhong(null);
    setIsEdit(false);
    setImageFile(null);
  };

  // Xoá phòng
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      message.success('Xoá thành công');
      fetchPhongs();
      closeModal();
    } catch {
      message.error('Lỗi khi xoá phòng');
    }
  };

  // Lưu phòng (thêm hoặc cập nhật)
  const handleSubmit = async (values) => {
    try {
      const dataToSend = {
        ...values,
        hide: values.hide || false,
        meta: values.meta || '',
        thuTuSapXep: values.thuTuSapXep || 0,
        dateBegin: values.dateBegin || new Date().toISOString(),
        idLoaiPhong: values.idLoaiPhong || 1,
      };

      let res;
      if (editingPhong) {
        res = await axios.put(`${API_URL}/${editingPhong.idPhong}`, {
          ...editingPhong,
          ...dataToSend,
        });
      } else {
        res = await axios.post(API_URL, dataToSend);
      }

      const phongId = editingPhong ? editingPhong.idPhong : res.data.idPhong;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await axios.post(`${API_URL}/${phongId}/upload-image`, formData);
      }

      message.success(editingPhong ? 'Cập nhật thành công' : 'Thêm thành công');
      fetchPhongs();
      closeModal();
    } catch (error) {
      console.error('Lỗi khi lưu phòng:', error.response?.data || error.message);
      message.error('Lỗi khi lưu phòng');
    }
  };

  // Click card xem chi tiết
  const handleCardClick = (phong) => {
    openModal(phong);
  };

  // Thêm phòng mới
  const handleAdd = () => {
    openModal(null);
  };

  return (
    <div style={{ padding: 0 }}>
      <Row justify="space-between" style={{ marginBottom: 30, gap: 16}}>
        <Col flex ="auto">
          <Input.Search
            size="large"
            placeholder="Tìm kiếm theo tên phòng..."
            onSearch={val => setSearch(val)}
            allowClear
            enterButton
          />
        </Col>
        <Col>
          <Button 
              type="primary" 
              size="large" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}>Thêm phòng
          </Button>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {phongs.map(phong => (
            <Col key={phong.idPhong} span={8}>
              <Card
                  hoverable
                  onClick={() => handleCardClick(phong)}
                  cover={
                    <div style={{ position: 'relative', overflow: 'hidden'}}>
                      <img
                        alt="Hình ảnh phòng"
                        src={phong.hinhAnh ? `https://quanlykhachsan-ozv3.onrender.com${phong.hinhAnh}` : ''}
                        style={{ height: 200, objectFit: 'cover', width: '100%'}}
                      />
                      <div style={{ position: 'absolute', top: 8, right: 8 }}>
                        {getTrangThaiText(phong.trangThai)}
                      </div>
                    </div>
                  }
                >
                  <h3 style={{ marginBottom: 8 }}>{phong.tenPhong}</h3>

                  <div style={{ marginTop: 8 }}>
                    {phong.giamGia > 0 ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#888', textDecoration: 'line-through' }}>
                          {phong.giaPhong?.toLocaleString() || 0} VND
                        </span>
                        <span style={{ color: '#cf1322', fontWeight: 'bold' }}>
                          {(phong.giaPhong - phong.giamGia)?.toLocaleString() || 0} VND
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontWeight: 'bold' }}>
                        {phong.giaPhong?.toLocaleString() || 0} VND
                      </span>
                    )}
                  </div>

                  <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    marginTop: 8,
                    textAlign: 'justify'
                  }}>
                    {phong.moTa}
                  </div>
                </Card>

            </Col>
          ))}
        </Row>
      </Spin>

      <Pagination
        current={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(page) => setPagination(prev => ({ ...prev, page }))}
        style={{ marginTop: 30, textAlign: 'center', display: 'flex', justifyContent: 'center' }}
      />

      <Modal
        title={editingPhong ? (isEdit ? 'Chỉnh sửa phòng' : 'Chi tiết phòng') : 'Thêm phòng'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width="60%"
      >
        <Spin spinning={modalLoading}>
          {!isEdit && editingPhong && (
            <Row gutter={24}>
              <Col span={10}>
                <img
                  src={editingPhong.hinhAnh ? `https://quanlykhachsan-ozv3.onrender.com${editingPhong.hinhAnh}` : ''}
                  alt="Ảnh phòng"
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    maxHeight: 300,
                    height: '100%',
                    objectFit: 'cover',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </Col>
              <Col span={14}>
                <h2 style={{ marginBottom: 16 }}>{editingPhong.tenPhong}</h2>

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <p><strong>Trạng thái:</strong> {getTrangThaiText(editingPhong.trangThai)}</p>
                  </Col>
                  <Col span={12}>
                    <p><strong>Diện tích:</strong> {editingPhong.dienTich} m²</p>
                  </Col>
                  <Col span={12}>
                    <p><strong>Giá phòng:</strong> {editingPhong.giaPhong?.toLocaleString() || 0} VND</p>
                  </Col>
                  <Col span={12}>
                    <p><strong>Giảm giá:</strong> {editingPhong.giaPhong ? ((editingPhong.giamGia / editingPhong.giaPhong) * 100).toFixed(0) : 0}%</p>
                  </Col>
                  <Col span={12}>
                    <p><strong>Số người tối đa:</strong> {editingPhong.soNguoi}</p>
                  </Col>
                  <Col span={24}>
                    <p><strong>Mô tả:</strong> {editingPhong.moTa}</p>
                  </Col>
                </Row>

                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button style={{marginRight: 10}} type="primary" onClick={() => setIsEdit(true)}>Chỉnh sửa</Button>

                  <Popconfirm
                    title="Bạn có chắc muốn xoá phòng này?"
                    onConfirm={() => handleDelete(editingPhong.idPhong)}
                    okText="Xoá"
                    cancelText="Huỷ"
                  >
                    <Button danger>Xoá phòng</Button>
                  </Popconfirm>
                </div>
              </Col>
            </Row>
          )}

          {(isEdit || !editingPhong) && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                hide: false,
                thuTuSapXep: 0,
                idLoaiPhong: 1,
                trangThai: 1,
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="tenPhong"
                    label="Tên phòng"
                    rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="idLoaiPhong"
                    label="Loại phòng"
                    rules={[{ required: true, message: 'Vui lòng chọn loại phòng' }]}
                  >
                    <Select>
                      <Select.Option value={1}>Phòng đơn</Select.Option>
                      <Select.Option value={2}>Phòng đôi</Select.Option>
                      <Select.Option value={3}>Phòng VIP</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="giaPhong"
                    label="Giá phòng (VND)"
                    rules={[{ required: true, message: 'Vui lòng nhập giá phòng' }]}
                  >
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>

                  <Form.Item
                    name="giamGia"
                    label="Giảm giá (VND)"
                    rules={[{ required: true, message: 'Vui lòng nhập giảm giá' }]}
                  >
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>

                  <Form.Item
                    name="dienTich"
                    label="Diện tích (m²)"
                    rules={[{ required: true, message: 'Vui lòng nhập diện tích' }]}
                  >
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="soNguoi"
                    label="Số người tối đa"
                    rules={[{ required: true, message: 'Vui lòng nhập số người tối đa' }]}
                  >
                    <InputNumber style={{ width: '100%' }} min={1} />
                  </Form.Item>

                  <Form.Item
                    name="trangThai"
                    label="Trạng thái"
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                  >
                    <Select>
                      <Select.Option value={1}>Trống</Select.Option>
                      <Select.Option value={2}>Đã đặt</Select.Option>
                      <Select.Option value={3}>Bảo trì</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="moTa"
                    label="Mô tả"
                  >
                    <Input.TextArea rows={5} />
                  </Form.Item>

                  <Form.Item
                    name="image"
                    label="Ảnh phòng"
                  >
                    <Upload
                      beforeUpload={file => {
                        setImageFile(file);
                        return false; // không tự động upload
                      }}
                      maxCount={1}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item style={{ textAlign: 'right' }}>
                <Button onClick={() => {
                  if (editingPhong) {
                    setIsEdit(false);
                    form.setFieldsValue(editingPhong);
                    setImageFile(null);
                  } else {
                    closeModal();
                  }
                }} style={{ marginRight: 8 }}>
                  Huỷ
                </Button>
                <Button type="primary" htmlType="submit">Lưu</Button>
              </Form.Item>
            </Form>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default Phong;
