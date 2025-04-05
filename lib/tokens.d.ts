import { Position } from "./error";
export declare enum Keyword {
    LET = "fanum_tax",
    EQUAL = "be",
    IF = "bet",
    ELIF = "delulu",
    ELSE = "cap",
    WHILE = "vibe_check",
    TRY = "sus",
    CATCH = "cringe",
    THROW = "yeet",
    SWITCH = "looksmaxxing",
    CASE = "aura",
    DEFAULT = "what_the_sigma",
    BREAK = "dip",
    TERNARY_QUESTION = "wrizz",
    TERNARY_COLON = "lrizz",
    EQUALS_EQUALS = "fr",
    BANG_EQUALS = "cappin",
    PRINT = "alpha"
}
type Pos<tok> = tok & {
    position: Position;
};
export type TokNum = Pos<{
    type: "number";
    value: number;
}>;
export type TokOperator = Pos<{
    type: "+" | "-" | "*" | "/" | ">" | "<" | ">=" | "<=" | "," | ":" | "(" | ")" | "{" | "}" | "=" | ";" | "EOF" | "error";
}>;
export type TokKeyword = Pos<{
    type: Keyword;
}>;
export type TokString = Pos<{
    type: "string" | "identifier";
    value: string;
}>;
export type Token = TokNum | TokOperator | TokKeyword | TokString;
export declare class Scanner {
    private ind;
    private _line;
    private _col;
    private input;
    private add_color;
    lines: string[];
    constructor(input: string, add_color: boolean);
    private curr;
    private peek;
    private advance;
    private line;
    private col;
    at_EOF(): boolean;
    private skip_whitespace;
    private skip_comments;
    private get_position;
    private next_no_advance;
    next(): Token;
}
export {};
