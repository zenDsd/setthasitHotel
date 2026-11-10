import { useState, useEffect } from "react"
import { Room, RoomStatus, BookingRecord, CustomerUser, CustomerReview } from "@/types"
import { INITIAL_ROOMS, INITIAL_BOOKINGS, INITIAL_CUSTOMERS, INITIAL_REVIEWS, ADD_ON_ITEMS } from "@/data/mockData"
import { Navbar } from "@/components/Navbar"
import { RoomCard } from "@/components/RoomCard"
import { BookingModal } from "@/components/BookingModal"
import { AdminRack } from "@/components/AdminRack"
import { AdminLoginModal } from "@/components/AdminLoginModal"
import { CustomerAuthModal } from "@/components/CustomerAuthModal"
import { CustomerMyBookingsModal } from "@/components/CustomerMyBookingsModal"
import { CustomerReviewsSection } from "@/components/CustomerReviewsSection"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollToTop } from "@/components/ScrollToTop"
import {
  Clock,
  Moon,
  ShieldCheck,
  Sparkles,
  Car,
  Coffee,
  MapPin,
} from "lucide-react"
import {
  fetchRoomsFromDb,
  fetchBookingsFromDb,
  fetchCustomersFromDb,
  saveBookingToDb,
  updateRoomStatusInDb,
  updateBookingStatusInDb,
  cancelBookingInDb,
  resetAllRoomsInDb,
  saveCustomerToDb,
  subscribeToRealtimeChanges,
  isAdminEmail,
  signOutAuth,
} from "./lib/supabaseService"
import { supabase, isSupabaseConfigured } from "./lib/supabase"

export default function App() {
  const [view, setView] = useState<"guest" | "admin">("guest")
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS)
  const [bookings, setBookings] = useState<BookingRecord[]>(INITIAL_BOOKINGS)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<"all" | "hourly" | "daily">("all")

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  // Customer authentication state
  const [customers, setCustomers] = useState<CustomerUser[]>(INITIAL_CUSTOMERS)
  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(null)
  const [isCustomerLoginOpen, setIsCustomerLoginOpen] = useState(false)
  const [isCustomerBookingsOpen, setIsCustomerBookingsOpen] = useState(false)
  const [authPromptMessage, setAuthPromptMessage] = useState<string>("")

  // Customer reviews state
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    const saved = localStorage.getItem("customer_reviews")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return INITIAL_REVIEWS
      }
    }
    return INITIAL_REVIEWS
  })

  const handleAddNewReview = (newRev: CustomerReview) => {
    setReviews((prev) => {
      const updated = [newRev, ...prev]
      localStorage.setItem("customer_reviews", JSON.stringify(updated))
      return updated
    })
  }

  useEffect(() => {
    // Purge any legacy admin_auth flag from browser
    localStorage.removeItem("admin_auth")
    setIsAdminLoggedIn(false)

    // Check Customer auth in localStorage
    const savedCustomer = localStorage.getItem("customer_auth")
    if (savedCustomer) {
      try {
        setCurrentCustomer(JSON.parse(savedCustomer))
      } catch {
        // ignore parse error
      }
    }

    // Connect Supabase Database, Auth & Realtime sync
    if (isSupabaseConfigured) {
      // Helper to sync user from Supabase Auth (e.g. Google Login)
      const syncAuthUser = (user: any) => {
        const userEmail = user.email || ""
        const isUserAdmin = isAdminEmail(userEmail)

        // Strict: ONLY admin email has admin status
        setIsAdminLoggedIn(isUserAdmin)

        const googleName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          (userEmail ? userEmail.split("@")[0] : "ผู้ใช้ Google")

        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          undefined

        setCurrentCustomer((prev) => {
          const updatedCustomer: CustomerUser = {
            id: user.id,
            name: prev?.name && prev.name !== "ผู้ใช้ Google" ? prev.name : googleName,
            phone: prev?.phone || user.user_metadata?.phone || "",
            email: userEmail,
            avatar: avatarUrl,
            licensePlate: prev?.licensePlate,
            createdAt: user.created_at ? user.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
          }
          localStorage.setItem("customer_auth", JSON.stringify(updatedCustomer))
          saveCustomerToDb(updatedCustomer)
          return updatedCustomer
        })
      }

      // Check current active session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          syncAuthUser(session.user)
        } else {
          setIsAdminLoggedIn(false)
        }
      })

      // Listen for auth state changes (Google OAuth callback redirect, logout, etc.)
      const {
        data: { subscription: authSub },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          syncAuthUser(session.user)
          setIsCustomerLoginOpen(false)
        } else {
          setCurrentCustomer(null)
          setIsAdminLoggedIn(false)
          localStorage.removeItem("customer_auth")
          localStorage.removeItem("admin_auth")
        }
      })

      fetchRoomsFromDb().then((dbRooms) => {
        if (dbRooms && dbRooms.length > 0) setRooms(dbRooms)
      })
      fetchBookingsFromDb().then((dbBookings) => {
        if (dbBookings) setBookings(dbBookings)
      })
      fetchCustomersFromDb().then((dbCustomers) => {
        if (dbCustomers && dbCustomers.length > 0) setCustomers(dbCustomers)
      })

      // Realtime listener
      const unsubscribe = subscribeToRealtimeChanges(
        () => {
          fetchRoomsFromDb().then((dbRooms) => {
            if (dbRooms && dbRooms.length > 0) setRooms(dbRooms)
          })
        },
        () => {
          fetchBookingsFromDb().then((dbBookings) => {
            if (dbBookings) setBookings(dbBookings)
          })
        }
      )

      return () => {
        authSub.unsubscribe()
        unsubscribe()
      }
    }
  }, [])

  // Auto-sync customer phone from past bookings if customer is logged in without phone
  useEffect(() => {
    if (currentCustomer && !currentCustomer.phone && currentCustomer.name && bookings.length > 0) {
      const normName = currentCustomer.name.trim().toLowerCase()
      const matched = bookings.find(
        (b) =>
          b.guestName &&
          b.guestName.trim().toLowerCase() === normName &&
          b.guestPhone
      )
      if (matched?.guestPhone) {
        const updated: CustomerUser = {
          ...currentCustomer,
          phone: matched.guestPhone,
          licensePlate: matched.licensePlate || currentCustomer.licensePlate,
        }
        setCurrentCustomer(updated)
        localStorage.setItem("customer_auth", JSON.stringify(updated))
        saveCustomerToDb(updated)
      }
    }
  }, [currentCustomer?.id, currentCustomer?.phone, currentCustomer?.name, bookings])

  const handleOpenBooking = (room: Room) => {
    setSelectedRoom(room)
    if (!currentCustomer) {
      setAuthPromptMessage(`กรุณาเข้าสู่ระบบ หรือสมัครสมาชิกก่อนทำการจองห้อง ${room.number}`)
      setIsCustomerLoginOpen(true)
      return
    }
    setAuthPromptMessage("")
    setIsBookingModalOpen(true)
  }

  const handleSuccessBooking = (bookingData: any) => {
    const hasAddons = bookingData.selectedAddOns && bookingData.selectedAddOns.length > 0
    const nowTime = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })

    // Create a new BookingRecord
    const newRecord: BookingRecord = {
      id: "bk-" + Date.now(),
      bookingCode: bookingData.bookingCode,
      roomId: bookingData.room.id,
      roomNumber: bookingData.room.number,
      roomType: bookingData.room.type,
      guestName: bookingData.guestName,
      guestPhone: bookingData.guestPhone,
      licensePlate: bookingData.licensePlate,
      checkInDate: bookingData.checkInDate,
      checkInTime: bookingData.checkInTime,
      checkOutTime: bookingData.checkOutTime,
      notes: bookingData.notes,
      selectedAddOns: bookingData.selectedAddOns || [],
      roomPrice: bookingData.pricing.finalRoomPrice,
      addOnsPrice: bookingData.pricing.addOnsTotal,
      discountAmount: bookingData.pricing.discountAmount,
      totalPrice: bookingData.pricing.grandTotal,
      paymentMethod: bookingData.paymentMethod,
      paymentStatus: bookingData.paymentMethod === "promptpay" ? "paid" : "cash_on_arrival",
      slipImage: bookingData.paymentMethod === "promptpay"
        ? "https://images.unsplash.com/photo-1554415707-9e4966668206?auto=format&fit=crop&w=600&q=80"
        : undefined,
      deliveryStatus: hasAddons ? "pending" : "none",
      createdAt: nowTime,
      source: "web",
    }

    setBookings((prev) => [newRecord, ...prev])

    // Update room status to occupied in real-time
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === bookingData.room.id) {
          return {
            ...r,
            status: "occupied" as RoomStatus,
            currentBooking: {
              bookingCode: bookingData.bookingCode,
              guestName: bookingData.guestName,
              guestPhone: bookingData.guestPhone,
              checkInTime: bookingData.checkInTime,
              checkOutTime: bookingData.checkOutTime,
              plateNumber: bookingData.licensePlate,
              notes: bookingData.notes,
              paymentMethod: bookingData.paymentMethod,
              paymentStatus: bookingData.paymentMethod === "promptpay" ? "paid" : "cash_on_arrival",
            },
          }
        }
        return r
      })
    )
    // Save to Supabase DB
    saveBookingToDb(newRecord)

    // Auto-update currentCustomer's phone & licensePlate if they weren't set yet
    if (bookingData.guestPhone) {
      setCurrentCustomer((prev) => {
        if (!prev) return prev
        const updated: CustomerUser = {
          ...prev,
          phone: prev.phone || bookingData.guestPhone,
          licensePlate: bookingData.licensePlate || prev.licensePlate,
        }
        localStorage.setItem("customer_auth", JSON.stringify(updated))
        saveCustomerToDb(updated)
        return updated
      })
    }
  }

  const handleUpdateRoomStatus = (
    roomId: string,
    newStatus: RoomStatus,
    bookingDetails?: any
  ) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            status: newStatus,
            currentBooking: newStatus === "occupied" ? bookingDetails : undefined,
          }
        }
        return r
      })
    )

    // Sync room status to Supabase
    updateRoomStatusInDb(roomId, newStatus, bookingDetails)

    // If walk-in occupied, add to bookings list
    if (newStatus === "occupied" && bookingDetails) {
      const room = rooms.find((r) => r.id === roomId)
      if (room) {
        const isHourly = room.type === "hourly"
        const roomPrice = isHourly ? 200 : 400
        const nowTime = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })

        const newRecord: BookingRecord = {
          id: "bk-" + Date.now(),
          bookingCode: bookingDetails.bookingCode || "WK-" + Math.floor(100000 + Math.random() * 900000),
          roomId: room.id,
          roomNumber: room.number,
          roomType: room.type,
          guestName: bookingDetails.guestName,
          guestPhone: bookingDetails.guestPhone,
          licensePlate: bookingDetails.plateNumber,
          checkInDate: new Date().toISOString().split("T")[0],
          checkInTime: bookingDetails.checkInTime,
          checkOutTime: bookingDetails.checkOutTime,
          selectedAddOns: [],
          roomPrice: roomPrice,
          addOnsPrice: 0,
          discountAmount: 0,
          totalPrice: roomPrice,
          paymentMethod: bookingDetails.paymentMethod || "cash",
          paymentStatus: bookingDetails.paymentStatus || "cash_on_arrival",
          deliveryStatus: "none",
          createdAt: nowTime,
          source: "walk-in",
        }
        setBookings((prev) => [newRecord, ...prev])
        saveBookingToDb(newRecord)
      }
    }
  }

  const handleUpdateBookingStatus = (bookingId: string, updates: Partial<BookingRecord>) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...updates } : b))
    )
    updateBookingStatusInDb(bookingId, updates)
  }

  const handleExtendHourlyStay = (roomId: string, extraHours: number) => {
    let updatedBookingForDb: any = null

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId && r.currentBooking) {
          const currentOut = r.currentBooking.checkOutTime
          const parts = currentOut.split(":")
          let newOut = currentOut
          if (parts.length >= 2) {
            const h = parseInt(parts[0], 10)
            const m = parts[1].replace(/[^0-9]/g, "")
            const newH = (h + extraHours) % 24
            newOut = `${newH.toString().padStart(2, "0")}:${m} น.`
          }
          updatedBookingForDb = {
            ...r.currentBooking,
            checkOutTime: newOut,
          }
          return {
            ...r,
            currentBooking: updatedBookingForDb,
          }
        }
        return r
      })
    )

    // Add extra price (+50฿ per hour) to the latest booking for this room
    setBookings((prev) =>
      prev.map((b) => {
        if (b.roomId === roomId) {
          const newTotal = b.totalPrice + extraHours * 50
          const newRoomPrice = b.roomPrice + extraHours * 50
          updateBookingStatusInDb(b.id, {
            totalPrice: newTotal,
            roomPrice: newRoomPrice,
          })
          return {
            ...b,
            totalPrice: newTotal,
            roomPrice: newRoomPrice,
          }
        }
        return b
      })
    )

    if (updatedBookingForDb) {
      updateRoomStatusInDb(roomId, "occupied", updatedBookingForDb)
    }
  }

  // Customer order extra add-ons while in room
  const handleOrderAdditionalAddOns = (roomId: string, extraAddOns: { itemId: string; quantity: number }[]) => {
    const extraTotal = extraAddOns.reduce((sum, item) => {
      const found = ADD_ON_ITEMS.find((a) => a.id === item.itemId)
      return sum + (found ? found.price * item.quantity : 0)
    }, 0)

    setBookings((prev) =>
      prev.map((b) => {
        if (b.roomId === roomId) {
          return {
            ...b,
            selectedAddOns: [...b.selectedAddOns, ...extraAddOns],
            addOnsPrice: b.addOnsPrice + extraTotal,
            totalPrice: b.totalPrice + extraTotal,
            deliveryStatus: "pending",
          }
        }
        return b
      })
    )
  }

  // Customer Auth handlers
  const handleCustomerLoginSuccess = (customer: CustomerUser) => {
    setCurrentCustomer(customer)
    localStorage.setItem("customer_auth", JSON.stringify(customer))
    setIsCustomerLoginOpen(false)
    setAuthPromptMessage("")
    if (selectedRoom) {
      setIsBookingModalOpen(true)
    }
  }

  const handleCustomerLogout = async () => {
    setCurrentCustomer(null)
    localStorage.removeItem("customer_auth")
    setIsCustomerBookingsOpen(false)
    await signOutAuth()
  }

  const handleRegisterCustomer = (newCustomer: CustomerUser) => {
    setCustomers((prev) => [newCustomer, ...prev])
    saveCustomerToDb(newCustomer)
  }

  // Admin Auth handlers
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true)
    setView("admin")
  }

  const handleResetAllBookings = () => {
    setRooms((prev) =>
      prev.map((r) => ({
        ...r,
        status: "available",
        currentBooking: undefined,
      }))
    )
    setBookings([])
    resetAllRoomsInDb()
  }

  const handleAdminLogout = async () => {
    setIsAdminLoggedIn(false)
    localStorage.removeItem("admin_auth")
    setView("guest")
    await signOutAuth()
  }

  // Booking Cancellation handler
  const handleCancelBooking = async (bookingCodeOrId: string, roomId: string) => {
    // 1. Immediately reset room status in local state to available
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, status: "available" as RoomStatus, currentBooking: undefined }
          : r
      )
    )

    // 2. Mark booking as cancelled in local state
    setBookings((prev) =>
      prev.map((b) =>
        b.bookingCode === bookingCodeOrId || b.id === bookingCodeOrId || b.roomId === roomId
          ? { ...b, paymentStatus: "cancelled" as const, deliveryStatus: "cancelled" as const }
          : b
      )
    )

    // 3. Find target booking ID to update in Supabase DB
    const targetBooking = bookings.find(
      (b) => b.bookingCode === bookingCodeOrId || b.id === bookingCodeOrId || b.roomId === roomId
    )
    const bookingId = targetBooking ? targetBooking.id : bookingCodeOrId
    await cancelBookingInDb(bookingId, roomId)
  }

  const filteredRooms = [...rooms]
    .filter((room) => {
      if (filterType === "all") return true
      return room.type === filterType
    })
    .sort((a, b) => {
      // 1. ห้องที่ยังไม่ได้จอง (available) ขึ้นก่อน
      // 2. ห้องที่จองแล้ว (occupied / อื่นๆ) อยู่ด้านหลังสุด
      const aAvailable = a.status === "available" ? 0 : 1
      const bAvailable = b.status === "available" ? 0 : 1

      if (aAvailable !== bAvailable) {
        return aAvailable - bAvailable
      }

      // เรียงลำดับไล่ตามเลขห้อง (1, 2, 3... 10)
      return Number(a.number) - Number(b.number)
    })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-sky-50/40 to-slate-100/90 text-slate-900 selection:bg-blue-600 selection:text-white relative overflow-x-hidden flex flex-col">
      {/* Soft Ambient Glows in Background */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-br from-blue-400/10 via-indigo-300/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-amber-200/10 via-sky-200/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar */}
      <Navbar
        currentView={view}
        onViewChange={(v) => {
          if (v === "admin" && !isAdminLoggedIn) {
            setIsLoginModalOpen(true)
          } else {
            setView(v)
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setIsLoginModalOpen(true)}
        onAdminLogout={handleAdminLogout}
        currentCustomer={currentCustomer}
        onOpenCustomerLogin={() => {
          setAuthPromptMessage("")
          setIsCustomerLoginOpen(true)
        }}
        onOpenCustomerBookings={() => setIsCustomerBookingsOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6">
        {view === "admin" && isAdminLoggedIn ? (
          /* ADMIN VIEW */
          <AdminRack
            rooms={rooms}
            bookings={bookings}
            onUpdateRoomStatus={handleUpdateRoomStatus}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onExtendHourlyStay={handleExtendHourlyStay}
            onLogout={handleAdminLogout}
            onBackToHome={() => setView("guest")}
            onResetAllBookings={handleResetAllBookings}
          />
        ) : (
          /* GUEST BOOKING VIEW */
          <div className="space-y-6 sm:space-y-8">
            {/* Hero Banner (Compact & Premium with Welcoming Mascot) */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-4 sm:p-6 lg:p-7 shadow-xl border border-blue-900/40">
              <div className="relative z-10">
                {/* Content */}
                <div className="w-full space-y-3">
                  <div>
                    {/* Title & Description Area */}
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/30 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium text-blue-200">
                        <Sparkles className="w-3 h-3 text-blue-300" />
                        สะอาด ปลอดภัย 24 ชม.
                      </div>

                      <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                        บ้านพักเสฏฐสิทธิ์
                      </h1>

                      <p className="text-slate-300 text-[11px] sm:text-sm max-w-xl leading-relaxed">
                        10 ห้อง • รายชั่วโมง & รายวัน • แอร์เย็น ที่จอดรถหน้าห้อง ส่งของถึงห้อง 24 ชม.
                      </p>

                      <div className="pt-0.5">
                        <a
                          href="https://www.google.com/maps/search/?api=1&query=%E0%B8%9A%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%9E%E0%B8%B1%E0%B8%81%E0%B9%80%E0%B8%AA%E0%B8%8F%E0%B8%90%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%B4%E0%B9%8C+137+%E0%B8%A1.8+%E0%B8%95%E0%B8%B3%E0%B8%9A%E0%B8%A5+%E0%B8%97%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B8%B2%E0%B8%87+%E0%B9%80%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%87+%E0%B8%8A%E0%B8%B8%E0%B8%A1%E0%B8%9E%E0%B8%A3+86000"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>137 ม.8 ต.ท่ายาง อ.เมือง จ.ชุมพร 86000 (เปิด Google Maps นำทาง)</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* 2 Core Price Cards (Compact) */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-0.5">
                    <div className="bg-white/10 border border-white/15 rounded-xl p-2.5 sm:p-3 backdrop-blur-sm">
                      <div className="flex items-center gap-1 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                        <Clock className="w-3 h-3" />
                        พักชั่วคราว
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-black">200฿</span>
                        <span className="text-slate-300 text-[11px] font-semibold">/ 3 ชม.</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">ห้อง 1-5 (แอร์ฉ่ำ, ทีวี)</p>
                    </div>

                    <div className="bg-white/10 border border-white/15 rounded-xl p-2.5 sm:p-3 backdrop-blur-sm">
                      <div className="flex items-center gap-1 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                        <Moon className="w-3 h-3" />
                        พักค้างคืน
                      </div>
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="text-xl sm:text-2xl font-black">400฿</span>
                        <span className="text-[9px] bg-emerald-500/90 text-white px-1.5 py-0.5 rounded font-bold">
                          18:00+ เหลือ 351฿
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">ห้อง 6-10 (ออกก่อน 12:00)</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 -mb-16 w-48 h-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
            </div>

            {/* Room Features Bar (Compact) */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-600">
              <div className="bg-white/80 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 flex flex-col items-center text-center gap-1">
                <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                <span className="font-medium leading-tight">ที่จอดรถ</span>
              </div>
              <div className="bg-white/80 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 flex flex-col items-center text-center gap-1">
                <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                <span className="font-medium leading-tight">ส่งของ 24 ชม.</span>
              </div>
              <div className="bg-white/80 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 flex flex-col items-center text-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span className="font-medium leading-tight">ปลอดภัย</span>
              </div>
            </div>

            {/* Filter Tabs & Title */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    เลือกห้องพัก
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    กดเลือกห้องว่างเพื่อจองทันที
                  </p>
                </div>

                {/* Filter buttons */}
                <div className="bg-slate-200/90 p-0.5 rounded-xl grid grid-cols-3 sm:flex items-center gap-0.5 text-[11px] w-full sm:w-auto font-bold">
                  <button
                    type="button"
                    onClick={() => setFilterType("all")}
                    className={`py-1.5 px-2.5 rounded-lg transition-all text-center ${
                      filterType === "all"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ทั้งหมด (10)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("hourly")}
                    className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                      filterType === "hourly"
                        ? "bg-white text-amber-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>ชั่วโมง (1-5)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("daily")}
                    className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                      filterType === "daily"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Moon className="w-3 h-3 shrink-0" />
                    <span>รายวัน (6-10)</span>
                  </button>
                </div>
              </div>

              {/* Room Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onSelect={handleOpenBooking}
                  />
                ))}
              </div>
            </div>

            {/* Service & Addon Showcase Box */}
            <Card className="p-4 sm:p-6 bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/90 border border-blue-200/80 rounded-3xl shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                <div className="space-y-1">
                  <Badge variant="indigo" className="text-[10px] sm:text-xs">
                    บริการเสริมครบวงจร
                  </Badge>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    อยากได้อะไรเพิ่ม? ระบุตอนจองได้ทันที!
                  </h3>
                  <p className="text-xs text-slate-600">
                    ไม่ว่าจะเป็นน้ำดื่มเย็นๆ, น้ำแข็ง, ผ้าห่มหนานุ่มเสริม, หมอนเพิ่ม,
                    หรือมาม่าคัพ ทางเราเตรียมไว้ให้ในห้องพักก่อนคุณมาถึง
                  </p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
                  <span className="text-xs bg-white text-blue-700 font-bold px-2.5 py-1.5 rounded-xl border border-blue-200/80 shadow-2xs">
                    💧 น้ำดื่ม 10.-
                  </span>
                  <span className="text-xs bg-white text-blue-700 font-bold px-2.5 py-1.5 rounded-xl border border-blue-200/80 shadow-2xs">
                    🛏️ ผ้าห่มเสริม 50.-
                  </span>
                  <span className="text-xs bg-white text-blue-700 font-bold px-2.5 py-1.5 rounded-xl border border-blue-200/80 shadow-2xs">
                    🍜 มาม่าคัพ 20.-
                  </span>
                </div>
              </div>
            </Card>
            {/* Customer Reviews Section */}
            <CustomerReviewsSection
              reviews={reviews}
              onAddReview={handleAddNewReview}
              currentCustomer={currentCustomer}
              onOpenLogin={() => {
                setAuthPromptMessage("กรุณาเข้าสู่ระบบก่อนเขียนรีวิวครับ")
                setIsCustomerLoginOpen(true)
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white/90 backdrop-blur-sm border-t border-slate-200/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-700">
              บ้านพักเสฏฐสิทธิ์ 24 ชั่วโมง
            </p>
            <p className="text-slate-500 mt-0.5">
              📍 137 ม.8 ต.ท่ายาง อ.เมือง จ.ชุมพร 86000
            </p>
            <p className="text-slate-400 mt-0.5">
              บริการห้องพักรายชั่วโมง (3 ชม. 200.-) และรายวัน (400.- / หลัง 18:00 น. 350.-)
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a href="tel:0997345847" className="hover:text-blue-600 font-medium">โทร: 099-734-5847</a>
            <a
              href="https://line.me/ti/p/~bassss09902"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#06C755] font-semibold text-[#06C755]"
            >
              LINE: bassss09902
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=%E0%B8%9A%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%9E%E0%B8%B1%E0%B8%81%E0%B9%80%E0%B8%AA%E0%B8%8F%E0%B8%90%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%B4%E0%B9%8C+137+%E0%B8%A1.8+%E0%B8%95%E0%B8%B3%E0%B8%9A%E0%B8%A5+%E0%B8%97%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B8%B2%E0%B8%87+%E0%B9%80%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%87+%E0%B8%8A%E0%B8%B8%E0%B8%A1%E0%B8%9E%E0%B8%A3+86000"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 font-medium"
            >
              📍 แผนที่นำทาง GPS (ชุมพร)
            </a>
            {isAdminLoggedIn && (
              <button
                onClick={() => setView(view === "guest" ? "admin" : "guest")}
                className="text-blue-600 hover:underline font-semibold"
              >
                {view === "guest" ? "ระบบจัดการหลังบ้าน (Admin)" : "กลับหน้าลูกค้า"}
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Scroll to Top Floating Button */}
      <ScrollToTop />

      {/* Booking Modal */}
      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          open={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false)
            setSelectedRoom(null)
          }}
          onSuccessBooking={handleSuccessBooking}
          onCancelBooking={handleCancelBooking}
          currentCustomer={currentCustomer}
          onOpenCustomerLogin={() => {
            setAuthPromptMessage("")
            setIsCustomerLoginOpen(true)
          }}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        open={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Customer Auth (Login / Register) Modal */}
      <CustomerAuthModal
        open={isCustomerLoginOpen}
        onClose={() => {
          setIsCustomerLoginOpen(false)
          setAuthPromptMessage("")
        }}
        onLoginSuccess={handleCustomerLoginSuccess}
        customers={customers}
        onRegisterCustomer={handleRegisterCustomer}
        promptMessage={authPromptMessage}
      />

      {/* Customer My Bookings & In-Room Service Modal */}
      {currentCustomer && (
        <CustomerMyBookingsModal
          open={isCustomerBookingsOpen}
          onClose={() => setIsCustomerBookingsOpen(false)}
          customer={currentCustomer}
          bookings={bookings}
          rooms={rooms}
          onLogout={handleCustomerLogout}
          onOrderAdditionalAddOns={handleOrderAdditionalAddOns}
          onCancelBooking={handleCancelBooking}
          onExtendHourlyStay={handleExtendHourlyStay}
        />
      )}
    </div>
  )
}
