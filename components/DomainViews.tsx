// components/DomainViews.tsx

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DomainData } from '../services/domaDataService';

// ===================================================================================
// STYLES - Colocated with the components they style
// ===================================================================================

export const DomainViewsStyles = () => (
  <style>{`
    /* --- Data Grid --- */
    .data-grid-container { 
      padding: 1rem; 
      overflow-x: auto; 
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .data-grid-wrapper {
      flex-grow: 1;
    }
    .data-grid { width: 100%; border-collapse: collapse; }
    .data-grid th {
      padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 600;
      color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
    }
    .data-grid td {
      padding: 1.25rem 1.5rem; font-size: 0.95rem; font-weight: 500;
      color: var(--color-text-primary); vertical-align: middle; min-width: 120px;
    }
    .data-grid tbody tr { cursor: pointer; transition: background-color 0.2s ease; }
    .data-grid tbody tr:hover { background-color: rgba(238, 242, 255, 0.5); }
    .data-grid .domain-name { font-weight: 600; }
    .data-grid .tld-chip {
      display: inline-block; padding: 0.25rem 0.6rem; font-size: 0.75rem;
      font-weight: 700; border-radius: 999px; background-color: #eef2ff; color: #4338ca;
    }
    .owner-hash { font-family: monospace; font-size: 0.9rem; color: var(--color-text-secondary); }

    /* --- Pagination Controls --- */
    .pagination-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(226, 232, 240, 0.8);
    }
    .pagination-info {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      font-weight: 500;
    }
    .pagination-buttons {
      display: flex;
      gap: 0.5rem;
    }
    .pagination-button {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      background: #fff;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .pagination-button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .pagination-button:not(:disabled):hover {
      background-color: #f3f4f6;
      border-color: #9ca3af;
    }

    /* --- Detail Drawer --- */
    .detail-drawer-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(26, 27, 38, 0.4); z-index: 40; }
    .detail-drawer {
      position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 500px;
      z-index: 50; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;
    }
    .detail-drawer-header { display: flex; justify-content: space-between; align-items: center; }
    .detail-drawer-domain-name { font-size: 2rem; font-weight: 800; }
    .close-button { background: none; border: none; color: var(--color-text-secondary); font-size: 1.5rem; cursor: pointer; transition: color 0.2s; }
    .close-button:hover { color: var(--color-text-primary); }
    .detail-section { display: flex; flex-direction: column; gap: 1rem; }
    .detail-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(248, 250, 252, 0.6); border-radius: 0.75rem; }
    .detail-item-label { font-weight: 600; color: var(--color-text-secondary); }
    .detail-item-value { font-weight: 500; }
    .detail-actions { display: flex; gap: 1rem; margin-top: 1rem; }
    .detail-action-button {
      flex: 1; padding: 0.75rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer;
      border: 1px solid #d1d5db; background: #fff; transition: all 0.2s;
    }
    .detail-action-button:hover { background: #f3f4f6; border-color: #9ca3af; transform: translateY(-1px); }
    .detail-action-button.primary {
        background: linear-gradient(90deg, var(--color-brand-violet), var(--color-brand-cyan));
        color: white; border: none;
    }
    .detail-action-button.primary:hover { opacity: 0.9; }
  `}</style>
);


// ===================================================================================
// VIEW COMPONENTS
// ===================================================================================

interface DomainDataGridProps {
  domains: DomainData[];
  onRowClick: (domain: DomainData) => void;
  isLoading: boolean;
  currentPage: number;
  hasMore: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export const DomainDataGrid = ({
  domains,
  onRowClick,
  isLoading,
  currentPage,
  hasMore,
  onNextPage,
  onPrevPage
}: DomainDataGridProps) => (
    <motion.div 
      className="data-grid-container glass-card" 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: 0.1 }}
    >
        <div className="data-grid-wrapper">
          <table className="data-grid">
              <thead>
                  <tr><th>Domain</th><th>TLD</th><th>Last Price</th><th>Owner</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <AnimatePresence>
                      {domains.map((domain) => (
                          <motion.tr key={domain.id} onClick={() => onRowClick(domain)} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                              <td className="domain-name">{domain.name}</td>
                              <td><span className="tld-chip">{domain.tld}</span></td>
                              <td>${domain.lastTradePrice.toLocaleString()}</td>
                              <td><span className="owner-hash">{domain.owner.substring(0, 6)}...{domain.owner.substring(domain.owner.length - 4)}</span></td>
                              <td>{domain.status}</td>
                          </motion.tr>
                      ))}
                  </AnimatePresence>
              </tbody>
          </table>
          {isLoading && domains.length === 0 && (
            <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Connecting to Doma Protocol Testnet...
            </div>
          )}
        </div>
        <div className="pagination-controls">
          <div className="pagination-info">Page {currentPage}</div>
          <div className="pagination-buttons">
            <button className="pagination-button" onClick={onPrevPage} disabled={currentPage <= 1 || isLoading}>Previous</button>
            <button className="pagination-button" onClick={onNextPage} disabled={!hasMore || isLoading}>
              {isLoading ? 'Loading...' : 'Next'}
            </button>
          </div>
        </div>
    </motion.div>
);

export const DomainDetailDrawer = ({ domain, onClose }: { domain: DomainData | null; onClose: () => void; }) => (
    <AnimatePresence>
        {domain && (
            <>
                <motion.div className="detail-drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                <motion.div className="detail-drawer glass-card" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 200 }}>
                    <div className="detail-drawer-header">
                        <h2 className="detail-drawer-domain-name">{domain.name}</h2>
                        <button onClick={onClose} className="close-button">×</button>
                    </div>
                    <div className="detail-section">
                        <div className="detail-item">
                            <span className="detail-item-label">Owner</span>
                            <span className="detail-item-value owner-hash">{domain.owner}</span>
                        </div>
                         <div className="detail-item">
                            <span className="detail-item-label">Status</span>
                            <span className="detail-item-value">{domain.status}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-item-label">Top-Level Domain</span>
                            <span className="detail-item-value tld-chip">{domain.tld}</span>
                        </div>
                    </div>
                    <div className="detail-actions">
                        <button className="detail-action-button" onClick={() => window.open(`https://explorer-testnet.doma.xyz/address/${domain.owner}`, '_blank')}>View on Explorer</button>
                        <button className="detail-action-button">View History</button>
                        <button className="detail-action-button primary">Make Offer</button>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);