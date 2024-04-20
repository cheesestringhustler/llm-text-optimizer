import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
  const { text, language } = await req.json();

  try {
const systemPrompt = `
Correct the text to have proper spelling, grammar and punctation.
If the text varies from ${language} adapt it accordingly.
`;
    const userPrompt = `Correct the text to have proper spelling, grammar and punctation:
${text}`
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      temperature: 0.7,
      max_tokens: 4096,
    });
    return Response.json({ optimizedText: response.choices[0].message.content });
  } catch (error) {
    console.error("Error optimizing text:", error);
    return Response.json({ error: "Failed to optimize text" }, { status: 500 });
  }
}