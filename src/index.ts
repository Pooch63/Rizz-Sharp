import { Parser } from "./parser";
import { Scanner } from "./tokens";
import { Walker } from "./walker";
import fs from "fs";

const chalk = require("chalk");

export function run(input: string): {
  error: string | null;
} {
  let scanner = new Scanner(input);
  let parser = new Parser(scanner);

  let { error, ast } = parser.parse();
  if (error?.length > 0) return { error };

  try {
    new Walker().walk(ast);
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

function process_args(args: string[]): {
  output: string | null;
  error: string | null;
} {
  if (args.length == 2) {
    return { output: "Run --help for more information", error: null };
  }
  if (args[2] == "run") {
    if (args.length == 3) {
      return { output: null, error: "run expects a file to run" };
    }
    let path = args[3];
    let file: string;
    try {
      file = fs.readFileSync(path).toString();
    } catch (error) {
      return { output: null, error: `Could not find file ${path}` };
    }
    run(file);
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
