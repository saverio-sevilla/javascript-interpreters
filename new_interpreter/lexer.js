let Int = Symbol("Int");
let Float = Symbol("Float");
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
let LSquareParen = Symbol("LSquareParen");
let RSquareParen = Symbol("RSquareParen");
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
let String = Symbol("String");
let Bool = Symbol("Bool");
let Quote = Symbol("Quote");
let Type = Symbol("Type");
let Comma = Symbol("Comma");
let Colon = Symbol("Colon");
let Def = Symbol("Def");
let Do = Symbol("Do");
let Return = Symbol("Return");
let Break = Symbol("Break");
let Continue = Symbol("Continue");
let For = Symbol("For");
let Const = Symbol("Const");
let AndSign = Symbol("AndSign");


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

        this.keywords_obj = {
            "if": If,
            "else": Else,
            "for": For,
            "def": Def,
            "do": Do,
            "return": Return,
            "break": Break,
            "continue": Continue,
            "while": While,
            "true": Bool,
            "false": Bool,
            "int": Type,
            "float": Type,
            "string": Type,
            "bool": Type,
            "and": And,
            "or": Or,
            "not": Not,
            "fn": Fn,
        }
        
        this.keywords = new Map(Object.entries(this.keywords_obj));
    }

    error(message){
        throw new Error(`Lexer error at position: ${this.pos}, token: ${this.current_char} ${message}`);
    }

    skipSpaces(){
        while(this.current_char?.match(/\s/) || this.current_char && this.current_char === "\n"){
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

    string(){
        let result = "";
        while(this.current_char != "\""){
            result += this.current_char;
            this.advance();
        }
        return result;
    }

    identifier(){
        let result = "";
        while(this.current_char?.match(/[a-zA-Z_]|\d/)){
            result += this.current_char;
            this.advance();
        }
        return result;
    }

    number(){   
        let result = "", decimal = "";
        while(this.current_char?.match(/\d/)){
            result += this.current_char;
            this.advance();
        }
        if (this.current_char == "."){
            decimal = ".";
            this.advance();
            if (!this.current_char?.match(/\d/)){
                this.error("Invalid number");
            }
            while(this.current_char?.match(/\d/)){
                decimal += this.current_char;
                this.advance();
            }
        }

        if (decimal){
            return new Token(Float, result + decimal);
        } else {
            return new Token(Int, result);
        }
    }

    isSpace(){
        return this.current_char?.match(/\s/);
    }

    addKeyword(keyword){
        let keyword_symbol = keyword[0].toUpperCase() + keyword.slice(1);
        let s = Symbol(keyword_symbol);
        keywords.set(keyword, s);
    }


    getNextToken(){
        while(this.current_char){
            if (this.isSpace(this.current_char) || this.current_char === "\n"){
                this.skipSpaces();
                continue;
            }
            if (this.current_char.match(/\d/)){
                return this.number();
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
            if (this.current_char == "=" && this.peek() == ">"){
                this.advance();
                this.advance();
                return new Token(Arrow, "=>");
            }
            if (this.current_char.match(/[a-zA-Z_]/)){
                let result = this.identifier();
                if (this.keywords.has(result)){
                    return new Token(this.keywords.get(result), result);
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
            if (this.current_char == "["){
                this.advance();
                return new Token(LSquareParen, "[");
            }
            if (this.current_char == "]"){
                this.advance();
                return new Token(RSquareParen, "]");
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
            if (this.current_char == ","){
                this.advance();
                return new Token(Comma, ",");
            }
            if (this.current_char == ":"){
                this.advance();
                return new Token(Colon, ":");
            }
            if (this.current_char == "&"){
                this.advance();
                return new Token(AndSign, "&");
            }
            if (this.current_char == "\""){
                this.advance();
                let result = this.string();
                this.advance();
                return new Token(String, result);
            }
            else {
                this.error("Invalid character");
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
        console.log(tokens)

        return tokens;
    }
}


let input = `
fn(int x, int y) => int {}
`;

let lexer = new Lexer(input);
lexer.tokenize();