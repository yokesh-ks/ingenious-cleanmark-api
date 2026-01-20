import { globalFilter } from "./global.js";
import { wikipediaFilter } from "./wikipedia.js";
import { mediumFilter } from "./medium.js";
import { stackoverflowFilter } from "./stackoverflow.js";
import { parseUrl } from "../utils/url.js";

/**
 * List of all filters in order of application
 */
const filterList = [
	globalFilter,
	wikipediaFilter,
	mediumFilter,
	stackoverflowFilter,
];

/**
 * Apply a single filter's remove patterns
 * @param {string} data - The markdown content
 * @param {Array} patterns - Array of patterns to remove
 * @returns {string} - Filtered content
 */
function applyRemovePatterns(data, patterns) {
	if (!patterns) return data;

	for (const pattern of patterns) {
		data = data.replaceAll(pattern, "");
	}
	return data;
}

/**
 * Apply a single filter's replace patterns
 * @param {string} data - The markdown content
 * @param {Array} patterns - Array of {find, replacement} objects
 * @returns {string} - Filtered content
 */
function applyReplacePatterns(data, patterns) {
	if (!patterns) return data;

	for (const { find, replacement } of patterns) {
		data = data.replaceAll(find, replacement);
	}
	return data;
}

/**
 * Make relative URLs absolute in markdown
 * @param {string} data - The markdown content
 * @param {string} baseAddress - The base URL
 * @returns {string} - Content with absolute URLs
 */
function makeRelativeUrlsAbsolute(data, baseAddress) {
	if (!baseAddress) return data;

	return data.replaceAll(
		/\[([^\]]*)\]\(\/([^\/][^\)]*)\)/g,
		(_match, title, address) => {
			return `[${title}](${baseAddress}/${address})`;
		},
	);
}

/**
 * Remove inline links from markdown
 * @param {string} data - The markdown content
 * @returns {string} - Content without links
 */
function removeInlineLinks(data) {
	data = data.replaceAll(/\[\[?([^\]]+\]?)\]\([^\)]+\)/g, "$1");
	data = data.replaceAll(/[\\\[]+([0-9]+)[\\\]]+/g, "[$1]");
	return data;
}

/**
 * Apply domain-specific filters to markdown
 * @param {string} url - The source URL
 * @param {string} data - The markdown content
 * @param {boolean} ignoreLinks - Whether to remove links
 * @returns {string} - Filtered markdown
 */
export function filter(url, data, ignoreLinks = false) {
	const urlInfo = parseUrl(url);
	const domain = urlInfo?.hostname ?? "";
	const baseAddress = urlInfo?.baseAddress ?? "";

	// Apply domain-specific filters
	for (const filterItem of filterList) {
		if (domain.match(filterItem.domain)) {
			data = applyRemovePatterns(data, filterItem.remove);
			data = applyReplacePatterns(data, filterItem.replace);
		}
	}

	// Make relative URLs absolute
	data = makeRelativeUrlsAbsolute(data, baseAddress);

	// Remove inline links if requested
	if (ignoreLinks) {
		data = removeInlineLinks(data);
	}

	return data;
}

/**
 * Add a custom filter to the filter list
 * @param {object} filterConfig - The filter configuration
 */
export function addFilter(filterConfig) {
	filterList.push(filterConfig);
}

export { globalFilter, wikipediaFilter, mediumFilter, stackoverflowFilter };
