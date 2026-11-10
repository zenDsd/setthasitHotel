import { Room } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Moon, CheckCircle2, AlertCircle, Sparkles, User, Car } from "lucide-react"

interface RoomCardProps {
  room: Room
  onSelect: (room: Room) => void
}

export function RoomCard({ room, onSelect }: RoomCardProps) {
  const isAvailable = room.status === "available"
  const isOccupied = room.status === "occupied"
  const isCleaning = room.status === "cleaning"

  return (
    <Card className="overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col justify-between bg-white rounded-xl">
      <div>
        {/* Room Image & Badge Overlay */}
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
          <img
            src={room.images[0]}
            alt={room.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Type Badge */}
          <div className="absolute top-2 left-2 flex gap-1.5 items-center">
            {room.type === "hourly" ? (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-medium border-0 shadow-md text-[10px] px-2 py-0.5">
                <Clock className="w-3 h-3 mr-0.5" />
                รายชั่วโมง (3 ชม.)
              </Badge>
            ) : (
              <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium border-0 shadow-md text-[10px] px-2 py-0.5">
                <Moon className="w-3 h-3 mr-0.5" />
                รายวัน (ค้างคืน)
              </Badge>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            {isAvailable && (
              <Badge variant="success" className="shadow-md font-semibold bg-emerald-500 text-white border-0 text-[10px] px-2 py-0.5">
                <CheckCircle2 className="w-3 h-3 mr-0.5" />
                ห้องว่าง
              </Badge>
            )}
            {isOccupied && (
              <Badge variant="destructive" className="shadow-md font-semibold bg-rose-500 text-white border-0 text-[10px] px-2 py-0.5">
                <AlertCircle className="w-3 h-3 mr-0.5" />
                มีผู้พักอยู่
              </Badge>
            )}
            {isCleaning && (
              <Badge variant="warning" className="shadow-md font-semibold bg-amber-400 text-slate-900 border-0 text-[10px] px-2 py-0.5">
                <Sparkles className="w-3 h-3 mr-0.5" />
                รอทำความสะอาด
              </Badge>
            )}
          </div>

          {/* Room Number on Image */}
          <div className="absolute bottom-2 left-2.5 text-white">
            <span className="text-[10px] uppercase tracking-wider text-slate-200 font-medium">ห้อง</span>
            <h3 className="text-xl font-black drop-shadow-md leading-none">
              {room.number}
            </h3>
          </div>
        </div>

        {/* Room Details */}
        <CardContent className="p-3 sm:p-3.5">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                {room.name}
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{room.bedType} • พักได้ {room.capacity} ท่าน</p>
            </div>
          </div>

          {/* Price Tag */}
          <div className="my-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            {room.type === "hourly" ? (
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-black text-blue-700">200฿</span>
                  <span className="text-[10px] text-slate-600 font-medium">/ 3 ชม.</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-lg sm:text-xl font-black text-indigo-700">400฿</span>
                  <span className="text-[9px] bg-rose-100 text-rose-700 px-1 py-0.5 rounded font-bold">
                    18:00+ เหลือ 350฿
                  </span>
                </div>
              </div>
            )}

            <div className="text-right text-[9px] text-slate-400 shrink-0">
              {room.type === "hourly" ? "ต่อเวลา ชม.ละ 50฿" : "ออกก่อน 12:00"}
            </div>
          </div>

          {/* Amenities Badges */}
          <div className="flex flex-wrap gap-0.5 mt-1.5">
            {room.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-block text-[9px] sm:text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
              >
                {amenity}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="inline-block text-[9px] sm:text-[10px] bg-slate-100 text-slate-400 px-1 py-0.5 rounded">
                +{room.amenities.length - 3}
              </span>
            )}
          </div>

          {/* Current Occupied Status */}
          {isOccupied && room.currentBooking && (
            <div className="mt-2 p-2 bg-rose-50 border border-rose-100 rounded-lg text-[11px] text-rose-800 space-y-0.5">
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {room.currentBooking.guestName}
                </span>
                <span>ออก {room.currentBooking.checkOutTime}</span>
              </div>
              {room.currentBooking.plateNumber && (
                <div className="flex items-center gap-1 text-[10px] text-rose-600">
                  <Car className="w-2.5 h-2.5" />
                  {room.currentBooking.plateNumber}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </div>

      {/* Action Button */}
      <div className="px-3 pb-3 sm:px-3.5 sm:pb-3.5 pt-0">
        <Button
          onClick={() => onSelect(room)}
          disabled={!isAvailable}
          className={`w-full h-9 font-bold text-[11px] sm:text-xs rounded-lg transition-all ${
            isAvailable
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-[0.99]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100 shadow-none"
          }`}
        >
          {isAvailable ? "จองห้องนี้" : isOccupied ? "ไม่ว่าง" : "กำลังทำความสะอาด"}
        </Button>
      </div>
    </Card>
  )
}

