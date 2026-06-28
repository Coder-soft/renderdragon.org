import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { IconArrowRight, IconBolt } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import Logo from '@/components/Logo'

const toolPaths = [
  '/background-generator',
  '/player-renderer',
  '/text-generator',
  '/youtube-downloader',
  '/ai-title-helper',
  '/generators',
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } }
}

const Hero = () => {
  const [randomTool, setRandomTool] = useState('/generators')

  useEffect(() => {
    setRandomTool(toolPaths[Math.floor(Math.random() * toolPaths.length)])
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-6 py-20 md:py-28">
      <div className="absolute inset-0 pointer-events-none cow-grid-bg opacity-50" />

      <motion.div
        className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6">
          <Logo size="xl" />
          <h1 className="font-minecraftia text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
            Render<span className="text-cow-purple">Dragon</span>
          </h1>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="font-jetbrains-mono text-lg md:text-xl text-foreground/80 max-w-xl mb-8 leading-relaxed"
        >
          Free music, SFX, fonts, presets, and editing tools — all in one place.
          Built for Minecraft YouTubers who'd rather film than file-cabinet.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            to="/resources"
            className="pixel-btn-primary group flex items-center gap-2 text-base md:text-lg"
          >
            <span>Browse Resources</span>
            <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to={randomTool}
            className="pixel-btn-secondary group flex items-center gap-2 text-base md:text-lg"
          >
            <IconBolt className="w-5 h-5" />
            <span>Try a Tool</span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default React.memo(Hero)
