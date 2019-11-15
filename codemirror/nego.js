CodeMirror.defineSimpleMode("nego", {
  start: [
    { regex: /\/\*/, token: "comment", next: "comment" },
    { regex: /\/\/.*/, token: "comment" },

    { regex: /"(?:[^\\]|\\.)*?"/, token: "string" },

    { regex: /(func)(\s+)([a-zA-Z_][\w]*)/i, token: ["keyword",null,"variable"] },

    { regex: /\b(loop|while|if|else|return|break|continue|include)\b/i, token: "keyword" },

    { regex: /\b(print|input|num|str|len)\b/, token: "builtin" },

    { regex: /(\+|\-|\*|\/| ==|=|\(|\)|\>|\<|>=|<=|!=|&&|\|\|)/, token: "operator" },

    { regex: /\b([0-9]+)\b/, token: "number" },    
    { regex: /\b(true|false)\b/, token: "number" },

    { regex: /\{/, indent: true },
    { regex: /\}/, dedent: true },
    
    {regex: /[a-zA-Z_][\w]*/, token: null},
  ],
  comment: [
    { regex: /.*?\*\//, token: "comment", next: "start" },
    { regex: /.*/, token: "comment" }
  ],
  meta: {
    dontIndentStates: ["comment"],
    lineComment: "//"
  }
});
