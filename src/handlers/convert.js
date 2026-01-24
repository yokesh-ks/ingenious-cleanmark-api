import { processHtml } from "../lib/processor.js";
import { cleanMarkdown } from "../formatters/index.js";
import { fetchUrl } from "../utils/fetch.js";
import { isValidUrl } from "../utils/url.js";

const FAILURE_MESSAGE = "Sorry, could not fetch and convert that URL";
const BLOCKED_MESSAGE =
	"This website blocks automated access. Try a different URL.";

/**
 * CORS headers for responses
 */
export const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
	"Access-Control-Expose-Headers": "X-Title",
};

/**
 * Get options from query parameters or body
 * @param {object} params - The parameters
 * @returns {object} - The options
 */
export function getOptions(params) {
	const title = params.title;
	const links = params.links;
	const clean = params.clean;

	let inlineTitle = false;
	let ignoreLinks = false;
	let improveReadability = true;

	if (title !== undefined) {
		inlineTitle = title === true || title === "true";
	}
	if (links !== undefined) {
		ignoreLinks = links === false || links === "false";
	}
	if (clean !== undefined) {
		improveReadability = clean !== false && clean !== "false";
	}

	return {
		inline_title: inlineTitle,
		ignore_links: ignoreLinks,
		improve_readability: improveReadability,
	};
}

/**
 * Create markdown response with headers
 * @param {string} markdown - The markdown content
 * @param {string} title - The page title
 * @returns {Response} - The response object
 */
function createMarkdownResponse(markdown, title) {
	const headers = {
		"Content-Type": "text/markdown",
		...corsHeaders,
	};

	if (title) {
		headers["X-Title"] = encodeURIComponent(title);
	}

	return new Response(markdown, { headers });
}

/**
 * Create error response
 * @param {string} message - The error message
 * @param {number} status - The HTTP status code
 * @param {boolean} json - Whether to return JSON
 * @returns {Response} - The response object
 */
function createErrorResponse(message, status, json = false) {
	if (json) {
		return new Response(JSON.stringify({ error: message }), {
			status,
			headers: { "Content-Type": "application/json", ...corsHeaders },
		});
	}
	return new Response(message, {
		status,
		headers: { "Content-Type": "text/plain", ...corsHeaders },
	});
}

/**
 * Handle GET request for URL conversion
 * @param {URL} url - The request URL
 * @returns {Promise<Response>} - The response
 */
export async function handleGetConvert(url) {
	const targetUrl = url.searchParams.get("url");

	if (!isValidUrl(targetUrl)) {
		return createErrorResponse(
			"Please specify a valid url query parameter",
			400,
		);
	}

	const options = getOptions({
		title: url.searchParams.get("title"),
		links: url.searchParams.get("links"),
		clean: url.searchParams.get("clean"),
	});

	try {
		const html = await fetchUrl(targetUrl);
		const { markdown, title } = processHtml(targetUrl, html, options);
		const cleanedMarkdown = cleanMarkdown(markdown);

		return createMarkdownResponse(cleanedMarkdown, title);
	} catch (error) {
		const is403 = error.message?.includes("403");
		const status = error.message?.includes("HTTP") ? 502 : 504;
		const errorMsg = is403 ? BLOCKED_MESSAGE : FAILURE_MESSAGE;
		const details = error.message?.includes("HTTP")
			? ` as the website returned ${error.message}`
			: "";
		return createErrorResponse(`${errorMsg}${details}`, status);
	}
}

/**
 * Handle POST request for URL/HTML conversion
 * @param {Request} request - The request object
 * @returns {Promise<Response>} - The response
 */
export async function handlePostConvert(request) {
	try {
		const body = await request.json();
		const { url: targetUrl, html: providedHtml } = body;
		const options = getOptions(body);

		let html = providedHtml;
		let sourceUrl = targetUrl || "";

		// If URL provided but no HTML, fetch the URL
		if (targetUrl && !providedHtml) {
			if (!isValidUrl(targetUrl)) {
				return createErrorResponse("Please specify a valid URL", 400, true);
			}

			try {
				html = await fetchUrl(targetUrl);
			} catch (error) {
				const is403 = error.message?.includes("403");
				const status = error.message?.includes("HTTP") ? 502 : 504;
				return new Response(
					JSON.stringify({
						error: is403 ? BLOCKED_MESSAGE : FAILURE_MESSAGE,
						details: error.message,
					}),
					{
						status,
						headers: { "Content-Type": "application/json", ...corsHeaders },
					},
				);
			}
		}

		if (!html) {
			return createErrorResponse(
				"Please provide either a URL or HTML content",
				400,
				true,
			);
		}

		const { markdown, title } = processHtml(sourceUrl, html, options);
		const cleanedMarkdown = cleanMarkdown(markdown);

		return createMarkdownResponse(cleanedMarkdown, title);
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: "Could not parse that document",
				details: error.message,
			}),
			{
				status: 400,
				headers: { "Content-Type": "application/json", ...corsHeaders },
			},
		);
	}
}
