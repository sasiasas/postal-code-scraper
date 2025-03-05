"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingQueue = void 0;
const cheerio_1 = require("cheerio");
const p_limit_1 = __importDefault(require("p-limit"));
const parsers_1 = require("./parsers");
class ProcessingQueue {
    constructor(fetcher, config) {
        this.fetcher = fetcher;
        this.config = config;
        this.queue = [];
        this.visitedUrls = new Set();
        this.limit = (0, p_limit_1.default)(config.concurrency || 15);
    }
    process(startRegion, data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.queue.push({ region: startRegion, currData: data });
            while (this.queue.length > 0) {
                const tasks = this.queue.map((item) => this.limit(() => this.processItem(item)));
                this.queue = [];
                yield Promise.all(tasks);
            }
        });
    }
    processItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const url = `${this.config.baseUrl}${item.region.path}`;
            if (this.visitedUrls.has(url))
                return;
            this.visitedUrls.add(url);
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.info(`Fetching: ${url}`);
            try {
                const html = yield this.fetcher.fetchWithRetry(url);
                const $ = (0, cheerio_1.load)(html);
                // Parse and add new regions to queue
                const regions = parsers_1.Parser.parseRegions($, this.config);
                regions.forEach((region) => {
                    const key = this.config.usePrettyName ? region.prettyName : region.name;
                    item.currData[key] = {};
                    this.queue.push({
                        region,
                        currData: item.currData[key],
                    });
                });
                // Parse postal codes
                const codes = parsers_1.Parser.parsePostalCodes($, this.config);
                Object.assign(item.currData, codes);
            }
            catch (error) {
                (_b = this.config.logger) === null || _b === void 0 ? void 0 : _b.error(`Error processing ${url}:`, error);
            }
        });
    }
}
exports.ProcessingQueue = ProcessingQueue;
//# sourceMappingURL=queue.js.map