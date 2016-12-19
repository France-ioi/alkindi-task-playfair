import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {Python, Variables} from 'alkindi-task-lib/ui';

import {getCellLetter, getQualifierClass} from '../utils/cell';
import {getCellsWrapping} from '../utils/wrapping';
import {getTextAsBigrams} from '../utils/bigram';
import {applySubstitution} from '../utils/bigram_subst';

export const Component = EpicComponent(self => {

   /*
      props:
         state:
            inputTextVariable
            inputSubstitutionVariable
            outputTextVariable
         scope:
            alphabet
            inputText
            inputSubstitution
            outputText
   */

   const renderInstructionPython = function () {
      const {outputTextVariable, inputSubstitutionVariable, inputTextVariable} = self.props.state;
      return (
         <Python.Assign>
            <Python.Var name={outputTextVariable}/>
            <Python.Call name="appliqueSubstitution">
               <Python.Var name={inputTextVariable}/>
               <Python.Var name={inputSubstitutionVariable}/>
            </Python.Call>
         </Python.Assign>
      );
   };

   const renderVariables = function () {
      const {inputTextVariable, inputSubstitutionVariable, outputTextVariable} = self.props.state;
      const inputVars = [
         {label: "Texte chiffré", name: inputTextVariable},
         {label: "Substitution appliquée", name: inputSubstitutionVariable}
      ];
      const outputVars = [
         {label: "Texte déchiffré", name: outputTextVariable}
      ];
      return <Variables inputVars={inputVars} outputVars={outputVars} />;
   };

   const renderCell = function (alphabet, cell, key) {
      const classes = ['substituedLetter', getQualifierClass(cell.q)];
      const letter = 'l' in cell ? getCellLetter(alphabet, cell, true) : cell.c;
      return <span key={key} className={classnames(classes)}>{letter}</span>;
   };

   const renderText = function () {
      const {alphabet, outputText, lineStartCols} = self.props.scope;
      let line = 0;
      const elements = [];
      for (let iCell = 0; iCell < outputText.length; iCell++) {
         if (lineStartCols[line + 1] === iCell) {
            elements.push(<hr key={'l'+line}/>);
            line++;
         }
         const cell = outputText[iCell];
         elements.push(renderCell(alphabet, cell, iCell));
      }
      return <div className='y-scrollBloc applySubstitution'>{elements}</div>;
   };

   self.render = function () {
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  {renderInstructionPython()}
               </span>
            </div>
            <div className='panel-body'>
               {renderVariables()}
               {renderText()}
            </div>
         </div>
      );
   };

});

export const compute = function (state, scope) {
   const {nbLettersPerRow} = state;
   const {alphabet, inputSubstitution, inputText} = scope;
   scope.letterInfos = getTextAsBigrams(inputText, alphabet).letterInfos;
   scope.outputText = applySubstitution(alphabet, inputSubstitution, scope.letterInfos);
   scope.lineStartCols = getCellsWrapping(scope.outputText, nbLettersPerRow);
};

export default function ApplySubstitution () {
   this.Component = Component;
   this.compute = compute;
   this.state = {
      nbLettersPerRow: 29
   };
};
