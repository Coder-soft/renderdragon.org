import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import PixelSvgIcon from './PixelSvgIcon';

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolvedTheme = (storedTheme && ['light', 'dark'].includes(storedTheme))
      ? (storedTheme as 'light' | 'dark')
      : (prefersDark ? 'dark' : 'light');
    setTheme(resolvedTheme);
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        'relative overflow-hidden transition-colors rounded-full w-10 h-10',
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      style={{ transform: 'none' }}
    >
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex items-center justify-center w-full h-full transition-all duration-300 absolute top-0 left-0" style={{ zIndex: theme === 'light' ? 2 : 1, opacity: theme === 'light' ? 1 : 0, transform: theme === 'light' ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-90deg)' }}>
          <PixelSvgIcon name="sun" className="h-5 w-5" />
        </span>
        <span className="flex items-center justify-center w-full h-full transition-all duration-300 absolute top-0 left-0" style={{ zIndex: theme === 'dark' ? 2 : 1, opacity: theme === 'dark' ? 1 : 0, transform: theme === 'dark' ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(90deg)' }}>
          <PixelSvgIcon name="moon" className="h-5 w-5" />
        </span>
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default ThemeToggle;
