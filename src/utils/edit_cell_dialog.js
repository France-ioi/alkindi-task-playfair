import React from 'react';
import classnames from 'classnames';
import EpicComponent from 'epic-component';
import {OkCancel} from 'alkindi-task-lib/ui';

import {getCellLetter} from './cell';

export default EpicComponent(self => {

   /* props:
      alphabet, initialCell, editCell, onOk, onCancel, onChange
   */

   const keyDown = function (event) {
      if (event.keyCode === 13)
         validateDialog();
      if (event.keyCode === 27)
         return self.props.onCancel();
   };

   const changeLetter = function (event) {
      const {editCell, onChange} = self.props;
      const letter = event.target.value.toUpperCase();
      onChange({...editCell, letter});
   };

   const toggleLock = function () {
      const {editCell, onChange} = self.props;
      const locked = !editCell.locked;
      onChange({...editCell, locked});
   };

   const validateDialog = function () {
      const {alphabet, editCell, onOk} = self.props;
      const letter = editCell.letter || '';
      let edit;
      if (letter === '') {
         edit = {};
      } else {
         const rank = alphabet.ranks[letter];
         if (rank === undefined) {
            alert(letter + " n'est pas une valeur possible de la grille");
            return;
         }
         edit = {...editCell, letter: letter};
      }
      onOk(edit);
   };

   let inputElement;
   const refInput = function (el) {
      inputElement = el;
   };

   const setFocus = function () {
      if (inputElement) {
         inputElement.focus();
         inputElement.setSelectionRange(0, 1);
      }
   };

   self.componentDidMount = function () {
      // When the component mounts, select the input box.
      setFocus();
   };

   self.componentDidUpdate = function (prevProps, _prevState) {
      // Focus the input box when the editCell changes.
      if (prevProps.editCell !== self.props.editCell)
         setFocus();
   };

   self.render = function () {
      const {alphabet, editCell, initialCell, onCancel} = self.props;
      if (initialCell.q === 'confirmed' || initialCell.q === 'hint') {
         return (
            <div className='dialog'>
               Le contenu de cette case est déjà confirmé.
            </div>
         );
      }
      const {letter, locked} = editCell;
      const buttonClasses = ['btn-toggle', locked && "locked"];
      const iconClasses = ['fa', locked ? "fa-toggle-on" : "fa-toggle-off"];
      return (
         <div className='dialog'>
            <div className='dialogLine'>
                  <span className='dialogLabel'>Valeur d'origine :</span>
                  <span>{getCellLetter(alphabet, initialCell)}</span>
            </div>
            <div className='dialogLine'>
                  <span className='dialogLabel'>Nouvelle valeur :</span>
                  <span className='dialogLetterSubst'>
                     <input ref={refInput} type='text' maxLength='1' value={letter || ''} onKeyDown={keyDown} onChange={changeLetter} />
                  </span>
            </div>
            <div className='dialogLine'>
                  <span className='dialogLabel'>{'\u00a0'}</span>
                  <span className='dialogLock'>
                     <span className='substitutionLock'>
                        {locked ? <i className='fa fa-lock'/> : '\u00a0'}
                     </span>
                  </span>
            </div>
            <div className='dialogLine'>
                  <span className='dialogLabel'>Bloquer / débloquer :</span>
                  <span>
                     <button type='button' className={classnames(buttonClasses)} onClick={toggleLock}>
                        <i className={classnames(iconClasses)} />
                     </button>
                  </span>
            </div>
            <OkCancel onOk={validateDialog} onCancel={onCancel}/>
         </div>
      );
   };

});