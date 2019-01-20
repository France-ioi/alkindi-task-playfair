import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import update from 'immutability-helper';

import {Python, Variables, Tooltip} from '../ui';
import {getCellLetter, getQualifierClass, testConflict} from '../utils/cell';
import {getStringWrapping} from '../utils/wrapping';
import {getTextAsBigrams, sideOfStatus} from '../utils/bigram';
import {getBigramSubstPair, nullSubstPair, countAllSubstitutionConflicts, applySubstitutionEdits} from '../utils/bigram_subst';
import EditPairDialog from '../utils/edit_pair_dialog';

function EditSubstitutionSelector (state) {
   const {actions, alphabet} = state;
   const {selectedLetterPos, selectedBigram, editPair, nbLettersPerRow, substitutionEdits} = state.editSubstitution;
   const {inputCipheredText, inputSubstitution, letterInfos, lineStartCols, outputSubstitution, nConflicts} = state.editSubstitution;
   return {
      actions, alphabet,
      selectedLetterPos, selectedBigram, editPair, nbLettersPerRow, substitutionEdits,
      inputCipheredText, inputSubstitution, letterInfos, lineStartCols, outputSubstitution, nConflicts
   };
}

class EditSubstitution extends React.PureComponent {

   /*
      props:
         inputCipheredTextVariable
         inputSubstitutionVariable
         outputSubstitutionVariable
         alphabet
         inputCipheredText
         inputSubstitution
         outputSubstitution
         substitutionEdits
         letterInfos
         lineStartCols
         selectedLetterPos
         selectedBigram
         editPair
         nConflicts
   */

   render() {
      const {nConflicts, editPair} = this.props;
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  {this.renderInstructionPython()}
               </span>
            </div>
            <div className='panel-body'>
               {editPair && this.renderEditPair()}
               {this.renderVariables()}
               <div className='editSubstitution grillesSection'>
                  <p>
                     <strong>{"Nombre de conflits entre les substitutions :"}</strong>
                     {' '}{nConflicts}
                  </p>
                  <p>
                     {'Édition de la substitution, au fil du message chiffré découpé en bigrammes : '}
                     <Tooltip content={<p>{"Cliquez sur un bigramme chiffré pour définir le bigramme déchiffré correspondant."}</p>}/>
                  </p>
                  {this.renderSubstBigrams()}
               </div>
            </div>
         </div>
      );
   }

   renderInstructionPython() {
      const {inputCipheredTextVariable, inputSubstitutionVariable, outputSubstitutionVariable} = this.props;
      return (
         <Python.Assign>
            <Python.Var name={outputSubstitutionVariable}/>
            <Python.Call name="éditeSubstitution">
               <Python.Var name={inputCipheredTextVariable}/>
               <Python.Var name={inputSubstitutionVariable}/>
               <span>{"…"}</span>
            </Python.Call>
         </Python.Assign>
      );
   }

   renderVariables() {
      const {inputCipheredTextVariable, inputSubstitutionVariable, outputSubstitutionVariable} = this.props;
      const inputVars = [
         {label: "Texte chiffré analysé", name: inputCipheredTextVariable},
         {label: "Substitution d'origine", name: inputSubstitutionVariable}
      ];
      const outputVars = [
         {label: "Nouvelle subsitution", name: outputSubstitutionVariable}
      ];
      return <Variables inputVars={inputVars} outputVars={outputVars} />;
   };

   renderEditPair() {
      const {selectedLetterPos, editPair, alphabet, letterInfos, inputSubstitution} = this.props;
      const letterInfo = letterInfos[selectedLetterPos];
      const bigram = letterInfo.bigram;
      const side = sideOfStatus[letterInfo.status];
      const substPair = getBigramSubstPair(inputSubstitution, bigram) || nullSubstPair;
      return (
         <EditPairDialog
            alphabet={alphabet} bigram={bigram} editPair={editPair} substPair={substPair}
            onOk={this.validateDialog} onCancel={this.cancelDialog} onChange={this.setEditPair} focusSide={side} />
      );
   }

   renderCell(alphabet, cell) {
      const classes = ['bigramLetter', getQualifierClass(cell.q)];
      return <span className={classnames(classes)}>{getCellLetter(alphabet, cell, true)}</span>;
   }

   renderBigramSubstSide(alphabet, bigram, inputPair, outputPair, side) {
      const inputCell = inputPair.dst[side];
      const outputCell = outputPair.dst[side];
      const hasConflict = testConflict(inputCell, outputCell);
      const isLocked = outputCell.q === "locked";
      return (
         <div className={classnames(['substitutionPair', hasConflict && 'substitutionConflict'])}>
            <span className='originLetter'>
               {this.renderCell(alphabet, inputCell)}
            </span>
            <span className='newLetter'>
               {this.renderCell(alphabet, outputCell)}
            </span>
            <span className='substitutionLock'>
               {isLocked ? <i className='fa fa-lock'></i> : ' '}
            </span>
         </div>
      );
   }

   renderLiteralSubstSide(letter) {
      return (
         <div className='substitutionPair'>
            <div className='character'>{letter}</div>
            <div className='character'>{letter}</div>
            <div className='character'>{" "}</div>
         </div>
      );
   }

   renderSubstBigrams() {
      const {alphabet, inputCipheredText, inputSubstitution, outputSubstitution, letterInfos, lineStartCols, selectedLetterPos} = this.props;
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
            substBlock = this.renderBigramSubstSide(alphabet, bigram, inputPair, outputPair, side);
         } else {
            substBlock = this.renderLiteralSubstSide(letter);
         }
         const bigramClasses = [
            'letterSubstBloc',
            'letterStatus-' + status,
            iBigram !== undefined && selectedBigramPos === iBigram && 'selectedBigram'
         ];
         elements.push(
            <div key={iLetter} className={classnames(bigramClasses)} onClick={this.selectLetter} data-i={iLetter}>
               <div className='cipheredLetter'>{letter}</div>
               {substBlock}
            </div>
         );
      }
      return <div className='y-scrollBloc'>{elements}</div>;
   }

   selectLetter = (event) => {
      const iLetter = parseInt(event.currentTarget.getAttribute('data-i'));
      const {letterInfos} = this.props;
      const bigram = letterInfos[iLetter].bigram;
      if (bigram !== undefined) {
         this.props.dispatch({type: this.props.actions.editSubstitutionSelectLetter, payload: {letterPos: iLetter, bigram}});
      }
   };

   setEditPair = (editPair) => {
      this.props.dispatch({type: this.props.actions.editSubstitutionSetEditPair, payload: {editPair}});
   };

   validateDialog = (editPair) => {
      const bigram = this.props.selectedBigram;
      this.props.dispatch({type: this.props.actions.editSubstitutionApplyEdit, payload: {bigram, editPair}});
   };

   cancelDialog = () => {
      this.props.dispatch({type: this.props.actions.editSubstitutionCancelEdit});
   };

}

function taskInitReducer (state, _action) {
   const {taskData} = state;
   const u = {q: 'unknown'};
   const row = [u,u,u,u,u];
   return update(state, {editSubstitution: {
      $set: {
         selectedLetterPos: undefined,
         selectedBigram: undefined,
         editPair: undefined,
         nbLettersPerRow: 29,
         substitutionEdits: {},
      }
   }});
}

function selectLetterReducer (state, action) {
   const {letterPos, bigram} = action.payload;
   const {substitutionEdits} = state.editSubstitution;
   const editPair = substitutionEdits[bigram.v] || [{locked: false}, {locked: false}];
   return update(state, {editSubstitution: {
      selectedLetterPos: {$set: letterPos},
      selectedBigram: {$set: bigram},
      editPair: {$set: editPair},
   }});
}

function setEditPairReducer (state, action) {
   const {editPair} = action.payload;
   return update(state, {editSubstitution: {
      editPair: {$set: editPair},
   }});
}

function applyEditReducer (state, action) {
   const {bigram, editPair} = action.payload;
   let change;
   if (!editPair[0] && !editPair[1]) {
      change = {$unset: [bigram.v]};
   } else {
      change = {[bigram.v]: {$set: editPair}};
   }
   return update(state, {editSubstitution: {
      substitutionEdits: change,
      selectedLetterPos: {$set: undefined},
      selectedBigram: {$set: undefined},
      editPair: {$set: undefined},
   }});
}

function cancelEditReducer (state, action) {
   return update(state, {editSubstitution: {
      selectedLetterPos: {$set: undefined},
      selectedBigram: {$set: undefined},
      editPair: {$set: undefined},
   }});
}

function lateReducer (state) {
   if (state.taskReady) {
      const {alphabet, bigramAlphabet} = state;
      const inputCipheredText = state.textInput.outputText;
      const inputSubstitution = state.substitutionFromGrid.outputSubstitution;
      const {substitutionEdits, nbLettersPerRow} = state.editSubstitution;
      const letterInfos = getTextAsBigrams(inputCipheredText, bigramAlphabet).letterInfos;
      const lineStartCols = getStringWrapping(inputCipheredText, nbLettersPerRow, alphabet);
      const outputSubstitution = applySubstitutionEdits(bigramAlphabet, inputSubstitution, substitutionEdits);
      const nConflicts = countAllSubstitutionConflicts(bigramAlphabet, inputSubstitution, outputSubstitution);
      state = update(state, {editSubstitution: {
         inputCipheredText: {$set: inputCipheredText},
         inputSubstitution: {$set: inputSubstitution},
         letterInfos: {$set: letterInfos},
         lineStartCols: {$set: lineStartCols},
         outputSubstitution: {$set: outputSubstitution},
         nConflicts: {$set: nConflicts},
      }});
   }
   return state;
}

export default {
   actions: {
      editSubstitutionSelectLetter: 'Task.EditSubstitution.SelectLetter',
      editSubstitutionSetEditPair: 'Task.EditSubstitution.SetEditPair',
      editSubstitutionApplyEdit: 'Task.EditSubstitution.ApplyEdit',
      editSubstitutionCancelEdit: 'Task.EditSubstitution.CancelEdit',
   },
   actionReducers: {
      taskInit: taskInitReducer,
      editSubstitutionSelectLetter: selectLetterReducer,
      editSubstitutionSetEditPair: setEditPairReducer,
      editSubstitutionApplyEdit: applyEditReducer,
      editSubstitutionCancelEdit: cancelEditReducer,
   },
   views: {
      EditSubstitution: connect(EditSubstitutionSelector)(EditSubstitution)
   },
   lateReducer
};
