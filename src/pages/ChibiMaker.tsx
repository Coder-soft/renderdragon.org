import { Helmet } from 'react-helmet-async';
import Footer from '@/components/Footer';
import ChibiTool from '@/components/chibi/ChibiTool';

const ChibiMaker = () => (
  <div className="min-h-screen flex flex-col">
    <Helmet>
      <title>Minecraft Chibi Maker - Renderdragon</title>
      <meta
        name="description"
        content="Turn any Minecraft skin into a pixel-art chibi. Type a username or upload a skin, pick a view and size, then export a PNG."
      />
      <meta property="og:title" content="Minecraft Chibi Maker - Renderdragon" />
      <meta
        property="og:description"
        content="Turn any Minecraft skin into a pixel-art chibi and export a PNG."
      />
      <meta property="og:url" content="https://renderdragon.org/chibi-maker" />
    </Helmet>

    <main className="flex-grow pt-24 pb-16 cow-grid-bg">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl mb-4 text-center">
            Minecraft <span className="text-primary">Chibi Maker</span>
          </h1>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
            Type a username or upload a skin, pick a view, size, and frame, then export a pixel-art chibi.
            Everything runs in your browser.
          </p>
          <ChibiTool />
        </div>
      </div>
    </main>

    <Footer />
  </div>
);

export default ChibiMaker;
