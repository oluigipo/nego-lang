/* Example definition of a simple mode that understands a subset of
 * JavaScript:
 */

CodeMirror.defineSimpleMode("nego", {
  start: [
    {regex: /"(?:[^\\]|\\.)*?"/, token: "string"},
    // {regex: /'(?:[^\\]|\\.)*?'/, token: "string"},
    {regex: /\b(loop|while|if|else|return|func|break|continue)\b/i, token: "keyword"},
    {regex: /\b(print|input|num|str|len)\b/, token: "builtin"},
    {regex: /(\+|\-|\*|\/| ==|=|\(|\)|\>|\<|>=|<=|!=|&&|\|\|)/, token: "operator"},
    {regex: /\b([0-9]+)\b/, token: "number"},
    {regex: /\b(true|false)\b/, token: "number"},
    {regex: /\/\*/, token: "comment", next:"comment"},
    {regex: /\/\/.*/, token: "comment"},
    {regex: /\{/, indent: true},
    {regex: /\}/, dedent: true},
  ],
  comment:[
    {regex: /.*?\*\//, token: "comment", next: "start"},
    {regex: /.*/, token: "comment"}
  ],
  meta: {
    dontIndentStates: ["comment"],
    lineComment: "//"
  }
});
