import { Logger } from "./utils/logger";

export type Region = {
	path: string;
	name: string;
	prettyName: string;
};

export type ScraperConfig = {
	usePrettyName?: boolean;
	baseUrl?: string;
	directory?: string;
	concurrency?: number;
	dataDir?: string;
	maxRetries?: number;
	headless?: boolean;
	logger?: Logger;
};

export type ProcessingQueueItem = {
	region: Region;
	currData: any;
};

export type PostalCodeLookup = {
	postalCodeMap: Record<string, string>;
	regions: Record<string, string[]>;
};

export interface PostalCodeData {
	rawData: any;
	postalCodeLookup: PostalCodeLookup;
}
