import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import { htmlToMarkdown } from "./turndown.js";
import { formatCodeblocks, formatTables } from "../formatters/index.js";
import { filter } from "../filters/index.js";
import { stripStyleAndScriptBlocks } from "../utils/html.js";

/**
 * Process DOM and convert to markdown
 * @param {string} url - The source URL
 * @param {object} doc - The parsed document (linkedom)
 * @param {string} id - Optional element ID to extract
 * @param {object} options - Conversion options
 * @returns {object} - { markdown, title }
 */
export function processDom(url, doc, id = "", options = {}) {
	const inlineTitle = options.inline_title ?? true;
	const ignoreLinks = options.ignore_links ?? false;
	const improveReadability = options.improve_readability ?? true;

	// Get title
	const titleEl = doc.querySelector("title");
	const title = titleEl ? titleEl.textContent : "";

	// If specific ID requested, extract that element
	let workingDoc = doc;
	if (id) {
		const el = doc.querySelector(`#${id}`);
		if (el) {
			const { document: newDoc } = parseHTML(
				`<!DOCTYPE html><html><body>${el.innerHTML}</body></html>`,
			);
			workingDoc = newDoc;
		}
	}

	let readable = null;
	if (improveReadability) {
		try {
			// Clone the document for Readability (it modifies the DOM)
			const cloneHtml = workingDoc.documentElement.outerHTML;
			const { document: clonedDoc } = parseHTML(cloneHtml);

			const reader = new Readability(clonedDoc);
			const readableObj = reader.parse();
			if (readableObj) {
				readable = readableObj.content;
			}
		} catch {
			// Fall back to raw HTML if Readability fails
		}
	}

	if (!readable) {
		readable = workingDoc.documentElement
			? workingDoc.documentElement.outerHTML
			: workingDoc.body
				? workingDoc.body.innerHTML
				: "";
	}

	// Apply formatters with placeholder technique
	const replacements = [];
	readable = formatCodeblocks(readable, replacements);
	readable = formatTables(readable, replacements);

	// Convert to markdown using turndown with proper DOM context
	let markdown = htmlToMarkdown(readable);

	// Replace placeholders with formatted content
	for (const { placeholder, replacement } of replacements) {
		markdown = markdown.replace(placeholder, replacement);
	}

	// Apply domain-specific filters
	let result = url ? filter(url, markdown, ignoreLinks) : markdown;

	// Prepend title if requested
	if (inlineTitle && title) {
		result = `# ${title}\n${result}`;
	}

	return { markdown: result, title };
}

/**
 * Process HTML string and convert to markdown
 * @param {string} url - The source URL
 * @param {string} html - The HTML content
 * @param {object} options - Conversion options
 * @returns {object} - { markdown, title }
 */
export function processHtml(url, html, options = {}) {
	// Strip style and script blocks first
	html = stripStyleAndScriptBlocks(html);

	// Parse HTML using linkedom (Cloudflare Workers compatible)
	const { document } = parseHTML(html);

	return processDom(url, document, "", options);
}
