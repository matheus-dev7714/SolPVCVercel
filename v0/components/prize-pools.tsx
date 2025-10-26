"use client"

Index
import { MainContentSection } from "./MainContentSection"
import { SideMenuSection } from "./SideMenuSection"
import { TopBarSection } from "./TopBarSection"

export const PrizePools = (): JSX.Element => {
  return (
    <div className="flex flex-col min-h-screen items-start relative [background:radial-gradient(50%_50%_at_50%_50%,rgba(46,40,96,1)_0%,rgba(24,27,49,1)_100%)]">
      <TopBarSection />
      <div className="flex items-start relative flex-1 self-stretch w-full grow">
        <SideMenuSection />
        <MainContentSection />
      </div>
    </div>
  )
}

\
MainContent Section
import { IconCategory } from "./IconCategory"
import { IconCategory2 } from "./IconCategory2"
import { IconCategory8 } from "./IconCategory8"
import { IconCategory9 } from "./IconCategory9"
import { IconMain7 } from "./IconMain7"
import { IconMain8 } from "./IconMain8"
import { IconMain9 } from "./IconMain9"
import union from "./union.svg"
import vector from "./vector.svg"

export const MainContentSection = () => {
  const howItWorksSteps = [
    {
      icon: IconMain7,
      title: "Predict",
      description: "Make or create a prediction on the platform.",
    },
    {
      icon: IconMain8,
      title: "Earn",
      description: "Receive entry points for accuracy + platform usage.",
    },
    {
      icon: IconMain9,
      title: "Win",
      description: "Your entries are automatically submitted into the biweekly drawing.",
    },
  ]

  const leaderboardData = [
    { avatar: "/img.png", username: "@JohnyNonny", points: 500 },
    { avatar: "/img.svg", username: "@JohnyNonny", points: 450 },
    { avatar: "/image.svg", username: "@JohnyNonny", points: 425 },
    { avatar: "/img-2.svg", username: "@JohnyNonny", points: 400 },
    { avatar: "/img-3.svg", username: "@JohnyNonny", points: 390 },
    { avatar: "/img-4.svg", username: "@JohnyNonny", points: 375 },
  ]

  const predictionPools = [
    {
      backgroundImage: "/prediction-card.png",
      icon: IconCategory2,
      category: "Football",
      title: "Benfica vs Barca",
    },
    {
      backgroundImage: "/image.png",
      icon: IconCategory8,
      category: "World Events",
      title: "Altman VS Elon",
    },
    {
      backgroundImage: "/prediction-card-2.png",
      icon: IconCategory,
      category: "World Basketball",
      title: "Lakers VS Bulls",
    },
    {
      backgroundImage: "/prediction-card-3.png",
      icon: IconCategory9,
      category: "Crypto",
      title: "Etherium VS Solana",
    },
  ]

  return (
    <main className="flex flex-col items-start gap-8 p-4 relative flex-1 self-stretch grow">
      <section className="flex h-80 items-end gap-4 p-8 relative self-stretch w-full rounded-3xl bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)]">
        <div className="flex flex-col items-start gap-4 relative flex-1 grow">
          <div className="flex items-end gap-4 relative self-stretch w-full flex-[0_0_auto]">
            <div className="w-[165px] h-[60px] relative aspect-[2.75]">
              <img className="absolute w-[50.51%] h-[99.72%] top-0 left-0" alt="Vector" src={vector} />
              <img className="absolute w-[69.83%] h-[99.28%] top-0 left-[30.17%]" alt="Union" src={union} />
            </div>
            <h1 className="relative flex-1 [font-family:'Plus_Jakarta_Sans-Regular',Helvetica] font-normal text-white text-[40px] tracking-[-0.30px] leading-10">
              Global Pricepool
            </h1>
          </div>
          <p className="relative w-fit [font-family:'Plus_Jakarta_Sans-Light',Helvetica] font-light text-white text-lg tracking-[-0.30px] leading-6 whitespace-nowrap">
            Earn entry points just for using the platform.
          </p>
        </div>
        <div className="inline-flex flex-col items-center gap-4 p-4 relative flex-[0_0_auto] bg-white-5 rounded-[18px] border border-solid border-[#ffffff33] backdrop-blur-[10px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(10px)_brightness(100%)]">
          <div className="inline-flex items-center gap-3 px-6 py-4 relative flex-[0_0_auto] bg-black-10 rounded-xl border border-solid border-white-10">
            <p className="relative w-fit mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-transparent text-5xl tracking-[-0.30px] leading-[60px] whitespace-nowrap">
              <span className="text-[#ffffff] tracking-[-0.14px]">2,125,000 </span>
              <span className="text-[#fede00] tracking-[-0.14px]">$</span>
              <span className="text-[#1fe6e5] tracking-[-0.14px]">VS</span>
            </p>
          </div>
          <p className="relative self-stretch [font-family:'Plus_Jakarta_Sans-Regular',Helvetica] font-normal text-white text-lg text-center tracking-[-0.30px] leading-[18px]">
            <span className="tracking-[-0.05px] leading-6">Next drawing:</span>
            <span className="text-2xl tracking-[-0.07px] leading-8"> 15:35:45</span>
          </p>
        </div>
      </section>

      <section className="flex items-start gap-8 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-4 relative flex-1 grow">
          <h2 className="relative w-fit mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-Regular',Helvetica] font-normal text-white text-lg tracking-[-0.30px] leading-6 whitespace-nowrap">
            How it works
          </h2>
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] bg-black-10 rounded-2xl border border-solid border-white-10">
            {howItWorksSteps.map((step, index) => {
              const IconComponent = step.icon
              const isLastItem = index === howItWorksSteps.length - 1

              return (
                <div
                  key={index}
                  className={`flex min-w-14 min-h-14 items-start gap-4 p-4 relative self-stretch w-full flex-[0_0_auto] ${!isLastItem ? "border-b [border-bottom-style:solid] border-white-10" : ""}`}
                >
                  <IconComponent className="!relative !w-12 !h-12 !aspect-[1]" />
                  <div className="flex flex-col items-start gap-1 relative flex-1 grow">
                    <h3 className="relative self-stretch mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-white text-base tracking-[-0.30px] leading-6">
                      {step.title}
                    </h3>
                    <p className="relative w-fit opacity-60 [font-family:'Plus_Jakarta_Sans-Regular',Helvetica] font-normal text-white text-sm tracking-[-0.30px] leading-5 whitespace-nowrap">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 relative flex-1 self-stretch grow">
          <div className="flex items-baseline gap-4 relative self-stretch w-full flex-[0_0_auto]">
            <h2 className="relative flex-1 mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-Regular',Helvetica] font-normal text-white text-lg tracking-[-0.30px] leading-6">
              Leaderboard
            </h2>
            <button className="relative w-fit [font-family:'Plus_Jakarta_Sans-SemiBoldItalic',Helvetica] font-semibold italic text-main text-sm text-right tracking-[-0.30px] leading-5 whitespace-nowrap">
              View All &gt;&gt;
            </button>
          </div>
          <div className="flex items-start relative self-stretch w-full flex-[0_0_auto] bg-black-10 rounded-2xl border border-solid border-white-10">
            <div className="flex flex-col items-start relative flex-1 grow">
              {leaderboardData.slice(0, 3).map((user, index) => (
                <div
                  key={index}
                  className={`flex min-w-14 min-h-14 items-start gap-4 p-4 self-stretch w-full border-r [border-right-style:solid] border-white-10 relative flex-[0_0_auto] ${index < 2 ? "border-b [border-bottom-style:solid] border-white-10" : ""}`}
                >
                  <div
                    className="relative w-12 h-12 bg-cover bg-[50%_50%]"
                    style={{ backgroundImage: `url(${user.avatar})` }}
                  >
                    <div className="h-12 bg-[#ffffff33] rounded-3xl backdrop-blur-[10px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(10px)_brightness(100%)] aspect-[1]" />
                  </div>
                  <div className="flex flex-col items-start gap-1 relative flex-1 grow">
                    <div className="relative self-stretch mt-[-1.00px] blur-[7.5px] [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-white text-base tracking-[-0.30px] leading-6">
                      {user.username}
                    </div>
                    <p className="relative w-fit [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-white text-sm tracking-[-0.30px] leading-5 whitespace-nowrap">
                      <span className="text-[#fede00] tracking-[-0.04px]">{user.points}</span>
                      <span className="text-[#ffffff] tracking-[-0.04px]"> pts</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-start relative flex-1 grow">
              {leaderboardData.slice(3, 6).map((user, index) => (
                <div
                  key={index + 3}
                  className={`flex min-w-14 min-h-14 items-start gap-4 p-4 relative self-stretch w-full flex-[0_0_auto] ${index < 2 ? "border-b [border-bottom-style:solid] border-white-10" : ""}`}
                >
                  <div
                    className="relative w-12 h-12 bg-cover bg-[50%_50%]"
                    style={{ backgroundImage: `url(${user.avatar})` }}
                  >
                    <div className="h-12 bg-[#ffffff33] rounded-3xl backdrop-blur-[10px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(10px)_brightness(100%)] aspect-[1]" />
                  </div>
                  <div className="flex flex-col items-start gap-1 relative flex-1 grow">
                    <div className="relative self-stretch mt-[-1.00px] blur-[7.5px] [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-white text-base tracking-[-0.30px] leading-6">
                      {user.username}
                    </div>
                    <p className="relative w-fit [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-white text-sm tracking-[-0.30px] leading-5 whitespace-nowrap">
                      <span className="text-[#fede00] tracking-[-0.04px]">{user.points}</span>
                      <span className="text-[#ffffff] tracking-[-0.04px]"> pts</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-start gap-4 relative flex-1 self-stretch w-full grow">
        <div className="flex items-center justify-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <h2 className="relative flex-1 mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-Regular',Helvetica] font-normal text-white text-lg tracking-[-0.30px] leading-6">
            Top Prediction Pools
          </h2>
          <button className="relative w-fit [font-family:'Plus_Jakarta_Sans-SemiBoldItalic',Helvetica] font-semibold italic text-main text-sm text-right tracking-[-0.30px] leading-5 whitespace-nowrap">
            View All &gt;&gt;
          </button>
        </div>
        <div className="flex items-start gap-6 relative flex-1 self-stretch w-full grow">
          {predictionPools.map((pool, index) => {
            const IconComponent = pool.icon

            return (
              <div
                key={index}
                className="flex flex-col h-48 items-center justify-end relative flex-1 grow rounded-2xl overflow-hidden bg-cover bg-[50%_50%]"
                style={{ backgroundImage: `url(${pool.backgroundImage})` }}
              >
                <div className="flex flex-col items-center justify-end gap-4 p-4 relative flex-1 self-stretch w-full grow rounded-2xl border border-solid border-white-10 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]">
                  <div className="inline-flex items-center justify-center gap-2 pl-1 pr-2 py-1 relative flex-[0_0_auto] bg-white-5 rounded-lg overflow-hidden border border-solid border-white-10 backdrop-blur-[25px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(25px)_brightness(100%)]">
                    <IconComponent className="!relative !w-8 !h-8 !aspect-[1]" />
                    <div className="relative w-fit [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-white text-xs tracking-[-0.30px] leading-4 whitespace-nowrap">
                      {pool.category}
                    </div>
                  </div>
                  <h3 className="relative self-stretch [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-white text-sm text-center tracking-[-0.30px] leading-5">
                    {pool.title}
                  </h3>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}

\
Side Menu
import { useState } from "react"
import { IconCategory } from "./IconCategory"
import { IconCategory1 } from "./IconCategory1"
import { IconCategory2 } from "./IconCategory2"
import { IconCategory3 } from "./IconCategory3"
import { IconCategory4 } from "./IconCategory4"
import { IconCategory5 } from "./IconCategory5"
import { IconCategory6 } from "./IconCategory6"
import { IconCategory7 } from "./IconCategory7"
import { IconMain1 } from "./IconMain1"
import { IconMain2 } from "./IconMain2"
import { IconMain3 } from "./IconMain3"
import { IconMain4 } from "./IconMain4"
import { IconMain5 } from "./IconMain5"
import { IconMain6 } from "./IconMain6"
import vector1 from "./vector-1.svg"

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

  const handleMenuItemClick = (itemId) => {
    setActiveMenuItem(itemId)
  }

  const handleCategoryClick = (categoryId) => {
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
          <div className="relative flex-1 mt-[-1.00px] [font-family:'SF_Pro-Medium',Helvetica] font-medium text-white text-2xl tracking-[-0.30px] leading-8">
            0
          </div>
          <IconMain2 className="!relative !w-8 !h-8 !aspect-[1]" aria-hidden="true" />
        </div>

        <button
          className="all-[unset] box-border self-stretch w-full flex-[0_0_auto] bg-main flex items-center justify-center gap-2 px-4 py-3 relative rounded-xl border border-solid border-white-10 cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-black-10"
          type="button"
          aria-label="Create a new prediction"
        >
          <span className="relative w-fit mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-black text-base text-center tracking-[-0.30px] leading-6 whitespace-nowrap">
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
                  className={`flex items-center gap-2 px-6 py-4 relative self-stretch w-full flex-[0_0_auto] cursor-pointer hover:bg-white-5 focus:outline-none focus:bg-white-5 ${
                    isActive
                      ? "border-l-4 [border-left-style:solid] border-secondary bg-[linear-gradient(90deg,rgba(154,43,216,0.25)_0%,rgba(154,43,216,0)_100%)]"
                      : ""
                  }`}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handleMenuItemClick(item.id)}
                  type="button"
                >
                  <IconComponent className="!relative !w-6 !h-6 !aspect-[1]" aria-hidden="true" />
                  {item.id === "WVS AI" ? (
                    <p className="relative flex-1 mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-Regular',Helvetica] font-normal text-white text-base tracking-[-0.30px] leading-6">
                      <span className="tracking-[-0.05px]">WVS AI </span>
                      <span className="[font-family:'Plus_Jakarta_Sans-Italic',Helvetica] italic text-sm tracking-[-0.04px]">
                        (Coming soon)
                      </span>
                    </p>
                  ) : (
                    <span
                      className={`relative flex-1 mt-[-1.00px] text-white text-base tracking-[-0.30px] leading-6 ${
                        isActive
                          ? "[font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold mt-[-4.00px]"
                          : "[font-family:'Plus_Jakarta_Sans-Regular',Helvetica] font-normal"
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
          <h2 className="relative w-fit mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-Italic',Helvetica] font-normal italic text-white text-xs tracking-[-0.30px] leading-4 whitespace-nowrap">
            CATEGORIES
          </h2>
          <img className="relative flex-1 grow h-px object-cover" alt="" src={vector1} role="presentation" />
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
                className="flex flex-col min-w-14 min-h-14 items-center justify-center gap-2 px-1 py-2 relative flex-1 grow bg-white-5 rounded-lg overflow-hidden border border-solid border-white-10 cursor-pointer hover:bg-white-10 focus:outline-none focus:ring-2 focus:ring-white-10 focus:ring-offset-2 focus:ring-offset-black-10"
                onClick={() => handleCategoryClick(category.id)}
                type="button"
                aria-label={`Select ${category.label} category`}
              >
                <IconComponent className="!relative !w-8 !h-8 !aspect-[1]" aria-hidden="true" />
                <span className="relative self-stretch [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-white text-[10px] text-center tracking-[-0.30px] leading-4">
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

\
Top Bar

import { useState } from "react"
import { IconComponentNode } from "./IconComponentNode"
import { IconMain } from "./IconMain"
import union2 from "./union-2.svg"
import vector2 from "./vector-2.svg"

export const TopBarSection = (): JSX.Element => {
  const [searchValue, setSearchValue] = useState("")

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value)
  }

  const handleSignUpClick = () => {
    // Handle sign up action
    console.log("Sign up clicked")
  }

  const handleLoginClick = () => {
    // Handle login action
    console.log("Login clicked")
  }

  return (
    <header className="flex items-center gap-[88px] p-6 relative self-stretch w-full flex-[0_0_auto] bg-black-10 border-b [border-bottom-style:solid] border-white-10 backdrop-blur-[10px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(10px)_brightness(100%)]">
      <div className="inline-flex items-center gap-8 relative flex-[0_0_auto]">
        <IconMain className="!relative !w-8 !h-8 !aspect-[1]" role="img" aria-label="Main logo icon" />
        <div className="w-[88px] h-8 relative aspect-[2.75]">
          <img className="absolute w-[50.51%] h-[99.72%] top-0 left-0" alt="Vector logo element" src={vector2} />
          <img className="absolute w-[69.83%] h-[99.28%] top-0 left-[30.17%]" alt="Union logo element" src={union2} />
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
        aria-label="User authentication"
      >
        <button
          className="all-[unset] box-border flex w-32 items-center justify-center gap-2 px-4 py-3 relative bg-main rounded-xl border border-solid border-white-10 cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-black-10"
          onClick={handleSignUpClick}
          type="button"
          aria-label="Sign up for an account"
        >
          <span className="relative w-fit mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-black text-base text-center tracking-[-0.30px] leading-6 whitespace-nowrap">
            Sign Up
          </span>
        </button>

        <button
          className="all-[unset] box-border w-32 bg-secondary flex items-center justify-center gap-2 px-4 py-3 relative rounded-xl border border-solid border-white-10 cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-black-10"
          onClick={handleLoginClick}
          type="button"
          aria-label="Login to your account"
        >
          <span className="relative w-fit mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-white text-base text-center tracking-[-0.30px] leading-6 whitespace-nowrap">
            Login
          </span>
        </button>
      </nav>
    </header>
  )
}

Js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        black: "var(--black)",
        "black-10": "var(--black-10)",
        "black-20": "var(--black-20)",
        main: "var(--main)",
        "main-20": "var(--main-20)",
        "overlay-50": "var(--overlay-50)",
        secondary: "var(--secondary)",
        white: "var(--white)",
        "white-10": "var(--white-10)",
        "white-5": "var(--white-5)",
      },
    },
  },
  plugins: [],
}

CSS

@tailwind
base
@tailwind
components
@tailwind
utilities
\
@layer
base
{
  button,
  input,
  select,\
  textarea
  \
  @apply
  appearance - none
  bg - transparent
  border - 0
  outline - none
}

@tailwind
components
@tailwind
utilities
\
@layer
components
{
  \
  .all-\[unset\]
  all: unset
}
\
:root
{
  \
  --black: rgba(0, 0, 0, 1)
  \
  --black-10: rgba(0, 0, 0, 0.1)
  \
  --black-20: rgba(0, 0, 0, 0.2)
  \
  --main: rgba(31, 230, 229, 1)
  \
  --main-20: rgba(31, 230, 229, 0.2)
  \
  --overlay-50: rgba(0, 0, 0, 0.5)
  \
  --secondary: rgba(154, 43, 216, 1)
  \
  --white: rgba(255, 255, 255, 1)
  \
  --white-10: rgba(255, 255, 255, 0.1)
  \
  --white-5: rgba(255, 255, 255, 0.05)
}
\
:root
{
  \
  --animate-spin: spin 1s linear infinite
}
\
.animate-fade-in
{
  \
  animation: fade-in 1s
  var(--animation-delay, 0s) ease forwards;
}
\
.animate-fade-up
{
  \
  animation: fade-up 1s
  var(--animation-delay, 0s) ease forwards;
}
\
.animate-marquee
{
  \
  animation: marquee
  var(--duration) infinite linear;
}
\
.animate-marquee-vertical
{
  \
  animation: marquee-vertical
  var(--duration) linear infinite;
}
\
.animate-shimmer
{
  animation: shimmer
  8s infinite
}

.animate-spin
{
  animation: var(--animate-spin);
}

@keyframes
spin
{
  to
  transform: rotate(1turn)
}

@keyframes
image - glow
{
  0% {
    opacity: 0;
  animation-timing-function: cubic-bezier(0.74, 0.25, 0.76, 1);
}

10% {
    opacity: 0.7;
animation-timing-function: cubic-bezier(0.12, 0.01, 0.08, 0.99);
}

  to
{
  opacity: 0.4
}
}

@keyframes
fade-in {
  0% {
    opacity: 0;
transform: translateY(-10px)
}

  to
{
  opacity: 1
  transform: none
}
}

@keyframes
fade - up
{
  0% {
    opacity: 0;
  transform: translateY(20px)
}

to
{
  opacity: 1
  transform: none
}
}

@keyframes
shimmer
{
  0%,
  90%,
  to
  background - position
  : calc(-100% -
  var(--shimmer-width)) 0;

  30%,
  60% {
    background-position: calc(100% + var(--shimmer-width)) 0;
}
}

@keyframes
marquee
{
  0% {
    transform: translate(0);
}

to
{
  transform: translateX(calc(-100% -
  var(--gap)));
}
}

@keyframes
marquee - vertical
{
  0% {
    transform: translateY(0);
}

to
{
  transform: translateY(calc(-100% -
  var(--gap)));
}
}
