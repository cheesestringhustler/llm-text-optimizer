import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RequestBody {
  text: string;
  textLength: number;
  characterCount: number;
}

export async function POST(req: Request, res: Response) {
  const { text, textLength, characterCount }: RequestBody = await req.json() as RequestBody;

  try {
    // Construct system prompt with language and gender neutrality consideration
    let systemPrompt = `You focus on adjusting the length of the text. Make sure to keep the tone and structure of the text the same. Do not make any spelling or grammar mistakes.`;
    
    const adjustment = Math.abs(textLength) / 100;
    const newCharacterCount = Math.round(characterCount * adjustment);
    // const direction = textLength > 0 ? `longer by ${adjustment}%` : `shorter by ${adjustment}%`;
    // const userPrompt = `Please make this text ${direction}:\n${text}`;
    const userPrompt = `The current character count is ${characterCount}. Please adjust the text to have a character count of ${newCharacterCount}:\n${text}`;

    console.log("systemPrompt: "+systemPrompt);
    console.log("userPrompt: "+userPrompt);

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