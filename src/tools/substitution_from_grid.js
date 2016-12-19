import React from 'react';
import EpicComponent from 'epic-component';
import classnames from 'classnames';
import {Python, Variables, Tooltip} from 'alkindi-task-lib/ui';

import {put, at} from '../utils/misc';
import {getCellLetter} from '../utils/cell';
import {applyGridEdit} from '../utils/grid';
import {getSubstitutionFromGridCells} from '../utils/playfair';
import {Grid} from '../utils/grid_view';
import {Substitution} from '../utils/substitution_view';
import EditCellDialog from '../utils/edit_cell_dialog';

const Component = EpicComponent(self => {

   /*
      props:
         state
            editGrid
            inputGridVariable
            outputGridVariable
            outputSubstitutionVariable
         scope
            alphabet
            inputGrid
            outputGrid
            outputSubstitution
   */

   const selectCell = function (row, col) {
      self.props.dispatch({type: 'SelectCell', row, col});
   };

   const setEditCell = function (editCell) {
      self.props.dispatch({type: 'SetEditCell', editCell});
   };

   const validateDialog = function (editCell) {
      const {selectedRow, selectedCol} = self.props.state;
      self.props.dispatch({type: 'ApplyEdit', row: selectedRow, col: selectedCol, editCell});
   };

   const cancelDialog = function () {
      self.props.dispatch({type: 'CancelEdit'});
   };

   const renderInstructionPython = function () {
      const {outputSubstitutionVariable, inputGridVariable} = self.props.state;
      const {alphabet, inputGrid} = self.props.scope;
      const renderCell = function (cell) {
         return "'" + getCellLetter(alphabet, cell) + "'";
      };
      // XXX afficher changeGrid dans le code python
      return (
         <Python.Assign>
            <Python.Var name={outputSubstitutionVariable}/>
            <Python.Call name="substitutionDepuisGrille">
               <Python.Var name={inputGridVariable}/>
               <Python.Grid grid={inputGrid} renderCell={renderCell} />
            </Python.Call>
         </Python.Assign>
      );
   };

   const renderGrid = function() {
      const {alphabet, outputGrid} = self.props.scope;
      const {selectedRow, selectedCol} = self.props.state;
      return <Grid alphabet={alphabet} grid={outputGrid} selectedRow={selectedRow} selectedCol={selectedCol} onClick={selectCell} />;
   };

   const renderSubstitution = function () {
      const {scope} = self.props;
      const {alphabet, outputSubstitution} = scope;
      return <Substitution alphabet={alphabet} substitution={outputSubstitution}/>;
   };

   const renderEditCell = function () {
      const {alphabet, inputGrid} = self.props.scope;
      const {editCell, selectedRow, selectedCol} = self.props.state;
      const initialCell = inputGrid[selectedRow][selectedCol];
      return (
         <EditCellDialog
            alphabet={alphabet} initialCell={initialCell} editCell={editCell}
            onOk={validateDialog} onCancel={cancelDialog} onChange={setEditCell} />
      );
   };

   self.state = {
      selectedCol: undefined,
      selectedRow: undefined,
      editCell: undefined
   };

   self.render = function () {
      const {outputGridVariable, outputSubstitutionVariable, inputGridVariable, editCell} = self.props.state;
      const inputVars = [
         {label: "Grille playFair", name: inputGridVariable}
      ];
      const outputVars = [
         {label: "Grille éditée", name: outputGridVariable},
         {label: "Substitution générée", name: outputSubstitutionVariable}
      ];
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'><span className='code'>
               {renderInstructionPython()}
            </span></div>
            <div className='panel-body'>
               {editCell && renderEditCell()}
               <Variables inputVars={inputVars} outputVars={outputVars} />
               <div className='grillesSection'>
                  <div className='blocGrille'>
                     <p>
                        {'Grille éditée : '}
                        <Tooltip content={<p>Cliquez sur une case pour proposer ou modifier la lettre que vous pensez qu’elle contient.</p>}/>
                     </p>
                     {renderGrid()}
                  </div>
                  <div className='blocGrille'>
                     <p>
                        {'Substitution de bigrammes générée : '}
                        <Tooltip content={<p>Sont affichées ci-dessous toutes les correspondances bigramme chiffré → bigramme déchiffré qui sont déduites de la grille.</p>}/>
                     </p>
                     {renderSubstitution()}
                  </div>
               </div>
            </div>
         </div>
      );
   };

});

const compute = function (state, scope) {
   const {editGrid} = state;
   const {alphabet, inputGrid} = scope;
   scope.outputGrid = applyGridEdit(alphabet, inputGrid, editGrid);
   scope.outputSubstitution = getSubstitutionFromGridCells(scope.outputGrid);
};

const noSelection = {
   selectedRow: undefined,
   selectedCol: undefined,
   editCell: undefined
};

const initialState = {
   editGrid: [[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}]],
   inputGridVariable: undefined,
   outputGridVariable: undefined,
   outputSubstitutionVariable: undefined,
   ...noSelection
};

const getEditCell = function (editGrid, row, col) {
   if (row >= editGrid.length) {
      return {};
   }
   const editRow = editGrid[row];
   if (col >= editGrid.length) {
      return {};
   }
   return editRow[col];
};

export default function SubstitutionFromGrid () {
   this.Component = Component;
   this.compute = compute;
   this.state = initialState;
   this.dump = function (state) {
      const {editGrid, inputGridVariable, outputGridVariable,
         outputSubstitutionVariable} = state;
      return {editGrid, inputGridVariable, outputGridVariable,
         outputSubstitutionVariable};
   };
   this.load = function (dump) {
      return {...initialState, ...dump};
   };
   this.reducers.SelectCell = function (state, action) {
      const {row, col} = action;
      const {editGrid} = state;
      return {
         ...state,
         selectedRow: row,
         selectedCol: col,
         editCell: getEditCell(editGrid, row, col)
      };
   };
   this.reducers.SetEditCell = function (state, action) {
      const {editCell} = action;
      return {...state, editCell};
   };
   this.reducers.ApplyEdit = function (state, action) {
      const {editGrid} = state;
      const {row, col, editCell} = action;
      return {
         ...state,
         editGrid: at(row, at(col, put(editCell)))(editGrid),
         ...noSelection
      };
   };
   this.reducers.CancelEdit = function (state, action) {
      return {...state, ...noSelection};
   };
};
