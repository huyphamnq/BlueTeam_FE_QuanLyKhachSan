import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Pagination,
  Input,
  Typography,
  Button,
  Modal,
  Form,
  message,
  DatePicker,
  Popconfirm,
  Space,
  Tooltip,
  Card,
  Row,
  Col,
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
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

import "../assets/css/base.css";

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
  const [detailModal, setDetailModal] = useState({ open: false, record: null });

  // const role = localStorage.getItem("role");

  const fetchData = async (page) => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://quanlykhachsan-ozv3.onrender.com/api/NhanVien",
        { params: { PageNumber: page, PageSize: PAGE_SIZE } }
      );
      const items = res.data.items;
      setData(items);
      if (items.length < PAGE_SIZE) {
        setTotal((page - 1) * PAGE_SIZE + items.length);
      } else {
        setTotal(page * PAGE_SIZE + 1);
      }
    } catch {
      message.error("Lấy dữ liệu thất bại");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!searchText) fetchData(pageNumber);
    // eslint-disable-next-line
  }, [pageNumber]);

  const filteredData = useMemo(() => data, [data]);

  const searchNhanVien = async (keyword) => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://quanlykhachsan-ozv3.onrender.com/api/NhanVien/search",
        { params: { keyword } }
      );
      setData(res.data);
      setTotal(res.data.length);
      setPageNumber(1);
    } catch {
      message.error("Tìm kiếm thất bại");
    }
    setLoading(false);
  };

  const onSearch = (value) => {
    const keyword = value.trim();
    setSearchText(keyword);
    if (keyword) {
      searchNhanVien(keyword);
    } else {
      fetchData(1);
    }
  };

  const onRefresh = () => {
    fetchData(pageNumber);
    message.success("Đã làm mới dữ liệu");
  };

  const onAdd = () => {
    // if (role !== "admin123") {
    //   message.warning("Bạn không có quyền thực hiện chức năng này!");
    //   return;
    // }
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
    // if (role !== "admin123") {
    //   message.warning("Bạn không có quyền thực hiện chức năng này!");
    //   return;
    // }
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
    } catch {
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
    } catch {
      message.error("Lưu thất bại");
    }
    setPosting(false);
  };

  const onDelete = async (id) => {
    // if (role !== "admin123") {
    //   message.warning("Bạn không có quyền thực hiện chức năng này!");
    //   return;
    // }
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
    } catch {
      message.error("Xóa thất bại");
    }
  };

  const onShowDetail = (record) => setDetailModal({ open: true, record });

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
            backgroundColor: "#f0f0f0",
            color: "#666",
            border: "1px solid #d9d9d9",
            fontSize: "12px",
          }}
        />
      ),
    },
    {
      title: "Thông tin nhân viên",
      key: "staffInfo",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{
              backgroundColor: "#1890ff",
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: "14px",
                marginBottom: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {record.hoTen}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Text
                type="secondary"
                style={{
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <PhoneOutlined style={{ fontSize: "10px" }} />
                {record.sdt}
              </Text>
              <Text
                type="secondary"
                style={{
                  fontSize: "12px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <MailOutlined style={{ fontSize: "10px" }} />
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
      title: "Chức vụ",
      dataIndex: "idChucVu",
      key: "idChucVu",
      align: "center",
      width: 120,
      render: (id) => {
        if (id === 1) return <span style={{ color: "#d4380d" }}>Quản lý</span>;
        if (id === 2)
          return <span style={{ color: "#1890ff" }}>Nhân viên</span>;
        if (id === 3) return <span style={{ color: "#52c41a" }}>Lễ tân</span>;
        return "";
      },
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "dateBegin",
      key: "dateBegin",
      render: (date) => (
        <div style={{ textAlign: "center" }}>
          <CalendarOutlined style={{ marginRight: 6, color: "#1890ff" }} />
          <Text>{dayjs(date).format("DD/MM/YYYY")}</Text>
        </div>
      ),
      sorter: (a, b) => new Date(a.dateBegin) - new Date(b.dateBegin),
      responsive: ["md"],
      align: "center",
      width: 140,
    },
    {
      title: "Chi tiết",
      key: "detail",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            icon={<InfoCircleOutlined />}
            type="text"
            onClick={() => onShowDetail(record)}
          />
        </Tooltip>
      ),
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
                color: "#1890ff",
                border: "1px solid transparent",
                borderRadius: "6px",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f0f9ff";
                e.target.style.borderColor = "#1890ff";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.borderColor = "transparent";
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
                  border: "1px solid transparent",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#fff2f0";
                  e.target.style.borderColor = "#ff4d4f";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.borderColor = "transparent";
                }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", padding: "24px" }}>
      <Typography.Title
        level={2}
        style={{
          marginBottom: 0,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        Quản lý nhân viên
      </Typography.Title>
      <Card
        style={{
          marginTop: 30,
          marginBottom: 24,
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
        bodyStyle={{ padding: "0" }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={12}>
            <Search
              placeholder="Tìm theo kiếm tên... "
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={onSearch}
              style={{
                borderRadius: "8px",
              }}
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              block
              size="large"
              style={{
                borderRadius: "8px",
                fontWeight: 600,
                background: "#f5f5f5",
                border: "none",
              }}
            >
              Làm mới
            </Button>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Button
              icon={<PlusOutlined />}
              onClick={onAdd}
              size="large"
              block
              style={{
                height: "40px",
                borderRadius: "8px",
                fontWeight: 600,
                background: "#1677ff",
                color: "#fff",
                border: "none",
                boxShadow: "0 2px 6px rgba(82, 196, 26, 0.3)",
              }}
            >
              Thêm nhân viên
            </Button>
          </Col>
        </Row>
      </Card>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
        bodyStyle={{ padding: 0 }}
      >
        {loading ? (
          <div style={{ padding: "24px" }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        ) : filteredData.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có dữ liệu nhân viên"
            style={{ padding: "60px 24px" }}
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
            style={{ borderRadius: "12px" }}
            rowClassName={(record, index) =>
              index % 2 === 0 ? "table-row-light" : "table-row-dark"
            }
            scroll={{ x: 800 }}
          />
        )}
        {filteredData.length > 0 && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #f0f0f0",
              background: "#fafafa",
              borderRadius: "0 0 12px 12px",
            }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Text type="secondary">
                  Hiển thị {(pageNumber - 1) * PAGE_SIZE + 1} -{" "}
                  {Math.min(pageNumber * PAGE_SIZE, total)} trong tổng số{" "}
                  {total} nhân viên
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
      <Modal
        title={
          <div
            style={{
              textAlign: "center",
              paddingBottom: "16px",
              borderBottom: "1px solid #f0f0f0",
              marginBottom: "24px",
            }}
          >
            <TeamOutlined
              style={{
                fontSize: "24px",
                color: "#1890ff",
                marginRight: "8px",
              }}
            />
            <span style={{ fontSize: "18px", fontWeight: 600 }}>
              {editingId
                ? "Chỉnh sửa thông tin nhân viên"
                : "Thêm nhân viên mới"}
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
                  style={{ borderRadius: "8px" }}
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
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số điện thoại"
                  size="large"
                  style={{ borderRadius: "8px" }}
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
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input
                  placeholder="Nhập địa chỉ"
                  size="large"
                  style={{ borderRadius: "8px" }}
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
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Mật khẩu"
                name="matKhau"
                rules={[
                  { required: !editingId, message: "Vui lòng nhập mật khẩu" },
                ]}
                hasFeedback
              >
                <Input.Password
                  placeholder="Nhập mật khẩu"
                  size="large"
                  style={{ borderRadius: "8px" }}
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
                  style={{ width: "100%", borderRadius: "8px" }}
                  size="large"
                  format="DD/MM/YYYY"
                  disabledDate={(current) =>
                    current && current > dayjs().endOf("day")
                  }
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
                  style={{ width: "100%", borderRadius: "8px" }}
                >
                  <Select.Option value={1}>Quản lý</Select.Option>
                  <Select.Option value={2}>Nhân viên</Select.Option>
                  <Select.Option value={3}>Lễ tân</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ margin: "24px 0" }} />
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space size="middle">
              <Button
                size="large"
                onClick={() => setModalOpen(false)}
                disabled={posting}
                style={{
                  borderRadius: "8px",
                  minWidth: "100px",
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
                  borderRadius: "8px",
                  minWidth: "120px",
                  background: editingId ? "#52c41a" : "#1890ff",
                  borderColor: editingId ? "#52c41a" : "#1890ff",
                }}
              >
                {editingId ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, record: null })}
        footer={null}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <InfoCircleOutlined style={{ color: "#1890ff", fontSize: 20 }} />
            <span>Chi tiết nhân viên</span>
          </div>
        }
        centered
        width={420}
      >
        {detailModal.record && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Avatar
                size={64}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              />
              <div style={{ fontWeight: 600, fontSize: 18, marginTop: 8 }}>
                {detailModal.record.hoTen}
              </div>
            </div>
            <Divider />
            <div style={{ marginBottom: 8 }}>
              <PhoneOutlined style={{ marginRight: 8 }} />
              <b>SĐT:</b> {detailModal.record.sdt}
            </div>
            <div style={{ marginBottom: 8 }}>
              <MailOutlined style={{ marginRight: 8 }} />
              <b>Email:</b> {detailModal.record.email}
            </div>
            <div style={{ marginBottom: 8 }}>
              <IdcardOutlined style={{ marginRight: 8 }} />
              <b>Địa chỉ:</b> {detailModal.record.diaChi}
            </div>
            <div style={{ marginBottom: 8 }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              <b>Ngày bắt đầu:</b>{" "}
              {dayjs(detailModal.record.dateBegin).format("DD/MM/YYYY")}
            </div>
          </div>
        )}
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
