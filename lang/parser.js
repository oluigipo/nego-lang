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
        if (tokens[tokens.length - 1] !== '}') throw "Syntax error. (3)";

        tokens = tokens.slice(1, tokens.length - 1);
        if (tokens.length === 0) return [];

        let parts = [];
        let stop = 0;
        for (let i = 0; i < tokens.length; i++) {
            console.log(i, tokens, tokens.slice(i, tokens.length));
            if (OPERATIONS.some(a => a === tokens[i])) {
                console.log("ENTER");
                if (tokens[i] === OPERATIONS[STATEMENT.RETURN] || tokens[i] === OPERATIONS[STATEMENT.BREAK]
                    || tokens[i] === OPERATIONS[STATEMENT.CONTINUE]) {
                    let end = tokens.indexOf(';', i);
                    if (end === -1) throw `Expected ';' after '${tokens[i]}' statement.`;
                    let oop = tokens.slice(i, end);
                    parts.push(parseStmt(oop));
                    stop = end + 1;
                    i = stop + 1;
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
                i = j - 1;
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