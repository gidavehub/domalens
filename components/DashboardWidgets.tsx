// components/DashboardWidgets.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// CORRECTED: The LiveEvent type is now the updated one with raw data.
import { LiveEvent, subscribeToLiveEvents } from '../services/domaDataService';

// ===================================================================================
// STYLES - Colocated with the components they style
// ===================================================================================

export const DashboardWidgetsStyles = () => (
    <style>{`
    /* --- Glassmorphism Card Base (used by widgets) --- */
    .glass-card {
      background: var(--color-glass-bg);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--color-glass-border);
      border-radius: 1.25rem;
      box-shadow: 0 8px 32px 0 rgba(143, 148, 219, 0.15);
      transition: all 0.3s ease;
    }

    /* --- Glowing Search Bar --- */
    .search-bar-container { flex-grow: 1; position: relative; max-width: 500px; }
    .glowing-search-bar {
      width: 100%;
      padding: 0.8rem 1.5rem;
      font-size: 1rem; font-weight: 500;
      color: var(--color-text-primary);
      border: 1px solid transparent;
      border-radius: 0.75rem;
      background: rgba(255, 255, 255, 0.8);
      outline: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 16px rgba(172, 178, 230, 0.2);
    }
    .glowing-search-bar:focus {
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3), 0 4px 24px rgba(139, 92, 246, 0.2);
      border-color: rgba(139, 92, 246, 0.4);
    }

    /* --- Stat Card --- */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; }
    .stat-card { padding: 1.5rem; }
    .stat-card-title { font-size: 0.875rem; font-weight: 500; color: var(--color-text-secondary); margin-bottom: 0.5rem; }
    .stat-card-value { font-size: 2rem; font-weight: 700; color: var(--color-text-primary); }
    .stat-card-value.gradient-text {
        background: linear-gradient(90deg, var(--color-brand-violet), var(--color-brand-magenta));
        -webkit-background-clip: text; background-clip: text; color: transparent;
    }

    /* --- Live Event Feed --- */
    .event-feed-container { padding: 1.5rem; display: flex; flex-direction: column; height: 100%; }
    .event-feed-header { font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; }
    .event-feed-list { flex-grow: 1; overflow-y: auto; padding-right: 10px; }
    .event-item { display: flex; align-items: start; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid rgba(226, 232, 240, 0.8); }
    .event-icon {
        width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
        flex-shrink: 0; font-size: 1.2rem;
    }
    .event-icon.listed { background-color: #e0f2fe; color: #0284c7; }
    .event-icon.sold { background-color: #dcfce7; color: #16a34a; }
    .event-icon.transferred { background-color: #f3e8ff; color: #7e22ce; }
    .event-content { display: flex; flex-direction: column; }
    .event-description { font-weight: 500; }
    .event-description span { font-weight: 700; }
    .event-time { font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 0.25rem; }
  `}</style>
);

// ===================================================================================
// WIDGET COMPONENTS
// ===================================================================================

export const GlowingSearchBar = ({ searchTerm, setSearchTerm }: { searchTerm: string; setSearchTerm: (value: string) => void; }) => (
  <div className="search-bar-container">
    <motion.input
      layoutId="search-bar"
      className="glowing-search-bar"
      placeholder="Explore domains, TLDs, or owners..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
);

export const StatCard = ({ title, value, isLoading }: { title: string; value: string; isLoading: boolean; }) => (
  <motion.div 
    className="stat-card glass-card" 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.5 }}
  >
    <div className="stat-card-title">{title}</div>
    <div className={`stat-card-value ${title === "Trending TLD" ? 'gradient-text' : ''}`}>
      {isLoading ? '...' : value}
    </div>
  </motion.div>
);

export const LiveEventFeed = () => {
    const [events, setEvents] = useState<LiveEvent[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToLiveEvents(newEvent => {
            setEvents(prev => [newEvent, ...prev.slice(0, 50)]);
        });
        return unsubscribe;
    }, []);

    // CORRECTED: This helper function lives inside the component and generates the JSX.
    const renderEventDescription = (event: LiveEvent) => {
        switch (event.type) {
            case 'listed':
                return <><span>{event.domain}</span> was listed for sale.</>;
            case 'sold':
                return <><span>{event.domain}</span> was sold for Ξ{event.price?.toFixed(2)}.</>;
            case 'transferred':
                return <><span>{event.domain}</span> was transferred to a new owner.</>;
            default:
                return null;
        }
    };

    const iconMap = {
        listed: '📈', sold: '💰', transferred: '↔️'
    };
    
    return (
        <motion.div 
            className="event-feed-container glass-card" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <h3 className="event-feed-header">Live Testnet Feed</h3>
            <div className="event-feed-list">
                <AnimatePresence initial={false}>
                    {events.map(event => (
                        <motion.div
                            key={event.id}
                            className="event-item"
                            layout
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4, type: 'spring' }}
                        >
                            <div className={`event-icon ${event.type}`}>{iconMap[event.type]}</div>
                            <div className="event-content">
                                <div className="event-description">
                                    {renderEventDescription(event)}
                                </div>
                                <div className="event-time">{event.timestamp.toLocaleTimeString()}</div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};