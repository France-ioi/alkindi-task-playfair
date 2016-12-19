import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {Python, Variables, Tooltip} from 'alkindi-task-lib/ui';

import {getCellLetter, getQualifierClass, testConflict} from '../utils/cell';
import {getStringWrapping} from '../utils/wrapping';
import {getTextAsBigrams, sideOfStatus} from '../utils/bigram';
import {getBigramSubstPair, nullSubstPair, countAllSubstitutionConflicts, applySubstitutionEdits} from '../utils/bigram_subst';
import EditPairDialog from '../utils/edit_pair_dialog';

const Component = EpicComponent(self => {

   /*
      props:
         state:
            inputCipheredTextVariable
            inputSubstitutionVariable
            outputSubstitutionVariable
            substitutionEdits
         scope:
            alphabet
            inputCipheredText
            inputSubstitution
            outputSubstitution
   */

   const selectLetter = function (event) {
      const iLetter = parseInt(event.currentTarget.getAttribute('data-i'));
      const {letterInfos} = self.props.scope;
      const bigram = letterInfos[iLetter].bigram;
      if (bigram !== undefined) {
         self.props.dispatch({type: 'SelectLetter', letterPos: iLetter, bigram});
      }
   };

   const setEditPair = function (editPair) {
      self.props.dispatch({type: 'SetEditPair', editPair});
   };

   const validateDialog = function (editPair) {
      const bigram = self.props.state.selectedBigram;
      self.props.dispatch({type: 'ApplyEdit', bigram, editPair});
   };

   const cancelDialog = function () {
      self.props.dispatch({type: 'CancelEdit'});
   };

   const renderInstructionPython = function () {
      const {inputCipheredTextVariable, inputSubstitutionVariable, outputSubstitutionVariable} = self.props.state;
      return (
         <Python.Assign>
            <Python.Var name={outputSubstitutionVariable}/>
            <Python.Call name="éditeSubstitution">
               <Python.Var name={inputCipheredTextVariable}/>
               <Python.Var name={inputSubstitutionVariable}/>
               <span>…</span>
            </Python.Call>
         </Python.Assign>
      );
   };

   const renderVariables = function () {
      const {inputCipheredTextVariable, inputSubstitutionVariable, outputSubstitutionVariable} = self.props.state;
      const inputVars = [
         {label: "Texte chiffré analysé", name: inputCipheredTextVariable},
         {label: "Substitution d'origine", name: inputSubstitutionVariable}
      ];
      const outputVars = [
         {label: "Nouvelle subsitution", name: outputSubstitutionVariable}
      ];
      return <Variables inputVars={inputVars} outputVars={outputVars} />;
   };

   const renderEditPair = function () {
      const {selectedLetterPos, editPair} = self.props.state;
      const {alphabet, letterInfos, inputSubstitution} = self.props.scope;
      const letterInfo = letterInfos[selectedLetterPos];
      const bigram = letterInfo.bigram;
      const side = sideOfStatus[letterInfo.status];
      const substPair = getBigramSubstPair(inputSubstitution, bigram) || nullSubstPair;
      return (
         <EditPairDialog
            alphabet={alphabet} bigram={bigram} editPair={editPair} substPair={substPair}
            onOk={validateDialog} onCancel={cancelDialog} onChange={setEditPair} focusSide={side} />
      );
   };

   const renderCell = function (alphabet, cell) {
      const classes = ['bigramLetter', getQualifierClass(cell.q)];
      return <span className={classnames(classes)}>{getCellLetter(alphabet, cell, true)}</span>;
   };

   const renderBigramSubstSide = function (alphabet, bigram, inputPair, outputPair, side) {
      const inputCell = inputPair.dst[side];
      const outputCell = outputPair.dst[side];
      const hasConflict = testConflict(inputCell, outputCell);
      const isLocked = outputCell.q === "locked";
      return (
         <div className={classnames(['substitutionPair', hasConflict && 'substitutionConflict'])}>
            <span className='originLetter'>
               {renderCell(alphabet, inputCell)}
            </span>
            <span className='newLetter'>
               {renderCell(alphabet, outputCell)}
            </span>
            <span className='substitutionLock'>
               {isLocked ? <i className='fa fa-lock'></i> : ' '}
            </span>
         </div>
      );
   };

   const renderLiteralSubstSide = function (letter) {
      return (
         <div className='substitutionPair'>
            <div className='character'>{letter}</div>
            <div className='character'>{letter}</div>
            <div className='character'> </div>
         </div>
      );
   };

   const renderSubstBigrams = function () {
      const {alphabet, inputCipheredText, inputSubstitution, outputSubstitution, letterInfos, lineStartCols} = self.props.scope;
      const {selectedLetterPos} = self.props.state;
      const selectedBigramPos = selectedLetterPos && letterInfos[selectedLetterPos].iBigram;
      let line = 0;
      const elements = [];
      for (let iLetter = 0; iLetter < inputCipheredText.length; iLetter++) {
         if (lineStartCols[line + 1] === iLetter) {
            elements.push(<hr key={'l'+line}/>);
            line++;
         }
         const letter = inputCipheredText[iLetter];
         const {bigram, status, iBigram}  = letterInfos[iLetter];
         const side = sideOfStatus[status];
         let substBlock;
         if (side !== undefined) {
            const inputPair = getBigramSubstPair(inputSubstitution, bigram) || nullSubstPair;
            const outputPair = getBigramSubstPair(outputSubstitution, bigram) || nullSubstPair;
            substBlock = renderBigramSubstSide(alphabet, bigram, inputPair, outputPair, side);
         } else {
            substBlock = renderLiteralSubstSide(letter);
         }
         const bigramClasses = [
            'letterSubstBloc',
            'letterStatus-' + status,
            iBigram !== undefined && selectedBigramPos === iBigram && 'selectedBigram'
         ];
         elements.push(
            <div key={iLetter} className={classnames(bigramClasses)} onClick={selectLetter} data-i={iLetter}>
               <div className='cipheredLetter'>{letter}</div>
               {substBlock}
            </div>
         );
      }
      return <div className='y-scrollBloc'>{elements}</div>;
   };

   self.render = function () {
      const {editPair} = self.props.state;
      const {nConflicts} = self.props.scope;
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  {renderInstructionPython()}
               </span>
            </div>
            <div className='panel-body'>
               {editPair && renderEditPair()}
               {renderVariables()}
               <div className='editSubstitution grillesSection'>
                  <p><strong>Nombre de conflits entre les substitutions :</strong>{' '}{nConflicts}</p>
                  <p>
                     {'Édition de la substitution, au fil du message chiffré découpé en bigrammes : '}
                     <Tooltip content={<p>Cliquez sur un bigramme chiffré pour définir le bigramme déchiffré correspondant.</p>}/>
                  </p>
                  {renderSubstBigrams()}
               </div>
            </div>
         </div>
      );
   };

});

const compute = function (state, scope) {
   const {substitutionEdits, nbLettersPerRow} = state;
   const {alphabet, bigramAlphabet, inputCipheredText, inputSubstitution} = scope;
   scope.letterInfos = getTextAsBigrams(inputCipheredText, bigramAlphabet).letterInfos;
   scope.lineStartCols = getStringWrapping(inputCipheredText, nbLettersPerRow, alphabet);
   scope.outputSubstitution = applySubstitutionEdits(bigramAlphabet, inputSubstitution, substitutionEdits);
   scope.nConflicts = countAllSubstitutionConflicts(bigramAlphabet, inputSubstitution, scope.outputSubstitution);
};

const noSelection = {
   selectedLetterPos: undefined,
   selectedBigram: undefined,
   editPair: undefined
};

const initialState = {
   nbLettersPerRow: 29,
   substitutionEdits: {},
   ...noSelection
};

export default function EditSubstitution () {
   this.Component = Component;
   this.compute = compute;
   this.state = initialState;
   this.dump = function (state) {
      const {substitutionEdits, inputCipheredTextVariable,
         inputSubstitutionVariable, outputSubstitutionVariable} = state;
      return {substitutionEdits, inputCipheredTextVariable,
         inputSubstitutionVariable, outputSubstitutionVariable};
   };
   this.load = function (dump) {
      return {...initialState, ...dump};
   };
   this.reducers.SelectLetter = function (state, action) {
      const {letterPos, bigram} = action;
      const {substitutionEdits} = state;
      const editPair = substitutionEdits[bigram.v] || [{locked: false}, {locked: false}];
      return {
         ...state,
         selectedLetterPos: letterPos,
         selectedBigram: bigram,
         editPair: editPair
      };
   };
   this.reducers.SetEditPair = function (state, action) {
      const {editPair} = action;
      return {...state, editPair};
   };
   this.reducers.ApplyEdit = function (state, action) {
      const {bigram, editPair} = action;
      let newEdits = {...state.substitutionEdits};
      if (!editPair[0] && !editPair[1]) {
         delete newEdits[bigram.v];
      } else {
         newEdits[bigram.v] = editPair;
      }
      return {...state, ...noSelection, substitutionEdits: newEdits};
   };
   this.reducers.CancelEdit = function (state, action) {
      return {...state, noSelection};
   };
};
