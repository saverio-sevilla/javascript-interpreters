let NumToken = Symbol("Num");
let ID = Symbol("ID");
let Equal = Symbol("Equal");
let Plus = Symbol("Plus");
let Minus = Symbol("Minus");
let Mult = Symbol("Mult");
let Mod = Symbol("Mod");
let Div = Symbol("Div");
let EOF = Symbol("EOF");
let LParen = Symbol("LParen");
let RParen = Symbol("RParen");
let Fn = Symbol("Fn");
let Arrow = Symbol("Arrow");
let Semi = Symbol("Semi");
let RBrace = Symbol("RBrace");
let LBrace = Symbol("LBrace");
let Lt = Symbol("Lt");
let Gt = Symbol("Gt");
let LtEq = Symbol("LtEq");
let GtEq = Symbol("GtEq");
let NotEq = Symbol("NotEq");
let Not = Symbol("Not");
let And = Symbol("And");    
let Or = Symbol("Or");
let Eq = Symbol("Eq");
let If = Symbol("If");
let Else = Symbol("Else");
let While = Symbol("While");

const keywords_obj = {
    "if": If,
    "else": Else,
    //Add while 
    "while": While,
}

const keywords = new Map(Object.entries(keywords_obj));

function tempGenerator() {
    let variable_idx = 0;
    return function() {
        return "_t" + variable_idx++;
    }
}

function labelGenerator() {
    let label_idx = 0;
    return function() {
        return "_L" + label_idx++ + ":";
    }
}

const Assignment = Symbol("Assignment");

class Instruction{
    constructor(type){
        this.type = type;
    }
}

class AssignmentInstruction extends Instruction{
    constructor(left, level, right){
        super(Assignment);
        this.left = left;
        this.level = level;
        this.right = right;
    }

    toString(){
        return `${this.left}(${this.level}) = ${this.right}`;
    }
}


class InstructionList{
    constructor(){
        this.instructions = [];
        this.tempGenerator = tempGenerator();
        this.labelGenerator = labelGenerator();
    }
    toString(){
        //Return the instructions in the instruction list, don't go to a new line for the labels 
        return this.instructions.join("\n");

    }
    addInstruction(str){
        this.instructions.push(str);
    }
    //Write a function that returns the name and level of the previous assignment of a variable with a level lower than the current level
    getPreviousAssignment(name, level){
        for (let i = this.instructions.length - 1; i >= 0; i--){
            let instruction = this.instructions[i];
            if (instruction.type == Assignment){
                if (instruction.left == name && instruction.level < level){
                    return instruction;
                }
            }
        }
        return null;
    }

    getTemp(){
        return this.tempGenerator();
    }
    getLabel(){
        return this.labelGenerator();
    }
}

class SymbolTable{

    constructor(){
        this.table = [new Map()];
    }

    print(){
        console.log("Scope table: ")
        for(let i = this.table.length - 1; i >= 0; i--){
            console.log(this.table[i]);
        }
    }


    addScope(scope){
        if (scope === undefined){
            this.table.push(new Map());
        } else {
            this.table.push(new Map(Object.entries(scope)));
        }
    }


    removeScope(){
        this.table.pop();
    }


    set(name, value){
        this.table[this.table.length - 1].set(name, value);
    }


    get(name){
        for(let i = this.table.length - 1; i >= 0; i--){
            if(this.table[i].has(name)){
                return this.table[i].get(name);
            }
        }
        return undefined;
    }

    getNested(name, key){
        for(let i = this.table.length - 1; i >= 0; i--){
            if(this.table[i].has(name)){
                let value = this.table[i].get(name);
                if (value instanceof Map){
                    return value.get(key);
                } else {
                    throw new Error("The value accessed does not support indexing")
                }
            }
        }
        return undefined;
    }

    getDepth(){
        return this.table.length - 1;
    }

    getNameDepth(name){
        for(let i = this.table.length - 1; i >= 0; i--){
            if(this.table[i].has(name)){
                return i - 1;
            }
        }
        return undefined;
    }


    hasVariable(name){
        for(let i = this.table.length - 1; i >= 0; i--){
            if(this.table[i].has(name)){
                return true;
            }
        }
        return false;
    }

    isFunction(name){
        if (this.hasVariable(name)){
            let value = this.get(name);
            if (value instanceof FuncDef){
                return true
            }
        }
        return false;
    }

    clear(){
        this.table = [new Map()];
    }

}


let symboltable = new SymbolTable();


class Token{
    constructor(type, value){
        this.type = type;
        this.value = value;
    }
}

class Lexer{
    constructor(input){
        this.input = input;
        this.pos = 0;
        this.current_char = this.input[this.pos];
    }

    analyzeFunction(){

        function eqSet(as, bs) {
            if (as.size !== bs.size) return false;
            for (var a of as) if (!bs.has(a)) return false;
            return true;
        }

        var regex = /\s*(=>|[-+*\/\%=\(\)]|[A-Za-z_][A-Za-z0-9_]*|[0-9]*\.?[0-9]+)\s*/g;
        var var_name = /[A-Za-z_][A-Za-z0-9_]*/;
        let keywords = this.input.split(regex).filter(function (s) { return !s.match(/^\s*$/); }).slice(2);
        let second = keywords.slice(keywords.indexOf("=>")).filter(function (s) { return s.match(var_name)});
        let first = keywords.slice(0, keywords.indexOf("=>")).filter(function (s) { return s.match(var_name)});
        let set_first = new Set(first);
        if (first.length != set_first.size){
            throw new Error("Duplicate args in function")
        }
        let set_second = new Set(second);
        console.log("Function log: " , set_first, set_second, eqSet(set_first, set_second));
        if (!eqSet(set_first, set_second)){
            throw new Error("Function parameter error");
        }

    }

    error(){
        throw new Error(`Lexer error at position ${this.pos}, token = ${this.current_char}`);
    }

    skipSpaces(){ // FIX
        while(this.current_char && this.current_char.match(/\s/) || this.current_char && this.current_char === "\n"){
            this.advance();
        }
    } 

    peek(){
        let peek_pos = this.pos + 1;
        if (peek_pos < this.input.length){
            return this.input[peek_pos];
        } else {
        return null;
        }
    }

    advance(){
        this.pos += 1;
        if (this.pos > this.input.length - 1){
            this.current_char = null;
        } 
        else{
            this.current_char = this.input[this.pos];
        }
    }

    identifier(){
        let result = "";
        while(this.current_char && this.current_char.match(/[a-zA-Z_]/)){
            result += this.current_char;
            this.advance();
        }
        return result;
    }

    number(){   
        let result = "", decimal = "";
        while(this.current_char && this.current_char.match(/[0-9]/)){
            result += this.current_char;
            this.advance();
        }
        if (this.current_char == "."){
            decimal = ".";
            this.advance();
            while(this.current_char && this.current_char.match(/[0-9]/)){
                decimal += this.current_char;
                this.advance();
            }
        }
        return result + decimal;
    }

    isSpace(){
        return this.current_char && this.current_char.match(/\s/);
    }

    getNextToken(){
        while(this.current_char){
            if (this.current_char.match(/\s/) || this.current_char === "\n"){
                this.skipSpaces();
                continue;
            }
            if (this.current_char.match(/[0-9]/)){
                return new Token(NumToken, this.number());
            }
            if (this.current_char == "f" && this.peek() == "n"){
                this.advance();
                this.advance();
                return new Token(Fn, "fn");
            }
            if (this.current_char == "=" && this.peek() == "="){
                this.advance();
                this.advance();
                return new Token(Eq, "eq");
            }
            if (this.current_char == "!" && this.peek() == "="){
                this.advance();
                this.advance();
                return new Token(NotEq, "ne");
            }
            if (this.current_char == ">" && this.peek() == "="){
                this.advance();
                this.advance();
                return new Token(GtEq, "gteq");
            }
            if (this.current_char == "<" && this.peek() == "="){
                this.advance();
                this.advance();
                return new Token(LtEq, "lteq");
            }
            if (this.current_char == "&" && this.peek() == "&"){
                this.advance();
                this.advance();
                return new Token(And, "&&");
            }
            if (this.current_char == "|" && this.peek() == "|"){
                this.advance();
                this.advance();
                return new Token(Or, "||");
            }

            if (this.current_char.match(/[a-zA-Z_]/)){
                let result = this.identifier();
                if (keywords.has(result)){
                    return new Token(keywords.get(result), result);
                }
                return new Token(ID, result);
            }
            if (this.current_char == "("){
                this.advance();
                return new Token(LParen, "(");
            }
            if (this.current_char == ")"){
                this.advance();
                return new Token(RParen, ")");
            }
            if (this.current_char == "+"){
                this.advance();
                return new Token(Plus, "+");
            }
            if (this.current_char == "-"){
                this.advance();
                return new Token(Minus, "-");
            }
            if (this.current_char == "*"){
                this.advance();
                return new Token(Mult, "*");
            }
            if (this.current_char == "/"){
                this.advance();
                return new Token(Div, "/");
            }
            if (this.current_char == "%"){
                this.advance();
                return new Token(Mod, "%");
            }
            if (this.current_char == "=" && this.peek() == ">"){
                this.advance();
                this.advance();
                return new Token(Arrow, "=>");
            }
            if (this.current_char == "="){
                this.advance();
                return new Token(Equal, "=");
            }
            if (this.current_char == ";"){
                this.advance();
                return new Token(Semi, ";");
            }
            if (this.current_char == "{"){
                this.advance();
                return new Token(LBrace, "{");
            }
            if (this.current_char == "}"){
                this.advance();
                return new Token(RBrace, "}");
            }
            if (this.current_char == "<"){
                this.advance();
                return new Token(Lt, "lt");
            }
            if (this.current_char == ">"){
                this.advance();
                return new Token(Gt, "gt");
            }
            if (this.current_char == "!"){
                this.advance();
                return new Token(Not, "!");
            }
            else {
                this.error();
            }
        }
    }

    tokenize(){

        let tokens = [];
        while(this.pos < this.input.length){
            let token = this.getNextToken();
            if (token){
                tokens.push(token);
            }
        }
        tokens.push(new Token(EOF, null));

        // if (tokens[0].value == "fn"){
        //     this.analyze_function();
        // } else if ( this.input.indexOf("fn") != -1){
        //   throw new Error("Functions cannot be defined in expressions")
        // }

        console.log(tokens)

        return tokens;
    }
}


class AST{
    constructor(){  }
}

class ExprList extends AST{
    constructor(scoped=true){
        super();
        this.expr = [];
        this.scoped = scoped;
    } 
    visit(){
        if (this.scoped){
            symboltable.addScope(); 
        }
        let visits = this.expr.map(function(e){
            return e.visit();
        })
        if(this.scoped){
            symboltable.removeScope();
        }
        return visits[visits.length - 1];
    }

    tac(instruction_list){

        if (this.scoped){
            symboltable.addScope(); 
        }


        for (let i = 0; i < this.expr.length - 1; i++){
            let e = this.expr[i];
            e.tac(instruction_list);
        }

        let ret_val = this.expr[this.expr.length - 1].tac(instruction_list);

        if(this.scoped){
            symboltable.removeScope();
        }

        return ret_val;
    }
}

class WhileStatement extends AST{
    constructor(condition, block){
        super();
        this.condition = condition;
        this.block = block;
    }
    visit(){
        let ret = null;
        while(this.condition.visit()){
            ret = this.block.visit();
        }

        return ret;
    }

    tac(instruction_list){
        let label0 = instruction_list.getLabel();
        let label1 = instruction_list.getLabel();
        instruction_list.addInstruction(`${label0}`);
        let tmp_condition = this.condition.tac(instruction_list);
        instruction_list.addInstruction(`IfZ ${tmp_condition} Goto ${label1}`);
        this.block.tac(instruction_list);
        instruction_list.addInstruction(`Goto ${label0}`);
        instruction_list.addInstruction(`${label1}`);
    }
}

class IfStatement extends AST{
    constructor(condition, then_block, else_block){
        super();
        this.condition = condition;
        this.then_block = then_block;
        this.else_block = else_block;
    }
    visit(){
        let condition = this.condition.visit();

        let ret = null;
        if (condition){
            ret = this.then_block.visit();
        } else if (this.else_block){
            ret = this.else_block.visit();
        }
        return ret;
    }

    // Add tac instructions to the instruction list
    tac(instruction_list){
        let tmp_condition = this.condition.tac(instruction_list);
        let label0 = instruction_list.getLabel();
        let label1 = instruction_list.getLabel();
        instruction_list.addInstruction(`IfZ ${tmp_condition} Goto ${label0}`);
        this.then_block.tac(instruction_list);
        instruction_list.addInstruction(`Goto ${label1}`);
        instruction_list.addInstruction(`${label0}`);
        if (this.else_block){
            this.else_block.tac(instruction_list);
        }
        instruction_list.addInstruction(`${label1}`);
    }
}


class FuncDef extends AST{
    constructor(name, args, body){
        super();
        this.name = name;
        this.args = args; // array of function arg names (strings)
        this.body = body; // function body (AST)
    }

    visit(){
        if (symboltable.hasVariable(this.name) && !(symboltable.get(this.name) instanceof FuncDef)){
            console.log(`Function ${this.name} is already defined`);
        } else {
            symboltable.set(this.name, this);
            return "Function defined";
        }
    }
}

class FuncCall extends AST{ 
    constructor(name, args){
        super();
        this.name = name;
        this.args = args;
    }

    visit(){
        let func = symboltable.get(this.name);
        if (func){
            let arg_values = this.args.map(arg => arg.visit());
            let arg_names = func.args;
            let arg_table = {};
            for (let i = 0; i < arg_names.length; i++){
                arg_table[arg_names[i]] = arg_values[i];
            }

            symboltable.addScope(arg_table);
            let result = func.body.visit();
            symboltable.removeScope();
            return result;
        } else {
            throw new Error(`Function ${this.name} is not defined`);
        }

    }

    //Make a tak function for this class
}

class Assign extends AST{
    constructor(left, op, right){
        super();
        this.left = left;
        this.op = op;
        this.right = right;
    }

    visit(){
        if (this.op.type == Equal  && this.left instanceof Var ){
            let new_value = this.right.visit();
            symboltable.set(this.left.name, new_value);
            return new_value;
        } else {
            throw new Error(`Attempted to build a comparison node with an invalid operator or operand`);
        }    
    }

    tac(instruction_list){
        if (this.op.type == Equal && this.left instanceof Var){
            const right = this.right.tac(instruction_list);
            const assignment_instruction = new AssignmentInstruction(this.left.name, symboltable.getDepth(), right)
            instruction_list.addInstruction(assignment_instruction);
            return this.left.name;
        } else {
            throw new Error(`Attempted to build a tac instruction with an invalid operator or operand`);
        }
    }
}

class BinOp extends AST{
    constructor(left, op, right){
        super();
        this.left = left;
        this.op = op;
        this.right = right;
    }

    visit(){
        if (this.op.type == Plus){
            return this.left.visit() + this.right.visit();
        } 
        else if (this.op.type == Minus){
            return this.left.visit() - this.right.visit();
        }
        else if (this.op.type == Mult){
            return this.left.visit() * this.right.visit();
        }
        else if (this.op.type == Div){
            return this.left.visit() / this.right.visit();
        }
        else if (this.op.type == Mod){
            return this.left.visit() % this.right.visit();
        }
        else if (this.op.type == Eq){
            return this.left.visit() == this.right.visit();
        }
        else if (this.op.type == NotEq){
            return this.left.visit() != this.right.visit();
        } 
        else if (this.op.type == Lt){
            return this.left.visit() < this.right.visit();
        }
        else if (this.op.type == Gt){
            return this.left.visit() > this.right.visit();
        }
        else if (this.op.type == LtEq){
            return this.left.visit() <= this.right.visit();
        }
        else if (this.op.type == GtEq){
            return this.left.visit() >= this.right.visit();
        } 
        else if (this.op.type == And){
            return Boolean(this.left.visit() && this.right.visit());
        } 
        else if (this.op.type == Or){
            return Boolean(this.left.visit() || this.right.visit());
        }
    }

    tac(instruction_list){
        const left = this.left.tac(instruction_list);
        const right = this.right.tac(instruction_list);
        const temp = instruction_list.getTemp();
        instruction_list.addInstruction(`${temp} = ${left} ${this.op.value} ${right}`);
        return temp;
    }

}

class UnaryOp extends AST{
    constructor(op, expr){
        super();
        this.op = op;
        this.expr = expr;
    }

    visit(){
        if (this.op.type == Plus){
            return +this.expr.visit();
        } 
        else if (this.op.type == Minus){
            return -this.expr.visit();
        }
        else if (this.op.type == Not){
            return !this.expr.visit();
        }
    }

    tac(instruction_list){
        const expr = this.expr.tac(instruction_list);
        const temp = instruction_list.getTemp();
        instruction_list.addInstruction(`${temp} = ${this.op.value} ${expr}`);
        return temp;
    }

}

class Num extends AST{
    constructor(token){
        super();
        this.token = token;
        this.value = this.token.value;
    }

    visit(){
        return Number(this.value);
    }

    tac(instruction_list){
        return this.visit();
    }
}


class Var extends AST{
    constructor(name){
        super();
        this.name = name;
    }

    visit(){
        console.log("Name: " + this.name);
        console.log(symboltable.table);
        console.log("Depth: "+symboltable.getDepth());
        if (symboltable.get(this.name) !== undefined){
            console.log("Found");
            return symboltable.get(this.name);
        } else {
            console.log("Not found");
            throw new Error(`Variable ${this.name} is not defined`);
        }
    }

    tac(instruction_list){
        //return the name followed by the last position in the instruction list 


        //fetch the current level in the scope table
        let level = symboltable.getDepth();

        //fetch the previous assignment of the variable
        let previous_assignment = instruction_list.getPreviousAssignment(this.name, level);
        //if there is a previous assignment, return the name of the variable and the level of the previous assignment
        if (previous_assignment){
            return `${this.name}(${previous_assignment.level})`;
        }
        //if there is no previous assignment, return the name of the variable and the current level
        else {
            return `${this.name}(${level})`;
        }

    }
}



class Parser {
    constructor(token_list){
        this.token_list = token_list;
        this.pos = 0;
        this.current_token = this.token_list[this.pos];
    }

    error(expected_type){
        let msg = `Parser error at position ${this.pos}, token type = ${this.current_token.type.toString()}, expected type = ${expected_type.toString()}`;
        throw new Error(msg);
    }

    eat(expected_type){
        if (this.current_token.type == expected_type){
            //console.log(`Eating token ${this.current_token.value}`);
            this.pos += 1;
            this.current_token = this.token_list[this.pos];
        }
        else{
            this.error(expected_type);
        }
    }

    peekToken(){
        return this.token_list[this.pos + 1];
    }

    exprList(scoped=true){
        let expr_list = new ExprList(scoped);
        this.eat(LBrace);
        while(this.current_token.type != EOF && this.current_token.type != RBrace){
            if (this.current_token.type == LBrace){
                expr_list.expr.push(this.exprList());
            } else if (this.current_token.type == If){
                expr_list.expr.push(this.ifStatement());
            }
            else if (this.current_token.type == While){
                expr_list.expr.push(this.whileStatement());
            }
            else {
                expr_list.expr.push(this.expr());
            } 
            if (this.current_token.type == Semi){
                this.eat(Semi);
            }
            else if (this.current_token.type != RBrace) {
                throw new Error("Found an unterminated statement: semicolon or right braces expected")
            }
        }
        this.eat(RBrace)
        return expr_list;
    }

    ifStatement(){
        this.eat(If);
        this.eat(LParen);
        let condition = this.expr();
        this.eat(RParen);
        let then_block = this.exprList(false);
        let else_block = null;
        if (this.current_token.type == Else){
            this.eat(Else);
            else_block = this.exprList(false);
        }
        return new IfStatement(condition, then_block, else_block);
    }

    whileStatement(){
        this.eat(While);
        this.eat(LParen);
        let condition = this.expr();
        this.eat(RParen);
        let block = this.exprList(false);
        return new WhileStatement(condition, block);
    }
 

    expr(){
        let node = this.logical();

        while (this.current_token.type == Equal){
            let op = this.current_token;
            this.eat(Equal);
            node = new Assign(node, op, this.expr());
        }

        return node;
    }

    logical(){
        let node = this.comparison();

        while (this.current_token.type == And || this.current_token.type == Or){
            let op = this.current_token;
            this.eat(op.type);
            node = new BinOp(node, op, this.comparison());
        }

        return node;
    }

    comparison(){
        let node = this.equality();
        while (this.current_token.type == Lt || this.current_token.type == Gt || this.current_token.type == LtEq || this.current_token.type == GtEq){
            let op = this.current_token;
            this.eat(op.type);
            node = new BinOp(node, op, this.equality());
        }
        return node;
    }

    equality(){
        let node = this.plus_minus();

        while (this.current_token.type == Eq|| this.current_token.type == NotEq){
            let op = this.current_token;
            this.eat(op.type);
            node = new BinOp(node, op, this.plus_minus());
        }
        return node;
    }


    plus_minus(){
        let node = this.mul_div();

        while (this.current_token.type == Plus || this.current_token.type == Minus){
            let token = this.current_token;
            if (token.type == Plus){
                this.eat(Plus);
                node = new BinOp(node, token, this.mul_div());
            }
            else if (token.type == Minus){
                this.eat(Minus);
                node = new BinOp(node, token, this.mul_div());
            }
        }

        return node;
    }

    mul_div(){
        let node = this.unary_num();

        while (this.current_token.type == Mult || this.current_token.type == Div || this.current_token.type == Mod){
            let token = this.current_token;
            if (token.type == Mult){
                this.eat(Mult);
                node = new BinOp(node, token, this.unary_num());
            }
            else if (token.type == Div){
                this.eat(Div);
                node = new BinOp(node, token, this.unary_num());
            }
            else if (token.type == Mod){
                this.eat(Mod);
                node = new BinOp(node, token, this.unary_num());
            }
        }

        return node;
    }

    unary_num(){
        let token = this.current_token;

        if (token.type == Minus){
            this.eat(Minus);
            return new UnaryOp(token, this.unary_num());
        }
        if (token.type == NumToken){
            this.eat(NumToken);
            return new Num(token);
        }
        if (token.type == LParen){
            this.eat(LParen);
            let node = this.expr();
            this.eat(RParen);
            return node;
        }
        if (token.type == LBrace){
            return this.exprList();
        }
        if (token.type == ID){
            let is_function = symboltable.isFunction(token.value);
            console.log(is_function);

            if (is_function){
                let args_length = symboltable.get(token.value).args.length;
                this.eat(ID);
                let real_args = [];
                let counter = 0;
                while (counter < args_length){
                    let node = this.unary_num();
                    real_args.push(node);
                    counter++;
                }
                return new FuncCall(token.value, real_args);
            }
            else {
                this.eat(ID);
                return new Var(token.value);
            }
        }

        if (token.type == Fn){

            this.eat(Fn);
            let name = this.current_token.value;
            this.eat(ID);
            let args = [];
            while (this.current_token.type == ID){
                args.push(this.current_token.value);
                this.eat(ID);
            }
            if (this.current_token.type == Arrow){
                this.eat(Arrow);
                let body = this.expr();
                let f = new FuncDef(name, args, body);
                f.visit();
                return f;
            } else {
                console.log("Error in function definition");
                this.error(Arrow);
            }

        }
    }

    parse(){
        let node = this.exprList();
        if (this.current_token.type != EOF){
            throw new Error("Error, no EOF found");
        }
        return node;
    }

}

class Solver{
    constructor(tree, instruction_list){
        this.tree = tree;
        this.instruction_list = instruction_list
    }

    visit(){
        let visit = this.tree.visit();
        return visit;
    }

    tac(){
        let tac = this.tree.tac(this.instruction_list);
        return this.instruction_list;
    }
}

class Interpreter{

    constructor(){
        symboltable.clear();
    }

    input(expression="", tac=false, lex_only=false){

        if (!expression || expression === "" || expression.trim() === ""){
          return "";
        }

        let instruction_list = new InstructionList();
        let lexer = new Lexer(expression);
        let parser = new Parser(lexer.tokenize());
        if (lex_only){
            return parser.token_list;
        }
        let tree = parser.parse();
        console.log("Tree: ", tree)
        let solver = new Solver(tree, instruction_list);
        let result = solver.visit();
        if (tac){
            let tac = solver.tac();
            console.log(tac.toString());
        }

        return result;
    }
}

let interpreter = new Interpreter();

console.log(interpreter.input(`
{
    c = 0;
    c = c + 3;
}
`, true));


module.exports = {
    Interpreter: Interpreter
}

  
