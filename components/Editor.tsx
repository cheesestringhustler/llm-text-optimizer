"use client";
import React, { useState, useEffect } from "react";
import styles from "./Editor.module.scss";
import commonLanguages from "../languages.json";
import TextOutput from './TextOutput';

function Editor() {
    const [text, setText] = useState("She dont likes go too the store on sundays;"); // Initial text input by the user
    const [language, setLanguage] = useState<Language>(commonLanguages[2]); // Selected language, default is English
    const [promptStyle, setPromptStyle] = useState("no-style"); // Style of the prompt
    const [optimizedText, setOptimizedText] = useState<string>(""); // Stores text changes after optimization
    const [activeChangeId, setActiveChangeId] = useState<number | null>(null);
    const [debouncedText, setDebouncedText] = useState(text); // Debounced text for delayed processing
    const adaptLanguage: Boolean = true; // Debug flag to adapt language automatically

    // Language adaptation based on text change, every 3 seconds
    useEffect(() => {
        if (adaptLanguage && text.trim() !== "") {
            const handler = setTimeout(async () => {
                if (text !== debouncedText) {
                    // Fetching language prediction from the server
                    const response = await fetch('/api/language', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ text }),
                    });
                    const data = await response.json();
                    console.log("language prediction:", data);
                    setLanguage(data);
                    setDebouncedText(text);
                }
            }, 3000);
    
            return () => {
                clearTimeout(handler);
            };
        } else {
            setDebouncedText("");
        }
    }, [text, debouncedText]);

    
    // Handler for form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Fetching optimized text from the server
        const response = await fetch('/api/optimize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, language }),
        });
        const changes = await response.json();
        setOptimizedText(changes.optimizedText);
    };

    // Accept all changes handler
    const handleAcceptAll = () => {
        setText(optimizedText); // Update text with optimizedText
    };

    // Reject all changes handler
    const handleRejectAll = () => {
        setOptimizedText(text); // Keep the original text, discard changes
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
                <select className={styles.option} value={language.code} onChange={(e) => setLanguage(commonLanguages.find((lang) => lang.code === e.target.value) as Language)}>
                    {commonLanguages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option> // Mapping language options to select element
                    ))}
                </select>
                {/* Checkbox for Swiss German option */}
                <div className={styles.option}>
                    <label>
                        <input 
                            type="checkbox" 
                            onChange={(e) => setLanguage(commonLanguages.find((lang) => lang.code === (e.target.checked ? "de-ch" : "de")) as Language)} 
                            checked={language.code === "de-ch"} 
                            disabled={language.code !== "de" && language.code !== "de-ch"} />
                        Swiss German
                    </label>
                </div>
            </div>

            {/* Main user interaction to enter text, submit and integrate suggestions */}
            <div className={styles.workarea}>

                <div className={styles.textcontainer}>
                    <form onSubmit={handleSubmit} className={styles.textinput}>
                        <button>Check</button>
                        <textarea value={text} onChange={(e) => setText(e.target.value)}></textarea>
                    </form>
                    
                    {/* Displaying highlighted changes */}
                    <div className={styles.textoutput}>
                        <button onClick={handleAcceptAll}>Accept All</button> {/* Accept all changes */}
                        <button onClick={handleRejectAll}>Reject All</button> {/* Reject all changes */}
                        <TextOutput 
                          text={text} 
                          setText={setText}
                          language={language}
                          optimizedText={optimizedText} 
                          setOptimizedText={setOptimizedText}
                          activeChangeId={activeChangeId} 
                          setActiveChangeId={setActiveChangeId} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Editor;
