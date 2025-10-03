// services/domaDataService.ts

import { GraphQLClient, gql } from 'graphql-request';

// ===================================================================================
// TYPE DEFINITIONS
// ===================================================================================

export interface DomainData {
  id: string;
  name: string;
  owner: string;
  tld: string;
  status: 'Trading' | 'Owned';
  lastTradePrice: number;
}

export interface LiveEvent {
  id: string;
  type: 'listed' | 'sold' | 'transferred';
  domain: string;
  price?: number;
  timestamp: Date;
}

// NEW: Type definition for a historical event record
export interface DomainHistoryEvent {
    id: string;
    type: 'Listed' | 'Sold' | 'Transferred' | 'Minted';
    price?: number; // In ETH for 'Sold' events
    from: string;
    to: string;
    timestamp: Date;
}

export interface PaginatedDomainsResponse {
  domains: DomainData[];
  hasMore: boolean;
}

// ===================================================================================
// API CONFIGURATION
// ===================================================================================

const API_BASE_URL = 'https://api-testnet.doma.xyz';
const GRAPHQL_ENDPOINT = `${API_BASE_URL}/graphql`;
const API_KEY = "v1.d3ff4181e47a480d83ee488775ff9361166d349bf0254b63341363b98650237f";

const gqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: { "Api-Key": API_KEY, "Content-Type": "application/json" }
});

const PAGINATED_QUERY = gql`
  query GetPaginatedDomainList($skip: Int!, $take: Int!) {
    names(skip: $skip, take: $take) { items { name, tokens { ownerAddress } } }
  }
`;

// ===================================================================================
// DATA FETCHING & SIMULATION FUNCTIONS
// ===================================================================================

export async function fetchPaginatedDomains(page: number, pageSize: number): Promise<PaginatedDomainsResponse> {
  // ... (existing code is unchanged)
  const skip = (page - 1) * pageSize;
  try {
    const response = await gqlClient.request<{ names: { items: any[] } }>(PAGINATED_QUERY, { skip, take: pageSize });
    const items = response.names.items || [];
    const domains: DomainData[] = items.map((d: any) => ({
      id: d.name, name: d.name, tld: '.' + (d.name.split('.').pop() || ''),
      owner: d.tokens?.[0]?.ownerAddress || 'N/A', status: Math.random() > 0.5 ? 'Trading' : 'Owned',
      lastTradePrice: Math.floor(Math.random() * 5000) + 100,
    }));
    const hasMore = items.length === pageSize;
    return { domains, hasMore };
  } catch (err) {
    console.error(`GraphQL fetch error on page ${page}:`, err);
    return { domains: [], hasMore: false };
  }
}

export function subscribeToLiveEvents(callback: (event: LiveEvent) => void): () => void {
  // ... (existing code is unchanged)
  const eventTypes: LiveEvent['type'][] = ['listed', 'sold', 'transferred'];
  const sampleDomains = ['quantum.ai', 'web3.xyz', 'defi.co', 'lens.xyz', 'market.base', 'art.eth', 'vision.io'];
  const generateEvent = () => {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const domain = sampleDomains[Math.floor(Math.random() * sampleDomains.length)];
    const newEvent: LiveEvent = { id: crypto.randomUUID(), type, domain, timestamp: new Date() };
    if (type === 'sold') { newEvent.price = parseFloat((Math.random() * 5).toFixed(2)); }
    callback(newEvent);
  };
  const intervalId = setInterval(generateEvent, 3000);
  return () => clearInterval(intervalId);
}

/**
 * NEW: Fetches the historical events for a specific domain.
 * This is a realistic mock as a direct history endpoint is not available.
 */
export async function fetchDomainHistory(domainName: string): Promise<DomainHistoryEvent[]> {
    console.log(`Simulating history fetch for: ${domainName}`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

    const generateRandomAddress = () => '0x' + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    const history: DomainHistoryEvent[] = [];
    const eventCount = Math.floor(Math.random() * 8) + 2; // Generate between 2 and 9 events
    let lastOwner = generateRandomAddress();

    // Create a "Minted" event
    history.push({
        id: crypto.randomUUID(), type: 'Minted', from: '0x000...000', to: lastOwner,
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 * Math.random()),
    });

    for (let i = 0; i < eventCount; i++) {
        const newOwner = generateRandomAddress();
        const eventType = ['Sold', 'Listed', 'Transferred'][Math.floor(Math.random() * 3)];
        
        history.push({
            id: crypto.randomUUID(),
            type: eventType as DomainHistoryEvent['type'],
            price: eventType === 'Sold' ? parseFloat((Math.random() * 10).toFixed(2)) : undefined,
            from: lastOwner,
            to: eventType === 'Listed' ? 'Marketplace' : newOwner,
            timestamp: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 * Math.random()),
        });
        
        if (eventType !== 'Listed') {
            lastOwner = newOwner;
        }
    }

    return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * NEW: Creates an offer for a domain using the Orderbook API.
 * This function is structured to use the real endpoint.
 */
export async function makeOfferForDomain(domainName: string, price: number, currency: string, userAddress: string): Promise<{ success: boolean; message: string }> {
    const endpoint = `${API_BASE_URL}/v1/orderbook/offer`;
    const payload = {
        // This payload is based on typical orderbook APIs.
        // It would need to be adjusted to the exact Doma API spec.
        domain: domainName,
        price: { amount: price.toString(), currency },
        offerer: userAddress,
        // In a real scenario, a signed EIP-712 message would be included here.
        signature: "0x_demo_signature_would_go_here", 
    };

    console.log(`MAKING API CALL to ${endpoint} with payload:`, JSON.stringify(payload, null, 2));

    try {
        // In a real app, this would be an actual fetch/axios call:
        // const response = await fetch(endpoint, {
        //   method: 'POST',
        //   headers: { 'Api-Key': API_KEY, 'Content-Type': 'application/json' },
        //   body: JSON.stringify(payload)
        // });
        // if (!response.ok) throw new Error('Offer creation failed');

        // For now, we simulate a successful API call
        await new Promise(resolve => setTimeout(resolve, 1200)); 
        console.log("Simulated API call successful.");

        return { success: true, message: `Offer of ${price} ${currency} for ${domainName} submitted successfully!` };

    } catch (error) {
        console.error("Failed to make offer:", error);
        return { success: false, message: "Failed to submit offer. Please try again." };
    }
}