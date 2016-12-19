
const getDstCoords = function (row1, col1, row2, col2) {
   if ((row1 !== row2) && (col1 !== col2)) {
      return [
         {row: row1, col: col2},
         {row: row2, col: col1}
      ];
   } else if (row1 === row2) {
      return [
         {row: row1, col: (col1 + 4) % 5},
         {row: row2, col: (col2 + 4) % 5}
      ];
   } else {
      return [
         {row: (row1 + 4) % 5, col: col1},
         {row: (row2 + 4) % 5, col: col2}
      ];
   }
};

const addToSubstitution = function (cells, substitution, row1, col1, row2, col2) {
   const cellSrc1 = cells[row1][col1];
   const cellSrc2 = cells[row2][col2];
   if ((cellSrc1.l === undefined) || (cellSrc2.l === undefined)) {
      return undefined;
   }
   const dstCoords = getDstCoords(row1, col1, row2, col2);
   const cellDst1 = cells[dstCoords[0].row][dstCoords[0].col];
   const cellDst2 = cells[dstCoords[1].row][dstCoords[1].col];

   if ((cellDst1.l === undefined) && (cellDst2.l === undefined)) {
      return undefined;
   }
   if (substitution[cellSrc1.l] === undefined) {
      substitution[cellSrc1.l] = [];
   }
   if (substitution[cellSrc2.l] === undefined) {
      substitution[cellSrc2.l] = [];
   }
   substitution[cellSrc1.l][cellSrc2.l] = {
      src: [{l: cellSrc1.l, q: cellSrc1.q }, {l: cellSrc2.l, q: cellSrc2.q }],
      dst: [{l: cellDst1.l, q: cellDst1.q }, {l: cellDst2.l, q: cellDst2.q }]
   };
   substitution[cellSrc2.l][cellSrc1.l] = {
      src: [{l: cellSrc2.l, q: cellSrc2.q }, {l: cellSrc1.l, q: cellSrc1.q }],
      dst: [{l: cellDst2.l, q: cellDst2.q }, {l: cellDst1.l, q: cellDst1.q }]
   };
};

export const getSubstitutionFromGridCells = function (cells) {
   var substitution = [];
   var nbRows = cells.length;
   var nbCols = cells[0].length;
   for (var row1 = 0; row1 < nbRows; row1++) {
      for (var col1 = 0; col1 < nbCols; col1++) {
         var startCol2 = col1 + 1;
         for (var row2 = row1; row2 < nbRows; row2++) {
            for (var col2 = startCol2; col2 < nbCols; col2++) {
                addToSubstitution(cells, substitution, row1, col1, row2, col2);
            }
            startCol2 = 0;
         }
      }
   }
   return substitution;
};
