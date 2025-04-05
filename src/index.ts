import { Parser } from "./parser";
import { Scanner } from "./tokens";
import { Walker } from "./walker";

import { type Overloads } from "./walker";
export { type Overloads } from "./walker";

export function run(
  input: string,
  add_color: boolean = false,
  overloads: Overloads | null
): {
  error: string | null;
} {
  let scanner = new Scanner(input, add_color);
  let parser = new Parser(scanner, add_color);

  let { error, ast } = parser.parse();
  if (error?.length > 0) return { error };

  try {
    new Walker(overloads ?? {}).walk(ast);
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}
