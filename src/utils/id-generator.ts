export interface RegionIdGenerator {
	(regions: string[]): string;
}

export const createRegionIdGenerator = (): RegionIdGenerator => {
	const regionRegistry = new Map<string, string>();
	const counterMap = new Map<string, number>();

	return (regions: string[]): string => {
		const normalized = regions.map((region) =>
			region
				.trim()
				.toLowerCase()
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "")
				.replace(/\s+/g, "_")
		);

		const compositeKey = normalized.join("|");

		if (regionRegistry.has(compositeKey)) {
			return regionRegistry.get(compositeKey)!;
		}

		const baseName = normalized[normalized.length - 1];
		const count = (counterMap.get(baseName) || 0) + 1;
		counterMap.set(baseName, count);

		const newId = `${baseName}_${count}`;

		regionRegistry.set(compositeKey, newId);

		return newId;
	};
};
