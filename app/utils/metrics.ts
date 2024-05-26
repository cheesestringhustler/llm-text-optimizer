import { Counter } from 'prom-client';
import { get_encoding } from "tiktoken";

export const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const tokenCounter = new Counter({
  name: 'token_total',
  help: 'Total number of tokens in a request',
  labelNames: ['tokens', 'type', 'language', 'route'],
});

export async function countTokens(text: string, type: "system" | "user" | "out", language: Language, route: string) {
  const encoding = get_encoding("cl100k_base");
  const encodedText = encoding.encode(text);
  tokenCounter.inc({ tokens: encodedText.length, type: type, language: language.code, route: route });
}

