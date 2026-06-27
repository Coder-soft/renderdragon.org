import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { getPublicUrl, listCarousel, addCarouselImage, moveCarouselItem, deleteCarouselItem, type ShowcaseMedia } from '@/lib/showcase'
import InfiniteMenu from '@/components/InfiniteMenu'
import RollingGallery from '@/components/RollingGallery'
import Carousel from '@/components/Carousel'

export type CarouselType = 'carousel' | 'infiniteMenu' | 'rollingGallery'

type Props = {
  pageId: string
  userId: string
  type: CarouselType
  autoplay?: boolean
  pauseOnHover?: boolean
  loop?: boolean
  round?: boolean
  baseWidth?: number
}

export default function CarouselEditor({ pageId, userId, type, autoplay = false, pauseOnHover = false, loop = false, round = false, baseWidth = 300 }: Props) {
  const [items, setItems] = useState<ShowcaseMedia[]>([])
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const images = useMemo(() => {
    return items
      .map(item => {
        const url = getPublicUrl(item.path)
        if (!url) return null
        return { id: item.id, url }
      })
      .filter((value): value is { id: string; url: string } => Boolean(value))
  }, [items])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    listCarousel(pageId)
      .then(data => mounted && setItems(data))
      .catch(err => {
        console.error(err)
        toast.error('Failed to load carousel')
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [pageId])

  async function handleUpload(file: File) {
    try {
      const created = await addCarouselImage(pageId, userId, file)
      setItems(prev => [...prev, created])
      toast.success('Image added')
    } catch (e) {
      console.error(e)
      toast.error('Upload failed')
    }
  }

  async function handleMove(id: string, dir: 'up' | 'down') {
    try {
      const next = await moveCarouselItem(pageId, id, dir)
      setItems(next)
    } catch (e) {
      console.error(e)
      toast.error('Reorder failed')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCarouselItem(id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (e) {
      console.error(e)
      toast.error('Delete failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" className="pixel-corners" onClick={() => fileRef.current?.click()}>
          Add image
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((it, idx) => (
          <Card key={it.id} className="overflow-hidden">
            <CardContent className="p-0">
              <img src={getPublicUrl(it.path) || ''} alt="" className="w-full h-24 object-cover" />
            </CardContent>
            <div className="p-2 flex items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">#{idx + 1}</div>
              <div className="flex items-center gap-1">
                <Button type="button" size="sm" variant="ghost" onClick={() => handleMove(it.id, 'up')} disabled={idx === 0}>↑</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => handleMove(it.id, 'down')} disabled={idx === items.length - 1}>↓</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => handleDelete(it.id)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading images…</div>}

      <div className="mt-2 space-y-2">
        <div className="text-xs text-muted-foreground">Preview</div>
        <div className="border border-border rounded-md p-3 bg-background/30">
          {type === 'rollingGallery' && (
            <div style={{ height: 320 }}>
              <RollingGallery images={images.map(image => image.url)} autoplay={autoplay} pauseOnHover={pauseOnHover} />
            </div>
          )}
          {type === 'infiniteMenu' && (
            <div style={{ height: 360 }}>
              <InfiniteMenu items={images.map(image => ({ image: image.url, link: '', title: '', description: '' }))} />
            </div>
          )}
          {type === 'carousel' && (
            <div className="flex justify-center">
              <Carousel
                items={images.map((image, index) => ({
                  id: index,
                  title: '',
                  description: '',
                  icon: (
                    <div className="w-full h-full">
                      <img src={image.url} alt="" className="h-full w-full object-cover rounded" />
                    </div>
                  )
                }))}
                baseWidth={baseWidth}
                autoplay={autoplay}
                pauseOnHover={pauseOnHover}
                loop={loop}
                round={round}
              />
            </div>
          )}
          {images.length === 0 && (
            <div className="text-xs text-muted-foreground">No images yet. Click "Add image" to upload.</div>
          )}
        </div>
      </div>
    </div>
  )
}
