import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
  const { text } = await req.json();

  try {
    const systemPrompt = `Return the language in ISO 639-1 format. For example, if the language is English, return "en".`;
    const userPrompt = `${text}`
    const response = await openai.chat.completions.create({
      model: "gpt-3.5",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      temperature: 0.8,
      max_tokens: 4096,
    });
    return Response.json({ optimizedText: response.choices[0].message.content });
  } catch (error) {
    console.error("Error detecting language:", error);
    return Response.json({ error: "Failed to detect language" }, { status: 500 });
  }
}

