import flatten from 'flatten';

export const sideOfStatus = {'left': 0, 'right': 1};

export const makeBigramAlphabet = function (alphabet) {
   const symbols = [];
   const allBigrams = [];
   const bigrams = {};
   alphabet.symbols.forEach(function (c1, i1) {
      alphabet.symbols.forEach(function (c2, i2) {
         const symbol = c1 + c2;
         const rank = symbols.length;
         symbols.push(symbol);
         const bigram = {v: symbol, l: rank, l0: i1, l1: i2};
         allBigrams.push(bigram);
         bigrams[symbol]= bigram;
      });
   });
   const size = symbols.length;
   return {alphabet, size, symbols, bigrams, allBigrams};
};

export const getTextAsBigrams = function (text, bigramAlphabet) {
   var textBigrams = [];
   var letterInfos = [];
   var curBigram = "", curRanks = [];
   var letterRanks = bigramAlphabet.alphabet.ranks;
   var bigramStart = 0;

   function addBigram (bigram, start, end, iBigram) {
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
            const bigram = bigramAlphabet.bigrams[curBigram];
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
      curBigram += letterRanks['X'];
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
