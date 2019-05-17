import React from "react";
import {connect} from "react-redux";

import {Python, Variables, Tooltip, OkCancel} from "../ui";
import {getCellLetter} from "../utils/cell";
import {getLetterQualifiersFromGrid} from "../utils/grid";
import {Alphabet} from "../utils/alphabet_view";
import {Grid} from "../utils/grid_view";

function HintsSelector (state) {
  const {
    actions,
    alphabet,
    taskData: {hints: hintsGrid, score},
    hintRequest
  } = state;
  return {actions, alphabet, hintsGrid, score, hintRequest};
}

class Hints extends React.PureComponent {
  render () {
    const {outputGridVariable, score, hintRequest} = this.props;
    const outputVars = [
      {label: "Grille enregistrée", name: outputGridVariable}
    ];
    return (
      <div className="panel panel-default hintsPlayFair">
        <div className="panel-heading">
          <span className="code">{this.renderInstructionPython()}</span>
        </div>
        <div className="panel-body">
          {this.renderHintQuery()}
          <Variables outputVars={outputVars} />
          <div className="grillesSection">
            <p className="title">{"Deux types d'indices sont disponibles :"}</p>
            <div className="blocGrille">
              <p>
                {"Révéler une case : "}
                {getQueryCost({type: "grid"})}
                {" points "}
                <Tooltip
                  content={
                    <p>
                      {
                        "Cliquez sur une case de la grille pour demander quelle lettre elle contient."
                      }
                    </p>
                  }
                />
              </p>
              {this.renderGrid()}
            </div>
            <div className="blocGrille">
              <p>
                {"Révéler la position d'une lettre : "}
                {getQueryCost({type: "alphabet"})}
                {" points "}
                <Tooltip
                  content={
                    <p>
                      {
                        "Cliquer sur une lettre non grisée ci-dessous pour demander sa position au sein de la grille."
                      }
                    </p>
                  }
                />
              </p>
              {this.renderAlphabet()}
            </div>
          </div>
          <div className="playfair-score">
            <span>
              <strong>{"Points disponibles :"}</strong>
              {" " + score + " points "}
              <Tooltip
                content={
                  <p>
                    {
                      "Score que votre équipe obtiendra si vous résolvez le sujet sans demander d’autres indices. Il diminue à chaque fois qu’un membre de l’équipe demande un indice."
                    }
                  </p>
                }
              />
            </span>
          </div>
        </div>
      </div>
    );
  }

  state = {hintQuery: undefined};

  validateDialog = () => {
    const {hintQuery} = this.state;
    this.setState({hintQuery: undefined});
    this.props.dispatch({
      type: this.props.actions.requestHint,
      payload: {request: hintQuery}
    });
  };

  cancelDialog = () => {
    this.setState({hintQuery: undefined});
    this.props.dispatch({type: this.props.actions.hintRequestFeedbackCleared});
  };

  hintAlreadyObtained () {
    this.setState({hintQuery: undefined});
  }

  setQuery (query) {
    this.setState({hintQuery: query});
  }

  renderInstructionPython () {
    const {alphabet, hintsGrid, outputGridVariable} = this.props;
    return (
      <Python.Assign>
        <Python.Var name={outputGridVariable} />
        <Python.Grid grid={hintsGrid} renderCell={this.renderCell} />
      </Python.Assign>
    );
  }

  renderCell = cell => {
    return "'" + getCellLetter(this.props.alphabet, cell) + "'";
  };

  renderGrid () {
    const {alphabet, hintsGrid} = this.props;
    const {hintQuery} = this.state;
    let selectedRow;
    let selectedCol;
    if (hintQuery !== undefined && hintQuery.type === "grid") {
      selectedRow = hintQuery.row;
      selectedCol = hintQuery.col;
    }
    return (
      <Grid
        alphabet={alphabet}
        grid={hintsGrid}
        selectedRow={selectedRow}
        selectedCol={selectedCol}
        onClick={this.clickGridCell}
      />
    );
  }

  renderAlphabet () {
    const {alphabet, hintsGrid} = this.props;
    const {hintQuery} = this.state;
    let selectedLetterRank;
    if (hintQuery !== undefined && hintQuery.type === "alphabet") {
      selectedLetterRank = hintQuery.rank;
    }
    const qualifiers = getLetterQualifiersFromGrid(hintsGrid, alphabet);
    return (
      <Alphabet
        alphabet={alphabet}
        qualifiers={qualifiers}
        onClick={this.clickGridAlphabet}
        selectedLetterRank={selectedLetterRank}
      />
    );
  }

  renderHintQuery () {
    const {hintRequest} = this.props;
    const {hintQuery} = this.state;
    if (!hintRequest && hintQuery) {
      const {alphabet, score} = this.props;
      const {hintQuery} = this.state;
      const cost = getQueryCost(hintQuery);
      return (
        <div className="dialog">
          <div className="dialogLine">
            <strong>{"Indice demandé :"}</strong>{" "}
            {hintQuery.type === "grid" ? (
              <span>
                {"lettre à la ligne "}
                <span className="dialogIndice">{hintQuery.row + 1}</span>
                {", colonne "}
                <span className="dialogIndice">{hintQuery.col + 1}</span>
                {" de la grille."}
              </span>
            ) : (
              <span>
                {"position de la lettre "}
                <span className="dialogIndice">
                  {alphabet.symbols[hintQuery.rank]}
                </span>
                {" dans la grille"}
              </span>
            )}
          </div>
          <div className="dialogLine">
            <strong>{"Coût :"}</strong> {cost}
            {" points"}
          </div>
          <div className="dialogLine">
            <strong>{"Score disponible :"}</strong> {score}
            {" points"}
          </div>
          <div className="dialogLine">
            {"L’indice obtenu sera visible par toute l’équipe."}
          </div>
          <OkCancel onOk={this.validateDialog} onCancel={this.cancelDialog} />
        </div>
      );
    } else if (hintRequest && hintRequest.code <= 50) {
      return <div className="dialog">{"En attente de réponse du serveur"}</div>;
    } else if (hintRequest && hintRequest.success === true) {
      return (
        <div className="dialog">
          {"Indice obtenu, grille mise à jour"}
          <button
            type="button"
            className="btn-tool"
            onClick={this.cancelDialog}
          >
            {"OK"}
          </button>
        </div>
      );
    } else if (hintRequest && hintRequest.success === false) {
      return (
        <div className="dialog">
          {"Une erreur s'est produite et l'indice n'a pas été obtenu."}
          <button
            type="button"
            className="btn-tool"
            onClick={this.cancelDialog}
          >
            {"OK"}
          </button>
        </div>
      );
    } else if (hintRequest && hintRequest.error) {
      return <div className="dialog">{hintRequest.error}</div>;
    }
    return false;
  }

  clickGridCell = (row, col) => {
    if (this.state.hintState === "waiting") {
      return;
    }
    if (this.props.hintsGrid[row][col].q === "hint") {
      this.hintAlreadyObtained();
    } else {
      this.setQuery({type: "grid", row: row, col: col});
    }
  };

  clickGridAlphabet = rank => {
    if (this.state.hintState === "waiting") {
      return;
    }
    const {alphabet, hintsGrid} = this.props;
    const qualifiers = getLetterQualifiersFromGrid(hintsGrid, alphabet);
    if (qualifiers[rank] === "hint") {
      this.hintAlreadyObtained();
    } else {
      this.setQuery({type: "alphabet", rank: rank});
    }
  };
}

function getQueryCost (query) {
  if (query.type === "grid") return 10;
  if (query.type === "alphabet") return 10;
  return 0;
}

export default {
  views: {
    Hints: connect(HintsSelector)(Hints)
  }
};
