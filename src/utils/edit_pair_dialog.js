import React from 'react';
import classnames from 'classnames';
import {Tooltip, OkCancel} from 'alkindi-task-lib/ui';
import EpicComponent from 'epic-component';

import {getCellLetter, getQualifierClass} from './cell';

export default EpicComponent(self => {

   /* props:
      alphabet, bigram, editPair, substPair, onOk, onCancel, onChange,
      focusSide
   */

   const keyDown = function (event) {
      if (event.keyCode === 13)
         return validateDialog();
      if (event.keyCode === 27)
         return self.props.onCancel();
   };

   const changeLetter = function (event) {
      let {editPair, onChange} = self.props;
      const letter = event.target.value.toUpperCase();
      const side = parseInt(event.target.getAttribute('data-side'));
      editPair = editPair.slice();
      editPair[side] = {...editPair[side], letter: letter};
      onChange(editPair);
   };

   const toggleLock = function (event) {
      let {editPair, onChange} = self.props;
      const side = parseInt(event.currentTarget.getAttribute('data-side'));
      const locked = editPair[side].locked;
      editPair = editPair.slice();
      editPair[side] = {...editPair[side], locked: !locked};
      onChange(editPair);
   };

   const validateDialog = function () {
      const {alphabet, editPair} = self.props;
      const checkedEditPair = [];
      for (let iSide = 0; iSide < 2; iSide++) {
         const {letter} = editPair[iSide];
         if (letter === undefined || letter === '') {
            checkedEditPair[iSide] = false;
         } else if (letter in alphabet.ranks) {
            checkedEditPair[iSide] = editPair[iSide];
         } else {
            alert(letter + " n'est pas une valeur possible de la grille");
            return;
         }
      }
      self.props.onOk(checkedEditPair);
   };

   const renderCell = function (alphabet, cell) {
      const classes = ['bigramLetter', getQualifierClass(cell.q)];
      return <span className={classnames(classes)}>{getCellLetter(alphabet, cell, true)}</span>;
   };

   const renderLock = function (cond) {
      return cond ? <i className='fa fa-lock'></i> : ' ';
   };

   const inputElements = [];
   const refInput = function (el) {
      if (el) {
         const side = parseInt(el.getAttribute('data-side'));
         inputElements[side] = el;
      }
   };

   const setFocus = function () {
      const el = inputElements[self.props.focusSide||0];
      if (el) {
         el.focus();
         el.setSelectionRange(0, 1);
      }
   };

   self.componentDidMount = function () {
      // When the component mounts, select the input box.
      setFocus();
   };

   self.componentDidUpdate = function (prevProps, _prevState) {
      // Focus the input box when the bigram changes.
      // Need to check the letters, we may get a new identical object due to compute.
      if (prevProps.bigram.v !== self.props.bigram.v)
         setFocus();
   };

   const lockUnlockTooltip = (
      <p>Cliquez sur le curseur sous une lettre pour la marquer comme bloquée
         si vous êtes à peu près certain de sa valeur. Vous pourrez la débloquer
         plus tard si vous changez d’avis.
      </p>
   );

   self.render = function () {
      const {alphabet, bigram, editPair, substPair, onCancel} = self.props;
      const buttonLockedClasses = [];
      const btnToggleClasses = [];
      for (var iSide = 0; iSide < 2; iSide++) {
         const locked = editPair[iSide].locked;
         buttonLockedClasses[iSide] = ['btn-toggle', 'lock', locked && "locked"];
         btnToggleClasses[iSide] = ["fa", "fa-toggle-" + (locked ? "on" : "off")];
      }
      return (
         <div className='dialog'>
            <div className='dialogLine'>
               <span className='dialogLabel'>Bigramme édité :</span>
               <span className='dialogBigram bigramCipheredLetter'>
                  <span className='bigramLetter'>
                     {getCellLetter(alphabet, {l: bigram.l0}, true)}
                  </span>
                  <span className='bigramLetter'>
                     {getCellLetter(alphabet, {l: bigram.l1}, true)}
                  </span>
               </span>
            </div>
            <div className='dialogLine'>
               <span className='dialogLabel'>Substitution d'origine :</span>
               <span className='dialogBigram dialogBigramSubstOrig'>
                  {renderCell(alphabet, substPair.dst[0])}
                  {renderCell(alphabet, substPair.dst[1])}
               </span>
            </div>
            <div className='dialogLine'>
               <span className='dialogLabel'>Nouvelle substitution :</span>
               <span className='dialogLetterSubst'>
                  <input type='text' value={editPair[0].letter} maxLength='1' ref={refInput} onKeyDown={keyDown} onChange={changeLetter} data-side='0' />
               </span>
               <span className='dialogLetterSubst'>
                  <input type='text' value={editPair[1].letter} maxLength='1' ref={refInput} onKeyDown={keyDown} onChange={changeLetter} data-side='1' />
               </span>
            </div>
            <div className='dialogLine'>
               <span className='dialogLabel'> </span>
               <span className='substitutionLock'>{renderLock(editPair[0].locked)}</span>
               <span className='substitutionLock'>{renderLock(editPair[1].locked)}</span>
            </div>
            <div className='dialogLine'>
               <span className='dialogLabel'>
                  {'Bloquer / débloquer : '}
                  <Tooltip content={lockUnlockTooltip}/>
               </span>
               <span>
                  <button type='button' className={classnames(buttonLockedClasses[0])} onClick={toggleLock} data-side='0' >
                     <i className={classnames(btnToggleClasses[0])}/>
                  </button>
               </span>
               <span>
                  <button type='button' className={classnames(buttonLockedClasses[1])} onClick={toggleLock} data-side='1' >
                     <i className={classnames(btnToggleClasses[1])}/>
                  </button>
               </span>
            </div>
            <OkCancel onOk={validateDialog} onCancel={onCancel}/>
         </div>
      );
   };

});
