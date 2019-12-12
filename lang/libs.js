let lists = [];
const Null = { type: TYPE.NUMLIT, value: 0 };

function Returning(v) {
    return { type: typeof v === "string" ? TYPE.STRLIT : TYPE.NUMLIT, value: v };
}

const LIBRARIES = {
    math: {
        constants: {
            PI: { type: TYPE.NUMLIT, value: 3.14159265 }
        },
        functions: {
            random: (arg0, arg1) => {
                if (arg0 === undefined)
                    return { type: TYPE.NUMLIT, value: Math.random() };
                if (arg1 === undefined) {
                    if (typeof arg0 !== 'number') throw `Invalid argument type. Expected 'number' got '${typeof arg0}'.`;
                    return { type: TYPE.NUMLIT, value: Math.random() * (arg0 + 1) % arg0 };
                }
                if (typeof arg0 !== 'number') throw `Invalid argument type. Expected 'number' got '${typeof arg0}'.`;
                if (typeof arg1 !== 'number') throw `Invalid argument type. Expected 'number' got '${typeof arg1}'.`;

                return { type: TYPE.NUMLIT, value: (Math.random() * (arg1 - arg0 + 1) % (arg1 - arg0)) + arg0 };
            },
            sin: (arg0) => {
                if (typeof arg0 !== "number") throw `1st argument of 'sin()' should be a number.`;
                return { type: TYPE.NUMLIT, value: Math.sin(arg0) };
            },
            cos: (arg0) => {
                if (typeof arg0 !== "number") throw `1st argument of 'cos()' should be a number.`;
                return { type: TYPE.NUMLIT, value: Math.cos(arg0) };
            },
            abs: (arg0) => {
                if (typeof arg0 !== "number") throw `1st argument of 'abs()' should be a number.`;
                return { type: TYPE.NUMLIT, value: Math.abs(arg0) };
            },
            sqrt: (arg0) => {
                if (typeof arg0 !== "number") throw `1st argument of 'sqrt()' should be a number.`;
                return { type: TYPE.NUMLIT, value: Math.sqrt(arg0) };
            }
        },
    },
    lists: {
        constants: {},
        functions: {
            list_create() {
                return { type: TYPE.NUMLIT, value: lists.push([]) - 1 };
            },

            list_push(list, value) {
                if (lists.length <= list) throw "Trying to access a list that doesn't exists.";
                lists[list].push(value);
                return Null;
            },

            list_pop(list) {
                if (lists.length <= list) throw "Trying to access a list that doesn't exists.";
                const v = lists[list][list.length - 1];
                lists[list].pop();
                return Returning(v);
            },

            list_get(list, index) {
                if (lists.length <= list) throw "Trying to access a list that doesn't exists.";
                return Returning(lists[list][index]);
            },

            list_remove(list, index) {
                if (lists.length <= list) throw "Trying to access a list that doesn't exists.";
                lists[list] = lists[list].filter((v, i) => i !== index);
                return Null;
            },

            list_size(list) {
                if (lists.length <= list) throw "Trying to access a list that doesn't exists.";
                return Returning(lists[list].length);
            },

            list_set(list, index, value) {
                if (lists.length <= list) throw "Trying to access a list that doesn't exists.";
                lists[list][index] = value;
                return Null;
            }
        }
    }
};