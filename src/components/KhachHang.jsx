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
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;
const PAGE_SIZE = 10;

export default function Phong() {
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
        "https://quanlykhachsan-ozv3.onrender.com/api/KhachHang",
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
      dataBegin: dayjs(),
    });
    setModalOpen(true);
  };

  const onEdit = async (id) => {
    setPosting(true);
    try {
      const res = await axios.get(
        `https://quanlykhachsan-ozv3.onrender.com/api/KhachHang/${id}`
      );
      setEditingId(id);
      form.setFieldsValue({
        ...res.data,
        dataBegin: dayjs(res.data.dataBegin),
      });
      setModalOpen(true);
    } catch (error) {
      message.error("Lấy dữ liệu khách hàng thất bại");
    }
    setPosting(false);
  };

  const onFinish = async (values) => {
    setPosting(true);
    const payload = {
      ...values,
      hide: values.hide || false,
      sapXep: values.sapXep || 0,
      dataBegin: values.dataBegin
        ? values.dataBegin.toISOString()
        : new Date().toISOString(),
    };
    try {
      if (editingId) {
        await axios.put(
          `https://quanlykhachsan-ozv3.onrender.com/api/KhachHang/${editingId}`,
          payload
        );
        message.success("Cập nhật thành công");
      } else {
        await axios.post(
          "https://quanlykhachsan-ozv3.onrender.com/api/KhachHang",
          payload
        );
        message.success("Thêm khách hàng thành công");
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
        `https://quanlykhachsan-ozv3.onrender.com/api/KhachHang/${id}`
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
      dataIndex: "idKhachHang",
      key: "idKhachHang",
      width: 60,
      sorter: (a, b) => a.idKhachHang - b.idKhachHang,
      align: "center",
    },
    {
      title: "Họ Tên",
      dataIndex: "hoTen",
      key: "hoTen",
      sorter: (a, b) => a.hoTen.localeCompare(b.hoTen),
      ellipsis: true,
    },
    {
      title: "SĐT",
      dataIndex: "sdt",
      key: "sdt",
      responsive: ["md"],
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      responsive: ["lg"],
    },
    {
      title: "CCCD",
      dataIndex: "cccd",
      key: "cccd",
      ellipsis: true,
      responsive: ["lg"],
      render: (text) => text.trim(),
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "dataBegin",
      key: "dataBegin",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
      sorter: (a, b) => new Date(a.dataBegin) - new Date(b.dataBegin),
      responsive: ["md"],
      align: "center",
    },
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record.idKhachHang)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc muốn xóa?"
              onConfirm={() => onDelete(record.idKhachHang)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="text" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title
        level={3}
        style={{
          marginBottom: 40,
          fontWeight: "bold",
          fontSize: 40,
          color: "#111",
          textAlign: "left",
        }}
      >
        Quản lý Khách hàng
      </Title>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <Input.Search
          placeholder="Tìm kiếm họ tên..."
          allowClear
          enterButton
          size="middle"
          onSearch={onSearch}
          style={{
            width: '100%',
            borderRadius: 6,
            marginRight: 20,
          }}
        />
        <Button
          type="primary"
          onClick={onAdd}
          style={{
            borderRadius: 6,
            fontWeight: "600",
            padding: "0 16px",
          }}
          size="middle"
        >
          + Thêm mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="idKhachHang"
        loading={loading}
        pagination={false}
        size="middle"
        bordered
        style={{ borderRadius: 6 }}
        rowClassName={() => "table-row-hover"}
      />

      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Pagination
          current={pageNumber}
          pageSize={PAGE_SIZE}
          total={total}
          onChange={setPageNumber}
          showSizeChanger={false}
          size="small"
          simple={false}
        />
      </div>

      <Modal
        title={editingId ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ hide: true, sapXep: 0, dataBegin: dayjs() }}
          style={{ maxWidth: 480, margin: "auto" }}
        >
          <Form.Item
            label="Họ Tên"
            name="hoTen"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="sdt"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            label="CCCD"
            name="cccd"
            rules={[{ required: true, message: "Vui lòng nhập CCCD" }]}
          >
            <Input placeholder="Nhập CCCD" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { type: "email", message: "Email không hợp lệ" },
              { required: true, message: "Vui lòng nhập email" },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="matKhau"
            rules={[{ required: !editingId, message: "Vui lòng nhập mật khẩu" }]}
            hasFeedback
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          {/* <Form.Item label="Ẩn khách hàng" name="hide" valuePropName="checked">
            <Switch />
          </Form.Item> */}

          {/* <Form.Item
            label="Sắp xếp"
            name="sapXep"
            rules={[
              { type: "number", message: "Phải là số" },
              { required: true, message: "Vui lòng nhập số thứ tự" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} placeholder="Nhập số thứ tự" />
          </Form.Item> */}

          <Form.Item
            label="Ngày đăng ký"
            name="dataBegin"
            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current > dayjs().endOf("day")}
            />
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginTop: 16 }}>
            <Button
              type="default"
              onClick={() => setModalOpen(false)}
              style={{ marginRight: 8 }}
              disabled={posting}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={posting}>
              {editingId ? "Cập nhật" : "Thêm"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

