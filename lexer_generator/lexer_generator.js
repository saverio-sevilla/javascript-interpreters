const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'tokentype.txt');

const lines = fs.readFileSync(filePath).toString().split('\r\n');
newLines = lines.map( (str) => {
    return str.trim().split(",").map( (str) => {
        return str.trim();
    });
} )

const file = fs.createWriteStream(path.join(__dirname, 'lexer.js'));
for (let line in newLines){
    let symbol_string;
    if (line.length === 1){
        symbol_string = `${newLines[line][0]}`;
    } else {
        symbol_string = `${newLines[line][1]}`
    }
    let symbol_def =  `const ${newLines[line][0]} = Symbol("${symbol_string}");\n`
    file.write(symbol_def);
}

const token_def = `
class Token{
    constructor(type, value){
        this.type = type;
        this.value = value;
    }
}

`

const basic_lexer_unclosed = `
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
`

file.write(token_def);
file.write(basic_lexer_unclosed); 

function generate_get_next_token_function(newLines){
    let get_next_token_function = `
    get_next_token(){
        while(this.current_char){
            if (this.current_char.match(/\s/)){
                this.skip_whitespace();
            }        
        `   
    if (newLines.includes("Num")){
        get_next_token_function += `
        if (this.current_char.match(/[0-9]/)){
            return new Token(NumToken, this.number());
        }`
    }

    for (line of newLines){
        if (line[0] === "Num"){
            get_next_token_function += `
            if (this.current_char.match(/[0-9]/)){
                return new Token(NumToken, this.number());
            }`
        }
    }

    let single_char_tokens = newLines.filter( (line) => {
        return line[1]?.length === 1;
    });

    let two_char_tokens = newLines.filter( (line) => {
        return line[1]?.length === 2;
    });


    for (line of two_char_tokens){
        
            get_next_token_function += `
            if (this.current_char === "${line[1][0]}" && this.peek() === "${line[1][1]}"){
                this.advance();
                return new Token(${line[0]}, "${line[1]}");
            }
            `
    }

    for (line of single_char_tokens){

        if (line.length === 1){
            get_next_token_function += `
            if (this.current_char === "${line[0]}"){
                this.advance();
                return new Token(${line[0]}, "${line[0]}");
            }
            `
        } else {
            get_next_token_function += `
            if (this.current_char === "${line[1]}"){
                this.advance();
                return new Token(${line[0]}, "${line[1]}");
            }
            `
        }
    }

    for (line of newLines){
        if (line[0] === "ID"){
            get_next_token_function += `
            if (this.current_char.match(/[a-zA-Z_]/)){
                return new Token(ID, this.identifier());
            }
            `
        }
    }

    get_next_token_function += `
            else {
                this.error();
            }
        }
    `



    file.write(get_next_token_function);

    file.write(`}\n`);
}

generate_get_next_token_function(newLines);

file.write(`
tokenize(){

    let tokens = [];
    while(this.pos < this.input.length){
        let token = this.get_next_token();
        tokens.push(token);
    }
    tokens.push(new Token(EOF, null));

    return tokens;
    }
`)

file.write(`}
 
module.exports = {
    Lexer: Lexer,
    Token: Token,
}
`);