import React from 'react';
import styles from "./page.module.scss";
import Editor from "@/components/Editor";

export default function Home() {
  return (
    <main className="container mx-auto px-4 max-w-[1000px]">
      <h1 className="text-2xl font-bold m-4 mt-12">Text Optimizer</h1>
      <p className="text-sm ms-4">This tool will help you optimize your text for better readability. It checks for spelling grammar and punctuation erros and suggests fixes. Optionally you can choose a style to the text to be formal or informal. Set the text to be gender neutral, and adjust the length of the text.</p>
      <p className="text-sm ms-4 mb-12">Results are not guaranteed and my vary at times.</p>
      <Editor />
      <footer className="text-center text-sm text-gray-500 mt-12 pt-12 text-xs dark:text-slate-500">
        <ul className="text-center">
          <li>This site does not store any data.</li>
          <li>Text is sent to the OpenAI API, adhering to its <u><a href="https://openai.com/policies" target="_blank" rel="noopener noreferrer">policies</a></u>.</li>
          <li>Schwiizerdütsch is finetuned on <u><a href="https://mtc.ethz.ch/publications/open-source/swiss-dial.html" target="_blank" rel="noopener noreferrer">SwissDial Dataset</a></u>.</li>
        </ul>
      </footer>
    </main>
  );
}
