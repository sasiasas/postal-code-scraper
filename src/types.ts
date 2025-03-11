export type Region = {
	path: string;
	name: string;
	prettyName: string;
};

export type ScraperConfig = {
	usePrettyName?: boolean;
	directory?: string;
	concurrency?: number;
	maxRetries?: number;
	headless?: boolean;
	logger?: any;
};

export type ProcessingQueueItem = {
	region: Region;
	currData: RegionData;
};

export interface LookupData {
	postalCodeMap: {
		[postalCode: string]: string;
	};
	regions: {
		[code: string]: string[];
	};
}

export interface PostalCodeData {
	rawData: RegionData;
	postalCodeLookup: LookupData;
}

export interface RegionData {
	[key: string]: RegionData | string[];
}
