import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {Python, Variables} from 'alkindi-task-lib/ui';

import EditPairDialog from '../utils/edit_pair_dialog';
import {getCellLetter, getQualifierClass, testConflict} from '../utils/cell';
import {getTextBigrams, getMostFrequentBigrams} from '../utils/bigram';
import {getBigramSubstPair, nullSubstPair, countSubstitutionConflicts, applySubstitutionEdits} from '../utils/bigram_subst';

const Component = EpicComponent(self => {

   /*
      props:
         state:
            inputCipheredTextVariable
            inputSubstitutionVariable
            outputSubstitutionVariable
            substitutionEdits
            editable
         scope:
            alphabet
            frenchBigrams
            inputCipheredText
            inputSubstitution
            outputSubstitution
            mostFrequentFrench
            mostFrequentBigrams
   */

   const clickBigram = function (event) {
      const {substitutionEdits, editable} = self.props.state;
      if (!editable)
         return;
      const {mostFrequentBigrams} = self.props.scope;
      const iBigram = parseInt(event.currentTarget.getAttribute('data-i'));
      const bigram = mostFrequentBigrams[iBigram];
      const editPair = substitutionEdits[bigram.v] || [{locked: false}, {locked: false}];
      self.setState({
         editState: "preparing",
         editPair: editPair,
         selectedPos: iBigram
      });
   };

   const validateDialog = function (checkedEditPair) {
      const {selectedPos} = self.state;
      const {mostFrequentBigrams} = self.props.scope;
      const {v} = mostFrequentBigrams[selectedPos];
      const {state, setToolState} = self.props; // XXX
      let newEdits = {...state.substitutionEdits};
      if (!checkedEditPair[0] && !checkedEditPair[1])
         delete newEdits[v];
      else
         newEdits[v] = checkedEditPair;
      setToolState({substitutionEdits: newEdits});
      cancelDialog();
   };

   const cancelDialog = function () {
      self.setState({
         editState: undefined,
         editPair: undefined,
         selectedPos: undefined
      });
   };

   const renderInstructionPython = function () {
      const {inputCipheredTextVariable, inputSubstitutionVariable,
             outputSubstitutionVariable, editable} = self.props.state;
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
   };

   const renderVariables = function () {
      const {inputCipheredTextVariable, inputSubstitutionVariable,
             outputSubstitutionVariable, editable} = self.props.state;
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
   };

   const renderCell = function (alphabet, cell) {
      const classes = ['bigramLetter', getQualifierClass(cell.q)];
      return <span className={classnames(classes)}>{getCellLetter(alphabet, cell, true)}</span>;
   };

   const renderBigram = function (bigram) {
      const {v} = bigram;
      return <span>{v.charAt(0)+'\u00a0'+v.charAt(1)}</span>;
   };

   const setEditPair = function (editPair) {
      self.setState({editPair});
   };

   const renderEditPair = function () {
      const {selectedPos, editPair} = self.state;
      const {alphabet, mostFrequentBigrams, inputSubstitution} = self.props.scope;
      const bigram = mostFrequentBigrams[selectedPos];
      const substPair = getBigramSubstPair(inputSubstitution, bigram) || nullSubstPair;
      return (
         <EditPairDialog
            alphabet={alphabet} bigram={bigram} editPair={editPair} substPair={substPair}
            onOk={validateDialog} onCancel={cancelDialog} onChange={setEditPair} />
      );
   };

   const renderFreqBigrams = function (bigrams) {
      const renderFreqBigram = function (bigram, i) {
         return (
            <div key={i} className='bigramBloc'>
               <span className='frequence'>{bigram.r} %</span>
               <div className='bigramBlocSubstitution'>
                  <div className='bigramCipheredLetter'>
                     {renderBigram(bigram)}
                  </div>
               </div>
            </div>
         );
      };
      return (
         <div className='x-scrollBloc'>
            <div className='labels'>
               <div>Fréquences :</div>
               <div>Bigrammes :</div>
            </div>
            {bigrams.map(renderFreqBigram)}
         </div>
      );
   };

   const renderFreqSubstBigrams = function (bigrams, inputSubstitution, outputSubstitution) {
      const {alphabet} = self.props.scope;
      const {editable} = self.props.state;
      const {selectedPos} = self.state;
      const renderBigramSubstSide = function (bigram, inputPair, outputPair, side) {
         const inputCell = inputPair.dst[side];
         const outputCell = outputPair.dst[side];
         const hasConflict = testConflict(inputCell, outputCell);
         const isLocked = outputCell.q === "locked";
         return (
            <div className={classnames(['substitutionPair', hasConflict && 'substitutionConflict'])}>
               <span className='originLetter'>
                  {renderCell(alphabet, inputCell)}
               </span>
               {editable && <span className='newLetter'>
                  {renderCell(alphabet, outputCell)}
               </span>}
               {editable && <span className='substitutionLock'>
                  {isLocked ? <i className='fa fa-lock'></i> : ' '}
               </span>}
            </div>
         );
      };
      const renderFreqSubstBigram = function (bigram, iBigram) {
         const bigramClasses = ['bigramBlocSubstitution'];
         if (selectedPos === iBigram)
            bigramClasses.push("selectedBigram")
         const inputPair = getBigramSubstPair(inputSubstitution, bigram) || nullSubstPair;
         const outputPair = getBigramSubstPair(outputSubstitution, bigram) || nullSubstPair;
         return (
            <div key={iBigram} className='bigramBloc' onClick={clickBigram} data-i={iBigram} >
               <span className='frequence'>{bigram.r} %</span>
               <div className={classnames(bigramClasses)}>
                  <div className='bigramCipheredLetter'>{renderBigram(bigram)}</div>
                  {renderBigramSubstSide(bigram, inputPair, outputPair, 0)}
                  {renderBigramSubstSide(bigram, inputPair, outputPair, 1)}
               </div>
            </div>
         );
      };
      return (
         <div className='x-scrollBloc'>
            <div className='labels'>
               <div>Fréquences :</div>
               <div>Bigrammes :</div>
               {editable
                  ? <div>Substitution d'origine :</div>
                  : <div>Substitution :</div>}
               {editable && <div>Nouvelle substitution :</div>}
            </div>
            {bigrams.map(renderFreqSubstBigram)}
         </div>
      );
   };

   self.state = {
      editState: undefined,
      edit: undefined
   };

   self.render = function () {
      const {editPair} = self.state;
      const {scope, state} = self.props;
      const {editable, nBigrams} = state;
      const {inputSubstitution, outputSubstitution, mostFrequentFrench, mostFrequentBigrams} = scope;
      const nConflicts = countSubstitutionConflicts(mostFrequentBigrams, inputSubstitution, outputSubstitution);
      const textBigrams = renderFreqSubstBigrams(mostFrequentBigrams, inputSubstitution, outputSubstitution);
      const frenchBigrams = renderFreqBigrams(mostFrequentFrench.slice(0, nBigrams || 10));
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
               <div className='bigramFrequencyAnalysis grillesSection'>
                  {editable && <p><strong>Nombre de conflits :</strong> {nConflicts}</p>}
                  <strong>Bigrammes les plus fréquents du texte d'entrée :</strong>
                  {textBigrams}
                  <strong>Bigrammes les plus fréquents en français :</strong>
                  {frenchBigrams}
               </div>
            </div>
         </div>
      );
   };

});

const compute = function (state, scope) {
   const {substitutionEdits, nBigrams} = state;
   const {alphabet, inputCipheredText, inputSubstitution} = scope;
   scope.textBigrams = getTextBigrams(inputCipheredText, alphabet);
   scope.mostFrequentBigrams = getMostFrequentBigrams(scope.textBigrams, nBigrams || 10);
   scope.outputSubstitution = applySubstitutionEdits(alphabet, inputSubstitution, substitutionEdits);
};

export default function BigramFrequencyAnalysis () {
   this.Component = Component;
   this.compute = compute;
   this.state = {
      nBigrams: 10
   };
};
