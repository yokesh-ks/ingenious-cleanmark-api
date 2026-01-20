/**
 * StackOverflow-specific filters
 */
export const stackoverflowFilter = {
	domain: /(?:.*\.)?stackoverflow\.com/,
	remove: [/\* +Links(.|\r|\n)*Three +\|/g],
};
