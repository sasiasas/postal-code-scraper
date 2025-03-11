import path from "path";
import puppeteer, { Browser } from "puppeteer";
import { ProcessingQueue } from "./queue";
import { Fetcher } from "./fetchers";
import { Region, ScraperConfig, LookupData, RegionData } from "../types";
import { createRegionIdGenerator, RegionIdGenerator } from "../utils/id-generator";
import { writeFileSync, mkdirSync } from "fs";
import { load } from "cheerio";
import { Parser } from "./parsers";
import { getBaseUrl } from "../utils/env-config";
import { normalizeString } from "../utils/string-utils";
import { Logger } from "../utils/logger";

export class PostalCodeScraper {
	private browser!: Browser;
	private queue!: ProcessingQueue;
	private fetcher!: Fetcher;

	constructor(private config: ScraperConfig = {}) {
		this.config = {
			concurrency: 15,
			maxRetries: 5,
			headless: true,
			directory: "src/data",
			logger: Logger,
			usePrettyName: false,
			...config,
		};
	}

	async scrapeCountry(countryName: string) {
		await this.initBrowser();
		try {
			const country = await this.getCountryDetails(countryName);
			if (!country) {
				this.config.logger?.warn(`Country not found: ${countryName}`);
				return null;
			}

			const data: RegionData = {};
			await this.queue.process(country, data);

			this.saveData(data, `${country.name}-postal-codes.json`, this.config.directory!);

			const postalCodeLookup = this.generatePostalCodeLookup(data);
			this.saveData(postalCodeLookup, `${country.name}-lookup.json`, this.config.directory!);
		} finally {
			await this.cleanup();
		}
	}

	async scrapeCountries() {
		await this.initBrowser();
		try {
			const countries = await this.getCountriesDetails();
			if (countries.length === 0) {
				this.config.logger?.warn("No countries found.");
				return null;
			}

			for (const country of countries) {
				const key = this.config.usePrettyName ? country.prettyName : country.name;
				const countryData: RegionData = {};
				this.config.logger?.info(`Processing country: ${key}`);

				await this.queue.process(country, countryData);
				this.saveData(countryData, `${key}-postal-codes.json`, this.config.directory!);

				const postalCodeLookup = this.generatePostalCodeLookup(countryData);
				this.saveData(postalCodeLookup, `${key}-lookup.json`, this.config.directory!);
			}
		} finally {
			await this.cleanup();
		}
	}

	private async initBrowser() {
		this.browser = await puppeteer.launch({ headless: this.config.headless });
		this.fetcher = new Fetcher(this.browser, this.config);
		this.queue = new ProcessingQueue(this.fetcher, this.config);
	}

	private async getCountryDetails(name: string): Promise<Region | null> {
		try {
			const html = await this.fetcher.fetchWithRetry(getBaseUrl());
			return Parser.parseCountryByName(load(html), this.config, name);
		} catch (error) {
			this.config.logger?.error(`Error fetching country details: ${name}`, error);
			return null;
		}
	}

	private async getCountriesDetails(): Promise<Region[]> {
		try {
			const html = await this.fetcher.fetchWithRetry(getBaseUrl());
			return Parser.parseCountries(load(html), this.config);
		} catch (error) {
			this.config.logger?.error("Error fetching countries details", error);
			return [];
		}
	}

	private generatePostalCodeLookup(data: RegionData): LookupData {
		return this.buildLookup(data, createRegionIdGenerator());
	}

	private buildLookup(
		regionObj: RegionData | string[],
		idGenerator: RegionIdGenerator,
		acc: string[] = [],
		result: LookupData = { postalCodeMap: {}, regions: {} }
	): LookupData {
		if (Array.isArray(regionObj)) {
			for (const item of regionObj) {
				const id = idGenerator(acc);
				result.postalCodeMap[item] = id;
				result.regions[id] = [...acc];
			}
		} else if (typeof regionObj === "object" && regionObj !== null) {
			for (const [regionKey, regionValue] of Object.entries(regionObj)) {
				this.buildLookup(regionValue, idGenerator, [...acc, regionKey], result);
			}
		}
		return result;
	}

	private saveData(data: any, fileName: string, directory: string = "src/data") {
		try {
			mkdirSync(directory, { recursive: true });
			const filePath = path.join(directory, normalizeString(fileName));
			writeFileSync(filePath, JSON.stringify(data, null, 2), { flag: "w" });
			this.config.logger?.info(`Saved data to ${filePath}`);
		} catch (error) {
			this.config.logger?.error(`Error saving data to ${fileName}`, error);
		}
	}

	private async cleanup() {
		await this.browser?.close();
	}
}

export default new PostalCodeScraper();
