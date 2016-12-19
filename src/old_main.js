import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
//import {Provider, connect} from 'react-redux';

import {at, put} from '../utils/misc';
import {makeAlphabet} from '../utils/cell';

import {Workspace} from '../workspace';
import * as PlayFair from '.';

// Client state provided by the server.
const alphabet = makeAlphabet('ABCDEFGHIJKLMNOPQRSTUVXYZ')
const cipheredText = "KQ CVG XSVR ACHZ JDSKQ CBAVHM, AKV TKMV QKAONPXTP, OD CSACQ MT ZTAZQ BONP NI MQUGQTN. BSPV QKAIHVACBQZ, PTSC PCDSVCQZTPL ICKLNADVC PVQ MCK TIEUTQQTYV KCQVTQCK MQ OD YLIVTQFZ. QKKQ KC QNSPZC IDVO PV HTCAF PDNMQ ZMGUKQ. NSSC KQ QNSPZCZQN MP CZQPAT FAVT DZCVPT MPASAZT NLYVCVPXLS. NSSC O FNLSUQZMH HQIPTSGB MQ ALISZMPAO I NSSC MQ TJDVQ KT QVD. OTBV O JFVFTMQV DS RSPY CIPQ OT ZHIQZL AG UYN TQ OD TSDHAVDJYLR AS IDITZIO. TSJZZM FT AKMQ MQ EUJCQXMZTZA P'CKA OIO TJAC OTBV KQO VKALBCK, MF KQO IM CQVACC IJ-ICKYLSC, TZ KQC IUMJGQXNPQ A'PVT MPCZQ ADVAQZT. FT FLAT ZQ MSAQ TP NSIPV TIK CQNFZ TFVDA TB IVUBSHGT M PV CAQZYV. CSVUMH OD BNSTQMBVC KSVNIPAT : FTPZCNQVCKCR KCK KQFNQNCK MQ NSQNT HZQPTA DZCT I TJAC PV, G QDJQ ACHZ, FQF TQ IHOQAUSDMH KQO CSPQTY. CDJQTY ST HNLIBAC IB PTDHZQ LPQTVP TQ MQ UVXPA-PCHE TQ NTQNDVTKMR MJV-ZTGC. KQ ZQCSOQNA LPQTVP KCND NSQNT FKQ. OTBV SLTISDKCB QQ HYN, BNTZRBQ KF HNDRA PTDHZQ IV MQYVYLSC TQ K YSPOCNDDVT CPIQNC-ZAVPF-CBAVHM. KQ ZQCSOQNA LPQTVP ALAC TQZQ IJUVKC ONV XTAZQ QST. FQKD ITPZT IVRT EUJCQXCK, KQL ICHN GZQAJQZY CLNZMPA KQ VPZMNL MQ PLR, YCK IPQNCK KQ TSMQ IB TIMQPNYV. \n254292628";
const initialHintsGrid = [
   [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
   [{q:'unknown'}, {l:11, q:'hint'}, {q:'unknown'}, {q:'unknown'}, {l:10, q:'hint'}],
   [{q:'unknown'}, {l:16, q:'hint'}, {q:'unknown'}, {q:'unknown'}, {l: 4, q:'hint'}],
   [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}],
   [{q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}, {q:'unknown'}]
];
const initialTask = {
   score: 500,
   alphabet: alphabet,
   cipher_text: cipheredText,
   hints: initialHintsGrid
};

// Server-side state.
const sampleHints = [
   ['P', 'B', 'U', 'G', 'H'],
   ['O', 'L', 'S', 'Y', 'K'],
   ['T', 'Q', 'C', 'F', 'E'],
   ['A', 'D', 'I', 'J', 'M'],
   ['N', 'R', 'V', 'X', 'Z']
];

// Demo driver.

const getHintGrid = function (alphabet, hints, row, col) {
   var letter = hints[row][col];
   return alphabet.ranks[letter];
};

const getHintAlphabet = function (alphabet, hints, rank) {
   for (var row = 0; row < hints.length; row++) {
      for (var col = 0; col < hints[row].length; col++) {
         const curRank = alphabet.ranks[hints[row][col]];
         if (rank === curRank) {
            return {row: row, col: col};
         }
      }
   }
};

const reduceRevealHint = function (state, row, col, hint, cost) {
   let {task} = state;
   return {
      ...state,
      task: {
         ...task,
         score: task.score - cost,
         hints: at(row, at(col, put(hint)))(task.hints)
      }
   };
};

const reducer = function (state, action) {
   let newState = state;
   switch (action.type) {
      case '@@redux/INIT':
         return {
            task: initialTask
         };
      case 'SET_WORKSPACE':
         return {...state, workspace: {...state.workspace, ...action.workspace}};
      case 'REVEAL_HINT':
         newState = reduceRevealHint(state, action.row, action.col, action.hint, action.cost);
         break;
      default:
         throw action;
   }
   return newState;
};

const selectApp = function (state) {
   const {task, score, workspace} = state;
   return {task, score, workspace};
};

const App = connect(selectApp)(PureComponent(self => {

   const getHint = function (query, callback) {
      setTimeout(function () {
         const cost = getQueryCost(query);
         if (query.type == "grid") {
            const {row, col} = query;
            const hint = {l: getHintGrid(alphabet, sampleHints, row, col), q: 'hint'};
            self.props.dispatch({type: 'REVEAL_HINT', row, col, hint, cost});
            callback(false);
         } else {
            const {rank} = query;
            const {row, col} = getHintAlphabet(alphabet, sampleHints, rank);
            const hint = {l: rank, q: 'hint'};
            self.props.dispatch({type: 'REVEAL_HINT', row, col, hint, cost});
            callback(false);
         }
      }, 1000);
   };

   self.render = function () {
      const {task, workspace} = self.props;
      const taskApi = {...initialTask, getQueryCost, getHint};
      return (<PlayFair.TabContent task={taskApi} workspace={workspace}/>);
   };
}));

const store = createStore(reducer);

// Add the workspace to the store.
const getWorkspace = function () {
   return store.getState().workspace;
};
const setWorkspace = function (workspace) {
   store.dispatch({type: 'SET_WORKSPACE', workspace});
};
const workspace = Workspace(getWorkspace, setWorkspace);
workspace.clear();
PlayFair.setupTools(workspace);

const container = document.getElementById('react-container');
ReactDOM.render(<Provider store={store}><App/></Provider>, container);
