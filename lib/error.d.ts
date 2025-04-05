export type Position = {
    line: number;
    col: number;
    length: number;
};
export declare function error(lines: string[], position: Position, message: string, color: boolean): string;
export declare function warning(lines: string[], position: Position, message: string, color: boolean): string;
