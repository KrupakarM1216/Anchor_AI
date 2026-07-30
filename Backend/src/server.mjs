import { createServer } from "node:http";

const port = Number(process.env.PORT || 4000);
const json = (response, status, body) => response.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": process.env.FRONTEND_ORIGIN || "http://localhost:3000", "Access-Control-Allow-Headers": "Content-Type" }).end(JSON.stringify(body));

createServer((request, response) => {
  if (request.method === "OPTIONS") return json(response, 204, {});
  if (request.method === "GET" && request.url === "/health") return json(response, 200, { status: "ok", service: "anchor-backend" });
  return json(response, 404, { error: { code: "NOT_IMPLEMENTED", message: "This standalone service is ready for the ANCHOR API modules.", retryable: false } });
}).listen(port, () => console.log(`ANCHOR backend listening on http://localhost:${port}`));
