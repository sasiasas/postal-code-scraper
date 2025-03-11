# Postal Code Scraper

## 📌 Overview

**Postal Code Scraper** is an automated web scraper designed to extract postal code data from countries worldwide. It efficiently fetches postal codes and organizes them into structured JSON files for easy use in applications.

This library uses **Puppeteer** for web scraping and **Cheerio** for HTML parsing, ensuring accurate and efficient data extraction.

## 🚀 Features

- Scrape **postal codes** from any country
- Scrape **all countries** in one go
- Save results as **JSON** files for easy integration
- Configurable settings (concurrency, retries, headless mode, etc.)  <- read more below
- Structured **postal code lookup** generation
- **Fully asynchronous** for optimized performance

## 📦 Installation

Install via npm:

```sh
npm install postal-code-scraper
```

Or with Yarn:

```sh
yarn add postal-code-scraper
```

## 📖 Usage Guide

### 1️⃣ **Import the Library**

#### ES Module (Recommended):

```javascript
import { PostalCodeScraper } from "postal-code-scraper";
```

#### CommonJS:

```javascript
const { PostalCodeScraper } = require("postal-code-scraper");
```

### 2️⃣ **Scrape a Single Country**

```javascript
async function scrapeSingleCountry() {
    await PostalCodeScraper.scrapeCountry("Canada");
}

scrapeSingleCountry();
```

📌 **Output Files (saved in **``**):**

- `Canada-postal-codes.json`
- `Canada-lookup.json`

### 3️⃣ **Scrape All Countries**

```javascript
async function scrapeAllCountries() {
    await PostalCodeScraper.scrapeCountries();
}

scrapeAllCountries();
```

📌 This will fetch postal codes for **every available country**.

### 4️⃣ **Customize Scraper Configuration**

```javascript
const customScraper = new PostalCodeScraper({
    concurrency: 10,  // Limit concurrent requests
    maxRetries: 3,    // Max retries per request (if a request fails -> so we don't lose data)
    headless: false,  // Run Puppeteer in visible mode
    usePrettyName: true, // Store data using country pretty names
    logger: console  // Enable console logging (default is own implemented) 
    directory: 'src/data'  // Choose the folder where you want to save the data
});

async function run() {
    await customScraper.scrapeCountry("Germany");
}

run();
```

## 📁 Output Data Format

### 🔹 `romania-postal-codes.json`

```json
{
  "cluj": {
    "agarbiciu": [
      "407146"
    ],
    "aghiresu": [
      "407005"
    ],
    "cluj-napoca": [
      "400001",
      "400002",
      "400003",
      "...",
    ],
}
```

### 🔹 `romania-lookup.json`

```json
{
  "postalCodeMap": {
    "337563": "tamasesti_2",
    "337564": "valea_4",
    "400001": "cluj-napoca_1",
    "400002": "cluj-napoca_1",
    "400003": "cluj-napoca_1",
  },
  "regions": {
    "cluj-napoca_1": [
      "cluj",
      "cluj-napoca"
    ],
    "tamasesti_2": [
      "hunedoara",
      "tamasesti"
    ],
    "valea_4": [
      "hunedoara",
      "valea"
    ],
  }
}
```

## 🛠 Configuration Options

| Option          | Type                          | Default                        | Description                                       |
| --------------- | ----------------------------- | ------------------------------ | ------------------------------------------------- |
| `directory`     | `string`                      | `src/data`                     | The directory to save data                        |
| `concurrency`   | `number`                      | `15`                           | Maximum concurrent requests to process            |
| `maxRetries`    | `number`                      | `5`                            | Number of retries for failed requests             |
| `headless`      | `boolean`                     | `true`                         | Run Puppeteer in headless mode                    |
| `usePrettyName` | `boolean`                     | `false`                        | Use country pretty names instead of default names |
| `logger`        | `any implementation` | `null` | `Logger` - self implementation | Logger                                            |

## ❓ FAQs

### **1. Where are the postal code files stored?**

By default, they are saved in:

```
src/data/
```

Each country has two JSON files: one with raw postal codes and another with a structured lookup.

### **2. Can I scrape multiple countries at once?**

Yes, using `scrapeCountries()`, which scrapes **all countries** automatically.

### **3. Can I change the output directory?**

Yes, by changing the `directory` attribute in configuration.

### **4. Does this package work with TypeScript?**

Yes! The package includes TypeScript types for better development experience.

### **5. How can I turn off logging?**

You, by setting the `logger` attribute in configuration to `null`.

## 🏗 Future Enhancements

- ✅ Support for exporting data as CSV

## 🤝 Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue.

## 📜 License

MIT License © 2024

