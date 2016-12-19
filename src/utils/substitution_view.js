import React from 'react';
import classnames from 'classnames';
import EpicComponent from 'epic-component';

import {getCellLetter} from './cell';

export const Substitution = EpicComponent(self => {

   /* Props
         alphabet
         substitution
   */

   const getQualifierClass = function (q) {
      if ((q === "locked") || (q === "confirmed")) {
         return "qualifier-confirmed";
      } else if (q === "hint") {
         return "qualifier-hint";
      } else {
         return "qualifier-unconfirmed";
      }
   };

   self.render = function () {
      const {alphabet, substitution} = self.props;
      const nbLetters = alphabet.size;
      const items = [];
      const renderCell = function (cell) {
         const letter = getCellLetter(alphabet, cell, true);
         const classes = ['bigramLetter', getQualifierClass(cell.q)];
         return <span className={classnames(classes)}>{letter}</span>;
      };
      const renderPair = function (pair) {
         return (
            <table className='bigrams'>
               <tbody>
                  <tr>
                     <td>{renderCell(pair.src[0])}{renderCell(pair.src[1])}</td>
                     <td><i className='fa fa-long-arrow-right'></i></td>
                     <td>{renderCell(pair.dst[0])}{renderCell(pair.dst[1])}</td>
                  </tr>
               </tbody>
            </table>
         );
      };
      for (var src1 = 0; src1 < nbLetters; src1++) {
         for (var src2 = src1 + 1; src2 < nbLetters; src2++) {
            if ((substitution[src1] !== undefined) && (substitution[src1][src2] !== undefined)) {
               items.push(
                  <div key={src1*nbLetters+src2}>
                     {renderPair(substitution[src1][src2])}
                     {renderPair(substitution[src2][src1])}
                  </div>
               );
            }
         }
      }
      return (
         <div className='bigramSubstitution y-scrollBloc'>{items}</div>
      );
   };

});
