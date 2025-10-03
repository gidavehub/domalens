// DomaLensDashboard.tsx

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Import services and types
import { fetchPaginatedDomains, DomainData } from '../services/domaDataService';

// Import component modules
import { DashboardWidgetsStyles, GlowingSearchBar, StatCard, LiveEventFeed } from './DashboardWidgets';
import { DomainViewsStyles, DomainDataGrid, DomainDetailDrawer } from './DomainViews';
import { ModelsModalStyles, ModelsModal } from './ModelsModal';

const PAGE_SIZE = 50; // Number of domains to fetch per page

// ===================================================================================
// STYLES - Global and layout-specific styles for the main dashboard
// ===================================================================================

const DomaLensDashboardStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    :root {
      --font-sans: 'Inter', sans-serif;
      --color-bg: #f8f9fe;
      --color-text-primary: #1a1b26;
      --color-text-secondary: #5a5c72;
      --color-glass-bg: rgba(255, 255, 255, 0.5);
      --color-glass-border: rgba(255, 255, 255, 0.8);
      --color-brand-violet: #8b5cf6;
      --color-brand-cyan: #22d3ee;
      --color-brand-magenta: #ec4899;
      --color-brand-gold: #f59e0b;
    }

    /* --- Base & Scrollbar --- */
    body {
      background-color: var(--color-bg);
      font-family: var(--font-sans);
      color: var(--color-text-primary);
      overflow-x: hidden;
    }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #eef2ff; }
    ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--color-brand-violet), var(--color-brand-cyan)); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #a88cf8, #5ee5f5); }

    /* --- Main Dashboard Layout --- */
    .dashboard-container {
      width: 100%;
      min-height: 100vh;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .dashboard-logo {
      font-size: 1.75rem;
      font-weight: 800;
      background: linear-gradient(90deg, var(--color-brand-violet), var(--color-brand-cyan));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .header-button {
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid transparent;
      padding: 0.6rem 1.2rem;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: 0.6rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 16px rgba(172, 178, 230, 0.2);
    }
    .header-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3), 0 6px 20px rgba(139, 92, 246, 0.2);
    }

    /* --- Main Content Grid --- */
    .dashboard-main-grid {
      flex-grow: 1;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }
    .main-content-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  `}</style>
);


// ===================================================================================
// MAIN DASHBOARD COMPONENT - The Orchestrator
// ===================================================================================

export const DomaLensDashboard = () => {
    // State for data and pagination
    const [domains, setDomains] = useState<DomainData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // State for UI interactions
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDomain, setSelectedDomain] = useState<DomainData | null>(null);
    const [isModelsModalOpen, setIsModelsModalOpen] = useState(false);
    
    // State for simulated live stats
    const [transactions24h, setTransactions24h] = useState(1245);
    useEffect(() => {
        const interval = setInterval(() => setTransactions24h(t => t + Math.floor(Math.random() * 3)), 2500);
        return () => clearInterval(interval);
    }, []);

    // Effect for fetching data when the page changes
    useEffect(() => {
        const loadDomains = async () => {
            setIsLoading(true);
            const { domains: newDomains, hasMore: newHasMore } = await fetchPaginatedDomains(currentPage, PAGE_SIZE);
            setDomains(newDomains);
            setHasMore(newHasMore);
            setIsLoading(false);
        };
        loadDomains();
    }, [currentPage]);

    // Memoized calculation for filtering domains
    const filteredDomains = useMemo(() => {
        if (!searchTerm) return domains;
        return domains.filter(d =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.tld.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [domains, searchTerm]);
    
    // Memoized calculation for stats based on current page data
    const marketStats = useMemo(() => {
        const tldCounts = domains.reduce((acc, d) => {
            acc[d.tld] = (acc[d.tld] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const trendingTld = Object.keys(tldCounts).length > 0
            ? Object.keys(tldCounts).reduce((a, b) => tldCounts[a] > tldCounts[b] ? a : b)
            : '...';

        return {
            totalDomains: "500,000+", // Simulated total
            trendingTld,
            liveListings: domains.filter(d => d.status === 'Trading').length,
        };
    }, [domains]);

    // Handlers for pagination
    const handleNextPage = useCallback(() => {
        if (hasMore && !isLoading) {
            setCurrentPage(prev => prev + 1);
        }
    }, [hasMore, isLoading]);

    const handlePrevPage = useCallback(() => {
        if (currentPage > 1 && !isLoading) {
            setCurrentPage(prev => prev - 1);
        }
    }, [currentPage, isLoading]);
    
    return (
        <>
            {/* Aggregate all style components */}
            <DomaLensDashboardStyles />
            <DashboardWidgetsStyles />
            <DomainViewsStyles />
            <ModelsModalStyles />

            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="header-left">
                        <div className="dashboard-logo">DomaLens</div>
                        <button className="header-button" onClick={() => setIsModelsModalOpen(true)}>
                            🔬 Explore Models
                        </button>
                    </div>
                    <GlowingSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                <main className="dashboard-main-grid">
                    <div className="main-content-column">
                        <div className="stats-grid">
                            <StatCard title="Total Domains" isLoading={isLoading && currentPage === 1} value={marketStats.totalDomains} />
                            <StatCard title="24h Transactions" isLoading={false} value={transactions24h.toLocaleString()} />
                            <StatCard title="Trending TLD" isLoading={isLoading} value={marketStats.trendingTld} />
                            <StatCard title="Live Listings" isLoading={isLoading} value={marketStats.liveListings.toLocaleString()} />
                        </div>
                        
                        <DomainDataGrid 
                            domains={filteredDomains}
                            onRowClick={setSelectedDomain}
                            isLoading={isLoading}
                            currentPage={currentPage}
                            hasMore={hasMore}
                            onNextPage={handleNextPage}
                            onPrevPage={handlePrevPage}
                        />
                    </div>
                    <div className="main-content-column">
                        <LiveEventFeed />
                    </div>
                </main>
                
                <DomainDetailDrawer domain={selectedDomain} onClose={() => setSelectedDomain(null)} />
                <ModelsModal isOpen={isModelsModalOpen} onClose={() => setIsModelsModalOpen(false)} />
            </div>
        </>
    );
};