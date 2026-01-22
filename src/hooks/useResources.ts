/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Resource } from '@/types/resources';
import { useDownloadCounts } from '@/hooks/useDownloadCounts';

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

            // Fetch main resources and mcicons in parallel
            const [resourcesRes, mciconsRes] = await Promise.all([
                fetch('https://hamburger-api.powernplant101-c6b.workers.dev/all'),
                fetch('https://hamburger-api.powernplant101-c6b.workers.dev/mcicons')
            ]);

            if (!resourcesRes.ok) throw new Error(`Failed to fetch resources: ${resourcesRes.status}`);
            if (!mciconsRes.ok) throw new Error(`Failed to fetch mcicons: ${mciconsRes.status}`);

            const data = await resourcesRes.json();
            const mciconsData = await mciconsRes.json();

            const allResources: Resource[] = [];

            // Parse main resources
            if (data && data.categories) {
                Object.entries(data.categories).forEach(([category, files]: [string, any[]]) => {
                    files.forEach(file => {
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

                        // Standardize category name
                        let categoryName = category as any;
                        if (category === 'mcicons' || category === 'minecraft-icons') {
                            categoryName = 'minecraft-icons';
                        }

                        allResources.push({
                            id: `main-${file.id}`, // Ensure unique ID
                            title: formattedTitle,
                            category: categoryName,
                            subcategory,
                            credit: file.credit,
                            filetype: file.ext,
                            download_url: file.url,
                        });
                    });
                });
            }

            // Parse mcicons from Hamburger API
            if (mciconsData && mciconsData.files) {
                mciconsData.files.forEach((file: any) => {
                    const formattedTitle = file.title
                        .replace(/_/g, ' ')
                        .replace(/\.[^/.]+$/, "") // Remove extension if present in title
                        .split(' ')
                        .filter(Boolean)
                        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');

                    allResources.push({
                        id: `hbg-${file.id}`, // Ensure unique ID
                        title: formattedTitle,
                        category: 'minecraft-icons',
                        subcategory: file.subcategory, // Directly use the subcategory from API
                        credit: file.credit || "",
                        filetype: file.ext,
                        download_url: file.url,
                    });
                });
            }

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
            // Always reset subcategory when changing category
            setSelectedSubcategory(null);
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

    // Derive unique subcategories for the current selected category
    const availableSubcategories = useMemo(() => {
        if (!selectedCategory || selectedCategory === "favorites") return [];
        const subs = resources
            .filter(r => r.category === selectedCategory && r.subcategory)
            .map(r => r.subcategory as string);
        return Array.from(new Set(subs)).sort();
    }, [resources, selectedCategory]);

    // Check if we have resources in the current selected category
    const hasCategoryResources = useMemo(() => {
        if (!selectedCategory || selectedCategory === "favorites") return true;
        return resources.some((resource) => resource.category === selectedCategory);
    }, [resources, selectedCategory]);

    // Determine which resources to display based on filters and sorting
    const filteredResources = useMemo(() => {
        let result = [...resources];

        // Helper to get download count for sorting
        const getCount = (id: string | number) => {
            if (typeof id === 'number') return externalDownloadCounts[id] || 0;
            if (id.startsWith('main-')) {
                const numericId = id.replace('main-', '');
                return externalDownloadCounts[numericId] || 0;
            }
            return externalDownloadCounts[id] || 0;
        };

        // Filter by Category
        if (selectedCategory && selectedCategory !== "favorites") {
            result = result.filter(r => r.category === selectedCategory);
        } else if (selectedCategory === null) {
            // Exclude 'minecraft-icons' from the All tab
            result = result.filter(r => r.category !== 'minecraft-icons');
        }

        // Filter by Subcategory
        if (selectedSubcategory && selectedSubcategory !== "all") {
            // Only apply subcategory filter if the subcategory is valid for the current category
            if (availableSubcategories.includes(selectedSubcategory)) {
                result = result.filter(r => r.subcategory === selectedSubcategory);
            }
        }

        // Filter by Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(r => r.title.toLowerCase().includes(query));
        }

        // Sort
        switch (sortOrder) {
            case "popular":
                result.sort((a, b) => getCount(b.id) - getCount(a.id));
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
        availableSubcategories,
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
