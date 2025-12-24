export interface ProfileThemeConfig {
    backgroundType: 'color' | 'image' | 'gradient';
    backgroundColor: string;
    backgroundImage?: string;
    backgroundGradient?: string;
    textColor: string;
    accentColor: string;
    fontFamily: string; // was 'geist' | 'inter' | 'roboto' | 'mono' | 'serif'
    fontUrl?: string; // For dynamically loaded fonts
    buttonStyle: 'rounded' | 'square' | 'pill' | 'pixel' | 'icon';
    cardStyle: 'glass' | 'solid' | 'outline' | 'pixel';
    layout: 'list' | 'grid';
    // New customizations
    coverImage?: string;
    customDisplayName?: string;
    profileTag?: string; // Custom user tag/role
    customAvatarUrl?: string;
    avatarPosition?: 'center' | 'left' | 'right';
}

export interface ProfileLink {
    id: string;
    label: string;
    url: string;
    icon?: string;
    color?: string; // Custom color for this specific link button
    iconColor?: string; // Custom color for the icon SVG (tint)
    active: boolean;
}

export interface SocialLinks {
    twitter?: string;
    github?: string;
    instagram?: string;
    linkedin?: string;
    discord?: string;
    youtube?: string;
    website?: string;
}

export const defaultThemeConfig: ProfileThemeConfig = {
    backgroundType: 'color',
    backgroundColor: '#0a0a0a',
    textColor: '#ffffff',
    accentColor: '#a855f7', // cow-purple
    fontFamily: 'geist',
    buttonStyle: 'rounded',
    cardStyle: 'glass',
    layout: 'list',
};

export const predefinedThemes: Record<string, ProfileThemeConfig> = {
    default: defaultThemeConfig,
    brutalism: {
        backgroundType: 'color',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        accentColor: '#ff0000',
        fontFamily: 'mono',
        buttonStyle: 'square',
        cardStyle: 'outline',
        layout: 'list',
    },
    midnight: {
        backgroundType: 'gradient',
        backgroundColor: '#000000',
        backgroundGradient: 'linear-gradient(to bottom, #0f172a, #000000)',
        textColor: '#e2e8f0',
        accentColor: '#38bdf8',
        fontFamily: 'inter',
        buttonStyle: 'pill',
        cardStyle: 'glass',
        layout: 'list',
    },
    pixel: {
        backgroundType: 'color',
        backgroundColor: '#1a1a1a',
        textColor: '#00ff00',
        accentColor: '#00ff00',
        fontFamily: 'geist', // Should use a pixel font effectively
        buttonStyle: 'pixel',
        cardStyle: 'pixel',
        layout: 'grid',
    }
};
