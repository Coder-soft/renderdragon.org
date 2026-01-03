import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconHeart } from "@tabler/icons-react";
import { supporters } from "@/data/supporters";

const DonateButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const supporterCount = supporters.length;

  return (
    <div
      className="fixed bottom-6 left-6 z-50 py-2 pr-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.a
        href="https://www.buymeacoffee.com/renderdragon"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center bg-cow-purple rounded-full h-12 shadow-lg border-2 border-black/20 overflow-hidden cursor-pointer"
        initial={false}
        animate={{
          width: isHovered ? "200px" : "64px",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30
        }}
      >
        <div className="flex items-center justify-center w-[64px] h-full shrink-0">
          <div className="relative">
            <IconHeart className="h-4 w-4 text-white/20 absolute -top-3 -right-3" fill="currentColor" />
            <span className="font-geist-mono font-black text-white text-xl tracking-tighter">
              {supporterCount}
            </span>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center pr-6 whitespace-nowrap"
            >
              <div className="h-5 w-[1px] bg-white/20 mr-4" />
              <span className="text-white text-sm font-bold uppercase tracking-[0.2em] font-vt323">
                Donate 🍕
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.a>
    </div>
  );
};

export default DonateButton;
