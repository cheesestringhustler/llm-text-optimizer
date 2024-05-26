import { NextRequest, NextResponse } from 'next/server';
import client from 'prom-client';
import { httpRequestCounter, tokenCounter } from "../../utils/metrics";
// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'nextjs-app',
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Register the custom metric
register.registerMetric(httpRequestCounter);
register.registerMetric(tokenCounter);

export async function GET(req: NextRequest) {
  // Increment the counter for each request
  httpRequestCounter.inc({ method: req.method, route: req.url, status_code: 200 });

  const metrics = await register.metrics();
  return new NextResponse(metrics, {
    headers: { 'Content-Type': register.contentType },
  });
}