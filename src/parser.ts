import { Keyword, Scanner, Token, TokNum, TokString } from "./tokens";

import {
  ASTNode,
  ASTBody,
  ASTVarDef,
  ASTUnary,
  ASTBinop,
  ASTNumber,
  ast_error,
  ASTTernary,
  ASTFunctionCall,
  ASTType,
  Elif,
  Else,
  ASTIf,
  ASTIdentifier,
  ASTAssignment,
  ASTPrint,
  ASTString,
  ASTSwitchCase,
  ASTSwitch,
  ast_break,
  ASTTryCatch,
  ASTThrow,
  ASTWhile,
} from "./ast";
import { error, Position, warning } from "./error";

enum Precedence {
  PREC_NONE,
  PREC_ASSIGN,
  PREC_FUNCTION_CALL,
  PREC_TERNARY,
  PREC_RELATIONAL,
  PREC_EQUALITY,
  PREC_TERM,
  PREC_FACTOR,
}
type ParseRule = {
  precedence: Precedence;
  nud: ((parser: Parser, tok: Token) => ASTNode) | null;
  led: ((parser: Parser, left: ASTNode, tok: Token) => ASTNode) | null;
};
let parse_rules: Record<string, ParseRule> = {};

const number = (parser: Parser, tok: Token) =>
  new ASTNumber((tok as TokNum).value);
const string = (parser: Parser, tok: Token) =>
  new ASTString((tok as TokString).value);
const unary = (parser: Parser, tok: Token) => {
  switch (tok.type) {
    case "+":
    case "-":
      return new ASTUnary(
        tok.type,
        parser.parse_expression(Precedence.PREC_NONE)
      );
    default:
      throw new Error(`Internal error: Undefined unary parse of ${tok.type}`);
  }
};
const binary = (parser: Parser, left: ASTNode, tok: Token) => {
  switch (tok.type) {
    case "+":
    case "-":
      return new ASTBinop(
        left,
        parser.parse_expression(Precedence.PREC_TERM + 1),
        tok.type
      );
    case "*":
    case "/":
      return new ASTBinop(
        left,
        parser.parse_expression(Precedence.PREC_FACTOR + 1),
        tok.type
      );
    case Keyword.EQUALS_EQUALS:
    case Keyword.BANG_EQUALS:
      return new ASTBinop(
        left,
        parser.parse_expression(Precedence.PREC_EQUALITY + 1),
        tok.type == Keyword.EQUALS_EQUALS ? "==" : "!="
      );
    case ">":
    case ">=":
    case "<":
    case "<=":
      return new ASTBinop(
        left,
        parser.parse_expression(Precedence.PREC_RELATIONAL + 1),
        tok.type
      );
    default:
      throw new Error(`Internal error: Undefined binop parse of ${tok.type}`);
  }
};
const ternary = (parser: Parser, left: ASTNode, tok: Token) => {
  parser.expect_symbol("=", "Expected equals sign after wrizz (wrizz =)");
  let if_true = parser.parse_expression(Precedence.PREC_NONE);
  // Expect ", lrizz"
  parser.expect_symbol(
    ",",
    "Expected comma (, lrizz =) after wrizz expression"
  );
  parser.expect_symbol(
    "lrizz",
    "Expected lrizz (, lrizz =) after wrizz expression"
  );
  parser.expect_symbol(
    "=",
    "Expected lrizz (, lrizz =) after wrizz expression"
  );
  let if_false = parser.parse_expression(Precedence.PREC_NONE);

  return new ASTTernary(left, if_true, if_false);
};
const grouping = (parser: Parser, tok: Token) => {
  let expr = parser.parse_expression(Precedence.PREC_NONE);
  parser.expect_symbol(")", "Expected ) after parenthesis grouping");
  return expr;
};
const function_call = (parser: Parser, left: ASTNode, tok: Token) => {
  let args: ASTNode[] = [];
  while (parser.curr().type != ")") {
    args.push(parser.parse_expression(Precedence.PREC_NONE));
    if (parser.curr().type == ",") {
      parser.advance();
    } else break;
  }
  parser.expect_symbol(")", "Expected ) after function call");
  return new ASTFunctionCall(left, args);
};
const identifier = (parser: Parser, tok: Token) => {
  return new ASTIdentifier((tok as TokString).value);
};
const assignment = (parser: Parser, left: ASTNode, tok: Token) => {
  switch (left.get_type()) {
    case ASTType.ASSIGN:
    case ASTType.IDENTIFIER:
      break;
    default:
      parser.error(
        tok.position,
        `"${Keyword.EQUAL}" token can only be applied to variables`
      );
  }
  return new ASTAssignment(left, parser.parse_expression(Precedence.PREC_NONE));
};

parse_rules["number"] = {
  precedence: Precedence.PREC_NONE,
  nud: number,
  led: null,
};
parse_rules["string"] = {
  precedence: Precedence.PREC_NONE,
  nud: string,
  led: null,
};
parse_rules["+"] = parse_rules["-"] = {
  precedence: Precedence.PREC_TERM,
  nud: unary,
  led: binary,
};
parse_rules["*"] = parse_rules["/"] = {
  precedence: Precedence.PREC_FACTOR,
  nud: null,
  led: binary,
};
parse_rules["<"] =
  parse_rules["<="] =
  parse_rules[">"] =
  parse_rules[">="] =
    {
      precedence: Precedence.PREC_RELATIONAL,
      nud: null,
      led: binary,
    };
parse_rules["fr"] = parse_rules["cappin"] = {
  precedence: Precedence.PREC_EQUALITY,
  nud: null,
  led: binary,
};
parse_rules["wrizz"] = {
  precedence: Precedence.PREC_TERNARY,
  nud: null,
  led: ternary,
};
parse_rules["("] = {
  precedence: Precedence.PREC_FUNCTION_CALL,
  nud: grouping,
  led: function_call,
};
parse_rules["identifier"] = {
  precedence: Precedence.PREC_NONE,
  nud: identifier,
  led: null,
};
parse_rules["be"] = {
  precedence: Precedence.PREC_ASSIGN,
  nud: null,
  led: assignment,
};

export class Parser {
  public scanner: Scanner;
  private _curr: Token;
  private _last: Token;
  private add_color: boolean = false;
  public error_string: string = "";
  constructor(scanner: Scanner, add_color: boolean) {
    this.scanner = scanner;
    this._curr = scanner.next();
    this.add_color = add_color;
  }

  public error(position: Position, err: string) {
    this.error_string += error(
      this.scanner.lines,
      position,
      err,
      this.add_color
    );
  }

  private last() {
    return this._last;
  }
  public curr() {
    return this._curr;
  }
  public advance() {
    this._last = this.curr();
    this._curr = this.scanner.next();
    return this._last;
  }
  // Expect and advance, even if the token is wrong
  private expect(type: string, err: string): Token {
    let tok = this.advance();
    if (tok.type != type) this.error(tok.position, err);
    return tok;
  }
  // Expect and only advance if we found the symbol
  public expect_symbol(type: string, err: string): void {
    let tok = this.curr();
    if (tok.type != type) this.error(tok.position, err);
    else this.advance();
  }
  private synchronize() {
    while (true) {
      switch (this.curr().type) {
        case ";":
        case "EOF":
        case Keyword.LET:
        case Keyword.SWITCH:
        case Keyword.TRY:
        case Keyword.IF: {
          return;
        }
      }
      this.advance();
    }
  }
  parse_expression(prec: Precedence): ASTNode {
    let curr = this.curr();
    let nud = parse_rules[curr.type]?.nud;
    if (nud == null) {
      this.error(curr.position, `Unexpected token ${curr.type}`);
      this.synchronize();
      return ast_error;
    }
    this.advance();

    let left: ASTNode = nud(this, curr);
    let rule = parse_rules[this.curr().type];
    while (rule != null && rule.precedence >= prec && rule.led != null) {
      let curr = this.advance();
      left = rule.led(this, left, curr);
      rule = parse_rules[this.curr().type];
    }
    return left;
  }
  private parse_var_def(): ASTVarDef {
    this.advance();
    let name = (
      this.expect(
        "identifier",
        "Expected variable name after fanum_tax"
      ) as TokString
    ).value;
    if (this.last().type == ";") {
      this.advance();
      return new ASTVarDef(name, null);
    }
    this.expect_symbol("be", "Expected be after fanum_tax definition");
    let value = this.parse_expression(Precedence.PREC_NONE);
    this.expect_symbol(";", "Expected ; after fanum_tax definition");
    return new ASTVarDef(name, value);
  }
  private parse_switch_statement(): ASTSwitch {
    this.advance();
    let match = this.parse_expression(Precedence.PREC_NONE);
    this.expect_symbol("{", `Expected { to begin ${Keyword.SWITCH} statement`);

    let cases: ASTSwitchCase[] = [];
    let found_default = false;
    while (
      this.curr().type == Keyword.CASE ||
      this.curr().type == Keyword.DEFAULT
    ) {
      let is_default = false;
      let case_exprs: ASTNode[] = [];
      let case_body: ASTNode[] = [];
      while (
        this.curr().type == Keyword.CASE ||
        this.curr().type == Keyword.DEFAULT
      ) {
        if (this.curr().type == Keyword.DEFAULT) {
          this.advance();
          if (found_default) {
            this.error(
              this.last().position,
              `Default was already specified for this ${Keyword.SWITCH} statement`
            );
          }
          found_default = true;
          is_default = true;
          this.expect_symbol(":", `Expected : after ${Keyword.DEFAULT}`);
        } else {
          this.advance();
          let case_expr = this.parse_expression(Precedence.PREC_NONE);
          this.expect_symbol(
            ":",
            `Expected colon to start ${Keyword.CASE} body`
          );
          case_exprs.push(case_expr);
        }
      }
      let start = this.curr();
      while (
        start.type != "EOF" &&
        start.type != "}" &&
        start.type != Keyword.CASE &&
        start.type != Keyword.DEFAULT
      ) {
        let statement = this.parse_statement(true);
        if (statement.get_type() == ASTType.VAR_DEF) {
          this.error(
            start.position,
            `Cannot declare variable in non-block scope of ${Keyword.SWITCH} ${Keyword.CASE} statement`
          );
        }
        case_body.push(statement);
        start = this.curr();
      }
      cases.push({
        cases: case_exprs,
        statements: case_body,
        is_default,
      });
    }
    this.expect_symbol("}", `Expected } to end ${Keyword.SWITCH} statement`);

    return new ASTSwitch(match, cases);
  }
  private parse_try_catch_statement(): ASTTryCatch {
    this.advance();
    let block = this.parse_body();
    this.expect(
      Keyword.CATCH,
      `Expected ${Keyword.CATCH} (err) { ... } block after try block`
    );
    this.expect_symbol(
      "(",
      `Expected ${Keyword.CATCH} (err) { ... } block after try block`
    );
    let identifier = (
      this.expect(
        "identifier",
        `Expected ${Keyword.CATCH} (err) { ... } block after try block`
      ) as TokString
    ).value;
    this.expect_symbol(
      ")",
      `Expected ${Keyword.CATCH} (err) { ... } block after try block`
    );
    let catch_body = this.parse_body();

    return new ASTTryCatch(block, identifier, catch_body);
  }
  private parse_throw(): ASTThrow {
    this.advance();
    let error = this.parse_expression(Precedence.PREC_NONE);
    this.expect_symbol(";", `Expected ; after ${Keyword.THROW} statement`);
    return new ASTThrow(error);
  }
  private parse_break_statement() {
    // Get "break;"
    this.advance();
    this.expect_symbol(";", `Expected ; after ${Keyword.BREAK} statement`);
    return ast_break;
  }
  // Parse (expr) { body } OR (expr) statement;
  private parse_expr_and_body(): { cond: ASTNode; body: ASTBody | ASTNode } {
    this.expect_symbol("(", "Expected ( to begin condition");
    let cond = this.parse_expression(Precedence.PREC_NONE);
    this.expect_symbol(")", "Expected ) to close condition");

    let body = this.parse_statement(false);
    return { cond, body };
  }
  private parse_body(): ASTBody {
    this.expect("{", "Expected { to start body");
    let body: ASTBody = new ASTBody();
    while (!this.scanner.at_EOF() && this.curr().type != "}") {
      body.statements.push(this.parse_statement(true));
    }
    this.expect_symbol("}", "Expected } to end body");
    return body;
  }
  private parse_if_statement(): ASTIf {
    this.advance();
    let body = this.parse_expr_and_body();
    let elifs: Elif[] = [];

    while (this.curr().type == "delulu") {
      this.advance();
      let elif = this.parse_expr_and_body();
      elifs.push({ condition: elif.cond, body: elif.body });
    }
    let else_: Else | null = null;
    if (this.curr().type == "cap") {
      this.advance();
      else_ = { body: this.parse_statement(false) };
    }
    return new ASTIf(body.cond, body.body, elifs, else_);
  }
  private parse_while_statement(): ASTWhile {
    this.advance();
    let { cond, body } = this.parse_expr_and_body();
    return new ASTWhile(cond, body);
  }
  private parse_print(): ASTPrint {
    this.advance();
    let val = this.parse_expression(Precedence.PREC_NONE);
    this.expect_symbol(";", "Expected ; after alpha statement");
    return new ASTPrint(val);
  }
  private parse_statement(allow_var: boolean): ASTNode {
    while (this.curr().type == ";") this.advance();
    // Quick and dirty shortcut, just return ast_error so we don't have to deal with logic for
    // ; EOF
    if (this.scanner.at_EOF()) return ast_error;

    switch (this.curr().type) {
      case Keyword.LET: {
        if (!allow_var) {
          this.error(
            this.curr().position,
            "May not have variable definition in branch block"
          );
        }
        return this.parse_var_def();
      }
      case Keyword.IF:
        return this.parse_if_statement();
      case Keyword.WHILE:
        return this.parse_while_statement();
      case Keyword.PRINT:
        return this.parse_print();
      case Keyword.SWITCH:
        return this.parse_switch_statement();
      case Keyword.TRY:
        return this.parse_try_catch_statement();
      case Keyword.THROW:
        return this.parse_throw();
      case Keyword.BREAK:
        return this.parse_break_statement();
      case "{":
        return this.parse_body();
      default:
        let expr = this.parse_expression(Precedence.PREC_NONE);
        this.expect_symbol(";", "Expected ; after expression");
        return expr;
    }
  }
  parse(): { error: string | null; ast: ASTBody } {
    let statement = new ASTBody();
    while (!this.scanner.at_EOF()) {
      let node = this.parse_statement(true);
      if (node?.get_type() != ASTType.ERROR) {
        statement.statements.push(node);
      }
    }
    return {
      error: this.error_string == "" ? null : this.error_string,
      ast: statement,
    };
  }
}
