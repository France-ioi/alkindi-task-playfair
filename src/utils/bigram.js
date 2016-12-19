import flatten from 'flatten';

export const mostFrequentFrench = [
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

export const sideOfStatus = {'left': 0, 'right': 1};

export const makeAlphabet = function (chars) {
   const indivSymbols = chars.split('');
   const symbols = flatten(indivSymbols.map(c1 => indivSymbols.map(c2 => c1 + c2)));
   const size = symbols.length;
   var ranks = {};
   for (var iSymbol = 0; iSymbol < size; iSymbol++) {
      ranks[symbols[iSymbol]] = iSymbol;
   }
   return {symbols, size, ranks};
};

export const decodeBigram = function (alphabet, bigram) {
   const {v} = bigram;
   return {...bigram,
      l0: alphabet.ranks[v.charAt(0)],
      l1: alphabet.ranks[v.charAt(1)]
   };
};

export const getAllBigrams = function (alphabet) {
   const bigrams = [];
   for (let l1 = 0; l1 < alphabet.size; l1++) {
      for (let l2 = 0; l2 < alphabet.size; l2++) {
         if (l1 !== l2) {
            bigrams.push({
               v: alphabet.symbols[l1] + alphabet.symbols[l2],
               l0: l1,
               l1: l2
            });
         }
      }
   }
   return bigrams;
};

export const getTextAsBigrams = function (text, alphabet) {
   var textBigrams = [];
   var letterInfos = [];
   var curBigram = "", curRanks = [];
   var letterRanks = alphabet.ranks;
   var bigramStart = 0;

   function addBigram(bigram, start, end, iBigram) {
      textBigrams.push(bigram);
      for (var iLetter = start; iLetter < end; iLetter++) {
         letterInfos[iLetter].bigram = bigram;
         letterInfos[iLetter].iBigram = iBigram;
      }
   }

   var iLetter = 0;
   var iBigram = 0;
   while (iLetter < text.length) {
      const letter = text.charAt(iLetter);
      letterInfos.push({letter: letter});
      let status;
      const rank = letterRanks[letter];
      if (rank !== undefined) {
         curRanks[curBigram.length] = rank;
         curBigram += letter;
         if (curBigram.length == 2) {
            const bigram = {v: curBigram, l0: curRanks[0], l1: curRanks[1]};
            addBigram(bigram, bigramStart, iLetter + 1, iBigram);
            iBigram++;
            curBigram = "";
            status = "right";
         } else {
            status = "left";
            bigramStart = iLetter;
         }
      } else if (curBigram.length === 0) {
         status = "outside";
      } else {
         status = "inside";
      }
      letterInfos[iLetter].status = status;
      iLetter++;
   }
   if (curBigram.length === 1) {
      curBigram += letterRanks.X;
      addBigram(curBigram, bigramStart, iLetter + 1, iBigram);
   }
   return {
      bigrams: textBigrams,
      letterInfos: letterInfos
   };
};

export const getTextBigrams = function (text, alphabet) {
   var infos = getTextAsBigrams(text, alphabet);
   return infos.bigrams;
};

export const getMostFrequentBigrams = function (textBigrams, nBigrams) {
   const bigramMap = {};
   for (var iBigram = 0; iBigram < textBigrams.length; iBigram++) {
      const bigram = textBigrams[iBigram];
      const {v} = bigram;
      if (bigramMap[v] === undefined) {
         bigramMap[v] = {...bigram, count: 0};
      }
      bigramMap[v].count += 1;
   }
   const bigramList = Object.keys(bigramMap).map(v => bigramMap[v]);
   bigramList.sort(function(b1, b2) {
      if (b1.count > b2.count) {
         return -1;
      }
      if (b1.count < b2.count) {
         return 1;
      }
      return 0;
   });
   bigramList.length = nBigrams;
   bigramList.map(function (bigram) {
      bigram.p = bigram.count / textBigrams.length;
      bigram.r = (bigram.p * 100).toFixed(1);
   });
   return bigramList;
};

export const bigramsFromCells = function (cells, cellAlphabet) {
   const bigrams = [];
   let first = true;
   let c0;
   cells.forEach(function (c1) {
      if (first) {
         c0 = c1;
      } else {
         const l = c0.l * cellAlphabet.size + c1.l;
         const v = cellAlphabet.symbols[c0.l] + cellAlphabet.symbols[c1.l];
         bigrams.push({l, v, c0, c1});
      }
      first = !first;
   });
   return bigrams;
};
