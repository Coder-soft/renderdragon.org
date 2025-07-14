import i18n, { i18n as I18nType } from 'i18next';
import { initReactI18next, useTranslation as useI18nTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import { resources as extraResources } from './i18n-resources';

// Type for our translation resources
type TranslationResources = {
  translation: Record<string, any>;
};

type I18nResources = {
  en: TranslationResources;
  es: TranslationResources;
  fr: TranslationResources;
  nl: TranslationResources;
};

// Create a merged resources object that combines the shared extraResources with
// additional inline translations that only exist in this file (mostly "community"
// and "resourceFilters" blocks). We extend **only** the English bundle to avoid
// duplicating huge blocks for the other languages.

const mergedResources: I18nResources = {
  ...extraResources,
  en: {
    translation: {
      ...(extraResources.en?.translation || {}),
      // Inline-only translations
      noFavoritesMessage: "You haven't favorited any resources yet. Click the heart on a resource to save it here!",
      noResourcesInCategory: 'There are currently no resources in the {{category}} category.',
      clearFilters: 'Clear Filters',
      contributeResources: 'Contribute Resources',
      checkOldSite: 'Check out the old site',
      loading: 'Loading...',
      loadMore: 'Load More',
      // ---- LONG objects kept as-is ----
      community: {
        seo: {
          title: 'Community Resources',
          description: 'Find tutorials, resources, and communities for Minecraft content creation, video editing, and thumbnail design.'
        },
        title: {
          prefix: 'Creator',
          highlight: 'Community'
        },
        description: 'Connect with other creators, get feedback, and find resources in these active Discord communities.',
        tabs: {
          tutorials: 'Tutorials',
          servers: 'Discord Servers'
        },
        tutorials: {
          1: {
            name: 'How to Make Thumbnails',
            description: 'Learn how to create eye-catching Minecraft thumbnails that get clicks'
          },
          2: {
            name: 'How to Edit in Premiere Pro',
            description: 'Tutorials for editing Minecraft videos in Adobe Premiere Pro & After Effects'
          },
          3: {
            name: 'How to Edit in DaVinci Resolve',
            description: 'Tutorials for editing Minecraft videos in DaVinci Resolve'
          }
        },
        servers: {
          title: 'Recommended Discord Servers',
          description: 'Join these communities to connect with other creators, get feedback, and learn new skills.',
          joinButton: 'Join Server',
          serverIconAlt: '{name} server icon',
          servers: {
            1: {
              description: 'Creator Coaster server will be your best friend throughout your content creation journey, with professional editors & artists ready to help with anything you need!'
            },
            2: {
              description: 'The Minecraft Design Hub is run by qualified designers with extensive background in the GFX industry, offering designs, games, and community support.'
            },
            3: {
              description: 'Thumbnailers is a thriving community for Minecraft thumbnail designers of all skill levels, offering resources and feedback to improve your designs.'
            },
            4: {
              description: 'EditHub is the ultimate content creation hub for editors, designers, and creators looking to grow and improve their skills.'
            },
            5: {
              description: 'Our official Discord server where you can suggest assets, contact us for questions or suggestions, and connect with the community.'
            }
          }
        },
        categories: {
          editing: 'editing',
          design: 'design'
        },
        common: {
          videoCount: '{{count}} videos',
          members: 'members',
          creator: 'By {{creator}}',
          playVideo: 'Play video',
          watchOnYouTube: 'Watch on YouTube',
          joinServer: 'Join Server',
          byCreator: 'By {{creator}}'
        },
        toast: {
          description: "You'll be redirected to Discord"
        }
      },
      resourceFilters: {
        searchPlaceholder: 'Search for resources...',
        clearSearch: 'Clear search',
        filterTitleMobile: 'Filters',
        filterByCategory: 'Filter by category',
        all: 'All',
        music: 'Music',
        sfx: 'SFX',
        images: 'Images',
        animations: 'Animations',
        fonts: 'Fonts',
        presets: 'Presets',
        selectPreset: 'Select preset type',
        allPresets: 'All Presets',
        davinciPresets: 'DaVinci Resolve',
        adobePresets: 'Adobe',
        sortBy: 'Sort by',
        sortOptions: {
          newest: 'Newest',
          popular: 'Popular',
        },
        downloads: 'downloads',
        attribution: 'Attribution',
        credit_warning: 'Please credit the creator when using this resource',
        credit_text: 'Resource by {{author}}',
        credit_copied: 'Credit copied to clipboard!',
        copied: 'Copied',
        copy: 'Copy',
        no_attribution_required: 'No attribution required',
        previous: 'Previous',
        next: 'Next',
        previous_resource: 'Previous resource',
        next_resource: 'Next resource',
        download_resource: 'Download Resource',
        download_agreement: 'By downloading, you agree to our Terms of Service',
        credit_required: 'Credit required',
        no_credit_needed: 'No credit needed',
        play_preview: 'Play preview',
        pause_preview: 'Pause preview',
        no_preview_available: 'No preview available',
        font: 'Font',
        no_preset_preview: "Sorry, there's no preview for this preset.",
        help_create_previews: 'You can help out creating previews for presets by joining our Discord!',
        preview_not_available: 'Preview not available for this type.',
        join_our_discord: 'Join our Discord'
      }
    }
  }
} as I18nResources;
// End mergedResources

// ---------------------------------------------------------------------------

// Language detection configuration
const createLanguageDetector = () => ({
  type: 'languageDetector' as const,
  async: true,
  detect: (callback: (lng: string) => void) => {
    const supportedLngs = ['en', 'es', 'fr', 'nl'];
    let detectedLng = 'en';

    if (typeof window === 'undefined') {
      return callback(detectedLng);
    }

    // Check URL parameter first
    const params = new URLSearchParams(window.location.search);
    const urlLng = params.get('lng');
    if (urlLng && supportedLngs.includes(urlLng)) {
      detectedLng = urlLng;
      return callback(detectedLng);
    }

    // Check localStorage
    const localStorageLng = localStorage.getItem('i18nextLng');
    if (localStorageLng && supportedLngs.some(lng => localStorageLng.startsWith(lng))) {
      detectedLng = localStorageLng.split('-')[0];
      return callback(detectedLng);
    }

    // Check cookie
    const cookieLng = Cookies.get('i18next');
    if (cookieLng && supportedLngs.some(lng => cookieLng.startsWith(lng))) {
      detectedLng = cookieLng.split('-')[0];
      return callback(detectedLng);
    }

    // Check browser language
    const browserLng = navigator.language || (navigator as any).userLanguage;
    if (browserLng) {
      const browserLngCode = browserLng.split('-')[0];
      if (supportedLngs.includes(browserLngCode)) {
        detectedLng = browserLngCode;
      }
    }

    callback(detectedLng);
  },
  init: () => {},
  cacheUserLanguage: (lng: string) => {
    if (typeof window !== 'undefined') {
      try {
        const isHttps = window.location.protocol === 'https:';
        const cookieOptions: Cookies.CookieAttributes = { 
          expires: 365,
          sameSite: 'Lax' as const,
          secure: isHttps,
          path: '/'
        };
        Cookies.set('i18next', lng, cookieOptions);
        localStorage.setItem('i18nextLng', lng);
      } catch (e) {
        console.warn('Failed to save language preference', e);
      }
    }
  },
});

// Initialize i18next
const initializeI18n = async (): Promise<I18nType> => {
  try {
    await i18n
      .use(initReactI18next)
      .use(createLanguageDetector() as any)
      .init({
        resources: mergedResources,
        fallbackLng: 'en',
        supportedLngs: ['en', 'es', 'fr', 'nl'],
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
          escapeValue: false, // React already escapes values
        },
        react: {
          useSuspense: false,
        },
      });
    // Merge additional translation keys defined in src/i18n-resources.ts so that
    // components using keys like `hero.unlockYour` can resolve them correctly
    // Object.entries(extraResources).forEach(([lng, res]) => {
    //   i18n.addResourceBundle(lng, 'translation', res.translation, true, true);
    // });
    return i18n;
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
    return i18n;
  }
};

// Initialize i18n when this module is imported
let initializationPromise: Promise<I18nType> | null = null;

export const getI18n = (): Promise<I18nType> => {
  if (!initializationPromise) {
    initializationPromise = initializeI18n();
  }
  return initializationPromise;
};

// Re-export useTranslation with proper typing
export const useTranslation = useI18nTranslation;

// Initialize i18n
getI18n().catch(console.error);

// Set up language change handler in the browser
if (typeof window !== 'undefined') {
  i18n.on('languageChanged', (lng: string) => {
    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', lng);
    
    // Save to both localStorage and cookie
    try {
      localStorage.setItem('i18nextLng', lng);
      const isHttps = window.location.protocol === 'https:';
      const cookieOptions: Cookies.CookieAttributes = { 
        expires: 365,
        sameSite: 'Lax' as const,
        secure: isHttps,
        path: '/'
      };
      Cookies.set('i18next', lng, cookieOptions);
    } catch (e) {
      console.warn('Failed to save language preference', e);
    }
  });
}

export default i18n;