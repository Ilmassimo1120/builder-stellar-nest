import type { Context } from "@netlify/functions";
import { createServer } from "../../server";
import serverless from "serverless-http";

// Create the Express app
const app = createServer();

// Convert Express app to serverless function
const handler = serverless(app);

export default async (request: Request, context: Context) => {
  // Convert the modern Request to the legacy format expected by serverless-http
  const event = {
    httpMethod: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    path: new URL(request.url).pathname,
    queryStringParameters: Object.fromEntries(new URL(request.url).searchParams.entries()),
    body: request.method !== 'GET' ? await request.text() : null,
    isBase64Encoded: false,
  };

  const legacyContext = {
    callbackWaitsForEmptyEventLoop: false,
    getRemainingTimeInMillis: () => 300000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
    ...context,
  };

  try {
    const result = await handler(event, legacyContext);
    
    return new Response(result.body, {
      status: result.statusCode,
      headers: result.headers as Record<string, string>,
    });
  } catch (error) {
    console.error('Netlify function error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
