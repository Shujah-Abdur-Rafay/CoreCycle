import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// ─── OpenAI Chat proxy ────────────────────────────────────────────────────────
// Server-side proxy for OpenAI Chat Completions. Keeps the API key OFF the client
// (browsers can't call api.openai.com directly — CORS — and a VITE_ key would be
// exposed in the bundle). Used by the AI course generator and quiz generator.
//
// Set the key once with:  supabase secrets set OPENAI_API_KEY=sk-...

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatRequest {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  models?: string[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

const DEFAULT_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  if (!OPENAI_API_KEY) {
    return json(
      { error: 'OpenAI API key is not configured on the server. Set the OPENAI_API_KEY secret.' },
      500
    );
  }

  let payload: ChatRequest;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const { messages, temperature = 0.6, maxTokens = 8000, jsonMode = true } = payload;
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'Missing required field: messages.' }, 400);
  }

  const models =
    Array.isArray(payload.models) && payload.models.length > 0
      ? payload.models.filter(Boolean)
      : DEFAULT_MODELS;

  let lastError = 'unknown';

  for (const model of models) {
    try {
      const body: Record<string, unknown> = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      };
      if (jsonMode) body.response_format = { type: 'json_object' };

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // Rate limited — try the next model
      if (response.status === 429) {
        lastError = `Rate limit (429) on model ${model}`;
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        lastError = `OpenAI API error (${response.status}) on ${model}: ${errorBody}`;
        // Account-level quota/billing/auth issues won't be fixed by another model
        if (
          response.status === 401 ||
          response.status === 402 ||
          errorBody.includes('insufficient_quota') ||
          errorBody.includes('billing')
        ) {
          break;
        }
        continue;
      }

      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content ?? '';
      return json({ content, model });
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }

  return json({ error: `AI request failed after trying all available models. Last error: ${lastError}` }, 502);
});
