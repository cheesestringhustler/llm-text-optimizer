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
Provide the text changes in JSON. The offset describes the start of the change and length describes the length of the change each value is based on the amount of characters.
Example 1:
the mans car who's parked outside looks very old and rusty and he never seem to care.
Returned JSON:
{
  "changes": [
    {
      "message": "Capitalize the first word of a sentence.",
      "type": "Capitalization",
      "replacements": [
        {
          value: "The"
        }
      ],
      "offset": 0,
      "length": 3
    },
    {
      "message": "'mans' refers to the verb 'man' meaning take command of something. Did you mean “men” or “man's”?",
      "type": "Grammar",
      "replacements": [
        {
          value: "men"
        },
        {
          value: "man's"
        }
      ],
      "offset": 4,
      "length": 4
    },
    {
      "message": "There might be a mistake here.",
      "type": "Grammar",
      "replacements": [
        {
          value: "thats's"
        }
      ],
      "offset": 13,
      "length": 5
    },
    {
      "message": "Use a comma before 'and' if it connects two independent clauses (unless they are closely connected and short).",
      "type": "Punctuation",
      "replacements": [
        {
          value: ", and"
        }
      ],
      "offset": 58,
      "length": 4
    },
    {
      "message": "Ensure subjects and verbs match in plurality.",
      "type": "Grammar",
      "replacements": [
        {
          value: "seems"
        }
      ],
      "offset": 72,
      "length": 4
    }
  ]
}
Example 2:
her dog always bark at the mailman, it scares everyone in the hous.
Returned JSON:
{
  "changes": [
    {
      "message": "Capitalize the first word of a sentence.",
      "type": "Capitalization",
      "replacements": [
        {
          value: "Her"
        }
      ],
      "offset": 0,
      "length": 3
    },
    {
      "message": "Ensure subjects and verbs match in plurality.",
      "type": "Grammar",
      "replacements": [
        {
          value: "barks"
        }
      ],
      "offset": 15,
      "length": 4
    },
    {
      "message": "There might be a mistake here.",
      "type": "Grammar",
      "replacements": [
        {
          value: "which"
        }
      ],
      "offset": 36,
      "length": 2
    },
    {
      "message": "Spelling mistake found.",
      "type": "Spelling",
      "replacements": [
        {
          value: "house"
        }
      ],
      "offset": 62,
      "length": 4
    }
  ]
}
`;
    const userPrompt = `Correct the text to have proper spelling, grammar and punctation:
${text}`
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      temperature: 1.0,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });
    return Response.json(JSON.parse(response.choices[0].message.content!) as OptimizedText);
  } catch (error) {
    console.error("Error optimizing text:", error);
    return Response.json({ error: "Failed to optimize text" }, { status: 500 });
  }
}