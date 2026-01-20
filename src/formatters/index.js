export { formatCodeblocks } from "./codeblock.js";
export { formatTables, convertTableToMarkdown } from "./table.js";

/**
 * Clean up markdown formatting
 * @param {string} markdown - The markdown content
 * @returns {string} - Cleaned markdown
 */
export function cleanMarkdown(markdown) {
	return markdown
		.replace(/\n{3,}/g, "\n\n") // Remove excessive newlines
		.trim();
}
