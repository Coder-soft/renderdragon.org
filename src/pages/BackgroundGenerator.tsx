import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  IconDownload,
  IconRefresh,
  IconUpload,
  IconTrash,
  IconPhoto,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Texture = { id: number | string; url: string; title: string; subcategory?: string };
type PatternImage = { id: string; url: string; title: string; source: "library" | "upload" };
type PatternType = "grid" | "staggered" | "diagonal" | "scattered" | "random";

const isTexture = (value: unknown): value is Texture => {
  if (!value || typeof value !== 'object') return false;
  const texture = value as Record<string, unknown>;
  return (typeof texture.id === 'number' || typeof texture.id === 'string') && typeof texture.url === 'string' && typeof texture.title === 'string' && texture.subcategory === 'textures';
};

const normalizeSearchText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const editDistance = (left: string, right: string) => {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = previous[0];
    previous[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const above = previous[rightIndex];
      previous[rightIndex] = left[leftIndex - 1] === right[rightIndex - 1]
        ? diagonal
        : Math.min(diagonal, previous[rightIndex - 1], above) + 1;
      diagonal = above;
    }
  }

  return previous[right.length];
};

const fuzzyTextureScore = (texture: Texture, query: string) => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;

  const title = normalizeSearchText(texture.title);
  const words = title.split(" ").filter(Boolean);
  if (title === normalizedQuery) return 0;
  if (title.startsWith(normalizedQuery)) return 1;
  if (title.includes(normalizedQuery)) return 2;

  const queryWords = normalizedQuery.split(" ").filter(Boolean);
  const wordScore = queryWords.reduce((total, queryWord) => {
    const bestWordScore = words.reduce((best, word) => {
      if (word.startsWith(queryWord)) return Math.min(best, 3);
      if (word.includes(queryWord)) return Math.min(best, 4);
      if (queryWord.length >= 3 && editDistance(word, queryWord) <= 2) return Math.min(best, 5);
      return best;
    }, Infinity);

    return total + bestWordScore;
  }, 0);

  if (wordScore !== Infinity && wordScore <= queryWords.length * 5) return 10 + wordScore;

  let queryIndex = 0;
  for (const character of title) {
    if (character === normalizedQuery[queryIndex]) queryIndex += 1;
    if (queryIndex === normalizedQuery.length) return 20 + title.length - normalizedQuery.length;
  }

  return Infinity;
};

const createRandom = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

const BackgroundGenerator = () => {
  const [color, setColor] = useState("#9b87f5");
  const [size, setSize] = useState("1920x1080");
  const [spacing, setSpacing] = useState([0]);
  const [opacity, setOpacity] = useState([100]);
  const [scale, setScale] = useState([100]);
  const [isTransparent, setIsTransparent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<PatternImage[]>([]);
  const [textures, setTextures] = useState<Texture[]>([]);
  const [visibleTexturesCount, setVisibleTexturesCount] = useState(40);
  const [textureSearch, setTextureSearch] = useState("");
  const [selectedImages, setSelectedImages] = useState<PatternImage[]>([]);
  const [patternType, setPatternType] = useState<PatternType>("random");
  const [randomSeed, setRandomSeed] = useState(() => Date.now());
  const [isLoadingTextures, setIsLoadingTextures] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadIdRef = useRef(0);
  const generationIdRef = useRef(0);

  const invalidateGeneration = () => {
    generationIdRef.current += 1;
    setGeneratedImage(null);
    setIsGenerating(false);
  };

  const filteredTextures = textureSearch.trim()
    ? textures
      .map((texture) => ({ texture, score: fuzzyTextureScore(texture, textureSearch) }))
      .filter(({ score }) => score !== Infinity)
      .sort((left, right) => left.score - right.score || left.texture.title.localeCompare(right.texture.title))
      .map(({ texture }) => texture)
    : textures;

  useEffect(() => {
    setVisibleTexturesCount(40);
  }, [textureSearch]);

  useEffect(() => {
    const fetchTextures = async () => {
      try {
        setIsLoadingTextures(true);
        const response = await fetch('https://hamburger-api.powernplant101-c6b.workers.dev/mcicons');
        if (!response.ok) throw new Error('Failed to fetch textures');
        const data = await response.json();
        if (data && data.files) {
          const filteredTextures = Array.isArray(data.files) ? data.files.filter(isTexture) : [];
          setTextures(filteredTextures);
        }
      } catch (error) {
        console.error("Error fetching textures:", error);
        toast.error("Failed to load Minecraft Icons textures");
      } finally {
        setIsLoadingTextures(false);
      }
    };

    fetchTextures();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      toast.error("Only image files can be added");
    }
    if (!imageFiles.length) return;
    invalidateGeneration();

    const newImages = imageFiles.map((file) => {
      const id = `upload-${uploadIdRef.current++}`;
      return new Promise<PatternImage>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          id,
          url: reader.result as string,
          title: file.name,
          source: "upload",
        });
        reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImages)
      .then((images) => {
        setUploadedImages((current) => [...current, ...images]);
        setSelectedImages((current) => [...current, ...images]);
      })
      .catch(() => toast.error("One or more images could not be read"));

    event.target.value = "";
  };

  const toggleImageSelection = (image: PatternImage) => {
    invalidateGeneration();
    setSelectedImages((current) => {
      const isSelected = current.some((selected) => selected.id === image.id);
      return isSelected
        ? current.filter((selected) => selected.id !== image.id)
        : [...current, image];
    });
  };

  const removeUploadedImage = (id: string) => {
    invalidateGeneration();
    setUploadedImages((current) => current.filter((image) => image.id !== id));
    setSelectedImages((current) => current.filter((image) => image.id !== id));
  };

  const clearAllUploads = () => {
    invalidateGeneration();
    const uploadIds = new Set(uploadedImages.map((image) => image.id));
    setUploadedImages([]);
    setSelectedImages((current) => current.filter((image) => !uploadIds.has(image.id)));
  };

  const generatePattern = (
    ctx: CanvasRenderingContext2D,
    images: Array<PatternImage & { image: HTMLImageElement }>,
    canvasWidth: number,
    canvasHeight: number,
    imgSpacing: number,
    imgOpacity: number,
    imgScale: number,
    type: PatternType,
    seed: number,
  ) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (!isTransparent) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    const random = createRandom(seed);
    const spacingPixels = imgSpacing;
    const baseHeight = Math.max(12, 100 * (imgScale / 100));
    const sizes = images.map((source) => {
      const aspectRatio = source.image.width / source.image.height || 1;
      return { width: baseHeight * aspectRatio, height: baseHeight };
    });

    const drawTile = (sourceIndex: number, x: number, y: number, width: number, height: number, rotation = 0) => {
      const source = images[sourceIndex % images.length];
      ctx.save();
      ctx.globalAlpha = imgOpacity / 100;
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate(rotation);
      ctx.drawImage(source.image, -width / 2, -height / 2, width, height);
      ctx.restore();
    };

    if (type === "random") {
      const step = Math.max(12, baseHeight + spacingPixels);
      for (let y = -baseHeight; y < canvasHeight + baseHeight; y += step) {
        for (let x = -baseHeight; x < canvasWidth + baseHeight; x += step) {
          const sourceIndex = Math.floor(random() * images.length);
          const { width, height } = sizes[sourceIndex];
          const tileScale = 0.7 + random() * 0.7;
          drawTile(
            sourceIndex,
            x + (random() - 0.5) * step,
            y + (random() - 0.5) * step,
            width * tileScale,
            height * tileScale,
            (random() - 0.5) * 0.45,
          );
        }
      }
      return;
    }

    const maxWidth = Math.max(...sizes.map(({ width }) => width));
    const horizontalStep = Math.max(12, maxWidth + spacingPixels);
    const verticalStep = Math.max(12, baseHeight + spacingPixels);
    let tileIndex = 0;

    if (type === "scattered") {
      for (let y = -baseHeight; y < canvasHeight + baseHeight; y += verticalStep) {
        for (let x = -maxWidth; x < canvasWidth + maxWidth; x += horizontalStep) {
          const sourceIndex = Math.floor(random() * images.length);
          const { width, height } = sizes[sourceIndex];
          const tileScale = 0.8 + random() * 0.4;
          drawTile(
            sourceIndex,
            x + (random() - 0.5) * horizontalStep * 0.65,
            y + (random() - 0.5) * verticalStep * 0.65,
            width * tileScale,
            height * tileScale,
            (random() - 0.5) * 0.25,
          );
        }
      }
      return;
    }

    for (let row = 0, y = -baseHeight; y < canvasHeight + baseHeight; row += 1, y += verticalStep) {
      const rowOffset = type === "staggered"
        ? (row % 2) * horizontalStep / 2
        : type === "diagonal"
          ? row * horizontalStep * 0.35
          : 0;

      for (let x = -maxWidth + rowOffset; x < canvasWidth + maxWidth; x += horizontalStep) {
        const sourceIndex = tileIndex % images.length;
        const { width, height } = sizes[sourceIndex];
        drawTile(sourceIndex, x, y, width, height);
        tileIndex += 1;
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedImages.length) return;

    const generationId = ++generationIdRef.current;
    setIsGenerating(true);
    const [width, height] = size.split("x").map((dim) => parseInt(dim, 10));

    try {
      const loadedImages = await Promise.all(selectedImages.map((source) => new Promise<PatternImage & { image: HTMLImageElement }>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "Anonymous";
        image.onload = () => resolve({ ...source, image });
        image.onerror = () => reject(new Error(`Failed to load ${source.title}`));
        image.src = source.url;
      })));

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      generatePattern(ctx, loadedImages, width, height, spacing[0], opacity[0], scale[0], patternType, randomSeed);
      if (generationId === generationIdRef.current) {
        setGeneratedImage(canvas.toDataURL("image/png"));
      }
    } catch (error) {
      console.error("Failed to load image for generation", error);
      toast.error("One or more selected images could not be loaded");
    } finally {
      if (generationId === generationIdRef.current) {
        setIsGenerating(false);
      }
    }
  };

  useEffect(() => {
    if (!selectedImages.length) return;

    const timer = setTimeout(() => {
      handleGenerate();
    }, 500);

    return () => clearTimeout(timer);
    // Generation is intentionally debounced from these controls.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, size, spacing[0], opacity[0], scale[0], selectedImages, patternType, isTransparent, randomSeed]);

  const handleDownload = () => {
    if (!generatedImage) return;

    toast.info("Starting download...", {
      description: "Your background will be downloaded shortly",
    });

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `minecraft-pattern-background-${size}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Background Generator - Renderdragon</title>
        <meta
          name="description"
          content="Create unique and engaging backgrounds for your Minecraft YouTube thumbnails and channel art with our background generator tool."
        />
        <meta
          property="og:title"
          content="Background Generator - Renderdragon"
        />
        <meta
          property="og:description"
          content="Create unique and engaging backgrounds for your Minecraft YouTube thumbnails and channel art with our background generator tool."
        />
        <meta
          property="og:image"
          content="https://renderdragon.org/ogimg/background.png"
        />
        <meta
          property="og:url"
          content="https://renderdragon.org/background-generator"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Background Generator - Renderdragon"
        />
        <meta
          name="twitter:image"
          content="https://renderdragon.org/ogimg/background.png"
        />
      </Helmet>
      <Navbar />

      <main className="flex-grow pt-24 pb-16 cow-grid-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-minecraftia mb-8 text-center">
              <span className="text-cow-purple">Background</span> Generator
            </h1>

            <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
              Generate custom Minecraft-themed backgrounds for your content.
              Perfect for thumbnails, stream overlays, and channel art.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6 pixel-card">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select images</label>
                    <Tabs defaultValue="library" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 pixel-corners h-9 mb-2">
                        <TabsTrigger value="library" className="text-xs">Library</TabsTrigger>
                        <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
                      </TabsList>

                      <TabsContent value="library" className="mt-0">
                        <div className="relative mb-2">
                          <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="search"
                            value={textureSearch}
                            onChange={(event) => setTextureSearch(event.target.value)}
                            placeholder="Search textures..."
                            aria-label="Search textures"
                            className="h-8 pl-8 pr-8 text-xs pixel-corners"
                          />
                          {textureSearch && (
                            <button
                              type="button"
                              onClick={() => setTextureSearch("")}
                              aria-label="Clear texture search"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              <IconX className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="border border-primary/20 rounded-sm bg-black/10 overflow-hidden">
                          <ScrollArea className="h-48 p-2">
                            {isLoadingTextures ? (
                              <div className="flex flex-col items-center justify-center h-full space-y-2 py-8">
                                <IconRefresh className="h-5 w-5 animate-spin text-cow-purple" />
                                <span className="text-xs text-muted-foreground">Loading icons...</span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-4 gap-2">
                                 {filteredTextures.slice(0, visibleTexturesCount).map((texture) => (
                                   <button
                                     type="button"
                                     key={texture.id}
                                     aria-pressed={selectedImages.some((image) => image.id === `library-${texture.id}`)}
                                     onClick={() => toggleImageSelection({
                                       id: `library-${texture.id}`,
                                       url: texture.url,
                                       title: texture.title,
                                       source: "library",
                                     })}
                                     className={`relative aspect-square border-2 rounded-sm overflow-hidden p-1 transition-all ${selectedImages.some((image) => image.id === `library-${texture.id}`)
                                       ? "border-cow-purple bg-cow-purple/20"
                                       : "border-transparent hover:border-cow-purple/50 bg-white/5"
                                       }`}
                                     title={texture.title}
                                   >
                                    <img
                                      src={texture.url}
                                      alt={texture.title}
                                      loading="lazy"
                                       className="w-full h-full object-contain pixelated"
                                     />
                                     {selectedImages.some((image) => image.id === `library-${texture.id}`) && (
                                       <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cow-purple text-[10px] font-bold text-white">✓</span>
                                     )}
                                   </button>
                                 ))}
                              </div>
                            )}
                            {!isLoadingTextures && !filteredTextures.length && (
                              <div className="py-8 text-center text-xs text-muted-foreground">
                                {textureSearch ? `No textures match "${textureSearch}"` : "No textures available"}
                              </div>
                            )}
                            {filteredTextures.length > visibleTexturesCount && (
                              <div className="mt-4 flex justify-center pb-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setVisibleTexturesCount(prev => prev + 40)}
                                  className="text-xs pixel-corners h-8"
                                >
                                  Load More ({filteredTextures.length - visibleTexturesCount} remaining)
                                </Button>
                              </div>
                            )}
                          </ScrollArea>
                        </div>
                      </TabsContent>

                      <TabsContent value="upload" className="mt-0">
                        <div className="space-y-2">
                          <div className="flex space-x-2 items-center">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              ref={fileInputRef}
                              className="hidden"
                            />
                            <Button
                              onClick={() => {
                                fileInputRef.current?.click();
                              }}
                              className="pixel-btn-primary flex-grow flex items-center justify-center space-x-2"
                            >
                              <IconUpload className="h-5 w-5" />
                              <span>Add Images</span>
                            </Button>
                            {uploadedImages.length > 0 && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={clearAllUploads}
                                className="pixel-corners"
                                title="Remove uploaded images"
                              >
                                <IconTrash className="h-5 w-5" />
                              </Button>
                            )}
                          </div>
                          {uploadedImages.length > 0 && (
                            <div className="grid grid-cols-4 gap-2">
                              {uploadedImages.map((image) => (
                                <div key={image.id} className={`group relative aspect-square overflow-hidden rounded-sm border-2 bg-black/10 ${selectedImages.some((selected) => selected.id === image.id) ? "border-cow-purple" : "border-transparent"}`}>
                                  <button type="button" aria-pressed={selectedImages.some((selected) => selected.id === image.id)} onClick={() => toggleImageSelection(image)} className="h-full w-full p-1" title={`${selectedImages.some((selected) => selected.id === image.id) ? "Deselect" : "Select"} ${image.title}`}>
                                    <img src={image.url} alt={image.title} className="h-full w-full object-contain" />
                                  </button>
                                  <button type="button" onClick={() => removeUploadedImage(image.id)} aria-label={`Remove ${image.title}`} className="absolute right-1 top-1 opacity-0 rounded-full bg-black/70 p-0.5 text-white transition-opacity group-hover:opacity-100 focus:opacity-100">
                                    <IconX className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="rounded-sm border border-primary/20 bg-black/10 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide">Selected images</p>
                          <p className="mt-1 text-xs text-muted-foreground">Choose from uploads and the library.</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-cow-purple/20 px-2 py-1 text-xs font-semibold text-cow-purple">
                          {selectedImages.length}
                        </span>
                      </div>
                      {selectedImages.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {selectedImages.map((image) => (
                            <button key={image.id} type="button" aria-label={`Remove ${image.title} from selection`} onClick={() => toggleImageSelection(image)} title={`Remove ${image.title}`} className="group relative h-9 w-9 overflow-hidden rounded-sm border border-cow-purple/60 bg-background">
                              <img src={image.url} alt="" className="h-full w-full object-contain" />
                              <span className="absolute inset-0 hidden items-center justify-center bg-black/60 text-xs text-white group-hover:flex">×</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-sm font-medium">Pattern style</label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            invalidateGeneration();
                            setRandomSeed((seed) => seed + 1);
                          }}
                          className="h-7 gap-1.5 px-2 text-xs pixel-corners"
                        >
                          <IconRefresh className="h-3.5 w-3.5" />
                          Randomize
                        </Button>
                      </div>
                      <Select value={patternType} onValueChange={(value: PatternType) => setPatternType(value)}>
                        <SelectTrigger className="pixel-corners">
                          <SelectValue placeholder="Choose a pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="random">Randomized mix</SelectItem>
                          <SelectItem value="grid">Classic grid</SelectItem>
                          <SelectItem value="staggered">Staggered tiles</SelectItem>
                          <SelectItem value="diagonal">Diagonal rows</SelectItem>
                          <SelectItem value="scattered">Scattered collage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="transparent-mode" className="text-sm font-medium">Transparent Background</label>
                      <Switch
                        id="transparent-mode"
                        checked={isTransparent}
                        onCheckedChange={setIsTransparent}
                      />
                    </div>

                    <div className={`space-y-2 ${isTransparent ? 'opacity-50 pointer-events-none' : ''}`}>
                      <label className="text-sm font-medium">
                        Background Color
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-14 h-10 p-1 cursor-pointer border-none"
                          disabled={isTransparent}
                        />
                        <Input
                          type="text"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="pixel-corners flex-grow"
                          disabled={isTransparent}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Spacing</label>
                      <span className="text-xs text-muted-foreground">
                        {spacing[0]}px
                      </span>
                    </div>
                    <Slider
                      value={spacing}
                      onValueChange={setSpacing}
                      min={0}
                      max={50}
                      step={1}
                      className="pixel-corners"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Opacity</label>
                      <span className="text-xs text-muted-foreground">
                        {opacity[0]}%
                      </span>
                    </div>
                    <Slider
                      value={opacity}
                      onValueChange={setOpacity}
                      min={10}
                      max={100}
                      step={1}
                      className="pixel-corners"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Scale</label>
                      <span className="text-xs text-muted-foreground">
                        {scale[0]}%
                      </span>
                    </div>
                    <Slider
                      value={scale}
                      onValueChange={setScale}
                      min={10}
                      max={300}
                      step={5}
                      className="pixel-corners"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Size</label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger className="pixel-corners">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1920x1080">
                          1920x1080 (16:9)
                        </SelectItem>
                        <SelectItem value="1280x720">
                          1280x720 (16:9)
                        </SelectItem>
                        <SelectItem value="2560x1440">
                          2560x1440 (16:9)
                        </SelectItem>
                        <SelectItem value="3840x2160">
                          3840x2160 (16:9)
                        </SelectItem>
                        <SelectItem value="4096x2160">
                          4096x2160 (DCI 4K)
                        </SelectItem>
                        <SelectItem value="5120x2880">
                          5120x2880 (5K)
                        </SelectItem>
                        <SelectItem value="7680x4320">
                          7680x4320 (8K)
                        </SelectItem>
                        <SelectItem value="1080x1080">
                          1080x1080 (1:1)
                        </SelectItem>
                        <SelectItem value="1080x1920">
                          1080x1920 (9:16)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                </div>
              </div>

              <div className="md:col-span-2 pixel-card flex flex-col">
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-jetbrains-mono">Preview</h3>
                </div>

                <div className="flex-grow flex items-center justify-center bg-black/20 rounded-md overflow-hidden relative min-h-[300px]">
                  {generatedImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={generatedImage}
                        alt="Generated background"
                        className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isGenerating ? 'opacity-50' : 'opacity-100'}`}
                      />
                      {isGenerating && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <IconRefresh className="h-12 w-12 animate-spin text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                  ) : selectedImages.length > 0 ? (
                    <div className="text-center px-4 animate-pulse">
                      <IconRefresh className="h-12 w-12 mx-auto mb-4 animate-spin text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Generating preview...
                      </p>
                    </div>
                  ) : (
                    <div className="text-center px-4">
                      <IconPhoto className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Select one or more images to start
                      </p>
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden"></canvas>
                </div>

                {generatedImage && (
                  <Button
                    onClick={handleDownload}
                    className="mt-4 pixel-btn-primary flex items-center justify-center space-x-2"
                  >
                    <IconDownload className="h-5 w-5" />
                    <span>Download Background</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-12 max-w-2xl mx-auto">
              <h2 className="text-2xl font-minecraftia mb-4 text-center">
                How to Use
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="pixel-card p-6">
                  <div className="h-12 w-12 bg-cow-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="font-jetbrains-mono text-xl">1</span>
                  </div>
                  <h3 className="font-jetbrains-mono mb-2">Upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload images and adjust settings
                  </p>
                </div>

                <div className="pixel-card p-6">
                  <div className="h-12 w-12 bg-cow-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="font-jetbrains-mono text-xl">2</span>
                  </div>
                  <h3 className="font-jetbrains-mono mb-2">Adjust</h3>
                  <p className="text-sm text-muted-foreground">
                    Customize spacing, opacity, and color in real-time
                  </p>
                </div>

                <div className="pixel-card p-6">
                  <div className="h-12 w-12 bg-cow-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="font-jetbrains-mono text-xl">3</span>
                  </div>
                  <h3 className="font-jetbrains-mono mb-2">Download</h3>
                  <p className="text-sm text-muted-foreground">
                    Download your background and use it in your content
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BackgroundGenerator;
