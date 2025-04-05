"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Walker = void 0;
const ast_1 = require("./ast");
const NULL = { type: "null" };
var ScopeType;
(function (ScopeType) {
    // while {}, for {}
    ScopeType[ScopeType["LOOP"] = 0] = "LOOP";
    // {}
    ScopeType[ScopeType["BLOCK"] = 1] = "BLOCK";
    // switch
    ScopeType[ScopeType["SWITCH"] = 2] = "SWITCH";
    // try {} catch (e) {}
    ScopeType[ScopeType["TRY"] = 3] = "TRY";
})(ScopeType || (ScopeType = {}));
function to_string(val) {
    switch (val.type) {
        case "number":
            return val.number.toString();
        case "boolean":
            return val.type ? "true" : "false";
        case "string":
            return val.value;
        case "null":
            return "null";
    }
}
class Walker {
    scopes = [{ type: ScopeType.BLOCK, vars: {} }];
    had_error = false;
    // Break has been fired
    break_fired = false;
    // So that while, for, etc. can control what scope is created next
    next_scope_type = ScopeType.BLOCK;
    overloads;
    constructor(overloads) {
        this.overloads = overloads;
    }
    // Break up through every
    fire_break() {
        this.break_fired = true;
        // Pass up through each scope
        for (let scope = this.scopes.length - 1; scope >= 0; scope -= 1) {
            if (this.scopes[scope].type == ScopeType.BLOCK)
                this.pop_scope();
            else
                return;
        }
        // If we're still here, a break was fired from outside of a loop context
        this.error(`Tried to break in non-loop context`);
    }
    // Return if break was fired, then set break_fired to false
    found_break() {
        let fired = this.break_fired;
        this.break_fired = false;
        return fired;
    }
    // Go through blocks, if there is a try catch block, stop
    error(err) {
        this.had_error = true;
        throw new Error(err);
    }
    equal(left, right) {
        if (left.type != right.type)
            return false;
        switch (left.type) {
            case "number":
                return left.number == right.number;
            default:
                return true;
        }
    }
    is_truthy(val) {
        switch (val.type) {
            case "boolean":
                return val.value;
            case "number":
                return val.number != 0;
            case "string":
                return val.value.length != 0;
            case "null":
                return false;
        }
    }
    binop(left, right, type) {
        if (type == "==") {
            return { type: "boolean", value: this.equal(left, right) };
        }
        if (type == "!=") {
            return { type: "boolean", value: !this.equal(left, right) };
        }
        if (left.type == "string" && right.type == "string" && type == "+") {
            return { type: "string", value: left.value + right.value };
        }
        if (left.type == "number" && right.type == "number") {
            switch (type) {
                case ">":
                    return { type: "boolean", value: left.number > right.number };
                case "<":
                    return { type: "boolean", value: left.number < right.number };
                case ">=":
                    return { type: "boolean", value: left.number >= right.number };
                case "<=":
                    return { type: "boolean", value: left.number <= right.number };
            }
            let number;
            switch (type) {
                case "+":
                    number = left.number + right.number;
                    break;
                case "-":
                    number = left.number - right.number;
                    break;
                case "*":
                    number = left.number * right.number;
                    break;
                case "/":
                    number = left.number / right.number;
                    break;
            }
            return { type: "number", number: number };
        }
        throw new Error(`Internal error: Tried to walk unknown binop ${type}`);
    }
    last_scope() {
        return this.scopes[this.scopes.length - 1];
    }
    pop_scope() {
        this.scopes.pop();
    }
    // Resets queued scope type
    push_scope() {
        this.scopes.push({ type: this.next_scope_type, vars: {} });
        this.next_scope_type = ScopeType.BLOCK;
    }
    push_try_scope(node) {
        this.scopes.push({ type: ScopeType.TRY, try_catch: node, vars: {} });
    }
    add_scope_var(name, value) {
        const vars = this.last_scope().vars;
        if (vars[name] != null) {
            this.error(`Variable ${name} already exists in the current scope`);
        }
        vars[name] = value;
    }
    set_var(name, value) {
        for (let ind = this.scopes.length - 1; ind >= 0; ind -= 1) {
            const vars = this.scopes[ind].vars;
            if (vars[name] != null) {
                vars[name] = value;
                return;
            }
        }
        this.error(`Variable ${name} doesn't exist.`);
    }
    get_var_value(name) {
        for (let ind = this.scopes.length - 1; ind >= 0; ind -= 1) {
            const val = this.scopes[ind].vars[name];
            if (val != null)
                return val;
        }
        this.error(`Variable ${name} doesn't exist.`);
        return NULL;
    }
    walk(node) {
        // Keep track of scope count, if it goes back,
        // then we've exited the scope
        let start_scope_count = this.scopes.length;
        switch (node.get_type()) {
            case ast_1.ASTType.BODY: {
                this.push_scope();
                for (let statement of node.statements) {
                    this.walk(statement);
                    if (this.scopes.length < start_scope_count)
                        return NULL;
                }
                this.pop_scope();
                return NULL;
            }
            case ast_1.ASTType.WHILE: {
                const while_ = node;
                while (this.is_truthy(this.walk(while_.condition))) {
                    this.next_scope_type = ScopeType.LOOP;
                    this.push_scope();
                    this.walk(while_.body);
                    this.pop_scope();
                    if (this.found_break())
                        return NULL;
                }
            }
            case ast_1.ASTType.NUMBER:
                return { type: "number", number: node.num };
            case ast_1.ASTType.STRING:
                return { type: "string", value: node.string };
            case ast_1.ASTType.VAR_DEF: {
                let def = node;
                this.add_scope_var(def.name, def.value == null ? NULL : this.walk(def.value));
                return NULL;
            }
            case ast_1.ASTType.BINOP: {
                let bin = node;
                return this.binop(this.walk(bin.left), this.walk(bin.right), bin.binop);
            }
            case ast_1.ASTType.PRINT: {
                let print = node;
                let output = to_string(this.walk(print.value));
                if (this.overloads.print) {
                    console.log(this.overloads.print);
                    let { error } = this.overloads.print(output);
                    if (error != null)
                        this.error(error);
                }
                else
                    console.log(output);
                return NULL;
            }
            case ast_1.ASTType.UNARY:
            case ast_1.ASTType.TERNARY: {
                let ternary = node;
                if (this.is_truthy(this.walk(ternary.cond))) {
                    return this.walk(ternary.if_true);
                }
                return this.walk(ternary.if_false);
            }
            case ast_1.ASTType.FUNCTION_CALL:
            case ast_1.ASTType.IDENTIFIER: {
                let identifier = node;
                return this.get_var_value(identifier.name);
            }
            case ast_1.ASTType.ASSIGN: {
                let assign = node;
                if (assign.var.get_type() != ast_1.ASTType.IDENTIFIER) {
                    this.error(`Cannot assign to non-variable`);
                }
                let val = this.walk(assign.value);
                this.set_var(assign.var.name, val);
                return val;
            }
            case ast_1.ASTType.IF: {
                let if_ = node;
                if (this.is_truthy(this.walk(if_.cond))) {
                    this.walk(if_.body);
                    return NULL;
                }
                for (let elif of if_.elifs) {
                    if (this.is_truthy(this.walk(elif.condition))) {
                        this.walk(elif.body);
                        return NULL;
                    }
                }
                if (if_.else != null)
                    this.walk(if_.else.body);
                return NULL;
            }
            case ast_1.ASTType.BREAK: {
                this.fire_break();
                return NULL;
            }
            case ast_1.ASTType.SWITCH: {
                // Add switch context
                this.next_scope_type = ScopeType.SWITCH;
                this.push_scope();
                let switch_ = node;
                let match = this.walk(switch_.match);
                let default_ = -1;
                let body_num = -1;
                for (let case_num = 0; case_num < switch_.cases.length; case_num += 1) {
                    const case_ = switch_.cases[case_num];
                    if (body_num > -1)
                        break;
                    if (case_.is_default)
                        default_ = case_num;
                    for (let expr of case_.cases) {
                        if (this.equal(this.walk(expr), match)) {
                            body_num = case_num;
                            break;
                        }
                    }
                }
                // If a case hasn't matched, go to default
                if (body_num == -1)
                    body_num = default_;
                // If there was no default, there was nothing to hit
                if (body_num == -1) {
                    this.pop_scope();
                    return NULL;
                }
                for (let case_num = body_num; case_num < switch_.cases.length; case_num += 1) {
                    for (let statement of switch_.cases[case_num].statements) {
                        this.walk(statement);
                        if (this.found_break()) {
                            this.pop_scope();
                            return NULL;
                        }
                    }
                }
                this.pop_scope();
                return NULL;
            }
            case ast_1.ASTType.TRY: {
                let Try = node;
                this.push_try_scope(Try);
                try {
                    this.walk(Try.try);
                }
                catch (err) {
                    // Pop newly created scopes
                    for (let scope_ind = this.scopes.length - 1; scope_ind >= start_scope_count - 1; scope_ind -= 1) {
                        this.pop_scope();
                    }
                    this.push_scope();
                    this.add_scope_var(Try.error_var_name, {
                        type: "string",
                        value: err.toString(),
                    });
                    this.walk(Try.catch);
                }
                return NULL;
            }
            case ast_1.ASTType.THROW: {
                this.error(to_string(this.walk(node.error)));
                return NULL;
            }
        }
        throw new Error(`Internal walk error: Unexpected node walk ${node.get_type()}`);
    }
}
exports.Walker = Walker;
