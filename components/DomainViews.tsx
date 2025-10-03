// components/DomainViews.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DomainData, DomainHistoryEvent, fetchDomainHistory, makeOfferForDomain } from '../services/domaDataService';

// ===================================================================================
// STYLES - Expanded to include new modals for History and Offers
// ===================================================================================

export const DomainViewsStyles = () => (
  <style>{`
    /* --- Data Grid & Drawer (Existing Styles) --- */
    .data-grid-container { padding: 1rem; overflow-x: auto; display: flex; flex-direction: column; flex-grow: 1; }
    .data-grid-wrapper { flex-grow: 1; }
    .data-grid { width: 100%; border-collapse: collapse; }
    .data-grid th { padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(226, 232, 240, 0.8); }
    .data-grid td { padding: 1.25rem 1.5rem; font-size: 0.95rem; font-weight: 500; color: var(--color-text-primary); vertical-align: middle; min-width: 120px; }
    .data-grid tbody tr { cursor: pointer; transition: background-color 0.2s ease; }
    .data-grid tbody tr:hover { background-color: rgba(238, 242, 255, 0.5); }
    .data-grid .domain-name { font-weight: 600; }
    .data-grid .tld-chip { display: inline-block; padding: 0.25rem 0.6rem; font-size: 0.75rem; font-weight: 700; border-radius: 999px; background-color: #eef2ff; color: #4338ca; }
    .owner-hash { font-family: monospace; font-size: 0.9rem; color: var(--color-text-secondary); }
    .pagination-controls { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-top: 1px solid rgba(226, 232, 240, 0.8); }
    .pagination-info { font-size: 0.9rem; color: var(--color-text-secondary); font-weight: 500; }
    .pagination-buttons { display: flex; gap: 0.5rem; }
    .pagination-button { padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: #fff; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    .pagination-button:disabled { cursor: not-allowed; opacity: 0.5; }
    .pagination-button:not(:disabled):hover { background-color: #f3f4f6; border-color: #9ca3af; }
    .detail-drawer-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(26, 27, 38, 0.4); z-index: 40; }
    .detail-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 500px; z-index: 50; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .detail-drawer-header { display: flex; justify-content: space-between; align-items: center; }
    .detail-drawer-domain-name { font-size: 2rem; font-weight: 800; }
    .close-button { background: none; border: none; color: var(--color-text-secondary); font-size: 1.5rem; cursor: pointer; transition: color 0.2s; }
    .close-button:hover { color: var(--color-text-primary); }
    .detail-section { display: flex; flex-direction: column; gap: 1rem; }
    .detail-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(248, 250, 252, 0.6); border-radius: 0.75rem; }
    .detail-item-label { font-weight: 600; color: var(--color-text-secondary); }
    .detail-item-value { font-weight: 500; }
    .detail-actions { display: flex; gap: 1rem; margin-top: 1rem; }
    .detail-action-button { flex: 1; padding: 0.75rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; border: 1px solid #d1d5db; background: #fff; transition: all 0.2s; }
    .detail-action-button:hover { background: #f3f4f6; border-color: #9ca3af; transform: translateY(-1px); }
    .detail-action-button.primary { background: linear-gradient(90deg, var(--color-brand-violet), var(--color-brand-cyan)); color: white; border: none; }
    .detail-action-button.primary:hover { opacity: 0.9; }

    /* --- NEW: Generic Modal Styles --- */
    .feature-modal-backdrop { position: fixed; inset: 0; background: rgba(26, 27, 38, 0.6); backdrop-filter: blur(8px); z-index: 60; }
    .feature-modal-container {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 90vw; max-width: 680px; z-index: 70; padding: 2rem;
      display: flex; flex-direction: column; gap: 1.5rem;
    }
    .feature-modal-header { display: flex; justify-content: space-between; align-items: center; }
    .feature-modal-title { font-size: 1.5rem; font-weight: 700; }
    .feature-modal-title span { font-weight: 500; color: var(--color-text-secondary); }
    .feature-modal-content { max-height: 60vh; overflow-y: auto; padding-right: 1rem; }
    .loading-spinner { width: 32px; height: 32px; border: 4px solid #eef2ff; border-top-color: var(--color-brand-violet); border-radius: 50%; animation: spin 1s linear infinite; margin: 4rem auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    /* --- NEW: History Modal Styles --- */
    .history-table { width: 100%; border-collapse: collapse; }
    .history-table th, .history-table td { padding: 1rem; text-align: left; border-bottom: 1px solid rgba(226, 232, 240, 0.8); }
    .history-table th { font-size: 0.8rem; font-weight: 600; color: var(--color-text-secondary); text-transform: uppercase; }
    .history-event-type { font-weight: 600; }
    .history-event-price { color: #16a34a; }

    /* --- NEW: Offer Modal Styles --- */
    .offer-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-label { font-size: 0.9rem; font-weight: 600; color: var(--color-text-secondary); }
    .form-input-wrapper { display: flex; align-items: center; }
    .form-input { flex-grow: 1; padding: 0.75rem 1rem; font-size: 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; transition: all 0.2s; }
    .form-input:focus { border-color: var(--color-brand-violet); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2); outline: none; }
    .form-currency-select { padding: 0.75rem; border-left: none; background-color: #f9fafb; border-radius: 0 0.5rem 0.5rem 0; font-weight: 600; }
    .submit-button { padding: 0.8rem 1.5rem; font-size: 1rem; font-weight: 700; color: white; background: linear-gradient(90deg, var(--color-brand-violet), var(--color-brand-cyan)); border: none; border-radius: 0.5rem; cursor: pointer; transition: opacity 0.2s; }
    .submit-button:disabled { opacity: 0.6; cursor: not-allowed; }
    .feedback-message { padding: 1rem; border-radius: 0.5rem; text-align: center; font-weight: 600; }
    .feedback-message.success { background-color: #dcfce7; color: #166534; }
    .feedback-message.error { background-color: #fee2e2; color: #991b1b; }
  `}</style>
);

// ===================================================================================
// NEW MODAL COMPONENTS
// ===================================================================================

const HistoryModal = ({ domain, onClose }: { domain: DomainData; onClose: () => void; }) => {
    const [history, setHistory] = useState<DomainHistoryEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            setIsLoading(true);
            const data = await fetchDomainHistory(domain.name);
            setHistory(data);
            setIsLoading(false);
        };
        loadHistory();
    }, [domain.name]);

    return (
        <AnimatePresence>
            <motion.div className="feature-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
            <motion.div className="feature-modal-container glass-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <div className="feature-modal-header">
                    <h3 className="feature-modal-title">History for <span>{domain.name}</span></h3>
                    <button onClick={onClose} className="close-button">×</button>
                </div>
                <div className="feature-modal-content">
                    {isLoading ? <div className="loading-spinner" /> : (
                        <table className="history-table">
                            <thead><tr><th>Event</th><th>Price</th><th>From/To</th><th>Date</th></tr></thead>
                            <tbody>
                                {history.map(event => (
                                    <tr key={event.id}>
                                        <td className="history-event-type">{event.type}</td>
                                        <td>{event.price ? <span className="history-event-price">Ξ {event.price.toFixed(2)}</span> : '---'}</td>
                                        <td><span className="owner-hash">{event.from.slice(0, 6)}... &rarr; {event.to.slice(0, 6)}...</span></td>
                                        <td>{event.timestamp.toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

const OfferModal = ({ domain, onClose }: { domain: DomainData; onClose: () => void; }) => {
    const [price, setPrice] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!price || parseFloat(price) <= 0) {
            setStatus('error');
            setMessage('Please enter a valid price.');
            return;
        }
        setStatus('submitting');
        const result = await makeOfferForDomain(domain.name, parseFloat(price), 'WETH', '0x_demo_user_address');
        setStatus(result.success ? 'success' : 'error');
        setMessage(result.message);

        if (result.success) {
            setTimeout(() => onClose(), 2500);
        }
    };

    return (
        <AnimatePresence>
            <motion.div className="feature-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
            <motion.div className="feature-modal-container glass-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <div className="feature-modal-header">
                    <h3 className="feature-modal-title">Make an Offer for <span>{domain.name}</span></h3>
                    <button onClick={onClose} className="close-button">×</button>
                </div>
                {status === 'success' ? (
                    <div className="feedback-message success">{message}</div>
                ) : (
                    <form onSubmit={handleSubmit} className="offer-form">
                        <div className="form-group">
                            <label htmlFor="price" className="form-label">Offer Price</label>
                            <div className="form-input-wrapper">
                                <input id="price" type="number" step="0.01" min="0" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} className="form-input" disabled={status === 'submitting'} />
                                <span className="form-currency-select">WETH</span>
                            </div>
                        </div>
                        {status === 'error' && <div className="feedback-message error">{message}</div>}
                        <button type="submit" className="submit-button" disabled={status === 'submitting'}>
                            {status === 'submitting' ? 'Submitting...' : 'Submit Offer'}
                        </button>
                    </form>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

// ===================================================================================
// EXPORTED VIEW COMPONENTS
// ===================================================================================

export { HistoryModal, OfferModal };

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

export const DomainDetailDrawer = ({ domain, onClose, onViewHistory, onMakeOffer }: { domain: DomainData | null; onClose: () => void; onViewHistory: (domain: DomainData) => void; onMakeOffer: (domain: DomainData) => void; }) => (
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
                        <div className="detail-item"><span className="detail-item-label">Owner</span><span className="detail-item-value owner-hash">{domain.owner}</span></div>
                        <div className="detail-item"><span className="detail-item-label">Status</span><span className="detail-item-value">{domain.status}</span></div>
                        <div className="detail-item"><span className="detail-item-label">Top-Level Domain</span><span className="detail-item-value tld-chip">{domain.tld}</span></div>
                    </div>
                    <div className="detail-actions">
                        <button className="detail-action-button" onClick={() => window.open(`https://explorer-testnet.doma.xyz/address/${domain.owner}`, '_blank')}>View on Explorer</button>
                        <button className="detail-action-button" onClick={() => onViewHistory(domain)}>View History</button>
                        <button className="detail-action-button primary" onClick={() => onMakeOffer(domain)}>Make Offer</button>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);