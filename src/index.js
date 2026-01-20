import {
	handleGetConvert,
	handlePostConvert,
	corsHeaders,
} from "./handlers/convert.js";

export default {
	async fetch(request) {
		const url = new URL(request.url);

		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		// Health check endpoint
		if (
			(url.pathname === "/" || url.pathname === "/health") &&
			request.method === "GET" &&
			!url.searchParams.has("url")
		) {
			return new Response(
				JSON.stringify({
					status: "ok",
					message: "URL to Markdown API",
					usage: {
						GET: "/?url=https://example.com&title=true&links=true&clean=true",
						POST: '{ "url": "https://example.com", "title": true, "links": true, "clean": true }',
					},
				}),
				{
					headers: {
						"Content-Type": "application/json",
						...corsHeaders,
					},
				},
			);
		}

		// GET request with URL parameter
		if (request.method === "GET" && url.searchParams.has("url")) {
			return handleGetConvert(url);
		}

		// POST request with URL or HTML in body
		if (request.method === "POST") {
			return handlePostConvert(request);
		}

		// 404 for unknown routes
		return new Response(
			JSON.stringify({
				error: "Not found",
				availableEndpoints: [
					"GET /?url=https://example.com - Convert URL to markdown",
					"POST / - Convert URL or HTML to markdown",
					"GET /health - Health check",
				],
			}),
			{
				status: 404,
				headers: { "Content-Type": "application/json", ...corsHeaders },
			},
		);
	},
};
