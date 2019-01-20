import React from 'react';
import classnames from 'classnames';

import {OkCancel} from '../ui';
import {getCellLetter} from './cell';

export default class EditCellDialog extends React.PureComponent {

   render () {
      const {alphabet, editCell, initialCell, onCancel} = this.props;
      if (initialCell.q === 'confirmed' || initialCell.q === 'hint') {
         return (
            <div className='dialog'>
               {"Le contenu de cette case est déjà confirmé."}
            </div>
         );
      }
      const {letter, locked} = editCell;
      const buttonClasses = ['btn-toggle', locked && "locked"];
      const iconClasses = ['fa', locked ? "fa-toggle-on" : "fa-toggle-off"];
      return (
         <div className='dialog'>
            <div className='dialogLine'>
                  <span className='dialogLabel'>{"Valeur d'origine :"}</span>
                  <span>{getCellLetter(alphabet, initialCell)}</span>
            </div>
            <div className='dialogLine'>
                  <span className='dialogLabel'>{"Nouvelle valeur :"}</span>
                  <span className='dialogLetterSubst'>
                     <input ref={this.refInput} type='text' maxLength='1' value={letter || ''} onKeyDown={this.keyDown} onChange={this.changeLetter} />
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
                  <span className='dialogLabel'>{"Bloquer / débloquer :"}</span>
                  <span>
                     <button type='button' className={classnames(buttonClasses)} onClick={this.toggleLock}>
                        <i className={classnames(iconClasses)} />
                     </button>
                  </span>
            </div>
            <OkCancel onOk={this.validateDialog} onCancel={this.onCancel}/>
         </div>
      );
   };

   keyDown = (event) => {
      if (event.keyCode === 13)
         this.validateDialog();
      if (event.keyCode === 27)
         return this.props.onCancel();
   };

   changeLetter = (event) => {
      const {editCell, onChange} = this.props;
      const letter = event.target.value.toUpperCase();
      onChange({...editCell, letter});
   };

   toggleLock = () => {
      const {editCell, onChange} = this.props;
      const locked = !editCell.locked;
      onChange({...editCell, locked});
   };

   validateDialog = () => {
      const {alphabet, editCell, onOk} = this.props;
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

   inputElement = null;
   refInput = (el) => {
      this.inputElement = el;
   };

   setFocus() {
      if (this.inputElement) {
         this.inputElement.focus();
         this.inputElement.setSelectionRange(0, 1);
      }
   };

   componentDidMount () {
      // When the component mounts, select the input box.
      this.setFocus();
   }

   componentDidUpdate (prevProps, _prevState) {
      // Focus the input box when the editCell changes.
      if (prevProps.editCell !== this.props.editCell) {
         this.setFocus();
      }
   }

}
