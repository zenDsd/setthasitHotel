import { useState } from "react"
import { CustomerUser } from "@/types"
import { INITIAL_CUSTOMERS } from "@/data/mockData"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { User, Phone, KeyRound, Car, AlertCircle, CheckCircle2, UserPlus, LogIn } from "lucide-react"
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

interface CustomerAuthModalProps {
  open: boolean
  onClose: () => void
  onLoginSuccess: (customer: CustomerUser) => void
  customers: CustomerUser[]
  onRegisterCustomer: (newCustomer: CustomerUser) => void
  promptMessage?: string
}

export function CustomerAuthModal({
  open,
  onClose,
  onLoginSuccess,
  customers,
  onRegisterCustomer,
  promptMessage,
}: CustomerAuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login")
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Login form state
  const [loginPhone, setLoginPhone] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register form state
  const [regName, setRegName] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regPlate, setRegPlate] = useState("")

  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError("")
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError("เข้าสู่ระบบด้วย Google ไม่สำเร็จ: " + error.message)
        setIsGoogleLoading(false)
      }
      // Browser will redirect to Google login
    } catch (err: any) {
      setError("เกิดข้อผิดพลาด: " + (err?.message || "ไม่สามารถเชื่อมต่อ Google ได้"))
      setIsGoogleLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const cleanPhone = loginPhone.replace(/[^0-9]/g, "")
    const allCustomers = [...INITIAL_CUSTOMERS, ...customers]
    const found = allCustomers.find(
      (c) => c.phone.replace(/[^0-9]/g, "") === cleanPhone
    )

    if (found) {
      if (!found.password || found.password === loginPassword) {
        onLoginSuccess(found)
        onClose()
      } else {
        setError("รหัสผ่านไม่ถูกต้อง (ลองใช้ 1234 หรือปุ่มทดสอบด้านล่าง)")
      }
    } else {
      // Allow easy fast login for any demo phone number
      const fastCustomer: CustomerUser = {
        id: "c-" + Date.now(),
        name: "คุณลูกค้า (" + cleanPhone.slice(-4) + ")",
        phone: loginPhone,
        password: loginPassword,
      }
      onRegisterCustomer(fastCustomer)
      onLoginSuccess(fastCustomer)
      onClose()
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!regName.trim() || !regPhone.trim()) {
      setError("กรุณากรอกชื่อและเบอร์โทรศัพท์")
      return
    }

    const newCustomer: CustomerUser = {
      id: "c-" + Date.now(),
      name: regName.trim(),
      phone: regPhone.trim(),
      licensePlate: regPlate.trim() || undefined,
      password: regPassword || "1234",
      createdAt: new Date().toISOString().split("T")[0],
    }

    onRegisterCustomer(newCustomer)
    setSuccessMsg("สมัครสมาชิกเรียบร้อยแล้ว!")
    setTimeout(() => {
      onLoginSuccess(newCustomer)
      onClose()
    }, 600)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white text-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2 text-white">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black tracking-tight">เข้าสู่ระบบสำหรับลูกค้า</h3>
          <p className="text-xs text-blue-100 mt-0.5">
            บ้านพักเสฏฐสิทธิ์ • บันทึกประวัติและจองห้องพักได้สะดวกยิ่งขึ้น
          </p>

          {promptMessage && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 bg-amber-400 text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 text-slate-900 shrink-0" />
              <span>{promptMessage}</span>
            </div>
          )}

          {/* Switch Tab buttons */}
          <div className="grid grid-cols-2 p-1 bg-white/15 backdrop-blur-sm rounded-2xl mt-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setTab("login")
                setError("")
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                tab === "login"
                  ? "bg-white text-blue-800 shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register")
                setError("")
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                tab === "register"
                  ? "bg-white text-blue-800 shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              สมัครสมาชิกใหม่
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google 1-Click Sign In Button */}
          <div className="space-y-3 mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full h-11 px-4 flex items-center justify-center gap-3 rounded-2xl border border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/40 text-slate-800 font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              <GoogleIcon className="w-5 h-5 shrink-0" />
              <span>{isGoogleLoading ? "กำลังเชื่อมต่อ Google..." : "ดำเนินการต่อด้วย Google (แนะนำ ✨)"}</span>
            </button>
            <div className="relative flex items-center justify-center pt-1">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                หรือ ใช้เบอร์โทรศัพท์
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>
          </div>

          {/* TAB 1: LOGIN */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  เบอร์โทรศัพท์มือถือ *
                </Label>
                <Input
                  type="tel"
                  placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="rounded-xl h-11 text-sm font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  รหัสผ่าน
                </Label>
                <Input
                  type="password"
                  placeholder="รหัสผ่าน (ค่าเริ่มต้น 1234)"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="rounded-xl h-11 text-sm font-medium"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
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
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-6 shadow-md shadow-blue-500/20"
                >
                  เข้าสู่ระบบทันที
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  ชื่อ-นามสกุล / ชื่อเล่น *
                </Label>
                <Input
                  placeholder="กรอกชื่อ-นามสกุล หรือชื่อเล่น"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="rounded-xl text-xs h-10"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  เบอร์โทรศัพท์ติดต่อ *
                </Label>
                <Input
                  placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="rounded-xl text-xs h-10"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-blue-600" />
                  ทะเบียนรถ (ถ้ามี - บันทึกไว้จัดช่องจอด)
                </Label>
                <Input
                  placeholder="กรอกทะเบียนรถ หรือ ยี่ห้อรถ"
                  value={regPlate}
                  onChange={(e) => setRegPlate(e.target.value)}
                  className="rounded-xl text-xs h-10"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  ตั้งรหัสผ่าน (สำหรับเข้าใช้งานครั้งต่อไป)
                </Label>
                <Input
                  type="password"
                  placeholder="รหัสผ่าน 4-6 หลัก"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="rounded-xl text-xs h-10"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
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
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-6 shadow-md shadow-blue-500/20"
                >
                  ยืนยันสมัครสมาชิก
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
