import React, { useEffect, useState } from 'react';
import Popover from './Popover';
import { diffChars, Change } from 'diff';
import { ExtendedChange } from '../types/diff';
import { Switch } from "@/components/ui/switch"

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
    const [showDiffs, setShowDiffs] = useState(true);

    // Preprocess diffs to merge added and removed changes
    const preprocessDiffs = (diffs: ExtendedChange[]) => {
        return diffs.reduce((acc: ExtendedChange[], part, index, array) => {
            if (part.added || part.removed) {
                const nextPart = array[index + 1];
                if (nextPart && ((part.added && nextPart.removed) || (part.removed && nextPart.added))) {
                    acc.push({
                        id: part.id,
                        value: part.value + "->" + nextPart.value,
                        modified: true,
                        added: undefined,
                        removed: undefined,
                    });
                    array.splice(index + 1, 1); // Merge changes
                } else {
                    acc.push(part); // Non-mergeable part
                }
            } else {
                acc.push(part); // Unchanged part
            }
            return acc;
        }, []);
    };

    useEffect(() => {
        const diffs = diffChars(text, optimizedText);
        // Extend each Change object with an id and the necessary properties
        const extendedDiffs: ExtendedChange[] = diffs.map((diff, index) => ({
            ...diff,
            id: index,
            modified: false,
            added: !!diff.added,
            removed: !!diff.removed,
        }));
        const processed = preprocessDiffs(extendedDiffs);
        // console.log(processed);
        setProcessedDiffs(processed);
    }, [optimizedText]); // Re-run effect when optimizedText changes

    return (
        <div className='overflow-hidden border border-gray-200 rounded-md mb-4 bg-gray-100 relative min-h-[300px] h-full'>
            <div className='h-full overflow-auto p-2 text-sm'>
                {
                    showDiffs ? (
                        optimizedText !== "" ? processedDiffs.map((part, index) => (
                            <span
                                key={index}
                                style={{ backgroundColor: part.modified ? 'orange' : part.added ? 'lightgreen' : part.removed ? 'salmon' : 'transparent' }}
                                onMouseEnter={() => setActiveChangeId(index)}
                                onMouseLeave={() => setActiveChangeId(null)}
                                title={part.reason ? part.reason : ''}>
                                {part.value}
                            </span>
                        )) : <></>
                    ) : (
                        // Display optimized text directly if showDiffs is false
                        <span>{optimizedText}</span>
                    )
                }
            </div>
            {/* Positioning the switch at the bottom right corner, fixed within the component */}
            <div className='absolute bottom-0 right-0 p-2 flex items-center text-sm text-gray-500'>
                <Switch id='show-diffs' checked={showDiffs} onCheckedChange={setShowDiffs} />
                <label className='ml-2' htmlFor='show-diffs'>Show diffs</label>
            </div>
        </div>
    );
};

export default TextOutput;
