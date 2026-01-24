const SERVICE_USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const DEFAULT_TIMEOUT_MS = 15 * 1000;

const DEFAULT_HEADERS = {
	Accept:
		"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
	"Accept-Language": "en-US,en;q=0.5",
	"Accept-Encoding": "gzip, deflate, br",
	Connection: "keep-alive",
	"Upgrade-Insecure-Requests": "1",
};

/**
 * Fetch URL with timeout
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @param {number} options.timeout - Timeout in milliseconds
 * @returns {Promise<string>} - The response text
 */
export async function fetchUrl(url, options = {}) {
	const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent": SERVICE_USER_AGENT,
				...DEFAULT_HEADERS,
				...options.headers,
			},
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			const error = new Error(`HTTP ${response.status}`);
			error.status = response.status;
			throw error;
		}

		return await response.text();
	} catch (error) {
		clearTimeout(timeoutId);
		throw error;
	}
}

/**
 * Fetch URL and return response with metadata
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<{text: string, status: number, headers: Headers}>}
 */
export async function fetchUrlWithMetadata(url, options = {}) {
	const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent": SERVICE_USER_AGENT,
				...DEFAULT_HEADERS,
				...options.headers,
			},
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			const error = new Error(`HTTP ${response.status}`);
			error.status = response.status;
			throw error;
		}

		return {
			text: await response.text(),
			status: response.status,
			headers: response.headers,
		};
	} catch (error) {
		clearTimeout(timeoutId);
		throw error;
	}
}
