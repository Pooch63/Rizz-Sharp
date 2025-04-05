"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warning = exports.error = void 0;
const chalk = require("chalk");
function format_error(lines, position, error, header) {
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
function error(lines, position, message, color) {
    return format_error(lines, position, message, color ? chalk.red("error:") : "error:");
}
exports.error = error;
function warning(lines, position, message, color) {
    return format_error(lines, position, message, color ? chalk.yellow("warning:") : "warning:");
}
exports.warning = warning;
