type Language = {
    code: string;
    name: string;
}

type OptimizedText = {
    changes: [
        {
            message: string;
            type: string;
            replacement: string;
            offset: number;
            length: number;
        }
    ]
}
