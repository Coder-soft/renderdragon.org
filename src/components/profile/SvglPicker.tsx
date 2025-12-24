import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { IconCheck, IconLoader2, IconSearch } from "@tabler/icons-react";

interface SvglIcon {
    id: number;
    title: string;
    category: string | string[];
    route: string | { light: string; dark: string };
    wordmark?: string | { light: string; dark: string };
    url: string;
    fullUrl: string;
}

interface SvglPickerProps {
    value?: string;
    onChange: (url: string) => void;
}

export function SvglPicker({ value, onChange }: SvglPickerProps) {
    const [open, setOpen] = useState(false);
    const [icons, setIcons] = useState<SvglIcon[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchIcons = async () => {
            if (icons.length > 0) return;

            setLoading(true);
            try {
                const res = await fetch('https://api.svgl.app');
                if (!res.ok) throw new Error('Failed to fetch icons');
                const data = await res.json();
                if (active) {
                    const formattedIcons: SvglIcon[] = data.map((item: any) => {
                        const route = item.route;
                        let url = '';

                        if (typeof route === 'string') {
                            url = route;
                        } else if (typeof route === 'object' && route !== null) {
                            // Prefer light variant or standard, fallback to dark
                            url = route.light || route.dark || '';
                        }

                        // Ensure absolute URL if it is a relative path (though new API seems to return full URLs)
                        if (url.startsWith('/')) {
                            url = `https://svgl.app${url}`;
                        }

                        // CHANGE: Svgl.app does not support CORS for mask-image usage.
                        // We must rewrite these to use the jsDelivr CDN which mirrors the repo and supports CORS.
                        // Original: https://svgl.app/library/github_light.svg
                        // Target: https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/github_light.svg

                        if (url.includes('svgl.app/library/')) {
                            const filename = url.split('svgl.app/library/')[1];
                            url = `https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/${filename}`;
                        } else if (url.includes('/svg/')) {
                            // Old API format? Try to adapt or leave as is if not matching library pattern
                            // But usually the API returns /library/ path now.
                            const part = url.split('/').pop();
                            if (part) url = `https://cdn.jsdelivr.net/gh/pheralb/svgl@main/static/library/${part}`;
                        }

                        return {
                            ...item,
                            fullUrl: url
                        };
                    });
                    setIcons(formattedIcons);
                }
            } catch (err) {
                console.error("Error fetching SVGL icons:", err);
                if (active) setError(true);
            } finally {
                if (active) setLoading(false);
            }
        };

        if (open) { // Fetch when opened to save initial load
            fetchIcons();
        }
        return () => { active = false; };
    }, [open, icons.length]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[50px] p-0 justify-center aspect-square shrink-0"
                >
                    {value ? (
                        <img
                            src={value}
                            alt="Selected"
                            className="w-5 h-5 object-contain"
                        />
                    ) : (
                        <IconSearch className="h-4 w-4 opacity-50" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command shouldFilter={true}>
                    <CommandInput placeholder="Search icon..." />
                    <CommandList>
                        {loading && (
                            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
                                <IconLoader2 className="h-4 w-4 animate-spin" />
                                Loading library...
                            </div>
                        )}

                        {!loading && error && (
                            <div className="py-6 text-center text-sm text-red-500">
                                Failed to load icons.
                            </div>
                        )}

                        {!loading && !error && (
                            <>
                                <CommandEmpty>No icon found.</CommandEmpty>
                                <CommandGroup heading="SVGL Library">
                                    {icons.map((icon) => (
                                        <CommandItem
                                            key={icon.id}
                                            value={icon.title}
                                            onSelect={() => {
                                                onChange(icon.fullUrl);
                                                setOpen(false);
                                            }}
                                            className="justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 flex items-center justify-center bg-muted/50 rounded p-1">
                                                    <img
                                                        src={icon.fullUrl}
                                                        alt={icon.title}
                                                        loading="lazy"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <span className='font-medium'>{icon.title}</span>
                                            </div>
                                            {value === icon.fullUrl && (
                                                <IconCheck className="ml-auto h-4 w-4 opacity-50" />
                                            )}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
