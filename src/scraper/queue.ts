import { load } from "cheerio";
import { Region, ProcessingQueueItem, ScraperConfig, RegionData } from "../types";
import { Fetcher } from "./fetchers";
import pLimit from "p-limit";
import { Parser } from "./parsers";
import { getBaseUrl } from "../utils/env-config";

export class ProcessingQueue {
	private queue: ProcessingQueueItem[] = [];
	private visitedUrls = new Set<string>();
	private limit: ReturnType<typeof pLimit>;

	constructor(private fetcher: Fetcher, private config: ScraperConfig) {
		this.limit = pLimit(config.concurrency || 15);
	}

	async process(startRegion: Region, data: RegionData): Promise<void> {
		this.queue.push({ region: startRegion, currData: data });

		while (this.queue.length > 0) {
			const tasks = this.queue.map((item) => this.limit(() => this.processItem(item)));
			this.queue = [];
			await Promise.all(tasks);
		}
	}

	private async processItem(item: ProcessingQueueItem): Promise<void> {
		const url = `${getBaseUrl()}${item.region.path}`;

		if (this.visitedUrls.has(url)) return;
		this.visitedUrls.add(url);

		this.config.logger?.info(`Fetching: ${url}`);

		try {
			const html = await this.fetcher.fetchWithRetry(url);
			const $ = load(html);

			const regions = Parser.parseRegions($, this.config);
			regions.forEach((region) => {
				const key = this.config.usePrettyName ? region.prettyName : region.name;
				item.currData[key] = {};
				this.queue.push({
					region,
					currData: item.currData[key],
				});
			});

			const codes = Parser.parsePostalCodes($, this.config);
			Object.assign(item.currData, codes);
		} catch (error) {
			this.config.logger?.error(`Error processing ${url}:`, error);
		}
	}
}
