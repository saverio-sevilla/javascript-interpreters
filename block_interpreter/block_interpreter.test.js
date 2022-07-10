var function_interpreter = require("./block_interpreter");

describe("Basic tests", () => {
    test("First step", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input("{ 1 + 1 }")).toBe(2);
    });

    test("Subtraction", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input("{ 5 - 3; }")).toBe(2);
    });

    test("Multiplication", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input("{ 4 * 9; }")).toBe(36);
    });

    test("Division", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input("{ 16 / 4; }")).toBe(4);
    });
})



describe("Multiple statement", () => {
    test("First step", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input(`
        {
            a = 5;
            b = 2;
            c = a + b;
        }
        `)).toBe(7);
    });

    test("Multiple assignment", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input(`{
            { a = (b = 4); };
        }`)).toBe(4);
    });

    test("Assignment to return value of braces", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input(`{
            { a = {b = 1}; }
        }`)).toBe(1);
    });

    test("Nested assignment", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input(`{
            b = 16;
            a = {
                b;
            };
        }`)).toBe(16);
    });
}) 

describe("Function", () => {
    test("Basic function definition", () => {
        const interpreter = new function_interpreter.Interpreter();
        interpreter.input("{ fn avg x y => (x + y) / 2 }")
    });

    test("Using a function", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input(`
        { 
            fn avg a b => (a + b) / 2;
            x = 1;
            y = 4;
            z = avg x y;
            z;
        }
        `)).toBe(2.5);
    });
}) 