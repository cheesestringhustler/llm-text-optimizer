"use client";
import React, { useState, useEffect, useCallback, Fragment } from "react";
import styles from "./Editor.module.scss";
import commonLanguages from "../languages.json";
import Popover from './Popover';

function Editor() {
    const [text, setText] = useState("She dont likes go too the store on sundays;"); // Text input by the user
    const [languageCode, setLanguageCode] = useState("en"); // Selected language, default is English
    const [promptStyle, setPromptStyle] = useState("no-style"); // Style of the prompt
    const [optimizedText, setOptimizedText] = useState<OptimizedText>(); // Stores text changes after optimization
    const [activeChangeId, setActiveChangeId] = useState<number | null>(null);
    const [debouncedText, setDebouncedText] = useState(text); // Debounced text for delayed processing
    const adaptLanguage: Boolean = false; // Debug flag to adapt language automatically

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
                    setLanguageCode(data);
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
        const languageName = commonLanguages.find((lang) => lang.code === languageCode)?.name;
        // Fetching optimized text from the server
        const response = await fetch('/api/optimize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, languageName }),
        });
        const changes = await response.json() as OptimizedText;
        console.log("text changes:", changes);
        setOptimizedText(changes);
    };
    
    // Function to handle accepting a change
    const acceptChange = useCallback((changeId: number) => {
        const change = optimizedText?.changes.find((_, index) => index === changeId);
        if (change) {
            const newText = text.substring(0, change.offset) + change.replacements[0].value + text.substring(change.offset + change.length); // TODO: Use chosen replacement
            setText(newText);
        }
    }, [text, optimizedText]);

    // Modified highlightChanges function to return JSX
    const highlightChanges = useCallback(() => {
        if (!optimizedText) return <></>;
        let elements = [];
        let lastIndex = 0;
        optimizedText.changes.forEach((change, index) => {
            elements.push(<Fragment key={'text-before-' + index}>{text.substring(lastIndex, change.offset)}</Fragment>);
            elements.push(
                <span key={'change-' + index}
                      className={styles.highlight}
                      onMouseEnter={() => setActiveChangeId(index)}
                      onMouseLeave={() => setActiveChangeId(null)}>
                    {text.substring(change.offset, change.offset + change.length)}
                    {activeChangeId === index && (
                        <Popover message={change.message} onAccept={() => acceptChange(index)} />
                    )}
                </span>
            );
            lastIndex = change.offset + change.length;
        });
        elements.push(<Fragment key='text-after'>{text.substring(lastIndex)}</Fragment>);
        return <>{elements}</>;
    }, [text, optimizedText, activeChangeId, acceptChange]);

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

                <div className={styles.textcontainer}>
                    <form onSubmit={handleSubmit} className={styles.textinput}>
                        <textarea value={text} onChange={(e) => setText(e.target.value)}></textarea>
                        <button>Check</button>
                    </form>
                    
                    {/* Displaying highlighted changes */}
                    <div className={styles.textoutput}>
                        {highlightChanges()}
                    </div>
                </div>

                {/* Listing the possible changes */}
                <div className={styles.optimizations}>
                    <ul>
                        {optimizedText && optimizedText.changes.map((change, index) => (
                            <li key={index} className={index === activeChangeId ? styles.activeChange : ""}>
                                {change.replacements.map((replacement, index) => (
                                    <span key={index}>{replacement.value}</span>
                                ))} - {change.message}
                                <button onClick={() => acceptChange(index)}>Accept</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Editor;
