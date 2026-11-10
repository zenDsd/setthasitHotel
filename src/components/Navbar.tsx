import { Badge } from "@/components/ui/badge"
import { CustomerUser } from "@/types"
import { BedDouble, Phone, LayoutDashboard, Home, User } from "lucide-react"

interface NavbarProps {
  currentView: "guest" | "admin"
  onViewChange: (view: "guest" | "admin") => void
  isAdminLoggedIn: boolean
  onOpenAdminLogin?: () => void
  onAdminLogout: () => void
  currentCustomer: CustomerUser | null
  onOpenCustomerLogin: () => void
  onOpenCustomerBookings: () => void
}

export function Navbar({
  currentView,
  onViewChange,
  isAdminLoggedIn,
  currentCustomer,
  onOpenCustomerLogin,
  onOpenCustomerBookings,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand: Clean single line without awkward wrapping */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <BedDouble className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base lg:text-lg font-black text-slate-900 tracking-tight whitespace-nowrap">
                บ้านพักเสฏฐสิทธิ์
              </span>
              <Badge variant="indigo" className="text-[9px] sm:text-[10px] px-1.5 py-0">
                24 ชม.
              </Badge>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 hidden md:block truncate">
              ห้องพักชั่วคราว 3 ชม. 200.- | รายวัน 400.- (หลัง 18:00 น. เหลือ 350.-)
            </p>
          </div>
        </div>

        {/* Action Controls: Compact, touch-friendly, no overlap */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Customer Login / Profile Pill */}
          {currentCustomer ? (
            <button
              type="button"
              onClick={onOpenCustomerBookings}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold transition-all shadow-2xs"
            >
              {currentCustomer.avatar ? (
                <img
                  src={currentCustomer.avatar}
                  alt={currentCustomer.name}
                  className="w-5 h-5 rounded-full object-cover border border-blue-300"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  {currentCustomer.name.slice(0, 1)}
                </div>
              )}
              <span className="max-w-[70px] sm:max-w-[120px] truncate">{currentCustomer.name}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCustomerLogin}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>เข้าสู่ระบบ</span>
            </button>
          )}

          {/* View Switcher: ONLY visible when Admin is logged in */}
          {isAdminLoggedIn && (
            currentView === "guest" ? (
              <button
                type="button"
                onClick={() => onViewChange("admin")}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold transition-all active:scale-95 whitespace-nowrap shadow-2xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="sm:hidden">Admin</span>
                <span className="hidden sm:inline">ระบบ Admin (10 ห้อง)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onViewChange("guest")}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all active:scale-95 whitespace-nowrap shadow-xs"
              >
                <Home className="w-3.5 h-3.5 shrink-0" />
                <span>กลับหน้าหลัก</span>
              </button>
            )
          )}

          {/* LINE Contact Button */}
          <a
            href="https://line.me/ti/p/~bassss09902"
            target="_blank"
            rel="noopener noreferrer"
            title="ติดต่อแอดมินผ่าน LINE: bassss09902"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#06C755] hover:bg-[#05b34c] px-2.5 sm:px-3 py-1.5 rounded-xl shadow-xs transition-transform active:scale-95"
          >
            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.572-3.844 2.572-5.992z" />
            </svg>
            <span className="hidden sm:inline">LINE:</span>
            <span>bassss09902</span>
          </a>

          {/* Hotline (Desktop only) */}
          <a
            href="tel:0997345847"
            className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>099-734-5847</span>
          </a>
        </div>
      </div>
    </header>
  )
}
