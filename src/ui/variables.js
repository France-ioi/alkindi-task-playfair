import React from 'react';

export function Variable(props) {
   const {label, name} = props;
   return (
      <div>
         <span className='variable-label'>{label}{" : "}</span>
         <div className='code variable-name'>{name}</div>
      </div>
   );
}

export function Variables(props) {
   const {inputVars, outputVars} = props;
   return (
      <div className='tool-variables'>
         {inputVars && inputVars.length > 0 &&
          <div className='variable-entree variable-informations'>
            <span>{"Variables d'entrée :"}</span>
            {inputVars.map(function (v, i) {
               return <Variable key={i} label={v.label} name={v.name}/>;
            })}
         </div>}
         {outputVars && outputVars.length > 0 &&
          <div className='variable-sortie variable-informations'>
            <span>{"Variables de sortie :"}</span>
            {outputVars.map(function (v, i) {
               return <Variable key={i} label={v.label} name={v.name}/>;
            })}
         </div>}
      </div>
   );
}

export default Variables;
