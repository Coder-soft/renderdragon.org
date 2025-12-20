/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Resource } from '@/types/resources';
import { useDownloadCounts } from '@/hooks/useDownloadCounts';
import { fetchMciResources } from '@/lib/mciApi';

type Category = Resource["category"];
type Subcategory = Resource["subcategory"];

export const useResources = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const { downloadCounts: externalDownloadCounts, incrementDownload } =
        useDownloadCounts();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<
        Category | null | "favorites"
    >(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
        null,
    );
    const [sortOrder, setSortOrder] = useState("newest");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(
        null,
    );
    const [isSearching, setIsSearching] = useState(false);
    const [lastAction, setLastAction] = useState<string>("");
    const [loadedFonts, setLoadedFonts] = useState<string[]>([]);

    const fetchResources = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('https://hamburger-api.powernplant101-c6b.workers.dev/all');

            if (!response.ok) {
                throw new Error(`Failed to fetch resources: ${response.status}`);
            }

            const data = await response.json();
            const allResources: Resource[] = [];

            // Parse the response which is { categories: { [categoryName]: FileObject[] } }
            if (data && data.categories) {
                Object.entries(data.categories).forEach(([category, files]: [string, any[]]) => {
                    files.forEach(file => {
                        // Derive subcategory from URL
                        let subcategory: string | undefined = undefined;
                        if (file.url) {
                            if (file.url.includes('/adobe/')) subcategory = 'adobe';
                            else if (file.url.includes('/davinci/')) subcategory = 'davinci';
                            else if (file.url.includes('/PREVIEWS/')) subcategory = 'previews';
                        }

                        const formattedTitle = file.title
                            .replace(/_/g, ' ')
                            .split(' ')
                            .filter(Boolean)
                            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ');

                        allResources.push({
                            id: file.id,
                            title: formattedTitle,
                            category: category as Category,
                            subcategory,
                            credit: file.credit,
                            filetype: file.ext,
                            download_url: file.url,
                        });
                    });
                });
            }

            // Fetch MCI resources
            const mciResources = await fetchMciResources();
            allResources.push(...mciResources);

            setResources(allResources);
        } catch (error) {
            console.error("Error fetching resources:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const handleSearchSubmit = useCallback((e?: React.FormEvent) => {
        e?.preventDefault();
        setIsSearching(true);
        setLastAction("search");
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchQuery("");
        setIsSearching(false);
        setLastAction("clear");
    }, []);

    const handleCategoryChange = useCallback(
        (category: Category | null | "favorites") => {
            setSelectedCategory(category);
            // When changing category, reset subcategory unless we're selecting 'presets'
            if (category !== "presets") {
                setSelectedSubcategory(null);
            }
            setLastAction("category");
        },
        [],
    );

    const handleSubcategoryChange = useCallback(
        (subcategory: Subcategory | "all" | null) => {
            setSelectedSubcategory(subcategory);
            setLastAction("subcategory");
        },
        [],
    );

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setLastAction("search");
        if (e.target.value === "") {
            setIsSearching(false);
        } else {
            setIsSearching(true);
        }
    }, []);

    // Check if we have resources in the current selected category
    const hasCategoryResources = useMemo(() => {
        if (!selectedCategory || selectedCategory === "favorites") return true;
        return resources.some((resource) => resource.category === selectedCategory);
    }, [resources, selectedCategory]);

    // Determine which resources to display based on filters and sorting
    const filteredResources = useMemo(() => {
        let result = [...resources];

        // Filter by Category
        if (selectedCategory && selectedCategory !== "favorites") {
            result = result.filter(r => r.category === selectedCategory);
        } else if (selectedCategory === null && !searchQuery) {
            // Exclude minecraft-icons from "All" tab unless searching
            // If user is searching, they probably want to see matches from all categories including icons?
            // The user request was "Don't show minecraft icons on the all resource tab".
            // Usually "All" tab is the landing state.
            // If I exclude it here, search might also exclude it if I don't be careful.
            // But search filtering happens LATER in the code (lines 145+).
            // If I filter `result` here, subsequent search filter works on reduced set.
            // If the user wants search to find icons globally, I should only exclude if NOT searching?
            // "Don't show minecraft icons on the all resource tab" implies the list view.
            // Let's assume if they type "sword", they might want to see sword icons.
            // So: if (selectedCategory === null && !searchQuery)
            result = result.filter(r => r.category !== 'minecraft-icons');
        }

        // Filter by Subcategory
        if (selectedSubcategory && selectedSubcategory !== "all") {
            result = result.filter(r => {
                if (r.subcategory === selectedSubcategory) return true;
                return false;
            });
        }

        // Filter by Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(r => r.title.toLowerCase().includes(query));
        }

        // Sort
        switch (sortOrder) {
            case "popular":
                result.sort((a, b) => (externalDownloadCounts[b.id] || 0) - (externalDownloadCounts[a.id] || 0));
                break;
            case "a-z":
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "z-a":
                result.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case "newest":
            default:
                // Fallback to ID sort since we don't have dates, higher ID = newer usually
                result.sort((a, b) => b.id - a.id);
                break;
        }

        return result;
    }, [resources, selectedCategory, selectedSubcategory, searchQuery, sortOrder, externalDownloadCounts]);

    const handleDownload = useCallback(
        async (resource: Resource): Promise<boolean> => {
            if (!resource || !resource.download_url) return false;

            const fileUrl = resource.download_url;
            const filename = `${resource.title}.${resource.filetype || "file"}`;

            const shouldForceDownload = ["presets", "images", "animations", "fonts", "music", "sfx", "minecraft-icons"].includes(
                resource.category,
            );

            try {
                if (shouldForceDownload) {
                    const res = await fetch(fileUrl);
                    if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
                    const blob = await res.blob();

                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(a.href);
                } else {
                    const a = document.createElement("a");
                    a.href = fileUrl;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                }

                incrementDownload(resource.id);
                return true;
            } catch (err) {
                console.error("Download failed", err);
                return false;
            }
        },
        [incrementDownload],
    );

    return {
        resources,
        selectedResource,
        setSelectedResource,
        searchQuery,
        selectedCategory,
        selectedSubcategory,
        isLoading,
        isSearching,
        downloadCounts: externalDownloadCounts,
        lastAction,
        loadedFonts,
        setLoadedFonts,
        filteredResources,
        hasCategoryResources,
        handleSearchSubmit,
        handleClearSearch,
        handleCategoryChange,
        handleSubcategoryChange,
        sortOrder,
        handleSortOrderChange: setSortOrder,
        handleSearch,
        handleDownload,
    };
};
