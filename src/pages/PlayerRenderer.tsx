import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconDownload, IconCopy, IconRefresh, IconLoader2 } from '@tabler/icons-react';
import { toast } from 'sonner';
import Seo from '@/components/Seo';
import { softwareApplicationSchema } from '@/lib/structuredData';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import confetti from 'canvas-confetti';
import PlayerRenderSkeleton from '@/components/skeletons/PlayerRenderSkeleton';

interface PlayerData {
  id: string;
  username: string;
}

const PlayerRenderer = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [technobladeMessage, setTechnobladeMessage] = useState<string | null>(null);

  const fetchPlayerData = async (username: string) => {
    setIsFetching(true);
    setError(null);
    setTechnobladeMessage(null);

    if (username.toLowerCase() === 'technoblade') {
      setTechnobladeMessage('Technoblade never dies!');
      setPlayerData({ id: 'b876ec32e396476ba1158438d83c67d4', username: 'Technoblade' });
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FF0000', '#FFC0CB', '#A020F0'],
        shapes: ['circle', 'square'],
        scalar: 0.9,
        disableForReducedMotion: true,
      });
      toast.success('Technoblade never dies!');
      setIsFetching(false);
      return;
    }

    if (username.toLowerCase() === 'jeb_') {
      document.body.style.transform = 'rotate(180deg)';
      setTimeout(() => {
        document.body.style.transform = '';
      }, 5000);
      setPlayerData({ id: '853c80ef3c3749fdaa49938b674adae6', username: 'jeb_' });
    }

    try {
      const response = await fetch(`https://playerdb.co/api/player/minecraft/${username}`);
      const data = await response.json();

      if (!data.success || data.code !== 'player.found') {
        setError('Player not found. Please check the username and try again.');
        setPlayerData(null);
        return;
      }

      setPlayerData({ id: data.data.player.raw_id, username: data.data.player.username });
    } catch {
      setError('Failed to fetch player data. Please try again later.');
      setPlayerData(null);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    fetchPlayerData(username);
  };

  const handleDownload = async (url: string, type: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to download image');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${playerData?.username || username}-${type}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Downloaded successfully!');
    } catch {
      toast.error('Failed to download image');
    } finally {
      setIsLoading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const renderUrls = {
    mineatar: {
      full: (id: string) => `https://api.mineatar.io/body/front/${id}?scale=8&overlay=true`,
    },
    nmsr: {
      bust: (id: string) => `https://nmsr.nickac.dev/bust/${id}`,
      fullbody: (id: string) => `https://nmsr.nickac.dev/fullbody/${id}`,
      face: (id: string) => `https://nmsr.nickac.dev/face/${id}`,
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Player Renderer - Renderdragon"
        description="Render a Minecraft player as a head, bust, or full body, then download the PNG."
        path="/player-renderer"
        jsonLd={softwareApplicationSchema({
          name: 'Player Renderer',
          description: 'Render a Minecraft player as a head, bust, or full body.',
          path: '/player-renderer',
          image: '/ogimg/software.png',
        })}
      />

      <main className="flex-grow pt-24 pb-16 cow-grid-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl mb-4">
                Player <span className="text-primary">Renderer</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Render a Minecraft player as a head, bust, or full body, then download the PNG.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-4 mb-8"
            >
              <form onSubmit={handleSubmit} className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Enter Minecraft username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isFetching}
                />
                <Button type="submit" variant="default" disabled={!username || isFetching}>
                  {isFetching ? <IconLoader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setUsername('');
                    setPlayerData(null);
                    setError(null);
                    setTechnobladeMessage(null);
                  }}
                  disabled={isFetching}
                >
                  <IconRefresh className="h-4 w-4" />
                </Button>
              </form>
            </motion.div>

            {error && !technobladeMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-8 text-center"
              >
                {error}
              </motion.div>
            )}

            {technobladeMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                className="bg-pink-600 text-white px-4 py-3 rounded-md mb-8 text-center font-bold text-xl"
              >
                {technobladeMessage}
              </motion.div>
            )}

            {isFetching ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <PlayerRenderSkeleton key={i} />
                ))}
              </div>
            ) : (
              playerData && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="rounded-xl border border-border bg-card p-4 flex flex-col">
                      <h2 className="text-center">Body</h2>
                      <div className="aspect-square relative">
                        <img
                          src={renderUrls.mineatar.full(playerData.id)}
                          alt={`${playerData.username}'s full body`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4 flex gap-2 mt-auto">
                        <Button variant="default" className="flex-1" onClick={() => handleDownload(renderUrls.mineatar.full(playerData.id), 'body')} disabled={isLoading}>
                          {isLoading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconDownload className="h-4 w-4 mr-2" />}
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => copyUrl(renderUrls.mineatar.full(playerData.id))}>
                          <IconCopy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 flex flex-col">
                      <h2 className="text-center">Head</h2>
                      <div className="aspect-square relative">
                        <img
                          src={renderUrls.nmsr.face(playerData.id)}
                          alt={`${playerData.username}'s head`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4 flex gap-2 mt-auto">
                        <Button variant="default" className="flex-1" onClick={() => handleDownload(renderUrls.nmsr.face(playerData.id), 'head')} disabled={isLoading}>
                          {isLoading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconDownload className="h-4 w-4 mr-2" />}
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => copyUrl(renderUrls.nmsr.face(playerData.id))}>
                          <IconCopy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 flex flex-col">
                      <h2 className="text-center">Bust</h2>
                      <div className="aspect-square relative">
                        <img
                          src={renderUrls.nmsr.bust(playerData.id)}
                          alt={`${playerData.username}'s bust`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4 flex gap-2 mt-auto">
                        <Button variant="default" className="flex-1" onClick={() => handleDownload(renderUrls.nmsr.bust(playerData.id), 'bust')} disabled={isLoading}>
                          {isLoading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconDownload className="h-4 w-4 mr-2" />}
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => copyUrl(renderUrls.nmsr.bust(playerData.id))}>
                          <IconCopy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 flex flex-col">
                      <h2 className="text-center">Full Render</h2>
                      <div className="aspect-square relative">
                        <img
                          src={renderUrls.nmsr.fullbody(playerData.id)}
                          alt={`${playerData.username}'s full body view`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4 flex gap-2 mt-auto">
                        <Button variant="default" className="flex-1" onClick={() => handleDownload(renderUrls.nmsr.fullbody(playerData.id), 'fullbody')} disabled={isLoading}>
                          {isLoading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconDownload className="h-4 w-4 mr-2" />}
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => copyUrl(renderUrls.nmsr.fullbody(playerData.id))}>
                          <IconCopy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PlayerRenderer;
