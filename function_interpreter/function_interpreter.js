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

 
class function_table{

    constructor(){
        this.table = [new Map()];
    }

    print(){
        console.log("SCOPETABLE: ")
        for(let i = this.table.length - 1; i >= 0; i--){
            console.log(this.table[i]);
        }
    }


    add_scope(scope){
        if (scope === undefined){
            this.table.push(new Map());
        }
        this.table.push(new Map(Object.entries(scope)));
    }


    remove_scope(){
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


    has_variable(name){
        for(let i = this.table.length - 1; i >= 0; i--){
            if(this.table[i].has(name)){
                return true;
            }
        }
        return false;
    }

    check_if_function(name){
        if (this.has_variable(name)){
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


let scopetable = new function_table();


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

    analyze_function(){

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
        console.log(set_first, set_second, eqSet(set_first, set_second));
        if (!eqSet(set_first, set_second)){
            throw new Error("Function parameter error");
        }

    }

    error(){
        throw new Error(`Lexer error at position ${this.pos}, token = ${this.current_char}`);
    }

    skip_whitespace(){
        while(this.current_char && this.current_char.match(/\s/)){
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

    get_next_token(){
        while(this.current_char){
            if (this.current_char.match(/\s/)){
                this.skip_whitespace();
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
            if (this.current_char.match(/[a-zA-Z_]/)){
                return new Token(ID, this.identifier());
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
            else {
                this.error();
            }
        }
    }

    tokenize(){

        let tokens = [];
        while(this.pos < this.input.length){
            let token = this.get_next_token();
            tokens.push(token);
        }
        tokens.push(new Token(EOF, null));

        if (tokens[0].value == "fn"){
            this.analyze_function();
        } else if ( this.input.indexOf("fn") != -1){
          throw new Error("Functions cannot be defined in expressions")
        }


        return tokens;
    }
}


class AST{
    constructor(){  }
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
}

class Assign extends AST{
    constructor(left, op, right){
        super();
        this.left = left;
        this.op = op;
        this.right = right;
    }

    visit(){
        console.log(this.op.type);
        if (this.op.type == Equal  && this.left instanceof Var ){
            let new_value = this.right.visit();
            scopetable.set(this.left.name, new_value);
            return new_value;
        } else {
            throw new Error(`Attempted to build a comparison node with an invalid operator or operand`);
        }    
    }
}

class Var extends AST{
    constructor(name){
        super();
        this.name = name;
    }

    visit(){
        if (scopetable.get(this.name)){
            return scopetable.get(this.name);
        } else {
            throw new Error(`Variable ${this.name} is not defined`);
        }
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
        if (scopetable.has_variable(this.name) && !(scopetable.get(this.name) instanceof FuncDef)){
            throw new Error(`Function ${this.name} is already defined`);
        }
        scopetable.set(this.name, this);
        return "";
    }
}

class FuncCall extends AST{ 
    constructor(name, args){
        super();
        this.name = name;
        this.args = args;
    }

    visit(){
        let func = scopetable.get(this.name);
        if (func){
            let arg_values = this.args.map(arg => arg.visit());
            let arg_names = func.args;
            let arg_table = {};
            for (let i = 0; i < arg_names.length; i++){
                arg_table[arg_names[i]] = arg_values[i];
            }

            scopetable.add_scope(arg_table);
            let result = func.body.visit();
            scopetable.remove_scope();
            return result;
        } else {
            throw new Error(`Function ${this.name} is not defined`);
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
            this.pos += 1;
            this.current_token = this.token_list[this.pos];
        }
        else{
            this.error(expected_type);
        }
    }

    

    expr(){
        let node = this.plus_minus();

        while (this.current_token.type == Equal){
            let op = this.current_token;
            this.eat(Equal);
            node = new Assign(node, op, this.expr());
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
        if (token.type == ID){
            let is_function = scopetable.check_if_function(token.value);

            if (is_function){
                let args_length = scopetable.get(token.value).args.length;
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
                return f;
            } else {
                console.log("Error in function definition");
                this.error(Arrow);
            }

        }
    }

    parse(){
        let node = this.expr();
        if (this.current_token.type != EOF){
            throw new Error("Error, no EOF found");
        }
        return node;
    }

}

class Solver{
    constructor(tree){
        this.tree = tree;
    }

    visit(){
        let visit = this.tree.visit();
        return visit;
    }
}

class Interpreter{

    constructor(){
        scopetable.clear();
    }

    input(expression=""){

        if (!expression || expression === "" || expression.trim() === ""){
          return "";
        }


        let lexer = new Lexer(expression);
        let parser = new Parser(lexer.tokenize());
        let tree = parser.parse();
        let solver = new Solver(tree);
        let result = solver.visit();
        return result;
    }
}

let interpreter = new Interpreter();

console.log(interpreter.input("x = 7"));

module.exports = {
    Interpreter: Interpreter
}