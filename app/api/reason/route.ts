import OpenAI from 'openai';
import { ExtendedChange } from '../../../types/diff';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
  const { text, language, diffs } = await req.json() as { text: string, language: Language, diffs: ExtendedChange[] };

  try {
    const systemPrompt = 
`You are provided with a text and a set of changes for that text in form of a JSON file.
You are tasked to provide a reason for each change and add the reason to the change object.
Return the JSON of the changes with the reasons.
The language of the text is ${language.name} so provide reasons in that language.
`;
    const userPrompt = 
`Original text:
${text}
JSON of changes:
${JSON.stringify(diffs)}
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });
    console.log(JSON.parse(response.choices[0].message.content!));
    return Response.json(JSON.parse(response.choices[0].message.content!));
  } catch (error) {
    console.error("Error optimizing text:", error);
    return Response.json({ error: "Failed to optimize text" }, { status: 500 });
  }
}