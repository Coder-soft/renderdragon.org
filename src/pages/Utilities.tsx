import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconArrowUpRight, IconPencil, IconMovie, IconCode, IconDeviceGamepad2 } from '@tabler/icons-react';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Helmet } from 'react-helmet-async';

interface Utility {
  name: string;
  description: string;
  url: string;
  category: 'graphic-design' | 'editing' | 'minecraft-shaders' | 'minecraft-mods' | 'websites';
  isFree: boolean;
}

const utilities: Utility[] = [
  {
    name: 'SkinMC',
    description: 'Skin editor, totem builder, achievement maker, and other Minecraft tools',
    url: 'https://skinmc.net/',
    category: 'websites',
    isFree: true
  },
  {
    name: 'GIMP',
    description: 'Free open source image editor, and the closest free replacement for Photoshop',
    url: 'https://www.gimp.org/',
    category: 'graphic-design',
    isFree: true
  },
  {
    name: 'Adobe Photoshop',
    description: 'The image editor most thumbnail artists work in. Paid subscription.',
    url: 'https://www.adobe.com/products/photoshop.html',
    category: 'graphic-design',
    isFree: false
  },
  {
    name: 'Photopea',
    description: 'Photoshop-style editing in the browser. Opens PSD files, free with ads',
    url: 'https://www.photopea.com/',
    category: 'graphic-design',
    isFree: true
  },
  {
    name: 'Affinity by Canva',
    description: 'Vector and raster design in one app',
    url: 'https://www.affinity.studio/',
    category: 'graphic-design',
    isFree: true
  },
  {
    name: 'Kdenlive',
    description: 'Free open source video editor for Windows, macOS, and Linux',
    url: 'https://kdenlive.org/',
    category: 'editing',
    isFree: true
  },
  {
    name: 'DaVinci Resolve',
    description: 'Editing, colour, and audio in one suite. The free version covers most projects.',
    url: 'https://www.blackmagicdesign.com/products/davinciresolve/',
    category: 'editing',
    isFree: true
  },
  {
    name: 'Premiere Pro',
    description: 'What most Minecraft editors cut in. Paid subscription.',
    url: 'https://www.adobe.com/products/premiere.html',
    category: 'editing',
    isFree: false
  },
  {
    name: 'CapCut',
    description: 'Quick cuts, captions, and templates with a free tier',
    url: 'https://www.capcut.com/',
    category: 'editing',
    isFree: true
  },
  {
    name: 'Complementary Shaders',
    description: 'Complementary shaders with settings tuned for thumbnail screenshots. Config by Proger',
    url: 'https://www.mediafire.com/file/kahvc3lduezt9v0/extract_me_and_put_all_files_in_shaderpacks_folder.zip/file',
    category: 'minecraft-shaders',
    isFree: true
  },
  {
    name: 'Bloop Shaders',
    description: 'Built for frame rate first, and still looks good at low settings.',
    url: 'https://modrinth.com/shader/bloop-shaders',
    category: 'minecraft-shaders',
    isFree: true
  },
  {
    name: 'Vanilletix Shaders',
    description: 'Keeps the vanilla look and improves the lighting',
    url: 'https://modrinth.com/shader/vanilletix',
    category: 'minecraft-shaders',
    isFree: true
  },
  {
    name: 'MC VHS',
    description: 'Makes Minecraft look like a VHS recording, tracking lines included',
    url: 'https://modrinth.com/shader/mc-vhs',
    category: 'minecraft-shaders',
    isFree: true
  },
  {
    name: 'Exposa Shaders',
    description: 'Natural lighting that leans into fantasy where it looks better',
    url: 'https://modrinth.com/shader/exposa-shaders',
    category: 'minecraft-shaders',
    isFree: true
  },
  {
    name: "Seltop's NewNPC mod",
    description: 'Add NPCs with custom skins and behaviour, useful for thumbnail scenes',
    url: 'https://modrinth.com/mod/seltops-newnpcs-mod/',
    category: 'minecraft-mods',
    isFree: true
  },
  {
    name: '3D Skin Layers',
    description: 'Renders the skin overlay in 3D, so hats and jackets stand out',
    url: 'https://modrinth.com/mod/3dskinlayers/version/GeQIXZBw',
    category: 'minecraft-mods',
    isFree: true
  },
  {
    name: 'Easy NPC',
    description: 'Add NPCs with custom skins and behaviour, with an easier setup than NewNPC',
    url: 'https://modrinth.com/mod/easy-npc',
    category: 'minecraft-mods',
    isFree: true
  }
];

const Utils = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('graphic-design');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'graphic-design':
        return <IconPencil className="h-5 w-5" />;
      case 'editing':
        return <IconMovie className="h-5 w-5" />;
      case 'minecraft-shaders':
        return <img className='h-5 w-5 grayscale' src="/assets/minecraft_icon.png" alt="shader" />;
      case 'minecraft-mods':
        return <img className='h-5 w-5 grayscale' src="/assets/modrinth_icon.png" alt="mods" />;
      case 'websites':
        return <img className='h-5 w-5 grayscale' src="/assets/domain_icon.png" alt="websites" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Useful Utilities - Renderdragon</title>
        <meta name="description" content="Video and image editors, shaders, and mods we use to make Minecraft videos and thumbnails." />
        <meta property="og:title" content="Useful Utilities - Renderdragon" />
        <meta property="og:description" content="Video and image editors, shaders, and mods we use to make Minecraft videos and thumbnails." />
        <meta property="og:image" content="https://i.ibb.co/60Mr2Psf/Document.png" />
        <meta property="og:url" content="https://renderdragon.org/utilities" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Useful Utilities - Renderdragon" />
        <meta name="twitter:image" content="https://i.ibb.co/60Mr2Psf/Document.png" />
      </Helmet>
      
      <main className="flex-grow cow-grid-bg">
        <div className="container mx-auto px-4 py-16 pt-24">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
           <h1 className="text-4xl md:text-5xl mb-4">
            Useful <span className="text-primary">Utilities</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tools we recommend for editing images and video, plus shaders and mods for filming in Minecraft.
          </p>
        </motion.div>

        <Tabs defaultValue="graphic-design" className="w-full" onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-transparent h-auto p-0">
            {['graphic-design', 'editing', 'minecraft-shaders', 'minecraft-mods', 'websites'].map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className=" data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-2 h-12"
              >
                {getCategoryIcon(category)}
                <span className="capitalize">{category.replace('-', ' ')}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {['graphic-design', 'editing', 'minecraft-shaders', 'minecraft-mods', 'websites'].map((category) => (
            <TabsContent key={category} value={category}>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
              >
                {utilities
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <motion.div
                      key={item.name}
                      variants={itemVariants}
                      onMouseEnter={() => setHoveredCard(item.name)}
                      onMouseLeave={() => setHoveredCard(null)}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full"
                      >
                        <Card className="h-full transition-all duration-300 hover:shadow-xl  border-2 border-primary/20 hover:border-primary/40">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span className="text-xl">{item.name}</span>
                              {item.isFree && (
                                <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded-md">
                                  Free
                                </span>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">{item.description}</p>
                            <motion.div
                              className="flex items-center text-sm font-medium text-primary"
                              animate={{
                                x: hoveredCard === item.name ? 5 : 0
                              }}
                            >
                              Visit Website
                              <IconArrowUpRight className="ml-1 h-4 w-4" />
                            </motion.div>
                          </CardContent>
                        </Card>
                      </a>
                    </motion.div>
                  ))}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Utils;
