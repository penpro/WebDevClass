// Single Lambda handling both /todos routes for the class assignment.
//
// Architectural note: the choice of "one function for the whole API" vs
// "one function per route" is a real serverless design decision (and one
// of the review questions). This project deliberately uses ONE because:
//
//   * Simpler to deploy and reason about
//   * Cold-start warm-ups are shared — a request to GET keeps the same
//     execution environment warm for a subsequent POST
//   * Routing logic for two routes is trivial (a single if/else)
//
// Bigger APIs eventually split per resource (e.g. todos-handler,
// users-handler, reports-handler) so each function can scale, fail, and
// be deployed independently. That trade-off is worth discussing in the
// README; this code is the minimal end of the spectrum.
//
// Runtime: Node.js 20.x. The AWS SDK v3 (@aws-sdk/*) is BUNDLED with the
// Lambda Node.js 18+ runtimes, so we don't need to bundle node_modules
// in the deployment zip — `require('@aws-sdk/...')` just works. (For
// production code you'd usually pin and bundle your own SDK to avoid
// surprise updates, but this is a class project.)

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand
} = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('node:crypto');

// IMPORTANT: the DynamoDB client is created OUTSIDE the handler so it
// survives across invocations on the same warm container. Building the
// client inside the handler costs ~50–100 ms every cold start AND every
// warm invocation. Module-level instantiation lets the SDK's connection
// state amortize across requests on the same container.
//
// This is also the answer to review question 4 ("why must Lambda
// functions be stateless?") — module-level state is shared between
// invocations on a SINGLE warm container, but multiple containers spin
// up under load and each has its own copy. So you can cache an SDK
// client (good — pure performance optimization) but you cannot rely on
// in-memory state being the same across requests (bad — you'll see
// inconsistent behavior depending on which container handled which
// request).
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME;

exports.handler = async (event) => {
  const method =
    event?.requestContext?.http?.method || event?.httpMethod || '';
  const path = event?.rawPath || event?.path || '';

  // Useful for spotting cold starts in CloudWatch: every cold start prints
  // an INIT_DURATION line in the platform logs, but logging the first
  // handler invocation also makes it easy to spot in your own logs.
  console.log(`[handler] ${method} ${path}`);

  try {
    if (method === 'OPTIONS') {
      // CORS preflight is configured at the API Gateway HTTP API level
      // (see the README walkthrough) so this branch is mostly defensive.
      return respond(204);
    }
    if (method === 'GET' && path.endsWith('/todos')) {
      const result = await ddb.send(new ScanCommand({ TableName: TABLE }));
      const items = (result.Items || []).sort(
        (a, b) => (b.created_at || 0) - (a.created_at || 0)
      );
      return respond(200, items);
    }
    if (method === 'POST' && path.endsWith('/todos')) {
      const body = safeJson(event.body);
      const text = typeof body?.text === 'string' ? body.text.trim() : '';
      if (!text) {
        return respond(400, { error: 'text is required' });
      }
      const item = {
        id: randomUUID(),
        text,
        created_at: Date.now()
      };
      await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
      return respond(201, item);
    }
    return respond(404, { error: 'not found' });
  } catch (err) {
    console.error('[handler] error:', err);
    return respond(500, { error: err.message || 'internal error' });
  }
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      // CORS is also configured on the HTTP API itself; duplicating these
      // headers makes the function safe to invoke directly via a Lambda
      // function URL too, if you ever want to do that.
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: body === undefined ? '' : JSON.stringify(body)
  };
}

function safeJson(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
