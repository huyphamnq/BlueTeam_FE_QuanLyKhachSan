import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Pagination,
  Input,
  Typography,
  Button,
  Modal,
  Form,
  Switch,
  message,
  DatePicker,
  Popconfirm,
  Space,
  Tooltip,
  InputNumber,
  Card,
  Row,
  Col,
  Tag,
  Avatar,
  Divider,
  Badge,
  Skeleton,
  Empty,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  CalendarOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;
const PAGE_SIZE = 10;

export default function NhanVienManagement() {
  const [data, setData] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchData = async (page) => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://quanlykhachsan-ozv3.onrender.com/api/NhanVien",
        {
          params: { PageNumber: page, PageSize: PAGE_SIZE },
        }
      );
      const items = res.data.items;
      setData(items);
      if (items.length < PAGE_SIZE) {
        setTotal((page - 1) * PAGE_SIZE + items.length);
      } else {
        setTotal(page * PAGE_SIZE + 1);
      }
    } catch (error) {
      message.error("Lấy dữ liệu thất bại");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(pageNumber);
  }, [pageNumber]);

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter((item) =>
      item.hoTen.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  const onSearch = (value) => {
    setSearchText(value.trim());
  };

  const onAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      hide: true,
      sapXep: 0,
      dateBegin: dayjs(),
    });
    setModalOpen(true);
  };

  const onEdit = async (id) => {
    setPosting(true);
    try {
      const res = await axios.get(
        `https://quanlykhachsan-ozv3.onrender.com/api/NhanVien/${id}`
      );
      setEditingId(id);
      form.setFieldsValue({
        ...res.data,
        dateBegin: dayjs(res.data.dateBegin),
      });
      setModalOpen(true);
    } catch (error) {
      message.error("Lấy dữ liệu nhân viên thất bại");
    }
    setPosting(false);
  };

  const onFinish = async (values) => {
    setPosting(true);
    const payload = {
      ...values,
      hide: values.hide || false,
      sapXep: values.sapXep || 0,
      dateBegin: values.dateBegin
        ? values.dateBegin.toISOString()
        : new Date().toISOString(),
    };
    try {
      if (editingId) {
        await axios.put(
          `https://quanlykhachsan-ozv3.onrender.com/api/NhanVien/${editingId}`,
          payload
        );
        message.success("Cập nhật thành công");
      } else {
        await axios.post(
          "https://quanlykhachsan-ozv3.onrender.com/api/NhanVien",
          payload
        );
        message.success("Thêm nhân viên thành công");
      }
      setModalOpen(false);
      form.resetFields();
      fetchData(pageNumber);
    } catch (error) {
      message.error("Lưu thất bại");
    }
    setPosting(false);
  };

  const onDelete = async (id) => {
    try {
      await axios.delete(
        `https://quanlykhachsan-ozv3.onrender.com/api/NhanVien/${id}`
      );
      message.success("Xóa thành công");
      if (data.length === 1 && pageNumber > 1) {
        setPageNumber(pageNumber - 1);
      } else {
        fetchData(pageNumber);
      }
    } catch (error) {
      message.error("Xóa thất bại");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "idNhanVien",
      key: "idNhanVien",
      width: 80,
      sorter: (a, b) => a.idNhanVien - b.idNhanVien,
      align: "center",
      render: (id) => (
        <Badge 
          count={id} 
          style={{ 
            backgroundColor: '#f0f0f0', 
            color: '#666',
            border: '1px solid #d9d9d9',
            fontSize: '12px'
          }} 
        />
      ),
    },
    {
      title: "Thông tin nhân viên",
      key: "staffInfo",
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: '#1890ff',
              flexShrink: 0
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ 
              fontWeight: 600, 
              fontSize: '14px',
              marginBottom: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {record.hoTen}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Text type="secondary" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <PhoneOutlined style={{ fontSize: '10px' }} />
                {record.sdt}
              </Text>
              <Text type="secondary" style={{ 
                fontSize: '12px', 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <MailOutlined style={{ fontSize: '10px' }} />
                {record.email}
              </Text>
            </div>
          </div>
        </div>
      ),
      width: 280,
      ellipsis: true,
    },
    {
      title: "Địa chỉ",
      dataIndex: "diaChi",
      key: "diaChi",
      responsive: ["lg"],
      ellipsis: true,
      width: 200,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "dateBegin",
      key: "dateBegin",
      render: (date) => (
        <div style={{ textAlign: 'center' }}>
          <CalendarOutlined style={{ marginRight: 6, color: '#1890ff' }} />
          <Text>{dayjs(date).format("DD/MM/YYYY")}</Text>
        </div>
      ),
      sorter: (a, b) => new Date(a.dateBegin) - new Date(b.dateBegin),
      responsive: ["md"],
      align: "center",
      width: 140,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record.idNhanVien)}
              style={{ 
                color: '#1890ff',
                border: '1px solid transparent',
                borderRadius: '6px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f0f9ff';
                e.target.style.borderColor = '#1890ff';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'transparent';
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa nhân viên này?"
              onConfirm={() => onDelete(record.idNhanVien)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                danger
                style={{ 
                  border: '1px solid transparent',
                  borderRadius: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#fff2f0';
                  e.target.style.borderColor = '#ff4d4f';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'transparent';
                }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Control Panel */}
      <Card
        style={{
          marginTop: 30,
          marginBottom: 24,
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={16} md={18}>
            <Search
              placeholder="Tìm kiếm theo tên nhân viên..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={onSearch}
              style={{
                borderRadius: '8px',
              }}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onAdd}
              size="large"
              block
              style={{
                height: '40px',
                borderRadius: '8px',
                fontWeight: 600,
                background: '#1677ff',
                border: 'none',
                boxShadow: '0 2px 6px rgba(82, 196, 26, 0.3)'
              }}
            >
              Thêm nhân viên
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table Section */}
      <Card
        style={{
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}
        bodyStyle={{ padding: 0 }}
      >
        {loading ? (
          <div style={{ padding: '24px' }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        ) : filteredData.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có dữ liệu nhân viên"
            style={{ padding: '60px 24px' }}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              Thêm nhân viên đầu tiên
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="idNhanVien"
            loading={loading}
            pagination={false}
            size="middle"
            style={{ borderRadius: '12px' }}
            rowClassName={(record, index) => 
              index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
            }
            scroll={{ x: 800 }}
          />
        )}

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #f0f0f0',
              background: '#fafafa',
              borderRadius: '0 0 12px 12px'
            }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Text type="secondary">
                  Hiển thị {((pageNumber - 1) * PAGE_SIZE) + 1} - {Math.min(pageNumber * PAGE_SIZE, total)} 
                  {' '}trong tổng số {total} nhân viên
                </Text>
              </Col>
              <Col>
                <Pagination
                  current={pageNumber}
                  pageSize={PAGE_SIZE}
                  total={total}
                  onChange={setPageNumber}
                  showSizeChanger={false}
                  showQuickJumper
                  size="default"
                />
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* Modal Form */}
      <Modal
        title={
          <div style={{ 
            textAlign: 'center', 
            paddingBottom: '16px',
            borderBottom: '1px solid #f0f0f0',
            marginBottom: '24px'
          }}>
            <TeamOutlined style={{ 
              fontSize: '24px', 
              color: '#1890ff', 
              marginRight: '8px' 
            }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>
              {editingId ? "Chỉnh sửa thông tin nhân viên" : "Thêm nhân viên mới"}
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ hide: true, sapXep: 0, dateBegin: dayjs() }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={
                  <span>
                    <UserOutlined style={{ marginRight: 6 }} />
                    Họ và tên
                  </span>
                }
                name="hoTen"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input 
                  placeholder="Nhập họ và tên nhân viên" 
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>
                    <PhoneOutlined style={{ marginRight: 6 }} />
                    Số điện thoại
                  </span>
                }
                name="sdt"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" }
                ]}
              >
                <Input 
                  placeholder="Nhập số điện thoại" 
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>
                    <IdcardOutlined style={{ marginRight: 6 }} />
                    Địa chỉ
                  </span>
                }
                name="diaChi"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ" }
                ]}
              >
                <Input 
                  placeholder="Nhập địa chỉ"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={
                  <span>
                    <MailOutlined style={{ marginRight: 6 }} />
                    Email
                  </span>
                }
                name="email"
                rules={[
                  { type: "email", message: "Email không hợp lệ" },
                  { required: true, message: "Vui lòng nhập email" },
                ]}
              >
                <Input 
                  placeholder="Nhập địa chỉ email" 
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Mật khẩu"
                name="matKhau"
                rules={[{ required: !editingId, message: "Vui lòng nhập mật khẩu" }]}
                hasFeedback
              >
                <Input.Password 
                  placeholder="Nhập mật khẩu" 
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>
                    <CalendarOutlined style={{ marginRight: 6 }} />
                    Ngày bắt đầu
                  </span>
                }
                name="dateBegin"
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
              >
                <DatePicker
                  style={{ width: "100%", borderRadius: '8px' }}
                  size="large"
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current > dayjs().endOf("day")}
                  placeholder="Chọn ngày bắt đầu"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Chức vụ"
                name="idChucVu"
                rules={[{ required: true, message: "Vui lòng chọn chức vụ" }]}
              >
                <Select
                  placeholder="Chọn chức vụ"
                  size="large"
                  style={{ width: '100%', borderRadius: '8px' }}
                >
                  <Select.Option value={1}>Quản lý</Select.Option>
                  <Select.Option value={2}>Nhân viên</Select.Option>
                  <Select.Option value={3}>Lễ tân</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '24px 0' }} />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space size="middle">
              <Button
                size="large"
                onClick={() => setModalOpen(false)}
                disabled={posting}
                style={{ 
                  borderRadius: '8px',
                  minWidth: '100px'
                }}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={posting}
                size="large"
                style={{ 
                  borderRadius: '8px',
                  minWidth: '120px',
                  background: editingId ? '#52c41a' : '#1890ff',
                  borderColor: editingId ? '#52c41a' : '#1890ff'
                }}
              >
                {editingId ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        .table-row-light {
          background-color: #ffffff;
        }
        .table-row-dark {
          background-color: #fafafa;
        }
        .table-row-light:hover,
        .table-row-dark:hover {
          background-color: #e6f7ff !important;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border: none;
          font-weight: 600;
          color: #495057;
          font-size: 13px;
          padding: 16px 12px;
        }
        .ant-table-tbody > tr > td {
          border: none;
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
        }
        .ant-pagination .ant-pagination-item {
          border-radius: 6px;
          border: 1px solid #d9d9d9;
        }
        .ant-pagination .ant-pagination-item-active {
          background: #1890ff;
          border-color: #1890ff;
        }
        .ant-pagination .ant-pagination-item-active a {
          color: white;
        }
      `}</style>
    </div>
  );
}