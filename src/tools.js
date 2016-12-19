
import TextInput from './tools/text_input';
import Hints from './tools/hints';
import SubstitutionFromGrid from './tools/substitution_from_grid';
import BigramFrequencyAnalysis from './tools/bigram_frequency_analysis';
import EditSubstitution from './tools/edit_substitution';
import ApplySubstitution from './tools/apply_substitution';

import {makeAlphabet} from './utils/cell';
import {makeBigramAlphabet} from './utils/bigram';

const alphabet = makeAlphabet('ABCDEFGHIJKLMNOPQRSTUVXYZ');
const bigramAlphabet = makeBigramAlphabet(alphabet);

export const makeRootScope = function (task) {
   return {
      ...task,
      alphabet,
      bigramAlphabet,
      cipheredText: task.cipher_text,
      hintsGrid: task.hints,
      mostFrequentFrench: mostFrequentFrench.map(function (p) {
         return {...bigramAlphabet.bigrams[p.v], r: p.r};
      })
   };
};

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



// PlayFair default wiring.
export const setupTools = function (addTool) {

   const iTextInput = addTool(TextInput, function (scopes, scope) {
      scope.text = scope.cipheredText;
   }, {
      outputVariable: "texteChiffré"
   });

   const iHints = addTool(Hints, function (scopes, scope) {
   }, {
      outputGridVariable: "lettresGrilleIndices"
   });

   const iSubstitutionFromGrid = addTool(SubstitutionFromGrid, function (scopes, scope) {
      scope.inputGrid = scopes[iHints].outputGrid;
   }, {
      editGrid: [[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}]],
      inputGridVariable: 'lettresGrilleIndices',
      outputGridVariable: 'lettresGrilleEditée',
      outputSubstitutionVariable: 'substitutionGénérée'
   });

   const iEditSubstitution = addTool(EditSubstitution, function (scopes, scope) {
      scope.inputCipheredText = scopes[iTextInput].output;
      scope.inputSubstitution = scopes[iSubstitutionFromGrid].outputSubstitution;
   }, {
      nbLettersPerRow: 29,
      inputCipheredTextVariable: 'texteChiffré',
      inputSubstitutionVariable: 'substitutionGénérée',
      outputSubstitutionVariable: 'substitutionÉditée',
      substitutionEdits: []
   });

   addTool(BigramFrequencyAnalysis, function (scopes, scope) {
      scope.inputCipheredText = scopes[iTextInput].output;
      scope.inputSubstitution = scopes[iEditSubstitution].outputSubstitution;
   }, {
      inputCipheredTextVariable: 'texteChiffré',
      inputSubstitutionVariable: 'substitutionÉditée',
      outputSubstitutionVariable: 'substitutionFréquences',
      substitutionEdits: [],
      editable: false,
      nBigrams: 10
   });

   addTool(ApplySubstitution, function (scopes, scope) {
      scope.inputText = scopes[iTextInput].output;
      scope.inputSubstitution = scopes[iEditSubstitution].outputSubstitution;
   }, {
      nbLettersPerRow: 29,
      inputTextVariable: 'texteChiffré',
      inputSubstitutionVariable: 'substitutionÉditée',
      outputTextVariable: 'texteDéchiffré'
   });

};
