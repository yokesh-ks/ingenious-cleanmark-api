import { decode } from "html-entities";

/**
 * Format HTML code blocks to markdown using placeholders
 * @param {string} html - The HTML content
 * @param {Array} replacements - Array to store placeholder replacements
 * @returns {string} - HTML with code blocks replaced by placeholders
 */
export function formatCodeblocks(html, replacements) {
	const start = replacements.length;
	const codeblocks = html.match(/(<pre[^>]*>(?:.|\n)*?<\/pre>)/gi);

	if (codeblocks) {
		for (let c = 0; c < codeblocks.length; c++) {
			const codeblock = codeblocks[c];
			let filtered = codeblock;

			// Convert br tags to newlines
			filtered = filtered.replace(/<br[^>]*>/g, "\n");
			// Convert p tags to newlines
			filtered = filtered.replace(/<p>/g, "\n");
			// Strip all HTML tags
			filtered = filtered.replace(/<\/?[^>]+(>|$)/g, "");
			// Decode HTML entities
			filtered = decode(filtered);

			const markdown = `\`\`\`\n${filtered}\n\`\`\`\n`;
			const placeholder = `urltomarkdowncodeblockplaceholder${c}${Math.random()}`;
			replacements[start + c] = { placeholder, replacement: markdown };
			html = html.replace(codeblock, `<p>${placeholder}</p>`);
		}
	}

	return html;
}
