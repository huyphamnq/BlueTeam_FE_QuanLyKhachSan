import React, { useEffect, useState } from "react";
import {
  Tabs,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Skeleton,
  DatePicker,
  Tooltip,
  Badge,
  Upload,
  Spin,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import "../assets/css/base.css";

const STATUS_MAP = {
  0: { label: "Trống", color: "green" },
  1: { label: "Đã đặt", color: "blue" },
  2: { label: "Đang ở", color: "orange" },
  3: { label: "Dọn dẹp", color: "gold" },
  4: { label: "Bảo trì", color: "default" },
};
const TIMELINE_STATUS = {
  booked: "#1890ff",
  staying: "#faad14",
  done: "#d9d9d9",
  cancelled: "#ff4d4f",
};
const { Title } = Typography;

function convertStatus(trangThai) {
  switch (trangThai) {
    case 1:
      return "booked";
    case 2:
      return "staying";
    case 3:
      return "done";
    case 4:
      return "cancelled";
    default:
      return "booked";
  }
}

// API lấy danh sách phòng
const fetchRooms = async () => {
  const res = await fetch(
    "https://quanlykhachsan-ozv3.onrender.com/api/Phong/filter?pageNumber=1&pageSize=100"
  );
  if (!res.ok) throw new Error("Lỗi tải danh sách phòng");
  const json = await res.json();
  return json.items || json.data || [];
};

// API lấy khách hàng
const fetchAllCustomers = async () => {
  const res = await fetch(
    "https://quanlykhachsan-ozv3.onrender.com/api/KhachHang?pageNumber=1&pageSize=1000"
  );
  if (!res.ok) throw new Error("Lỗi tải danh sách khách hàng");
  const json = await res.json();
  return json.items || json.data || [];
};

// API lấy bookings (join phòng và khách hàng)
// API lấy bookings (đã có sẵn thông tin phòng và khách hàng)
const fetchBookings = async () => {
  const res = await fetch(
    "http://192.168.1.146:10000/api/PhieuDatPhong?pageNumber=1&pageSize=100"
  );
  if (!res.ok) throw new Error("Lỗi tải dữ liệu");
  const json = await res.json();

  return (json.items || json.data || []).map((item) => {
    return {
      roomNumber: item.tenPhong || item.maNhanPhong || "Không rõ",
      customerName: item.tenKhachHang || `Khách ${item.idKhachHang || ""}`,
      startTime: item.ngayVao,
      endTime: item.ngayRa,
      status: convertStatus(item.tinhTrangDatPhong),
      note: item.meta || "",
      // Customer info
      customerPhone: item.sdt,
      customerEmail: item.email,
      customerID: item.cccd?.trim(),
      // Additional booking info
      bookingDate: item.ngayDatPhong,
      paymentStatus: item.tinhTrangThanhToan,
      totalAmount: item.tongTien,
      staffName: item.tenNhanVien,
      // IDs
      bookingId: item.idPhieuDatPhong,
      customerId: item.idKhachHang,
      staffId: item.idNhanVien,
      roomId: item.idPhong,
    };
  });
};

// Group bookings theo roomNumber
const groupByRoom = (bookings) => {
  const rooms = {};
  bookings.forEach((b) => {
    if (!rooms[b.roomNumber]) rooms[b.roomNumber] = [];
    rooms[b.roomNumber].push(b);
  });
  return rooms;
};

// Lấy mảng ngày liên tục trong tháng đã chọn
const getDateRange = (bookings, month) => {
  if (!month) return [];
  const year = month.year();
  const m = month.month();
  const start = dayjs(new Date(year, m, 1));
  const end = start.endOf("month");
  const days = [];
  let d = start;
  while (d.isBefore(end) || d.isSame(end, "day")) {
    days.push(d.toDate());
    d = d.add(1, "day");
  }
  return days;
};

const convertPercentToAmount = (percent, originalPrice) => {
  if (!percent || !originalPrice) return 0;
  return Math.round((percent * originalPrice) / 100);
};

const convertAmountToPercent = (amount, originalPrice) => {
  if (!amount || !originalPrice) return 0;
  return Math.round((amount * 100) / originalPrice);
};

const RoomForm = ({ open, onCancel, onOk, initialValues, roomTypes }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (open) {
      const values = { ...(initialValues || {}) };
      if (values.dateBegin) {
        values.dateBegin = dayjs(values.dateBegin);
      }
      // Convert giamGia from amount to percent if needed
      if (values.giaPhong && values.giamGia) {
        values.giamGia = convertAmountToPercent(
          values.giamGia,
          values.giaPhong
        );
      }
      form.setFieldsValue(values);
      setFileList([]);
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      open={open}
      title={initialValues ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => onOk(values, fileList));
      }}
      okText="Lưu"
      cancelText="Huỷ"
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="tenPhong"
          label="Số phòng"
          rules={[{ required: true, message: "Không được để trống" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="idLoaiPhong"
          label="Loại phòng"
          rules={[{ required: true, message: "Không được để trống" }]}
        >
          <Select>
            {roomTypes.map((rt) => (
              <Select.Option key={rt.value} value={rt.value}>
                {rt.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="giaPhong"
          label="Giá tiền"
          rules={[
            { required: true, message: "Không được để trống" },
            { type: "number", min: 0, message: "Giá phải là số hợp lệ" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            step={100000}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\D/g, "")}
            addonAfter="VNĐ"
          />
        </Form.Item>
        <Form.Item
          name="giamGia"
          label="Giảm giá (%)"
          tooltip="Nhập phần trăm giảm giá (0-100)"
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            max={100}
            step={1}
            formatter={(value) => `${value}%`}
            parser={(value) => value.replace("%", "")}
            onChange={(value) => {
              const giaPhong = form.getFieldValue("giaPhong");
              if (giaPhong) {
                const giamGiaAmount = convertPercentToAmount(value, giaPhong);
                form.setFieldValue("giamGiaAmount", giamGiaAmount);
              }
            }}
          />
        </Form.Item>
        <Form.Item label="Số tiền giảm" tooltip="Số tiền giảm giá tương ứng">
          <InputNumber
            style={{ width: "100%" }}
            disabled
            value={form.getFieldValue("giamGiaAmount")}
            formatter={(value) =>
              value?.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })
            }
          />
        </Form.Item>
        <Form.Item name="soLuong" label="Số lượng phòng">
          <InputNumber style={{ width: "100%" }} min={1} step={1} />
        </Form.Item>
        <Form.Item name="soNguoiLon" label="Số người lớn">
          <InputNumber style={{ width: "100%" }} min={1} step={1} />
        </Form.Item>
        <Form.Item name="soTreEm" label="Số trẻ em">
          <InputNumber style={{ width: "100%" }} min={0} step={1} />
        </Form.Item>
        <Form.Item name="dienTich" label="Diện tích (m²)">
          <InputNumber style={{ width: "100%" }} min={0} step={1} />
        </Form.Item>
        <Form.Item name="moTa" label="Mô tả">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="dateBegin" label="Ngày bắt đầu">
          <DatePicker
            style={{ width: "100%" }}
            showTime
            format="YYYY-MM-DD HH:mm:ss"
          />
        </Form.Item>
        <Form.Item name="hinhAnh" label="Hình ảnh">
          <Upload
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList.slice(-1))}
            accept="image/*"
            maxCount={1}
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          name="trangThai"
          label="Trạng thái"
          rules={[{ required: true, message: "Không được để trống" }]}
        >
          <Select>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <Select.Option key={k} value={Number(k)}>
                {v.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const Phong = () => {
  // Tab 1: Danh sách phòng
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [errorRooms, setErrorRooms] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [detailRoom, setDetailRoom] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  // Thêm state cho ảnh
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const searchRooms = async (searchTerm) => {
    try {
      // If empty search, return all rooms
      if (!searchTerm?.trim()) {
        return await fetchRooms();
      }

      const encodedSearch = encodeURIComponent(searchTerm.trim());
      const res = await fetch(
        `https://quanlykhachsan-ozv3.onrender.com/api/Phong/search?keyword=${encodedSearch}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) {
        const allRooms = await fetchRooms();
        return allRooms.filter((room) =>
          room.tenPhong.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      const json = await res.json();
      const results = json.items || json.data || [];

      if (results.length === 0) {
        // If no results from API, try client-side filter
        const allRooms = await fetchRooms();
        return allRooms.filter((room) =>
          room.tenPhong.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return results;
    } catch (error) {
      console.error("Search error:", error);
      // Fallback to client-side search if API fails
      const allRooms = await fetchRooms();
      return allRooms.filter((room) =>
        room.tenPhong.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  };

  // Tab 2: Timeline phòng
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [errorBookings, setErrorBookings] = useState("");
  const [timelineStatus, setTimelineStatus] = useState("all");
  const [timelineMonth, setTimelineMonth] = useState(dayjs());

  // Load rooms & customers & bookings
  useEffect(() => {
    setLoadingRooms(true);
    setLoadingBookings(true);

    // Lấy loại phòng từ API
    fetch("https://quanlykhachsan-ozv3.onrender.com/api/LoaiPhong")
      .then((res) => res.json())
      .then((data) => {
        setRoomTypes(
          (data || []).map((item) => ({
            value: item.idLoaiPhong,
            label: item.tenLoaiPhong,
          }))
        );
      })
      .catch(() => {
        // fallback nếu lỗi
        setRoomTypes([
          { value: 1, label: "Phòng đơn" },
          { value: 2, label: "Phòng đôi" },
          { value: 3, label: "Phòng Gia Đình" },
          { value: 4, label: "Phòng VIP" },
        ]);
      });

    // Load rooms for the room list tab
    fetchRooms()
      .then((roomsData) => {
        setRooms(roomsData);
        setLoadingRooms(false);
      })
      .catch(() => {
        setErrorRooms("Không thể tải danh sách phòng!");
        setLoadingRooms(false);
      });

    // Load bookings separately
    fetchBookings()
      .then((bookingsData) => {
        setBookings(bookingsData);
        setLoadingBookings(false);
      })
      .catch(() => {
        setErrorBookings("Không thể tải dữ liệu đặt phòng!");
        setLoadingBookings(false);
      });
  }, []);

  // Table columns
  const columns = [
    {
      title: "Số phòng",
      dataIndex: "tenPhong",
      key: "tenPhong",
      render: (text) => text || "Chưa có",
    },
    {
      title: "Loại phòng",
      dataIndex: "idLoaiPhong",
      key: "idLoaiPhong",
      render: (v) =>
        roomTypes.find((rt) => rt.value === v)?.label || "Chưa phân loại",
      filters: roomTypes.map((rt) => ({ text: rt.label, value: rt.value })),
      onFilter: (value, record) => record.idLoaiPhong === value,
    },
    {
      title: "Giá gốc",
      dataIndex: "giaPhong",
      key: "giaPhong",
      render: (v) =>
        v
          ? v.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
          : "Chưa có",
    },
    {
      title: "Giảm giá",
      dataIndex: "giamGia",
      key: "giamGia",
      render: (giamGia, record) => {
        // Kiểm tra cả giá phòng và giảm giá phải tồn tại và > 0
        if (!record.giaPhong || !giamGia || giamGia <= 0) {
          return <Tag color="default">Không giảm giá</Tag>;
        }
        const percent = convertAmountToPercent(giamGia, record.giaPhong);
        return (
          <Tooltip
            title={giamGia.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          >
            <Tag color="blue">{`Giảm ${percent}%`}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Giá cuối",
      key: "giaCuoi",
      render: (_, record) => {
        if (!record.giaPhong) return "Chưa có";
        const giaCuoi = record.giaPhong - (record.giamGia || 0);
        return giaCuoi.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        });
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      filters: Object.entries(STATUS_MAP).map(([k, v]) => ({
        text: v.label,
        value: Number(k),
      })),
      onFilter: (value, record) => record.trangThai === value,
      render: (v) => (
        <Tag color={STATUS_MAP[v]?.color || "default"}>
          {STATUS_MAP[v]?.label || "Không xác định"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            icon={<EyeOutlined />}
            size="small"
            style={{ marginRight: 8 }}
            onClick={() => {
              setDetailRoom(record);
              setDetailModalOpen(true);
            }}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingRoom(record);
              setModalOpen(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            style={{ marginLeft: 8 }}
            onClick={() => handleDeleteRoom(record)}
          />
        </>
      ),
    },
  ];

  // Thêm/sửa phòng
  const handleSaveRoom = async (values, fileList) => {
    try {
      let roomId = editingRoom?.idPhong;
      let isEdit = !!editingRoom;

      // Đảm bảo các trường bắt buộc
      const requiredFields = {
        tenPhong: values.tenPhong,
        idLoaiPhong: values.idLoaiPhong,
        giaPhong: values.giaPhong,
        trangThai: values.trangThai ?? 0, // Mặc định là trống
        soLuong: values.soLuong ?? 1,
        soNguoiLon: values.soNguoiLon ?? 1,
        soTreEm: values.soTreEm ?? 0,
        dienTich: values.dienTich ?? 0,
      };

      // Chuyển đổi % thành tiền
      const giamGiaAmount =
        convertPercentToAmount(values.giamGia, values.giaPhong) || 0;

      let body = {
        ...requiredFields,
        giamGia: giamGiaAmount,
        moTa: values.moTa || "",
        meta: values.meta || "",
      };

      // Xử lý ngày bắt đầu nếu có
      if (values.dateBegin) {
        body.dateBegin = dayjs(values.dateBegin).format("YYYY-MM-DDTHH:mm:ss");
      }

      // Thêm thuTuSapXep cho phòng mới
      if (!isEdit) {
        const maxOrder = Math.max(0, ...rooms.map((r) => r.thuTuSapXep || 0));
        body.thuTuSapXep = maxOrder + 1;
      }

      console.log("Request body:", body); // Để debug

      const res = await fetch(
        isEdit
          ? `https://quanlykhachsan-ozv3.onrender.com/api/Phong/${roomId}`
          : "https://quanlykhachsan-ozv3.onrender.com/api/Phong",
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi khi lưu phòng!");
      }

      // Lấy id phòng vừa tạo (nếu thêm mới)
      if (!isEdit) {
        const data = await res.json();
        roomId = data.idPhong || data.id || (data.data && data.data.idPhong);
      }

      // Nếu có file ảnh, upload lên server
      if (fileList && fileList.length && roomId) {
        try {
          setUploading(true);
          const formData = new FormData();
          formData.append("image", fileList[0].originFileObj);

          const uploadRes = await fetch(
            `https://quanlykhachsan-ozv3.onrender.com/api/Phong/${roomId}/upload-image`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!uploadRes.ok) {
            throw new Error("Upload failed");
          }

          const data = await uploadRes.json();
          // Lưu URL ảnh vào state
          setImageUrl(data.imageUrl);
        } catch (error) {
          message.error("Lỗi upload ảnh");
          console.error(error);
        } finally {
          setUploading(false);
        }
      }

      message.success(
        isEdit ? "Cập nhật phòng thành công!" : "Thêm phòng thành công!"
      );
      setModalOpen(false);
      setEditingRoom(null);
      setLoadingRooms(true);
      const newRooms = await fetchRooms();
      setRooms(newRooms);
      setLoadingRooms(false);
    } catch (error) {
      console.error("Save room error:", error);
      message.error(error.message || "Lỗi khi lưu phòng!");
    }
  };

  // Xoá phòng
  const handleDeleteRoom = (room) => {
    Modal.confirm({
      title: "Xác nhận xoá phòng?",
      content: `Bạn chắc chắn muốn xoá phòng ${room.tenPhong}?`,
      okText: "Xoá",
      okType: "danger",
      cancelText: "Huỷ",
      onOk: async () => {
        try {
          await fetch(
            `https://quanlykhachsan-ozv3.onrender.com/api/Phong/${room.idPhong}`,
            { method: "DELETE" }
          );
          message.success("Đã xoá phòng!");
          setLoadingRooms(true);
          fetchRooms().then((data) => {
            setRooms(data);
            setLoadingRooms(false);
          });
        } catch {
          message.error("Lỗi khi xoá phòng!");
        }
      },
    });
  };

  // Timeline xử lý
  const filteredBookings =
    timelineStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status === timelineStatus);

  // Lọc bookings theo tháng đã chọn
  const bookingsInMonth = filteredBookings.filter(
    (b) =>
      dayjs(b.startTime).isSame(timelineMonth, "month") ||
      dayjs(b.endTime).isSame(timelineMonth, "month") ||
      (dayjs(b.startTime).isBefore(timelineMonth.endOf("month")) &&
        dayjs(b.endTime).isAfter(timelineMonth.startOf("month")))
  );
  const timelineRooms = groupByRoom(bookingsInMonth);
  const days = getDateRange(bookingsInMonth, timelineMonth);

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Quản lý Phòng
      </Title>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Danh sách phòng",
            children: (
              <>
                <div
                  style={{
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Input.Search
                    placeholder="Tìm kiếm số phòng..."
                    style={{ width: 240 }}
                    allowClear
                    onSearch={async (value) => {
                      setLoadingRooms(true);
                      try {
                        const results = await searchRooms(value);
                        setRooms(results);
                      } catch (error) {
                        message.error(error.message);
                      } finally {
                        setLoadingRooms(false);
                      }
                    }}
                    loading={loadingRooms}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingRoom(null);
                      setModalOpen(true);
                    }}
                  >
                    Thêm phòng
                  </Button>
                </div>
                {errorRooms ? (
                  <div style={{ color: "red" }}>{errorRooms}</div>
                ) : (
                  <Table
                    columns={columns}
                    dataSource={rooms}
                    rowKey="idPhong"
                    loading={loadingRooms}
                    pagination={{ pageSize: 10 }}
                  />
                )}
                <RoomForm
                  open={modalOpen}
                  onCancel={() => {
                    setModalOpen(false);
                    setEditingRoom(null);
                  }}
                  onOk={handleSaveRoom}
                  initialValues={editingRoom}
                  roomTypes={roomTypes}
                />
              </>
            ),
          },
          {
            key: "2",
            label: "Timeline phòng",
            children: (
              <div>
                <div
                  style={{
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>Lọc trạng thái:</span>
                  <Select
                    value={timelineStatus}
                    onChange={setTimelineStatus}
                    style={{ width: 160 }}
                  >
                    <Select.Option value="all">Tất cả</Select.Option>
                    <Select.Option value="booked">Đã đặt</Select.Option>
                    <Select.Option value="staying">Đang ở</Select.Option>
                    <Select.Option value="done">Đã trả</Select.Option>
                    <Select.Option value="cancelled">Đã huỷ</Select.Option>
                  </Select>
                  <DatePicker
                    picker="month"
                    value={timelineMonth}
                    onChange={setTimelineMonth}
                    allowClear={false}
                    style={{ width: 140 }}
                    format="MM/YYYY"
                    placeholder="Chọn tháng"
                  />
                </div>
                {errorBookings ? (
                  <div style={{ color: "red" }}>{errorBookings}</div>
                ) : loadingBookings ? (
                  <Skeleton active paragraph={{ rows: 6 }} />
                ) : !bookings.length ? (
                  <div>Không có dữ liệu đặt phòng.</div>
                ) : !bookingsInMonth.length ? (
                  <div>Không có dữ liệu đặt phòng trong tháng này.</div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: `160px repeat(${days.length}, 80px)`,
                        alignItems: "center",
                        borderBottom: "1px solid #eee",
                        fontWeight: "bold",
                        background: "#f0f2f5",
                        minWidth: 320,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      <div
                        style={{
                          background: "#fff",
                          position: "sticky",
                          left: 0,
                          zIndex: 11,
                          borderRight: "1px solid #eee",
                        }}
                      >
                        Phòng
                      </div>
                      {days.map((d, i) => (
                        <div
                          key={i}
                          style={{
                            textAlign: "center",
                            fontSize: 13,
                            background: i % 2 === 0 ? "#fafafa" : "#f5f5f5",
                            borderRight: "1px solid #f0f0f0",
                          }}
                        >
                          {d.toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </div>
                      ))}
                    </div>
                    {Object.entries(timelineRooms).map(
                      ([room, bookings], rowIdx) => (
                        <div
                          key={room}
                          style={{
                            display: "grid",
                            gridTemplateColumns: `160px repeat(${days.length}, 80px)`,
                            alignItems: "center",
                            minHeight: 48,
                            borderBottom: "1px solid #eee",
                            position: "relative",
                            background: rowIdx % 2 === 0 ? "#fff" : "#f9f9f9",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 500,
                              background: "#fff",
                              position: "sticky",
                              left: 0,
                              zIndex: 9,
                              borderRight: "1px solid #eee",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              paddingLeft: 8,
                            }}
                          >
                            {room}
                          </div>
                          <div
                            style={{
                              gridColumn: `2 / span ${days.length}`,
                              position: "relative",
                              height: 40,
                            }}
                          >
                            {bookings.map((b, idx) => {
                              const startIdx = days.findIndex(
                                (d) =>
                                  d.toDateString() ===
                                  new Date(b.startTime).toDateString()
                              );
                              const endIdx = days.findIndex(
                                (d) =>
                                  d.toDateString() ===
                                  new Date(b.endTime).toDateString()
                              );
                              if (startIdx === -1 || endIdx === -1) return null;
                              const colSpan = endIdx - startIdx + 1;
                              const startTime = new Date(b.startTime);
                              const endTime = new Date(b.endTime);
                              return (
                                <Tooltip
                                  key={idx}
                                  title={
                                    <div>
                                      <div>
                                        <b>Phòng:</b> {b.roomNumber}
                                      </div>
                                      <div>
                                        <b>Khách:</b> {b.customerName}
                                      </div>
                                      <div>
                                        <b>Nhận:</b>{" "}
                                        {startTime.toLocaleString("vi-VN")}
                                      </div>
                                      <div>
                                        <b>Trả:</b>{" "}
                                        {endTime.toLocaleString("vi-VN")}
                                      </div>
                                      {b.note && (
                                        <div>
                                          <b>Ghi chú:</b> {b.note}
                                        </div>
                                      )}
                                      <div>
                                        <Badge
                                          color={TIMELINE_STATUS[b.status]}
                                          text={
                                            b.status === "booked"
                                              ? "Đã đặt"
                                              : b.status === "staying"
                                              ? "Đang ở"
                                              : b.status === "done"
                                              ? "Đã trả"
                                              : "Đã huỷ"
                                          }
                                        />
                                      </div>
                                    </div>
                                  }
                                  placement="top"
                                  overlayStyle={{ maxWidth: 320 }}
                                >
                                  <div
                                    style={{
                                      position: "absolute",
                                      left: `${startIdx * 80}px`,
                                      width: `${colSpan * 80 - 8}px`,
                                      height: 36,
                                      background:
                                        TIMELINE_STATUS[b.status] || "#ccc",
                                      color: "#222",
                                      borderRadius: 8,
                                      padding: "4px 10px",
                                      boxShadow: "0 2px 8px #0002",
                                      cursor: "pointer",
                                      top: 2,
                                      overflow: "hidden",
                                      whiteSpace: "nowrap",
                                      textOverflow: "ellipsis",
                                      fontSize: 13,
                                      border: "2px solid #fff",
                                      zIndex: 2,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      transition:
                                        "box-shadow .2s, transform .2s",
                                      fontWeight: 500,
                                    }}
                                    onMouseOver={(e) =>
                                      (e.currentTarget.style.boxShadow =
                                        "0 4px 16px #0003")
                                    }
                                    onMouseOut={(e) =>
                                      (e.currentTarget.style.boxShadow =
                                        "0 2px 8px #0002")
                                    }
                                  >
                                    <Badge
                                      color={TIMELINE_STATUS[b.status]}
                                      style={{ marginRight: 6 }}
                                      status="processing"
                                    />
                                    <span
                                      style={{
                                        flex: 1,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {b.customerName}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 11,
                                        color: "#555",
                                        marginLeft: 8,
                                      }}
                                    >
                                      {startTime.toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}{" "}
                                      -{" "}
                                      {endTime.toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                    <div
                      style={{
                        marginTop: 16,
                        fontSize: 13,
                        display: "flex",
                        gap: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      <span>
                        <span style={{ color: "#1890ff" }}>■</span> Đã đặt
                      </span>
                      <span>
                        <span style={{ color: "#faad14" }}>■</span> Đang ở
                      </span>
                      <span>
                        <span style={{ color: "#d9d9d9" }}>■</span> Đã trả
                      </span>
                      <span>
                        <span style={{ color: "#ff4d4f" }}>■</span> Đã huỷ
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
      {/* Modal hiển thị chi tiết phòng */}
      <Modal
        open={detailModalOpen}
        title={`Chi tiết phòng ${detailRoom?.tenPhong || ""}`}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        {detailRoom ? (
          <div>
            <div
              style={{
                position: "relative",
                minHeight: 240,
                background: "#f5f5f5",
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              {detailRoom.hinhAnh ? (
                <img
                  src={`https://quanlykhachsan-ozv3.onrender.com${detailRoom.hinhAnh}`}
                  alt="Hình phòng"
                  style={{
                    width: "100%",
                    height: 240,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                style={{
                  display: detailRoom.hinhAnh ? "none" : "flex",
                  width: "100%",
                  height: 240,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  color: "#999",
                  background: "#f5f5f5",
                  borderRadius: 8,
                }}
              >
                <PictureOutlined style={{ fontSize: 48, marginBottom: 8 }} />
                <span>Không có hình ảnh</span>
              </div>
              {uploading && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(255,255,255,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Spin tip="Đang tải ảnh..." />
                </div>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <h3
                  style={{
                    marginBottom: 16,
                    borderBottom: "1px solid #f0f0f0",
                    paddingBottom: 8,
                  }}
                >
                  Thông tin cơ bản
                </h3>
                <div style={{ marginBottom: 8 }}>
                  <b>Số phòng:</b> {detailRoom.tenPhong}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Loại phòng:</b>{" "}
                  {
                    roomTypes.find((rt) => rt.value === detailRoom.idLoaiPhong)
                      ?.label
                  }
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Giá gốc:</b>{" "}
                  {detailRoom.giaPhong?.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </div>
                {detailRoom.giamGia > 0 && (
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <b>Giảm giá:</b>{" "}
                      {convertAmountToPercent(
                        detailRoom.giamGia,
                        detailRoom.giaPhong
                      )}
                      % (
                      {detailRoom.giamGia?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                      )
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <b>Giá cuối:</b>{" "}
                      {(
                        detailRoom.giaPhong - detailRoom.giamGia
                      )?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </div>
                  </>
                )}
                <div style={{ marginBottom: 8 }}>
                  <b>Trạng thái:</b>{" "}
                  <Tag color={STATUS_MAP[detailRoom.trangThai]?.color}>
                    {STATUS_MAP[detailRoom.trangThai]?.label}
                  </Tag>
                </div>
              </div>

              <div>
                <h3
                  style={{
                    marginBottom: 16,
                    borderBottom: "1px solid #f0f0f0",
                    paddingBottom: 8,
                  }}
                >
                  Chi tiết phòng
                </h3>
                <div style={{ marginBottom: 8 }}>
                  <b>Số lượng:</b> {detailRoom.soLuong}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Số người lớn:</b> {detailRoom.soNguoiLon}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Số trẻ em:</b> {detailRoom.soTreEm}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Diện tích:</b> {detailRoom.dienTich} m²
                </div>
                {/* <div style={{ marginBottom: 8 }}><b>Thứ tự sắp xếp:</b> {detailRoom.thuTuSapXep}</div> */}
                {detailRoom.dateBegin && (
                  <div style={{ marginBottom: 8 }}>
                    <b>Ngày bắt đầu:</b>{" "}
                    {dayjs(detailRoom.dateBegin).format("DD/MM/YYYY HH:mm")}
                  </div>
                )}
              </div>
            </div>

            {detailRoom.moTa && (
              <div style={{ marginTop: 16 }}>
                <h3
                  style={{
                    marginBottom: 16,
                    borderBottom: "1px solid #f0f0f0",
                    paddingBottom: 8,
                  }}
                >
                  Mô tả
                </h3>
                <div style={{ whiteSpace: "pre-line" }}>{detailRoom.moTa}</div>
              </div>
            )}

            {detailRoom.meta && (
              <div style={{ marginTop: 16 }}>
                <h3
                  style={{
                    marginBottom: 16,
                    borderBottom: "1px solid #f0f0f0",
                    paddingBottom: 8,
                  }}
                >
                  Thông tin thêm
                </h3>
                <div>{detailRoom.meta}</div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Phong;
