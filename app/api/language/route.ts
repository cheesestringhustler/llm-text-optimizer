import OpenAI from 'openai';
import commonLanguages from "../../../languages.json";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
  const { text } = await req.json();

  try {
    const systemPrompt = `Return the language in ISO 639-1 format. For example, if the language is English, return "en".`;
    const userPrompt = `Return the language in ISO 639-1 format for following text:\n${text}`
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      temperature: 0.8,
      max_tokens: 4096,
    });

    const languageCode = response.choices[0].message.content!;
    const language = commonLanguages.find((lang) => lang.code === languageCode) as Language;
    return Response.json(language);
  } catch (error) {
    console.error("Error detecting language:", error);
    return Response.json({ error: "Failed to detect language" }, { status: 500 });
  }
}

