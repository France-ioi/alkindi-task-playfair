import React from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import update from 'immutability-helper';

import {Python, Variables, Tooltip} from '../ui';
import {put, at} from '../utils/misc';
import {getCellLetter} from '../utils/cell';
import {applyGridEdit} from '../utils/grid';
import {getSubstitutionFromGridCells} from '../utils/playfair';
import {Grid} from '../utils/grid_view';
import {Substitution} from '../utils/substitution_view';
import EditCellDialog from '../utils/edit_cell_dialog';

function SubstitutionFromGridSelector (state) {
   const {actions, alphabet, hintsGrid} = state;
   const {selectedRow, selectedCol, editCell, editGrid, outputGrid, outputSubstitution} = state.substitutionFromGrid;
   return {actions, alphabet, selectedRow, selectedCol, editCell,
      hintsGrid, editGrid, outputGrid, outputSubstitution};
}

class SubstitutionFromGrid extends React.PureComponent {

   /*
      props:
         hintsGridVariable
         outputGridVariable
         outputSubstitutionVariable
         alphabet
         hintsGrid
         editGrid
         outputGrid
         outputSubstitution
         selectedRow
         selectedCol
   */

   render () {
      const {outputGridVariable, outputSubstitutionVariable, hintsGridVariable, editCell} = this.props;
      const inputVars = [
         {label: "Grille indices", name: hintsGridVariable}
      ];
      const outputVars = [
         {label: "Grille éditée", name: outputGridVariable},
         {label: "Substitution générée", name: outputSubstitutionVariable}
      ];
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'><span className='code'>
               {this.renderInstructionPython()}
            </span></div>
            <div className='panel-body'>
               {editCell && this.renderEditCell()}
               <Variables inputVars={inputVars} outputVars={outputVars} />
               <div className='grillesSection'>
                  <div className='blocGrille'>
                     <p>
                        {'Grille éditée : '}
                        <Tooltip content={<p>{"Cliquez sur une case pour proposer ou modifier la lettre que vous pensez qu’elle contient."}</p>}/>
                     </p>
                     {this.renderGrid()}
                  </div>
                  <div className='blocGrille'>
                     <p>
                        {'Substitution de bigrammes générée : '}
                        <Tooltip content={<p>{"Sont affichées ci-dessous toutes les correspondances bigramme chiffré → bigramme déchiffré qui sont déduites de la grille."}</p>}/>
                     </p>
                     {this.renderSubstitution()}
                  </div>
               </div>
            </div>
         </div>
      );
   }

   selectCell = (row, col) => {
      this.props.dispatch({type: this.props.actions.substitutionFromGridSelectCell, payload: {row, col}});
   };

   setEditCell = (editCell) => {
      this.props.dispatch({type: this.props.actions.substitutionFromGridSetEditCell, payload: {editCell}});
   };

   validateDialog = (editCell) => {
      const {selectedRow, selectedCol} = this.props;
      this.props.dispatch({type: this.props.actions.substitutionFromGridApplyEdit, payload: {row: selectedRow, col: selectedCol, editCell}});
   };

   cancelDialog = () => {
      this.props.dispatch({type: this.props.actions.substitutionFromGridCancelEdit});
   };

   renderInstructionPython() {
      const {alphabet, editGrid, outputSubstitutionVariable, hintsGridVariable} = this.props;
      function renderCell(cell) {
         return "'" + getCellLetter(alphabet, cell) + "'";
      }
      return (
         <Python.Assign>
            <Python.Var name={outputSubstitutionVariable}/>
            <Python.Call name="substitutionDepuisGrille">
               <Python.Var name={hintsGridVariable}/>
               <Python.Grid grid={editGrid} renderCell={renderCell} />
            </Python.Call>
         </Python.Assign>
      );
   }

   renderGrid() {
      const {alphabet, outputGrid, selectedRow, selectedCol} = this.props;
      return <Grid alphabet={alphabet} grid={outputGrid} selectedRow={selectedRow} selectedCol={selectedCol} onClick={this.selectCell} />;
   }

   renderSubstitution() {
      const {alphabet, outputSubstitution} = this.props;
      return <Substitution alphabet={alphabet} substitution={outputSubstitution}/>;
   }

   renderEditCell() {
      const {alphabet, hintsGrid, editCell, selectedRow, selectedCol} = this.props;
      const initialCell = hintsGrid[selectedRow][selectedCol];
      return (
         <EditCellDialog
            alphabet={alphabet} initialCell={initialCell} editCell={editCell}
            onOk={this.validateDialog} onCancel={this.cancelDialog} onChange={this.setEditCell} />
      );
   }

}

const noSelection = {
   selectedRow: undefined,
   selectedCol: undefined,
   editCell: undefined
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

function taskInitReducer (state, _action) {
   const {taskData} = state;
   const u = {q: 'unknown'};
   const row = [u,u,u,u,u];
   return update(state, {substitutionFromGrid: {
      $set: {
         ...noSelection,
         editGrid: [row,row,row,row,row],
      }
   }});
}

function selectCellReducer (state, action) {
   const {row, col} = action.payload;
   const {editGrid} = state.substitutionFromGrid;
   return update(state, {substitutionFromGrid: {
      selectedRow: {$set: row},
      selectedCol: {$set: col},
      editCell: {$set: getEditCell(editGrid, row, col)}
   }});
}

function setEditCellReducer (state, action) {
   const {editCell} = action.payload;
   return update(state, {substitutionFromGrid: {
      editCell: {$set: editCell}
   }});
}

function applyEditReducer (state, action) {
   const {editGrid} = state;
   const {row, col, editCell} = action.payload;
   return update(state, {substitutionFromGrid: {
      editGrid: {[row]: {[col]: {$set: editCell}}}
   }});
}

function cancelEditReducer (state, action) {
   return update(state, {substitutionFromGrid: {
      selectedRow: {$set: undefined},
      selectedCol: {$set: undefined},
      editCell: {$set: undefined},
   }});
}

function lateReducer (state) {
   if (state.taskReady) {
      const {alphabet, hintsGrid, substitutionFromGrid: {editGrid}} = state;
      const outputGrid = applyGridEdit(alphabet, hintsGrid, editGrid);
      const outputSubstitution = getSubstitutionFromGridCells(outputGrid);
      state = update(state, {substitutionFromGrid: {
         outputGrid: {$set: outputGrid},
         outputSubstitution: {$set: outputSubstitution},
      }});
   }
   return state;
}

export default {
   actions: {
      substitutionFromGridSelectCell: 'Task.SubstitutionFromGrid.SelectCell',
      substitutionFromGridSetEditCell: 'Task.SubstitutionFromGrid.SetEditCell',
      substitutionFromGridApplyEdit: 'Task.SubstitutionFromGrid.ApplyEdit',
      substitutionFromGridCancelEdit: 'Task.SubstitutionFromGrid.CancelEdit',
   },
   actionReducers: {
      taskInit: taskInitReducer,
      substitutionFromGridSelectCell: selectCellReducer,
      substitutionFromGridSetEditCell: setEditCellReducer,
      substitutionFromGridApplyEdit: applyEditReducer,
      substitutionFromGridCancelEdit: cancelEditReducer,
   },
   views: {
      SubstitutionFromGrid: connect(SubstitutionFromGridSelector)(SubstitutionFromGrid)
   },
   lateReducer
};
