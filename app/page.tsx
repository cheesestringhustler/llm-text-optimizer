import React from 'react';
import styles from "./page.module.scss";
import Editor from "@/components/Editor";

export default function Home() {
  return (
    <main className="container mx-auto px-4">
      <h1 className="text-2xl font-bold m-4 mt-12">Text Optimizer</h1>
      <p className="text-sm m-4 mb-12">This tool will help you optimize your text for better readability. It checks for spelling grammar and punctuation erros and suggests fixes. Optionally you can choose a style to the text to be formal or informal.</p>
      <Editor />
    </main>
  );
}
