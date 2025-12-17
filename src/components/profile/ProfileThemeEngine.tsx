import React, { useEffect } from 'react';
import { ProfileThemeConfig } from '@/types/profile';

interface ProfileThemeEngineProps {
    config?: ProfileThemeConfig | null;
    children: React.ReactNode;
}

const ProfileThemeEngine: React.FC<ProfileThemeEngineProps> = ({ config, children }) => {
    useEffect(() => {
        if (!config) return;

        const root = document.documentElement;
        // Apply Colors
        root.style.setProperty('--profile-bg', config.backgroundType === 'color' ? config.backgroundColor : 'transparent');
        root.style.setProperty('--profile-text', config.textColor);
        root.style.setProperty('--profile-accent', config.accentColor);

        // Apply Fonts (This assumes fonts are loaded appropriately in index.css or via a loader, 
        // for now we set the stack)
        let fontStack = 'sans-serif';
        switch (config.fontFamily) {
            case 'geist': fontStack = '"Geist Sans", sans-serif'; break;
            case 'mono': fontStack = '"Geist Mono", monospace'; break;
            case 'inter': fontStack = '"Inter", sans-serif'; break;
            case 'serif': fontStack = 'serif'; break;
            case 'pixel': fontStack = '"VT323", monospace'; break; // Assuming VT323 is available
        }
        root.style.setProperty('--profile-font', fontStack);

        // Clean up on unmount or change
        return () => {
            root.style.removeProperty('--profile-bg');
            root.style.removeProperty('--profile-text');
            root.style.removeProperty('--profile-accent');
            root.style.removeProperty('--profile-font');
        };
    }, [config]);

    if (!config) return <>{children}</>;

    const getBackgroundStyle = () => {
        if (config.backgroundType === 'image' && config.backgroundImage) {
            return { backgroundImage: `url(${config.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' };
        }
        if (config.backgroundType === 'gradient' && config.backgroundGradient) {
            return { background: config.backgroundGradient };
        }
        return { backgroundColor: config.backgroundColor };
    };

    return (
        <div
            className="min-h-screen transition-colors duration-300"
            style={{
                ...getBackgroundStyle(),
                color: config.textColor,
                fontFamily: config.fontFamily === 'pixel' ? '"VT323", monospace' :
                    config.fontFamily === 'mono' ? '"Geist Mono", monospace' :
                        '"Geist Sans", sans-serif',
            }}
        >
            {/* Background Overlay for better text readability if image */}
            {config.backgroundType === 'image' && (
                <div className="absolute inset-0 bg-black/40 pointer-events-none z-0" />
            )}

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default ProfileThemeEngine;
