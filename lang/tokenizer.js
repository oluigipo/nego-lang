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

