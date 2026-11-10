import { useState, useEffect } from "react"
import { Room, CustomerUser } from "@/types"
import { calculatePricing, ADD_ON_ITEMS } from "@/data/mockData"
import { formatThaiBaht } from "@/lib/utils"
import { AddOnSelector } from "./AddOnSelector"
import { ThaiDateTimePicker } from "./ThaiDateTimePicker"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  CheckCircle,
  QrCode,
  Sparkles,
  User,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  X,
  AlertTriangle,
  AlertCircle,
  MapPin,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react"

interface BookingModalProps {
  room: Room | null
  open: boolean
  onClose: () => void
  onSuccessBooking: (bookingData: any) => void
  onCancelBooking?: (bookingCode: string, roomId: string) => void
  currentCustomer?: CustomerUser | null
  onOpenCustomerLogin?: () => void
}

export function BookingModal({
  room,
  open,
  onClose,
  onSuccessBooking,
  onCancelBooking,
  currentCustomer,
  onOpenCustomerLogin,
}: BookingModalProps) {
  // Form states
  const [step, setStep] = useState<"details" | "addons" | "payment" | "confirmed">("details")
  const [checkInTime, setCheckInTime] = useState<string>("14:00")
  const [checkInDate, setCheckInDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [licensePlate, setLicensePlate] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedAddOns, setSelectedAddOns] = useState<{ [itemId: string]: number }>({})
  const [paymentMethod, setPaymentMethod] = useState<"promptpay" | "counter">("promptpay")
  const [slipUploaded, setSlipUploaded] = useState(false)
  const [bookingCode, setBookingCode] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isCancelledSuccess, setIsCancelledSuccess] = useState(false)

  // Autofill if customer is logged in
  useEffect(() => {
    if (currentCustomer && open) {
      setGuestName(currentCustomer.name)
      const digits = (currentCustomer.phone || "").replace(/\D/g, "").slice(0, 10)
      setGuestPhone(digits)
      if (currentCustomer.licensePlate) {
        setLicensePlate(currentCustomer.licensePlate)
      }
    }
  }, [currentCustomer, open])

  // Phone input handler (Digits only, max 10 chars)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10)
    setGuestPhone(digitsOnly)
  }

  const isPhoneValid = guestPhone.length === 10 && guestPhone.startsWith("0")
  const isStep1Valid = Boolean(currentCustomer && guestName.trim().length > 0 && isPhoneValid)

  // Convert selectedAddOns map to array
  const addOnsArray = Object.entries(selectedAddOns).map(([itemId, quantity]) => ({
    itemId,
    quantity,
  }))

  // Calculate pricing based on room type, checkInTime and addOns
  const pricing = calculatePricing({
    roomType: room ? room.type : "hourly",
    checkInTime,
    selectedAddOns: addOnsArray,
  })

  // Format date in Thai
  const getFormattedThaiDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString("th-TH", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  // Calculate check out time
  const calculateCheckOut = () => {
    if (room?.type === "hourly") {
      const [h, m] = checkInTime.split(":").map(Number)
      const outH = ((h || 0) + 3) % 24
      const formattedH = outH.toString().padStart(2, "0")
      const formattedM = ((m || 0)).toString().padStart(2, "0")
      return `${formattedH}:${formattedM} น. (ครบ 3 ชม.)`
    } else {
      return "วันถัดไป ก่อน 12:00 น. (เที่ยงวัน)"
    }
  }

  const handleConfirm = () => {
    const code = "BK-" + Math.floor(100000 + Math.random() * 900000)
    setBookingCode(code)
    setStep("confirmed")

    onSuccessBooking({
      bookingCode: code,
      room,
      guestName,
      guestPhone,
      licensePlate,
      checkInDate,
      checkInTime,
      checkOutTime: calculateCheckOut(),
      pricing,
      selectedAddOns: addOnsArray,
      paymentMethod,
    })
  }

  const getBookingShareText = () => {
    return `🏡 แจ้งการจองห้องพัก: บ้านพักเสฏฐสิทธิ์ 24 ชม.
📌 รหัสการจอง: ${bookingCode}
🚪 ห้องพัก: ห้อง ${room?.number || ""} (${room?.type === "hourly" ? "ชั่วคราว 3 ชม." : "รายวัน 1 คืน"})
👤 ผู้จอง: ${guestName} (เบอร์โทร: ${guestPhone})
🚗 ทะเบียนรถ: ${licensePlate || "-"}
⏰ เวลาเข้าพัก: ${getFormattedThaiDate(checkInDate)} เวลา ${checkInTime} น.
🕒 เวลาเช็คเอาต์: ${calculateCheckOut()}
💰 ยอดชำระ: ${formatThaiBaht(pricing.grandTotal)}
📍 สถานที่: บ้านพักเสฏฐสิทธิ์ 137 ม.8 ต.ท่ายาง อ.เมือง จ.ชุมพร 86000
(แนบส่งหลักฐานให้แอดมินทาง LINE: bassss09902)`
  }

  const handleSendToLine = () => {
    const text = getBookingShareText()
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {})
    }
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 3000)
    window.open("https://line.me/ti/p/~bassss09902", "_blank")
  }

  const handleCopyBookingInfo = () => {
    const text = getBookingShareText()
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2500)
      })
    }
  }

  const handleOpenGoogleMaps = () => {
    window.open(
      "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent("บ้านพักเสฏฐสิทธิ์ 137 ม.8 ตำบล ท่ายาง เมือง ชุมพร 86000"),
      "_blank"
    )
  }

  const handleExecuteCancel = () => {
    if (onCancelBooking && room) {
      onCancelBooking(bookingCode, room.id)
      setIsCancelledSuccess(true)
      setIsCancelling(false)
    }
  }

  const handleResetAndClose = () => {
    setStep("details")
    setSelectedAddOns({})
    setGuestName("")
    setGuestPhone("")
    setLicensePlate("")
    setNotes("")
    setSlipUploaded(false)
    setIsCancelling(false)
    setIsCancelledSuccess(false)
    onClose()
  }

  if (!room) return null

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? handleResetAndClose() : null)}>
      <DialogContent
        className="max-w-lg sm:max-w-xl p-0 overflow-hidden bg-slate-50 border-0 rounded-3xl shadow-2xl"
        disableBackdropClick={true}
        showCloseButton={false}
      >
        {/* Header Banner: Premium Compact Indigo-Navy Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-4 sm:p-5 text-white border-b border-blue-800/30">
          {/* Subtle ambient glow accents */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Title Area with generous right padding to keep clear of close button */}
          <div className="pr-14 relative z-10">
            <span className="text-[10px] uppercase tracking-wider text-blue-300/90 font-semibold block">
              ระบบจองห้องพักออนไลน์ 24 ชม.
            </span>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
                ห้อง {room.number}
              </h2>
              <Badge className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-lg border-0 shadow-sm ${
                room.type === "hourly"
                  ? "bg-amber-400 text-amber-950"
                  : "bg-emerald-400 text-emerald-950"
              }`}>
                {room.type === "hourly" ? "พักชั่วคราว (3 ชม. 200฿)" : "พักค้างคืน (รายวัน 400฿)"}
              </Badge>
            </div>
          </div>

          {/* Prominent Close X Button: Placed with high z-index and DialogClose functionality */}
          <DialogClose
            onClick={(e) => {
              e.stopPropagation()
              handleResetAndClose()
            }}
            className="absolute right-3.5 top-3.5 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/25 backdrop-blur-md shadow-md focus:outline-none"
            aria-label="ปิดหน้าต่าง"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5 text-white" />
          </DialogClose>

          {/* Stepper Indicator: Compact Segmented Control */}
          {step !== "confirmed" && (
            <div className="grid grid-cols-3 gap-1 p-0.5 bg-black/30 backdrop-blur-md rounded-xl mt-3 border border-white/10 text-[11px] relative z-10">
              <div
                className={`py-1 px-1.5 rounded-lg text-center font-bold transition-all flex items-center justify-center gap-1.5 ${
                  step === "details"
                    ? "bg-white text-blue-950 shadow-md scale-[1.01]"
                    : "text-white/70"
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-extrabold ${
                  step === "details" ? "bg-blue-900 text-white" : "bg-white/20 text-white"
                }`}>1</span>
                <span className="truncate">ข้อมูล & วันเวลา</span>
              </div>

              <div
                className={`py-1 px-1.5 rounded-lg text-center font-bold transition-all flex items-center justify-center gap-1.5 ${
                  step === "addons"
                    ? "bg-white text-blue-950 shadow-md scale-[1.01]"
                    : "text-white/70"
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-extrabold ${
                  step === "addons" ? "bg-blue-900 text-white" : "bg-white/20 text-white"
                }`}>2</span>
                <span className="truncate">ของเสริม</span>
              </div>

              <div
                className={`py-1 px-1.5 rounded-lg text-center font-bold transition-all flex items-center justify-center gap-1.5 ${
                  step === "payment"
                    ? "bg-white text-blue-950 shadow-md scale-[1.01]"
                    : "text-white/70"
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-extrabold ${
                  step === "payment" ? "bg-blue-900 text-white" : "bg-white/20 text-white"
                }`}>3</span>
                <span className="truncate">ชำระเงิน</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body: Compact Spacing */}
        <div className="p-3.5 sm:p-4 bg-white max-h-[78vh] overflow-y-auto space-y-3.5">
          {/* STEP 1: DETAILS, BEAUTIFUL DATE/TIME & PHONE VALIDATION */}
          {step === "details" && (
            <div className="space-y-3">
              {!currentCustomer && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-semibold">คุณยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบก่อนทำการจอง</span>
                  </div>
                  {onOpenCustomerLogin && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={onOpenCustomerLogin}
                      className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-7 px-3 font-bold shrink-0"
                    >
                      เข้าสู่ระบบ
                    </Button>
                  )}
                </div>
              )}
              {/* Compact Pricing Alert / Promo Banner */}
              {room.type === "hourly" ? (
                <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-amber-900">อัตราค่าบริการ: 3 ชั่วโมง 200 บาท</span>
                  </div>
                  <span className="text-[11px] text-amber-700 font-medium">เกิน ชม. ละ 50฿</span>
                </div>
              ) : (
                <div
                  className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    pricing.isDiscountApplied
                      ? "bg-emerald-50/90 border-emerald-300 text-emerald-900"
                      : "bg-blue-50/90 border-blue-200 text-blue-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className={`w-4 h-4 shrink-0 ${
                        pricing.isDiscountApplied ? "text-emerald-600" : "text-blue-600"
                      }`}
                    />
                    <span className="font-bold">
                      {pricing.isDiscountApplied
                        ? "⚡ โปรลดพิเศษ: 350 บาท (เข้าหลัง 18:00 น.)"
                        : "อัตราค่าบริการ: 400 บาท / คืน"}
                    </span>
                  </div>
                  <span className="text-[11px] opacity-80 font-medium">ออกก่อนเที่ยง 12:00 น.</span>
                </div>
              )}

              {/* BEAUTIFUL CUSTOM THAI DATE & TIME PICKER (NO NATIVE BROWSER POPUPS) */}
              <ThaiDateTimePicker
                checkInDate={checkInDate}
                setCheckInDate={setCheckInDate}
                checkInTime={checkInTime}
                setCheckInTime={setCheckInTime}
                roomType={room.type}
                calculateCheckOut={calculateCheckOut}
              />

              {/* GUEST INFORMATION WITH DIGITS-ONLY 10 DIGIT PHONE */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" />
                    ข้อมูลผู้จองเข้าพัก
                  </h4>
                  {currentCustomer ? (
                    <span className="text-[10px] sm:text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> กรอกข้อมูลจากบัญชีของคุณแล้ว
                    </span>
                  ) : (
                    onOpenCustomerLogin && (
                      <button
                        type="button"
                        onClick={onOpenCustomerLogin}
                        className="text-[11px] text-blue-600 hover:underline font-semibold"
                      >
                        มีบัญชีแล้ว? เข้าสู่ระบบ
                      </button>
                    )
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">ชื่อ-นามสกุล / ชื่อเล่น *</Label>
                    <Input
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="mt-1 rounded-xl text-xs h-9"
                      required
                    />
                  </div>

                  <div>
                    {/* Phone Header with 10-digit counter */}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700">
                        เบอร์โทรศัพท์มือถือ *
                      </Label>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isPhoneValid
                            ? "bg-emerald-100 text-emerald-800"
                            : guestPhone.length > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {guestPhone.length}/10 หลัก
                      </span>
                    </div>

                    <div className="relative mt-1">
                      <Input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        value={guestPhone}
                        onChange={handlePhoneChange}
                        className={`rounded-xl text-xs h-9 pr-8 font-mono font-bold tracking-wider ${
                          isPhoneValid
                            ? "border-emerald-400 bg-emerald-50/20 text-emerald-900 focus-visible:ring-emerald-500"
                            : guestPhone.length > 0
                            ? "border-amber-300 bg-amber-50/20 text-slate-900"
                            : ""
                        }`}
                        required
                      />
                      {isPhoneValid && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>

                    {/* Validation hint */}
                    {guestPhone.length > 0 && !isPhoneValid && (
                      <span className="text-[10px] text-rose-500 mt-1 block flex items-center gap-1 font-medium">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        {!guestPhone.startsWith("0")
                          ? "เบอร์โทรต้องขึ้นต้นด้วยเลข 0"
                          : `ยังขาดอีก ${10 - guestPhone.length} หลัก`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">ทะเบียนรถ / ยี่ห้อรถ (ถ้ามี)</Label>
                    <Input
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      className="mt-1 rounded-xl text-xs h-9"
                    />
                    <span className="text-[10px] text-slate-400">สำหรับจัดช่องจอดรถหน้าห้องพัก</span>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">หมายเหตุพิเศษ</Label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1 rounded-xl text-xs h-9"
                    />
                  </div>
                </div>
              </div>

              {/* NAVIGATION FOOTER STEP 1: CLEAR BACK/CANCEL AND NEXT BUTTONS */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetAndClose}
                  className="rounded-xl text-xs h-10 px-4 text-slate-600 hover:bg-slate-100 border-slate-200 gap-1.5"
                >
                  <X className="w-4 h-4" />
                  ยกเลิก / ปิด
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    if (!currentCustomer && onOpenCustomerLogin) {
                      onOpenCustomerLogin()
                      return
                    }
                    setStep("addons")
                  }}
                  disabled={!isStep1Valid}
                  className={`rounded-xl text-xs h-10 px-5 font-bold transition-all shadow-md ${
                    isStep1Valid
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  {currentCustomer ? "ไปต่อ: เลือกบริการเสริม" : "กรุณาเข้าสู่ระบบก่อนจอง"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: ADD-ONS (WATER, BLANKET, FOOD) */}
          {step === "addons" && (
            <div className="space-y-4">
              <AddOnSelector
                selectedItems={selectedAddOns}
                onChange={setSelectedAddOns}
              />

              {/* NAVIGATION FOOTER STEP 2 */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("details")}
                  className="rounded-xl text-xs h-10 px-3.5 text-slate-700 hover:bg-slate-100 border-slate-200 gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ย้อนกลับ
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResetAndClose}
                    className="rounded-xl text-xs h-10 px-3 text-slate-400 hover:text-slate-700"
                  >
                    ปิด
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setStep("payment")}
                    className="rounded-xl text-xs h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                  >
                    ไปต่อ: สรุปยอดและชำระเงิน
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT & SUMMARY */}
          {step === "payment" && (
            <div className="space-y-4">
              {/* Summary Bill Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm pb-2 border-b border-slate-200 flex justify-between">
                  <span>สรุปรายการค่าใช้จ่าย</span>
                  <span className="text-blue-600 font-extrabold">ห้อง {room.number}</span>
                </h4>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>
                      ค่าห้องพัก ({room.type === "hourly" ? "รายชั่วโมง 3 ชม." : "รายวัน 1 คืน"})
                    </span>
                    <span className="font-semibold text-slate-900">
                      {pricing.basePrice} บาท
                    </span>
                  </div>

                  {pricing.isDiscountApplied && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>ส่วนลดเข้าพักหลัง 18:00 น.</span>
                      <span>-{pricing.discountAmount} บาท</span>
                    </div>
                  )}

                  {/* List Selected Add-ons */}
                  {addOnsArray.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 space-y-1">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        บริการเสริมที่สั่งเพิ่ม:
                      </span>
                      {addOnsArray.map(({ itemId, quantity }) => {
                        const item = ADD_ON_ITEMS.find((a) => a.id === itemId)
                        if (!item) return null
                        return (
                          <div key={itemId} className="flex justify-between text-slate-500 pl-2 text-[11px]">
                            <span>
                              • {item.name} x {quantity} {item.unit}
                            </span>
                            <span>{item.price * quantity} บาท</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="pt-2.5 border-t border-slate-300 flex justify-between items-baseline text-slate-900">
                    <span className="text-xs sm:text-sm font-bold">ยอดชำระสุทธิทั้งสิ้น:</span>
                    <span className="text-xl sm:text-2xl font-black text-blue-700">
                      {formatThaiBaht(pricing.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 block">
                  เลือกช่องทางการชำระเงิน
                </Label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("promptpay")}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === "promptpay"
                        ? "border-blue-600 bg-blue-50/60 text-blue-900 ring-2 ring-blue-500"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-bold">สแกน QR พร้อมเพย์</span>
                    <span className="text-[10px] text-slate-400">ยืนยันอัตโนมัติ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("counter")}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === "counter"
                        ? "border-blue-600 bg-blue-50/60 text-blue-900 ring-2 ring-blue-500"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold">เงินสดหน้าเคาน์เตอร์</span>
                    <span className="text-[10px] text-slate-400">จ่ายตอนรับกุญแจ</span>
                  </button>
                </div>
              </div>

              {/* PromptPay QR Mockup */}
              {paymentMethod === "promptpay" && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center text-center space-y-2.5">
                  <span className="text-xs font-semibold text-slate-300">
                    สแกน QR Code ชำระเงิน {pricing.grandTotal} บาท
                  </span>
                  <div className="bg-white p-2.5 rounded-xl shadow-lg inline-block">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=PROMPTPAY-0997345847-AMOUNT-${pricing.grandTotal}`}
                      alt="PromptPay QR Code"
                      className="w-32 h-32 mx-auto rounded"
                    />
                  </div>
                  <div className="text-xs text-slate-300">
                    พร้อมเพย์: <strong className="text-white">099-734-5847</strong> (บ้านพักเสฏฐสิทธิ์ 24 ชม.)
                  </div>

                  {/* Slip upload simulator */}
                  <div className="w-full pt-1">
                    <label className="cursor-pointer block text-xs bg-slate-800 hover:bg-slate-700 py-2 px-3 rounded-xl transition-colors border border-slate-700">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={() => setSlipUploaded(true)}
                      />
                      {slipUploaded ? (
                        <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1 text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> แนบสลิปเรียบร้อยแล้ว
                        </span>
                      ) : (
                        <span className="text-[11px]">📎 คลิกเพื่อแนบสลิปโอนเงิน (ถ้ามี)</span>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* NAVIGATION FOOTER STEP 3 */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("addons")}
                  className="rounded-xl text-xs h-10 px-3.5 text-slate-700 hover:bg-slate-100 border-slate-200 gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ย้อนกลับ
                </Button>

                <Button
                  type="button"
                  onClick={handleConfirm}
                  className="rounded-xl px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 shadow-emerald-500/25 shadow-md"
                >
                  ยืนยันการจองห้องพัก
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION SUCCESS */}
          {step === "confirmed" && (
            isCancelledSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-rose-600 uppercase tracking-widest block">
                    ยกเลิกการจองเรียบร้อยแล้ว
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    ห้อง {room.number} กลับสู่สถานะว่างแล้ว
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
                    ท่านสามารถเลือกห้องพักใหม่ หรือเลือกเวลาที่ต้องการเข้าพักใหม่ได้ทันทีครับ
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleResetAndClose}
                    className="rounded-xl px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 shadow-md"
                  >
                    กลับสู่หน้าเลือกห้องพัก
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest block">
                    การจองสำเร็จเรียบร้อย
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    รหัสการจอง: {bookingCode}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    บันทึกภาพหน้าจอนี้ไว้เพื่อแสดงต่อเจ้าหน้าที่เมื่อมาถึง
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-2 font-bold text-slate-900">
                    <span>ห้องพักเบอร์ {room.number}</span>
                    <span>{room.type === "hourly" ? "ชั่วคราว 3 ชม." : "รายวัน 1 คืน"}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ชื่อผู้จอง:</span>
                    <span className="font-semibold text-slate-900">{guestName} ({guestPhone})</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>เวลาเข้าพัก:</span>
                    <span className="font-semibold text-slate-900">{getFormattedThaiDate(checkInDate)} เวลา {checkInTime} น.</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>เวลาเช็คเอาต์:</span>
                    <span className="font-semibold text-blue-700">{calculateCheckOut()}</span>
                  </div>
                  {addOnsArray.length > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>ของที่สั่งเพิ่ม:</span>
                      <span className="font-semibold text-slate-900">
                        {addOnsArray.length} รายการ (เตรียมไว้ในห้อง)
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-sm text-slate-900">
                    <span>ยอดชำระ:</span>
                    <span className="text-blue-700">{formatThaiBaht(pricing.grandTotal)}</span>
                  </div>
                </div>

                {/* Action Buttons: LINE / Map / Copy */}
                <div className="max-w-md mx-auto space-y-2 pt-1 text-left">
                  {/* Send to LINE Button (LINE: bassss09902) */}
                  <button
                    type="button"
                    onClick={handleSendToLine}
                    className="w-full py-3 px-4 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.572-3.844 2.572-5.992z" />
                    </svg>
                    <span>ส่งหลักฐาน & แจ้งการจองเข้า LINE (bassss09902)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Google Maps Button */}
                    <button
                      type="button"
                      onClick={handleOpenGoogleMaps}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>เปิดแผนที่นำทาง</span>
                    </button>

                    {/* Copy Details Button */}
                    <button
                      type="button"
                      onClick={handleCopyBookingInfo}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-emerald-700">คัดลอกข้อมูลแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>คัดลอกข้อมูลการจอง</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Cancellation Section (in case booked by mistake) */}
                {isCancelling ? (
                  <div className="max-w-md mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-2.5 animate-in fade-in">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>ยืนยันการยกเลิกการจองห้อง {room.number}?</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      หากกดยกเลิก ห้องพักเบอร์ {room.number} จะถูกปล่อยกลับมาเป็นห้องว่างทันที เพื่อให้ท่านสามารถเลือกห้องหรือเวลาใหม่ได้
                    </p>

                    {/* Refund Notice if PromptPay */}
                    {paymentMethod === "promptpay" && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5 text-xs">
                        <div className="font-bold flex items-center gap-1 text-[11px]">
                          <span>💳 เงื่อนไขคืนเงิน (กรณีโอนเงินแล้ว):</span>
                        </div>
                        <p className="text-[10px] text-amber-800 leading-normal">
                          หากท่านได้โอนเงินพร้อมเพย์แล้ว เมื่อกดยกเลิกห้องพัก กรุณากดปุ่มด้านล่างเพื่อส่งสลิปและเลขบัญชีขอรับเงินคืนผ่าน LINE แอดมินทันที
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
                      <button
                        type="button"
                        onClick={() => setIsCancelling(false)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        ไม่ยกเลิก / เข้าพักต่อ
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteCancel}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        ยืนยันยกเลิกห้องนี้
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCancelling(true)}
                      className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>ต้องการยกเลิกการจองนี้ (กดเลือกห้องหรือเวลาผิด)?</span>
                    </button>
                  </div>
                )}

                <div className="pt-2 flex justify-center">
                  <Button
                    type="button"
                    onClick={handleResetAndClose}
                    className="rounded-xl px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 shadow-md"
                  >
                    เสร็จสิ้น / ปิดหน้าต่าง
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
