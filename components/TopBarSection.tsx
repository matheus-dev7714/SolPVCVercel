"use client"

import { useState } from "react"
import { IconComponentNode, IconMain } from "./icon-components"

export const TopBarSection = (): JSX.Element => {
  const [searchValue, setSearchValue] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <header className="flex items-center gap-[88px] p-6 relative self-stretch w-full flex-[0_0_auto] bg-black-10 border-b [border-bottom-style:solid] border-white-10 backdrop-blur-[10px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(10px)_brightness(100%)]">
      <div className="inline-flex items-center gap-8 relative flex-[0_0_auto]">
        <IconMain className="!relative !w-8 !h-8 !aspect-[1]" role="img" aria-label="Main logo icon" />
        <div className="w-[88px] h-8 relative aspect-[2.75]">
          <img className="absolute w-[50.51%] h-[99.72%] top-0 left-0" alt="Vector logo element" src="/placeholder-logo.svg" />
          <img className="absolute w-[69.83%] h-[99.28%] top-0 left-[30.17%]" alt="Union logo element" src="/placeholder-logo.svg" />
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 relative flex-1 grow bg-white-5 rounded-xl border border-solid border-white-10">
        <IconComponentNode className="!relative !w-6 !h-6 !aspect-[1]" role="img" aria-label="Search icon" />
        <label htmlFor="search-input" className="sr-only">
          Search
        </label>
        <input
          id="search-input"
          type="search"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="Search..."
          className="relative flex-1 mt-[-1.00px] opacity-65 [font-family:'Plus_Jakarta_Sans-Regular',Helvetica] font-normal text-white text-base tracking-[-0.30px] leading-6 bg-transparent border-none outline-none placeholder:text-white placeholder:opacity-65"
          aria-label="Search input"
        />
      </div>

      <nav
        className="inline-flex items-center gap-4 relative flex-[0_0_auto]"
        role="navigation"
        aria-label="Wallet connection"
      >
        <button
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-xl border border-solid border-white/10 cursor-pointer transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black-10"
          type="button"
          aria-label="Connect wallet"
        >
          <span className="font-semibold text-white text-base text-center tracking-[-0.30px] leading-6 whitespace-nowrap">
            Connect Wallet
          </span>
        </button>
      </nav>
    </header>
  )
}
