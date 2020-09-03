class Stack {
    constructor() {
        this.items = [];
    }

    push(val) {
        this.items.push(val)
    }

    pop() {
        if (this.items.length == 0) {
            return;
        }
        return this.items.pop();
    }

    peek() {
        return this.items[this.items.length - 1];
    }
    size() {
        return this.items.length;
    }
    isEmpty() {
        return this.items.length == 0;
    }

    printStack() {
        var str = "";
        for (var i = 0; i < this.items.length; i++)
            str += this.items[i] + " ";
        console.log(str);
    }
}   //stack class ends


function evalInfix(formula) {
    let operator = new Stack();
    let operand = new Stack();
    let formulaComps = formula.split(" ");
    for (let i = 0; i < formulaComps.length; i++) {
        let ch = formulaComps[i];
        if (ch == " ")
            continue;

        else if (ch == '(') {
            operator.push(ch);
        }
        
        else if (!isNaN(ch)) {
            operand.push(Number(ch));
        }
        
        else if (ch == ')') {
            if (operator.isEmpty()) {
                console.log('invalid formula');
                return;
            }
           
            while (operator.peek() != '(') {
                let val2 = operand.pop();
                let op = operator.pop();
                let val1 = operand.pop();
                let rv = calcVal(val1, op, val2);
                operand.push(rv);
            }
            operator.pop();
        }
        else {
            let curPre = getPrecedence(ch);
            while (!operator.isEmpty() && ( curPre <= getPrecedence(operator.peek()) ) ) {
                console.log(ch);
                let val2 = operand.pop();
                let op = operator.pop();
                let val1 = operand.pop();
                let rv = calcVal(val1, op, val2);
                operand.push(rv);
            }
            operator.push(ch);
        }
    }

    while (!operator.isEmpty()) {
        let val2 = operand.pop();
        let op = operator.pop();
        let val1 = operand.pop();
        let rv = calcVal(val1, op, val2);
        operand.push(rv);
    }
    return operand.pop();
}

function calcVal(v1, op, v2) {
    switch (op) {

        case '+': return v1 + v2;
        case '-': return v1 - v2;
        case '*': return v1 * v2;
        case '/': return v1 / v2;
    }
}
function getPrecedence(ch) {
    switch (ch) {
        case '(': return 0;
        case '+':
        case '-': return 1;
        case '*':
        case '/': return 2;
    }
}

module.exports = {
    evalInfix
}