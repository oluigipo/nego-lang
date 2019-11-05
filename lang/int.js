let variables = {};
let $return;
let $returned = false;
let $enterfunc = [];
let $break = false;
let $continue = false;
let $loop = false;
let enter = 0;
const constants = {
    $true: { type: TYPE.NUMLIT, value: 1 },
    $false: { type: TYPE.NUMLIT, value: 0 }
};
const funcs = {
    input: function () { return { type: TYPE.STRLIT, value: prompt() }; },
    print: function (s) { console.log(s); return { type: TYPE.NUMLIT, value: 0 } },
    num: function (s) { return { type: TYPE.NUMLIT, value: Number(s) }; },
    str: function (n) { return { type: TYPE.STRLIT, value: String(n) }; },
    len: function (arr) { return { type: TYPE.NUMLIT, value: arr.length }; }
};

/**
 * @type {{functions: Function[], code: Block}}
 */
let tree;

/**
 * @param {{functions: Function[], code: Block}} parseTree 
 */
function interpreter(parseTree) {
    tree = parseTree;

    console.log("|| OUTPUT ||");
    interpretBlock(tree.code);
}

/**
 * @param {Block} block 
 */
function interpretBlock(block) {
    enter++;
    for (let i = 0; i < block.length; i++) {
        const code = block[i];

        if (code.isExpr) {
            interpretExpr(code);
        } else {
            interpretStmt(code);
        }

        let p = $enterfunc[$enterfunc.length - 1];
        if ($returned && enter <= p) {
            if (p - 1 === enter) $returned = false;
            break;
        }
        if ($continue) break;
    }

    $continue = false;
    variables = variables.$parent;
    enter--;
}

/**
 * 
 * @param {Statement} stmt 
 */
function interpretStmt(stmt) {
    let result;
    let save;
    switch (stmt.operation) {
        case STATEMENT.IF:
            result = (stmt.condition.isExpr) ? interpretExpr(stmt.condition) : stmt.condition;

            if (result.type === TYPE.IDENT) result = getVar(result.value);
            if (result.type === TYPE.STRLIT) throw "Cannot use a string as a condition.";

            let toInterpret = (result.value !== 0) ? stmt.block1 : stmt.block2;

            save = variables;
            variables = { $parent: save };

            interpretBlock(toInterpret);

            break;
        case STATEMENT.RETURN:
            $return = stmt.value.isExpr ? interpretExpr(stmt.value) : stmt.value.type === TYPE.IDENT ? getVar(stmt.value.value) : stmt.value;
            $continue = true;
            $returned = true;
            $enterfunc.push(enter);
            break;
        case STATEMENT.WHILE:
            result = (stmt.condition.isExpr) ? interpretExpr(stmt.condition) : stmt.condition;

            if (result.type === TYPE.IDENT) result = getVar(result.value);
            if (result.type === TYPE.STRLIT) throw "Cannot use a string as a condition.";

            $loop = true;
            while (result.value !== 0 && !$break) {
                save = variables;
                variables = { $parent: save };

                interpretBlock(stmt.block);
                result = interpretExpr(stmt.condition);
                if (result.type === TYPE.IDENT) result = getVar(result.value);
                if (result.type === TYPE.STRLIT) throw "Cannot use a string as a condition.";
            }

            $loop = false;
            $break = false;

            break;
        case STATEMENT.LOOP:
            if (stmt.it === null) {
                $loop = true;
                while (!$break) {
                    save = variables;
                    variables = { $parent: save };
                    interpretBlock(stmt.block);
                }
                $break = false;
                $loop = false;
                break;
            }

            let itName = stmt.it.value;
            let times;
            if (stmt.value.isExpr) {
                times = interpretExpr(stmt.value);
            } else {
                times = stmt.value.type === TYPE.IDENT ? getVar(stmt.value.value) : stmt.value;
            }
            if (times.type === TYPE.STRLIT) throw "Cannor loop iterating a string.";
            $loop = true;

            for (let i = 0; i < times.value && !$break; i++) {
                save = variables;
                variables = { $parent: save };
                setVar(itName, { type: TYPE.NUMLIT, value: i });
                interpretBlock(stmt.block);
            }

            $break = false;
            $loop = false;

            break;
        case STATEMENT.BREAK:
            if (!$loop) throw "Break statement outside a loop.";
            $break = true;
            $continue = true;
            break;
        case STATEMENT.CONTINUE:
            if (!$loop) throw "Continue statement outside a loop.";
            $continue = true;
            break;
    }
}

/**
 * @returns {Literal}
 * @param {Expression} expr 
 */
function interpretExpr(expr) {
    //if (!expr.isExpr) throw "Unknown Exception.";
    let result;/**@type {Literal} */
    let left;
    let right;
    switch (expr.operation) {
        case '=':
            if (expr.left.type !== TYPE.IDENT || OPERATIONS.includes(expr.left.value)
                || constants['$' + expr.left.value] !== undefined)
                throw `${expr.left.value} isn't assignable.`;

            if (expr.right.isExpr === undefined) {
                result = expr.right.type === TYPE.IDENT ? getVar(expr.right.value) : expr.right;
            } else {
                result = interpretExpr(expr.right);
            }

            setVar(expr.left.value, result);
            return result;
            break;
        case '==':
        case '!=':
        case '>':
        case '<':
        case '>=':
        case '<=':
        case '&&':
        case '||':
            if (expr.left.isExpr) {
                left = interpretExpr(expr.left);
            } else {
                left = expr.left.type === TYPE.IDENT ? getVar(expr.left.value) : expr.left;
            }

            if (expr.right.isExpr) {
                right = interpretExpr(expr.right);
            } else {
                right = expr.right.type === TYPE.IDENT ? getVar(expr.right.value) : expr.right;
            }

            if (right.type !== left.type) return { type: TYPE.NUMLIT, result: +(expr.operation === '!=') };

            result = { type: TYPE.NUMLIT, value: null };
            switch (expr.operation) {
                case '==': result.value = left.value === right.value; break;
                case '!=': result.value = left.value !== right.value; break;
                case '>': result.value = left.value > right.value; break;
                case '<': result.value = left.value < right.value; break;
                case '>=': result.value = left.value >= right.value; break;
                case '<=': result.value = left.value <= right.value; break;
                case '&&': result.value = left.value !== 0 && right.value !== 0; break;
                case '||': result.value = left.value !== 0 || right.value !== 0; break;
                default: throw "HOW????????? HOW DID YOU GOT THIS EXCEPTION???";
            }
            result.value = Number(result.value);

            return result;
            break;
        case '*':
        case '/':
        case '+':
        case '-':
            if (expr.left.isExpr) {
                left = interpretExpr(expr.left);
            } else {
                left = expr.left.type === TYPE.IDENT ? getVar(expr.left.value) : expr.left;
            }

            if (expr.right.isExpr) {
                right = interpretExpr(expr.right);
            } else {
                right = expr.right.type === TYPE.IDENT ? getVar(expr.right.value) : expr.right;
            }

            if (right.type !== left.type) throw `Cannot calculate numbers with strings.`;
            if (expr.operation !== '+' && (right.type === TYPE.STRLIT))
                throw `Cannot ${expr.operation} with strings.`;

            result = { type: right.type };
            switch (expr.operation) {
                case '+': result.value = left.value + right.value; break;
                case '-': result.value = left.value - right.value; break;
                case '*': result.value = left.value * right.value; break;
                case '/': result.value = left.value / right.value; break;
                default: throw "HOW????????? HOW DID YOU GOT THIS EXCEPTION???";
            }
            return result;
            break;
        case "call":
            if (expr.left.type !== TYPE.IDENT) throw `Cannot use ${expr.left.value} as a function.`;
            left = expr.left.value;

            /**@type {Literal[]} */
            let args = [];

            if (expr.right.length > 0) {
                expr.right.forEach(arg => {
                    if (arg.isExpr) {
                        args.push(interpretExpr(arg));
                    } else {
                        args.push(arg.type === TYPE.IDENT ? getVar(arg.value) : arg);
                    }
                });
            }

            let func = FUNCTIONS.find(a => a === expr.left.value);
            if (func === undefined) {
                let funct = tree.functions.find(f => f.name === expr.left.value);
                if (funct === undefined) throw `${expr.left.value} isn't a function.`;

                let save = variables;
                variables = { $parent: save };

                funct.args.forEach((arg, i) => {
                    variables[arg.name] = args[i];
                });

                interpretBlock(funct.block);

                let final = $return;
                $return = 0;
                return final;
            } else {
                let funct = funcs[func];
                args = args.map(a => a.type === TYPE.IDENT ? getVar(a.value).value : a.value);

                return funct(...args);
            }

            break;
    }
}

/**
 * @returns {Literal}
 * @param {string} name 
 */
function getVar(name) {
    if (constants['$' + name] !== undefined) return constants['$' + name];
    let copy = { ...variables };

    while (copy[name] === undefined && copy.$parent !== undefined) copy = copy.$parent;

    if (copy[name] === undefined || copy[name] === null) {
        throw `Variable '${name}' not set before reading it.`;
    }

    return copy[name];
}

/**
 * @param {string} name
 * @param {Literal} value
 */
function setVar(name, value) {
    let copy = { ...variables };

    let deep = 0;
    while (copy[name] === undefined && copy.$parent !== undefined) {
        copy = copy.$parent;
        deep++;
    }

    if (copy[name] === undefined || deep === 0) {
        variables[name] = value;
    } else {
        copy[name] = value;
    }
}