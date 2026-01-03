
import { supabase } from '@/integrations/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
// Use a broadly-typed SupabaseClient to work with tables not yet present in Database types
const sb = supabase as SupabaseClient

export type ShowcasePage = {
  id: string
  owner_id: string
  slug: string
  title: string | null
  about: string | null
  theme: Record<string, unknown>
  layout: unknown[]
  cover_image_path: string | null
  avatar_image_path: string | null
  status: 'draft' | 'published' | 'unlisted'
  created_at: string
  updated_at: string
}

export type ShowcaseMedia = {
  id: string
  page_id: string
  kind: 'image'
  path: string
  position: number
  created_at: string
}

export async function getMyShowcasePage(userId: string) {
  const { data, error } = await sb
    .from('showcase_pages')
    .select('*')
    .eq('owner_id', userId)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data as ShowcasePage | null
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function createShowcasePage(userId: string, opts?: { baseSlug?: string; avatarUrl?: string | null; coverUrl?: string | null; title?: string | null; about?: string | null }) {
  // If the user already has a page, just return it to avoid duplicates
  const existingForOwner = await getMyShowcasePage(userId)
  if (existingForOwner) return existingForOwner

  const base = slugify(opts?.baseSlug || 'showcase') || 'showcase'
  let candidate = base
  let suffix = 0

  // ensure unique slug - try up to 20 variants
  for (let i = 0; i < 20; i += 1) {
    try {
      const { data, error } = await sb
        .from('showcase_pages')
        .insert({
          owner_id: userId,
          slug: candidate,
          title: opts?.title ?? null,
          about: opts?.about ?? null,
          avatar_image_path: null,
          cover_image_path: null,
          status: 'draft',
          theme: {},
          layout: [],
        })
        .select('*')
        .single()

      if (error) throw error
      return data as ShowcasePage
    } catch (e: unknown) {
      // Unique constraint violation on slug, try next candidate
      const error = e as { code?: string };
      if (error?.code === '23505') {
        suffix += 1
        candidate = `${base}-${suffix}`
        continue
      }
      throw e
    }
  }
  // If we exhausted attempts
  throw new Error('Unable to create a unique showcase slug after multiple attempts')
}

export async function updateShowcasePage(id: string, patch: Partial<ShowcasePage>) {
  const { data, error } = await sb
    .from('showcase_pages')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as ShowcasePage
}

export async function getPublicShowcaseBySlug(slug: string) {
  const { data, error } = await sb
    .from('showcase_pages')
    .select('*')
    .eq('slug', slug)
    .in('status', ['published', 'unlisted'])
    .maybeSingle()
  if (error) throw error
  return data as ShowcasePage | null
}

export function getPublicUrl(path: string | null) {
  if (!path) return null
  const { data } = sb.storage.from('showcase').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadImage(userId: string, file: File, kind: 'avatar' | 'cover') {
  const ext = file.name.split('.').pop() || 'png'
  const filePath = `${userId}/${kind}-${Date.now()}.${ext}`
  const { error } = await sb.storage.from('showcase').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  return filePath
}

export async function listCarousel(pageId: string) {
  try {
    const { data, error } = await sb
      .from('showcase_media')
      .select('*')
      .eq('page_id', pageId)
      .order('position', { ascending: true })
    if (error) throw error
    return (data || []) as ShowcaseMedia[]
  } catch (e: unknown) {
    // If the position column doesn't exist yet, fall back to created_at ordering
    const error = e as { code?: string };
    if (error?.code === '42703') {
      const { data, error } = await sb
        .from('showcase_media')
        .select('*')
        .eq('page_id', pageId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data || []) as ShowcaseMedia[]
    }
    throw e
  }
}

export async function addCarouselImage(pageId: string, userId: string, file: File) {
  // Upload to storage, then insert row with next position
  const ext = file.name.split('.').pop() || 'png'
  const filePath = `${userId}/carousel/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error: upErr } = await sb.storage.from('showcase').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (upErr) throw upErr

  const { data: countData, error: countErr, count } = await sb
    .from('showcase_media')
    .select('id', { count: 'exact', head: true })
    .eq('page_id', pageId)
  if (countErr) throw countErr
  // With head:true, Supabase returns no rows and provides the count separately on the response
  // In supabase-js, this is available as the `count` property on the result object
  const nextPos = count ?? 0

  const { data, error } = await sb
    .from('showcase_media')
    .insert({ page_id: pageId, kind: 'image', path: filePath, position: nextPos })
    .select('*')
    .single()
  if (error) throw error
  return data as ShowcaseMedia
}

export async function deleteCarouselItem(id: string) {
  const { error } = await sb.from('showcase_media').delete().eq('id', id)
  if (error) throw error
}

export async function moveCarouselItem(pageId: string, id: string, direction: 'up' | 'down') {
  // Fetch all to compute swap
  const items = await listCarousel(pageId)
  const idx = items.findIndex(i => i.id === id)
  if (idx < 0) return items
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= items.length) return items
  const a = items[idx]
  const b = items[swapIdx]
  // swap positions
  const { error: e1 } = await sb.from('showcase_media').update({ position: b.position }).eq('id', a.id)
  if (e1) throw e1
  const { error: e2 } = await sb.from('showcase_media').update({ position: a.position }).eq('id', b.id)
  if (e2) throw e2
  return listCarousel(pageId)
}
