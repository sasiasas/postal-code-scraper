"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
class Parser {
    static parseRegions($, config) {
        return $("h2:contains('Regions')")
            .next(".regions")
            .find("a")
            .map((_index, element) => {
            const path = $(element).attr("href");
            const prettyName = $(element).text().trim();
            if (!path || !prettyName)
                return null;
            return {
                name: path.split("/").filter(Boolean).pop(),
                prettyName,
                path,
            };
        })
            .get()
            .filter(Boolean);
    }
    static parsePostalCodes($, config) {
        const codes = {};
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
    static parseCountries($, config) {
        return $(".regions div a")
            .map((_i, element) => {
            const path = $(element).attr("href");
            return path ? { name: path.replace(/\//g, ""), prettyName: $(element).text().trim(), path } : null;
        })
            .get()
            .filter(Boolean);
    }
    static parseCountryByName($, config, name) {
        const countryElement = $(`.regions div a`).filter((_, el) => { var _a; return ((_a = $(el).attr("href")) === null || _a === void 0 ? void 0 : _a.replace(/\//g, "")) === name.toLowerCase().trim(); });
        if (!countryElement.length)
            return null;
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
exports.Parser = Parser;
//# sourceMappingURL=parsers.js.map