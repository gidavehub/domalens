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

// CORRECTED: The LiveEvent interface now holds raw data, not React nodes.
export interface LiveEvent {
  id: string;
  type: 'listed' | 'sold' | 'transferred';
  domain: string;
  price?: number; // Optional price for 'sold' events
  timestamp: Date;
}

export interface PaginatedDomainsResponse {
  domains: DomainData[];
  hasMore: boolean;
}

// ===================================================================================
// API CONFIGURATION
// ===================================================================================

const GRAPHQL_ENDPOINT = 'https://api-testnet.doma.xyz/graphql';
const API_KEY = "v1.d3ff4181e47a480d83ee488775ff9361166d349bf0254b63341363b98650237f";

const gqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: { "Api-Key": API_KEY, "Content-Type": "application/json" }
});

const PAGINATED_QUERY = gql`
  query GetPaginatedDomainList($skip: Int!, $take: Int!) {
    names(skip: $skip, take: $take) {
      items {
        name
        tokens {
          ownerAddress
        }
      }
    }
  }
`;

// ===================================================================================
// DATA FETCHING & SIMULATION FUNCTIONS
// ===================================================================================

export async function fetchPaginatedDomains(page: number, pageSize: number): Promise<PaginatedDomainsResponse> {
  const skip = (page - 1) * pageSize;
  
  try {
    const response = await gqlClient.request<{ names: { items: any[] } }>(PAGINATED_QUERY, { skip, take: pageSize });
    const items = response.names.items || [];

    const domains: DomainData[] = items.map((d: any) => ({
      id: d.name,
      name: d.name,
      tld: '.' + (d.name.split('.').pop() || ''),
      owner: d.tokens?.[0]?.ownerAddress || 'N/A',
      status: Math.random() > 0.5 ? 'Trading' : 'Owned',
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
    const eventTypes: LiveEvent['type'][] = ['listed', 'sold', 'transferred'];
    const sampleDomains = ['quantum.ai', 'web3.xyz', 'defi.co', 'lens.xyz', 'market.base', 'art.eth', 'vision.io'];
    
    const generateEvent = () => {
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const domain = sampleDomains[Math.floor(Math.random() * sampleDomains.length)];

        // CORRECTED: Create a plain data object, no JSX.
        const newEvent: LiveEvent = {
            id: crypto.randomUUID(),
            type,
            domain,
            timestamp: new Date(),
        };

        if (type === 'sold') {
            newEvent.price = parseFloat((Math.random() * 5).toFixed(2));
        }

        callback(newEvent);
    };

    const intervalId = setInterval(generateEvent, 3000);
    return () => clearInterval(intervalId);
}