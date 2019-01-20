
import algoreaReactTask from './algorea_react_task';

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
  const {taskData: {alphabet, hints}} = state;
  // TODO: save user state, reload user state with hints
  return {...state};
}

function getTaskAnswer (state) {
  const {taskData: {alphabet}} = state;
  // TODO: serialize user state to answer object
  return {};
}

function taskAnswerLoaded (state, {payload: {answer}}) {
  const {taskData: {alphabet}} = state;
  // TODO: reload user state from answer object
  return state;
}

function getTaskState (state) {
  const {taskData: {alphabet}} = state;
  // TODO: serialize user state (preserve more info than in answer)
  return {};
}

function taskStateLoaded (state, {payload: {dump}}) {
  const {taskData: {alphabet}} = state;
  // TODO: reload user state (restore more info than from answer)
  return state;
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

/*
const cipheredText = "KQ CVG XSVR ACHZ JDSKQ CBAVHM, AKV TKMV QKAONPXTP, OD CSACQ MT ZTAZQ BONP NI MQUGQTN. BSPV QKAIHVACBQZ, PTSC PCDSVCQZTPL ICKLNADVC PVQ MCK TIEUTQQTYV KCQVTQCK MQ OD YLIVTQFZ. QKKQ KC QNSPZC IDVO PV HTCAF PDNMQ ZMGUKQ. NSSC KQ QNSPZCZQN MP CZQPAT FAVT DZCVPT MPASAZT NLYVCVPXLS. NSSC O FNLSUQZMH HQIPTSGB MQ ALISZMPAO I NSSC MQ TJDVQ KT QVD. OTBV O JFVFTMQV DS RSPY CIPQ OT ZHIQZL AG UYN TQ OD TSDHAVDJYLR AS IDITZIO. TSJZZM FT AKMQ MQ EUJCQXMZTZA P'CKA OIO TJAC OTBV KQO VKALBCK, MF KQO IM CQVACC IJ-ICKYLSC, TZ KQC IUMJGQXNPQ A'PVT MPCZQ ADVAQZT. FT FLAT ZQ MSAQ TP NSIPV TIK CQNFZ TFVDA TB IVUBSHGT M PV CAQZYV. CSVUMH OD BNSTQMBVC KSVNIPAT : FTPZCNQVCKCR KCK KQFNQNCK MQ NSQNT HZQPTA DZCT I TJAC PV, G QDJQ ACHZ, FQF TQ IHOQAUSDMH KQO CSPQTY. CDJQTY ST HNLIBAC IB PTDHZQ LPQTVP TQ MQ UVXPA-PCHE TQ NTQNDVTKMR MJV-ZTGC. KQ ZQCSOQNA LPQTVP KCND NSQNT FKQ. OTBV SLTISDKCB QQ HYN, BNTZRBQ KF HNDRA PTDHZQ IV MQYVYLSC TQ K YSPOCNDDVT CPIQNC-ZAVPF-CBAVHM. KQ ZQCSOQNA LPQTVP ALAC TQZQ IJUVKC ONV XTAZQ QST. FQKD ITPZT IVRT EUJCQXCK, KQL ICHN GZQAJQZY CLNZMPA KQ VPZMNL MQ PLR, YCK IPQNCK KQ TSMQ IB TIMQPNYV. \n254292628";
const initialHintsGrid = [
   [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
   [{q:'unknown'}, {l:11, q:'hint'}, {q:'unknown'}, {q:'unknown'}, {l:10, q:'hint'}],
   [{q:'unknown'}, {l:16, q:'hint'}, {q:'unknown'}, {q:'unknown'}, {l: 4, q:'hint'}],
   [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
   [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}]
];
const task = {
   cipher_text: cipheredText,
   hints: initialHintsGrid
};
run({container: document.getElementById('container'), score: 500, task: task, view: 'workspace'});
*/
