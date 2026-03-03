import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const RISK_PROMPT = `你是一個品牌回覆安全審核員。
請審核以下草稿回覆是否存在以下風險：
1. 包含具體承諾（如：保證退款、一定有貨）
2. 洩露敏感業務資訊
3. 不當用語或歧視性內容
4. 誤導性宣稱

請以 JSON 格式回應：{"safe": true/false, "reason": "說明原因（若安全則填 OK）"}`;

export async function reviewRisk(draft: string): Promise<{ safe: boolean; reason: string }> {
  const resp = await getClient().chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: RISK_PROMPT },
      { role: 'user', content: draft },
    ],
  });
  try {
    return JSON.parse(resp.choices[0].message.content || '{}');
  } catch {
    return { safe: false, reason: 'JSON parse error' };
  }
}
