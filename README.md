# Text Optimizer App

The Text Optimizer App is designed to enhance text readability by correcting spelling, grammar, and punctuation errors. It also offers customization options such as adjusting text length, style, and ensuring gender neutrality. A notable feature is its support for Swiss German, providing tailored optimizations for this dialect.

## Installation and Setup

1. **Clone the repository:**

   Use Git to clone the app's repository to your local machine.

   ```bash
   git clone https://github.com/your-username/llm-text-optimizer.git
   ```

2. **Install dependencies:**

   Navigate to the project directory and install the necessary dependencies using Yarn.

   ```bash
   cd llm-text-optimizer
   yarn install
   ```

3. **API Key Configuration:**

   You need an OpenAI API key to use the text optimization features. Create a `.env.local` file in the root directory and add your OpenAI API key as follows:

   ```plaintext
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   Replace `your_openai_api_key_here` with your actual OpenAI API key.

## Running the Application

To start the development server, run:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Text Optimization:** Corrects spelling, grammar, and punctuation errors.
- **Language Support:** Special focus on Swiss German for tailored optimizations.
- **Customization:** Adjust text length, style (formal/informal), and ensure gender neutrality.

## API Endpoints

### Optimize Text

- **Endpoint:** `/api/optimize`
- **Method:** `POST`
- **Description:** Processes text input and returns optimized text.
- **Request Body:**

  ```json
  {
    "text": "Your text here",
    "language": "de-ch",
    "promptStyle": "formal",
    "isGenderNeutral": true,
    "textLength": 100
  }
  ```

- **Prompting Technique:**

  The endpoint constructs a system prompt considering language, gender neutrality, and Swiss German examples if applicable. It then uses the OpenAI API to generate optimized text.

  For Swiss German this endpoint uses a fine-tuned gpt-3.5-turbo-0125 model trained on a subset of the dataset provided by: https://mtc.ethz.ch/publications/open-source/swiss-dial.html.
  The preprocessed dataset can be found in the file swissgerman-data-ch_gr.jsonl.
  
```app/api/optimize/route.ts
[   export async function POST(req: Request, res: Response) {
      const { text, language, promptStyle, isGenderNeutral, textLength }: RequestBody = await req.json() as RequestBody;

      try {
        // Construct system prompt with language and gender neutrality consideration
        let systemPrompt = `Correct the text to have proper spelling, grammar, and punctuation.\nThe language of the text is ${language.name}.\n`;
        if (isGenderNeutral) {
          systemPrompt += "Ensure the text is gender-neutral.\n";
        }

        // Provide German instructions if the language code starts with 'de' but not if the language start with 'de-ch' because the finetuned model had english system instruction
        if (language.code.startsWith("de")) {
          systemPrompt = `Korrigieren Sie den Text, um eine korrekte Rechtschreibung, Grammatik und Zeichensetzung zu gewährleisten.\nDie Sprache des Textes ist ${language.name}.\n`;
          if (isGenderNeutral) {
            systemPrompt += "Stellen Sie sicher, dass der Text geschlechtsneutral ist.\n";
          }
        }
        
        let userPrompt = language.code.startsWith("de") ?
        `Korrigieren Sie den Text, um die richtige Rechtschreibung, Grammatik und Zeichensetzung zu gewährleisten:\n${text}` :
        `Correct the text to have proper spelling, grammar, and punctuation:\n${text}`;

        // Adjust prompt based on style and language
        switch (promptStyle) {
          case "formal":
            userPrompt = language.code.startsWith("de") ?
              `Bitte schreiben Sie den folgenden Text in einem formellen Schreibstil um. Konzentrieren Sie sich auf die Verwendung von Standardgrammatik und komplexen Satzstrukturen, verwenden Sie einen präzisen und akademischen Wortschatz und stellen Sie sicher, dass der Ton objektiv und unpersönlich bleibt. Vermeiden Sie umgangssprachliche Ausdrücke, Umgangssprache und Abkürzungen und strukturieren Sie den Text mit einer klaren Einleitung, einem Hauptteil und einem Schluss. Achten Sie auf die richtige Rechtschreibung, Grammatik und Zeichensetzung:\n${text}` :
              `Please rewrite the following text in a formal writing style. Focus on using standard grammar and complex sentence structures, employ a precise and academic vocabulary, and ensure the tone remains objective and impersonal. Avoid colloquialisms, slang, and contractions, and structure the text with a clear introduction, body, and conclusion. Make sure to include proper spelling, grammar, and punctuation:\n${text}`;
            break;
          case "informal":
            userPrompt = language.code.startsWith("de") ?
              `Bitte wandeln Sie den folgenden Text in einen informellen Schreibstil um. Verwenden Sie umgangssprachliche Ausdrücke, fügen Sie Redewendungen und Kontraktionen hinzu und nehmen Sie einen persönlichen und subjektiven Ton an. Die Struktur sollte flexibel und gesprächsartig sein. Fühlen Sie sich frei, Grammatik und Zeichensetzung anzupassen, um einen lockereren und entspannteren Ton zu erreichen:\n${text}` :
              `Please convert the following text into an informal writing style. Use colloquial language, include idioms and contractions, and adopt a personal and subjective tone. The structure should be flexible and conversational. Feel free to adjust grammar and punctuation to suit a more casual and relaxed tone:\n${text}`;
            break;
        }

        // console.log("systemPrompt: "+systemPrompt);
        // console.log("userPrompt: "+userPrompt);

        let modelName = "gpt-3.5-turbo";
        if (language.code === "de-ch") {
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
    }](app/api/optimize/route.ts)
```


### Language Detection

- **Endpoint:** `/api/language`
- **Method:** `POST`
- **Description:** Detects the language of the input text.
- **Request Body:**

  ```json
  {
    "text": "Your text here"
  }
  ```

- **Prompting Technique:**

  The endpoint uses a system prompt to request the language in ISO 639-1 format from the OpenAI API based on the input text.

  
```app/api/language/route.ts
[    export async function POST(req: Request, res: Response) {
      const { text } = await req.json();

      try {
        const systemPrompt = `Return the language in ISO 639-1 format. For example, if the language is English, return "en".`;
        const userPrompt = `${text}`
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: \[{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }\],
          temperature: 0.8,
          max_tokens: 4096,
        });

        const languageCode = response.choices\[0\].message.content!;
        const language = commonLanguages.find((lang) => lang.code === languageCode) as Language;
        return Response.json(language);
      } catch (error) {
        console.error("Error detecting language:", error);
        return Response.json({ error: "Failed to detect language" }, { status: 500 });
      }
    }](app/api/language/route.ts)
```


### Text Length Adjustment

- **Endpoint:** `/api/textlength`
- **Method:** `POST`
- **Description:** Adjusts the length of the input text.
- **Request Body:**

  ```json
  {
    "text": "Your text here",
    "textLength": 150,
    "characterCount": 120
  }
  ```

- **Prompting Technique:**

  Constructs a prompt focusing on adjusting the text length while maintaining tone and structure.

  
```app/api/textlength/route.ts
[   export async function POST(req: Request, res: Response) {
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
    }](app/api/textlength/route.ts)
```

This app leverages the power of OpenAI's GPT models to optimize text, with a special focus on supporting Swiss German dialect, making it a versatile tool for text optimization needs.