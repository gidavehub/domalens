export interface Domain {
	id: string;
	name: string;
	owner: string;
	tokenId: number;
	tokenizedDate: string;
	tld: string;
}

export interface MarketListing {
	type: 'ask' | 'bid';
	price: number;
	from: string;
	timestamp: string;
}

// AI Model Payloads
export interface RarityScore {
	score: number;
	traits: { key: string; value: string | number }[];
}

export interface PricePrediction {
	predictedPrice: number;
	confidence: number;
	factors: { key: string; value: string }[];
}

export interface TrendData {
	tld: string;
	hypeIndex: number;
}

export interface OutlierDomain {
	name: string;
	anomalyScore: number;
	reason: string;
}

export interface NetworkInfluence {
	type: 'wallet' | 'domain';
	address: string;
	influenceScore: number;
}
