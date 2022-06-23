var assembler = require("./assembler");
var test_case = require("./assembler.test_cases");

assembler.assemblerInterpreter(test_case.gcd);

describe("Assembler", () => {
    
    test("Basic program", () => {
        let outputData = "";
        storeLog = inputs => (outputData += inputs);
        console["log"] = jest.fn(storeLog);
        assembler.assemblerInterpreter(test_case.test);
        expect(outputData).toBe("(5+1)/2 = 3");
        outputData = "";
    })

    test("Fibonacci sequence", () => {
        let outputData = "";
        storeLog = inputs => (outputData += inputs);
        console["log"] = jest.fn(storeLog);
        assembler.assemblerInterpreter(test_case.fib);
        expect(outputData).toBe("Term 8 of Fibonacci series is: 21");
        outputData = "";
    })

    test("Factorial of 5", () => {
        let outputData = "";
        storeLog = inputs => (outputData += inputs);
        console["log"] = jest.fn(storeLog);
        assembler.assemblerInterpreter(test_case.fact);
        expect(outputData).toBe("5! = 120");
        outputData = "";
    })

    test("GCD", () => {
        let outputData = "";
        storeLog = inputs => (outputData += inputs);
        console["log"] = jest.fn(storeLog);
        assembler.assemblerInterpreter(test_case.gcd);
        expect(outputData).toBe("gcd(81, 153) = 9");
        outputData = "";
    })
})



