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

   const getEditCell = function (row, col) {
      const {editGrid} = self.props.state;
      if (row >= editGrid.length) {
         return {};
      }
      const editRow = editGrid[row];
      if (col >= editGrid.length) {
         return {};
      }
      return editRow[col];
   };

   const clickGridCell = function (row, col) {
      self.setState({
         selectedRow: row,
         selectedCol: col,
         editCell: getEditCell(row, col)
      });
   };

   const validateDialog = function (editCell) {
      const {state, setToolState} = self.props;
      const {selectedRow, selectedCol} = self.state;
      const {editGrid} = state;
      setToolState({ // XXX
         editGrid: at(selectedRow, at(selectedCol, put(editCell)))(editGrid)
      });
      cancelDialog();
   };

   const cancelDialog = function () {
      self.setState({
         editState: undefined,
         selectedRow: undefined,
         selectedCol: undefined,
         editCell: undefined
      });
   };

   const renderInstructionPython = function () {
      const {state, scope} = self.props;
      const {outputSubstitutionVariable, inputGridVariable} = state;
      const {alphabet, inputGrid} = scope;
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
      const {scope} = self.props;
      const {alphabet, outputGrid} = scope;
      const {selectedRow, selectedCol} = self.state;
      return <Grid alphabet={alphabet} grid={outputGrid} selectedRow={selectedRow} selectedCol={selectedCol} onClick={clickGridCell} />;
   };

   const renderSubstitution = function () {
      const {scope} = self.props;
      const {alphabet, outputSubstitution} = scope;
      return <Substitution alphabet={alphabet} substitution={outputSubstitution}/>;
   };

   const setEditCell = function (editCell) {
      self.setState({editCell});
   };

   const renderEditCell = function () {
      const {alphabet, inputGrid} = self.props.scope;
      const {editCell, selectedRow, selectedCol} = self.state;
      const initialCell = inputGrid[selectedRow][selectedCol];
      return (
         <EditCellDialog
            alphabet={alphabet} initialCell={initialCell} editCell={editCell}
            onOk={validateDialog} onCancel={cancelDialog} onChange={setEditCell} />
      );
   };

   self.state = {
      editState: undefined,
      selectedCol: undefined,
      selectedRow: undefined,
      editCell: undefined
   };

   self.render = function () {
      const {outputGridVariable, outputSubstitutionVariable, inputGridVariable} = self.props.state;
      const inputVars = [
         {label: "Grille playFair", name: inputGridVariable}
      ];
      const outputVars = [
         {label: "Grille éditée", name: outputGridVariable},
         {label: "Substitution générée", name: outputSubstitutionVariable}
      ];
      const {editCell} = self.state;
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

export default function SubstitutionFromGrid () {
   this.Component = Component;
   this.compute = compute;
   this.state = {
      editGrid: [[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}],[{},{},{},{},{}]],
      inputGridVariable: undefined,
      outputGridVariable: undefined,
      outputSubstitutionVariable: undefined
  };
};
