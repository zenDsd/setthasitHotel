export type RoomType = 'hourly' | 'daily'
export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance'

export interface CustomerUser {
  id: string
  name: string
  phone: string
  email?: string
  avatar?: string
  licensePlate?: string
  password?: string
  createdAt?: string
}

export interface Room {
  id: string
  number: string
  name: string
  type: RoomType
  status: RoomStatus
  floor: number
  capacity: number
  bedType: string
  amenities: string[]
  images: string[]
  // For occupied status
  currentBooking?: {
    bookingCode?: string
    guestName: string
    guestPhone: string
    checkInTime: string
    checkOutTime: string
    remainingMinutes?: number
    plateNumber?: string
    notes?: string
    paymentMethod?: 'promptpay' | 'cash'
    paymentStatus?: 'paid' | 'pending' | 'cash_on_arrival' | 'cancelled'
  }
}

export interface AddOnItem {
  id: string
  name: string
  category: 'beverage' | 'linen' | 'food' | 'amenity'
  price: number
  unit: string
  description?: string
  icon: string
  isPopular?: boolean
}

export interface SelectedAddOn {
  item: AddOnItem
  quantity: number
}

export interface BookingRecord {
  id: string
  bookingCode: string
  roomId: string
  roomNumber: string
  roomType: RoomType
  guestName: string
  guestPhone: string
  licensePlate?: string
  checkInDate: string
  checkInTime: string
  checkOutTime: string
  notes?: string
  selectedAddOns: { itemId: string; quantity: number }[]
  roomPrice: number
  addOnsPrice: number
  discountAmount: number
  totalPrice: number
  paymentMethod: 'promptpay' | 'cash'
  paymentStatus: 'paid' | 'pending' | 'cash_on_arrival' | 'cancelled'
  slipImage?: string
  deliveryStatus: 'pending' | 'delivered' | 'none' | 'cancelled'
  createdAt: string
  source: 'web' | 'walk-in'
}

export interface CustomerReview {
  id: string
  guestName: string
  rating: number
  stayDate: string
  roomInfo: string
  comment: string
  tags: string[]
  isVerified: boolean
}
