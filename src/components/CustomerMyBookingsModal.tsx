import { useState } from "react"
import { CustomerUser, BookingRecord, Room } from "@/types"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ADD_ON_ITEMS } from "@/data/mockData"
import { formatThaiBaht } from "@/lib/utils"
import { AddOnSelector } from "./AddOnSelector"
import {
  Phone,
  Car,
  Clock,
  LogOut,
  ShoppingBag,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
} from "lucide-react"

interface CustomerMyBookingsModalProps {
  open: boolean
  onClose: () => void
  customer: CustomerUser | null
  bookings: BookingRecord[]
  rooms: Room[]
  onLogout: () => void
  onOrderAdditionalAddOns: (roomId: string, addOns: { itemId: string; quantity: number }[]) => void
  onCancelBooking: (bookingCodeOrId: string, roomId: string) => void
  onExtendHourlyStay?: (roomId: string, extraHours: number) => void
}

export function CustomerMyBookingsModal({
  open,
  onClose,
  customer,
  bookings,
  rooms,
  onLogout,
  onOrderAdditionalAddOns,
  onCancelBooking,
  onExtendHourlyStay,
}: CustomerMyBookingsModalProps) {
  const [isOrderingMore, setIsOrderingMore] = useState(false)
  const [extraAddOns, setExtraAddOns] = useState<{ [itemId: string]: number }>({})
  const [orderSentSuccess, setOrderSentSuccess] = useState(false)

  // Cancellation states
  const [confirmCancelRoomId, setConfirmCancelRoomId] = useState<string | null>(null)
  const [confirmCancelBookingId, setConfirmCancelBookingId] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState("")

  // Helpers for robust matching by phone and/or name
  const clean = (p?: string) => (p || "").replace(/[^0-9]/g, "")
  const cleanCustomerPhone = clean(customer?.phone)
  const normCustomerName = (customer?.name || "").trim().toLowerCase()

  // Match logic: Match by phone (>=9 digits) OR exact/partial name (case-insensitive)
  const isMatchBooking = (guestPhone?: string, guestName?: string) => {
    const cleanGuestPhone = clean(guestPhone)
    const normGuestName = (guestName || "").trim().toLowerCase()

    // 1. If phone matches (at least 9 digits each)
    if (cleanCustomerPhone.length >= 9 && cleanGuestPhone.length >= 9) {
      if (
        cleanGuestPhone === cleanCustomerPhone ||
        cleanGuestPhone.endsWith(cleanCustomerPhone) ||
        cleanCustomerPhone.endsWith(cleanGuestPhone)
      ) {
        return true
      }
    }

    // 2. If name matches (exact or contains)
    if (normCustomerName && normGuestName) {
      if (
        normCustomerName === normGuestName ||
        normCustomerName.includes(normGuestName) ||
        normGuestName.includes(normCustomerName)
      ) {
        return true
      }
    }

    return false
  }

  // Filter bookings for this customer
  const myBookings = customer ? bookings.filter((b) => isMatchBooking(b.guestPhone, b.guestName)) : []

  // Find currently occupied room for this customer
  const currentOccupiedRoom = customer ? rooms.find(
    (r) =>
      r.status === "occupied" &&
      r.currentBooking &&
      isMatchBooking(r.currentBooking.guestPhone, r.currentBooking.guestName)
  ) : undefined

  // Determine best display phone
  const resolvedPhone =
    customer?.phone ||
    currentOccupiedRoom?.currentBooking?.guestPhone ||
    myBookings[0]?.guestPhone ||
    ""

  const handleSendExtraOrder = () => {
    if (!currentOccupiedRoom) return

    const addOnsArray = Object.entries(extraAddOns).map(([itemId, quantity]) => ({
      itemId,
      quantity,
    }))

    if (addOnsArray.length === 0) return

    onOrderAdditionalAddOns(currentOccupiedRoom.id, addOnsArray)
    setOrderSentSuccess(true)
    setTimeout(() => {
      setOrderSentSuccess(false)
      setIsOrderingMore(false)
      setExtraAddOns({})
    }, 1500)
  }

  // Handle cancelling active room stay
  const handleCancelActiveStay = async () => {
    if (!currentOccupiedRoom) return
    setIsCancelling(true)
    try {
      const codeOrId =
        currentOccupiedRoom.currentBooking?.bookingCode || currentOccupiedRoom.id
      await onCancelBooking(codeOrId, currentOccupiedRoom.id)
      setConfirmCancelRoomId(null)
      setCancelSuccessMsg(
        `ยกเลิกการจองห้องพักเบอร์ ${currentOccupiedRoom.number} เรียบร้อยแล้ว (สถานะห้องกลับเป็นว่าง)`
      )
      setTimeout(() => {
        setCancelSuccessMsg("")
      }, 4000)
    } finally {
      setIsCancelling(false)
    }
  }

  // Handle extending hourly stay
  const handleExtendStay = (extraHours: number) => {
    if (!currentOccupiedRoom || !onExtendHourlyStay) return
    onExtendHourlyStay(currentOccupiedRoom.id, extraHours)
    setCancelSuccessMsg(
      `ต่อเวลาพักห้อง ${currentOccupiedRoom.number} เพิ่ม ${extraHours} ชั่วโมง (+${extraHours * 50}฿) เรียบร้อยแล้ว`
    )
    setTimeout(() => {
      setCancelSuccessMsg("")
    }, 4000)
  }

  // Handle cancelling booking from history
  const handleCancelHistoryBooking = async (b: BookingRecord) => {
    setIsCancelling(true)
    try {
      await onCancelBooking(b.id, b.roomId)
      setConfirmCancelBookingId(null)
      setCancelSuccessMsg(
        `ยกเลิกการจองห้อง ${b.roomNumber} (รหัส ${b.bookingCode}) สำเร็จแล้ว`
      )
      setTimeout(() => {
        setCancelSuccessMsg("")
      }, 4000)
    } finally {
      setIsCancelling(false)
    }
  }

  if (!customer) return null

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-2xl">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-xl">
                {customer.avatar ? (
                  <img
                    src={customer.avatar}
                    alt={customer.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  customer.name.slice(0, 1)
                )}
              </div>
              <div>
                <h3 className="text-xl font-black">{customer.name}</h3>
                <div className="flex items-center gap-3 text-xs text-blue-100 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {resolvedPhone || "สมาชิก Google"}
                  </span>
                  {customer.licensePlate && (
                    <span className="flex items-center gap-1">
                      <Car className="w-3 h-3" /> ทะเบียน: {customer.licensePlate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="rounded-xl text-xs bg-white/10 hover:bg-white/20 border-white/20 text-white font-semibold gap-1 h-9"
            >
              <LogOut className="w-3.5 h-3.5" />
              ออกจากระบบ
            </Button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Cancellation Success Notification */}
          {cancelSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{cancelSuccessMsg}</span>
            </div>
          )}

          {/* Active Stay Card (if customer is in a room) */}
          {currentOccupiedRoom ? (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-300 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold text-emerald-900 text-sm">
                    คุณกำลังเข้าพักอยู่ ณ ขณะนี้
                  </span>
                </div>
                <Badge variant="success" className="bg-emerald-600 text-white border-0 font-bold">
                  ห้องพักเบอร์ {currentOccupiedRoom.number}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-emerald-800 bg-white/80 p-3 rounded-xl border border-emerald-200">
                <div>
                  <span className="text-slate-500 block">เวลาเช็คอิน:</span>
                  <strong className="text-slate-900">
                    {currentOccupiedRoom.currentBooking?.checkInTime} น.
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">เวลาเช็คเอาต์:</span>
                  <strong className="text-blue-700">
                    {currentOccupiedRoom.currentBooking?.checkOutTime}
                  </strong>
                </div>
              </div>

              {/* Hourly Extension Controls */}
              {currentOccupiedRoom.type === "hourly" && onExtendHourlyStay && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      ขอต่อเวลาพักชั่วคราว (+50 บาท/ชม.)
                    </span>
                    <span className="text-[10px] text-amber-800 font-semibold bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                      เพิ่มเวลาทันที
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleExtendStay(1)}
                      className="rounded-xl text-xs h-8 bg-white border-amber-300 text-amber-900 hover:bg-amber-100 font-bold"
                    >
                      +1 ชั่วโมง (50฿)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleExtendStay(2)}
                      className="rounded-xl text-xs h-8 bg-white border-amber-300 text-amber-900 hover:bg-amber-100 font-bold"
                    >
                      +2 ชั่วโมง (100฿)
                    </Button>
                  </div>
                </div>
              )}

              {/* Order extra service directly button */}
              {!isOrderingMore ? (
                <div className="space-y-2">
                  <Button
                    onClick={() => setIsOrderingMore(true)}
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 shadow-md shadow-blue-500/20"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                    สั่งน้ำดื่ม / ผ้าห่ม / อาหารส่งเข้าห้องตอนนี้
                  </Button>

                  {/* Inline Cancel Section */}
                  {confirmCancelRoomId === currentOccupiedRoom.id ? (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-xs animate-in fade-in">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>ยืนยันยกเลิกการจองห้อง {currentOccupiedRoom.number}?</span>
                      </div>
                      <p className="text-[11px] text-rose-700 leading-relaxed">
                        หากท่านกดจองผิดห้องหรือผิดเวลา เมื่อกดยืนยัน ห้องนี้จะถูกคืนเป็นห้องว่างทันทีเพื่อให้สามารถจองใหม่ได้
                      </p>

                      {/* Refund notice if promptpay or paid */}
                      {(currentOccupiedRoom.currentBooking?.paymentMethod === "promptpay" || currentOccupiedRoom.currentBooking?.paymentStatus === "paid") && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5 text-xs">
                          <div className="font-bold flex items-center gap-1 text-[11px]">
                            <span>💳 เงื่อนไขคืนเงิน (กรณีโอนเงินแล้ว):</span>
                          </div>
                          <p className="text-[10px] text-amber-800 leading-normal">
                            หากโอนเงินพร้อมเพย์แล้ว เมื่อกดยืนยันยกเลิกห้องพัก กรุณากดปุ่มด้านล่างเพื่อส่งหลักฐานขอรับเงินคืนผ่าน LINE แอดมินทันที
                          </p>
                          <a
                            href="https://line.me/ti/p/~bassss09902"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-1.5 px-3 rounded-lg bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition-transform active:scale-95"
                          >
                            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.572-3.844 2.572-5.992z" />
                            </svg>
                            <span>แจ้งขอรับเงินคืนผ่าน LINE (bassss09902)</span>
                          </a>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => setConfirmCancelRoomId(null)}
                          className="rounded-xl text-xs h-8 bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          ไม่ยกเลิก / เข้าพักต่อ
                        </Button>
                        <Button
                          size="sm"
                          type="button"
                          onClick={handleCancelActiveStay}
                          disabled={isCancelling}
                          className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-8 shadow-xs"
                        >
                          {isCancelling ? "กำลังยกเลิก..." : "ยืนยันยกเลิกห้องนี้"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setConfirmCancelRoomId(currentOccupiedRoom.id)}
                        className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>ต้องการยกเลิกการจองห้องนี้ (กดผิด)?</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-2 border-t border-emerald-200 space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center justify-between">
                    <span>เลือกสิ่งที่ต้องการสั่งเพิ่มเข้าห้อง {currentOccupiedRoom.number}</span>
                    <button
                      type="button"
                      onClick={() => setIsOrderingMore(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ยกเลิก
                    </button>
                  </h4>

                  <AddOnSelector
                    selectedItems={extraAddOns}
                    onChange={setExtraAddOns}
                  />

                  {orderSentSuccess ? (
                    <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ส่งคำสั่งซื้อเรียบร้อย! แม่บ้านกำลังนำไปส่งที่ห้องพัก
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsOrderingMore(false)}
                        className="rounded-xl text-xs"
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        size="sm"
                        disabled={Object.keys(extraAddOns).length === 0}
                        onClick={handleSendExtraOrder}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 shadow-sm"
                      >
                        ยืนยันสั่งของส่งถึงห้อง
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-blue-900 text-xs block">
                  ยังไม่มีการเข้าพักในขณะนี้
                </span>
                <span className="text-[11px] text-blue-700">
                  เลือกห้องพักด้านล่างเพื่อเริ่มการจองได้ทันที
                </span>
              </div>
              <Button
                size="sm"
                onClick={onClose}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8"
              >
                จองห้องพักเลย
              </Button>
            </div>
          )}

          {/* Bookings History */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              ประวัติการจองของฉัน ({myBookings.length} รายการ)
            </h4>

            {myBookings.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl text-xs">
                คุณยังไม่มีประวัติการจองห้องพัก
              </div>
            ) : (
              <div className="space-y-2.5">
                {myBookings.map((b) => {
                  const isCancelled = b.paymentStatus === "cancelled"

                  return (
                    <div
                      key={b.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCancelled
                          ? "border-slate-200 bg-slate-50/70 opacity-75"
                          : "border-slate-200 bg-white shadow-xs"
                      } space-y-2 text-xs`}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black text-sm px-2.5 py-0.5 rounded-lg border ${
                              isCancelled
                                ? "bg-slate-200 text-slate-500 border-slate-300"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            ห้อง {b.roomNumber}
                          </span>
                          <span className="text-slate-500 font-medium">
                            {b.roomType === "hourly" ? "ชั่วคราว (3 ชม.)" : "รายวัน (ค้างคืน)"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isCancelled ? (
                            <Badge className="text-[10px] bg-rose-100 text-rose-700 border-rose-300 font-bold hover:bg-rose-100">
                              ยกเลิกแล้ว
                            </Badge>
                          ) : (
                            <Badge className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold hover:bg-emerald-50">
                              จองสำเร็จ
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px]">
                            รหัส: {b.bookingCode}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                        <div>
                          <span>เวลาเข้าพัก: </span>
                          <strong className={isCancelled ? "text-slate-500 line-through" : "text-slate-900"}>
                            {b.checkInDate} เวลา {b.checkInTime} น.
                          </strong>
                        </div>
                        <div>
                          <span>เวลาออก: </span>
                          <strong className={isCancelled ? "text-slate-500 line-through" : "text-blue-700"}>
                            {b.checkOutTime}
                          </strong>
                        </div>
                      </div>

                      {b.selectedAddOns?.length > 0 && (
                        <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                          <strong>ของเสริมที่สั่ง: </strong>
                          {b.selectedAddOns.map((item, idx) => {
                            const product = ADD_ON_ITEMS.find((a) => a.id === item.itemId)
                            return (
                              <span key={idx} className="mr-2 text-blue-700">
                                {product?.name.split(" ")[0]} x{item.quantity}
                              </span>
                            )
                          })}
                        </div>
                      )}

                      {/* Cancellation Flow for this booking */}
                      {!isCancelled && confirmCancelBookingId === b.id && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs animate-in fade-in">
                          <div className="flex items-center gap-1.5 font-bold text-rose-800">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>ยืนยันยกเลิกการจองห้อง {b.roomNumber} (รหัส {b.bookingCode})?</span>
                          </div>
                          <p className="text-[11px] text-rose-600">
                            หากกดยืนยัน รายการนี้จะถูกยกเลิก และคืนสถานะห้องพักให้ว่าง
                          </p>

                          {/* Refund notice if promptpay or paid */}
                          {(b.paymentMethod === "promptpay" || b.paymentStatus === "paid") && (
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5 text-xs">
                              <div className="font-bold flex items-center gap-1 text-[11px]">
                                <span>💳 เงื่อนไขคืนเงิน (กรณีโอนเงินแล้ว):</span>
                              </div>
                              <p className="text-[10px] text-amber-800 leading-normal">
                                หากโอนเงินแล้ว กรุณากดปุ่มด้านล่างเพื่อส่งหลักฐานขอรับเงินคืนผ่าน LINE แอดมินทันที
                              </p>
                              <a
                                href="https://line.me/ti/p/~bassss09902"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-1.5 px-3 rounded-lg bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition-transform active:scale-95"
                              >
                                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.572-3.844 2.572-5.992z" />
                                </svg>
                                <span>แจ้งขอรับเงินคืนผ่าน LINE (bassss09902)</span>
                              </a>
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => setConfirmCancelBookingId(null)}
                              className="rounded-xl text-[11px] h-7 bg-white border-slate-300 text-slate-700"
                            >
                              ไม่ยกเลิก
                            </Button>
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => handleCancelHistoryBooking(b)}
                              disabled={isCancelling}
                              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] h-7 shadow-xs"
                            >
                              {isCancelling ? "กำลังยกเลิก..." : "ยืนยันยกเลิก"}
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        {!isCancelled && confirmCancelBookingId !== b.id ? (
                          <button
                            type="button"
                            onClick={() => setConfirmCancelBookingId(b.id)}
                            className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>ยกเลิกการจอง (กดผิด)</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {isCancelled ? "ยกเลิกคำขอแล้ว" : ""}
                          </span>
                        )}

                        <div className="font-bold text-slate-900 text-xs">
                          <span className="text-slate-500 mr-1.5">ยอดชำระ:</span>
                          <span
                            className={
                              isCancelled
                                ? "text-slate-400 line-through text-xs"
                                : "text-blue-700 text-sm"
                            }
                          >
                            {formatThaiBaht(b.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
