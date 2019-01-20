
import React from 'react';

export default function OkCancel(props) {
   const {onOk, onCancel} = props;
   if (!onCancel) {
      return (
         <div className='text-center'>
            <button type='button' className='btn-tool' onClick={onOk}>OK</button>
         </div>
      );
   }
   return (
      <div className='text-center'>
         <button type='button' className='btn-tool' onClick={onOk}>Valider</button>
         {'   '}
         <button type='button' className='btn-tool' onClick={onCancel}>Annuler</button>
      </div>
   );
}
