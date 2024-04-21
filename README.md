# Updated README for Text Optimizer App

## Running the Application

To run the Text Optimizer App in development mode, use Yarn as the preferred package manager. First, ensure you have Yarn installed on your system. If not, you can install it by following the instructions on the [Yarn website](https://yarnpkg.com/getting-started/install).

Before starting the application, you need to create a [.env.local](file:///Users/manuellampert/ocean/freelance/morrow-ventures/llm-text-optimizer/.env.local#1%2C1-1%2C1) file in the root directory of the project. This file should contain your OpenAI API key, which is required for the text optimization and language detection features to work. Your [.env.local](file:///Users/manuellampert/ocean/freelance/morrow-ventures/llm-text-optimizer/.env.local#1%2C1-1%2C1) file should look like this:

```plaintext
OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

To start the development server, run:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

The Text Optimizer App offers several key features:

- **Text Input for Optimization**: Users can input text that they want to optimize.
- **Language Detection and Adaptation**: The app can detect the language of the input text and adapt the optimization process accordingly.
- **Display of Optimized Text with Highlighted Changes**: After optimization, the app displays the optimized text alongside the original, highlighting the changes made.
- **Selection of Language and Prompt Style for Customization**: Users can select the language and prompt style (formal, informal, or no style) for the text optimization process.
- **Text Length Adjustment**: Users can specify a desired text length, and the app will adjust the text accordingly.

## API Routes

### Optimize Text

The `/api/optimize` route processes the text input by the user and returns optimized text. It accepts parameters such as `text`, `language`, `promptStyle`, and `isGenderNeutral` in the request body.


```7:40:app/api/optimize/route.ts
export async function POST(req: Request, res: Response) {
  const { text, language, promptStyle, isGenderNeutral } = await req.json() as { text: string, language: Language, promptStyle: string, isGenderNeutral: boolean };

  try {
    // Construct system prompt with language and gender neutrality consideration
    let systemPrompt = `Correct the text to have proper spelling, grammar, and punctuation.\nThe language of the text is ${language.name}.\n`;
    if (isGenderNeutral) {
      systemPrompt += "Ensure the text is gender-neutral.\n";
    }

    let userPrompt = `Correct the text to have proper spelling, grammar, and punctuation:\n${text}`;
    switch (promptStyle) {
      case "formal":
        userPrompt = `Please rewrite the following text in a formal writing style. Focus on using standard grammar and complex sentence structures, employ a precise and academic vocabulary, and ensure the tone remains objective and impersonal. Avoid colloquialisms, slang, and contractions, and structure the text with a clear introduction, body, and conclusion. Make sure to include proper spelling, grammar, and punctuation:\n${text}`;
        break;
      case "informal":
        userPrompt = `Please convert the following text into an informal writing style. Use colloquial language, include idioms and contractions, and adopt a personal and subjective tone. The structure should be flexible and conversational. Feel free to adjust grammar and punctuation to suit a more casual and relaxed tone:\n${text}`;
        break;
    }
```


This route uses the OpenAI API to correct spelling, grammar, and punctuation errors, and can adapt the text based on the selected language and prompt style.

### Language Detection

The `/api/language` route detects the language of the input text. It expects a `text` parameter in the request body and returns the detected language in ISO 639-1 format.


```8:27:app/api/language/route.ts
export async function POST(req: Request, res: Response) {
  const { text } = await req.json();

  try {
    const systemPrompt = `Return the language in ISO 639-1 format. For example, if the language is English, return "en".`;
    const userPrompt = `${text}`
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      temperature: 0.8,
      max_tokens: 4096,
    });

    const languageCode = response.choices[0].message.content!;
    const language = commonLanguages.find((lang) => lang.code === languageCode) as Language;
    return Response.json(language);
  } catch (error) {
    console.error("Error detecting language:", error);
    return Response.json({ error: "Failed to detect language" }, { status: 500 });
  }
```

This feature leverages the OpenAI API to analyze the input text and determine its language, which is then used to tailor the text optimization process.

### Text Length Adjustment

The `/api/textlength` route adjusts the length of the input text to meet a specified character count. It accepts parameters such as `text`, `textLength`, and `characterCount` in the request body.

This route uses the OpenAI API to modify the text length while attempting to preserve the original message and tone as closely as possible.

```app/api/language/route.ts
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
      model: "gpt-4-turbo",
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
```