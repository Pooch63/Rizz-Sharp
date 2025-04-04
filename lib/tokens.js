"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scanner = exports.Keyword = void 0;
const error_1 = require("./error");
var Keyword;
(function (Keyword) {
    Keyword["LET"] = "fanum_tax";
    Keyword["EQUAL"] = "be";
    Keyword["IF"] = "bet";
    Keyword["ELIF"] = "delulu";
    Keyword["ELSE"] = "cap";
    Keyword["WHILE"] = "vibe_check";
    Keyword["TRY"] = "sus";
    Keyword["CATCH"] = "cringe";
    Keyword["THROW"] = "yeet";
    Keyword["SWITCH"] = "looksmaxxing";
    Keyword["CASE"] = "aura";
    Keyword["DEFAULT"] = "what_the_sigma";
    Keyword["BREAK"] = "dip";
    Keyword["TERNARY_QUESTION"] = "wrizz";
    Keyword["TERNARY_COLON"] = "lrizz";
    Keyword["EQUALS_EQUALS"] = "fr";
    Keyword["BANG_EQUALS"] = "cappin";
    Keyword["PRINT"] = "alpha";
})(Keyword || (exports.Keyword = Keyword = {}));
const keywords = {
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
const is_digit = (c) => {
    let code = c.charCodeAt(0);
    return code >= 48 && code <= 57;
};
class Scanner {
    ind = 0;
    _line = 1;
    _col = 0;
    input;
    lines;
    constructor(input) {
        this.input = input;
        this.lines = this.input.split("\n");
    }
    curr() {
        return this.input[this.ind] ?? "\0";
    }
    peek(skip) {
        return this.input[this.ind + skip] ?? "\0";
    }
    advance() {
        if (this.curr() == "\n") {
            this._line += 1;
            this._col = 0;
        }
        else {
            this._col += 1;
        }
        this.ind += 1;
        return this.input[this.ind - 1];
    }
    line() {
        return this._line;
    }
    col() {
        return this._col;
    }
    at_EOF() {
        return this.ind >= this.input.length;
    }
    skip_whitespace() {
        if (!/\s/.test(this.curr()))
            return false;
        while (/\s/.test(this.curr())) {
            this.advance();
        }
        return true;
    }
    skip_comments() {
        let found_comment = false;
        while (true) {
            if (this.curr() == "/" && this.peek(1) == "/") {
                while (this.curr() != "\n") {
                    this.advance();
                }
                this.advance();
                found_comment = true;
            }
            else if (this.curr() == "/" && this.peek(1) == "*") {
                while (this.curr() != "*" || this.peek(1) != "/") {
                    this.advance();
                }
                this.advance();
                this.advance();
                found_comment = true;
            }
            else
                break;
        }
        return found_comment;
    }
    get_position(length) {
        return {
            line: this.line(),
            col: this.col(),
            length: length,
        };
    }
    next_no_advance() {
        while (this.skip_whitespace() || this.skip_comments())
            ;
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
            let num = "";
            let dec = false;
            let pos = this.get_position(0);
            while (is_digit(this.curr()) || (this.curr() == "." && !dec)) {
                if (this.curr() == ".")
                    dec = true;
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
            let str = "";
            while (this.curr() != quote && !this.at_EOF()) {
                pos.length += 1;
                if (this.curr() == "\\" && this.peek(1) == quote) {
                    str = str + "\\" + quote;
                    this.advance();
                }
                else
                    str += this.curr();
                this.advance();
            }
            this.advance();
            if (this.at_EOF()) {
                (0, error_1.error)(this.lines, {
                    line: this.line(),
                    col: this.col(),
                    length: 1,
                }, `Expected closing quote ${quote} to string`);
            }
            return { type: "string", value: str, position: pos };
        }
        if (/[a-z]|[A-Z]|_/.test(curr)) {
            let pos = this.get_position(1);
            let identifier = curr;
            this.advance();
            while (/[a-z]|[A-Z]|[0-9]|_/.test(this.curr())) {
                identifier += this.advance();
                pos.length += 1;
            }
            let keyword = keywords[identifier];
            if (keyword != null) {
                return { type: keyword, position: pos };
            }
            return { type: "identifier", value: identifier, position: pos };
        }
        (0, error_1.error)(this.lines, this.get_position(1), `Unexpected character ${curr}`);
        this.advance();
        return { type: "error", position: this.get_position(0) };
    }
    next() {
        while (true) {
            let tkn = this.next_no_advance();
            if (tkn.type != "error")
                return tkn;
        }
    }
}
exports.Scanner = Scanner;
