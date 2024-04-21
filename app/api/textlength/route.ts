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
    let systemPrompt = `Adjusting the length of the text. Make sure to keep the tone and structure of the text the same. Do not make any spelling or grammar mistakes. Only return the text.`;
    
    const adjustment = Math.abs(textLength) / 100;
    const newCharacterCount = textLength > 0 ? Math.round(characterCount * (adjustment + 1)) : Math.round(characterCount * (1 - adjustment));
    const userPrompt = `The current character count is ${characterCount}. Please adjust the text to have a character count of ${newCharacterCount}:\n${text}`;

    // console.log("systemPrompt: "+systemPrompt);
    // console.log("userPrompt: "+userPrompt);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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