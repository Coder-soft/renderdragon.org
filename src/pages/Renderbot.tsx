import { motion } from 'framer-motion';
import { IconBrandDiscord } from '@tabler/icons-react';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';

const DISCORD_URL = 'https://discord.renderdragon.org';

const Renderbot = () => (
  <div className="min-h-screen flex flex-col">
    <Helmet>
      <title>Renderbot - Discord Bot for Minecraft Content Creators</title>
      <meta name="description" content="Renderbot is a Discord bot for content creators. Join the official RenderDragon Discord server to use it." />
      <meta property="og:title" content="Renderbot - Renderdragon" />
      <meta property="og:description" content="Join the official RenderDragon Discord server to use Renderbot." />
      <meta property="og:image" content="https://renderdragon.org/ogimg/renderbot.png" />
    </Helmet>

    <main className="flex-grow pt-24 pb-16 cow-grid-bg">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-card pixel-corners border-2 border-cow-purple/50 p-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-md border border-cow-purple/40 bg-cow-purple/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cow-purple mb-5">
              <IconBrandDiscord className="h-4 w-4" />
              Official RenderDragon Discord
            </div>
            <h2 className="text-2xl md:text-3xl font-minecraftia mb-4">
              Renderbot lives in our <span className="text-cow-purple">Discord</span>
            </h2>
            <p className="text-muted-foreground mb-7">
              You have to join the official RenderDragon Discord server to use Renderbot.
              It is not a website or an app you install &mdash; every command runs right in the
              server, and membership is required.
            </p>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-btn-primary inline-flex items-center space-x-2"
            >
              <span>join the discord</span>
              <img className="w-4 h-4" src="/assets/discord_icon.png" alt="" aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </div>
    </main>

    <Footer />
  </div>
);

export default Renderbot;
