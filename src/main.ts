import { Parser } from "./parser";
import { Scanner } from "./tokens";
import { Walker } from "./walker";
import fs from "fs";
import chalk from "chalk";

export function run(input: string) {
  let scanner = new Scanner(input);
  let parser = new Parser(scanner);

  let ast = parser.parse();
  if (parser.had_error) return;

  new Walker().walk(ast);
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
function main() {
  let args = process.argv;

  const output = process_args(args);
  if (output.error != null) {
    console.log(chalk.red(`error: `) + output.error);
  }
  if (output.output != null) {
    console.log(output.output);
  }
}
main();
