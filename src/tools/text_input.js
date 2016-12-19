import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {Python, Variables} from 'alkindi-task-lib/ui';

export const Component = EpicComponent(self => {

   /*
      props:
         scope:
            alphabet
            text
         state:
            outputVariable
   */

   self.render = function() {
      const {outputVariable} = self.props.state;
      const {text} = self.props.scope;
      const inputVars = [];
      const outputVars = [{label: "Texte chiffré", name: outputVariable}];
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               <span className='code'>
                  <Python.Assign>
                     <Python.Var name={outputVariable}/>
                     <Python.StrLit value={text}/>
                  </Python.Assign>
               </span>
            </div>
            <div className='panel-body'>
               <Variables inputVars={inputVars} outputVars={outputVars} />
               <div className='grillesSection'>
                  <div className='y-scrollBloc'>{text}</div>
               </div>
            </div>
         </div>
      );
   };

});

export const compute = function (state, scope) {
   scope.output = scope.text;
};

export default function TextInput () {
   this.Component = Component;
   this.compute = compute;
   this.state = {
      outputVariable: undefined
   };
};
