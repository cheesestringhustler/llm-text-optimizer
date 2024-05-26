import OpenAI from 'openai';
import { httpRequestCounter, countTokens } from "../../utils/metrics";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.ORGANIZATION,
  project: process.env.PROJECT,
});

interface RequestBody {
  text: string;
  language: Language;
  promptStyle: string;
  isGenderNeutral: boolean;
}

export async function POST(req: Request, res: Response) {
  const { text, language, promptStyle, isGenderNeutral }: RequestBody = await req.json() as RequestBody;

  try {
    // Construct system prompt with language and gender neutrality consideration
    let systemPrompt = `Correct the text to have proper spelling, grammar, and punctuation.\nThe language of the text is ${language.name}.\n`;
    if (isGenderNeutral) {
      systemPrompt += "Ensure the text is gender-neutral.\n";
    }

    // Provide German instructions if the language code starts with 'de' but not if the language start with 'de-ch' because the finetuned model had english system instruction
    if (language.code.startsWith("de") || language.code.startsWith("ch")) {
      systemPrompt = `Korrigieren Sie den Text, um eine korrekte Rechtschreibung, Grammatik und Zeichensetzung zu gewährleisten.\nDie Sprache des Textes ist ${language.name}.\n`;
      if (isGenderNeutral) {
        systemPrompt += "Stellen Sie sicher, dass der Text geschlechtsneutral ist.\n";
      }
    }
    
    let userPrompt = language.code.startsWith("de") || language.code.startsWith("ch") ?
    `Korrigieren Sie den Text, um die richtige Rechtschreibung, Grammatik und Zeichensetzung zu gewährleisten:\n${text}` :
    `Correct the text to have proper spelling, grammar, and punctuation:\n${text}`;

    // Adjust prompt based on style and language
    switch (promptStyle) {
      case "formal":
        userPrompt = language.code.startsWith("de") || language.code.startsWith("ch") ?
          `Bitte schreiben Sie den folgenden Text in einem formellen Schreibstil um. Konzentrieren Sie sich auf die Verwendung von Standardgrammatik und komplexen Satzstrukturen, verwenden Sie einen präzisen und akademischen Wortschatz und stellen Sie sicher, dass der Ton objektiv und unpersönlich bleibt. Vermeiden Sie umgangssprachliche Ausdrücke, Umgangssprache und Abkürzungen und strukturieren Sie den Text mit einer klaren Einleitung, einem Hauptteil und einem Schluss. Achten Sie auf die richtige Rechtschreibung, Grammatik und Zeichensetzung:\n${text}` :
          `Please rewrite the following text in a formal writing style. Focus on using standard grammar and complex sentence structures, employ a precise and academic vocabulary, and ensure the tone remains objective and impersonal. Avoid colloquialisms, slang, and contractions, and structure the text with a clear introduction, body, and conclusion. Make sure to include proper spelling, grammar, and punctuation:\n${text}`;
        break;
      case "informal":
        userPrompt = language.code.startsWith("de") || language.code.startsWith("ch") ?
          `Bitte wandeln Sie den folgenden Text in einen informellen Schreibstil um. Verwenden Sie umgangssprachliche Ausdrücke, fügen Sie Redewendungen und Kontraktionen hinzu und nehmen Sie einen persönlichen und subjektiven Ton an. Die Struktur sollte flexibel und gesprächsartig sein. Fühlen Sie sich frei, Grammatik und Zeichensetzung anzupassen, um einen lockereren und entspannteren Ton zu erreichen:\n${text}` :
          `Please convert the following text into an informal writing style. Use colloquial language, include idioms and contractions, and adopt a personal and subjective tone. The structure should be flexible and conversational. Feel free to adjust grammar and punctuation to suit a more casual and relaxed tone:\n${text}`;
        break;
    }

    // console.log("systemPrompt: "+systemPrompt);
    // console.log("userPrompt: "+userPrompt);

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

    countTokens(systemPrompt, "system", language, req.url);
    countTokens(userPrompt, "user", language, req.url);
    if (response.choices[0].message.content !== null) {
      countTokens(response.choices[0].message.content, "out", language, req.url);  
      httpRequestCounter.inc({ method: req.method, route: req.url, status_code: 200 });
      return Response.json({ optimizedText: response.choices[0].message.content });
    } else {
      httpRequestCounter.inc({ method: req.method, route: req.url, status_code: 500 });
      return Response.json({ error: "No content available" }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error optimizing text:", error);
    return Response.json({ error: "Failed to optimize text" }, { status: 500 });
  }
}