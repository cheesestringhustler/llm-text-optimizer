"use client";
import React, { useState, useEffect } from "react";
import styles from "./Editor.module.scss";
import commonLanguages from "../languages.json";

function Editor() {
    const [text, setText] = useState("");                           // Text input by the user
    const [languageCode, setLanguageCode] = useState("en");         // Selected language, default is English
    const [optimizedText, setOptimizedText] = useState('');         // Text after optimization
    const [promptStyle, setPromptStyle] = useState("no-style");     // Style of the prompt
    const [debouncedText, setDebouncedText] = useState(text);       // Debounced text for delayed processing
    const adaptLanguage: Boolean = true;                            // Debug flag to adapt language automatically

    // Language adaptation based on text change, every 3 seconds
    useEffect(() => {
        if (adaptLanguage && text.trim() !== "") {
            const handler = setTimeout(async () => {
                if (text !== debouncedText) {
                    console.log("text changed");
                    // Fetching language prediction from the server
                    const response = await fetch('/api/language', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ text }),
                    });
                    const data = await response.json();
                    console.log(data);
                    setLanguageCode(data);
                    setDebouncedText(text);
                }
            }, 3000);
    
            return () => {
                clearTimeout(handler);
            };
        }
    }, [text, debouncedText]);

    // Synchronize select element with language state
    useEffect(() => {
        const selectElement = document.querySelector('select');
        if (selectElement) {
            selectElement.value = languageCode;
            const changeLanguageCode = (event: Event) => {
                const target = event.target as HTMLSelectElement;
                setLanguageCode(target.value);
            };
            selectElement.addEventListener('change', changeLanguageCode);
            
            return () => {
                selectElement.removeEventListener('change', changeLanguageCode);
            };
        }
    }, [languageCode]);

    // Handler for form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const languageName = commonLanguages.find((lang) => lang.code === languageCode)?.name;
        // Fetching optimized text from the server
        const response = await fetch('/api/optimize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, languageName }),
        });
        const data = await response.json();
        setOptimizedText(data.optimizedText);
    };

    return (
        <div className={styles.editor}>

            {/* Control parameters to adjust the prompt style and language */}
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

            {/* Main user interaction to enter text, submit and integrate suggestions */}
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
