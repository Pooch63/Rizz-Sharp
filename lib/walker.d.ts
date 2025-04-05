import { ASTNode } from "./ast";
export type Overloads = {
    print?: (output: string) => {
        error: string | null;
    };
};
type Number = {
    type: "number";
    number: number;
};
type Boolean = {
    type: "boolean";
    value: boolean;
};
type String = {
    type: "string";
    value: string;
};
type Null = {
    type: "null";
};
type Value = Number | Boolean | String | Null;
export declare class Walker {
    private scopes;
    private had_error;
    private break_fired;
    private next_scope_type;
    private overloads;
    constructor(overloads: Overloads);
    private fire_break;
    private found_break;
    private error;
    private equal;
    private is_truthy;
    private binop;
    private last_scope;
    private pop_scope;
    private push_scope;
    private push_try_scope;
    private add_scope_var;
    private set_var;
    private get_var_value;
    walk(node: ASTNode): Value | never;
}
export {};
