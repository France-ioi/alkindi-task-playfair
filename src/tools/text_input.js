
import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import update from 'immutability-helper';

import {Python, Variables} from '../ui';

function TextInputSelector (state) {
   const {outputText} = state.textInput;
   return {text: outputText};
}

class TextInput extends React.PureComponent {
  render() {
    const {outputVariable, text} = this.props;
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
  }
}

function taskInitReducer (state, _action) {
   return update(state, {textInput: {
      $set: {
         inputText: {$set: ""},
         outputText: {$set: ""},
      }
   }});
}

function lateReducer (state) {
   if (state.taskReady) {
      const text = state.taskData.cipherText;
      state = update(state, {textInput: {
        inputText: {$set: text},
        outputText: {$set: text}
      }});
   }
   return state;
}

export default {
  actionReducers: {
    taskInit: taskInitReducer,
  },
  views: {
    TextInput: connect(TextInputSelector)(TextInput)
  },
  lateReducer
};
