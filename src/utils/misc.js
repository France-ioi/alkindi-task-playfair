
export const at = function (index, func) {
   return function (array) {
      if (array === undefined) {
         const result = [];
         result[index] = func();
         return result;
      } else {
         const result = array.slice();
         result[index] = func(array[index]);
         return result;
      }
   };
};

export const put = function (value) {
   return function (_) {
      return value;
   };
};

export const toMap = function (items) {
  const map = {};
  items.map(item => { map[item.id] = item; });
  return map;
};
