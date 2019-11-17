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
    }
};