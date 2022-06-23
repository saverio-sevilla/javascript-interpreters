var function_interpreter = require("./function_interpreter");

describe("Basic tests", () => {
    test("First step", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input("1 + 1")).toBe(2);
    });

    test("Subtraction", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input("5 - 3")).toBe(2);
    });

    test("Multiplication", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input("4 * 9")).toBe(36);
    });

    test("Division", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input("16 / 4")).toBe(4);
    });
})

describe("Assignments", () => {
    test("First step", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input("x = 7")).toBe(7);
    });

    test("Multiple assignment", () => {
        const interpreter = new function_interpreter.Interpreter();
        interpreter.input("x = 42");
        expect(interpreter.input("y = x")).toBe(42);
    });

    test("Chained assignment", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input("x = y = z = 19")).toBe(19);
    });

    test("Nested assignment", () => {
        const interpreter = new function_interpreter.Interpreter();
        expect(interpreter.input("y = 5 + (x = 8)")).toBe(13);
    });
})

describe("Function", () => {
    test("Basic function", () => {
        const interpreter = new function_interpreter.Interpreter();
        interpreter.input("fn avg x y => (x + y) / 2")
        expect(interpreter.input("avg 2 4")).toBe(3);
    });

    test("Wrong number of parameters", () => {
        const interpreter = new function_interpreter.Interpreter();
        interpreter.input("fn avg x y => (x + y) / 2")
        expect(() => { interpreter.input("avg 5 6 7") }).toThrow();
    });

    test("Too few parameters", () => {
        const interpreter = new function_interpreter.Interpreter();
        interpreter.input("fn avg x y => (x + y) / 2")
        expect(() => { interpreter.input("avg 42") }).toThrow();
    });
})