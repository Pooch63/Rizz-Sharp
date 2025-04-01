import chalk from "chalk";

export type Position = {
  line: number;
  col: number;
  length: number;
};

const pos = (x: number) => Math.max(0, x);
function format_error(
  lines: string[],
  position: Position,
  error: string,
  type: "error" | "warning"
): string {
  const line = lines[position.line - 1] || "";
  const pos_info = `${position.line}:${position.col} |  `;
  let indicator = "";
  for (let i = 0; i < pos_info.length + position.col; i += 1) {
    indicator += " ";
  }
  for (let i = 0; i < position.length; i += 1) {
    indicator += "^";
  }
  return `${
    type == "error" ? chalk.red("error:") : chalk.yellow("warning:")
  } ${error}\n${pos_info}${line}\n${indicator}`;
}

export function error(
  lines: string[],
  position: Position,
  message: string
): void {
  console.error(format_error(lines, position, message, "error"));
}

export function warning(
  lines: string[],
  position: Position,
  message: string
): void {
  console.warn(format_error(lines, position, message, "warning"));
}
