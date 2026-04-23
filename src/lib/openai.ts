import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not set. Copy .env.local.example to .env.local and add your key.",
      );
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

export const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
