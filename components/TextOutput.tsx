import React, { useEffect, useState } from 'react';
import Popover from './Popover';
import { diffChars, Change } from 'diff';
import { ExtendedChange } from '../types/diff';

interface TextOutputProps {
    text: string;
    setText: (text: string) => void;
    language: Language;
    optimizedText: string;
    setOptimizedText: (text: string) => void;
    activeChangeId: number | null;
    setActiveChangeId: React.Dispatch<React.SetStateAction<number | null>>;
}

const TextOutput: React.FC<TextOutputProps> = ({ text, setText, language, optimizedText, setOptimizedText, activeChangeId, setActiveChangeId }) => {
    const [processedDiffs, setProcessedDiffs] = useState<ExtendedChange[]>([]);

    const preprocessDiffs = (diffs: ExtendedChange[]) => {
        return diffs.reduce((acc: ExtendedChange[], part, index, array) => {
            if (part.added || part.removed) {
                const nextPart = array[index + 1];
                if (nextPart && ((part.added && nextPart.removed) || (part.removed && nextPart.added))) {
                    acc.push({
                        id: part.id, // Use the id of the first part
                        value: part.value + "->" + nextPart.value,
                        modified: true,
                        added: undefined,
                        removed: undefined,
                    });
                    array.splice(index + 1, 1); // Remove next part as it's merged
                } else {
                    acc.push(part); // Add non-mergeable part as is
                }
            } else {
                acc.push(part); // Directly add unchanged parts
            }
            return acc;
        }, []);
    };

    useEffect(() => {
        const diffs = diffChars(text, optimizedText);
        // Extend each Change object with an id and the necessary properties
        const extendedDiffs: ExtendedChange[] = diffs.map((diff, index) => ({
            ...diff,
            id: index, // Assign a unique ID based on index
            modified: false, // Initialize as not modified
            added: !!diff.added, // Explicitly set added and removed flags
            removed: !!diff.removed,
        }));
        const processed = preprocessDiffs(extendedDiffs); // Now preprocessDiffs operates on properly typed objects
        console.log(processed);
        setProcessedDiffs(processed);
    }, [optimizedText]); // Dependency array, re-run effect when optimizedText changes

    if (!optimizedText) return <></>; // Return empty fragment if there's no optimized text

    return (
        <div>
            {processedDiffs.map((part, index) => (
                <span key={index}
                    style={{ backgroundColor: part.modified ? 'orange' : part.added ? 'lightgreen' : part.removed ? 'salmon' : 'transparent' }}
                    onMouseEnter={() => setActiveChangeId(index)}
                    onMouseLeave={() => setActiveChangeId(null)}
                    title={part.reason ? part.reason : ''}>
                    {part.value}
                    {/* Show popover only if part is modified, added, or removed */}
                    {/* TODO: add popover to accept/reject changes with reason */}
                    {/* {activeChangeId === index && (part.modified || part.added || part.removed) && (
                        <Popover
                            message={`Change type: ${processedDiffs[activeChangeId].modified ? 'Modified' : processedDiffs[activeChangeId].added ? 'Added' : processedDiffs[activeChangeId].removed ? 'Removed' : 'Unchanged'}`}
                            onAccept={() => acceptDiff(processedDiffs[activeChangeId].id)}
                            onReject={() => rejectDiff(processedDiffs[activeChangeId].id)}
                        />
                    )} */}
                </span>
            ))}
        </div>
    );
};

export default TextOutput;