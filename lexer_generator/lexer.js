const Num = Symbol("Num");
const ID = Symbol("ID");
const Equal = Symbol("Equal");
const Plus = Symbol("Plus");
const Minus = Symbol("Minus");
const Mult = Symbol("Mult");
const Mod = Symbol("Mod");
const Div = Symbol("Div");
const EOF = Symbol("EOF");
const LParen = Symbol("LParen");
const RParen = Symbol(")");
const Fn = Symbol("fn");
const Arrow = Symbol("->");

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

    error(){
        throw new Error("Lexer Error");
    }

    skip_whitespace(){
        while(this.current_char && this.current_char.match(/s/)){
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
        return this.current_char && this.current_char.match(/s/);
    }

    get_next_token(){
        while(this.current_char){
            if (this.current_char.match(/s/)){
                this.skip_whitespace();
            }        
        
            if (this.current_char.match(/[0-9]/)){
                return new Token(NumToken, this.number());
            }
            if (this.current_char === "f" && this.peek() === "n"){
                this.advance();
                return new Token(Fn, "fn");
            }
            
            if (this.current_char === "-" && this.peek() === ">"){
                this.advance();
                return new Token(Arrow, "->");
            }
            
            if (this.current_char === "="){
                this.advance();
                return new Token(Equal, "=");
            }
            
            if (this.current_char === "+"){
                this.advance();
                return new Token(Plus, "+");
            }
            
            if (this.current_char === "-"){
                this.advance();
                return new Token(Minus, "-");
            }
            
            if (this.current_char === "*"){
                this.advance();
                return new Token(Mult, "*");
            }
            
            if (this.current_char === "%"){
                this.advance();
                return new Token(Mod, "%");
            }
            
            if (this.current_char === "/"){
                this.advance();
                return new Token(Div, "/");
            }
            
            if (this.current_char === "("){
                this.advance();
                return new Token(LParen, "(");
            }
            
            if (this.current_char === ")"){
                this.advance();
                return new Token(RParen, ")");
            }
            
            if (this.current_char.match(/[a-zA-Z_]/)){
                return new Token(ID, this.identifier());
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

    return tokens;
    }
}
 
module.exports = {
    Lexer: Lexer,
    Token: Token,
}
