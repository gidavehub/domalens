// components/ModelsModal.tsx

'use client';

import React, { useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ===================================================================================
// STYLES - Colocated with the component it styles
// ===================================================================================

export const ModelsModalStyles = () => (
  <style>{`
    /* --- Models Modal --- */
    .modal-backdrop { 
      position: fixed; 
      inset: 0; 
      background: rgba(26, 27, 38, 0.6); 
      backdrop-filter: blur(8px); 
      z-index: 90; 
    }
    .modal-container {
      position: fixed; 
      top: 50%; 
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90vw; 
      height: 90vh; 
      max-width: 1400px;
      z-index: 100; 
      padding: 2rem;
      display: flex; 
      flex-direction: column;
      background: var(--color-glass-bg);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--color-glass-border);
      border-radius: 1.25rem;
      box-shadow: 0 8px 32px 0 rgba(143, 148, 219, 0.15);
    }
    .modal-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 1.5rem; 
      flex-shrink: 0; 
    }
    .modal-tabs { 
      display: flex; 
      gap: 0.5rem; 
      position: relative; 
      padding: 0.25rem;
      background: rgba(238, 242, 255, 0.6);
      border-radius: 0.75rem;
    }
    .modal-tab {
      padding: 0.75rem 1.5rem; 
      background: none; 
      border: none; 
      cursor: pointer;
      font-size: 0.9rem; 
      font-weight: 600; 
      color: var(--color-text-secondary);
      position: relative; 
      z-index: 2;
      transition: color 0.3s ease;
    }
    .modal-tab.active { 
      color: var(--color-text-primary); 
    }
    .active-tab-indicator {
      position: absolute; 
      top: 0;
      bottom: 0;
      left: 0;
      background: #fff; 
      border-radius: 0.6rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1;
      margin: 0.25rem;
    }
    .modal-content { 
      flex-grow: 1; 
      background: #fff; 
      border-radius: 1rem; 
      overflow: hidden; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .modal-iframe { 
      width: 100%; 
      height: 100%; 
      border: none; 
    }
    .close-button { 
      background: none; 
      border: none; 
      color: var(--color-text-secondary); 
      font-size: 1.5rem; 
      cursor: pointer; 
      transition: color 0.2s; 
      padding: 0.5rem;
      line-height: 1;
    }
    .close-button:hover { 
      color: var(--color-text-primary); 
    }
  `}</style>
);

// ===================================================================================
// MODAL COMPONENT
// ===================================================================================

interface ModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TabButton = ({ model, activeTab, onClick }: { model: any, activeTab: string, onClick: (id: string) => void }) => (
    <button id={`tab-${model.id}`} onClick={() => onClick(model.id)} className={`modal-tab ${activeTab === model.id ? 'active' : ''}`}>
        {model.name}
    </button>
);

export const ModelsModal = ({ isOpen, onClose }: ModelsModalProps) => {
    // CORRECTED: Appended ?__theme=light to each URL for a seamless light theme.
    const models = [
        { id: 'rarity', name: 'Rarity Scorer', url: 'https://gidave-doma-domain-rarity-scorer.hf.space?__theme=light' },
        { id: 'price', name: 'Price Predictor', url: 'https://gidave-doma-price-predictor.hf.space?__theme=light' },
        { id: 'trend', name: 'Trend Analyzer', url: 'https://gidave-doma-trend-analyzer.hf.space?__theme=light' },
        { id: 'outlier', name: 'Outlier Detector', url: 'https://gidave-doma-outlier-detector.hf.space?__theme=light' },
        { id: 'network', name: 'Network Analyzer', url: 'https://gidave-doma-network-analyzer.hf.space?__theme=light' },
    ];

    const [activeTab, setActiveTab] = useState(models[0].id);
    const activeModel = models.find(m => m.id === activeTab);
    const [indicatorStyle, setIndicatorStyle] = useState({});
  
    React.useEffect(() => {
      if (isOpen) {
        setActiveTab(models[0].id);
      }
    }, [isOpen]);
  
    useLayoutEffect(() => {
        const tabEl = document.getElementById(`tab-${activeTab}`);
        if (tabEl) {
            setIndicatorStyle({
                left: tabEl.offsetLeft,
                width: tabEl.offsetWidth,
            });
        }
    }, [activeTab, isOpen]);
  
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
            <motion.div
              className="modal-container"
              initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="modal-header">
                <div className="modal-tabs">
                  {models.map(model => (
                    <TabButton key={model.id} model={model} activeTab={activeTab} onClick={setActiveTab} />
                  ))}
                  <motion.div
                    className="active-tab-indicator"
                    animate={indicatorStyle}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </div>
                <button onClick={onClose} className="close-button">×</button>
              </div>
              <div className="modal-content">
                <iframe 
                    key={activeModel?.id} 
                    src={activeModel?.url} 
                    className="modal-iframe" 
                    title={activeModel?.name} 
                    frameBorder="0"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
};