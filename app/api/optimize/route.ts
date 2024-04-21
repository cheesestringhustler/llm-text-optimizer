import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RequestBody {
  text: string;
  language: Language;
  promptStyle: string;
  isGenderNeutral: boolean;
  textLength: number;
}

export async function POST(req: Request, res: Response) {
  const { text, language, promptStyle, isGenderNeutral, textLength }: RequestBody = await req.json() as RequestBody;

  try {
    // Construct system prompt with language and gender neutrality consideration
    let systemPrompt = `Correct the text to have proper spelling, grammar, and punctuation.\nThe language of the text is ${language.name}.\n`;
    if (isGenderNeutral) {
      systemPrompt += "Ensure the text is gender-neutral.\n";
    }

    let userPrompt = `Correct the text to have proper spelling, grammar, and punctuation:\n${text}`;
    // Adjust prompt based on style
    switch (promptStyle) {
      case "formal":
        userPrompt = `Please rewrite the following text in a formal writing style. Focus on using standard grammar and complex sentence structures, employ a precise and academic vocabulary, and ensure the tone remains objective and impersonal. Avoid colloquialisms, slang, and contractions, and structure the text with a clear introduction, body, and conclusion. Make sure to include proper spelling, grammar, and punctuation:\n${text}`;
        break;
      case "informal":
        userPrompt = `Please convert the following text into an informal writing style. Use colloquial language, include idioms and contractions, and adopt a personal and subjective tone. The structure should be flexible and conversational. Feel free to adjust grammar and punctuation to suit a more casual and relaxed tone:\n${text}`;
        break;
    }

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