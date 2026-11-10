import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 200) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  if (!isVisible) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-6 right-5 z-40 w-12 h-12 rounded-full bg-blue-600/95 hover:bg-blue-700 active:scale-95 text-white shadow-xl shadow-blue-600/35 backdrop-blur-md flex items-center justify-center transition-all animate-in fade-in zoom-in-90 border border-white/30 cursor-pointer"
      aria-label="เลื่อนขึ้นด้านบนสุด"
      title="เลื่อนขึ้นด้านบนสุด"
    >
      <ArrowUp className="w-5 h-5 stroke-[2.5]" />
    </button>
  )
}

