/**
 * Wikipedia-specific filters
 */
export const wikipediaFilter = {
	domain: /.*\.wikipedia\.org/,
	remove: [
		/\*\*\[\^\]\(#cite_ref[^\)]+\)\*\*/g,
		/(?:\\\[)?\[edit\]\([^\s]+\s+"[^"]+"\)(?:\\\])?/gi,
		/\^\s\[Jump up to[^\)]*\)/gi,
		/\[[^\]]*\]\(#cite_ref[^\)]+\)/g,
		/\[\!\[Edit this at Wikidata\].*/g,
		/\[\!\[Listen to this article\]\([^\)]*\)\]\([^\)]*\.(mp3|ogg|oga|flac)[^\)]*\)/g,
		/\[This audio file\]\([^\)]*\).*/g,
		/\!\[Spoken Wikipedia icon\]\([^\)]*\)/g,
		/\[.*\]\(.*Play audio.*\).*/g,
	],
	replace: [
		{
			find: /\(https:\/\/upload.wikimedia.org\/wikipedia\/([^\/]+)\/thumb\/([^\)]+\..{3,4})\/[^\)]+\)/gi,
			replacement: "(https://upload.wikimedia.org/wikipedia/$1/$2)",
		},
		{
			find: /\n(.+)\n\-{32,}\n/gi,
			replacement: (_match, title) => {
				return `\n${title}\n${"-".repeat(title.length)}\n`;
			},
		},
	],
};
