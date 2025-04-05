const chalk = require("chalk");

export type Position = {
  line: number;
  col: number;
  length: number;
};

function format_error(
  lines: string[],
  position: Position,
  error: string,
  header: string
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
  return `${header} ${error}\n${pos_info}${line}\n${indicator}`;
}

export function error(
  lines: string[],
  position: Position,
  message: string,
  color: boolean
): string {
  return format_error(
    lines,
    position,
    message,
    color ? chalk.red("error:") : "error:"
  );
}

export function warning(
  lines: string[],
  position: Position,
  message: string,
  color: boolean
): string {
  return format_error(
    lines,
    position,
    message,
    color ? chalk.yellow("warning:") : "warning:"
  );
}
