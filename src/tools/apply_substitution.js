import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import update from 'immutability-helper';

import {Python, Variables} from '../ui';
import {getCellLetter, getQualifierClass} from '../utils/cell';
import {getCellsWrapping} from '../utils/wrapping';
import {getTextAsBigrams} from '../utils/bigram';
import {applySubstitution} from '../utils/bigram_subst';

function ApplySubstitutionSelector (state) {
   const {alphabet} = state;
   const {inputText, inputSubstitution, outputText, lineStartCols} = state.applySubstitution;
   return {alphabet, inputText, inputSubstitution, outputText, lineStartCols};
}

class ApplySubstitution extends React.PureComponent {

   /*
      inputTextVariable
      inputSubstitutionVariable
      outputTextVariable
      alphabet
      inputText
      inputSubstitution
      outputText
      lineStartCols
   */

   render () {
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  {this.renderInstructionPython()}
               </span>
            </div>
            <div className='panel-body'>
               {this.renderVariables()}
               {this.renderText()}
            </div>
         </div>
      );
   }

   renderInstructionPython () {
      const {outputTextVariable, inputSubstitutionVariable, inputTextVariable} = this.props;
      return (
         <Python.Assign>
            <Python.Var name={outputTextVariable}/>
            <Python.Call name="appliqueSubstitution">
               <Python.Var name={inputTextVariable}/>
               <Python.Var name={inputSubstitutionVariable}/>
            </Python.Call>
         </Python.Assign>
      );
   }

   renderVariables () {
      const {inputTextVariable, inputSubstitutionVariable, outputTextVariable} = this.props;
      const inputVars = [
         {label: "Texte chiffré", name: inputTextVariable},
         {label: "Substitution appliquée", name: inputSubstitutionVariable}
      ];
      const outputVars = [
         {label: "Texte déchiffré", name: outputTextVariable}
      ];
      return <Variables inputVars={inputVars} outputVars={outputVars} />;
   }

   renderText () {
      const {alphabet, outputText, lineStartCols} = this.props;
      let line = 0;
      const elements = [];
      for (let iCell = 0; iCell < outputText.length; iCell++) {
         if (lineStartCols[line + 1] === iCell) {
            elements.push(<hr key={'l'+line}/>);
            line++;
         }
         const cell = outputText[iCell];
         elements.push(<Cell key={iCell} alphabet={alphabet} cell={cell} />);
      }
      return <div className='y-scrollBloc applySubstitution'>{elements}</div>;
   }

}

function Cell ({alphabet, cell}) {
   const classes = ['substituedLetter', getQualifierClass(cell.q)];
   const letter = 'l' in cell ? getCellLetter(alphabet, cell, true) : cell.c;
   return <span className={classnames(classes)}>{letter}</span>;
}

function taskInitReducer (state, _action) {
   return update(state, {applySubstitution: {
      $set: {
         nbLettersPerRow: 29
      }
   }});
}

function lateReducer (state) {
   if (state.taskReady) {
      const {bigramAlphabet} = state;
      const {nbLettersPerRow} = state.applySubstitution;
      const inputText = state.textInput.outputText;
      const inputSubstitution = state.editSubstitution.outputSubstitution;
      const letterInfos = getTextAsBigrams(inputText, bigramAlphabet).letterInfos;
      const outputText = applySubstitution(inputSubstitution, letterInfos);
      const lineStartCols = getCellsWrapping(outputText, nbLettersPerRow);
      state = update(state, {applySubstitution: {
         inputText: {$set: inputText},
         inputSubstitution: {$set: inputSubstitution},
         letterInfos: {$set: letterInfos},
         outputText: {$set: outputText},
         lineStartCols: {$set: lineStartCols},
      }});
   }
   return state;
}

export default {
   actionReducers: {
      taskInit: taskInitReducer,
   },
   views: {
      ApplySubstitution: connect(ApplySubstitutionSelector)(ApplySubstitution)
   },
   lateReducer
};
