import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.ORGANIZATION,
    project: process.env.PROJECT,
});

interface RequestBody {
  text: string;
  textLength: number;
  characterCount: number;
  language: Language;
}

export async function POST(req: Request, res: Response) {
  const { text, textLength, characterCount, language }: RequestBody = await req.json() as RequestBody;

  try {
    // Construct system prompt with language and gender neutrality consideration
    let systemPrompt = `Adjusting the length of the text. Make sure to keep the tone and structure of the text the same. Do not make any spelling or grammar mistakes. Keep the language ${language.name} as is. Only return the text.`;
    if (language.code.startsWith("de") || language.code.startsWith("ch")) {
      systemPrompt = `Anpassen der Textlänge. Achten Sie darauf, dass Ton und Struktur des Textes gleich bleiben. Machen Sie keine Rechtschreib- oder Grammatikfehler. Geben Sie nur den Text zurück.`;
    }
    
    const adjustment = Math.abs(textLength) / 100;
    const newCharacterCount = textLength > 0 ? Math.round(characterCount * (adjustment + 1)) : Math.round(characterCount * (1 - adjustment));
    let userPrompt = `The current character count is ${characterCount}. Please adjust the text to have a character count of ${newCharacterCount}:\n${text}`;
    if (language.code.startsWith("de") || language.code.startsWith("ch")) {
      userPrompt = `Der aktuelle Zeichenanzahl ist ${characterCount}. Bitte ändern Sie den Text so, dass er eine Zeichenanzahl von ${newCharacterCount} hat:\n${text}`;
    }

    
    let modelName = "gpt-3.5-turbo";
    if (language.code === "ch-de") {
      modelName = "ft:gpt-3.5-turbo-0125:personal:swissgerman-ch-gr:9GY53JbZ";
    }

    const response = await openai.chat.completions.create({
      model: modelName,
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