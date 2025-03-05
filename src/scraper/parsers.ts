import { Region, ScraperConfig } from "../types";

export class Parser {
	static parseRegions($: cheerio.Root, config: ScraperConfig): Region[] {
		return $("h2:contains('Regions')")
			.next(".regions")
			.find("a")
			.map((_index, element) => {
				const path = $(element).attr("href");
				const prettyName = $(element).text().trim();
				if (!path || !prettyName) return null;

				return {
					name: path.split("/").filter(Boolean).pop()!,
					prettyName,
					path,
				};
			})
			.get()
			.filter(Boolean) as Region[];
	}

	static parsePostalCodes($: cheerio.Root, config: ScraperConfig): Record<string, string[]> {
		const codes: Record<string, string[]> = {};

		$(".codes .container").each((_i, element) => {
			const place = $(element).find(".place").text().trim();
			const codesList = $(element)
				.find(".code span")
				.map((_j, el) => $(el).text().trim())
				.get();

			if (place) {
				const key = config.usePrettyName ? place : place.toLowerCase().replace(/\s+/g, "-");
				codes[key] = codesList;
			}
		});

		return codes;
	}

	static parseCountries($: cheerio.Root, config: ScraperConfig): Region[] {
		return $(".regions div a")
			.map((_i, element) => {
				const path = $(element).attr("href");
				return path ? { name: path.replace(/\//g, ""), prettyName: $(element).text().trim(), path } : null;
			})
			.get()
			.filter(Boolean) as Region[];
	}

	static parseCountryByName($: cheerio.Root, config: ScraperConfig, name: string): Region | null {
		const countryElement = $(`.regions div a`).filter((_, el) => $(el).attr("href")?.replace(/\//g, "") === name.toLowerCase().trim());

		if (!countryElement.length) return null;

		const path = countryElement.attr("href");
		const prettyName = countryElement.text().trim();
		return path && prettyName
			? {
					name: path.replace(/\//g, ""),
					prettyName,
					path,
			  }
			: null;
	}
}
