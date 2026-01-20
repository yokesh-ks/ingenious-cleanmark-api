import { decode } from "html-entities";

const MAX_WIDTH = 96;

/**
 * Clean HTML string by removing tags and decoding entities
 * @param {string} str - The HTML string
 * @returns {string} - Cleaned string
 */
function clean(str) {
	str = str.replace(/<\/?[^>]+(>|$)/g, "");
	str = str.replace(/(\r\n|\n|\r)/gm, "");
	str = decode(str);
	return str.trim();
}

/**
 * Left-justify a string to a given width
 * @param {string} str - The string to justify
 * @param {number} width - The target width
 * @param {string} pad - The padding character
 * @returns {string} - Justified string
 */
function ljust(str, width, pad = " ") {
	if (str.length >= width) return str;
	return str + pad.repeat(width - str.length);
}

/**
 * Convert HTML table to markdown
 * @param {string} table - The HTML table string
 * @returns {string} - Markdown table
 */
export function convertTableToMarkdown(table) {
	let result = "\n";

	// Extract caption if present
	const caption = table.match(/<caption[^>]*>((?:.|\n)*)<\/caption>/i);
	if (caption) {
		result += `${clean(caption[1])}\n\n`;
	}

	const items = [];

	// Collect table rows
	const rows = table.match(/(<tr[^>]*>(?:.|\n)*?<\/tr>)/gi);
	const nRows = rows?.length ?? 0;

	// Need at least 2 rows for a proper table
	if (nRows < 2) {
		return "";
	}

	// Parse rows and columns
	for (let r = 0; r < nRows; r++) {
		const itemCols = [];
		const cols = rows[r].match(/<t[h|d][^>]*>(?:.|\n)*?<\/t[h|d]>/gi);
		if (cols) {
			for (let c = 0; c < cols.length; c++) {
				itemCols.push(clean(cols[c]));
			}
		}
		items.push(itemCols);
	}

	// Find max columns
	let nCols = 0;
	for (let r = 0; r < nRows; r++) {
		if (items[r].length > nCols) {
			nCols = items[r].length;
		}
	}

	// Normalize columns (ensure all rows have same number of columns)
	for (let r = 0; r < nRows; r++) {
		while (items[r].length < nCols) {
			items[r].push("");
		}
	}

	// Calculate column widths
	const columnWidths = [];
	for (let c = 0; c < nCols; c++) {
		columnWidths[c] = 3; // Minimum width
	}
	for (let r = 0; r < nRows; r++) {
		for (let c = 0; c < nCols; c++) {
			const len = items[r][c].length;
			if (len > columnWidths[c]) {
				columnWidths[c] = len;
			}
		}
	}

	// Calculate total width
	let totalWidth = 0;
	for (let c = 0; c < nCols; c++) {
		totalWidth += columnWidths[c];
	}

	if (totalWidth < MAX_WIDTH) {
		// Present as markdown table
		// Pad cells
		for (let r = 0; r < nRows; r++) {
			for (let c = 0; c < nCols; c++) {
				items[r][c] = ljust(items[r][c], columnWidths[c], " ");
			}
		}

		if (nRows > 0 && nCols > 0) {
			// Header row
			if (nRows > 1) {
				result += "|";
				for (let c = 0; c < nCols; c++) {
					result += `${items[0][c]}|`;
				}
			}
			result += "\n";

			// Separator row
			result += "|";
			for (let c = 0; c < nCols; c++) {
				result += `${"-".repeat(columnWidths[c])}|`;
			}
			result += "\n";

			// Data rows
			for (let r = 1; r < nRows; r++) {
				result += "|";
				for (let c = 0; c < nCols; c++) {
					result += `${items[r][c]}|`;
				}
				result += "\n";
			}
		}
	} else {
		// Present as indented list (for wide tables)
		result += "\n";
		for (let r = 1; r < nRows; r++) {
			if (items[0][0] || items[r][0]) {
				result += "* ";
			}
			if (items[0][0]) {
				result += `${items[0][0]}: `;
			}
			if (items[r][0]) {
				result += items[r][0];
			}
			if (items[0][0] || items[r][0]) {
				result += "\n";
			}
			for (let c = 1; c < nCols; c++) {
				if (items[0][c] || items[r][c]) {
					result += "  * ";
				}
				if (items[0][c]) {
					result += `${items[0][c]}: `;
				}
				if (items[r][c]) {
					result += items[r][c];
				}
				if (items[0][c] || items[r][c]) {
					result += "\n";
				}
			}
		}
	}

	return result;
}

/**
 * Format HTML tables to markdown using placeholders
 * @param {string} html - The HTML content
 * @param {Array} replacements - Array to store placeholder replacements
 * @returns {string} - HTML with tables replaced by placeholders
 */
export function formatTables(html, replacements) {
	const start = replacements.length;
	const tables = html.match(/(<table[^>]*>(?:.|\n)*?<\/table>)/gi);

	if (tables) {
		for (let t = 0; t < tables.length; t++) {
			const table = tables[t];
			const markdown = convertTableToMarkdown(table);
			const placeholder = `urltomarkdowntableplaceholder${t}${Math.random()}`;
			replacements[start + t] = { placeholder, replacement: markdown };
			html = html.replace(table, `<p>${placeholder}</p>`);
		}
	}

	return html;
}
