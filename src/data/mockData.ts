import { Room, AddOnItem, BookingRecord, CustomerUser } from "../types"

export const INITIAL_ROOMS: Room[] = [
  // 5 Hourly Rooms (ห้อง 1 - 5)
  {
    id: "r1",
    number: "1",
    name: "ห้องพักชั่วคราว ห้อง 1",
    type: "hourly",
    status: "available",
    floor: 1,
    capacity: 2,
    bedType: "เตียงคิงไซส์ 6 ฟุต",
    amenities: ["แอร์เย็นฉ่ำ", "Smart TV 43 นิ้ว", "เครื่องทำน้ำอุ่น", "ที่จอดรถหน้าห้อง", "ห้องน้ำในตัว"],
    images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"],
  },
  {
    id: "r2",
    number: "2",
    name: "ห้องพักชั่วคราว ห้อง 2",
    type: "hourly",
    status: "available",
    floor: 1,
    capacity: 2,
    bedType: "เตียงคิงไซส์ 6 ฟุต",
    amenities: ["แอร์เย็นฉ่ำ", "Smart TV 43 นิ้ว", "เครื่องทำน้ำอุ่น", "ที่จอดรถหน้าห้อง", "ห้องน้ำในตัว"],
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"],
  },
  {
    id: "r3",
    number: "3",
    name: "ห้องพักชั่วคราว ห้อง 3",
    type: "hourly",
    status: "available",
    floor: 1,
    capacity: 2,
    bedType: "เตียงคิงไซส์ 6 ฟุต",
    amenities: ["แอร์เย็นฉ่ำ", "Smart TV 43 นิ้ว", "เครื่องทำน้ำอุ่น", "ที่จอดรถส่วนตัว", "ห้องน้ำในตัว"],
    images: ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"],
  },
  {
    id: "r4",
    number: "4",
    name: "ห้องพักชั่วคราว ห้อง 4",
    type: "hourly",
    status: "available",
    floor: 1,
    capacity: 2,
    bedType: "เตียงคิงไซส์ 6 ฟุต",
    amenities: ["แอร์เย็นฉ่ำ", "Smart TV 43 นิ้ว", "เครื่องทำน้ำอุ่น", "ที่จอดรถส่วนตัว", "ห้องน้ำในตัว"],
    images: ["https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80"],
  },
  {
    id: "r5",
    number: "5",
    name: "ห้องพักชั่วคราว ห้อง 5",
    type: "hourly",
    status: "available",
    floor: 1,
    capacity: 2,
    bedType: "เตียงคิงไซส์ 6 ฟุต นุ่มพิเศษ",
    amenities: ["แอร์เย็นฉ่ำ", "Smart TV 50 นิ้ว", "ระบบแสงไฟ Warm Light", "เครื่องทำน้ำอุ่น", "ที่จอดรถส่วนตัว"],
    images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"],
  },

  // 5 Daily Rooms (ห้อง 6 - 10)
  {
    id: "r6",
    number: "6",
    name: "ห้องพักรายวัน ห้อง 6",
    type: "daily",
    status: "available",
    floor: 2,
    capacity: 2,
    bedType: "เตียงคิงไซส์ 6 ฟุต",
    amenities: ["แอร์เย็นฉ่ำ", "ตู้เย็น", "Smart TV 43 นิ้ว", "เครื่องทำน้ำอุ่น", "ระเบียงส่วนตัว", "โต๊ะทำงาน"],
    images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"],
  },
  {
    id: "r7",
    number: "7",
    name: "ห้องพักรายวัน ห้อง 7",
    type: "daily",
    status: "available",
    floor: 2,
    capacity: 2,
    bedType: "เตียงคิงไซส์ 6 ฟุต",
    amenities: ["แอร์เย็นฉ่ำ", "ตู้เย็น", "Smart TV 43 นิ้ว", "เครื่องทำน้ำอุ่น", "ระเบียงส่วนตัว", "กาต้มน้ำ"],
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"],
  },
  {
    id: "r8",
    number: "8",
    name: "ห้องพักรายวัน ห้อง 8",
    type: "daily",
    status: "available",
    floor: 2,
    capacity: 2,
    bedType: "เตียงคิงไซส์ 6 ฟุต",
    amenities: ["แอร์เย็นฉ่ำ", "ตู้เย็นขนาดใหญ่", "Smart TV 50 นิ้ว", "เครื่องทำน้ำอุ่น", "โซฟานั่งเล่น", "ระเบียงชมวิว"],
    images: ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"],
  },
  {
    id: "r9",
    number: "9",
    name: "ห้องพักรายวัน ห้อง 9",
    type: "daily",
    status: "available",
    floor: 2,
    capacity: 2,
    bedType: "เตียงคิงไซส์ 6 ฟุต",
    amenities: ["แอร์เย็นฉ่ำ", "ตู้เย็น", "Smart TV 50 นิ้ว", "เครื่องทำน้ำอุ่น", "ระเบียงส่วนตัว", "ไดร์เป่าผม"],
    images: ["https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80"],
  },
  {
    id: "r10",
    number: "10",
    name: "ห้องพักรายวัน ห้อง 10",
    type: "daily",
    status: "available",
    floor: 2,
    capacity: 2,
    bedType: "เตียงคิงไซส์ 6 ฟุต นุ่มสบาย",
    amenities: ["แอร์เย็นฉ่ำ", "ตู้เย็น", "Smart TV 55 นิ้ว", "อ่างอาบน้ำ", "ระเบียงกว้างวิวสวน", "ไมโครเวฟ"],
    images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"],
  },
]

export const ADD_ON_ITEMS: AddOnItem[] = [
  // เครื่องดื่ม
  {
    id: "drink-1",
    name: "น้ำดื่มตราสิงห์ (600 มล.)",
    category: "beverage",
    price: 10,
    unit: "ขวด",
    description: "น้ำดื่มสะอาด เย็นสดชื่น",
    icon: "GlassWater",
    isPopular: true,
  },
  {
    id: "drink-2",
    name: "น้ำอัดลมโค้ก / แฟนต้า กระป๋อง",
    category: "beverage",
    price: 15,
    unit: "กระป๋อง",
    description: "แช่เย็นพร้อมดื่ม",
    icon: "Coffee",
  },
  {
    id: "drink-3",
    name: "น้ำแข็งสะอาดพร้อมถัง",
    category: "beverage",
    price: 20,
    unit: "ถัง",
    description: "ถังน้ำแข็งพร้อมแก้ว 2 ใบ",
    icon: "Sparkles",
    isPopular: true,
  },
  {
    id: "drink-4",
    name: "กาแฟกระป๋องเบอร์ดี้ / เนสกาแฟ",
    category: "beverage",
    price: 20,
    unit: "กระป๋อง",
    description: "เข้มข้น ดื่มแก้ง่วง",
    icon: "Coffee",
  },

  // เครื่องนอนและของใช้
  {
    id: "linen-1",
    name: "ผ้าห่มหนานุ่มเสริม",
    category: "linen",
    price: 50,
    unit: "ผืน",
    description: "ซักอบฆ่าเชื้อ สะอาดหอม",
    icon: "BedDouble",
    isPopular: true,
  },
  {
    id: "linen-2",
    name: "หมอนหนุนเสริม",
    category: "linen",
    price: 30,
    unit: "ใบ",
    description: "หมอนขนนุ่มเกรดโรงแรม",
    icon: "Layers",
  },
  {
    id: "linen-3",
    name: "ผ้าเช็ดตัวเพิ่ม",
    category: "linen",
    price: 20,
    unit: "ผืน",
    description: "ผ้าเช็ดตัวผืนใหญ่ สะอาดนุ่ม",
    icon: "Shirt",
  },
  {
    id: "amenity-1",
    name: "เซ็ตแปรงสีฟัน + มีดโกนหนวด + สบู่",
    category: "amenity",
    price: 20,
    unit: "ชุด",
    description: "ของใช้ส่วนตัวครบเซ็ต",
    icon: "Smile",
  },

  // อาหารและของว่าง
  {
    id: "food-1",
    name: "มาม่าคัพ (ต้มยำกุ้ง / หมูสับ)",
    category: "food",
    price: 20,
    unit: "ถ้วย",
    description: "พร้อมบริการกดน้ำร้อนให้ทันที",
    icon: "Soup",
    isPopular: true,
  },
  {
    id: "food-2",
    name: "โจ๊กคัพหมูสับคนอร์",
    category: "food",
    price: 25,
    unit: "ถ้วย",
    description: "อุ่นท้อง ทานง่าย",
    icon: "Soup",
  },
  {
    id: "food-3",
    name: "ขนมขบเคี้ยว เลย์ / เบนโตะ",
    category: "food",
    price: 20,
    unit: "ซอง",
    description: "ของว่างทานเล่นระหว่างพักผ่อน",
    icon: "Cookie",
  },
]

/**
 * คำนวณราคาห้องพักตามเงื่อนไขที่กำหนด:
 * 1. รายชั่วโมง: 3 ชั่วโมง ราคา 200 บาท
 * 2. รายวัน:
 *    - เข้าก่อน 18:00 น. = 400 บาท
 *    - เข้าหลัง 18:00 น. = 350 บาท (ลด 50 บาท)
 *    - เช็คเอาต์ก่อนเที่ยง (12:00 น.)
 */
export function calculatePricing({
  roomType,
  checkInTime, // Format "HH:mm"
  selectedAddOns = [],
}: {
  roomType: 'hourly' | 'daily'
  checkInTime: string
  selectedAddOns: { itemId: string; quantity: number }[]
}) {
  let basePrice = 0
  let discountAmount = 0
  let isDiscountApplied = false
  let discountReason = ""

  if (roomType === "hourly") {
    basePrice = 200 // 3 ชั่วโมง 200 บาท
  } else {
    basePrice = 400 // ราคาปกติ 400 บาท
    const hour = parseInt(checkInTime.split(":")[0] || "14", 10)
    // เข้าหลัง 6 โมงเย็น (18:00) ปรับเป็น 350 บาท
    if (hour >= 18) {
      discountAmount = 50
      isDiscountApplied = true
      discountReason = "โปรโมชั่นเข้าพักหลัง 18:00 น. (ลดทันที 50 บาท)"
    }
  }

  // คำนวณบริการเสริม (Add-ons)
  const addOnsTotal = selectedAddOns.reduce((sum, item) => {
    const found = ADD_ON_ITEMS.find((a) => a.id === item.itemId)
    return sum + (found ? found.price * item.quantity : 0)
  }, 0)

  const finalRoomPrice = basePrice - discountAmount
  const grandTotal = finalRoomPrice + addOnsTotal

  return {
    basePrice,
    discountAmount,
    isDiscountApplied,
    discountReason,
    finalRoomPrice,
    addOnsTotal,
    grandTotal,
  }
}

export const INITIAL_BOOKINGS: BookingRecord[] = []

export const INITIAL_CUSTOMERS: CustomerUser[] = [
  {
    id: "c1",
    name: "คุณสมชาย มั่งมี",
    phone: "081-234-5678",
    licensePlate: "กก 8899 กทม.",
    password: "1234",
    createdAt: "2026-11-01",
  },
  {
    id: "c2",
    name: "คุณวิภาวรรณ สุขสงบ",
    phone: "089-987-6543",
    licensePlate: "วภ 4455 ชลบุรี",
    password: "1234",
    createdAt: "2026-11-02",
  },
]

export const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    guestName: "คุณกิตติศักดิ์ พ.",
    rating: 5,
    stayDate: "เมื่อวานนี้",
    roomInfo: "ห้องพักชั่วคราว ห้อง 1",
    comment: "ขับรถลงใต้มาเหนื่อยๆ แวะพักชั่วคราว 3 ชม. แอร์เย็นเฉียบ เตียงนุ่ม ที่จอดรถหน้าห้องส่วนตัว ปลอดภัยและสะดวกมากครับ",
    tags: ["ที่จอดรถหน้าห้อง", "แอร์เย็นฉ่ำ", "เช็คอินไว"],
    isVerified: true,
  },
  {
    id: "rev-2",
    guestName: "คุณพิมพ์มาดา ส.",
    rating: 5,
    stayDate: "2 วันที่แล้ว",
    roomInfo: "ห้องพักรายวัน ห้อง 7",
    comment: "ห้องพักสะอาดมาก น้ำอุ่นไหลแรง ผ้าห่มสะอาดหอม บริการส่งน้ำแข็งถึงห้องรวดเร็ว 24 ชม. ประทับใจมากค่ะ",
    tags: ["สะอาด ปลอดภัย", "น้ำอุ่นแรง", "บริการดี 24 ชม."],
    isVerified: true,
  },
  {
    id: "rev-3",
    guestName: "คุณอานนท์ ว.",
    rating: 5,
    stayDate: "4 วันที่แล้ว",
    roomInfo: "ห้องพักรายวัน ห้อง 6",
    comment: "มาถึงตอนตีสองครึ่ง โทรติดง่าย เข้าพักได้ทันที โปรหลัง 18:00 น. เหลือ 350 คุ้มค่ามากครับ",
    tags: ["บริการ 24 ชม.", "คุ้มราคา 350฿", "ที่นอนสบาย"],
    isVerified: true,
  },
  {
    id: "rev-4",
    guestName: "คุณธนกฤต ม.",
    rating: 5,
    stayDate: "สัปดาห์ที่แล้ว",
    roomInfo: "ห้องพักชั่วคราว ห้อง 3",
    comment: "บรรยากาศเงียบสงบ เป็นส่วนตัว ไม่มีเสียงรบกวน มี Smart TV ดูซีรีส์ได้สบายๆ เลยครับ",
    tags: ["Smart TV", "เงียบสงบ", "เป็นส่วนตัว"],
    isVerified: true,
  },
]


