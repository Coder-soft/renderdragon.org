import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Music, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const RATE_LIMIT = 5; // requests per minute

const MusicCopyright = () => {
  const { user } = useAuth();
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('song');
  const [requestCount, setRequestCount] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(0);

  const handleSubmit = async () => {
    // Rate limiting
    const now = Date.now();
    if (now - lastRequestTime < 60000) { // 1 minute
      if (requestCount >= RATE_LIMIT) {
        toast.error('Rate limit exceeded', {
          description: `Please wait before making another request. Limit: ${RATE_LIMIT} requests per minute.`,
        });
        return;
      }
    } else {
      setRequestCount(0);
      setLastRequestTime(now);
    }

    if (activeTab === 'song' && (!songTitle.trim() || !songArtist.trim())) {
      toast.error('Please fill in both song title and artist fields.');
      return;
    }

    if (activeTab === 'youtube' && !youtubeUrl.trim()) {
      toast.error('Please enter a valid YouTube URL.');
      return;
    }

    setIsLoading(true);
    setRequestCount(prev => prev + 1);
    setResult(null);

    try {
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const copyrightData = {
        safe: Math.random() > 0.5,
        confidence: Math.floor(Math.random() * 100),
        details: 'Sample copyright analysis result'
      };
      
      setResult(copyrightData);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Error checking copyright', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Music Copyright Checker - Renderdragon</title>
          <meta name="description" content="Check if your music is copyright-free and safe to use in your Minecraft content. Free tool for content creators." />
          <meta property="og:title" content="Music Copyright Checker - Renderdragon" />
          <meta property="og:description" content="Check if your music is copyright-free and safe to use in your Minecraft content. Free tool for content creators." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://renderdragon.org/music-copyright" />
          <meta name="twitter:title" content="Music Copyright Checker - Renderdragon" />
        </Helmet>
        
        <div className="min-h-screen bg-background pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-vt323">
              <span className="text-cow-purple">Music Copyright</span> Checker
            </h1>
            <p className="mb-6 text-lg text-muted-foreground">Please sign in to use the Music Copyright Checker.</p>
            <Button asChild>
              <a href="/api/auth/google">Sign In with Google</a>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Music Copyright Checker - Renderdragon</title>
        <meta name="description" content="Check if your music is copyright-free and safe to use in your Minecraft content. Free tool for content creators." />
        <meta property="og:title" content="Music Copyright Checker - Renderdragon" />
        <meta property="og:description" content="Check if your music is copyright-free and safe to use in your Minecraft content. Free tool for content creators." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://renderdragon.org/music-copyright" />
        <meta name="twitter:title" content="Music Copyright Checker - Renderdragon" />
      </Helmet>

      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center font-vt323">
              <span className="text-cow-purple">Music Copyright</span> Checker
            </h1>
            
            <p className="text-center text-muted-foreground mb-8">
              Check if your music is copyright-free and safe to use in your content. Get instant analysis and recommendations.
            </p>

            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Disclaimer</AlertTitle>
              <AlertDescription>
                This tool provides guidance only. Always verify copyright status independently and consult legal advice when needed.
              </AlertDescription>
            </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="song">Song Details</TabsTrigger>
                <TabsTrigger value="youtube">YouTube URL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="song" className="space-y-4">
                <div>
                  <Label htmlFor="artist">Artist</Label>
                  <Input
                    id="artist"
                    placeholder="Enter artist name"
                    value={songArtist}
                    onChange={(e) => setSongArtist(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="title">Song Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter song title"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="youtube" className="space-y-4">
                <div>
                  <Label htmlFor="youtube">YouTube URL</Label>
                  <Input
                    id="youtube"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="w-full mb-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Music className="mr-2 h-4 w-4" />
                  <span>Check Copyright</span>
                </>
              )}
            </Button>

            {!result && !isLoading && (
              <div className="text-center text-muted-foreground">
                <p className="text-lg text-muted-foreground">No results yet</p>
                <p className="text-sm text-muted-foreground mt-2">Enter song details or YouTube URL and click "Check Copyright" to get started.</p>
              </div>
            )}

            {result && (
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {result.safe ? (
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                  )}
                  <h3 className="text-lg font-semibold">
                    {result.safe ? 'Likely Safe to Use' : 'Potential Copyright Issues'}
                  </h3>
                </div>
                <p className="text-muted-foreground mb-2">
                  Confidence: {result.confidence}%
                </p>
                <p className="text-sm">
                  {result.details}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicCopyright;