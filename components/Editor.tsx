"use client";
import React, { useState, useEffect } from "react";
import styles from "./Editor.module.scss";

function Editor() {
    const [text, setText] = useState("I'll finished reeding the book.");
    const [language, setLanguage] = useState("en");
    const [optimizedText, setOptimizedText] = useState('');
    const [promptStyle, setPromptStyle] = useState("no-style");
    const [debouncedText, setDebouncedText] = useState(text);
    const adaptLanguage: Boolean = true;

    useEffect(() => {
        if (adaptLanguage) {
            const handler = setTimeout(() => {
                if (text.substring(0, 20) !== debouncedText.substring(0, 20)) {
                    console.log("text changed");
                    setDebouncedText(text);
                }
            }, 3000);
    
            return () => {
                clearTimeout(handler);
            };
        }
    }, [text, debouncedText]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await fetch('/api/optimize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, language: 'en' }), // Change 'en' to desired language code
        });
        const data = await response.json();
        setOptimizedText(data.optimizedText);
    };

    return (
        <div className={styles.editor}>
            <div className={styles.controls}>
                <label className={styles.option}>
                    <input type="checkbox" defaultChecked />
                    Spellchecking
                </label>
                <div className={styles.option}>
                    <button className={promptStyle === "no-style" ? styles.active : ""} onClick={() => setPromptStyle("no-style")}>No Style</button>
                    <button className={promptStyle === "formal" ? styles.active : ""} onClick={() => setPromptStyle("formal")}>Formal</button>
                    <button className={promptStyle === "informal" ? styles.active : ""} onClick={() => setPromptStyle("informal")}>Informal</button>
                </div>
                <select className={styles.option}>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                </select>
            </div>

            <div className={styles.workarea}>
                <form onSubmit={handleSubmit} className={styles.textarea}>
                    <textarea value={text} onChange={(e) => setText(e.target.value)}></textarea>
                    <button>Check</button>
                </form>

                {optimizedText && <div><h2>Optimized Text</h2><p>{optimizedText}</p></div>}

                <div className={styles.suggestions}>
                    <ul>
                        <li>Suggestion 1</li>
                        <li>Suggestion 2</li>
                        <li>Suggestion 3</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Editor;


