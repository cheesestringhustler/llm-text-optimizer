type Language = {
    code: string;
    name: string;
}

type OptimizedText = {
    changes: [
        {
            message: string;
            type: string;
            replacements: [
                {
                    value: string;
                }
            ];
            offset: number;
            length: number;
        }
    ]
}
