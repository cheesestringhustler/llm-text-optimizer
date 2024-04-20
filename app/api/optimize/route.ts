import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
  const { text, language } = await req.json();

  try {
    const systemPrompt = `The user will provide a text. Correct the text to have proper spelling, grammar and punctation.\n
    If the text varies from ${language} adapt it accordingly.
    Provide the text changes in JSON, for example for the sentence: "She dont likes go too the store on sundays;" return:
    "changes": [
            {
                "message": "Possible spelling mistake found.",
                "type": "Spelling",
                "replacements": [
                    {
                        "value": "don't"
                    }
                ],
                "offset": 4,
                "length": 4,
            },
            {
                "message": "The verb “go” needs to be in the to-infinitive form.",
                "type": "Grammar",
                "replacements": [
                    {
                        "value": "likes to go"
                    }
                ],
                "offset": 9,
                "length": 8,
            },
            {
                "message": "Possible spelling mistake found.",
                "type": "Spelling",
                "replacements": [
                    {
                        "value": "Sundays"
                    }
                ],
                "offset": 35,
                "length": 7,
            },
            {
              "message": "Possible punctuation mistake found.",
              "type": "Punctuation",
              "replacements": [
                  {
                      "value": "."
                  }
              ],
              "offset": 42,
              "length": 1,
          }
    ]`;
    const userPrompt = `${text}`
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      temperature: 0.8,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });
    return Response.json(JSON.parse(response.choices[0].message.content!) as OptimizedText);
  } catch (error) {
    console.error("Error optimizing text:", error);
    return Response.json({ error: "Failed to optimize text" }, { status: 500 });
  }
}

