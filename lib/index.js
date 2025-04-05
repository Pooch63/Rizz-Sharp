"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const parser_1 = require("./parser");
const tokens_1 = require("./tokens");
const walker_1 = require("./walker");
const fs_1 = __importDefault(require("fs"));
const chalk = require("chalk");
function run(input, overloads) {
    let scanner = new tokens_1.Scanner(input);
    let parser = new parser_1.Parser(scanner);
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
function process_args(args) {
    if (args.length == 2) {
        return { output: "Run --help for more information", error: null };
    }
    if (args[2] == "run") {
        if (args.length == 3) {
            return { output: null, error: "run expects a file to run" };
        }
        let path = args[3];
        let file;
        try {
            file = fs_1.default.readFileSync(path).toString();
        }
        catch (error) {
            return { output: null, error: `Could not find file ${path}` };
        }
        run(file, {});
        return { output: null, error: null };
    }
    return { output: "Run --help for more information", error: null };
}
async function main() {
    let args = process.argv;
    const output = process_args(args);
    if (output.error != null) {
        console.log(chalk.red(`error: `) + output.error);
    }
    if (output.output != null) {
        console.log(output.output);
    }
}
