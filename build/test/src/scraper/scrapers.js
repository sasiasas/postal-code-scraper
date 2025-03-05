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
exports.PostalCodeScraper = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const queue_1 = require("./queue");
const fetchers_1 = require("./fetchers");
const id_generator_1 = require("../utils/id-generator");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const cheerio_1 = require("cheerio");
const parsers_1 = require("./parsers");
class PostalCodeScraper {
    constructor(config = {}) {
        this.config = config;
        this.config = Object.assign({ baseUrl: "https://worldpostalcode.com", concurrency: 15, maxRetries: 5, headless: true, directory: "src/data" }, config);
    }
    scrapeCountry(countryName) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield this.initBrowser();
            const country = yield this.getCountryDetails(countryName);
            if (!country) {
                (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.warn(`Country not found: ${countryName}`);
                return null;
            }
            const data = {};
            yield this.queue.process(country, data);
            this.saveData(data, `${country.name}-postal-codes.json`, this.config.directory);
            const postalCodeLookup = this.generatePostalCodeLookup(data);
            this.saveData(postalCodeLookup, `${country.name}-lookup.json`, this.config.directory);
            yield this.cleanup();
        });
    }
    scrapeCountries() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield this.initBrowser();
            const countries = yield this.getCountriesDetails();
            if (countries.length === 0) {
                (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.warn("No countries found.");
                return null;
            }
            for (const country of countries) {
                const key = this.config.usePrettyName ? country.prettyName : country.name;
                const countryData = {};
                (_b = this.config.logger) === null || _b === void 0 ? void 0 : _b.info(`Processing country: ${key}`);
                yield this.queue.process(country, countryData);
                this.saveData(countryData, `${key}-postal-codes.json`, this.config.directory);
                const postalCodeLookup = this.generatePostalCodeLookup(countryData);
                this.saveData(postalCodeLookup, `${key}-lookup.json`, this.config.directory);
            }
            yield this.cleanup();
        });
    }
    initBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser = yield puppeteer_1.default.launch({ headless: this.config.headless });
            this.fetcher = new fetchers_1.Fetcher(this.browser, this.config);
            this.queue = new queue_1.ProcessingQueue(this.fetcher, this.config);
        });
    }
    getCountryDetails(name) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const html = yield this.fetcher.fetchWithRetry(this.config.baseUrl);
                return parsers_1.Parser.parseCountryByName((0, cheerio_1.load)(html), this.config, name);
            }
            catch (error) {
                (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.error(`Error fetching country details: ${name}`, error);
                return null;
            }
        });
    }
    getCountriesDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const html = yield this.fetcher.fetchWithRetry(this.config.baseUrl);
                return parsers_1.Parser.parseCountries((0, cheerio_1.load)(html), this.config);
            }
            catch (error) {
                (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.error("Error fetching countries details", error);
                return [];
            }
        });
    }
    generatePostalCodeLookup(data) {
        return this.buildLookup(data, (0, id_generator_1.createRegionIdGenerator)());
    }
    buildLookup(regionObj, idGenerator, acc = [], result = { postalCodeMap: {}, regions: {} }) {
        if (Array.isArray(regionObj)) {
            for (const item of regionObj) {
                const id = idGenerator(acc);
                result.postalCodeMap[item] = id;
                result.regions[id] = [...acc];
            }
        }
        else if (typeof regionObj === "object" && regionObj !== null) {
            for (const [regionKey, regionValue] of Object.entries(regionObj)) {
                this.buildLookup(regionValue, idGenerator, [...acc, regionKey], result);
            }
        }
        return result;
    }
    normalizeString(str) {
        return str
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9.-]/g, "");
    }
    saveData(data, fileName, directory = "src/data") {
        var _a, _b;
        try {
            (0, fs_1.mkdirSync)(directory, { recursive: true });
            const filePath = path_1.default.join(directory, this.normalizeString(fileName));
            (0, fs_1.writeFileSync)(filePath, JSON.stringify(data, null, 2), { flag: "w" });
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.info(`Saved data to ${filePath}`);
        }
        catch (error) {
            (_b = this.config.logger) === null || _b === void 0 ? void 0 : _b.error(`Error saving data to ${fileName}`, error);
        }
    }
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield ((_a = this.browser) === null || _a === void 0 ? void 0 : _a.close());
        });
    }
}
exports.PostalCodeScraper = PostalCodeScraper;
exports.default = new PostalCodeScraper();
//# sourceMappingURL=scrapers.js.map