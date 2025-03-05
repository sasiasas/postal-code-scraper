export interface RegionIdGenerator {
	(regions: string[]): string;
}

export const createRegionIdGenerator = (): RegionIdGenerator => {
	const regionRegistry = new Map<string, string>();
	const counterMap = new Map<string, number>();

	return (regions: string[]): string => {
		// Normalize region names (case/diacritic/space insensitive)
		const normalized = regions.map((region) =>
			region
				.trim()
				.toLowerCase()
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "") // Remove diacritics
				.replace(/\s+/g, "_")
		);

		// Create a unique composite key for the region hierarchy
		const compositeKey = normalized.join("|");

		// Return existing ID if already registered
		if (regionRegistry.has(compositeKey)) {
			return regionRegistry.get(compositeKey)!;
		}

		// Generate new base name from the last region (typically city name)
		const baseName = normalized[normalized.length - 1];
		const count = (counterMap.get(baseName) || 0) + 1;
		counterMap.set(baseName, count);

		// Create ID with format: {city}_{uniqueCounter}
		const newId = `${baseName}_${count}`;

		// Register the composite key
		regionRegistry.set(compositeKey, newId);

		return newId;
	};
};
