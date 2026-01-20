/**
 * Global filters applied to all domains
 */
export const globalFilter = {
	domain: /.*/,
	remove: [/\[¶\]\(#[^\s]+\s+"[^"]+"\)/g],
	replace: [
		{
			// Unwanted spacing in links
			find: /\[[\n\s]*([^\]\n]*)[\n\s]*\]\(([^\)]*)\)/g,
			replacement: "[$1]($2)",
		},
		{
			// Links stuck together
			find: /\)\[/g,
			replacement: ")\n[",
		},
		{
			// Missing uri scheme
			find: /\[([^\]]*)\]\(\/\/([^\)]*)\)/g,
			replacement: "[$1](https://$2)",
		},
	],
};
