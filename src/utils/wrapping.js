
export const getStringWrapping = function (text, maxWidth, alphabet) {
   // Returns a list of positions in the input text.
   const lineStartCols = [0];
   let col = 0;
   let lastNonAlphabet = 0;
   let lastNonAlphabetBeforeLetter = 0;
   for (let iLetter = 0; iLetter < text.length; iLetter++) {
      if (col >= maxWidth) {
         const startCol = lastNonAlphabetBeforeLetter + 1;
         lineStartCols.push(startCol);
         col = iLetter - startCol;
      }
      const letter = text[iLetter];
      if (letter in alphabet.ranks) {
         lastNonAlphabetBeforeLetter = lastNonAlphabet;
      } else {
         lastNonAlphabet = iLetter;
      }
      col++;
   }
   lineStartCols.push(text.length);
   return lineStartCols;
};

export const getCellsWrapping = function (cells, maxWidth) {
   // Returns a list of positions in the input cell array.
   const lineStartCols = [0];
   let col = 0;
   let lastNonAlphabet = 0;
   let lastNonAlphabetBeforeLetter = 0;
   for (let iCell = 0; iCell < cells.length; iCell++) {
      if (col >= maxWidth) {
         const startCol = lastNonAlphabetBeforeLetter + 1;
         lineStartCols.push(startCol);
         col = iCell - startCol;
      }
      const cell = cells[iCell];
      // If it has a 'q' it's a symbol, otherwise it's a literal.
      if ('q' in cell) {
         lastNonAlphabetBeforeLetter = lastNonAlphabet;
      } else {
         lastNonAlphabet = iCell;
      }
      col++;
   }
   lineStartCols.push(cells.length);
   return lineStartCols;
};
