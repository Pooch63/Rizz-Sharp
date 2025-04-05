export declare enum ASTType {
    BODY = 0,
    VAR_DEF = 1,
    BINOP = 2,
    UNARY = 3,
    NUMBER = 4,
    STRING = 5,
    TERNARY = 6,
    FUNCTION_CALL = 7,
    IDENTIFIER = 8,
    ASSIGN = 9,
    THROW = 10,
    PRINT = 11,
    IF = 12,
    WHILE = 13,
    SWITCH = 14,
    BREAK = 15,
    TRY = 16,
    ERROR = 17
}
export declare abstract class ASTNode {
    private type;
    constructor(type: ASTType);
    get_type(): ASTType;
}
export declare class ASTBody extends ASTNode {
    statements: ASTNode[];
    constructor();
}
export declare class ASTVarDef extends ASTNode {
    name: string;
    value: ASTNode | null;
    constructor(name: string, value: ASTNode | null);
}
export type UnaryOp = "+" | "-";
export declare class ASTUnary extends ASTNode {
    unary: UnaryOp;
    arg: ASTNode;
    constructor(unary: UnaryOp, arg: ASTNode);
}
export type Binop = "+" | "-" | "*" | "/" | "==" | "!=" | "<" | ">" | "<=" | ">=";
export declare class ASTBinop extends ASTNode {
    left: ASTNode;
    right: ASTNode;
    binop: Binop;
    constructor(left: ASTNode, right: ASTNode, binop: Binop);
}
export declare class ASTNumber extends ASTNode {
    num: number;
    constructor(num: number);
}
export declare class ASTString extends ASTNode {
    string: string;
    constructor(string: string);
}
export declare class ASTTernary extends ASTNode {
    cond: ASTNode;
    if_true: ASTNode;
    if_false: ASTNode;
    constructor(cond: ASTNode, if_true: ASTNode, if_false: ASTNode);
}
export declare class ASTFunctionCall extends ASTNode {
    function: ASTNode;
    arguments: ASTNode[];
    constructor(function_: ASTNode, arguments_: ASTNode[]);
}
export declare class ASTIdentifier extends ASTNode {
    name: string;
    constructor(name: string);
}
export declare class ASTAssignment extends ASTNode {
    var: ASTNode;
    value: ASTNode;
    constructor(var_: ASTNode, value: ASTNode);
}
export type Elif = {
    condition: ASTNode;
    body: ASTBody | ASTNode;
};
export type Else = {
    body: ASTBody | ASTNode;
};
export declare class ASTIf extends ASTNode {
    cond: ASTNode;
    body: ASTBody | ASTNode;
    elifs: Elif[];
    else: Else | null;
    constructor(cond: ASTNode, body: ASTBody | ASTNode, elifs: Elif[], else_: Else | null);
}
export declare class ASTWhile extends ASTNode {
    condition: ASTNode;
    body: ASTBody | ASTNode;
    constructor(condition: ASTNode, body: ASTBody | ASTNode);
}
export type ASTSwitchCase = {
    cases: ASTNode[];
    is_default: boolean;
    statements: ASTNode[];
};
export declare class ASTSwitch extends ASTNode {
    match: ASTNode;
    cases: ASTSwitchCase[];
    constructor(match: ASTNode, cases: ASTSwitchCase[]);
}
export declare class ASTBreak extends ASTNode {
    constructor();
}
export declare class ASTTryCatch extends ASTNode {
    try: ASTBody;
    error_var_name: string;
    catch: ASTBody;
    constructor(try_: ASTBody, error_var_name: string, catch_: ASTBody);
}
export declare class ASTThrow extends ASTNode {
    error: ASTNode;
    constructor(error: ASTNode);
}
export declare class ASTPrint extends ASTNode {
    value: ASTNode;
    constructor(value: ASTNode);
}
declare class ASTError extends ASTNode {
    constructor();
}
export declare const ast_error: ASTError;
export declare const ast_break: ASTBreak;
export {};
