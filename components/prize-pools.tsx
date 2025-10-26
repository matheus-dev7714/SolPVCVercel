"use client"

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