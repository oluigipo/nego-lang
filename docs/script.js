function codeBlock(str) {
    return `<pre class="code"> <div class="coderaw">${str}</div> </pre>`;
}

function titleText(str) {
    return `<h3>${str}</h3>`;
}

function bold(str) {
    return `<strong>${str}</strong>`;
}

window.onload = function () {
    let p = window.location.href.indexOf('#');
    if (p === -1) return;

    let code = window.location.href.slice(p + 1);
    let content = documentation[code];
    if (content === undefined) return;

    showContent(code);
}

let current = "";
function showContent(selected) {
    if (current === selected) return;
    current = selected;
    let d = document.getElementById("content");

    d.classList.toggle("hide");
    setTimeout(() => {
        d.innerHTML = documentation[selected];
        d.classList.toggle("show");
        d.classList.toggle("hide");
        d.classList.toggle("show");
    }, 300);
}

const p = "<p></p>";
const documentation = {};
// Home
documentation["home_overview"] = `${bold("Nego")} is a simple and interpreted programming language. It's made by ${bold("tuas nega")}.`;
documentation["home_variables"] = `${titleText(`Variables`)}${p}Variables in Nego doesn't work very differently compared with other languages. The difference is that you just need to initialize it. See the example:${p}${codeBlock(`variable = value;`)}${p}This code will assign the ${bold("value")} to the ${bold("variable")}. Also, it'll do ${bold("variable")} live in the global scope.${p}Scopes are created when the program reads a '{' and are deleted when the program reads a '}'. The variable is created in that scope if it hasn't initialized before. See the example:${p}${codeBlock(`a = 0; // 'a' lives in the global scope.\nif (true) {\n\ta = 5; // Assign 5 to 'a'.\n}\nprint(a); // Output: 5\n\nif (true) {\n\tb = 10; // 'b' was initialized inside this block, so 'b' lives inside this scope.\n} // Here, 'b' will be deleted.\nprint(b); // Error. 'b' don't exists outside the 'if' scope.`)}${p}Variables are ${bold("dynamically typed")}. This means that you can assign any value of any type to any variable. See the example:${p}${codeBlock(`var = 10;\nprint(var);\nvar = "Hello";\nprint(var);`)}${p}The output is exactly what is expected. It will print "10" and "Hello" to the console.`;
documentation["home_ifelse"] = `${titleText("Conditional Statements")}`;
documentation["home_loops"] = `${titleText("Loops (while & loop statement)")}${p}There's 2 loops statement: ${bold("while")} and ${bold("loop")}.\n${p}The while statement is very simple. It'll run a block of code while a condition is true.${p}The syntax is also simple.\n${codeBlock(`while (expr) {\n\t// Code...\n}`)}Example:\n${codeBlock(`x = 10;\nwhile (x > 0) {\n\tprint(x * x);\n\tx = x - 1;\n}`)}\n\nThe loop statement is a ${bold("iterator loop")}, this means that it's perfect for iterators.${p}Syntax:\n${codeBlock(`loop (iterator : number) {\n\t// Code...\n}`)}\n${bold("iterator")} is a variable which will run from ${bold("0")} to ${bold("number")}.${p}Example:\n${codeBlock(`qnt = num(input());\nprint("A quantidade escolhida é " + str(qnt));\nloop (i : qnt) {\n\tprint(i);\n}`)}`;
// Examples
documentation["example_helloworld"] = codeBlock("print(\"Hello, World!\");");
documentation["example_fibonacci_r"] = codeBlock(`func fib(a,b,c) {\n\ta = a + b;\n\tb = a - b;\n\tc = c - 1;\n\t\n\tprint(b);\n\t\n\tif (c > 0) {\n\t\tfib(a,b,c);\n\t}\n}\n\ninp = input();\nqnt = num(inp);\nfib(1,0,qnt);`);
// Built-in Functions
documentation["func_print"] = `${titleText("The print Function")} This function is simple. It'll just print something to the console. ${titleText("Syntax")}${codeBlock("print(value)")}${bold("value")}: String | Number - The value that should be printed. ${titleText("Example")}The code below will subtract ${bold('5')} from ${bold('24')} and will append the result to ${bold('"The result is: "')}.${codeBlock(`result = 24 - 5;\nprint("The result is:" + str(result));`)}`;
documentation["func_input"] = `${titleText("The input Function")} This function will get input from the user. ${titleText("Syntax")}${codeBlock("input()")} This function doesn't recive any argument. ${titleText("Example")}The code below will get two inputs from the user and print the sum of them.${codeBlock(`first = num(input());\nsecond = num(input());\nprint(first + second);`)}`;
documentation["func_num"] = `${titleText("The num Function")} This function will convert a string into a number. ${titleText("Syntax")}${codeBlock("num(str)")} ${bold("str")}: String - The string that should be converted. ${titleText("Example")}The code below will get two inputs from the user, convert them into a number and print the sum of them.${codeBlock(`first = num(input());\nsecond = num(input());\nprint(first + second);`)}`;
documentation["func_str"] = `${titleText("The str Function")} This function will convert a number into a string. ${titleText("Syntax")}${codeBlock("str(num)")} ${bold("num")}: Number - The number that should be converted. ${titleText("Example")}The code below will get a number, square it and will print the result.${codeBlock(`number = num(input());\nnumber = number * number;\nprint("The result is: " + str(result));`)}`;

