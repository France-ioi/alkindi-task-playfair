import React from 'react';
import classnames from 'classnames';
import range from 'node-range';

import {getCellLetter} from './cell';

export class Grid extends React.PureComponent {

   /* Props:
         alphabet
         grid
         selectedRow
         selectedCol
         onClick
   */

   render () {
      const {alphabet, grid, selectedRow, selectedCol, testConflict} = this.props;
      const nbRows = grid.length;
      const nbCols = grid[0].length;
      const renderCell = (row, col) => {
         const cell = grid[row][col];
         const classes = ["qualifier-" + cell.q];
         if (selectedRow === row && selectedCol === col) {
            classes.push("cell-query");  // XXX cell-selected
         }
         if (testConflict !== undefined && testConflict(row, col)) {
            classes.push("cell-conflict");
         }
         let letter = getCellLetter(alphabet, cell);
         return <td key={row*nbCols+col} className={classnames(classes)} onClick={this.onClick} data-row={row} data-col={col}>{letter}</td>;
      };
      const renderRow = (row) => {
         return <tr key={row}>{range(0, nbCols).map(col => renderCell(row, col))}</tr>;
      };
      return (
         <table className='playFairGrid'>
            <tbody>
               {range(0, nbRows).map(renderRow)}
            </tbody>
         </table>
      );
   }

   onClick = (event) => {
      const element = event.currentTarget;
      const row = parseInt(element.getAttribute('data-row'));
      const col = parseInt(element.getAttribute('data-col'));
      this.props.onClick(row, col);
   };

}
