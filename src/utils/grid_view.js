import React from 'react';
import classnames from 'classnames';
import range from 'node-range';
import EpicComponent from 'epic-component';

import {getCellLetter} from './cell';

export const Grid = EpicComponent(self => {
   /* Props:
         alphabet
         grid
         selectedRow
         selectedCol
         onClick
   */

   const onClick = function (event) {
      const element = event.currentTarget;
      const row = parseInt(element.getAttribute('data-row'));
      const col = parseInt(element.getAttribute('data-col'));
      self.props.onClick(row, col);
   };

   self.render = function () {
      const {alphabet, grid, selectedRow, selectedCol, testConflict} = self.props;
      const nbRows = grid.length;
      const nbCols = grid[0].length;
      const renderCell = function (row, col) {
         const cell = grid[row][col];
         const classes = ["qualifier-" + cell.q];
         if (selectedRow === row && selectedCol === col) {
            classes.push("cell-query");  // XXX cell-selected
         }
         if (testConflict !== undefined && testConflict(row, col)) {
            classes.push("cell-conflict");
         }
         let letter = getCellLetter(alphabet, cell);
         return <td key={row*nbCols+col} className={classnames(classes)} onClick={onClick} data-row={row} data-col={col}>{letter}</td>;
      };
      const renderRow = function (row) {
         return <tr key={row}>{range(0, nbCols).map(col => renderCell(row, col))}</tr>;
      };
      return (
         <table className='playFairGrid'>
            <tbody>
               {range(0, nbRows).map(renderRow)}
            </tbody>
         </table>
      );
   };

});
