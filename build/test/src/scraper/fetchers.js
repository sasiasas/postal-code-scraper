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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fetcher = void 0;
class Fetcher {
    constructor(browser, config) {
        this.browser = browser;
        this.config = config;
    }
    fetchHtml(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield this.browser.newPage();
            try {
                page.setDefaultNavigationTimeout(60000);
                yield page.goto(url, { waitUntil: "domcontentloaded" });
                return yield page.content();
            }
            finally {
                yield page.close();
            }
        });
    }
    fetchWithRetry(url_1) {
        return __awaiter(this, arguments, void 0, function* (url, retries = this.config.maxRetries || 5) {
            var _a;
            try {
                return yield this.fetchHtml(url);
            }
            catch (error) {
                (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.warn(`Retrying (${this.config.maxRetries - retries + 1}) for: ${url}`);
                if (retries > 0) {
                    yield new Promise((resolve) => setTimeout(resolve, Math.random() * 7000 + 5000));
                    return this.fetchWithRetry(url, retries - 1);
                }
                throw new Error(`Failed to fetch: ${url} after ${this.config.maxRetries} attempts`);
            }
        });
    }
}
exports.Fetcher = Fetcher;
//# sourceMappingURL=fetchers.js.map