"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ast_break = exports.ast_error = exports.ASTPrint = exports.ASTThrow = exports.ASTTryCatch = exports.ASTBreak = exports.ASTSwitch = exports.ASTWhile = exports.ASTIf = exports.ASTAssignment = exports.ASTIdentifier = exports.ASTFunctionCall = exports.ASTTernary = exports.ASTString = exports.ASTNumber = exports.ASTBinop = exports.ASTUnary = exports.ASTVarDef = exports.ASTBody = exports.ASTNode = exports.ASTType = void 0;
var ASTType;
(function (ASTType) {
    ASTType[ASTType["BODY"] = 0] = "BODY";
    ASTType[ASTType["VAR_DEF"] = 1] = "VAR_DEF";
    ASTType[ASTType["BINOP"] = 2] = "BINOP";
    ASTType[ASTType["UNARY"] = 3] = "UNARY";
    ASTType[ASTType["NUMBER"] = 4] = "NUMBER";
    ASTType[ASTType["STRING"] = 5] = "STRING";
    ASTType[ASTType["TERNARY"] = 6] = "TERNARY";
    ASTType[ASTType["FUNCTION_CALL"] = 7] = "FUNCTION_CALL";
    ASTType[ASTType["IDENTIFIER"] = 8] = "IDENTIFIER";
    ASTType[ASTType["ASSIGN"] = 9] = "ASSIGN";
    ASTType[ASTType["THROW"] = 10] = "THROW";
    ASTType[ASTType["PRINT"] = 11] = "PRINT";
    ASTType[ASTType["IF"] = 12] = "IF";
    ASTType[ASTType["WHILE"] = 13] = "WHILE";
    ASTType[ASTType["SWITCH"] = 14] = "SWITCH";
    ASTType[ASTType["BREAK"] = 15] = "BREAK";
    ASTType[ASTType["TRY"] = 16] = "TRY";
    ASTType[ASTType["ERROR"] = 17] = "ERROR";
})(ASTType || (exports.ASTType = ASTType = {}));
class ASTNode {
    type;
    constructor(type) {
        this.type = type;
    }
    get_type() {
        return this.type;
    }
}
exports.ASTNode = ASTNode;
class ASTBody extends ASTNode {
    statements = [];
    constructor() {
        super(ASTType.BODY);
    }
}
exports.ASTBody = ASTBody;
class ASTVarDef extends ASTNode {
    name;
    value;
    constructor(name, value) {
        super(ASTType.VAR_DEF);
        this.name = name;
        this.value = value;
    }
}
exports.ASTVarDef = ASTVarDef;
class ASTUnary extends ASTNode {
    unary;
    arg;
    constructor(unary, arg) {
        super(ASTType.UNARY);
        this.unary = unary;
        this.arg = arg;
    }
}
exports.ASTUnary = ASTUnary;
class ASTBinop extends ASTNode {
    left;
    right;
    binop;
    constructor(left, right, binop) {
        super(ASTType.BINOP);
        this.left = left;
        this.right = right;
        this.binop = binop;
    }
}
exports.ASTBinop = ASTBinop;
class ASTNumber extends ASTNode {
    num;
    constructor(num) {
        super(ASTType.NUMBER);
        this.num = num;
    }
}
exports.ASTNumber = ASTNumber;
class ASTString extends ASTNode {
    string;
    constructor(string) {
        super(ASTType.STRING);
        this.string = string;
    }
}
exports.ASTString = ASTString;
class ASTTernary extends ASTNode {
    cond;
    if_true;
    if_false;
    constructor(cond, if_true, if_false) {
        super(ASTType.TERNARY);
        this.cond = cond;
        this.if_true = if_true;
        this.if_false = if_false;
    }
}
exports.ASTTernary = ASTTernary;
class ASTFunctionCall extends ASTNode {
    function;
    arguments;
    constructor(function_, arguments_) {
        super(ASTType.FUNCTION_CALL);
        this.function = function_;
        this.arguments = arguments_;
    }
}
exports.ASTFunctionCall = ASTFunctionCall;
class ASTIdentifier extends ASTNode {
    name;
    constructor(name) {
        super(ASTType.IDENTIFIER);
        this.name = name;
    }
}
exports.ASTIdentifier = ASTIdentifier;
class ASTAssignment extends ASTNode {
    var;
    value;
    constructor(var_, value) {
        super(ASTType.ASSIGN);
        this.var = var_;
        this.value = value;
    }
}
exports.ASTAssignment = ASTAssignment;
class ASTIf extends ASTNode {
    cond;
    body;
    elifs;
    else;
    constructor(cond, body, elifs, else_) {
        super(ASTType.IF);
        this.cond = cond;
        this.body = body;
        this.elifs = elifs;
        this.else = else_;
    }
}
exports.ASTIf = ASTIf;
class ASTWhile extends ASTNode {
    condition;
    body;
    constructor(condition, body) {
        super(ASTType.WHILE);
        this.condition = condition;
        this.body = body;
    }
}
exports.ASTWhile = ASTWhile;
class ASTSwitch extends ASTNode {
    match;
    cases;
    constructor(match, cases) {
        super(ASTType.SWITCH);
        this.match = match;
        this.cases = cases;
    }
}
exports.ASTSwitch = ASTSwitch;
class ASTBreak extends ASTNode {
    constructor() {
        super(ASTType.BREAK);
    }
}
exports.ASTBreak = ASTBreak;
class ASTTryCatch extends ASTNode {
    try;
    error_var_name;
    catch;
    constructor(try_, error_var_name, catch_) {
        super(ASTType.TRY);
        this.try = try_;
        this.error_var_name = error_var_name;
        this.catch = catch_;
    }
}
exports.ASTTryCatch = ASTTryCatch;
class ASTThrow extends ASTNode {
    error;
    constructor(error) {
        super(ASTType.THROW);
        this.error = error;
    }
}
exports.ASTThrow = ASTThrow;
class ASTPrint extends ASTNode {
    value;
    constructor(value) {
        super(ASTType.PRINT);
        this.value = value;
    }
}
exports.ASTPrint = ASTPrint;
class ASTError extends ASTNode {
    constructor() {
        super(ASTType.ERROR);
    }
}
exports.ast_error = new ASTError();
exports.ast_break = new ASTBreak();
