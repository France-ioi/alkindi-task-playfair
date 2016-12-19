import {weakenCell} from './cell';
import {sideOfStatus, getAllBigrams} from './bigram';

export const nullSubstPair = {
   dst: [{q: "unknown"}, {q: "unknown"}]
};

export const identitySubstPair = function (bigram) {
   return {
      src: [
         {l: bigram.l0, q: "confirmed"},
         {l: bigram.l1, q: "confirmed"}
      ],
      dst: [
         {q: "unknown"},
         {q: "unknown"}
      ]
   };
};

export const getBigramSubstPair = function (substitution, bigram) {
   if (!substitution) return;
   const {l0, l1} = bigram;
   const sl0 = substitution[l0];
   if (sl0 !== undefined) {
      const substPair = sl0[l1];
      if (substPair !== undefined)
         return substPair;
   }
};

export const testSubstitutionConflict = function (substitution1, substitution2, bigram, side) {
   var substPair1 = getBigramSubstPair(substitution1, bigram) || nullSubstPair;
   var substPair2 = getBigramSubstPair(substitution2, bigram) || nullSubstPair;
   var q1 = substPair1.dst[side].q;
   var q2 = substPair2.dst[side].q;
   if (q1 === 'unknown' || q2 === 'unknown') {
      return false;
   }
   return substPair1.dst[side].l !== substPair2.dst[side].l;
};

export const countSubstitutionConflicts = function (bigrams, initialSubstitution, newSubstitution) {
   let nbConflicts = 0;
   for (let iBigram = 0; iBigram < bigrams.length; iBigram++) {
      const bigram = bigrams[iBigram];
      for (let side = 0; side < 2; side++) {
         if (testSubstitutionConflict(initialSubstitution, newSubstitution, bigram, side)) {
            nbConflicts++;
         }
      }
   }
   return nbConflicts;
};

export const countAllSubstitutionConflicts = function(initialSubstitution, newSubstitution, alphabet) {
   const bigrams = getAllBigrams(alphabet);
   return countSubstitutionConflicts(bigrams, initialSubstitution, newSubstitution);
};


export const applySubstitutionEdits = function (alphabet, substitution, edits) {

   const editToCell = function (edit) {
      if (!edit)
         return {q: 'unknown'};
      return {l: alphabet.ranks[edit.letter], q: edit.locked ? 'locked' : 'guess'};
   };

   const editedSubstitution = [];
   alphabet.symbols.map(function (c1, l1) {
      alphabet.symbols.map(function (c2, l2) {
         const bigram = c1 + c2;
         if (bigram in edits) {
            const edit = edits[bigram];
            if (!(l1 in editedSubstitution))
               editedSubstitution[l1] = [];
            editedSubstitution[l1][l2] = {
               src: [
                  {l: l1},
                  {l: l2}
               ],
               dst: [
                  editToCell(edit[0]),
                  editToCell(edit[1])
               ]
            };
         }
      });
   });

   const cloneSubstitutionPairOrCreate = function (substitution, rank1, rank2) {
      // TODO: src might be needed in the future
      if ((substitution[rank1] != undefined) && (substitution[rank1][rank2] != undefined)) {
         var substPair = substitution[rank1][rank2];
         return {
            src: [
               {l: substPair.src[0].l, q: substPair.src[0].q},
               {l: substPair.src[1].l, q: substPair.src[1].q}
            ],
            dst: [
               {l: substPair.dst[0].l, q: substPair.dst[0].q},
               {l: substPair.dst[1].l, q: substPair.dst[1].q}
            ]
         };
      }
      else {
         return {
            src: [
               {l: rank1, q: "confirmed"},
               {l: rank2, q: "confirmed"}
            ],
            dst: [
               {q: "unknown"},
               {q:"unknown"}
            ]
         };
      }
   };
   const updateCell = function (inputCell, editedCell, outputCell) {
      if (editedCell.q == 'unknown') {
         outputCell.l = inputCell.l;
         if (inputCell.q == 'locked') {
            outputCell.q = 'confirmed';
         } else {
            outputCell.q = inputCell.q;
         }
      } else {
         outputCell.l = editedCell.l;
         outputCell.q = editedCell.q;
      }
   };

   const inputSubstitution = substitution;
   const outputSubstitution = [];
   for (let l1 = 0; l1 < alphabet.size; l1++) {
      for (let l2 = 0; l2 < alphabet.size; l2++) {
         const inputSubstPair = cloneSubstitutionPairOrCreate(inputSubstitution, l1, l2);
         const editedSubstPair = cloneSubstitutionPairOrCreate(editedSubstitution, l1, l2);
         const outputSubstPair = cloneSubstitutionPairOrCreate(outputSubstitution, l1, l2);
         let updated = false;
         for (let side = 0; side < 2; side++) {
            if ((inputSubstPair.dst[side].q !== "unknown") || (editedSubstPair.dst[side].q !== "unknown")) {
               updated = true;
               updateCell(inputSubstPair.dst[side], editedSubstPair.dst[side], outputSubstPair.dst[side]);
            }
         }
         if (updated) {
            if (outputSubstitution[l1] === undefined) {
               outputSubstitution[l1] = [];
            }
            outputSubstitution[l1][l2] = outputSubstPair;
         }
      }
   }

   return outputSubstitution;
};

export const applySubstitution = function (alphabet, substitution, letterInfos) {
   const outputText = [];
   for (var iLetter = 0; iLetter < letterInfos.length; iLetter++) {
      const letterInfo = letterInfos[iLetter];
      const {status} = letterInfo;
      const side = sideOfStatus[status];
      let cell;
      if (side === undefined) {
         cell = {c: letterInfo.letter};
      } else {
         const bigram = letterInfo.bigram;
         const substPair = getBigramSubstPair(substitution, bigram) || nullSubstPair;
         cell = weakenCell(substPair.dst[side]);
      }
      outputText.push(cell);
   }
   return outputText;
};
