/**
 * Medium-specific filters
 */
export const mediumFilter = {
	domain: /(?:.*\.)?medium\.com/,
	replace: [
		{
			find: "(https://miro.medium.com/max/60/",
			replacement: "(https://miro.medium.com/max/600/",
		},
		{
			find: /\s*\[\s*!\[([^\]]+)\]\(([^\)]+)\)\s*\]\(([^\?\)]*)\?[^\)]*\)\s*/g,
			replacement: "\n![$1]($2)\n[$1]($3)\n\n",
		},
	],
};
