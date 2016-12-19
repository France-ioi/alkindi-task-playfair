import {maxQualifier} from './cell';

/* Returns an array giving for each letter of the alphabet, the max qualifier for that letter in the grid */
export const getLetterQualifiersFromGrid = function (gridCells, alphabet) {
   const {size} = alphabet;
   const letterQualifiers = [];
   for (let iLetter = 0; iLetter < size; iLetter++) {
      letterQualifiers[iLetter] = 'unknown';
   }
   const nbRows = gridCells.length;
   const nbCols = gridCells[0].length;
   for (let row = 0; row < nbRows; row++) {
      for (let col = 0; col < nbCols; col++) {
         const cell = gridCells[row][col];
         if (cell.q != 'unknown') {
            letterQualifiers[cell.l] = maxQualifier[letterQualifiers[cell.l]][cell.q];
         }
      }
   }
   return letterQualifiers;
};

/*
  Apply an editGrid to a grid.
  Elements of the grid are objects with properties 'letter' and 'locked'.
*/
export const applyGridEdit = function (alphabet, inputGrid, editGrid) {
   const nbRows = inputGrid.length;
   const nbCols = inputGrid[0].length;
   const resultRows = [];
   const letterRanks = alphabet.ranks;
   for (var row = 0; row < nbRows; row++) {
      const inputRow = inputGrid[row];
      const editRow = editGrid[row];
      let resultRow = inputRow;
      if (editRow !== undefined) {
         resultRow = [];
         for (var col = 0; col < nbCols; col++) {
            const inputCell = inputRow[col];
            const editCell = editRow[col];
            let resultCell = inputCell;
            if (inputCell.q !== 'confirmed' && inputCell.q !== 'hint' && editCell !== undefined) {
               const letterRank = letterRanks[editCell.letter];
               if (letterRank !== undefined) {
                  let qualifier = 'guess';
                  if (editCell.locked) {
                     qualifier = 'locked';
                  } else {
                     // If the input cell is locked, an identical 'guess' edit
                     // makes the output 'confirmed'.
                     if (inputCell.qualifier === 'locked' && letterRank == inputCell.l)
                        qualifier = 'confirmed';
                  }
                  resultCell = {l: letterRank, q: qualifier};
               }
            }
            resultRow.push(resultCell);
         }
      }
      resultRows.push(resultRow);
   }
   return resultRows;
};
