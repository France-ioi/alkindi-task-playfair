
/*

   SubstitutionFromGrid.inputGrid <- Hints.outputGrid
   EditSubstitution.inputCipheredText <- TextInput.output
   EditSubstitution.inputSubstitution <- SubstitutionFromGrid.outputSubstitution
   BigramFrequencyAnalysis.inputCipheredText <- TextInput.output
   BigramFrequencyAnalysis.inputSubstitution <- EditSubstitution.outputSubstitution
   ApplySubstitution.inputText <- TextInput.output
   ApplySubstitution.inputSubstitution <- EditSubstitution.outputSubstitution

*/

import TextInput from './tools/text_input';
import Hints from './tools/hints';
import SubstitutionFromGrid from './tools/substitution_from_grid';
import BigramFrequencyAnalysis from './tools/bigram_frequency_analysis';
import EditSubstitution from './tools/edit_substitution';
import ApplySubstitution from './tools/apply_substitution';

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
