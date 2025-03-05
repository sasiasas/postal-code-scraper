import { Browser } from "puppeteer";
import { ScraperConfig } from "../types";

export class Fetcher {
	constructor(private browser: Browser, private config: ScraperConfig) {}

	async fetchHtml(url: string): Promise<string> {
		const page = await this.browser.newPage();
		try {
			page.setDefaultNavigationTimeout(60000);
			await page.goto(url, { waitUntil: "domcontentloaded" });
			return await page.content();
		} finally {
			await page.close();
		}
	}

	async fetchWithRetry(url: string, retries = this.config.maxRetries || 5): Promise<string> {
		try {
			return await this.fetchHtml(url);
		} catch (error) {
			this.config.logger?.warn(`Retrying (${this.config.maxRetries! - retries + 1}) for: ${url}`);
			if (retries > 0) {
				await new Promise((resolve) => setTimeout(resolve, Math.random() * 7000 + 5000));
				return this.fetchWithRetry(url, retries - 1);
			}
			throw new Error(`Failed to fetch: ${url} after ${this.config.maxRetries} attempts`);
		}
	}
}
