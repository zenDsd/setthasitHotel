import { useState } from "react"
import { Room, RoomStatus, BookingRecord } from "@/types"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ADD_ON_ITEMS } from "@/data/mockData"
import { formatThaiBaht } from "@/lib/utils"
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wrench,
  Clock,
  Moon,
  Plus,
  ShoppingBag,
  Check,
  Search,
  Eye,
  CreditCard,
  Banknote,
  TrendingUp,
  RotateCw,
  LogOut,
  BedDouble,
  Receipt,
  Truck,
  Car,
  Phone,
  User,
  ArrowRight,
  Home,
  RotateCcw,
} from "lucide-react"

interface AdminRackProps {
  rooms: Room[]
  bookings: BookingRecord[]
  onUpdateRoomStatus: (roomId: string, newStatus: RoomStatus, bookingDetails?: any) => void
  onUpdateBookingStatus: (bookingId: string, updates: Partial<BookingRecord>) => void
  onExtendHourlyStay: (roomId: string, extraHours: number) => void
  onLogout: () => void
  onBackToHome?: () => void
  onResetAllBookings?: () => void
}

export function AdminRack({
  rooms,
  bookings,
  onUpdateRoomStatus,
  onUpdateBookingStatus,
  onExtendHourlyStay,
  onLogout,
  onBackToHome,
  onResetAllBookings,
}: AdminRackProps) {
  const [activeTab, setActiveTab] = useState<"rack" | "bookings" | "addons" | "finance">("rack")

  // Filter for Room Rack
  const [activeRackFilter, setActiveRackFilter] = useState<"all" | "hourly" | "daily">("all")

  // Walk-in modal state
  const [selectedRoomForWalkIn, setSelectedRoomForWalkIn] = useState<Room | null>(null)
  const [walkInName, setWalkInName] = useState("")
  const [walkInPhone, setWalkInPhone] = useState("")
  const [walkInPlate, setWalkInPlate] = useState("")
  const [walkInPayment, setWalkInPayment] = useState<"promptpay" | "cash">("cash")

  // Search & filter for Bookings tab
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")

  // Slip viewer modal state
  const [viewingSlip, setViewingSlip] = useState<BookingRecord | null>(null)

  // Add-ons filter tab
  const [addonFilter, setAddonFilter] = useState<"all" | "pending" | "delivered">("all")

  // Room statistics
  const totalAvailable = rooms.filter((r) => r.status === "available").length
  const totalOccupied = rooms.filter((r) => r.status === "occupied").length
  const totalCleaning = rooms.filter((r) => r.status === "cleaning").length

  // Finance calculations
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  const hourlyRevenue = bookings
    .filter((b) => b.roomType === "hourly")
    .reduce((sum, b) => sum + (b.roomPrice || 0), 0)
  const dailyRevenue = bookings
    .filter((b) => b.roomType === "daily")
    .reduce((sum, b) => sum + (b.roomPrice || 0), 0)
  const addOnsRevenue = bookings.reduce((sum, b) => sum + (b.addOnsPrice || 0), 0)

  const promptPayTotal = bookings
    .filter((b) => b.paymentMethod === "promptpay")
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  const cashTotal = bookings
    .filter((b) => b.paymentMethod === "cash")
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0)

  // Handle Walk-in submit
  const handleWalkInSubmit = () => {
    if (!selectedRoomForWalkIn) return

    const now = new Date()
    const checkInTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    let checkOutTime = ""

    if (selectedRoomForWalkIn.type === "hourly") {
      const outH = (now.getHours() + 3) % 24
      checkOutTime = `${outH.toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} น.`
    } else {
      checkOutTime = "วันถัดไป ก่อน 12:00 น."
    }

    const bookingCode = "WK-" + Math.floor(100000 + Math.random() * 900000)

    onUpdateRoomStatus(selectedRoomForWalkIn.id, "occupied", {
      bookingCode,
      guestName: walkInName || "ลูกค้า Walk-in",
      guestPhone: walkInPhone || "-",
      plateNumber: walkInPlate || "-",
      checkInTime,
      checkOutTime,
      remainingMinutes: selectedRoomForWalkIn.type === "hourly" ? 180 : undefined,
      paymentMethod: walkInPayment,
      paymentStatus: walkInPayment === "promptpay" ? "paid" : "cash_on_arrival",
    })

    setSelectedRoomForWalkIn(null)
    setWalkInName("")
    setWalkInPhone("")
    setWalkInPlate("")
  }

  // Filtered rooms for Tab 1
  const filteredRooms = rooms.filter((room) => {
    if (activeRackFilter === "all") return true
    return room.type === activeRackFilter
  })

  // Filtered bookings for Tab 2
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guestPhone.includes(searchQuery) ||
      b.roomNumber.includes(searchQuery) ||
      (b.licensePlate && b.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesPayment =
      paymentFilter === "all" || b.paymentStatus === paymentFilter

    return matchesSearch && matchesPayment
  })

  // Filtered add-on requests for Tab 3
  const bookingsWithAddOns = bookings.filter((b) => b.selectedAddOns && b.selectedAddOns.length > 0)
  const filteredAddOnBookings = bookingsWithAddOns.filter((b) => {
    if (addonFilter === "all") return true
    return b.deliveryStatus === addonFilter
  })

  const pendingDeliveriesCount = bookingsWithAddOns.filter((b) => b.deliveryStatus === "pending").length

  return (
    <div className="space-y-6">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Admin Control Panel • เข้าสู่ระบบในฐานะผู้ดูแล
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-0.5">
            ระบบจัดการบ้านพักเสฏฐสิทธิ์ 24 ชม.
          </h2>
          <p className="text-xs text-slate-500">
            ควบคุมห้องพัก 10 ห้อง, ตรวจสอบรายการจอง, ดูแลออเดอร์ของเสริม และสรุปยอดเงินรายวัน
          </p>
        </div>

        {/* Top Action Tabs & Logout */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("rack")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                activeTab === "rack"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BedDouble className="w-4 h-4" />
              <span>ผัง 10 ห้อง</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                activeTab === "bookings"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>รายการจอง ({bookings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("addons")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all relative ${
                activeTab === "addons"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ออเดอร์ของเสริม</span>
              {pendingDeliveriesCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingDeliveriesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("finance")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                activeTab === "finance"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>สรุปยอดเงิน</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onResetAllBookings && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm("ยืนยันรีเซ็ตห้องพักทั้งหมด 10 ห้องให้เป็นห้องว่าง และล้างรายการจองทั้งหมดใช่หรือไม่?")) {
                    onResetAllBookings()
                  }
                }}
                className="rounded-xl text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-slate-200 h-10 px-3 font-medium gap-1.5 transition-all"
                title="รีเซ็ตห้องทั้งหมดให้เป็นห้องว่าง"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">รีเซ็ตห้องว่างทั้งหมด</span>
              </Button>
            )}

            {onBackToHome && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToHome}
                className="rounded-xl text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200 h-10 px-3 font-bold gap-1.5 shadow-2xs transition-all active:scale-95"
              >
                <Home className="w-3.5 h-3.5 text-blue-600" />
                <span>กลับหน้าหลัก</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="rounded-xl text-xs text-rose-600 hover:bg-rose-50 border-rose-200 h-10 px-3 font-semibold gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ROOM RACK (10 ROOMS BOARD) */}
      {/* ========================================================================= */}
      {activeTab === "rack" && (
        <div className="space-y-6">
          {/* Top Stat Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">ห้องทั้งหมด</span>
                <h4 className="text-2xl font-black text-slate-900">{rooms.length} ห้อง</h4>
                <span className="text-[11px] text-slate-400">ชั่วโมง 5 | รายวัน 5</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                10
              </div>
            </Card>

            <Card className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-700 font-medium">ห้องว่างพร้อมใช้</span>
                <h4 className="text-2xl font-black text-emerald-700">{totalAvailable}</h4>
                <span className="text-[11px] text-emerald-600">พร้อมรับลูกค้าทันที</span>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </Card>

            <Card className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-rose-700 font-medium">มีผู้พักอยู่</span>
                <h4 className="text-2xl font-black text-rose-700">{totalOccupied}</h4>
                <span className="text-[11px] text-rose-600">กำลังเข้าพัก</span>
              </div>
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </Card>

            <Card className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-800 font-medium">รอแม่บ้านทำความสะอาด</span>
                <h4 className="text-2xl font-black text-amber-800">{totalCleaning}</h4>
                <span className="text-[11px] text-amber-700">กำลังเปลี่ยนผ้าปู</span>
              </div>
              <Sparkles className="w-8 h-8 text-amber-500" />
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={activeRackFilter === "all" ? "default" : "outline"}
                onClick={() => setActiveRackFilter("all")}
                className="rounded-xl text-xs font-semibold"
              >
                ทุกลักษณะห้อง (10)
              </Button>
              <Button
                size="sm"
                variant={activeRackFilter === "hourly" ? "default" : "outline"}
                onClick={() => setActiveRackFilter("hourly")}
                className="rounded-xl text-xs font-semibold"
              >
                <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                ห้องรายชั่วโมง (ห้อง 1-5)
              </Button>
              <Button
                size="sm"
                variant={activeRackFilter === "daily" ? "default" : "outline"}
                onClick={() => setActiveRackFilter("daily")}
                className="rounded-xl text-xs font-semibold"
              >
                <Moon className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                ห้องรายวัน (ห้อง 6-10)
              </Button>
            </div>

            <span className="text-xs text-slate-500">
              * สำหรับห้องรายชั่วโมง มีปุ่มกดต่อเวลา (+1 ชม. 50฿) ได้ทันที
            </span>
          </div>

          {/* 10 Rooms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {filteredRooms.map((room) => {
              const isAvail = room.status === "available"
              const isOcc = room.status === "occupied"
              const isClean = room.status === "cleaning"
              const isMaint = room.status === "maintenance"

              return (
                <Card
                  key={room.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isAvail
                      ? "border-emerald-200 bg-white hover:border-emerald-400 shadow-sm"
                      : isOcc
                      ? "border-rose-300 bg-rose-50/40 shadow-sm ring-1 ring-rose-200"
                      : isClean
                      ? "border-amber-300 bg-amber-50/40 shadow-sm"
                      : "border-slate-300 bg-slate-100 opacity-70"
                  }`}
                >
                  <div>
                    {/* Header: Room Number and Type */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400 font-medium block">ห้อง</span>
                        <span className="text-3xl font-black text-slate-900 leading-none">
                          {room.number}
                        </span>
                      </div>
                      <Badge
                        variant={room.type === "hourly" ? "warning" : "indigo"}
                        className="text-[10px] font-bold"
                      >
                        {room.type === "hourly" ? "ชั่วโมง" : "รายวัน"}
                      </Badge>
                    </div>

                    {/* Status & Details */}
                    <div className="my-3 space-y-2">
                      {isAvail && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-2 rounded-xl border border-emerald-100">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          ห้องว่าง พร้อมรับลูกค้า
                        </div>
                      )}

                      {isOcc && (
                        <div className="text-xs text-rose-900 bg-white p-3 rounded-xl border border-rose-200 shadow-xs space-y-1.5">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-rose-600 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> มีผู้เข้าพัก
                            </span>
                            {room.type === "hourly" && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                                ⏳ 3 ชม.
                              </span>
                            )}
                          </div>

                          <div className="text-slate-700 font-semibold truncate flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {room.currentBooking?.guestName || "ผู้เข้าพัก"}
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            ออก: <strong className="text-rose-700">{room.currentBooking?.checkOutTime}</strong>
                          </div>

                          {room.currentBooking?.plateNumber && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Car className="w-3 h-3 text-slate-400" />
                              ทะเบียน: {room.currentBooking.plateNumber}
                            </div>
                          )}
                        </div>
                      )}

                      {isClean && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-2 rounded-xl border border-amber-200">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          กำลังทำความสะอาดห้อง
                        </div>
                      )}

                      {isMaint && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-200 px-2.5 py-2 rounded-xl">
                          <Wrench className="w-3.5 h-3.5 text-slate-500" />
                          ปิดปรับปรุงชั่วคราว
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    {isAvail && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedRoomForWalkIn(room)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-8"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        เปิดห้อง Walk-in
                      </Button>
                    )}

                    {isOcc && (
                      <div className="space-y-1">
                        {/* Extend Hourly Stay Button */}
                        {room.type === "hourly" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onExtendHourlyStay(room.id, 1)}
                            className="w-full text-blue-700 border-blue-200 hover:bg-blue-50 rounded-xl text-[11px] h-7 font-semibold"
                          >
                            <RotateCw className="w-3 h-3 mr-1" />
                            ต่อเวลา +1 ชม. (50฿)
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateRoomStatus(room.id, "cleaning")}
                          className="w-full text-amber-900 border-amber-300 hover:bg-amber-100 bg-amber-50/70 rounded-xl text-xs h-8 font-bold flex items-center justify-center gap-1 shadow-2xs transition-all active:scale-[0.99]"
                        >
                          <User className="w-3.5 h-3.5 text-amber-700" />
                          <span>ลูกค้าออก</span>
                          <ArrowRight className="w-3 h-3 text-amber-600" />
                          <span>ทำความสะอาด</span>
                        </Button>
                      </div>
                    )}

                    {isClean && (
                      <Button
                        size="sm"
                        onClick={() => onUpdateRoomStatus(room.id, "available")}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-8 flex items-center justify-center gap-1 shadow-sm transition-all active:scale-[0.99]"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>ทำความสะอาดเสร็จ</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>เปิดว่าง</span>
                      </Button>
                    )}

                    {/* Quick Toggle to Maintenance */}
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateRoomStatus(
                          room.id,
                          room.status === "maintenance" ? "available" : "maintenance"
                        )
                      }
                      className="w-full text-[10px] text-slate-400 hover:text-slate-600 text-center block pt-1"
                    >
                      {room.status === "maintenance" ? "ยกเลิกปิดปรับปรุง" : "ตั้งค่าปิดปรับปรุง"}
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BOOKINGS TABLE & SLIP VERIFICATION */}
      {/* ========================================================================= */}
      {activeTab === "bookings" && (
        <Card className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                ตารางรายการจองห้องพักทั้งหมด ({filteredBookings.length} รายการ)
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                ค้นหาด้วยชื่อผู้จอง เบอร์โทร รหัสการจอง หรือทะเบียนรถ และตรวจสอบสลิปโอนเงิน
              </p>
            </div>

            {/* Search Input & Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="ค้นหาชื่อ, เบอร์, ทะเบียน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl"
                />
              </div>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">สถานะชำระ: ทั้งหมด</option>
                <option value="paid">ชำระแล้ว (โอนเงิน)</option>
                <option value="cash_on_arrival">เงินสดตอนเช็คอิน</option>
                <option value="pending">รอตรวจสอบ</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3">รหัสจอง / เวลา</th>
                  <th className="p-3">ห้องพัก</th>
                  <th className="p-3">ผู้เข้าพัก</th>
                  <th className="p-3">เวลาเข้า - ออก</th>
                  <th className="p-3">ของที่สั่งเพิ่ม</th>
                  <th className="p-3">ยอดชำระ</th>
                  <th className="p-3">สถานะเงิน</th>
                  <th className="p-3 text-center">สลิป / จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      ไม่พบข้อมูลรายการจองที่ตรงกับเงื่อนไขค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Code */}
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{b.bookingCode}</span>
                        <span className="text-[10px] text-slate-400">
                          {b.source === "walk-in" ? "🚗 Walk-in" : "🌐 จองผ่านเว็บ"}
                        </span>
                      </td>

                      {/* Room */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900 text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200">
                            ห้อง {b.roomNumber}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {b.roomType === "hourly" ? "ชั่วคราว (3 ชม.)" : "รายวัน (ค้างคืน)"}
                        </span>
                      </td>

                      {/* Guest Info */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{b.guestName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {b.guestPhone}
                        </div>
                        {b.licensePlate && (
                          <div className="text-[10px] text-blue-700 font-medium">
                            🚗 {b.licensePlate}
                          </div>
                        )}
                      </td>

                      {/* Check-in / Out */}
                      <td className="p-3">
                        <div>เข้า: <strong className="text-slate-800">{b.checkInTime} น.</strong></div>
                        <div className="text-slate-500 text-[11px]">
                          ออก: <span className="text-blue-700 font-semibold">{b.checkOutTime}</span>
                        </div>
                      </td>

                      {/* Add-ons */}
                      <td className="p-3">
                        {b.selectedAddOns?.length > 0 ? (
                          <div className="space-y-0.5">
                            {b.selectedAddOns.map((item, idx) => {
                              const product = ADD_ON_ITEMS.find((a) => a.id === item.itemId)
                              return (
                                <span
                                  key={idx}
                                  className="inline-block text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded mr-1"
                                >
                                  {product?.name.split(" ")[0]} x{item.quantity}
                                </span>
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">- ไม่มี -</span>
                        )}
                      </td>

                      {/* Total Price */}
                      <td className="p-3">
                        <span className="font-black text-sm text-slate-900 block">
                          {formatThaiBaht(b.totalPrice)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {b.paymentMethod === "promptpay" ? "โอนพร้อมเพย์" : "เงินสด"}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="p-3">
                        {b.paymentStatus === "paid" ? (
                          <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-0 text-[10px]">
                            ✓ ชำระแล้ว
                          </Badge>
                        ) : b.paymentStatus === "cash_on_arrival" ? (
                          <Badge variant="warning" className="bg-amber-100 text-amber-800 border-0 text-[10px]">
                            💵 เงินสดตอนเช็คอิน
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-rose-100 text-rose-800 border-0 text-[10px]">
                            รอตรวจสอบ
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {b.slipImage ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewingSlip(b)}
                              className="h-7 px-2 text-[10px] rounded-lg gap-1 text-blue-700 border-blue-200"
                            >
                              <Eye className="w-3 h-3" /> ดูสลิป
                            </Button>
                          ) : (
                            <span className="text-[10px] text-slate-400">-</span>
                          )}

                          {b.paymentStatus !== "paid" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                onUpdateBookingStatus(b.id, { paymentStatus: "paid" })
                              }
                              className="h-7 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                            >
                              ยืนยันยอด
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ROOM SERVICE / ADD-ONS QUEUE FOR MAIDS */}
      {/* ========================================================================= */}
      {activeTab === "addons" && (
        <Card className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                คิวจัดส่งของใช้ & อาหารเสริมถึงห้องพัก
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                แม่บ้านนำน้ำดื่ม ผ้าห่ม หรืออาหารไปส่งตามห้อง และกดปุ่มเพื่อบันทึกว่าจัดส่งเรียบร้อยแล้ว
              </p>
            </div>

            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant={addonFilter === "all" ? "default" : "outline"}
                onClick={() => setAddonFilter("all")}
                className="rounded-xl text-xs"
              >
                ทั้งหมด ({bookingsWithAddOns.length})
              </Button>
              <Button
                size="sm"
                variant={addonFilter === "pending" ? "default" : "outline"}
                onClick={() => setAddonFilter("pending")}
                className="rounded-xl text-xs"
              >
                รอนำส่ง ({pendingDeliveriesCount})
              </Button>
              <Button
                size="sm"
                variant={addonFilter === "delivered" ? "default" : "outline"}
                onClick={() => setAddonFilter("delivered")}
                className="rounded-xl text-xs"
              >
                จัดส่งแล้ว
              </Button>
            </div>
          </div>

          {/* Orders Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAddOnBookings.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-slate-400 bg-slate-50 rounded-2xl">
                ไม่มีรายการสั่งของเสริมที่อยู่ในสถานะนี้
              </div>
            ) : (
              filteredAddOnBookings.map((b) => {
                const isPending = b.deliveryStatus === "pending"

                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isPending
                        ? "border-amber-300 bg-amber-50/30 ring-1 ring-amber-300"
                        : "border-slate-200 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white font-black text-sm px-2.5 py-1 rounded-xl shadow-xs">
                          ห้อง {b.roomNumber}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">
                            {b.guestName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            โทร: {b.guestPhone}
                          </span>
                        </div>
                      </div>

                      {isPending ? (
                        <Badge variant="warning" className="bg-amber-100 text-amber-900 border-0 font-bold text-xs animate-pulse">
                          ⏳ รอนำส่งด่วน
                        </Badge>
                      ) : (
                        <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-0 font-bold text-xs">
                          ✓ จัดส่งเรียบร้อย
                        </Badge>
                      )}
                    </div>

                    {/* Items List */}
                    <div className="my-3 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-600 block">
                        รายการสิ่งของที่ต้องนำไปส่ง:
                      </span>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        {b.selectedAddOns.map((item, idx) => {
                          const product = ADD_ON_ITEMS.find((a) => a.id === item.itemId)
                          return (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-800">
                                • {product?.name}
                              </span>
                              <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                x {item.quantity} {product?.unit}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      {b.notes && (
                        <p className="text-[11px] text-slate-500 italic bg-slate-100 p-2 rounded-lg">
                          📝 หมายเหตุ: "{b.notes}"
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 flex justify-between items-center border-t border-slate-200/80">
                      <span className="text-xs text-slate-500">
                        ยอดค่าสินค้า: <strong className="text-slate-900">{b.addOnsPrice}฿</strong>
                      </span>

                      {isPending ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            onUpdateBookingStatus(b.id, { deliveryStatus: "delivered" })
                          }
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-4 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          กดเพื่อยืนยันว่านำส่งแล้ว
                        </Button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> ส่งถึงห้องแล้ว
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DAILY REVENUE & FINANCIAL REPORT */}
      {/* ========================================================================= */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          {/* Revenue Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl shadow-lg shadow-blue-500/20">
              <span className="text-xs font-semibold text-blue-200 block uppercase tracking-wider">
                รายรับรวมทั้งหมดวันนี้
              </span>
              <h3 className="text-3xl font-black mt-1">
                {formatThaiBaht(totalRevenue)}
              </h3>
              <p className="text-xs text-blue-200 mt-2">
                รวมค่าห้อง 10 ห้อง และบริการเสริม
              </p>
            </Card>

            <Card className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 block">
                  รายได้ห้องรายชั่วโมง (ห้อง 1-5)
                </span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {formatThaiBaht(hourlyRevenue)}
              </h3>
              <span className="text-[11px] text-amber-700 font-medium">อัตรา 200฿ / 3 ชม.</span>
            </Card>

            <Card className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 block">
                  รายได้ห้องรายวัน (ห้อง 6-10)
                </span>
                <Moon className="w-4 h-4 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {formatThaiBaht(dailyRevenue)}
              </h3>
              <span className="text-[11px] text-indigo-700 font-medium">400฿ / หลัง 18:00 350฿</span>
            </Card>

            <Card className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 block">
                  รายได้จากของใช้/อาหารเสริม
                </span>
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">
                {formatThaiBaht(addOnsRevenue)}
              </h3>
              <span className="text-[11px] text-emerald-600 font-medium">น้ำดื่ม, ผ้าห่ม, มาม่า ฯลฯ</span>
            </Card>
          </div>

          {/* Payment Method Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                ยอดโอนผ่าน QR พร้อมเพย์ (PromptPay)
              </CardTitle>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-blue-700 block">เงินเข้าบัญชีพร้อมเพย์</span>
                  <span className="text-2xl font-black text-blue-950">
                    {formatThaiBaht(promptPayTotal)}
                  </span>
                </div>
                <Badge variant="indigo" className="font-bold text-xs">
                  โอนเข้าแล้ว
                </Badge>
              </div>
            </Card>

            <Card className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-600" />
                ยอดเงินสดในลิ้นชัก (Cash on Hand)
              </CardTitle>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-700 block">เงินสดที่รับจากลูกค้า</span>
                  <span className="text-2xl font-black text-emerald-950">
                    {formatThaiBaht(cashTotal)}
                  </span>
                </div>
                <Badge variant="success" className="font-bold text-xs bg-emerald-200 text-emerald-900">
                  เงินสดในเก๊ะ
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIP VIEWER MODAL */}
      {/* ========================================================================= */}
      {viewingSlip && (
        <Dialog open={true} onOpenChange={() => setViewingSlip(null)}>
          <DialogContent className="max-w-md bg-white rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                สลิปโอนเงิน : รหัส {viewingSlip.bookingCode}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                ห้อง {viewingSlip.roomNumber} • ผู้โอน: {viewingSlip.guestName} ({viewingSlip.guestPhone})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 aspect-[3/4] max-h-80 flex items-center justify-center">
                <img
                  src={viewingSlip.slipImage}
                  alt="Slip Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span>ยอดเงินที่ต้องชำระ:</span>
                  <strong className="text-blue-700 text-sm">
                    {formatThaiBaht(viewingSlip.totalPrice)}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>เบอร์พร้อมเพย์ปลายทาง:</span>
                  <span>099-734-5847 (บ้านพักเสฏฐสิทธิ์)</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setViewingSlip(null)}
                  className="rounded-xl text-xs"
                >
                  ปิดหน้าต่าง
                </Button>
                {viewingSlip.paymentStatus !== "paid" && (
                  <Button
                    onClick={() => {
                      onUpdateBookingStatus(viewingSlip.id, { paymentStatus: "paid" })
                      setViewingSlip(null)
                    }}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    ยืนยันว่าได้รับเงินแล้ว
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* WALK-IN CHECK-IN MODAL */}
      {/* ========================================================================= */}
      {selectedRoomForWalkIn && (
        <Dialog open={true} onOpenChange={() => setSelectedRoomForWalkIn(null)}>
          <DialogContent className="max-w-md bg-white rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                เปิดห้อง Walk-in ด่วน : ห้อง {selectedRoomForWalkIn.number}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                สำหรับลูกค้ารถยนต์หรือมอเตอร์ไซค์ที่ขับเข้ามาพักโดยไม่ผ่านเว็บ
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900">
                <span className="font-bold block">
                  ประเภท: {selectedRoomForWalkIn.type === "hourly" ? "รายชั่วโมง (3 ชม. 200฿)" : "รายวัน (400฿ / หลัง 18:00 350฿)"}
                </span>
                <span>ระบบจะล็อกห้องเป็น 'มีผู้เข้าพัก' ทันที</span>
              </div>

              <div>
                <Label className="text-xs">ชื่อลูกค้า (ถ้าสะดวกแจ้ง)</Label>
                <Input
                  placeholder="กรอกชื่อลูกค้า หรือชื่อเล่น"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs">เบอร์โทรติดต่อ</Label>
                <Input
                  placeholder="กรอกเบอร์โทรศัพท์ติดต่อ"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs">ทะเบียนรถลูกค้า</Label>
                <Input
                  placeholder="กรอกทะเบียนรถ หรือ ยี่ห้อรถ"
                  value={walkInPlate}
                  onChange={(e) => setWalkInPlate(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs block mb-1">ช่องทางชำระเงิน</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWalkInPayment("cash")}
                    className={`p-2.5 rounded-xl border font-bold text-center ${
                      walkInPayment === "cash"
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    💵 เงินสด
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalkInPayment("promptpay")}
                    className={`p-2.5 rounded-xl border font-bold text-center ${
                      walkInPayment === "promptpay"
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    📱 โอนพร้อมเพย์
                  </button>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRoomForWalkIn(null)}
                  className="rounded-xl text-xs"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleWalkInSubmit}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5"
                >
                  เปิดห้องพักทันที
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
