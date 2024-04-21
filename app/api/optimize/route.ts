import OpenAI from 'openai';

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
  // Destructure and parse request body
  const { text, language, promptStyle } = await req.json() as { text: string, language: Language, promptStyle: string };

  try {
    // System prompt to guide the AI
    const systemPrompt = `Correct the text to have proper spelling, grammar, and punctuation.\nThe language of the text is ${language.name}.\n`;

    // Generate user prompt based on the selected style
    let userPrompt = `Correct the text to have proper spelling, grammar, and punctuation:\n${text}`;
    switch (promptStyle) {
      case "formal":
        userPrompt = `Please rewrite the following text in a formal writing style. Focus on using standard grammar and complex sentence structures, employ a precise and academic vocabulary, and ensure the tone remains objective and impersonal. Avoid colloquialisms, slang, and contractions, and structure the text with a clear introduction, body, and conclusion. Make sure to include proper spelling, grammar, and punctuation:\n${text}`;
        break;
      case "informal":
        userPrompt = `Please convert the following text into an informal writing style. Use colloquial language, include idioms and contractions, and adopt a personal and subjective tone. The structure should be flexible and conversational. Feel free to adjust grammar and punctuation to suit a more casual and relaxed tone:\n${text}`;
        break;
    }

    // Request a completion from OpenAI's API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      temperature: 0.7,
      max_tokens: 4096,
    });

    // Return the optimized text as JSON
    return Response.json({ optimizedText: response.choices[0].message.content });
  } catch (error) {
    // Log and return error if optimization fails
    console.error("Error optimizing text:", error);
    return Response.json({ error: "Failed to optimize text" }, { status: 500 });
  }
}