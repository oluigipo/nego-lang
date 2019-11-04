
function indexesOf(array, value) {
    let indexes = [];
    for (let i = 0; i < array.length; i++)
        if (array[i] === value) indexes.push(i);

    return indexes;
}

function indexesOfA(array, values) {
    let indexes = [];
    for (let i = 0; i < array.length; i++)
        if (values.includes(array[i])) indexes.push(i);

    return indexes;
}

function splitArray(array, value) {
    let newarr = [];
    let cn = 0;
    for (let i = 0; i < array.length; i++)
        if (array[i] === value) {
            newarr.push(array.slice(cn, i));
            cn = i + 1;
        }

    if (cn < array.length) newarr.push(array.slice(cn, array.length));

    return newarr;
}

function findPairOf(array, index, open, pair, dir = 1) {
    let j = index + dir;
    let count = 0;
    while (array[j] !== pair || count > 0) {
        if (array[j] === open) count += dir;
        else if (array[j] === pair) count -= dir;
        else if (j >= array.length) return -1;

        j += dir;
    }

    return j;
}

const TYPE = {
    NUMLIT: 0, STRLIT: 1, IDENT: 2
};
const OPERATOR = [
    '==', '=', '+', '-', '(', ')', '*', '/', '>', '<', '>=', '<=', '!=', '&&', '||', ':'
];
const STATEMENT = {
    IF: 0, LOOP: 1, RETURN: 2, ELSE: 3, WHILE: 4, FUNC: 5, BREAK: 6, CONTINUE: 7
};
const OPERATIONS = [
    "if", "loop", "return", "else", "while", "func", "break", "continue"
];
const FUNCTIONS = ["input", "print", "num", "str", "len"];

const rules = [
    { name: "line_comment", re: /^\/\/.+$/ },
    { name: "comment", re: /^\/\*[^(\*\/)]*\*\// },
    { name: "number_literal", re: /^[0-9]+(\.[0-9]+)?/ },
    { name: "string_literal", re: /^".+?"/ },
    { name: "plus", re: /^\+/ },
    { name: "minus", re: /^-/ },
    { name: "div", re: /^\// },
    { name: "mult", re: /^\*/ },
    { name: "open_c", re: /^\{/ },
    { name: "close_c", re: /^\}/ },
    { name: "open_b", re: /^\[/ },
    { name: "close_b", re: /^\]/ },
    { name: "open_p", re: /^\(/ },
    { name: "close_p", re: /^\)/ },
    { name: "double_equals", re: /^==/ },
    { name: "dif_equals", re: /^!=/ },
    { name: "lazy_and", re: /^&&/ },
    { name: "lazy_or", re: /^\|\|/ },
    { name: "less_equals", re: /^<=/ },
    { name: "greater_equals", re: /^>=/ },
    { name: "greater", re: /^>/ },
    { name: "less", re: /^</ },
    { name: "equals", re: /^=/ },
    { name: "plus_equals", re: /^\+=/ },
    { name: "minus_equals", re: /^-=/ },
    { name: "mult_equals", re: /^\*=/ },
    { name: "div_equals", re: /^\/=/ },
    { name: "double_colon", re: /^:/ },
    { name: "semi-colon", re: /^;/ },
    { name: "colon", re: /^,/ },
    { name: "function", re: /^func\b/ },
    { name: "return", re: /^return\b/ },
    { name: "loop", re: /^loop\b/ },
    { name: "break", re: /^break\b/ },
    { name: "continue", re: /^continue\b/ },
    { name: "else", re: /^else\b/ },
    { name: "if", re: /^if\b/ },
    { name: "identifier", re: /^[a-zA-Z_]+/ }, // [a-zA-Z_0-9]
    // { name: "INVALID", re: /./ }
];

/**
 * @typedef {0 | 1 | 2 | 3} STMT
 * @typedef {{isExpr: false, operation: STMT}} Statement
 * @typedef {(Statement | Expression)[]} Block
 * @typedef {{type: 0|1|2, value: string | number}} Literal
 * @typedef {{isExpr: true, left: Expression | Literal, right: Expression | Literal, operation: string}} Expression
 * @typedef {{block: Block, name: string, args: Literal[]}} Function
 */

/**
 * @returns {string[]} Tokens.
 * @param {string} source The SourceCode to tokenize.
 */
function tokenize(source) {
    if (source === null || source === undefined) return null;
    function getToken(str) {
        for (let i = 0; i < rules.length; i++) {
            let result = rules[i].re.exec(str);

            if (result === null) continue;
            if(rules[i].name=="INVALID") throw `invalid token ${result[0]}`;

            return { ...result, i: i };
        }

        return null;
    }

    let tks = [];
    let count = 0;

    while (count < source.length) {
        let raw = getToken(source.slice(count, source.length));

        if (raw !== null) {
            let tkn = raw[0];
            if (raw.i > 1) tks.push(tkn);
            count += tkn.length;
        } else count++;
    }

    return tks;
}

/**
 * @returns {object}
 * @param {string[]} tokens
 */
function parse(tokens) {
    tokens = ['{', ...tokens, '}'];
    let parseTree = { functions: [], code: [] };
    let funcsIndexes = indexesOf(tokens, OPERATIONS[STATEMENT.FUNC]);
    funcsIndexes.reverse();

    for (let i = 0; i < funcsIndexes.length; i++) {
        let k = tokens.indexOf('{', funcsIndexes[i]);
        let count = 0;
        while (tokens[++k] !== '}' || count > 0) {
            if (tokens[k] === '{') count++;
            else if (tokens[k] === '}') count--;
            else if (k > tokens.length) throw ("Syntax Error. (2)");
        }

        let _separatedTokens = tokens.slice(funcsIndexes[i], k + 1);
        parseTree.functions.push(parseFunction(_separatedTokens));

        tokens.splice(funcsIndexes[i], k - funcsIndexes[i] + 1);
    }

    parseTree.code = parseBlock(tokens);

    return parseTree;
}

/**
 * @returns {object}
 * @param {string[]} tokens
 */
function parseFunction(tokens) {
    let func = {
        name: null,
        block: null,
        args: null
    };

    if (tokens[2] !== '(' || tokens[1] === '(') throw "Syntax error. (0)";
    func.name = tokens[1];

    let j = 2;
    let k = tokens.indexOf(')');

    let args = tokens.slice(j + 1, k).filter(a => a !== ',').map(a => a = { name: a });
    func.args = args;

    if (tokens[k + 1] !== '{') throw "Syntax Error. (1)";
    let block = tokens.slice(k + 1, tokens.length);
    func.block = parseBlock(block);

    return func;
}

/**
 * @returns {object}
 * @param {string[]} tokens 
 */
function parseBlock(tokens) {
    if (tokens[0] === '{') {
        if (tokens[tokens.length - 1] !== '}') throw `Syntax error. (3) ${tokens}`;

        tokens = tokens.slice(1, tokens.length - 1);
        if (tokens.length === 0) return [];

        let parts = [];
        let stop = 0;
        for (let i = 0; i < tokens.length; i++) {
            if (OPERATIONS.some(a => a === tokens[i])) {
                if (tokens[i] === OPERATIONS[STATEMENT.RETURN] || tokens[i] === OPERATIONS[STATEMENT.BREAK]
                    || tokens[i] === OPERATIONS[STATEMENT.CONTINUE]) {
                    let end = tokens.indexOf(';', i);
                    if (end === -1) throw "Expected ';' after 'return' statement.";
                    let oop = tokens.slice(i, end);
                    parts.push(parseStmt(oop));
                    stop = end + 1;
                    continue;
                }

                const checkForElse = function () {
                    if (tokens[j + 1] === "if") j++;

                    let pair = findPairOf(tokens, tokens.indexOf('{', j + 1), '{', '}');
                    if (pair === -1) throw "Missing closing '{'";

                    j = pair + 1;
                    if (tokens[j] === OPERATIONS[STATEMENT.ELSE]) checkForElse();
                }
                if (stop < i - 1) throw "Syntax error. (4)";
                if (tokens[i] === OPERATIONS[STATEMENT.ELSE]) throw "'else' statement unexpected.";

                let j = tokens.indexOf('{', i);
                let count = 0;
                while (tokens[++j] !== '}' || count > 0) {
                    if (tokens[j] === '{') count++;
                    else if (tokens[j] === '}') count--;
                    else if (j > tokens.length) throw (`Syntax Error. (5) ${count}, ${j}, ${tokens}`);
                }
                j++;

                if (tokens[i] === OPERATIONS[STATEMENT.IF] && tokens[j] === OPERATIONS[STATEMENT.ELSE]) {
                    checkForElse();
                }

                let op = tokens.slice(i, j);
                parts.push(parseStmt(op));
                stop = j;
                i = j;
            } else if (tokens[i] === ';') {
                let op = tokens.slice(stop, i);
                parts.push(parseExpr(op));
                stop = i + 1;
            }
        }

        return parts;

    } else {
        let op = OPERATIONS.some(a => a === tokens[0]) ? parseStmt(tokens) : parseExpr(tokens);
        return [op];
    }
}

/**
 * @returns {object}
 * @param {string[]} tokens
 */
function parseExpr(tokens) {
    function insideParenthesis(toks, index) {
        let count = 0;
        for (let i = 0; i < index; i++)
            if (toks[i] === '(') count++;
            else if (toks[i] === ')') count--;

        if (count < 0) throw "Syntax Error.";
        return (count > 0);
    }

    function parseCall(toks) {
        let expr = {
            isExpr: true,
            operation: null,
            left: null,
            right: null
        };

        expr.operation = "call";
        expr.left = { type: TYPE.IDENT, value: toks[0] };

        let end = findPairOf(toks, 1, '(', ')');
        if (end === -1) throw "Missing pair of '('.";

        let args = [];

        if (end > 2) {
            let rawargs = toks.slice(2, end);

            let count = 0;
            let last = 0;
            for (let i = 0; i < rawargs.length; i++) {
                if (rawargs[i] === '(') count++;
                else if (rawargs[i] === ')') count++;
                else if (rawargs[i] === ',' && count === 0) {
                    args.push(parseExpr(rawargs.slice(last, i)));
                    last = i + 1;
                }
            }

            if (last < rawargs.length) args.push(parseExpr(rawargs.slice(last, rawargs.length)));
        }

        expr.right = args;

        return expr;
    }

    function parseLiteral(toks) {
        if (toks.length > 1 && toks[1] === '(') {
            return parseCall(toks);
        }

        let lit = toks[0];
        let r = testRule(lit);
        switch (r) {
            case TYPE.NUMLIT: return { type: TYPE.NUMLIT, value: Number(lit) };
            case TYPE.STRLIT: return { type: TYPE.STRLIT, value: lit.slice(1, lit.length - 1) };
            case TYPE.IDENT: return { type: TYPE.IDENT, value: lit };
        }
        throw "Literal/Identifier doesn't match with any grammar of Literal/Identifier.";
    }

    function parseMult(toks) {
        let expr = {
            isExpr: true,
            operation: null,
            left: null,
            right: null
        };

        let last = indexesOfA(toks, ['*', '/']);
        if (last.length === 0) return parseLiteral(toks);

        while (insideParenthesis(toks, last[last.length - 1]))
            if (last.length - 1 === 0)
                return parseLiteral(toks);
            else last = last.slice(0, last.length - 1);

        last = last[last.length - 1];
        if (last === 0 || last === toks.length - 1) throw "Invalid Expression.";

        expr.left = parseExpr(toks.slice(0, last));
        expr.right = parseExpr(toks.slice(last + 1, toks.length));
        expr.operation = toks[last];
        return expr;
    }

    function parseAdic(toks) {
        let expr = {
            isExpr: true,
            operation: null,
            left: null,
            right: null
        };

        let last = indexesOfA(toks, ['+', '-']);
        if (last.length === 0) return parseMult(toks);

        while (insideParenthesis(toks, last[last.length - 1]))
            if (last.length - 1 === 0)
                return parseMult(toks);
            else last = last.slice(0, last.length - 1);

        last = last[last.length - 1];
        if (last === 0 || last === toks.length - 1) throw "Invalid Expression.";

        expr.left = parseExpr(toks.slice(0, last));
        expr.right = parseExpr(toks.slice(last + 1, toks.length));
        expr.operation = toks[last];
        return expr;
    }

    function parseComp(toks) {
        let expr = {
            isExpr: true,
            operation: null,
            left: null,
            right: null
        };

        let last = indexesOfA(toks, ['>', '<', '>=', '<=']);
        if (last.length === 0) return parseAdic(toks);

        while (insideParenthesis(toks, last[last.length - 1]))
            if (last.length - 1 === 0)
                return parseAdic(toks);
            else last = last.slice(0, last.length - 1);

        last = last[last.length - 1];
        if (last === 0 || last === toks.length - 1) throw "Invalid Expression.";

        expr.left = parseExpr(toks.slice(0, last));
        expr.right = parseExpr(toks.slice(last + 1, toks.length));
        expr.operation = toks[last];
        return expr;
    }

    function parseEqual(toks) {
        let expr = {
            isExpr: true,
            operation: null,
            left: null,
            right: null
        };

        let last = indexesOfA(toks, ['==', '!=']);
        if (last.length === 0) return parseComp(toks);

        while (insideParenthesis(toks, last[last.length - 1]))
            if (last.length - 1 === 0)
                return parseComp(toks);
            else last = last.slice(0, last.length - 1);

        last = last[last.length - 1];
        if (last === 0 || last === toks.length - 1) throw "Invalid Expression.";

        expr.left = parseExpr(toks.slice(0, last));
        expr.right = parseExpr(toks.slice(last + 1, toks.length));
        expr.operation = toks[last];
        return expr;
    }

    function parseLazy(toks) {
        let expr = {
            isExpr: true,
            operation: null,
            left: null,
            right: null
        };

        let last = indexesOfA(toks, ['&&', '||']);
        if (last.length === 0) return parseEqual(toks);

        while (insideParenthesis(toks, last[last.length - 1]))
            if (last.length - 1 === 0)
                return parseEqual(toks);
            else last = last.slice(0, last.length - 1);

        last = last[last.length - 1];
        if (last === 0 || last === toks.length - 1) throw "Invalid Expression.";

        expr.left = parseExpr(toks.slice(0, last));
        expr.right = parseExpr(toks.slice(last + 1, toks.length));
        expr.operation = toks[last];
        return expr;
    }

    function parseAssign(toks) {
        if (testRule(toks[0]) !== TYPE.IDENT) throw `'${toks[0]}' isn't assignable.`;
        return {
            isExpr: true,
            operation: '=',
            left: { type: TYPE.IDENT, value: toks[0] },
            right: parseExpr(toks.slice(2, toks.length))
        };
    }

    if (!OPERATOR.some(a => a === tokens[0]))
        if (tokens.length === 1) return parseLiteral(tokens);
        else if (tokens[1] === '(') return parseCall(tokens);
        else if (tokens[1] === '=') return parseAssign(tokens);

    if (tokens[0] === '(') {
        // Normalizar as tokens
        let pair = findPairOf(tokens, 0, '(', ')');
        while (pair !== -1 && pair === tokens.length - 1) {
            tokens = tokens.slice(1, pair);
            pair = findPairOf(tokens, 0, '(', ')');
        }

        if (tokens.length === 0) throw "Invalid Expression.";
    }

    return parseLazy(tokens);
}

/**
 * @returns {object}
 * @param {string[]} tokens
 */
function parseStmt(tokens) {
    let stmt = {
        isExpr: false,
        operation: null
    };

    let sep;
    let blockStart;
    let blockEnd;

    switch (tokens[0]) {
        case OPERATIONS[STATEMENT.IF]:
            stmt.operation = STATEMENT.IF;
            if (tokens[1] !== '(') throw "Expecting '(' after 'if'.";
            if (tokens[2] === ')') throw "'()' isn't a valid expression.";

            sep = findPairOf(tokens, 1, '(', ')');
            if (sep === -1) throw "Expecting end of '('.";

            stmt.condition = parseExpr(tokens.slice(2, sep));

            blockStart = sep + 1;
            if (tokens[blockStart] !== '{') throw "Expecting '{' after condition expression.";

            blockEnd = findPairOf(tokens, blockStart, '{', '}');

            stmt.block1 = parseBlock(tokens.slice(blockStart, blockEnd + 1));

            if (blockEnd + 1 === tokens.length) stmt.block2 = [];
            else {
                if (tokens[blockEnd + 1] !== "else") throw "Unknown Exception.";
                let elseStart = blockEnd + 2;

                if (tokens[elseStart] === 'if') {
                    tokens.splice(elseStart, 0, '{');
                    tokens.push('}');
                }

                if (tokens[elseStart] !== '{') throw "Expecting '{' after 'else'.";

                let elseEnd = tokens.length - 1;

                stmt.block2 = parseBlock(tokens.slice(elseStart, elseEnd + 1));
            }

            return stmt;
            break;
        case OPERATIONS[STATEMENT.RETURN]:
            stmt.operation = STATEMENT.RETURN;
            stmt.value = (tokens.length === 1) ? { type: TYPE.NUMLIT, value: 0 } : parseExpr(tokens.slice(1, tokens.length));

            return stmt;

            break;
        case OPERATIONS[STATEMENT.WHILE]:
            stmt.operation = STATEMENT.WHILE;
            if (tokens[1] !== '(') throw "Expecting '(' after 'while'.";
            if (tokens[2] === ')') throw "'()' isn't a valid expression.";

            sep = findPairOf(tokens, 1, '(', ')');
            if (sep === -1) throw "Expecting end of '('.";

            stmt.condition = parseExpr(tokens.slice(2, sep));

            blockStart = sep + 1;
            if (tokens[blockStart] !== '{') throw "Expecting '{' after condition expression.";

            blockEnd = findPairOf(tokens, blockStart, '{', '}');

            stmt.block = parseBlock(tokens.slice(blockStart, blockEnd + 1));
            return stmt;
            break;
        case OPERATIONS[STATEMENT.LOOP]:
            stmt.operation = STATEMENT.LOOP;

            blockStart = tokens.indexOf('{');
            blockEnd = findPairOf(tokens, blockStart, '{', '}');
            if (blockStart === 1) {
                stmt.it = null;
                stmt.value = null;
                stmt.block = parseBlock(tokens.slice(blockStart, blockEnd + 1));
                return stmt;
            }

            if (tokens[1] !== '(') throw "Expecting '(' after 'loop'.";
            if (tokens[2] === ')') throw "'()' isn't a valid expression.";

            sep = findPairOf(tokens, 1, '(', ')');
            if (sep === -1) throw "Expecting end of '('.";

            let separator = tokens.indexOf(':');
            let iterator = tokens[separator - 1];
            if (testRule(iterator) !== TYPE.IDENT) throw `${iterator} isn't a valid identifier.`;

            let expr = parseExpr(tokens.slice(separator + 1, sep));

            stmt.it = { type: TYPE.IDENT, value: iterator };
            stmt.value = expr;
            stmt.block = parseBlock(tokens.slice(blockStart, blockEnd + 1));

            return stmt;
            break;
        case OPERATIONS[STATEMENT.BREAK]:
        case OPERATIONS[STATEMENT.CONTINUE]:
            if (tokens.length > 1) throw `Unexpected ${tokens[1]} after '${tokens[0]}' statement.`;
            stmt.operation = tokens[0];
            return stmt;
            break;
    }
}

function testRule(string) {
    return (rules[2].re.exec(string) !== null) ? TYPE.NUMLIT :
        (rules[3].re.exec(string) !== null) ? TYPE.STRLIT :
            (rules[rules.length - 1].re.exec(string) !== null) ? TYPE.IDENT :
                -1;
}

let variables = {};
let $return;
let $break = false;
let $continue = false;
let $loop = false;
let enter = 0;
const constants = {
    $true: { type: TYPE.NUMLIT, value: 1 },
    $false: { type: TYPE.NUMLIT, value: 0 }
};

let funcs;

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
            result = interpretExpr(stmt.condition);

            if (result.type === TYPE.IDENT) result = getVar(result.value);
            if (result.type === TYPE.STRLIT) throw "Cannot use a string as a condition.";

            let toInterpret = (result.value !== 0) ? stmt.block1 : stmt.block2;

            save = variables;
            variables = { $parent: save };

            interpretBlock(toInterpret);

            break;
        case STATEMENT.RETURN:
            $return = stmt.value.isExpr ? interpretExpr(stmt.value) : stmt.value.type === TYPE.IDENT ? getVar(stmt.value.value) : stmt.value;
            break;
        case STATEMENT.WHILE:
            result = interpretExpr(stmt.condition);

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
        throw `Variable '${name}' not set before reading.`;
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
// let sourceCode = prompt();
// let tokens = tokenize(sourceCode);
// if (tokens === null) throw "Tokens is null";
// console.log("|| TOKENS ||");
// console.log(tokens);
// 
// let parseTree = parse(tokens);
// console.log("|| PARSE TREE ||");
// console.log(parseTree);
// 
// console.log("|| SOURCE CODE ||");
// console.log(sourceCode);
// interpreter(parseTree);