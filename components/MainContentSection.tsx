"use client"

import { useState, useEffect } from "react"
import { IconCategory } from "./icon-components"
import { IconCategory2 } from "./icon-components"
import { IconCategory8 } from "./icon-components"
import { IconCategory9 } from "./icon-components"
import { IconMain7 } from "./icon-components"
import { IconMain8 } from "./icon-components"
import { IconMain9 } from "./icon-components"

export const MainContentSection = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])
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
    { avatar: "/placeholder-user.jpg", username: "@JohnyNonny", points: 500 },
    { avatar: "/placeholder-user.jpg", username: "@JohnyNonny", points: 450 },
    { avatar: "/placeholder-user.jpg", username: "@JohnyNonny", points: 425 },
    { avatar: "/placeholder-user.jpg", username: "@JohnyNonny", points: 400 },
    { avatar: "/placeholder-user.jpg", username: "@JohnyNonny", points: 390 },
    { avatar: "/placeholder-user.jpg", username: "@JohnyNonny", points: 375 },
  ]

  const predictionPools = [
    {
      id: 1,
      backgroundImage: "/placeholder.jpg",
      icon: IconCategory9,
      category: "Solana",
      title: "BONK Price at 24h",
      description: "Will BONK be over $0.00002 in 24 hours?",
    },
    {
      id: 2,
      backgroundImage: "/placeholder.jpg",
      icon: IconCategory9,
      category: "Solana",
      title: "WIF vs POPCAT",
      description: "Which meme coin will outperform?",
    },
    {
      id: 3,
      backgroundImage: "/placeholder.jpg",
      icon: IconCategory9,
      category: "Solana",
      title: "PEPE Daily High",
      description: "Will PEPE reach new daily high?",
    },
    {
      id: 4,
      backgroundImage: "/placeholder.jpg",
      icon: IconCategory9,
      category: "Solana",
      title: "SOL Market Cap",
      description: "SOL vs ETH market cap ratio",
    },
  ]

  return (
    <main className="flex flex-col items-start gap-8 p-4 relative flex-1 self-stretch grow">
      <section className="flex h-80 items-end gap-4 p-8 relative self-stretch w-full rounded-3xl bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)]">
        <div className="flex flex-col items-start gap-4 relative flex-1 grow">
          <div className="flex items-end gap-4 relative self-stretch w-full flex-[0_0_auto]">
            <div className="w-[165px] h-[60px] relative aspect-[2.75]">
              <img className="absolute w-[50.51%] h-[99.72%] top-0 left-0" alt="Vector" src="/placeholder-logo.svg" />
              <img className="absolute w-[69.83%] h-[99.28%] top-0 left-[30.17%]" alt="Union" src="/placeholder-logo.svg" />
            </div>
            <h1 className="relative flex-1 [font-family:'Plus_Jakarta_Sans-Regular',Helvetica] font-normal text-white text-[40px] tracking-[-0.30px] leading-10">
              SOLPVE Global Pricepool
            </h1>
          </div>
          <p className="relative w-fit font-light text-white text-lg tracking-[-0.30px] leading-6 whitespace-nowrap">
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
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-white">Loading...</div>
              </div>
            ) : (
              howItWorksSteps.map((step, index) => {
                const IconComponent = step.icon
                const isLastItem = index === howItWorksSteps.length - 1

                return (
                  <div
                    key={index}
                    className={`flex min-w-14 min-h-14 items-start gap-4 p-4 relative self-stretch w-full flex-[0_0_auto] ${!isLastItem ? "border-b border-solid border-white/10" : ""}`}
                  >
                    <IconComponent className="!relative !w-12 !h-12 !aspect-[1]" />
                    <div className="flex flex-col items-start gap-1 relative flex-1 grow">
                      <h3 className="relative self-stretch mt-[-1.00px] font-semibold text-white text-base tracking-[-0.30px] leading-6">
                        {step.title}
                      </h3>
                      <p className="relative w-fit opacity-60 font-normal text-white text-sm tracking-[-0.30px] leading-5 whitespace-nowrap">
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 relative flex-1 self-stretch grow">
          <div className="flex items-baseline gap-4 relative self-stretch w-full flex-[0_0_auto]">
            <h2 className="relative flex-1 mt-[-1.00px] font-normal text-white text-lg tracking-[-0.30px] leading-6">
              Leaderboard
            </h2>
            <button className="relative w-fit font-semibold italic text-cyan-400 text-sm text-right tracking-[-0.30px] leading-5 whitespace-nowrap">
              View All &gt;&gt;
            </button>
          </div>
          <div className="flex items-start relative self-stretch w-full flex-[0_0_auto] bg-black/10 rounded-2xl border border-solid border-white/10">
            <div className="flex flex-col items-start relative flex-1 grow">
              {leaderboardData.slice(0, 3).map((user, index) => (
                <div
                  key={index}
                  className={`flex min-w-14 min-h-14 items-start gap-4 p-4 self-stretch w-full border-r border-solid border-white/10 relative flex-[0_0_auto] ${index < 2 ? "border-b border-solid border-white/10" : ""}`}
                >
                  <div
                    className="relative w-12 h-12 bg-cover bg-[50%_50%] rounded-full"
                    style={{ backgroundImage: `url(${user.avatar})` }}
                  >
                    <div className="h-12 bg-white/20 rounded-full backdrop-blur-[10px] backdrop-brightness-[100%] aspect-[1]" />
                  </div>
                  <div className="flex flex-col items-start gap-1 relative flex-1 grow">
                    <div className="relative self-stretch mt-[-1.00px] blur-[7.5px] font-semibold text-white text-base tracking-[-0.30px] leading-6">
                      {user.username}
                    </div>
                    <p className="relative w-fit font-semibold text-white text-sm tracking-[-0.30px] leading-5 whitespace-nowrap">
                      <span className="text-yellow-400 tracking-[-0.04px]">{user.points}</span>
                      <span className="text-white tracking-[-0.04px]"> pts</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-start relative flex-1 grow">
              {leaderboardData.slice(3, 6).map((user, index) => (
                <div
                  key={index + 3}
                  className={`flex min-w-14 min-h-14 items-start gap-4 p-4 relative self-stretch w-full flex-[0_0_auto] ${index < 2 ? "border-b border-solid border-white/10" : ""}`}
                >
                  <div
                    className="relative w-12 h-12 bg-cover bg-[50%_50%] rounded-full"
                    style={{ backgroundImage: `url(${user.avatar})` }}
                  >
                    <div className="h-12 bg-white/20 rounded-full backdrop-blur-[10px] backdrop-brightness-[100%] aspect-[1]" />
                  </div>
                  <div className="flex flex-col items-start gap-1 relative flex-1 grow">
                    <div className="relative self-stretch mt-[-1.00px] blur-[7.5px] font-semibold text-white text-base tracking-[-0.30px] leading-6">
                      {user.username}
                    </div>
                    <p className="relative w-fit font-semibold text-white text-sm tracking-[-0.30px] leading-5 whitespace-nowrap">
                      <span className="text-yellow-400 tracking-[-0.04px]">{user.points}</span>
                      <span className="text-white tracking-[-0.04px]"> pts</span>
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
          <h2 className="relative flex-1 mt-[-1.00px] font-normal text-white text-lg tracking-[-0.30px] leading-6">
            Top Prediction Pools
          </h2>
          <button className="relative w-fit font-semibold italic text-cyan-400 text-sm text-right tracking-[-0.30px] leading-5 whitespace-nowrap">
            View All &gt;&gt;
          </button>
        </div>
        <div className="flex items-start gap-6 relative flex-1 self-stretch w-full grow">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col h-48 items-center justify-center relative flex-1 grow rounded-2xl bg-gray-800 animate-pulse">
                <div className="text-white">Loading...</div>
              </div>
            ))
          ) : (
            predictionPools.map((pool) => {
              const IconComponent = pool.icon

              return (
                <button
                  key={pool.id}
                  onClick={() => console.log(`Pool ${pool.id} clicked`)}
                  className="flex flex-col h-48 items-center justify-end relative flex-1 grow rounded-2xl overflow-hidden bg-cover bg-[50%_50%] cursor-pointer hover:scale-[1.02] transition-transform duration-200 hover:border-cyan-400 border border-transparent"
                  style={{ backgroundImage: `url(${pool.backgroundImage})` }}
                >
                  <div className="flex flex-col items-center justify-end gap-4 p-4 relative flex-1 self-stretch w-full grow rounded-2xl border border-solid border-white/10 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]">
                    <div className="inline-flex items-center justify-center gap-2 pl-1 pr-2 py-1 relative flex-[0_0_auto] bg-white/5 rounded-lg overflow-hidden border border-solid border-white/10 backdrop-blur-[25px] backdrop-brightness-[100%]">
                      <IconComponent className="!relative !w-8 !h-8 !aspect-[1]" />
                      <div className="relative w-fit font-semibold text-white text-xs tracking-[-0.30px] leading-4 whitespace-nowrap">
                        {pool.category}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <h3 className="relative self-stretch font-semibold text-white text-sm text-center tracking-[-0.30px] leading-5">
                        {pool.title}
                      </h3>
                      <p className="relative text-white/70 text-xs text-center">
                        {pool.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </section>
    </main>
  )
}
