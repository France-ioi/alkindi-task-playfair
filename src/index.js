
import algoreaReactTask from './algorea_react_task';
import update from 'immutability-helper';

import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'rc-tooltip/assets/bootstrap.css';
import './platform.css';
import './style.css';

import {makeAlphabet} from './utils/cell';
import {makeBigramAlphabet} from './utils/bigram';
import WorkspaceBundle from './workspace_bundle';

const TaskBundle = {
   actionReducers: {
      appInit: appInitReducer,
      taskInit: taskInitReducer,
      taskRefresh: taskRefreshReducer,
      taskAnswerLoaded: taskAnswerLoaded,
      taskStateLoaded: taskStateLoaded,
   },
   includes: [
      WorkspaceBundle,
   ],
   selectors: {
     getTaskState,
     getTaskAnswer,
   }
};

export function run (container, options) {
   return algoreaReactTask(container, options, TaskBundle);
}

function appInitReducer (state, _action) {
    const taskMetaData = {
       "id": "http://concours-alkindi.fr/tasks/2016/playfair",
       "language": "fr",
       "version": "fr.01",
       "authors": "Sébastien Carlier",
       "translators": [],
       "license": "",
       "taskPathPrefix": "",
       "modulesPathPrefix": "",
       "browserSupport": [],
       "fullFeedback": true,
       "acceptedAnswers": [],
       "usesRandomSeed": true
    };
    return {...state, taskMetaData};
}

function taskInitReducer (state, _action) {
   const {taskData} = state;
   const alphabet = makeAlphabet(taskData.alphabet);
   const bigramAlphabet = makeBigramAlphabet(alphabet);
   return {
      ...state,
      taskReady: true,
      alphabet,
      bigramAlphabet,
      cipheredText: taskData.cipher_text,
      hintsGrid: taskData.hints,
      mostFrequentFrench: mostFrequentFrench.map(function (p) {
         return {...bigramAlphabet.bigrams[p.v], r: p.r};
      })
   };
}

function taskRefreshReducer (state, _action) {
  // All the work is done in the late reducers.
  return state;
}

function getTaskAnswer (state) {
  return {
    gridEdits: state.substitutionFromGrid.editGrid,
  };
}

function taskAnswerLoaded (state, {payload: {answer}}) {
  return update(state, {
    substitutionFromGrid: {editGrid: {$set: dump.gridEdits}},
    editSubstitution: {substitutionEdits: {$set: {}}},
  });
}

function getTaskState (state) {
  return {
    gridEdits: state.substitutionFromGrid.editGrid,
    substitutionEdits: state.editSubstitution.substitutionEdits,
    // not saved: state.bigramFrequencyAnalysis.substitutionEdits
  };
}

function taskStateLoaded (state, {payload: {dump}}) {
  return update(state, {
    substitutionFromGrid: {editGrid: {$set: dump.gridEdits}},
    editSubstitution: {substitutionEdits: {$set: dump.substitutionEdits}},
  });
}

const mostFrequentFrench = [
   { v: "ES", r: 3.1 },
   { v: "LE", r: 2.2 },
   { v: "DE", r: 2.2 },
   { v: "RE", r: 2.1 },
   { v: "EN", r: 2.1 },
   { v: "ON", r: 1.6 },
   { v: "NT", r: 1.6 },
   { v: "ER", r: 1.5 },
   { v: "TE", r: 1.5 },
   { v: "ET", r: 1.4 },
   { v: "EL", r: 1.4 },
   { v: "AN", r: 1.4 },
   { v: "SE", r: 1.3 },
   { v: "LA", r: 1.3 },
   { v: "AI", r: 1.2 },
   { v: "NE", r: 1.1 },
   { v: "OU", r: 1.1 },
   { v: "QU", r: 1.1 },
   { v: "ME", r: 1.1 },
   { v: "IT", r: 1.1 },
   { v: "IE", r: 1.1 },
   { v: "ED", r: 1.0 },
   { v: "EM", r: 1.0 },
   { v: "UR", r: 1.0 },
   { v: "IS", r: 1.0 },
   { v: "EC", r: 1.0 },
   { v: "UE", r: 0.9 },
   { v: "TI", r: 0.9 },
   { v: "RA", r: 0.9 },
   { v: "IN", r: 0.8 }
];
