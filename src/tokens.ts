import { error, Position, warning } from "./error";

export enum Keyword {
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
  PRINT = "alpha",
}
const keywords: Record<string, Keyword> = {
  fanum_tax: Keyword.LET,
  be: Keyword.EQUAL,
  bet: Keyword.IF,
  delulu: Keyword.ELIF,
  cap: Keyword.ELSE,
  vibe_check: Keyword.WHILE,
  sus: Keyword.TRY,
  cringe: Keyword.CATCH,
  yeet: Keyword.THROW,
  looksmaxxing: Keyword.SWITCH,
  aura: Keyword.CASE,
  what_the_sigma: Keyword.DEFAULT,
  dip: Keyword.BREAK,
  wrizz: Keyword.TERNARY_QUESTION,
  lrizz: Keyword.TERNARY_COLON,
  fr: Keyword.EQUALS_EQUALS,
  cappin: Keyword.BANG_EQUALS,
  alpha: Keyword.PRINT,
};

type Pos<tok> = tok & { position: Position };
export type TokNum = Pos<{
  type: "number";
  value: number;
}>;
export type TokOperator = Pos<{
  type:
    | "+"
    | "-"
    | "*"
    | "/"
    | ">"
    | "<"
    | ">="
    | "<="
    | ","
    | ":"
    | "("
    | ")"
    | "{"
    | "}"
    | "="
    | ";"
    | "EOF"
    | "error";
}>;
export type TokKeyword = Pos<{
  type: Keyword;
}>;
export type TokString = Pos<{
  type: "string" | "identifier";
  value: string;
}>;
export type Token = TokNum | TokOperator | TokKeyword | TokString;

const is_digit = (c: string) => {
  let code = c.charCodeAt(0);
  return code >= 48 && code <= 57;
};

export class Scanner {
  private ind: number = 0;
  private _line: number = 1;
  private _col: number = 0;
  private input: string;
  private add_color: boolean;
  public lines: string[];
  constructor(input: string, add_color: boolean) {
    this.add_color = add_color;
    this.input = input;
    this.lines = this.input.split("\n");
  }

  private curr() {
    return this.input[this.ind] ?? "\0";
  }
  private peek(skip: number) {
    return this.input[this.ind + skip] ?? "\0";
  }
  private advance() {
    if (this.curr() == "\n") {
      this._line += 1;
      this._col = 0;
    } else {
      this._col += 1;
    }
    this.ind += 1;
    return this.input[this.ind - 1];
  }
  private line() {
    return this._line;
  }
  private col() {
    return this._col;
  }
  public at_EOF() {
    return this.ind >= this.input.length;
  }
  private skip_whitespace() {
    if (!/\s/.test(this.curr())) return false;
    while (/\s/.test(this.curr())) {
      this.advance();
    }
    return true;
  }
  private skip_comments() {
    let found_comment = false;
    while (true) {
      if (this.curr() == "/" && this.peek(1) == "/") {
        while (this.curr() != "\n") {
          this.advance();
        }
        this.advance();
        found_comment = true;
      } else if (this.curr() == "/" && this.peek(1) == "*") {
        while (this.curr() != "*" || this.peek(1) != "/") {
          this.advance();
        }
        this.advance();
        this.advance();
        found_comment = true;
      } else break;
    }
    return found_comment;
  }
  private get_position(length: number): Position {
    return {
      line: this.line(),
      col: this.col(),
      length: length,
    };
  }

  private next_no_advance(): Token {
    while (this.skip_whitespace() || this.skip_comments());

    if (this.ind >= this.input.length) {
      return {
        type: "EOF",
        position: { line: this.line(), col: this.col() + 1, length: 1 },
      };
    }

    const curr = this.curr();

    switch (curr) {
      case "+":
      case "-":
      case "*":
      case "/":
      case ",":
      case ":":
      case "(":
      case ")":
      case "{":
      case "}":
      case "=":
      case ";":
        let token = { type: curr, position: this.get_position(1) };
        this.advance();
        return token;
    }
    switch (curr) {
      case "<":
      case ">":
        if (this.peek(1) == "=") {
          let pos = this.get_position(2);

          this.advance();
          this.advance();
          switch (curr) {
            case "<":
              return { type: "<=", position: pos };
            case ">":
              return { type: ">=", position: pos };
          }
        }
        let pos = this.get_position(1);
        this.advance();
        return { type: curr, position: pos };
    }

    if (is_digit(curr) || (curr == "." && is_digit(this.peek(1)))) {
      let num: string = "";
      let dec: boolean = false;
      let pos = this.get_position(0);

      while (is_digit(this.curr()) || (this.curr() == "." && !dec)) {
        if (this.curr() == ".") dec = true;
        num += this.curr();
        pos.length += 1;
        this.advance();
      }
      return { type: "number", value: parseFloat(num), position: pos };
    }
    if (curr == '"' || curr == "'") {
      let pos = this.get_position(2);
      let quote = this.curr();
      this.advance();
      let str: string = "";
      while (this.curr() != quote && !this.at_EOF()) {
        pos.length += 1;
        if (this.curr() == "\\" && this.peek(1) == quote) {
          str = str + "\\" + quote;
          this.advance();
        } else str += this.curr();
        this.advance();
      }
      this.advance();
      if (this.at_EOF()) {
        error(
          this.lines,
          {
            line: this.line(),
            col: this.col(),
            length: 1,
          },
          `Expected closing quote ${quote} to string`,
          this.add_color
        );
      }
      return { type: "string", value: str, position: pos };
    }
    if (/[a-z]|[A-Z]|_/.test(curr)) {
      let pos = this.get_position(1);
      let identifier: string = curr;
      this.advance();
      while (/[a-z]|[A-Z]|[0-9]|_/.test(this.curr())) {
        identifier += this.advance();
        pos.length += 1;
      }
      let keyword: Keyword | null = keywords[identifier];
      if (keyword != null) {
        return { type: keyword, position: pos };
      }
      return { type: "identifier", value: identifier, position: pos };
    }

    console.log(
      error(
        this.lines,
        this.get_position(1),
        `Unexpected character ${curr}`,
        this.add_color
      )
    );
    this.advance();
    return { type: "error", position: this.get_position(0) };
  }
  public next(): Token {
    while (true) {
      let tkn = this.next_no_advance();
      if (tkn.type != "error") return tkn;
    }
  }
}
