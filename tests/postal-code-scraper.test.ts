import { expect } from "chai";
import PostalCodeScraper from "../src/index";

describe("Postal Code Scraper", () => {
	it("should do something", () => {
		const result = PostalCodeScraper.scrapeCountry("romania");
		expect(result).to.be.ok;
	});
});
