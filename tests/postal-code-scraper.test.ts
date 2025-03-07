import { expect } from "chai";
import sinon from "sinon";
import { PostalCodeScraper, ScraperConfig } from "../src";
import path from "path";
import fs from "fs";

const TEST_DATA_DIR = "./tests/test-data";

describe("PostalCodeScraper", () => {
	let scraper: PostalCodeScraper;
	let config: ScraperConfig;

	before(async function () {
		this.timeout(20000);
		config = {
			baseUrl: "https://worldpostalcode.com",
			headless: true,
			concurrency: 10,
			logger: console,
			directory: TEST_DATA_DIR,
		};

		scraper = new PostalCodeScraper(config);
		await scraper.scrapeCountry("romania");
	});

	afterEach(async () => {
		sinon.restore();
	});

	after(() => {
		fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
	});

	describe("Country Scraping", function () {
		it("should handle country found", async () => {
			const postalCodesFile = path.join(TEST_DATA_DIR, "romania-postal-codes.json");
			const lookupFile = path.join(TEST_DATA_DIR, "romania-lookup.json");

			expect(fs.existsSync(postalCodesFile), "Postal codes file should exist").to.be.true;
			expect(fs.existsSync(lookupFile), "Lookup file should exist").to.be.true;
		});

		it("should handle country not found", async () => {
			const loggerSpy = sinon.spy(console, "warn");
			await scraper.scrapeCountry("NonExistentCountry");
			expect(loggerSpy.calledOnce).to.be.true;
		});
	});

	describe("Data Processing", () => {
		it("should generate valid postal code data", async () => {
			const postalCodesFile = path.join(TEST_DATA_DIR, "romania-postal-codes.json");
			const postalCodesContent = JSON.parse(fs.readFileSync(postalCodesFile, "utf8"));

			const expectedPostalCodes = {
				alba: {
					abrud: ["515100"],
				},
			};

			expect(postalCodesContent).to.have.property("alba");
			expect(postalCodesContent.alba).to.have.property("abrud");
			expect(postalCodesContent.alba.abrud).to.deep.equal(expectedPostalCodes.alba.abrud);
		});

		it("should generate valid postal code lookup", () => {
			const lookupFile = path.join(TEST_DATA_DIR, "romania-lookup.json");
			const lookupContent = JSON.parse(fs.readFileSync(lookupFile, "utf8"));

			const expectedLookup = {
				postalCodeMap: {
					"450145": "zalau_1",
				},
				regions: {
					zalau_1: ["salaj", "zalau"],
				},
			};

			expect(lookupContent).to.have.property("postalCodeMap");
			expect(lookupContent.postalCodeMap).to.have.property("450145");
			expect(lookupContent.regions.zalau_1).to.deep.equal(expectedLookup.regions.zalau_1);
			expect(lookupContent).to.have.property("regions");
			expect(lookupContent.regions).to.have.property("zalau_1");
			expect(lookupContent.regions.zalau_1).to.deep.equal(expectedLookup.regions.zalau_1);
		});
	});

	describe("Error Handling", () => {
		it("should retry failed fetches", async () => {
			const fetcherStub = sinon.stub((scraper as any).fetcher, "fetchWithRetry").rejects(new Error("Network error"));

			try {
				await (scraper as any).getCountriesDetails();
			} catch (err) {
				expect(err).to.be.an("error");
				expect(fetcherStub.callCount).to.equal(config.maxRetries);
			}
		});
	});
});
