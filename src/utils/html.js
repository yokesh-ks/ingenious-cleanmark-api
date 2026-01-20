/**
 * Strip style blocks from HTML
 * @param {string} html - The HTML content
 * @returns {string} - HTML without style blocks
 */
export function stripStyleBlocks(html) {
	return html.replace(/<style[\s\S]*?<\/style>/gi, "");
}

/**
 * Strip script blocks from HTML
 * @param {string} html - The HTML content
 * @returns {string} - HTML without script blocks
 */
export function stripScriptBlocks(html) {
	return html.replace(/<script[\s\S]*?<\/script>/gi, "");
}

/**
 * Strip both style and script blocks from HTML
 * @param {string} html - The HTML content
 * @returns {string} - HTML without style and script blocks
 */
export function stripStyleAndScriptBlocks(html) {
	return stripScriptBlocks(stripStyleBlocks(html));
}

/**
 * Extract title from HTML
 * @param {string} html - The HTML content
 * @returns {string} - The title text or empty string
 */
export function extractTitle(html) {
	const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
	return match ? match[1].trim() : "";
}

/**
 * Strip all HTML tags from a string
 * @param {string} html - The HTML content
 * @returns {string} - Plain text without HTML tags
 */
export function stripTags(html) {
	return html.replace(/<\/?[^>]+(>|$)/g, "");
}

/**
 * Strip newlines from a string
 * @param {string} str - The string
 * @returns {string} - String without newlines
 */
export function stripNewlines(str) {
	return str.replace(/(\r\n|\n|\r)/gm, "");
}
