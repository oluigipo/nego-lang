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
    { name: "line_comment", re: /^\/\/.+/ },
    { name: "comment", re: /^\/\*[^(\*\/)]*\*\// },
    { name: "number_literal", re: /^[0-9]+(\.[0-9]+)?/ },
    { name: "string_literal", re: /^".*?"/ },
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
    { name: "identifier", re: /^[a-zA-Z_]+/ } // [a-zA-Z_0-9]
];

/**
 * @typedef {0 | 1 | 2 | 3} STMT
 * @typedef {{isExpr: false, operation: STMT}} Statement
 * @typedef {(Statement | Expression)[]} Block
 * @typedef {{type: 0|1|2, value: string | number}} Literal
 * @typedef {{isExpr: true, left: Expression | Literal, right: Expression | Literal, operation: string}} Expression
 * @typedef {{block: Block, name: string, args: Literal[]}} Function
 */




