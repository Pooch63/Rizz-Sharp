"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const tokens_1 = require("./tokens");
const ast_1 = require("./ast");
const error_1 = require("./error");
var Precedence;
(function (Precedence) {
    Precedence[Precedence["PREC_NONE"] = 0] = "PREC_NONE";
    Precedence[Precedence["PREC_ASSIGN"] = 1] = "PREC_ASSIGN";
    Precedence[Precedence["PREC_FUNCTION_CALL"] = 2] = "PREC_FUNCTION_CALL";
    Precedence[Precedence["PREC_TERNARY"] = 3] = "PREC_TERNARY";
    Precedence[Precedence["PREC_RELATIONAL"] = 4] = "PREC_RELATIONAL";
    Precedence[Precedence["PREC_EQUALITY"] = 5] = "PREC_EQUALITY";
    Precedence[Precedence["PREC_TERM"] = 6] = "PREC_TERM";
    Precedence[Precedence["PREC_FACTOR"] = 7] = "PREC_FACTOR";
})(Precedence || (Precedence = {}));
let parse_rules = {};
const number = (parser, tok) => new ast_1.ASTNumber(tok.value);
const string = (parser, tok) => new ast_1.ASTString(tok.value);
const unary = (parser, tok) => {
    switch (tok.type) {
        case "+":
        case "-":
            return new ast_1.ASTUnary(tok.type, parser.parse_expression(Precedence.PREC_NONE));
        default:
            throw new Error(`Internal error: Undefined unary parse of ${tok.type}`);
    }
};
const binary = (parser, left, tok) => {
    switch (tok.type) {
        case "+":
        case "-":
            return new ast_1.ASTBinop(left, parser.parse_expression(Precedence.PREC_TERM + 1), tok.type);
        case "*":
        case "/":
            return new ast_1.ASTBinop(left, parser.parse_expression(Precedence.PREC_FACTOR + 1), tok.type);
        case tokens_1.Keyword.EQUALS_EQUALS:
        case tokens_1.Keyword.BANG_EQUALS:
            return new ast_1.ASTBinop(left, parser.parse_expression(Precedence.PREC_EQUALITY + 1), tok.type == tokens_1.Keyword.EQUALS_EQUALS ? "==" : "!=");
        case ">":
        case ">=":
        case "<":
        case "<=":
            return new ast_1.ASTBinop(left, parser.parse_expression(Precedence.PREC_RELATIONAL + 1), tok.type);
        default:
            throw new Error(`Internal error: Undefined binop parse of ${tok.type}`);
    }
};
const ternary = (parser, left, tok) => {
    parser.expect_symbol("=", "Expected equals sign after wrizz (wrizz =)");
    let if_true = parser.parse_expression(Precedence.PREC_NONE);
    // Expect ", lrizz"
    parser.expect_symbol(",", "Expected comma (, lrizz =) after wrizz expression");
    parser.expect_symbol("lrizz", "Expected lrizz (, lrizz =) after wrizz expression");
    parser.expect_symbol("=", "Expected lrizz (, lrizz =) after wrizz expression");
    let if_false = parser.parse_expression(Precedence.PREC_NONE);
    return new ast_1.ASTTernary(left, if_true, if_false);
};
const grouping = (parser, tok) => {
    let expr = parser.parse_expression(Precedence.PREC_NONE);
    parser.expect_symbol(")", "Expected ) after parenthesis grouping");
    return expr;
};
const function_call = (parser, left, tok) => {
    let args = [];
    while (parser.curr().type != ")") {
        args.push(parser.parse_expression(Precedence.PREC_NONE));
        if (parser.curr().type == ",") {
            parser.advance();
        }
        else
            break;
    }
    parser.expect_symbol(")", "Expected ) after function call");
    return new ast_1.ASTFunctionCall(left, args);
};
const identifier = (parser, tok) => {
    return new ast_1.ASTIdentifier(tok.value);
};
const assignment = (parser, left, tok) => {
    switch (left.get_type()) {
        case ast_1.ASTType.ASSIGN:
        case ast_1.ASTType.IDENTIFIER:
            break;
        default:
            parser.error(tok.position, `"${tokens_1.Keyword.EQUAL}" token can only be applied to variables`);
    }
    return new ast_1.ASTAssignment(left, parser.parse_expression(Precedence.PREC_NONE));
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
class Parser {
    scanner;
    _curr;
    _last;
    add_color = false;
    error_string = "";
    constructor(scanner, add_color) {
        this.scanner = scanner;
        this._curr = scanner.next();
        this.add_color = add_color;
    }
    error(position, err) {
        this.error_string += (0, error_1.error)(this.scanner.lines, position, err, this.add_color);
    }
    last() {
        return this._last;
    }
    curr() {
        return this._curr;
    }
    advance() {
        this._last = this.curr();
        this._curr = this.scanner.next();
        return this._last;
    }
    // Expect and advance, even if the token is wrong
    expect(type, err) {
        let tok = this.advance();
        if (tok.type != type)
            this.error(tok.position, err);
        return tok;
    }
    // Expect and only advance if we found the symbol
    expect_symbol(type, err) {
        let tok = this.curr();
        if (tok.type != type)
            this.error(tok.position, err);
        else
            this.advance();
    }
    synchronize() {
        while (true) {
            switch (this.curr().type) {
                case ";":
                case "EOF":
                case tokens_1.Keyword.LET:
                case tokens_1.Keyword.SWITCH:
                case tokens_1.Keyword.TRY:
                case tokens_1.Keyword.IF: {
                    return;
                }
            }
            this.advance();
        }
    }
    parse_expression(prec) {
        let curr = this.curr();
        let nud = parse_rules[curr.type]?.nud;
        if (nud == null) {
            this.error(curr.position, `Unexpected token ${curr.type}`);
            this.synchronize();
            return ast_1.ast_error;
        }
        this.advance();
        let left = nud(this, curr);
        let rule = parse_rules[this.curr().type];
        while (rule != null && rule.precedence >= prec && rule.led != null) {
            let curr = this.advance();
            left = rule.led(this, left, curr);
            rule = parse_rules[this.curr().type];
        }
        return left;
    }
    parse_var_def() {
        this.advance();
        let name = this.expect("identifier", "Expected variable name after fanum_tax").value;
        if (this.last().type == ";") {
            this.advance();
            return new ast_1.ASTVarDef(name, null);
        }
        this.expect_symbol("be", "Expected be after fanum_tax definition");
        let value = this.parse_expression(Precedence.PREC_NONE);
        this.expect_symbol(";", "Expected ; after fanum_tax definition");
        return new ast_1.ASTVarDef(name, value);
    }
    parse_switch_statement() {
        this.advance();
        let match = this.parse_expression(Precedence.PREC_NONE);
        this.expect_symbol("{", `Expected { to begin ${tokens_1.Keyword.SWITCH} statement`);
        let cases = [];
        let found_default = false;
        while (this.curr().type == tokens_1.Keyword.CASE ||
            this.curr().type == tokens_1.Keyword.DEFAULT) {
            let is_default = false;
            let case_exprs = [];
            let case_body = [];
            while (this.curr().type == tokens_1.Keyword.CASE ||
                this.curr().type == tokens_1.Keyword.DEFAULT) {
                if (this.curr().type == tokens_1.Keyword.DEFAULT) {
                    this.advance();
                    if (found_default) {
                        this.error(this.last().position, `Default was already specified for this ${tokens_1.Keyword.SWITCH} statement`);
                    }
                    found_default = true;
                    is_default = true;
                    this.expect_symbol(":", `Expected : after ${tokens_1.Keyword.DEFAULT}`);
                }
                else {
                    this.advance();
                    let case_expr = this.parse_expression(Precedence.PREC_NONE);
                    this.expect_symbol(":", `Expected colon to start ${tokens_1.Keyword.CASE} body`);
                    case_exprs.push(case_expr);
                }
            }
            let start = this.curr();
            while (start.type != "EOF" &&
                start.type != "}" &&
                start.type != tokens_1.Keyword.CASE &&
                start.type != tokens_1.Keyword.DEFAULT) {
                let statement = this.parse_statement(true);
                if (statement.get_type() == ast_1.ASTType.VAR_DEF) {
                    this.error(start.position, `Cannot declare variable in non-block scope of ${tokens_1.Keyword.SWITCH} ${tokens_1.Keyword.CASE} statement`);
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
        this.expect_symbol("}", `Expected } to end ${tokens_1.Keyword.SWITCH} statement`);
        return new ast_1.ASTSwitch(match, cases);
    }
    parse_try_catch_statement() {
        this.advance();
        let block = this.parse_body();
        this.expect(tokens_1.Keyword.CATCH, `Expected ${tokens_1.Keyword.CATCH} (err) { ... } block after try block`);
        this.expect_symbol("(", `Expected ${tokens_1.Keyword.CATCH} (err) { ... } block after try block`);
        let identifier = this.expect("identifier", `Expected ${tokens_1.Keyword.CATCH} (err) { ... } block after try block`).value;
        this.expect_symbol(")", `Expected ${tokens_1.Keyword.CATCH} (err) { ... } block after try block`);
        let catch_body = this.parse_body();
        return new ast_1.ASTTryCatch(block, identifier, catch_body);
    }
    parse_throw() {
        this.advance();
        let error = this.parse_expression(Precedence.PREC_NONE);
        this.expect_symbol(";", `Expected ; after ${tokens_1.Keyword.THROW} statement`);
        return new ast_1.ASTThrow(error);
    }
    parse_break_statement() {
        // Get "break;"
        this.advance();
        this.expect_symbol(";", `Expected ; after ${tokens_1.Keyword.BREAK} statement`);
        return ast_1.ast_break;
    }
    // Parse (expr) { body } OR (expr) statement;
    parse_expr_and_body() {
        this.expect_symbol("(", "Expected ( to begin condition");
        let cond = this.parse_expression(Precedence.PREC_NONE);
        this.expect_symbol(")", "Expected ) to close condition");
        let body = this.parse_statement(false);
        return { cond, body };
    }
    parse_body() {
        this.expect("{", "Expected { to start body");
        let body = new ast_1.ASTBody();
        while (!this.scanner.at_EOF() && this.curr().type != "}") {
            body.statements.push(this.parse_statement(true));
        }
        this.expect_symbol("}", "Expected } to end body");
        return body;
    }
    parse_if_statement() {
        this.advance();
        let body = this.parse_expr_and_body();
        let elifs = [];
        while (this.curr().type == "delulu") {
            this.advance();
            let elif = this.parse_expr_and_body();
            elifs.push({ condition: elif.cond, body: elif.body });
        }
        let else_ = null;
        if (this.curr().type == "cap") {
            this.advance();
            else_ = { body: this.parse_statement(false) };
        }
        return new ast_1.ASTIf(body.cond, body.body, elifs, else_);
    }
    parse_while_statement() {
        this.advance();
        let { cond, body } = this.parse_expr_and_body();
        return new ast_1.ASTWhile(cond, body);
    }
    parse_print() {
        this.advance();
        let val = this.parse_expression(Precedence.PREC_NONE);
        this.expect_symbol(";", "Expected ; after alpha statement");
        return new ast_1.ASTPrint(val);
    }
    parse_statement(allow_var) {
        while (this.curr().type == ";")
            this.advance();
        // Quick and dirty shortcut, just return ast_error so we don't have to deal with logic for
        // ; EOF
        if (this.scanner.at_EOF())
            return ast_1.ast_error;
        switch (this.curr().type) {
            case tokens_1.Keyword.LET: {
                if (!allow_var) {
                    this.error(this.curr().position, "May not have variable definition in branch block");
                }
                return this.parse_var_def();
            }
            case tokens_1.Keyword.IF:
                return this.parse_if_statement();
            case tokens_1.Keyword.WHILE:
                return this.parse_while_statement();
            case tokens_1.Keyword.PRINT:
                return this.parse_print();
            case tokens_1.Keyword.SWITCH:
                return this.parse_switch_statement();
            case tokens_1.Keyword.TRY:
                return this.parse_try_catch_statement();
            case tokens_1.Keyword.THROW:
                return this.parse_throw();
            case tokens_1.Keyword.BREAK:
                return this.parse_break_statement();
            case "{":
                return this.parse_body();
            default:
                let expr = this.parse_expression(Precedence.PREC_NONE);
                this.expect_symbol(";", "Expected ; after expression");
                return expr;
        }
    }
    parse() {
        let statement = new ast_1.ASTBody();
        while (!this.scanner.at_EOF()) {
            let node = this.parse_statement(true);
            if (node?.get_type() != ast_1.ASTType.ERROR) {
                statement.statements.push(node);
            }
        }
        return {
            error: this.error_string == "" ? null : this.error_string,
            ast: statement,
        };
    }
}
exports.Parser = Parser;
