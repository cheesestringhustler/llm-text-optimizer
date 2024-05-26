import React from 'react';
import styles from "./page.module.scss";
import Editor from "@/components/Editor";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen"> {/* Ensure the container takes at least the full height of the screen */}
      <main className="container mx-auto px-4 max-w-[1000px] flex-grow"> {/* Flex-grow allows main content to grow and push footer down */}
        <h1 className="text-2xl font-bold m-4 mt-12">Text Optimizer</h1>
        <p className="text-sm ms-4">This tool will help you optimize your text for better readability. It checks for spelling, grammar, and punctuation errors and suggests fixes. Optionally, you can choose a style for the text to be formal or informal. Set the text to be gender-neutral and adjust the length as needed.</p>
        <p className="text-sm ms-4 mb-12">Results are not guaranteed and may vary at times.</p>
        <Editor />
      </main>
      <footer className="container mx-auto px-4 pt-4 max-w-[1000px] text-sm text-gray-500 mt-12 mb-5 text-xs dark:text-slate-500 w-full border-t border-gray-200 dark:border-slate-7000"> {/* Footer is always at the bottom */}
          <span>This site does not store any data; text is sent to the OpenAI API, adhering to its <u><a href="https://openai.com/policies" target="_blank" rel="noopener noreferrer">policies</a></u>, and Schwiizerdtsch is finetuned on the <u><a href="https://mtc.ethz.ch/publications/open-source/swiss-dial.html" target="_blank" rel="noopener noreferrer">SwissDial Dataset</a></u>.</span>
      </footer>
    </div>
  );
}
