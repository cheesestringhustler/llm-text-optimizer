"use client";
import React, { useState, useEffect, useCallback, Fragment } from "react";
import styles from "./Editor.module.scss";
import commonLanguages from "../languages.json";
import Popover from './Popover';
import { diffChars, diffWords, Change } from 'diff';


function Editor() {
    const [text, setText] = useState("She dont likes go too the store on sundays;"); // Text input by the user
    const [languageCode, setLanguageCode] = useState("en"); // Selected language, default is English
    const [promptStyle, setPromptStyle] = useState("no-style"); // Style of the prompt
    const [optimizedText, setOptimizedText] = useState(); // Stores text changes after optimization
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
        const changes = await response.json();
        // console.log("text changes:", changes);
        setOptimizedText(changes.optimizedText);
    };
    
    interface ExtendedChange extends Change {
        modified?: boolean; // Indicates if the change is a modification
        added?: boolean; // Indicates if the change is an addition
        removed?: boolean; // Indicates if the change is a removal
    }

    // Preprocess diffs to merge added and removed changes into modified changes
    const preprocessDiffs = (diffs: ExtendedChange[]) => {
        const mergedDiffs: ExtendedChange[] = [];
        let temp: ExtendedChange | null = null;

        diffs.forEach((part, index) => {
            if (part.added || part.removed) {
                if (temp) {
                    // Merge opposite changes (add vs. remove) into a modified change
                    if ((temp.added && part.removed) || (temp.removed && part.added)) {
                        mergedDiffs.push({
                            value: temp.value + part.value,
                            modified: true, // Mark as modified
                        });
                        temp = null; // Reset temp after merging
                    } else {
                        // Push consecutive same-type changes and update temp
                        mergedDiffs.push(temp);
                        temp = part;
                    }
                } else {
                    temp = part; // Set temp for potential merging
                }
            } else {
                // Push unchanged parts directly
                if (temp) {
                    mergedDiffs.push(temp);
                    temp = null;
                }
                mergedDiffs.push(part);
            }
        });

        // Push any remaining temp part
        if (temp) {
            mergedDiffs.push(temp);
        }

        return mergedDiffs;
    };

    // Render diffs with detailed styling based on change type
    const renderDetailedDiff = () => {
        if (!optimizedText) return <></>; // Return empty fragment if there's no optimized text
        const diffs = diffChars(text, optimizedText); // Compute character-level diffs
        const processedDiffs = preprocessDiffs(diffs); // Preprocess diffs for rendering

        return (
            <div>
                {processedDiffs.map((part, index) => (
                    <span key={index}
                          style={{ backgroundColor: part.modified ? 'orange' : part.added ? 'lightgreen' : part.removed ? 'salmon' : 'transparent' }}
                          onMouseEnter={() => setActiveChangeId(index)}
                          onMouseLeave={() => setActiveChangeId(null)}>
                        {part.value}
                        {/* Show popover only if part is modified, added, or removed */}
                        {activeChangeId === index && (part.modified || part.added || part.removed) && (
                            <Popover message={`Change type: ${part.modified ? 'Modified' : part.added ? 'Added' : part.removed ? 'Removed' : 'Unchanged'}`} />
                        )}
                    </span>
                ))}
            </div>
        );
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
};

export default Editor;
