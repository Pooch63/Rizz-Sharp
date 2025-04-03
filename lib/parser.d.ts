import { Scanner, Token } from "./tokens";
import { ASTNode, ASTBody } from "./ast";
import { Position } from "./error";
declare enum Precedence {
    PREC_NONE = 0,
    PREC_ASSIGN = 1,
    PREC_FUNCTION_CALL = 2,
    PREC_TERNARY = 3,
    PREC_RELATIONAL = 4,
    PREC_EQUALITY = 5,
    PREC_TERM = 6,
    PREC_FACTOR = 7
}
export declare class Parser {
    scanner: Scanner;
    private _curr;
    private _last;
    error_string: string;
    constructor(scanner: Scanner);
    error(position: Position, err: string): void;
    private last;
    curr(): Token;
    advance(): Token;
    private expect;
    expect_symbol(type: string, err: string): void;
    private synchronize;
    parse_expression(prec: Precedence): ASTNode;
    private parse_var_def;
    private parse_switch_statement;
    private parse_try_catch_statement;
    private parse_throw;
    private parse_break_statement;
    private parse_expr_and_body;
    private parse_body;
    private parse_if_statement;
    private parse_while_statement;
    private parse_print;
    private parse_statement;
    parse(): {
        error: string | null;
        ast: ASTBody;
    };
}
export {};
