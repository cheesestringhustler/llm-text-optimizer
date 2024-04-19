import React from 'react';
import styles from "./page.module.scss";
import Editor from "@/components/Editor";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>Spell Checker</h1>
      <Editor />
    </main>
  );
}
