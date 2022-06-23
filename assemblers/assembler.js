function print(program_arr){
    for (let line of program_arr){
        console.log(line);
    }
}

function removeCommentsAndWhitespaceLines(text){
    let lines = text.split('\n');
    let result = [];
    for (let line of lines){
        let i = line.indexOf(';');
        if (i !== -1){
            line = line.substring(0, i);
        }
        if (line.length > 0){
            result.push(line.trim());
        }
    }
    return result
}

function isAlphaNumeric(str) {
    var code, i, len;
  
    for (i = 0, len = str.length; i < len; i++) {
      code = str.charCodeAt(i);
      if  (!(code > 64 && code < 91) && // upper alpha (A-Z)
          !(code > 96 && code < 123)) { // lower alpha (a-z)
        return false;
      }
    }

    return true;
};

function assemblerInterpreter(program, debug = false) {
    program = removeCommentsAndWhitespaceLines(program);

    let ptr = 0;
    let end = program.length;
    let table = new Map();
    let return_stack = [];
    let output = "";
    let compare_vals = new Array(2).fill(0);

    function getVal(val){
        if (isAlphaNumeric(val)){
            if (table.has(val)){
                return table.get(val);
            }
            else {
                throw Error("Tried to access an unidentified variable");
            }
        } 
        else {
            return Number(val);
        }
    }

    function getLabelPosition(function_name){
        for (let idx in program){
            if (program[idx].startsWith(function_name)){
                return idx;
            }
        }
        return null;
    }

    function emitJump(function_name){
        ptr = getLabelPosition(function_name);
    }

    function emitJumpCall(function_name){
        return_stack.push(ptr);
        ptr = getLabelPosition(function_name);
    }

    function retJump(){
        let ret_pos = return_stack.pop();
        ptr = ret_pos;
        return ret_pos;
    }

    while (ptr < end){

        let instruction;
        if (program[ptr].split(" ")[0] === "msg"){
            instruction = program[ptr];
            let to_print = program[ptr].substring(program[ptr].indexOf(' ') + 1).trim().match(/('.*?'|[^',\s]+)(?=\s*,|\s*$)/g);
            let message = "";
            for (let _ of to_print){
                if (_.indexOf("'") != -1){
                    message += _.replace(/'/g, "");
                } else {
                    let value = table.get(_);
                    message += value.toString();
                }
            }

            output += message;

        } 
        
        else {
            instruction = program[ptr].replaceAll(",", "").split(" ").filter( (el) => {return el.length > 0} );
            if (debug){
                console.log(instruction);
            }
        }


        let comm = instruction[0];

        if (comm === "mov"){
            let var_name = instruction[1];
            let value = getVal(instruction[2]);
            table.set(var_name, value);
        }
        

        else if (comm == "inc"){
            let var_name = instruction[1];
            let value = getVal(instruction[1]);
            table.set(var_name, value + 1);
        }

        else if (comm == "dec"){
            let var_name = instruction[1];
            let value = getVal(instruction[1]);
            table.set(var_name, value - 1);
        }

        else if (comm == "add"){
            let var_name = instruction[1];
            let value = getVal(instruction[1]);
            table.set(var_name, value + getVal(instruction[2]));
        }

        else if (comm == "sub"){
            let var_name = instruction[1];
            let value = getVal(instruction[1]);
            table.set(var_name, value - getVal(instruction[2]));
        }

        else if (comm == "mul"){
            let var_name = instruction[1];
            let value = getVal(instruction[1]);
            table.set(var_name, value * getVal(instruction[2]));
        }

        else if (comm == "div"){
            let var_name = instruction[1];
            let value = getVal(instruction[1]);
            table.set(var_name, Math.floor(value / getVal(instruction[2])));
        }

        else if (comm == "cmp"){
            compare_vals[0] = getVal(instruction[1]);
            compare_vals[1] = getVal(instruction[2]);
        }

        else if (comm == "jmp"){
            emitJump(instruction[1]);
            if (debug){
                console.log("Jump: ", instruction[1]);
            }
        }

        // jump if not equal
        else if (comm == "jne"){
            if (compare_vals[0] != compare_vals[1]){
                emitJump(instruction[1]);
                if (debug){
                    console.log("Jump: ", instruction[1]);
                }
            }
        }

        // jump if equal
        else if (comm == "je"){
            if (compare_vals[0] == compare_vals[1]){
                emitJump(instruction[1]);
                if (debug){
                    console.log("Jump: ", instruction[1]);
                }
            }
        }

        // jump if greater or equal
        else if (comm == "jge"){
            if (compare_vals[0] >= compare_vals[1]){
                emitJump(instruction[1]);
                if (debug){
                    console.log("Jump: ", instruction[1]);
                }
            }
        }

        // jump if greater
        else if (comm == "jg"){
            if (compare_vals[0] > compare_vals[1]){
                emitJump(instruction[1]);
                if (debug){
                    console.log("Jump: ", instruction[1]);
                }
            }
        }

        // jump if lesser or equal
        else if (comm == "jle"){
            if (compare_vals[0] <= compare_vals[1]){
                emitJump(instruction[1]);
                if (debug){
                    console.log("Jump: ", instruction[1]);
                }
            }
        }

        // jump if lesser
        else if (comm == "jl"){
            if (compare_vals[0] < compare_vals[1]){
                emitJump(instruction[1]);
                if (debug){
                    console.log("Jump: ", instruction[1]);
                }
            }
        }

        // call function
        else if (comm == "call"){
            emitJumpCall(instruction[1]);
        }

        // return from function
        else if (comm == "ret"){
            let pos = retJump();
            if (debug){
                console.log("--- Return to: ", program[pos], );
            }
        }

        // end
        else if (comm == "end"){
            console.log(output);
            break;
        }


        if (debug){
            console.log("Table: ", table);
        }

        ptr++;

        if (ptr == end){
            console.log("-1");
        }

    }

}

module.exports = {
    assemblerInterpreter,
}




