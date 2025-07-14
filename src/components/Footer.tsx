import React, { Fragment, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { Menu, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import HyperpingBadge from '@/components/ui/StatusBadge';

const Footer = () => {
  const [cartClicked, setCartClicked] = useState(false);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const currentYear = new Date().getFullYear();

  const handleCartClick = () => {
    if (cartClicked) return;
    
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '999';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);
    
    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true
    });
    
    myConfetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.8 }
    });
    
    setTimeout(() => {
      document.body.removeChild(canvas);
    }, 3000);
    
    toast('Made with ❤️ by Renderdragon Team', {
      description: 'Thanks for supporting us!',
      position: "bottom-center",
      duration: 3000,
    });
    
    setCartClicked(true);
    
    if (cartButtonRef.current) {
      cartButtonRef.current.style.transform = 'translateX(150%)';
    }
  };

  return (
    <footer className="bg-cow-dark text-white overflow-x-hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-xl font-bold mb-4"
            >
              <div className="flex items-center justify-center">
                <Logo size="sm" />
              </div>
              <span className="font-pixel">Renderdragon</span>
            </Link>
            
            <p className="text-white/70 mb-6 max-w-md">
              Your ultimate destination for free Minecraft content creation resources, tools, and community.
            </p>
            
            <div className="flex space-x-4 mb-3">
              <a 
                href="https://discord.renderdragon.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                aria-label="Discord"
              >
                <img className="w-6 h-6" src="/assets/discord_icon.png" alt="Discord" loading="lazy" />
              </a>
              
              <a 
                href="https://x.com/_renderdragon" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                aria-label="Twitter"
              >
                <img className="w-6 h-6" src="/assets/twitter_icon.png" alt="Twitter" loading="lazy" />
              </a>
              
              <a 
                href="https://www.youtube.com/channel/UCOheNYpPEHcS2ljttRmllxg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                aria-label="YouTube"
              >
                <img className="w-6 h-6" src="/assets/youtube_icon.png" alt="YouTube" loading="lazy" />
              </a>
              
              <a 
                href="https://github.com/Yxmura/renderdragon" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                aria-label="GitHub"
              >
                <img className="w-6 h-6" src="/assets/github_icon.png" alt="GitHub" loading="lazy" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-vt323 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/tos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
            
            <h3 className="text-lg font-vt323 mb-4 mt-6">Navigate</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                  Resources Hub
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-muted-foreground hover:text-foreground transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link to="/utilities" className="text-muted-foreground hover:text-foreground transition-colors">
                  Utilities
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-vt323 mb-4">Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/music-copyright" className="text-muted-foreground hover:text-foreground transition-colors">
                  Music Copyright Checker
                </Link>
              </li>
              <li>
                <Link to="/background-generator" className="text-muted-foreground hover:text-foreground transition-colors">
                  Background Generator
                </Link>
              </li>
              <li>
                <Link to="/player-renderer" className="text-muted-foreground hover:text-foreground transition-colors">
                  Player Renderer
                </Link>
              </li>
              <li>
                <Link to="/renderbot" className="text-muted-foreground hover:text-foreground transition-colors">
                  Renderbot
                </Link>
              </li>
              <li>
                <Link to="/text-generator" className="text-muted-foreground hover:text-foreground transition-colors">
                  Text Generator
                </Link>
              </li>
              <li>
                <Link to="/generators" className="text-muted-foreground hover:text-foreground transition-colors">
                  Content Generators
                </Link>
              </li>
              <li>
                <Link to="/youtube-downloader" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                  <span>YouTube Downloader</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-cow-purple text-white text-[10px] rounded align-middle">New</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/50 space-y-4 md:space-y-0">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs text-muted-foreground">
            <Link to="/faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link to="/tos" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/renderbot" className="hover:text-foreground transition-colors">
              Renderbot
            </Link>
          </div>
          
          <div className="flex flex-col items-center md:items-end text-xs text-muted-foreground space-y-1">
            <div>
              <span className="mr-4">Not associated with Mojang Studios or Microsoft</span>
              <a href="https://www.flaticon.com/free-icons/pixel" title="pixel icons" className="hover:text-white transition-colors">Pixel icons created by Freepik - Flaticon</a>
            </div>
            <div>
              © {currentYear} Renderdragon. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);