import { useState } from "react"
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Zap } from "lucide-react"

interface ThaiDateTimePickerProps {
  checkInDate: string // YYYY-MM-DD
  setCheckInDate: (date: string) => void
  checkInTime: string // HH:mm
  setCheckInTime: (time: string) => void
  roomType: "hourly" | "daily"
  calculateCheckOut: () => string
}

const THAI_MONTHS_FULL = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
]

const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
]

const THAI_DAYS_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."]

export function ThaiDateTimePicker({
  checkInDate,
  setCheckInDate,
  checkInTime,
  setCheckInTime,
  roomType,
  calculateCheckOut,
}: ThaiDateTimePickerProps) {
  // Calendar View month/year state
  const initialDate = checkInDate ? new Date(checkInDate) : new Date()
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear())
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Today reference (midnight)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  // Tomorrow
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`

  // Day after tomorrow
  const dayAfterTomorrow = new Date(today)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
  const dayAfterTomorrowStr = `${dayAfterTomorrow.getFullYear()}-${String(dayAfterTomorrow.getMonth() + 1).padStart(2, "0")}-${String(dayAfterTomorrow.getDate()).padStart(2, "0")}`

  // Format custom date string
  const formatCompactDate = (dateStr: string) => {
    try {
      const parts = dateStr.split("-").map(Number)
      if (parts.length !== 3) return dateStr
      const d = new Date(parts[0], parts[1] - 1, parts[2])
      return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`
    } catch {
      return dateStr
    }
  }

  const isCustomDate =
    checkInDate !== todayStr &&
    checkInDate !== tomorrowStr &&
    checkInDate !== dayAfterTomorrowStr

  // Quick date setter
  const handleSelectDate = (dateStr: string) => {
    setCheckInDate(dateStr)
    const parts = dateStr.split("-").map(Number)
    if (parts.length === 3) {
      setViewYear(parts[0])
      setViewMonth(parts[1] - 1)
    }
  }

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  // Days in month calculation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay()

  // Time parsing
  const [currentHourStr, currentMinuteStr] = checkInTime.split(":")
  const currentHour = currentHourStr || "14"
  const currentMinute = currentMinuteStr || "00"

  const handleHourChange = (newHour: string) => {
    setCheckInTime(`${newHour.padStart(2, "0")}:${currentMinute}`)
  }

  const handleMinuteChange = (newMinute: string) => {
    setCheckInTime(`${currentHour}:${newMinute.padStart(2, "0")}`)
  }

  const handleSetNow = () => {
    const now = new Date()
    const h = now.getHours().toString().padStart(2, "0")
    const m = (Math.ceil(now.getMinutes() / 5) * 5 % 60).toString().padStart(2, "0")
    setCheckInTime(`${h}:${m}`)
    handleSelectDate(todayStr)
  }

  return (
    <div className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-2.5 sm:p-3 space-y-2 shadow-2xs">
      {/* 1. Header Row: Title & Real-time Checkout Badge */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <CalendarIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>วัน & เวลาเข้าพัก</span>
        </div>
        <div className="text-[10px] sm:text-[11px] font-bold text-blue-800 bg-blue-100/80 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3 text-blue-600 shrink-0" />
          <span>ออก: {calculateCheckOut()}</span>
        </div>
      </div>

      {/* 2. Compact Date Selector (1 Row of 4 Pills) */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 text-center">
          {/* วันนี้ */}
          <button
            type="button"
            onClick={() => {
              handleSelectDate(todayStr)
              setIsCalendarOpen(false)
            }}
            className={`py-1.5 px-0.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all border ${
              checkInDate === todayStr && !isCalendarOpen
                ? "bg-blue-600 text-white border-blue-600 shadow-2xs scale-[1.02]"
                : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50"
            }`}
          >
            <span className="text-[9px] block font-medium opacity-75 leading-tight">วันนี้</span>
            <span className="leading-tight block font-extrabold">
              {today.getDate()} {THAI_MONTHS_SHORT[today.getMonth()]}
            </span>
          </button>

          {/* พรุ่งนี้ */}
          <button
            type="button"
            onClick={() => {
              handleSelectDate(tomorrowStr)
              setIsCalendarOpen(false)
            }}
            className={`py-1.5 px-0.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all border ${
              checkInDate === tomorrowStr && !isCalendarOpen
                ? "bg-blue-600 text-white border-blue-600 shadow-2xs scale-[1.02]"
                : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50"
            }`}
          >
            <span className="text-[9px] block font-medium opacity-75 leading-tight">พรุ่งนี้</span>
            <span className="leading-tight block font-extrabold">
              {tomorrow.getDate()} {THAI_MONTHS_SHORT[tomorrow.getMonth()]}
            </span>
          </button>

          {/* มะรืนนี้ */}
          <button
            type="button"
            onClick={() => {
              handleSelectDate(dayAfterTomorrowStr)
              setIsCalendarOpen(false)
            }}
            className={`py-1.5 px-0.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all border ${
              checkInDate === dayAfterTomorrowStr && !isCalendarOpen
                ? "bg-blue-600 text-white border-blue-600 shadow-2xs scale-[1.02]"
                : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50"
            }`}
          >
            <span className="text-[9px] block font-medium opacity-75 leading-tight">มะรืนนี้</span>
            <span className="leading-tight block font-extrabold">
              {dayAfterTomorrow.getDate()} {THAI_MONTHS_SHORT[dayAfterTomorrow.getMonth()]}
            </span>
          </button>

          {/* วันอื่น / ปฏิทิน */}
          <button
            type="button"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className={`py-1.5 px-0.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all border ${
              isCustomDate || isCalendarOpen
                ? "bg-blue-600 text-white border-blue-600 shadow-2xs scale-[1.02]"
                : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50"
            }`}
          >
            <span className="text-[9px] block font-medium opacity-75 leading-tight">
              {isCalendarOpen ? "ปิดปฏิทิน" : isCustomDate ? "เลือกแล้ว" : "วันอื่น"}
            </span>
            <span className="leading-tight flex items-center justify-center gap-0.5 font-extrabold">
              {isCustomDate ? formatCompactDate(checkInDate) : "ปฏิทิน 📅"}
            </span>
          </button>
        </div>

        {/* Collapsible Thai Calendar Dropdown */}
        {isCalendarOpen && (
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={prevMonth}
                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                aria-label="เดือนก่อนหน้า"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="text-xs font-black text-slate-900">
                {THAI_MONTHS_FULL[viewMonth]} {viewYear + 543}
              </span>

              <button
                type="button"
                onClick={nextMonth}
                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                aria-label="เดือนถัดไป"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400">
              {THAI_DAYS_SHORT.map((day, idx) => (
                <span key={day} className={idx === 0 ? "text-rose-500" : idx === 6 ? "text-purple-600" : ""}>
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-6 w-full" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1
                const dateObj = new Date(viewYear, viewMonth, dayNum)
                dateObj.setHours(0, 0, 0, 0)
                const isPast = dateObj.getTime() < today.getTime()
                const dateFormatted = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
                const isSelected = checkInDate === dateFormatted

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    disabled={isPast}
                    onClick={() => {
                      setCheckInDate(dateFormatted)
                      setIsCalendarOpen(false)
                    }}
                    className={`h-6 w-full rounded-lg text-[11px] font-bold transition-all ${
                      isPast
                        ? "opacity-25 text-slate-300 cursor-not-allowed"
                        : isSelected
                        ? "bg-blue-600 text-white shadow-xs font-black scale-105"
                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    {dayNum}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Compact Time Selector */}
      <div className="bg-white p-2 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5">
        {/* Time Row 1: Current Selection & Custom Dropdowns & Set Now */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] font-medium text-slate-500">เวลาเข้าพัก:</span>
            <span className="font-black text-blue-900 text-xs sm:text-sm">{checkInTime} น.</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Set Now */}
            <button
              type="button"
              onClick={handleSetNow}
              className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-0.5 active:scale-95"
            >
              <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              <span>ตอนนี้</span>
            </button>

            {/* Custom Select Dropdowns */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-0.5 text-xs font-bold text-slate-800">
              <select
                value={currentHour}
                onChange={(e) => handleHourChange(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-900 outline-none cursor-pointer"
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const hStr = i.toString().padStart(2, "0")
                  return (
                    <option key={hStr} value={hStr}>
                      {hStr}:00
                    </option>
                  )
                })}
              </select>
              <span className="text-slate-400 font-bold px-0.5">:</span>
              <select
                value={currentMinute}
                onChange={(e) => handleMinuteChange(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-900 outline-none cursor-pointer"
              >
                {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                  <option key={m} value={m}>
                    {m} น.
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Time Row 2: Preset Buttons (No Scrollbar, clean chips) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {(roomType === "hourly"
            ? ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]
            : ["14:00", "16:00", "18:00", "20:00", "22:00"]
          ).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setCheckInTime(t)}
              className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] whitespace-nowrap font-bold transition-all shrink-0 ${
                checkInTime === t
                  ? "bg-blue-600 text-white shadow-2xs scale-[1.02]"
                  : roomType === "daily" && t >= "18:00"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t} {roomType === "daily" && t >= "18:00" && "⚡350฿"}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
