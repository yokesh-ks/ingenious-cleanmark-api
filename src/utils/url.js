/**
 * Validate if a string is a valid HTTP/HTTPS URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export function isValidUrl(url) {
	if (!url || typeof url !== "string") {
		return false;
	}

	try {
		const parsed = new URL(url);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}

/**
 * Parse URL and extract components
 * @param {string} url - The URL to parse
 * @returns {{hostname: string, baseAddress: string, protocol: string} | null}
 */
export function parseUrl(url) {
	if (!url) {
		return null;
	}

	try {
		const parsed = new URL(url);
		return {
			hostname: parsed.hostname,
			baseAddress: `${parsed.protocol}//${parsed.hostname}`,
			protocol: parsed.protocol,
			pathname: parsed.pathname,
			origin: parsed.origin,
		};
	} catch {
		return null;
	}
}

/**
 * Make a relative URL absolute
 * @param {string} relativeUrl - The relative URL
 * @param {string} baseUrl - The base URL
 * @returns {string} - The absolute URL
 */
export function makeAbsoluteUrl(relativeUrl, baseUrl) {
	try {
		return new URL(relativeUrl, baseUrl).href;
	} catch {
		return relativeUrl;
	}
}
