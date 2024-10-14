import OpenAI from 'openai';
import commonLanguages from "../../../languages.json";
import { httpRequestCounter, countTokens } from "../../utils/metrics";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
  const { text } = await req.json();

  try {
    const systemPrompt = `Return the language in ISO 639-1 format with one exception: For texts in Swiss German, return "de-ch". For examples:
    "Hello World!" -> "en"
    "Freundliche Grüsse" -> "de-ch" (Swiss German)
    "Freundliche Grüße" -> "de" (Standard German)
    Make sure to differentiate between "de-ch" for Swiss German and "de" for Standard German.
    Only return the language code, no other text.`;

    const text_excerpt = text.split(/\s+/).slice(0, 20).join(' '); // Get the first 20 words from the text in one line
    const userPrompt = `Return the language code for following text:\n${text_excerpt}`
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      temperature: 0.8,
      max_tokens: 4096,
    });
    console.log(response.choices[0].message.content);
    const languageCode = response.choices[0].message.content;
    if (languageCode !== null) {
      countTokens(systemPrompt, "system", { code: languageCode, name: "null" }, req.url);
      countTokens(userPrompt, "user", { code: languageCode, name: "null" }, req.url);
      countTokens(languageCode, "out", { code: languageCode, name: "null" }, req.url);
      httpRequestCounter.inc({ method: req.method, route: req.url, status_code: 200 });
      const language = commonLanguages.find((lang) => lang.code === languageCode) as Language;
      console.log(Response.json(language));
      return Response.json(language);
    } else {
      httpRequestCounter.inc({ method: req.method, route: req.url, status_code: 500 });
      return Response.json({ error: "No language code available" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error detecting language:", error);
    return Response.json({ error: "Failed to detect language" }, { status: 500 });
  }
}

