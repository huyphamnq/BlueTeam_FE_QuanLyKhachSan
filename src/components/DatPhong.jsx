import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Input,
  Select,
  DatePicker,
  Button,
  Modal,
  Form,
  message,
  Space,
  Typography,
  Descriptions,
  Divider,
  Spin,
} from "antd";
import {
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineCheckCircle,
  AiOutlineLogout,
} from "react-icons/ai";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrAfter);
import "dayjs/locale/vi";
import locale from "antd/es/date-picker/locale/vi_VN";
// import "./DatPhong.css"; // Bạn có thể thêm css font Inter ở đây

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

// Trạng thái đặt phòng
const bookingStatus = [
  { value: 1, label: "Đã đặt", color: "blue", icon: "🔵" },
  { value: 2, label: "Đang ở", color: "orange", icon: "🟠" },
  { value: 3, label: "Đã trả", color: "default", icon: "⚪" },
  { value: 4, label: "Đã huỷ", color: "red", icon: "🔴" },
];

// Helper
const getStatusTag = (status) => {
  const s = bookingStatus.find((b) => b.value === status);
  if (!s) return <Tag>Không rõ</Tag>;
  return (
    <Tag color={s.color} style={{ fontWeight: 500 }}>
      <span style={{ fontSize: 16 }}>{s.icon}</span> {s.label}
    </Tag>
  );
};

const DatPhong = () => {
  // State
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState({
    search: "",
    status: null,
    dateRange: [],
  });
  const [modal, setModal] = useState({ open: false, edit: null });
  const [checkoutModal, setCheckoutModal] = useState({
    open: false,
    booking: null,
  });
  const [customers, setCustomers] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [form] = Form.useForm();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://quanlykhachsan-ozv3.onrender.com/api/PhieuDatPhong?pageNumber=1&pageSize=100"
      );
      const json = await res.json();
      // Luôn lấy json.items hoặc json.data hoặc []
      const arr = json.items || json.data || [];
      setBookings(
        arr.map((item) => ({
          idPhieuDatPhong: item.idPhieuDatPhong,
          maNhanPhong: item.maNhanPhong,
          tenKhachHang: item.tenKhachHang || `Khách ${item.idKhachHang || ""}`,
          tenPhong: item.tenPhong || item.maNhanPhong || "Không rõ",
          tenLoaiPhong: item.tenLoaiPhong,
          ngayVao: item.ngayVao,
          ngayRa: item.ngayRa,
          tinhTrangDatPhong: item.tinhTrangDatPhong,
          tongTien: item.tongTien,
          meta: item.meta,
          sdt: item.sdt,
          email: item.email,
          cccd: item.cccd?.trim(),
          idKhachHang: item.idKhachHang,
          idNhanVien: item.idNhanVien,
          idPhong: item.idPhong,
          // Thêm các trường khác nếu cần
        }))
      );
    } catch {
      setBookings([]);
      message.error("Không thể tải danh sách đặt phòng");
    }
    setLoading(false);
  };

  // Fetch customers, room types, rooms, services
  const fetchInitData = async () => {
    try {
      const [cus, types, sv, staff] = await Promise.all([
        fetch(
          "https://quanlykhachsan-ozv3.onrender.com/api/KhachHang?pageNumber=1&pageSize=100"
        ).then((r) => r.json()),
        fetch("https://quanlykhachsan-ozv3.onrender.com/api/LoaiPhong").then(
          (r) => r.json()
        ),
        fetch("https://quanlykhachsan-ozv3.onrender.com/api/DichVu").then((r) =>
          r.json()
        ),
        fetch("https://quanlykhachsan-ozv3.onrender.com/api/NhanVien").then(
          (r) => r.json()
        ),
      ]);
      setCustomers(Array.isArray(cus?.items) ? cus.items : []);
      setRoomTypes(Array.isArray(types) ? types : []);
      setServices(Array.isArray(sv) ? sv : []);
      setStaffs(Array.isArray(staff?.items) ? staff.items : []);
    } catch {
      setCustomers([]);
      setRoomTypes([]);
      setServices([]);
      setStaffs([]);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchInitData();
  }, []);

  // Khi mở modal check-out, fetch dịch vụ đã dùng nếu chưa có
  useEffect(() => {
    if (
      checkoutModal.open &&
      checkoutModal.booking &&
      !checkoutModal.booking.dichVuSuDung
    ) {
      fetch(
        `https://quanlykhachsan-ozv3.onrender.com/api/PhieuDatPhong/${checkoutModal.booking.idPhieuDatPhong}/dichvu`
      )
        .then((res) => res.json())
        .then((data) => {
          setCheckoutModal((modal) => ({
            ...modal,
            booking: {
              ...modal.booking,
              dichVuSuDung: data.items || data.data || [],
            },
          }));
        });
    }
  }, [checkoutModal.open, checkoutModal.booking]);

  // Filter bookings
  const filteredBookings = bookings
    .filter((b) =>
      filter.search
        ? b.tenKhachHang?.toLowerCase().includes(filter.search.toLowerCase()) ||
          b.tenPhong?.toLowerCase().includes(filter.search.toLowerCase()) ||
          b.maNhanPhong?.toLowerCase().includes(filter.search.toLowerCase())
        : true
    )
    .filter((b) =>
      filter.status ? b.tinhTrangDatPhong === filter.status : true
    )
    .filter((b) => {
      if (filter.dateRange.length === 2) {
        const [from, to] = filter.dateRange;
        return (
          dayjs(b.ngayVao).isSameOrAfter(from, "day") &&
          dayjs(b.ngayRa).isSameOrBefore(to, "day")
        );
      }
      return true;
    });

  // Table columns
  const columns = [
    {
      title: "Mã đặt phòng",
      dataIndex: "maNhanPhong",
      key: "maNhanPhong",
      width: 120,
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "Khách hàng",
      dataIndex: "tenKhachHang",
      key: "tenKhachHang",
      width: 160,
    },
    {
      title: "Số phòng",
      dataIndex: "tenPhong",
      key: "tenPhong",
      width: 100,
    },
    // {
    //   title: "Loại phòng",
    //   dataIndex: "tenLoaiPhong",
    //   key: "tenLoaiPhong",
    //   width: 120,
    //   render: (_, record) => {
    //     const room = rooms.find((r) => r.idPhong === record.idPhong);
    //     return room?.tenLoaiPhong || "-";
    //   },
    // },
    {
      title: "Nhận – Trả",
      key: "ngayVao",
      width: 180,
      render: (_, r) => (
        <span>
          <b>{dayjs(r.ngayVao).format("HH:mm DD/MM/YYYY")}</b> <br />– <br />
          <b>{dayjs(r.ngayRa).format("HH:mm DD/MM/YYYY")}</b>
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "tinhTrangDatPhong",
      key: "tinhTrangDatPhong",
      width: 110,
      render: getStatusTag,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 220,
      render: (_, record) => (
        <Space>
          <Button
            icon={<AiOutlineEdit />}
            size="small"
            onClick={() => openEditModal(record)}
          >
            Sửa
          </Button>
          <Button
            icon={<AiOutlineDelete />}
            size="small"
            danger
            onClick={() => handleDelete(record)}
          >
            Huỷ
          </Button>
          {record.tinhTrangDatPhong === 1 && (
            <Button
              icon={<AiOutlineCheckCircle />}
              size="small"
              type="primary"
              onClick={() => handleCheckin(record)}
            >
              Check-in
            </Button>
          )}
          {record.tinhTrangDatPhong === 2 && (
            <Button
              icon={<AiOutlineLogout />}
              size="small"
              type="primary"
              onClick={() => setCheckoutModal({ open: true, booking: record })}
            >
              Check-out
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Modal handlers
  const openCreateModal = () => {
    setModal({ open: true, edit: null });
    form.resetFields();
  };
  const openEditModal = (record) => {
    setModal({ open: true, edit: record });
    form.setFieldsValue({
      ...record,
      ngayVao: dayjs(record.ngayVao),
      ngayRa: dayjs(record.ngayRa),
      idKhachHang: record.idKhachHang,
      idPhong: record.idPhong,
      idLoaiPhong: record.idLoaiPhong,
      meta: record.meta,
    });
    fetchRoomsByType(record.idLoaiPhong);
  };
  const closeModal = () => {
    setModal({ open: false, edit: null });
    form.resetFields();
  };

  // Xử lý chọn loại phòng để lọc phòng
  const fetchRoomsByType = async (idLoaiPhong) => {
    if (!idLoaiPhong) {
      setRooms([]);
      return;
    }
    const res = await fetch(
      `https://quanlykhachsan-ozv3.onrender.com/api/Phong/filter?idLoaiPhong=${idLoaiPhong}&pageNumber=1&pageSize=100`
    );
    const json = await res.json();
    setRooms(json.items || json.data || []);
  };

  // Validate phòng trống
  const checkRoomAvailable = async (idPhong, ngayVao, ngayRa) => {
    // Kiểm tra trùng với các booking đã có trong state
    // Chỉ kiểm tra các booking chưa bị huỷ (tinhTrangDatPhong !== 4)
    return !bookings.some(
      (b) =>
        b.idPhong === idPhong &&
        b.tinhTrangDatPhong !== 4 &&
        // Kiểm tra giao nhau khoảng thời gian
        dayjs(ngayVao).isBefore(dayjs(b.ngayRa)) &&
        dayjs(ngayRa).isAfter(dayjs(b.ngayVao))
    );
  };

  // Tạo/sửa booking
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // Validate phòng trống
      const available = await checkRoomAvailable(
        values.idPhong,
        values.ngayVao,
        values.ngayRa
      );
      if (!available) {
        message.error("Phòng đã được đặt trong khoảng thời gian này!");
        setLoading(false);
        return;
      }
      // Chuẩn bị data
      // Loại bỏ trường dịch vụ
      const { dichVuSuDung, ...rest } = values;
      const payload = {
        idKhachHang: values.idKhachHang,
        idPhong: values.idPhong,
        idNhanVien: values.idNhanVien,
        maNhanPhong: `MP${Math.floor(Math.random() * 100000)}`, // sinh mã nhận phòng tự động
        ngayVao: values.ngayVao.toISOString(),
        ngayRa: values.ngayRa.toISOString(),
        ngayDatPhong: new Date().toISOString(),
        tinhTrangDatPhong: 1,
        tinhTrangThanhToan: 0,
        meta: values.meta || "",
        hide: false,
        order: 0,
        dateBegin: new Date().toISOString(),
      };
      if (modal.edit) {
        // PUT /api/PhieuDatPhong/{id}
        await fetch(
          `https://quanlykhachsan-ozv3.onrender.com/api/PhieuDatPhong/${modal.edit.idPhieuDatPhong}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        message.success("Cập nhật đặt phòng thành công!");
      } else {
        // POST /api/PhieuDatPhong
        await fetch(
          "https://quanlykhachsan-ozv3.onrender.com/api/PhieuDatPhong",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        message.success("Tạo đặt phòng thành công!");
      }
      closeModal();
      fetchBookings();
    } catch {
      message.error("Có lỗi khi lưu đặt phòng!");
    }
    setLoading(false);
  };

  // Huỷ đặt phòng
  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận huỷ đặt phòng?",
      content: `Bạn chắc chắn muốn huỷ đặt phòng ${record.maNhanPhong}?`,
      okText: "Huỷ đặt phòng",
      okType: "danger",
      cancelText: "Đóng",
      onOk: async () => {
        setLoading(true);
        try {
          await fetch(
            `https://quanlykhachsan-ozv3.onrender.com/api/PhieuDatPhong/${record.idPhieuDatPhong}`,
            { method: "DELETE" }
          );
          message.success("Huỷ đặt phòng thành công!");
          fetchBookings();
        } catch {
          message.error("Không thể huỷ đặt phòng!");
        }
        setLoading(false);
      },
    });
  };

  // Check-in
  const handleCheckin = async (record) => {
    setLoading(true);
    try {
      // Lấy lại dữ liệu booking hiện tại
      const res = await fetch(
        `https://quanlykhachsan-ozv3.onrender.com/api/PhieuDatPhong/${record.idPhieuDatPhong}`
      );
      const booking = await res.json();

      // Cập nhật trạng thái
      const payload = {
        ...booking,
        tinhTrangDatPhong: 2, // Đang ở
      };

      await fetch(
        `https://quanlykhachsan-ozv3.onrender.com/api/PhieuDatPhong/${record.idPhieuDatPhong}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      message.success("Check-in thành công!");
      fetchBookings();
    } catch {
      message.error("Không thể check-in!");
    }
    setLoading(false);
  };

  // Check-out
  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      // Lấy lại dữ liệu booking hiện tại
      const res = await fetch(
        `https://quanlykhachsan-ozv3.onrender.com/api/PhieuDatPhong/${checkoutModal.booking.idPhieuDatPhong}`
      );
      const booking = await res.json();

      // Cập nhật trạng thái
      const payload = {
        ...booking,
        tinhTrangDatPhong: 3, // Đã trả
        tinhTrangThanhToan: 1, // Đã thanh toán (nếu có)
      };

      await fetch(
        `https://quanlykhachsan-ozv3.onrender.com/api/PhieuDatPhong/${checkoutModal.booking.idPhieuDatPhong}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      await fetch(
        `https://quanlykhachsan-ozv3.onrender.com/api/PhieuDatPhong/${checkoutModal.booking.idPhieuDatPhong}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      // Sau khi cập nhật trạng thái thành công, tạo hóa đơn:
      const invoiceRes = await fetch(
        "https://quanlykhachsan-ozv3.onrender.com/api/HoaDon/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idPhieuDatPhong: checkoutModal.booking.idPhieuDatPhong,
            meta: checkoutModal.booking.meta || "",
            hide: false,
            hienThi: true,
            dateBegin: new Date().toISOString(),
          }),
        }
      );
      const data = await invoiceRes.json();
      if (data.idHoaDon) {
        // Gọi xác nhận đã thanh toán cho hóa đơn vừa tạo
        await fetch(
          `https://quanlykhachsan-ozv3.onrender.com/api/HoaDon/mark-paid/${data.idHoaDon}`,
          {
            method: "POST",
          }
        );
      }
      message.success("Check-out & thanh toán thành công!");
      setCheckoutModal({ open: false, booking: null });
      fetchBookings();
    } catch {
      message.error("Không thể check-out!");
    }
    setCheckoutLoading(false);
  };

  // Lọc phòng khi chọn loại phòng
  const handleLoaiPhongChange = (idLoaiPhong) => {
    form.setFieldsValue({ idPhong: undefined });
    fetchRoomsByType(idLoaiPhong);
  };

  // Render QR demo
  const renderQR = () => (
    <img
      src="https://img.vietqr.io/image/970422-123456789-compact2.png?amount=3000000&addInfo=ThanhToanKhachSan"
      alt="QR Thanh toán"
      style={{
        width: "100%",
        maxWidth: "100%",
        display: "block",
        border: "1px solid #eee",
        borderRadius: 8,
        margin: "0 auto",
      }}
    />
  );

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Quản lý Đặt Phòng
      </Title>

      <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm khách, phòng, mã đặt phòng"
          style={{ width: 220 }}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
        />
        <Select
          allowClear
          placeholder="Trạng thái"
          style={{ width: 140 }}
          onChange={(v) => setFilter((f) => ({ ...f, status: v }))}
        >
          {bookingStatus.map((s) => (
            <Option key={s.value} value={s.value}>
              {s.icon} {s.label}
            </Option>
          ))}
        </Select>
        <RangePicker
          locale={locale}
          format="DD/MM/YYYY"
          style={{ width: 260 }}
          onChange={(dates) =>
            setFilter((f) => ({ ...f, dateRange: dates || [] }))
          }
        />
        <Button
          type="primary"
          icon={<AiOutlinePlus />}
          onClick={openCreateModal}
        >
          Tạo booking mới
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredBookings}
        rowKey="idPhieuDatPhong"
        loading={loading}
        bordered
        scroll={{ x: 900 }}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        style={{ background: "#fff" }}
      />

      {/* Modal Tạo/Sửa */}
      <Modal
        open={modal.open}
        title={modal.edit ? "Chỉnh sửa Đặt Phòng" : "Tạo Đặt Phòng"}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={modal.edit ? "Cập nhật" : "Tạo mới"}
        confirmLoading={loading}
        destroyOnClose
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            ngayVao: null,
            ngayRa: null,
            meta: "",
          }}
        >
          <Form.Item
            name="idKhachHang"
            label="Khách hàng"
            rules={[{ required: true, message: "Chọn khách hàng!" }]}
          >
            <Select
              showSearch
              placeholder="Chọn khách hàng"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {customers.map((c) => (
                <Option key={c.idKhachHang} value={c.idKhachHang}>
                  {(c.hoTen || c.tenKhachHang) + (c.sdt ? ` (${c.sdt})` : "")}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="idLoaiPhong"
            label="Loại phòng"
            rules={[{ required: true, message: "Chọn loại phòng!" }]}
          >
            <Select
              placeholder="Chọn loại phòng"
              onChange={handleLoaiPhongChange}
            >
              {roomTypes.map((t) => (
                <Option key={t.idLoaiPhong} value={t.idLoaiPhong}>
                  {t.tenLoaiPhong}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="idPhong"
            label="Phòng"
            rules={[{ required: true, message: "Chọn phòng!" }]}
          >
            <Select placeholder="Chọn phòng">
              {rooms.map((r) => (
                <Option key={r.idPhong} value={r.idPhong}>
                  {r.tenPhong}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="ngayVao"
            label="Ngày giờ nhận phòng"
            rules={[{ required: true, message: "Chọn ngày nhận phòng!" }]}
          >
            <DatePicker
              showTime
              locale={locale}
              style={{ width: "100%" }}
              format="HH:mm DD/MM/YYYY"
              disabledDate={(d) => d && d < dayjs().startOf("day")}
            />
          </Form.Item>
          <Form.Item
            name="ngayRa"
            label="Ngày giờ trả phòng"
            dependencies={["ngayVao"]}
            rules={[
              { required: true, message: "Chọn ngày trả phòng!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue("ngayVao"))
                    return Promise.resolve();
                  if (value.isAfter(getFieldValue("ngayVao")))
                    return Promise.resolve();
                  return Promise.reject("Ngày trả phải sau ngày nhận!");
                },
              }),
            ]}
          >
            <DatePicker
              showTime
              locale={locale}
              style={{ width: "100%" }}
              format="HH:mm DD/MM/YYYY"
              disabledDate={(d) => d && d < dayjs().startOf("day")}
            />
          </Form.Item>
          <Form.Item
            name="idNhanVien"
            label="Nhân viên phụ trách"
            rules={[{ required: true, message: "Chọn nhân viên!" }]}
          >
            <Select
              showSearch
              placeholder="Chọn nhân viên"
              optionFilterProp="children"
              allowClear
            >
              {staffs.map((nv) => (
                <Option key={nv.idNhanVien} value={nv.idNhanVien}>
                  {nv.hoTen}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* 
          <Form.Item
            name="dichVuSuDung"
            label="Dịch vụ sử dụng"
          >
            <Select
              mode="multiple"
              placeholder="Chọn dịch vụ"
              optionFilterProp="children"
              allowClear
              showSearch
            >
              {services.map((s) => (
                <Option key={s.maDichVu} value={s.maDichVu}>
                  {s.tenDichVu} ({s.donGia?.toLocaleString()}đ)
                </Option>
              ))}
            </Select>
          </Form.Item>
          */}
          <Form.Item name="meta" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú thêm (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Check-out & Thanh toán */}
      <Modal
        open={checkoutModal.open}
        title="Thanh toán & Check-out"
        onCancel={() => setCheckoutModal({ open: false, booking: null })}
        footer={[
          <Button
            key="back"
            onClick={() => setCheckoutModal({ open: false, booking: null })}
          >
            Đóng
          </Button>,
          <Button
            key="pay"
            type="primary"
            loading={checkoutLoading}
            onClick={handleCheckout}
          >
            Xác nhận đã thanh toán
          </Button>,
        ]}
        width={520}
        destroyOnClose
      >
        {checkoutModal.booking ? (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Khách hàng">
                {checkoutModal.booking.tenKhachHang}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng">
                {checkoutModal.booking.tenPhong}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày nhận">
                {dayjs(checkoutModal.booking.ngayVao).format(
                  "HH:mm DD/MM/YYYY"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày trả">
                {dayjs(checkoutModal.booking.ngayRa).format("HH:mm DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {checkoutModal.booking.meta || "-"}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Title level={5}>Dịch vụ sử dụng</Title>
            <ul>
              {checkoutModal.booking?.dichVuSuDung &&
              checkoutModal.booking.dichVuSuDung.length > 0 ? (
                checkoutModal.booking.dichVuSuDung.map((dv) => (
                  <li key={dv.maDichVu || dv.idDichVu}>
                    {dv.tenDichVu} - {dv.donGia?.toLocaleString()}đ
                  </li>
                ))
              ) : (
                <li>Không có dịch vụ</li>
              )}
            </ul>
            <Divider />
            <Title level={5}>Tổng tiền</Title>
            <Text strong style={{ fontSize: 20, color: "#d4380d" }}>
              {checkoutModal.booking.tongTien?.toLocaleString()} đ
            </Text>
            <Divider />
            <Title level={5}>QR Thanh toán</Title>
            {renderQR()}
          </>
        ) : (
          <Spin />
        )}
      </Modal>
    </div>
  );
};

export default DatPhong;
