const $ = require('jquery');
const fs = require('fs');
const dialog = require('electron').remote.dialog;
let { evalInfix } = require('./ExpressionEval.js')

$(document).ready(function () {
    let db;
    $("#grid .cell").on("click", function () {
        let rowId = Number($(this).attr('row-id')) + 1;
        let colId = Number($(this).attr('col-id')) + 65;
        let address = String.fromCharCode(colId) + rowId;
        $('#address-input').val(address);
        $('#formula-input').val(db[rowId - 1][colId - 65].formula);

    })

    $('#New').on('click', function () {
        db = [];
        let rows = $('#grid .row');
        for (let i = 0; i < rows.length; i++) {
            let row = [];
            let rowkeCells = $(rows[i]).find('.cell');
            for (let j = 0; j < rowkeCells.length; j++) {
                $(rowkeCells[j]). html("");
                let cell = {
                    value: "",
                    formula: "",
                    children: []
                };
                row.push(cell);
            }
            db.push(row);
        }
    })

    $('#grid .cell').on('blur', function () {
        let { rowId, colId } = getRC(this);
        let val = $(this).html();
        let cellObj = db[rowId][colId];

        if (val == cellObj.value) {
            console.log("no change");
            return;
        }

        if (cellObj.formula) {
            removeFormula(cellObj.formula, rowId, colId);
            cellObj.formula = "";
        }
        updateCell(cellObj, rowId, colId, val);
    })


    $('#Save').on('click', async function () {
        let sdb = await dialog.showOpenDialog();
        let data = JSON.stringify(db);
        fs.writeFileSync(sdb.filePaths[0], data);
        console.log("File saved to db");
    })

    $('#Open').on('click', async function () {
        let sdb = await dialog.showOpenDialog();
        // Read File
        let bufferData = fs.readFileSync(sdb.filePaths[0]);
        db = JSON.parse(bufferData);
        //  Set Ui
        let rows = $("#grid .row");
        for (let i = 0; i < rows.length; i++) {
            let rowkeCells = $(rows[i]).find(".cell");
            for (let j = 0; j < rowkeCells.length; j++) {
                // Open and save
                // Grid clear
                $(rowkeCells[j]).html(db[i][j]);
            }
        }
        console.log("File Opened");
        // Write onto grid
    })

    $('#formula-input').on('blur', function () {
        //get the formula
        let formula = $(this).val();

        //set formula property of the cell
        let cellEleAdd = $('#address-input').val();
        let { rowId, colId } = getRCFromAddress(cellEleAdd);
        let cellObj = db[rowId][colId];

        if (cellObj.formula == formula) {
            console.log('No Change');
            return;
        }

        if (cellObj.formula) {
            removeFormula(cellObj.formula, rowId, colId);
            cellObj.formula = "";
        }

        cellObj.formula = formula;
        let rVal = evaluate(formula);

        setupFormula(formula, rowId, colId);
        // update the cell's  ui
        updateCell(cellObj, rowId, colId, rVal);
    });

    function evaluate(formula) {
        let formulaComponents = formula.split(" ");
        for (let i = 0; i < formulaComponents.length; i++) {
            let CharCode = formulaComponents[i].charCodeAt(0);
            if (CharCode >= 65 && CharCode <= 90) {
                let { rowId, colId } = getRCFromAddress(formulaComponents[i]);
                let pVal = db[rowId][colId].value;
                formula = formula.replace(formulaComponents[i], pVal);

            }
        }
        console.log(formula);
        // let rVal = eval(formula);
        let rVal = evalInfix(formula);
        console.log(rVal+"-------------");
        return rVal;
    }

   
    function updateCell(cellObject, rowId, colId, rVal) {
        cellObject.value = rVal;
        // change on ui also
        $(`#grid .cell[row-id=${rowId}][col-id=${colId}]`).html(rVal);

        for (let i = 0; i < cellObject.children.length; i++) {
            let chObjRC = cellObject.children[i];
            let fChObj = db[chObjRC.rowId][chObjRC.colId];
            let rVal = evaluate(fChObj.formula);
            updateCell(fChObj, chObjRC.rowId, chObjRC.colId, rVal);
        }
    }

    function setupFormula(formula, chRow, chCol) {
        let formulaComponents = formula.split(" ");
        for (let i = 0; i < formulaComponents.length; i++) {
            let CharCode = formulaComponents[i].charCodeAt(0);
            if (CharCode >= 65 && CharCode <= 90) {
                let { rowId, colId } = getRCFromAddress(formulaComponents[i]);
                let parentObj = db[rowId][colId];
                parentObj.children.push({
                    rowId: chRow,
                    colId: chCol
                });
            }
        }
    }

    function removeFormula(formula, chRow, chCol) {
        //iterate over all its elements and remove it from its parent's list

        let formulaComponents = formula.split(" ");
        for (let i = 0; i < formulaComponents.length; i++) {
            let CharCode = formulaComponents[i].charCodeAt(0);
            if (CharCode >= 65 && CharCode <= 90) {
                let { rowId, colId } = getRCFromAddress(formulaComponents[i]);
                let parentObj = db[rowId][colId];

                let remArr = parentObj.children.filter(function (chObj) {
                    return !(chObj.rowId == chRow && chObj.colId == chCol);
                });
                parentObj.children = remArr;
            }
        }
    }

    function getRCFromAddress(cellEleAdd) {
        let colId = Number(cellEleAdd.charCodeAt(0)) - 65;
        let rowId = Number(cellEleAdd.substring(1)) - 1;
        return { rowId, colId };
    }

    function getRC(element) {
        let rowId = $(element).attr('row-id');
        let colId = $(element).attr('col-id');
        return { rowId, colId };
    }

    //IIFE
    (function () {
        $("#New").trigger("click");
        console.log('new called');
    })();

    
});
