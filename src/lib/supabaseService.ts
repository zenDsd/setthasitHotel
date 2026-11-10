import { supabase, isSupabaseConfigured } from "./supabase"
import { Room, BookingRecord, CustomerUser, RoomStatus } from "@/types"

// Helper: Convert DB room row to frontend Room interface
export function mapDbToRoom(row: any): Room {
  return {
    id: row.id,
    number: String(row.number),
    name: row.name,
    type: row.type,
    status: row.status as RoomStatus,
    floor: Number(row.floor) || 1,
    capacity: Number(row.capacity) || 2,
    bedType: row.bed_type || row.bedType || "เตียงคิงไซส์ 6 ฟุต",
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    images: Array.isArray(row.images) ? row.images : [],
    currentBooking: row.current_booking || row.currentBooking || undefined,
  }
}

// Helper: Convert frontend Room to DB row
export function mapRoomToDb(room: Room): any {
  return {
    id: room.id,
    number: room.number,
    name: room.name,
    type: room.type,
    status: room.status,
    floor: room.floor,
    capacity: room.capacity,
    bed_type: room.bedType,
    amenities: room.amenities,
    images: room.images,
    current_booking: room.currentBooking || null,
  }
}

// Helper: Convert DB booking row to frontend BookingRecord
export function mapDbToBooking(row: any): BookingRecord {
  let displayTime = ""
  try {
    if (row.created_at) {
      const d = new Date(row.created_at)
      displayTime = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
    }
  } catch {
    displayTime = row.created_at || ""
  }

  return {
    id: row.id,
    bookingCode: row.booking_code || row.bookingCode,
    roomId: row.room_id || row.roomId,
    roomNumber: String(row.room_number || row.roomNumber),
    roomType: row.room_type || row.roomType,
    guestName: row.guest_name || row.guestName,
    guestPhone: row.guest_phone || row.guestPhone,
    licensePlate: row.license_plate || row.licensePlate || undefined,
    checkInDate: row.check_in_date || row.checkInDate,
    checkInTime: row.check_in_time || row.checkInTime,
    checkOutTime: row.check_out_time || row.checkOutTime,
    notes: row.notes || undefined,
    selectedAddOns: Array.isArray(row.selected_add_ons) ? row.selected_add_ons : [],
    roomPrice: Number(row.room_price) || 0,
    addOnsPrice: Number(row.add_ons_price) || 0,
    discountAmount: Number(row.discount_amount) || 0,
    totalPrice: Number(row.total_price) || 0,
    paymentMethod: row.payment_method || row.paymentMethod,
    paymentStatus: row.payment_status || row.paymentStatus || "paid",
    slipImage: row.slip_image || row.slipImage || undefined,
    deliveryStatus: row.delivery_status || row.deliveryStatus || "pending",
    createdAt: displayTime || row.created_at || "",
    source: row.source || "web",
  }
}

// Helper: Convert frontend BookingRecord to DB row
export function mapBookingToDb(b: BookingRecord): any {
  // Ensure valid ISO timestamptz for PostgreSQL
  let isoDate = new Date().toISOString()
  if (b.createdAt && b.createdAt.includes("T")) {
    isoDate = b.createdAt
  }

  return {
    id: b.id,
    booking_code: b.bookingCode,
    room_id: b.roomId,
    room_number: b.roomNumber,
    room_type: b.roomType,
    guest_name: b.guestName,
    guest_phone: b.guestPhone,
    license_plate: b.licensePlate || null,
    check_in_date: b.checkInDate,
    check_in_time: b.checkInTime,
    check_out_time: b.checkOutTime,
    notes: b.notes || null,
    selected_add_ons: b.selectedAddOns || [],
    room_price: b.roomPrice,
    add_ons_price: b.addOnsPrice,
    discount_amount: b.discountAmount,
    total_price: b.totalPrice,
    payment_method: b.paymentMethod,
    payment_status: b.paymentStatus,
    slip_image: b.slipImage || null,
    delivery_status: b.deliveryStatus,
    created_at: isoDate,
    source: b.source || "web",
  }
}

// Helper: Convert DB customer to frontend CustomerUser
export function mapDbToCustomer(row: any): CustomerUser {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    licensePlate: row.license_plate || undefined,
    password: row.password || "1234",
    createdAt: row.created_at || undefined,
  }
}

// -------------------------------------------------------------
// Database Operations with automatic fallback
// -------------------------------------------------------------

export async function fetchRoomsFromDb(): Promise<Room[] | null> {
  if (!isSupabaseConfigured) return null
  try {
    const { data, error } = await supabase.from("rooms").select("*")
    if (error || !data || data.length === 0) return null
    // Sort by room number 1..10
    const sorted = [...data].sort((a, b) => Number(a.number) - Number(b.number))
    return sorted.map(mapDbToRoom)
  } catch {
    return null
  }
}

export async function fetchBookingsFromDb(): Promise<BookingRecord[] | null> {
  if (!isSupabaseConfigured) return null
  try {
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false })
    if (error || !data) return null
    return data.map(mapDbToBooking)
  } catch {
    return null
  }
}

export async function fetchCustomersFromDb(): Promise<CustomerUser[] | null> {
  if (!isSupabaseConfigured) return null
  try {
    const { data, error } = await supabase.from("customers").select("*")
    if (error || !data) return null
    return data.map(mapDbToCustomer)
  } catch {
    return null
  }
}

export async function saveBookingToDb(booking: BookingRecord): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  try {
    const dbBooking = mapBookingToDb(booking)
    const { error: bError } = await supabase.from("bookings").insert([dbBooking])
    if (bError) console.error("Error inserting booking:", bError)

    // Update room status in DB
    const { error: rError } = await supabase
      .from("rooms")
      .update({
        status: "occupied",
        current_booking: {
          bookingCode: booking.bookingCode,
          guestName: booking.guestName,
          guestPhone: booking.guestPhone,
          checkInTime: booking.checkInTime,
          checkOutTime: booking.checkOutTime,
          plateNumber: booking.licensePlate,
          notes: booking.notes,
          paymentMethod: booking.paymentMethod,
          paymentStatus: booking.paymentStatus,
        },
      })
      .eq("id", booking.roomId)
    if (rError) console.error("Error updating room status:", rError)

    return !bError
  } catch (err) {
    console.error("Save booking failed:", err)
    return false
  }
}

export async function updateRoomStatusInDb(
  roomId: string,
  newStatus: RoomStatus,
  bookingDetails?: any
): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  try {
    const { error } = await supabase
      .from("rooms")
      .update({
        status: newStatus,
        current_booking: newStatus === "occupied" ? bookingDetails : null,
      })
      .eq("id", roomId)
    return !error
  } catch {
    return false
  }
}

export async function updateBookingStatusInDb(
  bookingId: string,
  updates: Partial<BookingRecord>
): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  try {
    const dbUpdates: any = {}
    if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus
    if (updates.deliveryStatus) dbUpdates.delivery_status = updates.deliveryStatus
    if (updates.totalPrice !== undefined) dbUpdates.total_price = updates.totalPrice
    if (updates.roomPrice !== undefined) dbUpdates.room_price = updates.roomPrice

    const { error } = await supabase.from("bookings").update(dbUpdates).eq("id", bookingId)
    return !error
  } catch {
    return false
  }
}

export async function cancelBookingInDb(bookingId: string, roomId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  try {
    // Reset room status to available
    const { error: rError } = await supabase
      .from("rooms")
      .update({ status: "available", current_booking: null })
      .eq("id", roomId)
    if (rError) console.error("Error resetting room status:", rError)

    // Update booking status to cancelled
    const { error: bError } = await supabase
      .from("bookings")
      .update({ payment_status: "cancelled", delivery_status: "cancelled" })
      .eq("id", bookingId)
    if (bError) console.error("Error cancelling booking:", bError)

    return !rError && !bError
  } catch (err) {
    console.error("Cancel booking failed:", err)
    return false
  }
}

export async function resetAllRoomsInDb(): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  try {
    await supabase.from("rooms").update({ status: "available", current_booking: null }).neq("id", "none")
    await supabase.from("bookings").delete().neq("id", "none")
    return true
  } catch {
    return false
  }
}

export async function saveCustomerToDb(customer: CustomerUser): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  try {
    const { error } = await supabase.from("customers").upsert([
      {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        license_plate: customer.licensePlate || null,
        password: customer.password || "1234",
      },
    ])
    return !error
  } catch {
    return false
  }
}

// -------------------------------------------------------------
// Realtime Subscription
// -------------------------------------------------------------
export function subscribeToRealtimeChanges(
  onRoomsChanged: () => void,
  onBookingsChanged: () => void
): () => void {
  if (!isSupabaseConfigured) return () => {}

  const channel = supabase
    .channel("realtime-rasume")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "rooms" },
      () => {
        onRoomsChanged()
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "bookings" },
      () => {
        onBookingsChanged()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// -------------------------------------------------------------
// Google & Supabase Auth Helpers
// -------------------------------------------------------------
export const ADMIN_EMAILS = [
  "setthawut09902@gmail.com",
]

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.some((admin) => admin.toLowerCase() === email.trim().toLowerCase())
}

export async function signInWithGoogle(): Promise<{ error: any }> {
  if (!isSupabaseConfigured) {
    return { error: new Error("Supabase is not configured") }
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  })
  return { error }
}

export async function signOutAuth(): Promise<void> {
  if (!isSupabaseConfigured) return
  await supabase.auth.signOut()
}


