import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import update from 'immutability-helper';

import {Python, Variables} from '../ui';
import EditPairDialog from '../utils/edit_pair_dialog';
import {getCellLetter, getQualifierClass, testConflict} from '../utils/cell';
import {getTextBigrams, getMostFrequentBigrams} from '../utils/bigram';
import {getBigramSubstPair, nullSubstPair, countSubstitutionConflicts, applySubstitutionEdits} from '../utils/bigram_subst';

function BigramFrequencyAnalysisSelector (state) {
   const {actions, alphabet, mostFrequentFrench} = state;
   const {nBigrams, substitutionEdits, selectedBigram, editPair} = state.bigramFrequencyAnalysis;
   const {inputCipheredText, inputSubstitution, textBigrams, mostFrequentBigrams, outputSubstitution, nConflicts} = state.bigramFrequencyAnalysis;
   return {
      actions, alphabet, mostFrequentFrench,
      nBigrams, substitutionEdits, selectedBigram, editPair,
      inputCipheredText, inputSubstitution, textBigrams, mostFrequentBigrams, outputSubstitution, nConflicts,
   };
}

class BigramFrequencyAnalysis extends React.PureComponent {

   /*
      props:
         inputCipheredTextVariable
         inputSubstitutionVariable
         outputSubstitutionVariable
         substitutionEdits
         editable
         alphabet
         inputCipheredText
         inputSubstitution
         outputSubstitution
         mostFrequentFrench
         mostFrequentBigrams
         nConflicts
   */

   render () {
      const {editable, nBigrams, editPair, inputSubstitution, outputSubstitution, mostFrequentFrench, mostFrequentBigrams, nConflicts} = this.props;
      const textBigrams = this.renderFreqSubstBigrams(mostFrequentBigrams, inputSubstitution, outputSubstitution);
      const frenchBigrams = this.renderFreqBigrams(mostFrequentFrench.slice(0, nBigrams || 10));
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
               <div className='bigramFrequencyAnalysis grillesSection'>
                  {editable && <p><strong>{"Nombre de conflits :"}</strong>{" "}{nConflicts}</p>}
                  <strong>{"Bigrammes les plus fréquents du texte d'entrée :"}</strong>
                  {textBigrams}
                  <strong>{"Bigrammes les plus fréquents en français :"}</strong>
                  {frenchBigrams}
               </div>
            </div>
         </div>
      );
   }

   renderInstructionPython() {
      const {inputCipheredTextVariable, inputSubstitutionVariable,
             outputSubstitutionVariable, editable} = this.props;
      const expr = (
         <Python.Call name="analyseFrequenceBigrammes">
            <Python.Var name={inputCipheredTextVariable}/>
            <Python.Var name={inputSubstitutionVariable}/>
            {editable && <span>…</span>}
         </Python.Call>
      );
      if (!editable)
         return expr;
      return (
         <Python.Assign>
            <Python.Var name={outputSubstitutionVariable}/>
            {expr}
         </Python.Assign>
      );
   }

   renderVariables() {
      const {inputCipheredTextVariable, inputSubstitutionVariable,
             outputSubstitutionVariable, editable} = this.props;
      const inputVars = [
         {label: "Texte chiffré analysé", name: inputCipheredTextVariable},
         {
            label: editable ? "Substitution d'origine" : "Substitution appliquée",
            name: inputSubstitutionVariable
         }
      ];
      const outputVars = editable && [
         {label: "Substitution proposée", name: outputSubstitutionVariable}
      ];
      return <Variables inputVars={inputVars} outputVars={outputVars} />;
   }

   renderCell(cell) {
      const classes = ['bigramLetter', getQualifierClass(cell.q)];
      return <span className={classnames(classes)}>{getCellLetter(this.props.alphabet, cell, true)}</span>;
   }

   renderBigram(bigram) {
      const {v} = bigram;
      return <span>{v.charAt(0)+'\u00a0'+v.charAt(1)}</span>;
   }

   renderEditPair() {
      const {selectedBigram, editPair} = this.props;
      const {alphabet, inputSubstitution} = this.props;
      const substPair = getBigramSubstPair(inputSubstitution, selectedBigram) || nullSubstPair;
      return (
         <EditPairDialog
            alphabet={alphabet} bigram={selectedBigram} editPair={editPair} substPair={substPair}
            onOk={this.validateDialog} onCancel={this.cancelDialog} onChange={this.setEditPair} />
      );
   }

   renderFreqBigrams(bigrams) {
      return (
         <div className='x-scrollBloc'>
            <div className='labels'>
               <div>{"Fréquences :"}</div>
               <div>{"Bigrammes :"}</div>
            </div>
            {bigrams.map(this.renderFreqBigram)}
         </div>
      );
   }

   renderFreqBigram = (bigram, i) => {
      return (
         <div key={i} className='bigramBloc'>
            <span className='frequence'>{bigram.r} %</span>
            <div className='bigramBlocSubstitution'>
               <div className='bigramCipheredLetter'>
                  {this.renderBigram(bigram)}
               </div>
            </div>
         </div>
      );
   };

   renderFreqSubstBigrams(bigrams, inputSubstitution, outputSubstitution) {
      const {editable} = this.props;
      return (
         <div className='x-scrollBloc'>
            <div className='labels'>
               <div>{"Fréquences :"}</div>
               <div>{"Bigrammes :"}</div>
               {editable
                  ? <div>{"Substitution d'origine :"}</div>
                  : <div>{"Substitution :"}</div>}
               {editable && <div>{"Nouvelle substitution :"}</div>}
            </div>
            {bigrams.map(this.renderFreqSubstBigram)}
         </div>
      );
   }

   renderBigramSubstSide = (bigram, inputPair, outputPair, side) => {
      const {editable} = this.props;
      const inputCell = inputPair.dst[side];
      const outputCell = outputPair.dst[side];
      const hasConflict = testConflict(inputCell, outputCell);
      const isLocked = outputCell.q === "locked";
      return (
         <div className={classnames(['substitutionPair', hasConflict && 'substitutionConflict'])}>
            <span className='originLetter'>
               {this.renderCell(inputCell)}
            </span>
            {editable && <span className='newLetter'>
               {this.renderCell(outputCell)}
            </span>}
            {editable && <span className='substitutionLock'>
               {isLocked ? <i className='fa fa-lock'></i> : ' '}
            </span>}
         </div>
      );
   };

   renderFreqSubstBigram = (bigram) => {
      const {selectedBigram} = this.props;
      const bigramClasses = ['bigramBlocSubstitution'];
      if (selectedBigram && selectedBigram.v === bigram.v) {
         bigramClasses.push("selectedBigram")
      }
      const inputPair = getBigramSubstPair(this.props.inputSubstitution, bigram) || nullSubstPair;
      const outputPair = getBigramSubstPair(this.props.outputSubstitution, bigram) || nullSubstPair;
      return (
         <div key={bigram.v} className='bigramBloc' onClick={this.clickBigram} data-bigram={bigram.v} >
            <span className='frequence'>{bigram.r} %</span>
            <div className={classnames(bigramClasses)}>
               <div className='bigramCipheredLetter'>{this.renderBigram(bigram)}</div>
               {this.renderBigramSubstSide(bigram, inputPair, outputPair, 0)}
               {this.renderBigramSubstSide(bigram, inputPair, outputPair, 1)}
            </div>
         </div>
      );
   };

   clickBigram = (event) => {
      if (this.props.editable) {
         const bigram = event.currentTarget.getAttribute('data-bigram');
         this.props.dispatch({type: this.props.actions.bigramFrequencyAnalysisSelectBigram, payload: {bigram}});
      }
   };

   setEditPair = (editPair) => {
      this.props.dispatch({type: this.props.actions.bigramFrequencyAnalysisSetEditPair, payload: {editPair}});
   };

   validateDialog = (editPair) => {
      const bigram = this.props.selectedBigram;
      this.props.dispatch({type: this.props.actions.bigramFrequencyAnalysisApplyEdit, payload: {bigram, editPair}});
   };

   cancelDialog = () => {
      this.props.dispatch({type: this.props.actions.bigramFrequencyAnalysisCancelEdit});
   };

}

function taskInitReducer (state, _action) {
   return update(state, {bigramFrequencyAnalysis: {
      $set: {
         nBigrams: 10,
         substitutionEdits: {},
         selectedBigram: undefined,
         editPair: undefined,
      }
   }});
}

function selectBigramReducer(state, action) {
   const {bigram} = action.payload;
   const {substitutionEdits} = state.bigramFrequencyAnalysis;
   const editPair = substitutionEdits[bigram.v] || [{locked: false}, {locked: false}];
   return update(state, {bigramFrequencyAnalysis: {
      selectedBigram: {$set: bigram},
      editPair: {$set: editPair},
   }});
}

function setEditPairReducer(state, action) {
   const {editPair} = action.payload;
   return update(state, {bigramFrequencyAnalysis: {
      editPair: {$set: editPair},
   }});
}

function applyEditReducer(state, action) {
   const {bigram, editPair} = action.payload;
   let change;
   if (!editPair[0] && !editPair[1]) {
      change = {$unset: [bigram.v]};
   } else {
      change = {[bigram.v]: {$set: editPair}};
   }
   return update(state, {bigramFrequencyAnalysis: {substitutionEdits: change}});
}

function cancelEditReducer (state, action) {
   return update(state, {bigramFrequencyAnalysis: {
      selectedBigram: {$set: undefined},
      editPair: {$set: undefined},
   }});
}

function lateReducer (state) {
   if (state.taskReady) {
      const {bigramAlphabet} = state;
      const {substitutionEdits, nBigrams} = state.bigramFrequencyAnalysis;
      const inputCipheredText = state.taskData.cipherText; // TextInput.output
      const inputSubstitution = state.editSubstitution.outputSubstitution;
      const textBigrams = getTextBigrams(inputCipheredText, bigramAlphabet);
      const mostFrequentBigrams = getMostFrequentBigrams(textBigrams, nBigrams || 10);
      const outputSubstitution = applySubstitutionEdits(bigramAlphabet, inputSubstitution, substitutionEdits);
      const nConflicts = countSubstitutionConflicts(mostFrequentBigrams, inputSubstitution, outputSubstitution);
      state = update(state, {bigramFrequencyAnalysis: {
         inputCipheredText: {$set: inputCipheredText},
         inputSubstitution: {$set: inputSubstitution},
         textBigrams: {$set: textBigrams},
         mostFrequentBigrams: {$set: mostFrequentBigrams},
         outputSubstitution: {$set: outputSubstitution},
         nConflicts: {$set: nConflicts},
      }});
   }
   return state;
}

export default {
   actions: {
      bigramFrequencyAnalysisSelectBigram: 'Task.BigramFrequencyAnalysis.SelectBigram',
      bigramFrequencyAnalysisSetEditPair: 'Task.BigramFrequencyAnalysis.SetEditPair',
      bigramFrequencyAnalysisApplyEdit: 'Task.BigramFrequencyAnalysis.ApplyEdit',
      bigramFrequencyAnalysisCancelEdit: 'Task.BigramFrequencyAnalysis.CancelEdit',
   },
   actionReducers: {
      taskInit: taskInitReducer,
      bigramFrequencyAnalysisSelectBigram: selectBigramReducer,
      bigramFrequencyAnalysisSetEditPair: setEditPairReducer,
      bigramFrequencyAnalysisApplyEdit: applyEditReducer,
      bigramFrequencyAnalysisCancelEdit: cancelEditReducer,
   },
   views: {
      BigramFrequencyAnalysis: connect(BigramFrequencyAnalysisSelector)(BigramFrequencyAnalysis)
   },
   lateReducer
};
