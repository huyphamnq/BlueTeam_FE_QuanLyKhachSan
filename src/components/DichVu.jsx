import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Tag,
  Input,
  Select,
  Button,
  Modal,
  Form,
  InputNumber,
  Upload,
  message,
  Tooltip,
  Image,
  Space,
  Popconfirm,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { AiFillCheckCircle, AiFillCloseCircle } from "react-icons/ai";
import "antd/dist/reset.css";

import "../assets/css/base.css";

const { Title } = Typography;

const { Option } = Select;

// Đơn vị tính mẫu
const UNITS = ["Lần", "Giờ", "Ngày", "Chai", "Bữa", "Suất", "Phần", "Khác"];

// Trạng thái mẫu
const STATUS = [
  {
    value: true,
    label: "Còn hoạt động",
    color: "green",
    icon: <AiFillCheckCircle />,
  },
  {
    value: false,
    label: "Ngừng hoạt động",
    color: "red",
    icon: <AiFillCloseCircle />,
  },
];

// ================= IMAGE UPLOADER =================
const ImageUploader = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);

  // Validate file
  const beforeUpload = (file) => {
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg";
    if (!isJpgOrPng) {
      message.error("Chỉ nhận file .jpg, .jpeg, .png!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  // Upload lên server demo (có thể thay bằng API riêng)
  const handleUpload = async ({ file }) => {
    setLoading(true);
    // Giả lập upload: dùng https://api.imgbb.com/1/upload hoặc server riêng
    const formData = new FormData();
    formData.append("image", file);
    try {
      // Thay bằng API upload thật nếu có
      const res = await fetch(
        "https://api.imgbb.com/1/upload?key=8e5e2e7e1e2e7e1e2e7e1e2e7e1e2e7e",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data && data.data && data.data.url) {
        onChange(data.data.url);
        message.success("Tải ảnh thành công!");
      } else {
        message.error("Tải ảnh thất bại!");
      }
    } catch {
      message.error("Tải ảnh thất bại!");
    }
    setLoading(false);
  };

  return (
    <Upload
      name="image"
      showUploadList={false}
      customRequest={handleUpload}
      beforeUpload={beforeUpload}
      accept=".jpg,.jpeg,.png"
    >
      <Button icon={<UploadOutlined />} loading={loading}>
        {value ? "Đổi ảnh" : "Tải ảnh"}
      </Button>
      {value && (
        <div style={{ marginTop: 8 }}>
          <Image
            src={value}
            alt="Ảnh minh hoạ"
            width={80}
            height={80}
            style={{ borderRadius: 8, objectFit: "cover" }}
            preview
          />
        </div>
      )}
    </Upload>
  );
};

// ================= SERVICE FORM MODAL =================
const ServiceFormModal = ({
  visible,
  onCancel,
  onOk,
  initialValues,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) form.setFieldsValue(initialValues || {});
  }, [visible, initialValues, form]);

  return (
    <Modal
      open={visible}
      title={initialValues ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ"}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={initialValues ? "Lưu" : "Thêm mới"}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onOk}
        initialValues={initialValues}
      >
        <Form.Item
          label="Ảnh minh hoạ"
          name="anhMinhHoa"
          // rules={[{ required: true, message: "Vui lòng tải ảnh!" }]}
        >
          <ImageUploader />
        </Form.Item>
        <Form.Item
          label="Tên dịch vụ"
          name="tenDichVu"
          rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ!" }]}
        >
          <Input placeholder="Nhập tên dịch vụ" maxLength={100} />
        </Form.Item>
        <Form.Item
          label="Mô tả"
          name="moTa"
          rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
        >
          <Input.TextArea placeholder="Nhập mô tả" maxLength={300} autoSize />
        </Form.Item>
        <Form.Item
          label="Giá tiền"
          name="donGia"
          rules={[
            { required: true, message: "Vui lòng nhập giá!" },
            { type: "number", min: 1, message: "Giá phải lớn hơn 0!" },
          ]}
        >
          <InputNumber
            min={1}
            step={1000}
            style={{ width: "100%" }}
            formatter={(v) =>
              v ? v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
            }
            parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
            placeholder="Nhập giá tiền"
          />
        </Form.Item>
        <Form.Item
          label="Đơn vị tính"
          name="donVi"
          rules={[{ required: true, message: "Vui lòng chọn đơn vị!" }]}
        >
          <Select placeholder="Chọn đơn vị">
            {UNITS.map((u) => (
              <Option key={u} value={u}>
                {u}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Trạng thái"
          name="trangThai"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
        >
          <Select>
            {STATUS.map((s) => (
              <Option key={s.value} value={s.value}>
                <Tag color={s.color} icon={s.icon}>
                  {s.label}
                </Tag>
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ================= SERVICE TABLE =================
const ServiceTable = ({
  data,
  loading,
  onEdit,
  onDelete,
  onRefresh,
  onSearch,
  onFilterStatus,
  searchValue,
  statusFilter,
}) => {
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "anhMinhHoa",
      key: "anhMinhHoa",
      width: 90,
      render: (url) => (
        <Image
          src={url}
          width={56}
          height={56}
          style={{ borderRadius: 8, objectFit: "cover" }}
          alt="Ảnh dịch vụ"
          preview={false}
          fallback="https://via.placeholder.com/56x56?text=No+Img"
        />
      ),
    },
    {
      title: "Tên dịch vụ",
      dataIndex: "tenDichVu",
      key: "tenDichVu",
      width: 180,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Mô tả",
      dataIndex: "moTa",
      key: "moTa",
      width: 220,
      render: (text) =>
        text.length > 40 ? (
          <Tooltip title={text}>{text.slice(0, 40)}...</Tooltip>
        ) : (
          text
        ),
    },
    {
      title: "Giá tiền",
      dataIndex: "donGia",
      key: "donGia",
      width: 120,
      align: "right",
      render: (v) => (
        <span style={{ fontWeight: 500, color: "#1677ff" }}>
          {v.toLocaleString()} đ
        </span>
      ),
    },
    {
      title: "Đơn vị",
      dataIndex: "donVi",
      key: "donVi",
      width: 90,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      width: 130,
      align: "center",
      render: (active) => {
        const s = STATUS.find((s) => s.value === active);
        return (
          <Tag color={s?.color} icon={s?.icon} style={{ fontWeight: 500 }}>
            {s?.label}
          </Tag>
        );
      },
      filters: STATUS.map((s) => ({
        text: s.label,
        value: s.value,
      })),
      filteredValue: statusFilter !== undefined ? [statusFilter] : null,
      onFilter: (value, record) => record.trangThai === value,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Xoá dịch vụ?"
            description="Bạn chắc chắn muốn xoá dịch vụ này?"
            onConfirm={() => onDelete(record)}
            okText="Xoá"
            cancelText="Huỷ"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
    // style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px #f0f1f2" }}
    >
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}
      >
        <Input
          placeholder="Tìm kiếm tên dịch vụ..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 220 }}
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
        />
        <Select
          placeholder="Lọc trạng thái"
          allowClear
          style={{ width: 160 }}
          value={statusFilter}
          onChange={onFilterStatus}
        >
          {STATUS.map((s) => (
            <Option key={s.value} value={s.value}>
              <Tag color={s.color} icon={s.icon}>
                {s.label}
              </Tag>
            </Option>
          ))}
        </Select>
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          Làm mới
        </Button>
        <div style={{ flex: 1 }} />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => onEdit(null)}
        >
          Thêm mới
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="maDichVu"
        loading={loading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        scroll={{ x: 900 }}
        bordered
        size="middle"
      />
    </div>
  );
};

// ================= MAIN PAGE =================
const DichVu = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ visible: false, record: null });
  const [modalLoading, setModalLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState();

  // Lấy danh sách dịch vụ
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://quanlykhachsan-ozv3.onrender.com/api/DichVu"
      );
      const data = await res.json();
      // Thêm trường trạng thái giả lập nếu chưa có
      setServices(
        data.map((item) => ({
          ...item,
          donVi: item.donVi || "Lần",
          trangThai:
            typeof item.trangThai === "boolean"
              ? item.trangThai
              : Math.random() > 0.2, // demo
        }))
      );
    } catch {
      message.error("Không thể tải danh sách dịch vụ!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Tìm kiếm + lọc
  const filteredData = useMemo(() => {
    let d = services;
    if (search)
      d = d.filter((s) =>
        s.tenDichVu.toLowerCase().includes(search.toLowerCase())
      );
    if (statusFilter !== undefined)
      d = d.filter((s) => s.trangThai === statusFilter);
    return d;
  }, [services, search, statusFilter]);

  // Thêm/sửa dịch vụ
  const handleModalOk = async (values) => {
    setModalLoading(true);
    try {
      if (modal.record) {
        // Sửa
        await fetch(
          `https://quanlykhachsan-ozv3.onrender.com/api/DichVu/${modal.record.maDichVu}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...modal.record,
              ...values,
            }),
          }
        );
        message.success("Cập nhật dịch vụ thành công!");
      } else {
        // Thêm
        await fetch("https://quanlykhachsan-ozv3.onrender.com/api/DichVu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        message.success("Thêm dịch vụ thành công!");
      }
      setModal({ visible: false, record: null });
      fetchServices();
    } catch {
      message.error("Lưu dịch vụ thất bại!");
    }
    setModalLoading(false);
  };

  // Xoá dịch vụ
  const handleDelete = async (record) => {
    setLoading(true);
    try {
      await fetch(
        `https://quanlykhachsan-ozv3.onrender.com/api/DichVu/${record.maDichVu}`,
        { method: "DELETE" }
      );
      message.success("Đã xoá dịch vụ!");
      fetchServices();
    } catch {
      message.error("Xoá thất bại!");
      setLoading(false);
    }
  };

  // Giao diện
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <Title level={2} style={{ marginBottom: 24 }}>
        Quản lý Dịch Vụ{" "}
      </Title>
      <div
        style={{
          margin: "0 auto",
          // padding: "0 16px",
        }}
      >
        <h2
          style={{
            fontFamily: "Inter",
            fontWeight: 700,
            marginBottom: 24,
            fontSize: 32,
            fontWeight: 600,
          }}
        >
          {/* Quản lý Dịch Vụ */}
        </h2>
        <ServiceTable
          data={filteredData}
          loading={loading}
          onEdit={(record) =>
            setModal({ visible: true, record: record ? { ...record } : null })
          }
          onDelete={handleDelete}
          onRefresh={fetchServices}
          onSearch={setSearch}
          onFilterStatus={setStatusFilter}
          searchValue={search}
          statusFilter={statusFilter}
        />
        <ServiceFormModal
          visible={modal.visible}
          onCancel={() => setModal({ visible: false, record: null })}
          onOk={handleModalOk}
          initialValues={
            modal.record
              ? {
                  ...modal.record,
                  trangThai:
                    typeof modal.record.trangThai === "boolean"
                      ? modal.record.trangThai
                      : true,
                }
              : { trangThai: true, donVi: UNITS[0] }
          }
          loading={modalLoading}
        />
      </div>
    </div>
  );
};

export default DichVu;
