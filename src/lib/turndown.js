import { parseHTML } from "linkedom";
import TurndownService from "turndown";

/**
 * Create a configured TurndownService instance
 * @returns {TurndownService} - Configured turndown service
 */
export function createTurndownService() {
	return new TurndownService({
		headingStyle: "atx",
		codeBlockStyle: "fenced",
		bulletListMarker: "-",
		emDelimiter: "_",
	});
}

/**
 * Convert HTML string to markdown using turndown with linkedom
 * @param {string} html - The HTML string
 * @returns {string} - The markdown string
 */
export function htmlToMarkdown(html) {
	// Parse HTML to create a proper DOM for turndown
	const { document, Node } = parseHTML(
		`<!DOCTYPE html><html><body>${html}</body></html>`,
	);

	// Make Node available globally for turndown (required for CF Workers)
	if (typeof globalThis.Node === "undefined") {
		globalThis.Node = Node;
	}

	const turndownService = createTurndownService();

	// Convert using turndown - pass the body element
	return turndownService.turndown(document.body);
}
