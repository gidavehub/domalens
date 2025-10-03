// lib/ai-model-service.ts

// --- TYPE DEFINITIONS ---
export interface RarityResponse {
  domain: string;
  predicted_rarity_score: number;
  analysis: Record<string, any>;
}

export interface PriceResponse {
  domain: string;
  predicted_market_price_usd: string; // e.g., "$1,234.56"
}

export interface OutlierResponse {
  domain: string;
  status: "Hidden Gem / Outlier" | "Normal Domain";
  anomaly_score: string;
}

export interface TrendData {
  [tld: string]: number;
}

export interface NetworkData {
  top_wallets: { Wallet: string; 'Influence Score': number }[];
  top_domains: { Domain: string; 'Centrality Score': number }[];
}

export interface ModelScores {
  rarity: number | null;
  predictedPrice: string | null;
  isOutlier: boolean | null;
  trendScore: number | null; // Represents the Hype Index for the domain's TLD
  networkInfluence: number | null; // Represents the Centrality Score for the domain
}

// --- MODAL PRODUCTION ENDPOINTS ---
// These are the permanent URLs from your `modal deploy` output
const BASE_URL = "https://godswilldave1--domalens-backend-api-domalensapi";
const RARITY_URL = `${BASE_URL}-rarity.modal.run`;
const PRICE_URL = `${BASE_URL}-price.modal.run`;
const OUTLIER_URL = `${BASE_URL}-outlier.modal.run`;
const TRENDS_URL = `${BASE_URL}-trends.modal.run`;
const NETWORK_URL = `${BASE_URL}-network.modal.run`;

// --- HELPER FUNCTIONS FOR FETCHING ---

// Helper for POST requests (Rarity, Price, Outlier)
async function queryDomainModel<T>(url: string, domainName: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: domainName }),
    });
    if (!response.ok) {
      console.error(`Error from model at ${url}: ${response.statusText}`);
      return null;
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`Network error when querying model at ${url}:`, error);
    return null;
  }
}

// Helper for GET requests (Trends, Network)
async function queryGlobalModel<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      console.error(`Error from model at ${url}: ${response.statusText}`);
      return null;
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`Network error when querying model at ${url}:`, error);
    return null;
  }
}

// --- MAIN FUNCTION TO FETCH ALL SCORES ---

export async function fetchModelScoresForDomain(domainName: string): Promise<ModelScores> {
  // Fetch all data in parallel
  const [
    rarityResult,
    priceResult,
    outlierResult,
    trendsResult,
    networkResult,
  ] = await Promise.all([
    queryDomainModel<RarityResponse>(RARITY_URL, domainName),
    queryDomainModel<PriceResponse>(PRICE_URL, domainName),
    queryDomainModel<OutlierResponse>(OUTLIER_URL, domainName),
    queryGlobalModel<TrendData>(TRENDS_URL),
    queryGlobalModel<NetworkData>(NETWORK_URL),
  ]);

  // --- Parse the results ---

  const rarity = rarityResult?.predicted_rarity_score ?? null;
  const predictedPrice = priceResult?.predicted_market_price_usd ?? null;
  const isOutlier = outlierResult ? outlierResult.status.includes("Outlier") : null;

  // For trends and network, we need to find the score for the specific domain's TLD
  let trendScore = null;
  if (trendsResult) {
    const tld = domainName.split('.').pop() || "";
    if (trendsResult[tld] !== undefined) {
      trendScore = trendsResult[tld];
    }
  }

  let networkInfluence = null;
  if (networkResult?.top_domains) {
    const domainData = networkResult.top_domains.find(d => d.Domain === domainName);
    if (domainData) {
      networkInfluence = domainData['Centrality Score'];
    }
  }
  
  return {
    rarity: rarity ? Math.round(rarity) : null,
    predictedPrice,
    isOutlier,
    trendScore: trendScore ? Math.round(trendScore) : null,
    networkInfluence: networkInfluence ? Math.round(networkInfluence) : null,
  };
}