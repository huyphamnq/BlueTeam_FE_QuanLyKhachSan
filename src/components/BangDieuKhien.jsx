import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Table, Typography, List, Spin } from "antd";
import {
  AiOutlineHome,
  AiOutlineCheckCircle,
  AiOutlineDollarCircle,
  AiOutlineCalendar,
} from "react-icons/ai";
import { Pie, Column } from "@ant-design/charts";
import "antd/dist/reset.css";
import "../assets/css/base.css";

const { Title } = Typography;

const DashboardStatsCards = ({ stats, loading }) => (
  <Row gutter={[16, 16]}>
    <Col xs={12} md={6}>
      <Card bordered style={{ borderRadius: 12, background: "#f6faff" }}>
        <Statistic
          title={
            <span>
              <AiOutlineHome style={{ color: "#1890ff", marginRight: 8 }} />
              Tổng số phòng
            </span>
          }
          value={stats.totalRooms}
          loading={loading}
        />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card bordered style={{ borderRadius: 12, background: "#f9f6ff" }}>
        <Statistic
          title={
            <span>
              <AiOutlineCheckCircle
                style={{ color: "#52c41a", marginRight: 8 }}
              />
              Phòng đang sử dụng
            </span>
          }
          value={stats.roomsInUse}
          loading={loading}
        />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card bordered style={{ borderRadius: 12, background: "#fffaf6" }}>
        <Statistic
          title={
            <span>
              <AiOutlineDollarCircle
                style={{ color: "#faad14", marginRight: 8 }}
              />
              Doanh thu hôm nay
            </span>
          }
          value={stats.todayRevenue?.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
          loading={loading}
        />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card bordered style={{ borderRadius: 12, background: "#f6fff9" }}>
        <Statistic
          title={
            <span>
              <AiOutlineCalendar style={{ color: "#13c2c2", marginRight: 8 }} />
              Lượt đặt phòng hôm nay
            </span>
          }
          value={stats.todayBookings}
          loading={loading}
        />
      </Card>
    </Col>
  </Row>
);

const RevenueChart = ({ data, loading }) => (
  <Card
    title="Doanh thu theo ngày trong tuần"
    style={{ marginTop: 24, borderRadius: 12 }}
  >
    {loading ? (
      <Spin />
    ) : (
      <Column
        data={data}
        xField="date"
        yField="revenue"
        color="#1890ff"
        height={220}
        autoFit
        tooltip={{
          formatter: (d) => ({
            name: "Doanh thu",
            value: d.revenue.toLocaleString("vi-VN") + " ₫",
          }),
        }}
      />
    )}
  </Card>
);

const RoomUsagePie = ({ data, loading }) => (
  <Card
    title="Tỉ lệ loại phòng đang được đặt"
    style={{ marginTop: 24, borderRadius: 12 }}
  >
    {loading ? (
      <Spin />
    ) : (
      <Pie
        data={data}
        angleField="value"
        colorField="type"
        radius={0.9}
        label={{
          type: "outer",
          content: (datum) => `${datum.type}: ${datum.value} phòng`,
        }}
        legend={{ position: "bottom" }}
        autoFit
      />
    )}
  </Card>
);

const ActiveBookingsTable = ({ data, loading }) => {
  const columns = [
    {
      title: "Số phòng",
      dataIndex: "roomNumber",
      key: "roomNumber",
      width: 90,
    },
    {
      title: "Tên khách",
      dataIndex: "guestName",
      key: "guestName",
      width: 140,
    },
    { title: "Ngày nhận", dataIndex: "checkIn", key: "checkIn", width: 110 },
    { title: "Ngày trả", dataIndex: "checkOut", key: "checkOut", width: 110 },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status) => {
        let color = "#52c41a";
        if (status === "Sắp trả") color = "#faad14";
        if (status === "Quá hạn") color = "#ff4d4f";
        return <span style={{ color, fontWeight: 500 }}>{status}</span>;
      },
    },
  ];
  return (
    <Card
      title="Phòng đang có khách / sắp trả"
      style={{ marginTop: 24, borderRadius: 12 }}
    >
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        size="small"
        scroll={{ x: 600 }}
        rowKey="id"
        pagination={false}
      />
    </Card>
  );
};

const TopServicesList = ({ data, loading }) => (
  <Card
    title="Dịch vụ được sử dụng nhiều nhất"
    style={{ marginTop: 24, borderRadius: 12 }}
  >
    <List
      loading={loading}
      dataSource={data}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            title={item.name}
            description={`Lượt dùng: ${
              item.usageCount
            } | Doanh thu: ${item.revenue.toLocaleString("vi-VN")} ₫`}
          />
        </List.Item>
      )}
    />
  </Card>
);

const BangDieuKhien = () => {
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [roomPieData, setRoomPieData] = useState([]);
  const [pieLoading, setPieLoading] = useState(true);
  const [activeBookings, setActiveBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [topServices, setTopServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  useEffect(() => {
    setStatsLoading(true);
    setRevenueLoading(true);

    Promise.all([
      fetch(
        "https://quanlykhachsan-ozv3.onrender.com/api/Phong/filter?pageNumber=1&pageSize=1000"
      ).then((res) => res.json()),
      fetch("https://quanlykhachsan-ozv3.onrender.com/api/HoaDon/list").then(
        (res) => res.json()
      ),
    ])
      .then(([roomsData, invoices]) => {
        const rooms = Array.isArray(roomsData)
          ? roomsData
          : roomsData.items || roomsData.data || [];
        const today = new Date();
        const todayInvoices = (invoices || []).filter((inv) => {
          const created = new Date(inv.dateBegin || inv.ngayTao || inv.ngayVao);
          return (
            created.getDate() === today.getDate() &&
            created.getMonth() === today.getMonth() &&
            created.getFullYear() === today.getFullYear()
          );
        });
        const todayRevenue = todayInvoices.reduce(
          (sum, inv) => sum + (inv.tongTien || 0),
          0
        );
        const todayBookings = todayInvoices.length;

        setStats((s) => ({
          ...s,
          totalRooms: rooms.length,
          roomsInUse: rooms.filter((r) => r.trangThai === 2).length,
          todayBookings,
          todayRevenue,
        }));

        const days = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          days.push(d);
        }
        const revenueByDay = days.map((d) => {
          const dayInvoices = (invoices || []).filter((inv) => {
            const created = new Date(
              inv.dateBegin || inv.ngayTao || inv.ngayVao
            );
            return (
              created.getDate() === d.getDate() &&
              created.getMonth() === d.getMonth() &&
              created.getFullYear() === d.getFullYear()
            );
          });
          return {
            date: d.toLocaleDateString("vi-VN"),
            revenue: dayInvoices.reduce(
              (sum, inv) => sum + (inv.tongTien || 0),
              0
            ),
          };
        });
        setRevenueData(revenueByDay);
        setRevenueLoading(false);
        setStatsLoading(false);
      })
      .catch((err) => {
        setStatsLoading(false);
        setRevenueLoading(false);
        console.error("Error fetching dashboard data:", err);
      });

    setPieLoading(true);
    Promise.all([
      fetch(
        "https://quanlykhachsan-ozv3.onrender.com/api/Phong/filter?pageNumber=1&pageSize=1000"
      ).then((res) => res.json()),
      fetch("https://quanlykhachsan-ozv3.onrender.com/api/LoaiPhong").then(
        (res) => res.json()
      ),
    ])
      .then(([roomsData, typesData]) => {
        const rooms = Array.isArray(roomsData)
          ? roomsData
          : roomsData.items || roomsData.data || [];
        const types = Array.isArray(typesData)
          ? typesData
          : typesData.items || typesData.data || [];
        const pie = types
          .map((t) => ({
            type: t.tenLoaiPhong,
            value: rooms.filter(
              (r) => r.idLoaiPhong === t.idLoaiPhong && r.trangThai === 2
            ).length,
          }))
          .filter((item) => item.value > 0);
        setRoomPieData(pie);
        setPieLoading(false);
      })
      .catch((err) => {
        setPieLoading(false);
        console.error("Error fetching pie chart data:", err);
      });

    setBookingsLoading(true);
    fetch(
      "https://quanlykhachsan-ozv3.onrender.com/api/PhieuDatPhong?pageNumber=1&pageSize=1000"
    )
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        const bookings = data.items || data.data || [];
        const now = new Date();
        const active = bookings.filter(
          (b) =>
            b.tinhTrangDatPhong === 2 ||
            (b.tinhTrangDatPhong === 1 && new Date(b.ngayRa) > now)
        );
        setActiveBookings(
          active.map((b, idx) => ({
            id: b.idPhieuDatPhong || idx,
            roomNumber: b.tenPhong,
            guestName: b.tenKhachHang,
            checkIn: b.ngayVao
              ? new Date(b.ngayVao).toLocaleDateString("vi-VN")
              : "",
            checkOut: b.ngayRa
              ? new Date(b.ngayRa).toLocaleDateString("vi-VN")
              : "",
            status:
              b.tinhTrangDatPhong === 2
                ? "Đang ở"
                : new Date(b.ngayRa) < now
                ? "Quá hạn"
                : "Sắp trả",
          }))
        );
        setBookingsLoading(false);
      })
      .catch((err) => {
        setBookingsLoading(false);
        console.error("Error fetching active bookings:", err);
      });

    setServicesLoading(true);
    fetch("https://quanlykhachsan-ozv3.onrender.com/api/DichVu")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        const services = Array.isArray(data)
          ? data
          : data.items || data.data || [];
        setTopServices(
          services.slice(0, 5).map((s) => ({
            name: s.tenDichVu,
            usageCount: Math.floor(Math.random() * 100),
            revenue: Math.floor(Math.random() * 10000000),
          }))
        );
        setServicesLoading(false);
      })
      .catch((err) => {
        setServicesLoading(false);
        console.error("Error fetching top services:", err);
      });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Bảng điều khiển
      </Title>
      <DashboardStatsCards stats={stats} loading={statsLoading} />
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={16}>
          <RevenueChart data={revenueData} loading={revenueLoading} />
        </Col>
        <Col xs={24} md={8}>
          <RoomUsagePie data={roomPieData} loading={pieLoading} />
        </Col>
      </Row>
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={16}>
          <ActiveBookingsTable
            data={activeBookings}
            loading={bookingsLoading}
          />
        </Col>
        <Col xs={24} md={8}>
          <TopServicesList data={topServices} loading={servicesLoading} />
        </Col>
      </Row>
    </div>
  );
};

export default BangDieuKhien;
