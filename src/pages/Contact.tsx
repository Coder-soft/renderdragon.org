import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Clock, Github, Globe, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  github?: string;
  website?: string;
  discord?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "ProgerX",
    role: "Founder & Lead Developer",
    avatar: "/assets/ProgerX.jpg",
    github: "https://github.com/progerx",
    website: "https://progerx.me",
    discord: "progerx"
  },
  {
    name: 'Clover',
    role: 'Project Lead',
    avatar: '/assets/clover.jpeg',
    github: 'https://github.com/CloverTheBunny',
    discord: 'https://discordapp.com/users/789997917661560862'
  },
  {
    name: 'Yamura',
    role: 'Lead Programmer',
    avatar: '/assets/yamura.png',
    github: 'https://github.com/Yxmura',
    discord: 'https://discordapp.com/users/877933841170432071'
  },
  {
    name: 'TomatoKing',
    role: 'King of Yapping',
    avatar: '/assets/tomatoking.png',
    discord: 'https://discordapp.com/users/1279190506126966847',
    website: 'https://tomatosportfolio.netlify.app'
  },
  {
    name: 'Denji',
    role: 'Guide Writer',
    avatar: '/assets/denji.png',
    discord: 'https://discordapp.com/users/1114195537093201992',
    website: 'https://yournotluis.xyz/'
  },
  {
    name: 'IDoTheHax',
    role: 'Original Creator',
    avatar: 'https://cdn.discordapp.com/avatars/987323487343493191/3187a33efcddab3592c93ceac0a6016b.webp?size=48',
    github: 'https://github.com/idothehax',
    website: 'https://idothehax.com/',
    discord: 'https://discordapp.com/users/987323487343493191'
  },
  {
    name: 'VOVOplay',
    role: 'Animator',
    avatar: '/assets/VOVOplay.png',
    website: 'https://vovomotion.com/',
    discord: 'https://discordapp.com/users/758322333437394944'
  }
];

const Contact = () => {
  const [emailCopied, setEmailCopied] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const copyEmail = () => {
    const email = 'contact@renderdragon.org';
    navigator.clipboard.writeText(email);
    setEmailCopied(true);
    toast.success('Email copied to clipboard!');
    
    setTimeout(() => {
      setEmailCopied(false);
    }, 2000);
  };

  return (
    <>
      <Helmet>
        <title>Contact - Renderdragon</title>
        <meta name="description" content="Get in touch with the Renderdragon team. Contact us for support, partnerships, or any questions about our free Minecraft content creation resources." />
        <meta property="og:title" content="Contact - Renderdragon" />
        <meta property="og:description" content="Get in touch with the Renderdragon team. Contact us for support, partnerships, or any questions about our free Minecraft content creation resources." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://renderdragon.org/contact" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact - Renderdragon" />
        <meta name="twitter:description" content="Get in touch with the Renderdragon team. Contact us for support, partnerships, or any questions about our free Minecraft content creation resources." />
      </Helmet>

      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-vt323">
              <span className="text-cow-purple">Contact</span>
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-2xl font-vt323 mb-4">Get in Touch</h2>
              <p className="text-muted-foreground mb-6">
                We'd love to hear from you! Whether you have questions about our resources, need support, or want to discuss partnerships, we're here to help.
              </p>

              <div className="space-y-4">
                <Button
                  onClick={copyEmail}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  <span className="flex-1 text-left">contact@renderdragon.org</span>
                  {emailCopied ? (
                    <span>Copied!</span>
                  ) : (
                    <span>Copy</span>
                  )}
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h2 className="text-2xl font-vt323 mb-4">Join Our Community</h2>
              <p className="text-muted-foreground mb-6">
                Connect with other creators, get the latest updates, and be part of our growing community.
              </p>

              <Button
                asChild
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
              >
                <a href="https://discord.gg/renderdragon" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-3" />
                  <span>Join Discord Server</span>
                </a>
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-2xl font-vt323 mb-4">Support Hours</h2>
            <p className="text-muted-foreground">
              We typically respond within 24-48 hours. For urgent matters, please reach out via Discord for faster support.
            </p>
          </motion.div>

          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-2xl font-vt323 mb-6 text-center">Meet the Team</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-6 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{member.name}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{member.role}</p>
                      
                      <div className="flex justify-center space-x-3">
                        {member.github && (
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={`${member.name} GitHub`}
                          >
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        {member.website && (
                          <a
                            href={member.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={`${member.name} Website`}
                          >
                            <Globe className="w-5 h-5" />
                          </a>
                        )}
                        {member.discord && (
                          <span
                            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            aria-label={`${member.name} Discord`}
                            onClick={() => {
                              navigator.clipboard.writeText(member.discord!);
                              toast.success(`Discord handle copied: ${member.discord}`);
                            }}
                          >
                            <Users className="w-5 h-5" />
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default Contact;