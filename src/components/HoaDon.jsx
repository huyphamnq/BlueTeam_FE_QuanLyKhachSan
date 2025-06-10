import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Tag,
  Button,
  Tooltip,
  Modal,
  Descriptions,
  Divider,
  Input,
  DatePicker,
  Space,
  message,
  QRCode,
} from "antd";
import {
  EyeOutlined,
  DollarCircleOutlined,
  ReloadOutlined,
  PrinterOutlined,
  FilePdfOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import locale from "antd/es/date-picker/locale/vi_VN";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../assets/fonts/Roboto-Regular-normal.js";

import "../assets/css/base.css";

// StatusTag component
const StatusTag = ({ paid }) =>
  paid ? (
    <Tag color="green" icon={<AiOutlineCheckCircle />}>
      Đã thanh toán
    </Tag>
  ) : (
    <Tag color="red" icon={<AiOutlineCloseCircle />}>
      Chưa thanh toán
    </Tag>
  );

// Modal chi tiết hóa đơn
const InvoiceDetailModal = ({
  open,
  onCancel,
  invoice,
  loading,
  onManualPay,
  confirming,
  customer,
  roomType,
  staff,
}) => {
  if (!invoice) return null;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("Roboto-Regular-normal");
    doc.setFontSize(16);
    doc.text(
      `HÓA ĐƠN #INV${String(invoice.idHoaDon).padStart(3, "0")}`,
      14,
      18
    );

    doc.autoTable({
      startY: 28,
      theme: "grid",
      styles: { font: "Roboto-Regular-normal", fontSize: 12 },
      head: [],
      body: [
        ["Ma hoa don", `INV${String(invoice.idHoaDon).padStart(3, "0")}`],
        ["Khach hang", customer ? customer.hoTen : invoice.tenKhachHang],
        ["Email", invoice.email || "—"],
        ["SDT", invoice.sdt || "—"],
        ["Ten phong", invoice.tenPhong],
        [
          "Gia phong",
          invoice.giaPhong
            ? invoice.giaPhong.toLocaleString("vi-VN") + " đ"
            : "—",
        ],
        [
          "Nhan vien phu trach",
          staff ? staff.hoTen : invoice.tenNhanVien || "—",
        ],
        [
          "Ngày nhan - tra",
          `${dayjs(invoice.ngayVao).format("DD/MM/YYYY")} - ${dayjs(
            invoice.ngayRa
          ).format("DD/MM/YYYY")}`,
        ],
        [
          "Tien dich vu",
          invoice.tienDichVu
            ? invoice.tienDichVu.toLocaleString("vi-VN") + " đ"
            : "—",
        ],
        [
          "Tong cong",
          invoice.tongTien
            ? invoice.tongTien.toLocaleString("vi-VN") + " đ"
            : "—",
        ],
        ["Trang thai", "Da thanh toan"],
        [
          "Ngay tao hoa don",
          invoice.dateBegin
            ? dayjs(invoice.dateBegin).format("DD/MM/YYYY HH:mm")
            : "—",
        ],
      ],
      styles: { cellPadding: 2, fontSize: 12, font: "times" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { cellWidth: 120 },
      },
    });

    doc.save(`HoaDon_INV${String(invoice.idHoaDon).padStart(3, "0")}.pdf`);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={`Chi tiết hóa đơn #INV${String(invoice.idHoaDon).padStart(
        3,
        "0"
      )}`}
      footer={null}
      width={600}
      centered
    >
      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ width: 160, fontWeight: 500 }}
        contentStyle={{ fontWeight: 400 }}
      >
        <Descriptions.Item label="Mã hóa đơn">
          INV{String(invoice.idHoaDon).padStart(3, "0")}
        </Descriptions.Item>
        <Descriptions.Item label="Khách hàng">
          {customer ? (
            <>
              {customer.hoTen}{" "}
              {customer.sdt && (
                <span style={{ color: "#888", marginLeft: 8 }}>
                  | {customer.sdt}
                </span>
              )}
              {customer.cccd && (
                <span style={{ color: "#888", marginLeft: 8 }}>
                  | CCCD: {customer.cccd}
                </span>
              )}
            </>
          ) : (
            invoice.tenKhachHang
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {invoice.email || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="SĐT">{invoice.sdt || "—"}</Descriptions.Item>
        <Descriptions.Item label="Tên phòng">
          {invoice.tenPhong}
        </Descriptions.Item>
        <Descriptions.Item label="Giá phòng">
          {invoice.giaPhong
            ? invoice.giaPhong.toLocaleString("vi-VN") + " đ"
            : "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Nhân viên phụ trách">
          {staff ? staff.hoTen : invoice.tenNhanVien || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày nhận - trả">
          {dayjs(invoice.ngayVao).format("DD/MM/YYYY")} -{" "}
          {dayjs(invoice.ngayRa).format("DD/MM/YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Tiền dịch vụ">
          {invoice.tienDichVu
            ? invoice.tienDichVu.toLocaleString("vi-VN") + " đ"
            : "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng cộng">
          <span style={{ fontWeight: 600, color: "#1677ff", fontSize: 16 }}>
            {invoice.tongTien
              ? invoice.tongTien.toLocaleString("vi-VN") + " đ"
              : "—"}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <StatusTag paid={true} />
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo hóa đơn">
          {invoice.dateBegin
            ? dayjs(invoice.dateBegin).format("DD/MM/YYYY HH:mm")
            : "—"}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button icon={<PrinterOutlined />}>In hóa đơn</Button>
        <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>
          Xuất PDF
        </Button>
      </div>
    </Modal>
  );
};

// Table hóa đơn
const InvoiceTable = ({
  data,
  loading,
  onView,
  onManualPay,
  filterStatus,
  setFilterStatus,
  filterDate,
  setFilterDate,
  search,
  setSearch,
}) => {
  const columns = [
    {
      title: "Mã hóa đơn",
      dataIndex: "idHoaDon",
      key: "idHoaDon",
      width: 110,
      render: (id) => <b>INV{String(id).padStart(3, "0")}</b>,
      sorter: (a, b) => a.idHoaDon - b.idHoaDon,
    },
    {
      title: "Khách hàng",
      dataIndex: "tenKhachHang",
      key: "tenKhachHang",
      width: 180,
      render: (text) =>
        text && text.length > 18 ? (
          <Tooltip title={text}>{text.slice(0, 18)}...</Tooltip>
        ) : (
          text
        ),
    },
    {
      title: "Số phòng",
      dataIndex: "tenPhong",
      key: "tenPhong",
      width: 90,
    },
    {
      title: "Ngày nhận – trả",
      key: "ngayVao",
      width: 180,
      render: (_, r) =>
        `${dayjs(r.ngayVao).format("DD/MM/YYYY")} - ${dayjs(r.ngayRa).format(
          "DD/MM/YYYY"
        )}`,
    },
    {
      title: "Tổng tiền",
      dataIndex: "tongTien",
      key: "tongTien",
      width: 130,
      align: "right",
      render: (v) => (
        <span style={{ fontWeight: 500, color: "#1677ff" }}>
          {v ? v.toLocaleString("vi-VN") + " đ" : "—"}
        </span>
      ),
      sorter: (a, b) => a.tongTien - b.tongTien,
    },
    {
      title: "Trạng thái",
      key: "trangThaiThanhToan",
      width: 120,
      render: () => <StatusTag paid={true} />,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 130,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onView(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
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
          placeholder="Tìm kiếm khách, phòng, mã hóa đơn..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 240 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <DatePicker.RangePicker
          locale={locale}
          style={{ width: 260 }}
          value={filterDate}
          onChange={setFilterDate}
          format="DD/MM/YYYY"
          allowClear
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setSearch("");
            setFilterStatus(undefined);
            setFilterDate([]);
          }}
        >
          Làm mới
        </Button>
        <div style={{ flex: 1 }} />
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="idHoaDon"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 900 }}
        bordered
        size="middle"
      />
    </div>
  );
};

// Main page
const HoaDon = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState({ open: false, invoice: null });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState();
  const [filterDate, setFilterDate] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [roomType, setRoomType] = useState(null);
  const [staff, setStaff] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://quanlykhachsan-ozv3.onrender.com/api/HoaDon/list"
      );
      const data = await res.json();
      setInvoices(data || []);
    } catch (e) {
      message.error("Không thể tải danh sách hóa đơn!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredData = useMemo(() => {
    let d = invoices;
    if (search) {
      const s = search.toLowerCase();
      d = d.filter(
        (i) =>
          String(i.idHoaDon).includes(s) ||
          (i.tenKhachHang && i.tenKhachHang.toLowerCase().includes(s)) ||
          (i.tenPhong && i.tenPhong.toLowerCase().includes(s))
      );
    }
    if (filterStatus !== undefined) {
      d = d.filter((i) => i.trangThaiThanhToan === filterStatus);
    }
    if (filterDate && filterDate.length === 2) {
      const [start, end] = filterDate;
      d = d.filter((i) => {
        const ngay = dayjs(i.ngayVao);
        return (
          ngay.isSameOrAfter(start, "day") && ngay.isSameOrBefore(end, "day")
        );
      });
    }
    return d;
  }, [invoices, search, filterStatus, filterDate]);

  const handleView = (record) => {
    setDetail({ open: true, invoice: record });
  };

  const handleManualPay = async (record) => {
    Modal.confirm({
      title: "Xác nhận thanh toán thủ công?",
      content: (
        <div>
          Xác nhận khách đã thanh toán hóa đơn{" "}
          <b>INV{String(record.idHoaDon).padStart(3, "0")}</b>?
        </div>
      ),
      okText: "Xác nhận",
      cancelText: "Huỷ",
      onOk: async () => {
        setConfirming(true);
        try {
          await fetch(
            `https://quanlykhachsan-ozv3.onrender.com/api/HoaDon/mark-paid/${record.idHoaDon}`,
            { method: "POST" }
          );
          message.success("Đã xác nhận thanh toán!");
          fetchInvoices();
          setDetail((d) =>
            d.invoice && d.invoice.idHoaDon === record.idHoaDon
              ? { ...d, invoice: { ...d.invoice, daThanhToan: true } }
              : d
          );
        } catch {
          message.error("Lỗi xác nhận thanh toán!");
        }
        setConfirming(false);
      },
    });
  };

  useEffect(() => {
    if (detail.open && detail.invoice) {
      fetch(
        `https://quanlykhachsan-ozv3.onrender.com/api/HoaDon/${detail.invoice.idHoaDon}`
      )
        .then((res) => res.json())
        .then(setInvoiceDetail)
        .catch(() => setInvoiceDetail(null));
      if (detail.invoice.idKhachHang) {
        fetch(
          `https://quanlykhachsan-ozv3.onrender.com/api/KhachHang/${detail.invoice.idKhachHang}`
        )
          .then((res) => res.json())
          .then(setCustomer)
          .catch(() => setCustomer(null));
      } else {
        setCustomer(null);
      }
      if (detail.invoice.idLoaiPhong) {
        fetch(`https://quanlykhachsan-ozv3.onrender.com/api/LoaiPhong`)
          .then((res) => res.json())
          .then((data) => {
            const found = (data || []).find(
              (t) => t.idLoaiPhong === detail.invoice.idLoaiPhong
            );
            setRoomType(found || null);
          })
          .catch(() => setRoomType(null));
      } else {
        setRoomType(null);
      }
      if (detail.invoice.idNhanVien) {
        fetch(
          `https://quanlykhachsan-ozv3.onrender.com/api/NhanVien/${detail.invoice.idNhanVien}`
        )
          .then((res) => res.json())
          .then(setStaff)
          .catch(() => setStaff(null));
      } else {
        setStaff(null);
      }
    }
  }, [detail.open, detail.invoice]);

  return (
    <div
      style={{
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontWeight: 700,
            marginBottom: 24,
            fontSize: 32,
          }}
        >
          Quản lý hóa đơn
        </h2>
        <InvoiceTable
          data={filteredData}
          loading={loading}
          onView={handleView}
          onManualPay={handleManualPay}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          search={search}
          setSearch={setSearch}
        />
        <InvoiceDetailModal
          open={detail.open}
          onCancel={() => setDetail({ open: false, invoice: null })}
          invoice={invoiceDetail || detail.invoice}
          loading={loading}
          onManualPay={() => handleManualPay(detail.invoice)}
          confirming={confirming}
          customer={customer}
          roomType={roomType}
          staff={staff}
        />
      </div>
    </div>
  );
};

export default HoaDon;
