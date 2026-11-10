import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Lock, AlertCircle, KeyRound, User } from "lucide-react"
import { signInWithGoogle } from "@/lib/supabaseService"

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

interface AdminLoginModalProps {
  open: boolean
  onClose: () => void
  onLoginSuccess: () => void
}

export function AdminLoginModal({ open, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleGoogleAdminLogin = async () => {
    setIsGoogleLoading(true)
    setError("")
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError("เข้าสู่ระบบด้วย Google ไม่สำเร็จ: " + error.message)
        setIsGoogleLoading(false)
      }
    } catch (err: any) {
      setError("เกิดข้อผิดพลาด: " + (err?.message || "ไม่สามารถเชื่อมต่อได้"))
      setIsGoogleLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      // Check admin credentials
      if (
        (username.trim().toLowerCase() === "admin" && password === "password123") ||
        (username.trim().toLowerCase() === "admin" && password === "123456")
      ) {
        setIsLoading(false)
        localStorage.setItem("admin_auth", "true")
        onLoginSuccess()
        onClose()
      } else {
        setIsLoading(false)
        setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")
      }
    }, 400)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-white text-center relative">
          <div className="w-14 h-14 bg-blue-600/30 border border-blue-400/40 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-7 h-7 text-blue-300" />
          </div>
          <h3 className="text-xl font-black tracking-tight">เข้าสู่ระบบผู้ดูแล (Admin Login)</h3>
          <p className="text-xs text-slate-300 mt-1">
            บ้านพักเสฏฐสิทธิ์ 24 ชม. - ระบบจัดการห้องพัก & การเงิน
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Admin Login */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleAdminLogin}
              disabled={isGoogleLoading}
              className="w-full h-11 px-4 flex items-center justify-center gap-3 rounded-2xl border border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm shadow-xs hover:shadow transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              <GoogleIcon className="w-5 h-5 shrink-0" />
              <span>{isGoogleLoading ? "กำลังเชื่อมต่อ Google..." : "เข้าสู่ระบบ Admin ด้วย Google (แนะนำ)"}</span>
            </button>
            <p className="text-[10px] text-center text-slate-400">
              * เฉพาะบัญชี Google ที่ได้รับสิทธิ์ผู้ดูแลเท่านั้น (setthawut09902@gmail.com)
            </p>
            <div className="relative flex items-center justify-center pt-1">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                หรือ ใช้รหัสผ่านผู้ดูแลเดิม
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                ชื่อผู้ใช้ (Username)
              </Label>
              <Input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl h-10 text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                รหัสผ่าน (Password)
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl h-10 text-sm font-medium"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl text-xs h-10 px-4"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-6 shadow-md shadow-blue-500/20"
              >
                {isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบผู้ดูแล"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}


