"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe("Postal Code Scraper", () => {
    it("should do something", () => {
        const result = index_1.default.scrapeCountry("romania");
        (0, chai_1.expect)(result).to.be.ok;
    });
});
//# sourceMappingURL=postal-code-scraper.test.js.map