import { useRef, useEffect, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { useResources } from '@/hooks/useResources';
import { useDownloadCounts } from '@/hooks/useDownloadCounts';
import { Resource } from '@/types/resources';
import ResourceFilters from '@/components/resources/ResourceFilters';
import SortSelector from '@/components/resources/SortSelector';
import ResourcesList from '@/components/resources/ResourcesList';
import AuthDialog from '@/components/auth/AuthDialog';
import { Button } from '@/components/ui/button';
import { IconArrowUp, IconHeart, IconSearch } from '@tabler/icons-react';
import { Helmet } from "react-helmet-async";
import DonateButton from '@/components/DonateButton';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ResourceDetailDialog = lazy(() => import('@/components/resources/ResourceDetailDialog'));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cow-purple"></div>
  </div>
);

const ResourcesHub = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [description, setDescription] = useState<string>("");
  const [credit, setCredit] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const {
    resources,
    selectedResource,
    setSelectedResource,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    isLoading,
    isSearching,
    loadedFonts,
    setLoadedFonts,
    filteredResources,
    hasCategoryResources,
    handleSearchSubmit,
    handleClearSearch,
    handleCategoryChange,
    handleSubcategoryChange,
    sortOrder,
    handleSortOrderChange,
    handleSearch,
    handleDownload,
  } = useResources();

  const { downloadCounts } = useDownloadCounts();

  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset > 400;
      setShowScrollTop(scrolled);
    };

    const handleShowFavorites = () => {
      setShowFavorites(true);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('showFavorites', handleShowFavorites);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('showFavorites', handleShowFavorites);
    };
  }, []);

  // Check URL params for favorites tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'favorites') {
      setShowFavorites(true);
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const onDownload = (resource: Resource) => {
    const success = handleDownload(resource);
    if (success) {
      toast.info('Download starting...', {
        description: 'Downloading resource...',
        duration: 3000,
      });
    } else {
      toast.error('Download error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Helmet>
        <title>Resources Hub</title>
        <meta name="description" content="Explore a vast collection of resources for RenderDragon." />
        <meta property="og:title" content="Resources Hub" />
        <meta property="og:description" content="Explore a vast collection of resources for RenderDragon." />
        <meta property="og:image" content="https://renderdragon.org/ogimg/resources.png" />
        <meta property="og:url" content="https://renderdragon.org/resources" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Resources Hub" />
        <meta name="twitter:image" content="https://renderdragon.org/ogimg/resources.png" />
      </Helmet>
      <Navbar />

      <main className="flex-grow pt-24 pb-16 cow-grid-bg custom-scrollbar">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-vt323 font-bold mb-2 text-center">Resources Hub</h1>
              <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">Discover and download a wide range of resources to enhance your RenderDragon experience.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="absolute top-0 right-0 hidden md:block z-10"
            >
              <Button
                onClick={() => setUploaderOpen(true)}
                className="pixel-btn-primary font-vt323 flex items-center gap-2"
              >
                <span className="text-xl">+</span> Submit Resource
              </Button>
            </motion.div>

            {/* Submit action is now in filters toolbar after Presets */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <AnimatePresence mode="wait">
                {showFavorites ? (
                  <motion.div
                    key="submit"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <Button onClick={() => setShowFavorites(false)} className="mb-6">
                      Back to Resources
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="browse"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ResourceFilters
                      searchQuery={searchQuery}
                      selectedCategory={selectedCategory}
                      selectedSubcategory={selectedSubcategory}
                      onSearch={handleSearch}
                      onClearSearch={handleClearSearch}
                      onSearchSubmit={handleSearchSubmit}
                      onCategoryChange={handleCategoryChange}
                      onSubcategoryChange={handleSubcategoryChange}
                      sortOrder={sortOrder}
                      onSortOrderChange={handleSortOrderChange}
                      isMobile={isMobile}
                      inputRef={inputRef}
                      onOpenSubmit={() => setUploaderOpen(true)}
                    />

                    {selectedCategory === 'minecraft-icons' && (
                      <p className="text-xs text-center text-muted-foreground mb-6 -mt-4 opacity-50 hover:opacity-100 transition-opacity">
                        Powered by Hydrogen Chloride
                      </p>
                    )}

                    <ResourcesList
                      resources={resources}
                      filteredResources={filteredResources}
                      isLoading={isLoading}
                      isSearching={isSearching}
                      selectedCategory={selectedCategory}
                      searchQuery={searchQuery}
                      downloadCounts={downloadCounts}
                      onSelectResource={setSelectedResource}
                      onClearFilters={handleClearSearch}
                      hasCategoryResources={hasCategoryResources}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      <DonateButton />

      <Suspense fallback={null}>
        <ResourceDetailDialog
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onDownload={onDownload}
          downloadCount={selectedResource ? downloadCounts[selectedResource.id] || 0 : 0}
          loadedFonts={loadedFonts}
          setLoadedFonts={setLoadedFonts}
          filteredResources={filteredResources}
          onSelectResource={setSelectedResource}
          isFavoritesView={showFavorites}
        />
      </Suspense>

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
      />


      {/* Public API Uploader Dialog */}
      <Dialog open={uploaderOpen} onOpenChange={setUploaderOpen}>
        <DialogContent className="sm:max-w-lg pixel-corners">
          <DialogHeader>
            <DialogTitle className="font-vt323 text-2xl">Public API Uploader</DialogTitle>
            <DialogDescription className="font-vt323">
              Upload files directly to the Renderdragon public API. Optionally include a description that will be sent to our Discord embed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-vt323 text-lg">Select files</label>
              <input
                type="file"
                multiple
                onChange={(e) => setSelectedFiles(e.target.files)}
                className="w-full pixel-input font-vt323"
                accept="audio/mpeg,audio/wav,video/mp4,video/quicktime,.prfpset,.drfx,.settings,.preset,image/jpeg,image/png,image/webp,.jpeg,.jpg,.png,.webp,font/ttf,font/otf,font/woff,font/woff2,.ttf,.otf,.woff,.woff2"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Supported: mp3, wav, mp4, mov, prfpset, drfx, settings, preset, jpeg/jpg, png, webp, ttf, otf, woff, woff2
              </p>
            </div>

            <div>
              <label className="block mb-2 font-vt323 text-lg">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1024}
                placeholder="Describe your upload (max 1024 chars)"
                className="w-full h-24 pixel-input font-vt323 resize-vertical"
              />
              <div className="text-right text-xs text-muted-foreground mt-1">{description.length}/1024</div>
            </div>

            <div>
              <label className="block mb-2 font-vt323 text-lg">Credit / Attribution (optional)</label>
              <input
                type="text"
                value={credit}
                onChange={(e) => setCredit(e.target.value)}
                placeholder="Who should be credited?"
                className="w-full pixel-input font-vt323"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setUploaderOpen(false)}
                className="font-vt323 pixel-corners"
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!selectedFiles || selectedFiles.length === 0) {
                    toast.error('Please select at least one file to upload.');
                    return;
                  }
                  try {
                    setIsUploading(true);
                    const files = Array.from(selectedFiles);
                    const results = [];

                    const authToken = import.meta.env.VITE_SUBMIT_AUTH_TOKEN;

                    for (const file of files) {
                      const form = new FormData();
                      form.append('file', file);
                      if (description) form.append('description', description);
                      if (credit) form.append('credit', credit);

                      const res = await fetch('https://69356fc63652.ngrok-free.app/upload', {
                        method: 'POST',
                        headers: {
                          'x-api-key': authToken
                        },
                        body: form,
                      });

                      if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ message: 'Upload failed' }));
                        throw new Error(errorData.message || 'Upload failed');
                      }
                      const json = await res.json();
                      results.push(json);
                    }

                    toast.success('Upload complete', {
                      description: `Successfully submitted ${results.length} file(s) for review.`
                    });

                    setUploaderOpen(false);
                    setSelectedFiles(null);
                    setDescription('');
                    setCredit('');
                  } catch (err: unknown) {
                    console.error('Upload Error:', err);
                    const msg = err instanceof Error ? err.message : 'Something went wrong.';
                    toast.error('Upload failed', { description: msg });
                  } finally {
                    setIsUploading(false);
                  }
                }}
                className="pixel-btn-primary font-vt323"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading…' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 z-[9999] h-12 w-12 rounded-full shadow-lg bg-cow-purple hover:bg-cow-purple-dark transition-all duration-300 opacity-90 hover:opacity-100 text-white border-2 border-white/10"
              size="icon"
              aria-label="Scroll to top"
            >
              <IconArrowUp className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResourcesHub;