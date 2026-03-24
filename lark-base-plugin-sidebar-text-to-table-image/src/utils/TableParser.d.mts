export class TableParser {
    validUnits: string[];
    constructor();
    parse(text: string): {
        headers: string[];
        rows: string[][];
        metadata: {
            isMarkdown: boolean;
        };
    };
    parseHeader(line: string): string[];
    parseDataRow(line: string): string[];
    splitAndClean(line: string): string[];
    isSeparator(line: string): boolean;
    validateUnits(valueStr: string): boolean;
    calculateNRV(value: string): string;
}

export function runTests(): void;
