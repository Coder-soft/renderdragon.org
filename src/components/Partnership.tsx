import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cardVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

const Partnership = () => {

  const partners = [
    {
      name: "Creators Kingdom",
      description: "Premium Minecraft content creation community and resources.",
      logo: "https://cdn.bsky.app/img/avatar/plain/did:plc:2v6n63ayh4zfevupgxrkufx4/bafkreibufdbu2k76p5mdnwo64bmptl6g2wnl6imd3wxm3nvkstoqgjkz2q@jpeg",
      url: "https://bsky.app/profile/creatorskingdom.bsky.social",
    },
    {
      name: "Proger's Kitchen",
      description: "Community-driven Discord server for content creators and developers.",
      logo: "/assets/progerskitchen.webp",
      url: "https://discord.gg/wXhHe5bVgz",
    },
    {
      name: "Decour SMP",
      description: "Minecraft SMP community with content creation focus.",
      logo: "/assets/Decour.jpg",
      url: "https://dsc.gg/decoursmp",
    },
  ];
  return (
    <section className="py-24 bg-background dark:bg-black/20 cow-grid-bg">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground dark:text-white font-vt323">
            Our Partners
          </h2>
          <p className="text-lg text-center text-foreground/80 dark:text-white/80 mb-10">
            Working together with amazing creators and organizations to bring you the best resources.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group"
            >
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full pixel-card bg-card/50 backdrop-blur-sm border-border/20 hover:border-cow-purple/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-cow-purple/10"
              >
                <div className="p-6 flex flex-col items-center text-center h-full">
                  <div className="w-28 h-28 mb-5 relative">
                    <img
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      className="w-full h-full rounded-full object-cover border-4 border-background group-hover:border-cow-purple/30 transition-all duration-300"
                      loading="lazy"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-cow-purple text-white p-1 rounded-full border-2 border-background">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-vt323 mb-2">{partner.name}</h3>
                  <p className="text-muted-foreground text-sm flex-grow">
                    {partner.description}
                  </p>
                </div>
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
             className="text-center mt-16"
        >
            <a
                href="/contact"
                className="font-vt323 inline-block bg-transparent border-2 border-cow-purple text-cow-purple font-bold text-lg py-3 px-8 rounded-lg hover:bg-cow-purple hover:text-white transition-all duration-300 transform hover:scale-105"
            >
                Become a Partner
            </a>
        </motion.div>
      </div>
    </section>
  );
};

export default React.memo(Partnership); 