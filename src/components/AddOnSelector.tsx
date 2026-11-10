import { useState } from "react"
import { ADD_ON_ITEMS } from "@/data/mockData"
import { AddOnItem } from "@/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Flame, GlassWater, Coffee, Sparkles, BedDouble, Layers, Shirt, Smile, Soup, Cookie } from "lucide-react"

interface AddOnSelectorProps {
  selectedItems: { [itemId: string]: number }
  onChange: (items: { [itemId: string]: number }) => void
}

export function AddOnSelector({ selectedItems, onChange }: AddOnSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const handleIncrement = (item: AddOnItem) => {
    const currentQty = selectedItems[item.id] || 0
    onChange({
      ...selectedItems,
      [item.id]: currentQty + 1,
    })
  }

  const handleDecrement = (item: AddOnItem) => {
    const currentQty = selectedItems[item.id] || 0
    if (currentQty <= 1) {
      const next = { ...selectedItems }
      delete next[item.id]
      onChange(next)
    } else {
      onChange({
        ...selectedItems,
        [item.id]: currentQty - 1,
      })
    }
  }

  const getIcon = (iconName: string) => {
    const iconClass = "w-5 h-5 text-blue-600"
    switch (iconName) {
      case "GlassWater": return <GlassWater className={iconClass} />
      case "Coffee": return <Coffee className={iconClass} />
      case "Sparkles": return <Sparkles className={iconClass} />
      case "BedDouble": return <BedDouble className={iconClass} />
      case "Layers": return <Layers className={iconClass} />
      case "Shirt": return <Shirt className={iconClass} />
      case "Smile": return <Smile className={iconClass} />
      case "Soup": return <Soup className={iconClass} />
      case "Cookie": return <Cookie className={iconClass} />
      default: return <Sparkles className={iconClass} />
    }
  }

  const filteredItems = ADD_ON_ITEMS.filter((item) => {
    if (activeCategory === "all") return true
    return item.category === activeCategory
  })

  const totalItemsCount = Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0)
  const totalCost = Object.entries(selectedItems).reduce((sum, [id, qty]) => {
    const item = ADD_ON_ITEMS.find((a) => a.id === id)
    return sum + (item ? item.price * qty : 0)
  }, 0)

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
            <span>สั่งของใช้ & ของว่างส่งถึงห้อง</span>
            <Badge variant="indigo" className="text-[11px] font-normal">บริการส่ง 24 ชม.</Badge>
          </h4>
          <p className="text-xs text-slate-500">
            เลือกรายการที่ต้องการเพิ่ม ทางที่พักจะจัดเตรียมไว้ให้ในห้องก่อนเข้าพัก
          </p>
        </div>
        {totalItemsCount > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-900 self-start sm:self-auto">
            <span>เลือกแล้ว {totalItemsCount} รายการ</span>
            <span className="text-blue-600 font-bold">+{totalCost}฿</span>
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
            activeCategory === "all"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          ทั้งหมด ({ADD_ON_ITEMS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("beverage")}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
            activeCategory === "beverage"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          เครื่องดื่ม & น้ำแข็ง
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("linen")}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
            activeCategory === "linen"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          ผ้าห่ม & หมอนเสริม
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("food")}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
            activeCategory === "food"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          มาม่า & ของว่าง
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
        {filteredItems.map((item) => {
          const qty = selectedItems[item.id] || 0
          const isSelected = qty > 0

          return (
            <Card
              key={item.id}
              className={`p-3 transition-all rounded-xl border flex items-center justify-between gap-3 ${
                isSelected
                  ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500 shadow-sm"
                  : "border-slate-200/90 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  {getIcon(item.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                      {item.name}
                    </span>
                    {item.isPopular && (
                      <span className="flex items-center text-[10px] text-amber-600 bg-amber-50 px-1 py-0.2 rounded font-medium">
                        <Flame className="w-2.5 h-2.5 mr-0.5 text-amber-500 fill-amber-500" />
                        ฮิต
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-blue-700">
                      {item.price}฿
                    </span>
                    <span className="text-[11px] text-slate-400">/ {item.unit}</span>
                  </div>
                </div>
              </div>

              {/* Quantity Counter or Add Button */}
              <div>
                {isSelected ? (
                  <div className="flex items-center gap-1.5 bg-white border border-blue-200 rounded-lg p-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleDecrement(item)}
                      className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-transform"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center font-bold text-xs text-blue-900">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncrement(item)}
                      className="w-6 h-6 rounded flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleIncrement(item)}
                    className="flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    เพิ่ม
                  </button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
