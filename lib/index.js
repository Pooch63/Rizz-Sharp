"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const parser_1 = require("./parser");
const tokens_1 = require("./tokens");
const walker_1 = require("./walker");
function run(input, add_color = false, overloads) {
    let scanner = new tokens_1.Scanner(input, add_color);
    let parser = new parser_1.Parser(scanner, add_color);
    let { error, ast } = parser.parse();
    if (error?.length > 0)
        return { error };
    try {
        new walker_1.Walker(overloads ?? {}).walk(ast);
        return { error: null };
    }
    catch (err) {
        return { error: err };
    }
}
exports.run = run;
