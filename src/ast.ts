export enum ASTType {
  BODY,
  VAR_DEF,
  BINOP,
  UNARY,
  NUMBER,
  STRING,
  TERNARY,
  FUNCTION_CALL,
  IDENTIFIER,
  ASSIGN,
  THROW,
  PRINT,

  IF,
  WHILE,
  SWITCH,
  BREAK,

  TRY,

  ERROR,
}

export abstract class ASTNode {
  private type: ASTType;
  constructor(type: ASTType) {
    this.type = type;
  }

  public get_type() {
    return this.type;
  }
}
export class ASTBody extends ASTNode {
  public statements: ASTNode[] = [];
  constructor() {
    super(ASTType.BODY);
  }
}
export class ASTVarDef extends ASTNode {
  public name: string;
  public value: ASTNode | null;
  constructor(name: string, value: ASTNode | null) {
    super(ASTType.VAR_DEF);
    this.name = name;
    this.value = value;
  }
}

export type UnaryOp = "+" | "-";
export class ASTUnary extends ASTNode {
  public unary: UnaryOp;
  public arg: ASTNode;
  constructor(unary: UnaryOp, arg: ASTNode) {
    super(ASTType.UNARY);
    this.unary = unary;
    this.arg = arg;
  }
}

export type Binop =
  | "+"
  | "-"
  | "*"
  | "/"
  | "=="
  | "!="
  | "<"
  | ">"
  | "<="
  | ">=";
export class ASTBinop extends ASTNode {
  public left: ASTNode;
  public right: ASTNode;
  public binop: Binop;

  constructor(left: ASTNode, right: ASTNode, binop: Binop) {
    super(ASTType.BINOP);
    this.left = left;
    this.right = right;
    this.binop = binop;
  }
}

export class ASTNumber extends ASTNode {
  public num: number;
  constructor(num: number) {
    super(ASTType.NUMBER);
    this.num = num;
  }
}

export class ASTString extends ASTNode {
  public string: string;
  constructor(string: string) {
    super(ASTType.STRING);
    this.string = string;
  }
}

export class ASTTernary extends ASTNode {
  public cond: ASTNode;
  public if_true: ASTNode;
  public if_false: ASTNode;
  constructor(cond: ASTNode, if_true: ASTNode, if_false: ASTNode) {
    super(ASTType.TERNARY);
    this.cond = cond;
    this.if_true = if_true;
    this.if_false = if_false;
  }
}

export class ASTFunctionCall extends ASTNode {
  public function: ASTNode;
  public arguments: ASTNode[];
  constructor(function_: ASTNode, arguments_: ASTNode[]) {
    super(ASTType.FUNCTION_CALL);
    this.function = function_;
    this.arguments = arguments_;
  }
}

export class ASTIdentifier extends ASTNode {
  public name: string;
  constructor(name: string) {
    super(ASTType.IDENTIFIER);
    this.name = name;
  }
}
export class ASTAssignment extends ASTNode {
  public var: ASTNode;
  public value: ASTNode;
  constructor(var_: ASTNode, value: ASTNode) {
    super(ASTType.ASSIGN);
    this.var = var_;
    this.value = value;
  }
}

export type Elif = {
  condition: ASTNode;
  body: ASTBody | ASTNode;
};
export type Else = {
  body: ASTBody | ASTNode;
};
export class ASTIf extends ASTNode {
  public cond: ASTNode;
  public body: ASTBody | ASTNode;
  public elifs: Elif[];
  public else: Else | null;

  constructor(
    cond: ASTNode,
    body: ASTBody | ASTNode,
    elifs: Elif[],
    else_: Else | null
  ) {
    super(ASTType.IF);
    this.cond = cond;
    this.body = body;
    this.elifs = elifs;
    this.else = else_;
  }
}
export class ASTWhile extends ASTNode {
  public condition: ASTNode;
  public body: ASTBody | ASTNode;
  constructor(condition: ASTNode, body: ASTBody | ASTNode) {
    super(ASTType.WHILE);
    this.condition = condition;
    this.body = body;
  }
}
export type ASTSwitchCase = {
  // The things in
  //    case 1:
  //    case 2:
  //    case "3":
  cases: ASTNode[];
  // Does the default include this?
  is_default: boolean;
  // Every statement in case
  statements: ASTNode[];
};
export class ASTSwitch extends ASTNode {
  public match: ASTNode;
  public cases: ASTSwitchCase[];
  constructor(match: ASTNode, cases: ASTSwitchCase[]) {
    super(ASTType.SWITCH);
    this.match = match;
    this.cases = cases;
  }
}

export class ASTBreak extends ASTNode {
  constructor() {
    super(ASTType.BREAK);
  }
}

export class ASTTryCatch extends ASTNode {
  public try: ASTBody;
  public error_var_name: string;
  public catch: ASTBody;
  constructor(try_: ASTBody, error_var_name: string, catch_: ASTBody) {
    super(ASTType.TRY);
    this.try = try_;
    this.error_var_name = error_var_name;
    this.catch = catch_;
  }
}
export class ASTThrow extends ASTNode {
  public error: ASTNode;
  constructor(error: ASTNode) {
    super(ASTType.THROW);
    this.error = error;
  }
}

export class ASTPrint extends ASTNode {
  public value: ASTNode;
  constructor(value: ASTNode) {
    super(ASTType.PRINT);
    this.value = value;
  }
}

class ASTError extends ASTNode {
  constructor() {
    super(ASTType.ERROR);
  }
}
export const ast_error = new ASTError();
export const ast_break = new ASTBreak();
