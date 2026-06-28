import React from "react"
import { IconCheck, IconBolt, IconCloud } from '@tabler/icons-react'

const items = [
  { icon: IconCheck, label: "100% Free", sub: "No paywalls, ever" },
  { icon: IconCloud, label: "No Signup", sub: "Open and use" },
  { icon: IconBolt, label: "500+ Assets", sub: "Music, SFX, fonts, more" },
]

const TrustBar = () => {
  return (
    <section className="relative bg-cow-dark border-y-4 border-cow-purple">
      <div className="absolute inset-0 pointer-events-none cow-grid-bg opacity-40" />
      <div className="relative container mx-auto px-4 sm:px-6 py-6 md:py-7">
        <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-center gap-3"
            >
              <div className="flex-shrink-0 w-11 h-11 bg-cow-purple/20 border-2 border-cow-purple pixel-corners flex items-center justify-center">
                <item.icon className="w-5 h-5 text-cow-purple" stroke={2.5} />
              </div>
              <div className="text-left min-w-0">
                <div className="font-jetbrains-mono text-base sm:text-lg md:text-xl text-foreground uppercase tracking-wide leading-none truncate">
                  {item.label}
                </div>
                <div className="font-jetbrains-mono text-xs sm:text-sm text-foreground/60 leading-none mt-1 truncate">
                  {item.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default React.memo(TrustBar)
