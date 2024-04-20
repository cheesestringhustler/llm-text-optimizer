# Text Optimizer App

This project is a Next.js application designed to optimize text by correcting spelling, grammar, and punctuation errors. It leverages the OpenAI API to analyze and suggest improvements to the text input by the user.

## Features

- Text input for optimization
- Language detection and adaptation
- Display of optimized text with highlighted changes
- Selection of language and prompt style for customization

## Getting Started

To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Contains the main application components and pages.
- `components/`: Reusable components like `Editor`, `Controls`, and `Popover`.
- `public/`: Static assets like images and icons.
- `styles/`: SCSS modules for styling components.
- `types/`: TypeScript interfaces and types for structured data.
- `api/`: Backend API routes for language detection and text optimization.

## Key Components

### Editor

The `Editor` component allows users to input text for optimization. It displays the optimized text with changes highlighted.


```157:184:components/Editor.tsx
function Editor() {
            ...
            </div>

            {/* Main user interaction to enter text, submit and integrate suggestions */}
            <div className={styles.workarea}>

                <div className={styles.textcontainer}>
                    <form onSubmit={handleSubmit} className={styles.textinput}>
                        <textarea value={text} onChange={(e) => setText(e.target.value)}></textarea>
                        <button>Check</button>
                    </form>
                    
                    {/* Displaying highlighted changes */}
                    <div className={styles.textoutput}>
                        {renderDetailedDiff()}
                    </div>
                </div>

                {/* Listing the possible changes */}
                <div className={styles.optimizations}>
                    <ul>
                    </ul>
                </div>
            </div>
        </div>
    );
}
```


### Controls

`Controls` provide options to adjust the prompt style and language for text optimization.


```44:67:components/Controls.tsx
function Controls({ text, setText, languageCode, setLanguageCode, promptStyle, setPromptStyle }: ControlsProps) {
    ...
    return (
            <div className={styles.controls}>
                <div className={styles.option}>
                    <button className={promptStyle === "no-style" ? styles.active : ""} onClick={() => setPromptStyle("no-style")}>No Style</button>
                    <button className={promptStyle === "formal" ? styles.active : ""} onClick={() => setPromptStyle("formal")}>Formal</button>
                    <button className={promptStyle === "informal" ? styles.active : ""} onClick={() => setPromptStyle("informal")}>Informal</button>
                </div>
                <select className={styles.option} value={languageCode} onChange={(e) => setLanguageCode(e.target.value)}>
                    {commonLanguages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option> // Mapping language options to select element
                    ))}
                </select>
                {/* Checkbox for Swiss German option */}
                <div className={styles.option}>
                    <label>
                        <input type="checkbox" onChange={(e) => setLanguageCode(e.target.checked ? "de-ch" : "de")} checked={languageCode === "de-ch"} disabled={languageCode !== "de" && languageCode !== "de-ch"} />
                        Swiss German
                    </label>
                </div>
            </div>
    );
}
```


### Popover

Displays messages or suggestions when hovering over highlighted text changes.


```9:16:components/Popover.tsx
const Popover: React.FC<PopoverProps> = ({ message }) => {
    return (
        <div className={styles.popover}>
            <p>{message}</p>
            {/* <button onClick={onAccept}>Accept</button> */}
        </div>
    );
};
```


## API Routes

### Optimize Text

Processes the text input by the user and returns optimized text.


```7:28:app/api/optimize/route.ts
export async function POST(req: Request, res: Response) {
  const { text, language } = await req.json();

  try {
const systemPrompt = `
Correct the text to have proper spelling, grammar and punctation.
If the text varies from ${language} adapt it accordingly.
`;
    const userPrompt = `Correct the text to have proper spelling, grammar and punctation:
${text}`
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


### Language Detection

Detects the language of the input text.


```7:25:app/api/language/route.ts
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
    
    return Response.json(response.choices[0].message.content);
  } catch (error) {
    console.error("Error detecting language:", error);
    return Response.json({ error: "Failed to detect language" }, { status: 500 });
  }
}
```


## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

## Contributing

Contributions are welcome! Please check out the [Next.js GitHub repository](https://github.com/vercel/next.js/) for guidelines on contributing.

## License

This project is open-source and available under the MIT license.