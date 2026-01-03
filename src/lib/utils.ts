import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSmartIconUrl(url: string) {
  try {
    const domain = new URL(url).hostname.toLowerCase().replace('www.', '');

    // Verified SVGL URLs from introspection (using jsDelivr for CORS support)
    const svglMap: Record<string, string> = {
      'github.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/github_light.svg',
      'twitter.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/x.svg',
      'x.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/x.svg',
      'instagram.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/instagram-icon.svg',
      'linkedin.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/linkedin.svg',
      'youtube.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/youtube.svg',
      'discord.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/discord.svg',
      'discord.gg': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/discord.svg',
      'facebook.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/facebook-icon.svg',
      'twitch.tv': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/twitch.svg',
      'tiktok.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/tiktok-icon-light.svg',
      'spotify.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/spotify.svg',
      'threads.net': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/threads.svg',
      'gitlab.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/gitlab.svg',
      'reddit.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/reddit.svg',
      'dribbble.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/dribbble.svg',
      'pinterest.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/pinterest.svg',
      'figma.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/figma.svg',
      'notion.so': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/notion.svg',
      'vercel.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/vercel.svg',
      'supabase.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/supabase.svg',
      'netlify.com': 'https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/netlify.svg',
    };

    // Check exact domain match
    if (svglMap[domain]) {
      return svglMap[domain];
    }

    // Check partial match (e.g. subdomains or country codes if critical, but simplified mainly)
    // Actually, simple includes might misfire (e.g. 'not-twitter.com'), so exact map is safer for now.
    // Let's rely on exact map from the cleaned domain.

    // Fallback: High-res Google Favicon
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return '';
  }
}
