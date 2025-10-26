import { useState } from "react"
import { IconCategory, IconCategory1, IconCategory2, IconCategory3, IconCategory4, IconCategory5, IconCategory6, IconCategory7, IconMain1, IconMain2, IconMain3, IconMain4, IconMain5, IconMain6 } from "./icon-components"

export const SideMenuSection = () => {
  const [activeMenuItem, setActiveMenuItem] = useState("Prize Pool")

  const menuItems = [
    { id: "Home", icon: IconMain3, label: "Home" },
    { id: "Prize Pool", icon: IconMain4, label: "Prize Pool" },
    { id: "Store", icon: IconMain5, label: "Store" },
    {
      id: "WVS AI",
      icon: IconMain6,
      label: "WVS AI",
      subtitle: "(Coming soon)",
    },
  ]

  const categories = [
    { id: "Basketball", icon: IconCategory, label: "Basketball" },
    { id: "Golf", icon: IconCategory1, label: "Golf" },
    { id: "Football", icon: IconCategory2, label: "Football" },
    { id: "Finance", icon: IconCategory3, label: "Finance" },
    { id: "MMA", icon: IconCategory4, label: "MMA" },
    { id: "Gaming", icon: IconCategory5, label: "Gaming" },
    { id: "Events", icon: IconCategory6, label: "Events" },
    { id: "Crypto", icon: IconCategory7, label: "Crypto" },
  ]

  const handleMenuItemClick = (itemId: string) => {
    setActiveMenuItem(itemId)

    switch (itemId) {
      case "Home":
        console.log("Navigate to landing")
        break
      case "Prize Pool":
        console.log("Navigate to pools")
        break
      case "Store":
        console.log("Navigate to store")
        break
      case "WVS AI":
        // Coming soon - no action
        break
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    console.log(`Category clicked: ${categoryId}`)
  }

  return (
    <nav
      className="flex flex-col max-w-xs w-80 items-start gap-4 px-0 py-6 relative self-stretch bg-black-10 border-r [border-right-style:solid] border-white-10 backdrop-blur-[10px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(10px)_brightness(100%)]"
      role="navigation"
      aria-label="Main navigation"
    >
      <header className="flex flex-col items-center gap-4 px-6 py-4 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex items-center gap-3 pl-4 pr-3 py-3 relative self-stretch w-full flex-[0_0_auto] bg-white-5 rounded-xl border border-solid border-white-10">
          <IconMain1 className="!relative !w-8 !h-8" aria-hidden="true" />
          <div className="relative flex-1 mt-[-1.00px] font-medium text-white text-2xl tracking-[-0.30px] leading-8">
            0.000
          </div>
          <span className="text-white/60 text-sm">SOL</span>
          <IconMain2 className="!relative !w-8 !h-8 !aspect-[1]" aria-hidden="true" />
        </div>

        <button
          className="all-[unset] box-border self-stretch w-full flex-[0_0_auto] bg-main flex items-center justify-center gap-2 px-4 py-3 relative rounded-xl border border-solid border-white-10 cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-black-10"
          type="button"
          aria-label="Create a new prediction"
        >
          <span className="relative w-fit mt-[-1.00px] font-semibold text-black text-base text-center tracking-[-0.30px] leading-6 whitespace-nowrap">
            Create a Prediction
          </span>
        </button>
      </header>

      <main className="flex flex-col w-full">
        <ul className="flex flex-col w-full" role="menubar">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeMenuItem === item.id

            return (
              <li key={item.id} role="none">
                <button
                  className={`flex items-center gap-2 px-6 py-4 relative self-stretch w-full flex-[0_0_auto] cursor-pointer hover:bg-white/5 focus:outline-none focus:bg-white/5 ${
                    isActive
                      ? "border-l-4 border-solid border-purple-500 bg-[linear-gradient(90deg,rgba(154,43,216,0.25)_0%,rgba(154,43,216,0)_100%)]"
                      : ""
                  }`}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handleMenuItemClick(item.id)}
                  type="button"
                >
                  <IconComponent className="!relative !w-6 !h-6 !aspect-[1]" aria-hidden="true" />
                  {item.id === "WVS AI" ? (
                    <p className="relative flex-1 mt-[-1.00px] font-normal text-white text-base tracking-[-0.30px] leading-6">
                      <span className="tracking-[-0.05px]">WVS AI </span>
                      <span className="italic text-sm tracking-[-0.04px]">
                        (Coming soon)
                      </span>
                    </p>
                  ) : (
                    <span
                      className={`relative flex-1 mt-[-1.00px] text-white text-base tracking-[-0.30px] leading-6 ${
                        isActive
                          ? "font-semibold mt-[-4.00px]"
                          : "font-normal"
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-4 px-6 py-4 relative self-stretch w-full flex-[0_0_auto] opacity-60">
          <h2 className="relative w-fit mt-[-1.00px] italic text-white text-xs tracking-[-0.30px] leading-4 whitespace-nowrap">
            CATEGORIES
          </h2>
          <div className="relative flex-1 grow h-px bg-white/20" />
        </div>

        <section
          className="flex flex-wrap items-start gap-[8px_8px] px-6 py-4 relative self-stretch w-full flex-[0_0_auto]"
          aria-label="Category selection"
        >
          {categories.map((category) => {
            const IconComponent = category.icon

            return (
              <button
                key={category.id}
                className="flex flex-col min-w-14 min-h-14 items-center justify-center gap-2 px-1 py-2 relative flex-1 grow bg-white/5 rounded-lg overflow-hidden border border-solid border-white/10 cursor-pointer hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/10 focus:ring-offset-2 focus:ring-offset-black/10"
                onClick={() => handleCategoryClick(category.id)}
                type="button"
                aria-label={`Select ${category.label} category`}
              >
                <IconComponent className="!relative !w-8 !h-8 !aspect-[1]" aria-hidden="true" />
                <span className="relative self-stretch font-semibold text-white text-[10px] text-center tracking-[-0.30px] leading-4">
                  {category.label}
                </span>
              </button>
            )
          })}
        </section>
      </main>
    </nav>
  )
}
