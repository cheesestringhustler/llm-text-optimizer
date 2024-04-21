import { Change } from "diff";

export interface ExtendedChange extends Change {
    id: number;
    modified?: boolean;
    added?: boolean;
    removed?: boolean;
    reason?: string;
    context?: string;
    offset?: number;
}

