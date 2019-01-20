import React from 'react';
import intersperse from 'intersperse';

export function StrLit(props) {
   return <span>'{props.value}'</span>;
}

export function Var(props) {
   return <span className='code-var'>{props.name}</span>;
}

export function Assign(props) {
   const {children} = props;
   return <span>{children[0]}{' = '}{children[1]}</span>;
}

export function Call(props) {
   const args = props.children.filter(arg => arg);
   return (
      <span>
         {props.name}
         {'('}
         {intersperse(args, ', ')}
         {')'}
      </span>
   );
}

export function Grid(props) {
   const {grid, renderCell} = props;
   if (!grid) {
      return <span className="code-error">{"(bad grid)"}</span>;
   }
   let strPython = "[";
   for (let i = 0; i < grid.length; i++) {
      if (i !== 0)
         strPython += ", "
      const row = grid[i];
      strPython += "[";
      for (let j = 0; j < row.length; j++) {
         const cell = row[j];
         if (j != 0) {
            strPython += ", ";
         }
         strPython += renderCell(cell);
      }
      strPython += "]";
   }
   strPython += "];";
   return <span>{strPython}</span>;
}

export default {StrLit, Var, Assign, Call, Grid};
