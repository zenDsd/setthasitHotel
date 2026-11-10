import { useState } from "react"
import { CustomerReview, CustomerUser } from "@/types"
import { Star, ShieldCheck, CheckCircle2, MessageSquarePlus, Sparkles, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CustomerReviewsSectionProps {
  reviews: CustomerReview[]
  onAddReview: (newReview: CustomerReview) => void
  currentCustomer: CustomerUser | null
  onOpenLogin: () => void
}

export function CustomerReviewsSection({
  reviews,
  onAddReview,
  currentCustomer,
  onOpenLogin,
}: CustomerReviewsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [guestName, setGuestName] = useState(currentCustomer?.name || "")
  const [roomInfo, setRoomInfo] = useState("ห้องพักชั่วคราว (3 ชม.)")
  const [comment, setComment] = useState("")
  const [selectedTag, setSelectedTag] = useState("สะอาด ปลอดภัย")
  const [isSuccess, setIsSuccess] = useState(false)

  const commonTags = [
    "สะอาด ปลอดภัย",
    "แอร์เย็นฉ่ำ",
    "ที่จอดรถหน้าห้อง",
    "บริการ 24 ชม.",
    "เตียงนุ่มสบาย",
    "คุ้มค่าราคา",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    const newRev: CustomerReview = {
      id: "rev-" + Date.now(),
      guestName: guestName.trim() || currentCustomer?.name || "ผู้เข้าพัก",
      rating,
      stayDate: "วันนี้",
      roomInfo,
      comment: comment.trim(),
      tags: [selectedTag],
      isVerified: true,
    }

    onAddReview(newRev)
    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      setIsModalOpen(false)
      setComment("")
    }, 1500)
  }

  const handleOpenReviewModal = () => {
    if (!currentCustomer) {
      onOpenLogin()
      return
    }
    setGuestName(currentCustomer.name)
    setIsModalOpen(true)
  }

  return (
    <section className="mt-10 sm:mt-12 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header & Score Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-1.5">
            <Sparkles className="w-3 h-3 text-amber-500" />
            คะแนนความพึงพอใจ 4.9 / 5.0
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            เสียงตอบรับจากผู้เข้าพักจริง
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            รีวิวการันตีความสะอาด ปลอดภัย และความสะดวกสบายตลอด 24 ชั่วโมง
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <div className="text-xs font-bold text-slate-800">
              4.9 <span className="text-[11px] text-slate-400 font-normal">({reviews.length}+ รีวิว)</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleOpenReviewModal}
            className="rounded-2xl text-xs h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>เขียนรีวิว</span>
          </Button>
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-300 transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {rev.guestName.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {rev.guestName}
                    </span>
                    {rev.isVerified && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md font-bold">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                        เข้าพักจริง
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block">
                    {rev.roomInfo} • {rev.stayDate}
                  </span>
                </div>
              </div>

              {/* Stars */}
              <div className="flex text-amber-400 shrink-0">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
              "{rev.comment}"
            </p>

            {rev.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {rev.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Review Submission Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-blue-600" />
              แบ่งปันความประทับใจ
            </DialogTitle>
          </DialogHeader>

          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">
                ขอบคุณสำหรับคำรีวิวครับ!
              </h4>
              <p className="text-xs text-slate-500">
                รีวิวของคุณช่วยให้ผู้เข้าพักท่านอื่นมั่นใจยิ่งขึ้น
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              {/* Rating selector */}
              <div>
                <Label className="text-xs font-semibold text-slate-700">ให้คะแนนความพึงพอใจ</Label>
                <div className="flex gap-2 mt-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200 fill-slate-100"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">ชื่อของคุณ</Label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="เช่น คุณบาส, ลูกค้าประจำ"
                  className="mt-1 rounded-xl text-xs h-9"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">ห้องพักที่เข้าใช้บริการ</Label>
                <select
                  value={roomInfo}
                  onChange={(e) => setRoomInfo(e.target.value)}
                  className="w-full mt-1 border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ห้องพักชั่วคราว (3 ชม.)">ห้องพักชั่วคราว (3 ชม.)</option>
                  <option value="ห้องพักรายวัน (ค้างคืน)">ห้องพักรายวัน (ค้างคืน)</option>
                  <option value="ห้อง 1 (ชั่วคราว)">ห้อง 1 (ชั่วคราว)</option>
                  <option value="ห้อง 2 (ชั่วคราว)">ห้อง 2 (ชั่วคราว)</option>
                  <option value="ห้อง 3 (ชั่วคราว)">ห้อง 3 (ชั่วคราว)</option>
                  <option value="ห้อง 6 (รายวัน)">ห้อง 6 (รายวัน)</option>
                  <option value="ห้อง 7 (รายวัน)">ห้อง 7 (รายวัน)</option>
                  <option value="ห้อง 8 (รายวัน)">ห้อง 8 (รายวัน)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">ข้อความรีวิว / ความรู้สึก *</Label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="เช่น แอร์เย็นมาก เตียงนอนสบาย ที่จอดรถหน้าห้องสะดวก ปลอดภัยมากครับ..."
                  rows={3}
                  className="w-full mt-1 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">จุดเด่นที่ประทับใจ</Label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {commonTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                        selectedTag === tag
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl text-xs h-9"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={!comment.trim()}
                  className="rounded-xl text-xs h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  ส่งรีวิว
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
