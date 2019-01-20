import React from 'react';
import classnames from 'classnames';
import range from 'node-range';

export class Alphabet extends React.PureComponent {

   render() {
      const {alphabet, qualifiers, selectedLetterRank} = this.props;
      const {symbols} = alphabet;
      const renderCell = (i) => {
         if (i === 22) {
            return <td key={i} className='qualifier-disabled'></td>;
         }
         // no W
         const letterRank = i > 22 ? i - 1 : i;
         const classes = ["qualifier-" + qualifiers[letterRank]];
         if (selectedLetterRank === letterRank) {
            classes.push("cell-query");
         }
         return (
            <td key={i} className={classnames(classes)} onClick={this.onClick} data-letter-rank={letterRank}>
               {symbols[letterRank]}
            </td>
         );
      }
      const renderRow = (row) => {
         return (
            <table key={row} className='playFairAlphabet'>
               <tbody>
                  <tr>{range(0, 13).map(col => renderCell(row * 13 + col))}</tr>
               </tbody>
            </table>
         );
      }
      return <div>{renderRow(0)}<br key='br'/>{renderRow(1)}</div>;
   }

   onClick = (event) => {
      const element = event.currentTarget;
      const letterRank = parseInt(element.getAttribute('data-letter-rank'));
      this.props.onClick(letterRank);
   };

}
