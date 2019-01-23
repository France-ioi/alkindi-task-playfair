
import React from 'react';
import {connect} from 'react-redux';

import TextInputBundle from './tools/text_input';
import HintsBundle from './tools/hints';
import SubstitutionFromGridBundle from './tools/substitution_from_grid';
import EditSubstitutionBundle from './tools/edit_substitution';
import BigramFrequencyAnalysisBundle from './tools/bigram_frequency_analysis';
import ApplySubstitutionBundle from './tools/apply_substitution';

function WorkspaceSelector (state) {
  const {views, actions} = state;
  return {views, actions};
}

class Workspace extends React.PureComponent {
  render () {
    const {views} = this.props;
    return (
      <div>
        <h2>{"Playfair"}</h2>
        <views.TextInput
          outputVariable="texteChiffré" />
        <views.Hints
          outputGridVariable="lettresGrilleIndices" />
        <views.SubstitutionFromGrid
          hintsGridVariable='lettresGrilleIndices'
          outputGridVariable='lettresGrilleEditée'
          outputSubstitutionVariable='substitutionGénérée' />
        <views.EditSubstitution
          nbLettersPerRow={29}
          inputCipheredTextVariable='texteChiffré'
          inputSubstitutionVariable='substitutionGénérée'
          outputSubstitutionVariable='substitutionÉditée' />
        <views.BigramFrequencyAnalysis
          inputCipheredTextVariable='texteChiffré'
          inputSubstitutionVariable='substitutionÉditée'
          outputSubstitutionVariable='substitutionFréquences'
          editable={false}
          nBigrams={10} />
        <views.ApplySubstitution
          nbLettersPerRow={29}
          inputTextVariable='texteChiffré'
          inputSubstitutionVariable='substitutionÉditée'
          outputTextVariable='texteDéchiffré' />
      </div>
    );
  }
}

export default {
  views: {
    Workspace: connect(WorkspaceSelector)(Workspace),
  },
  includes: [
    /* Order is significant for sequencing of late reducers. */
    TextInputBundle,
    HintsBundle,
    SubstitutionFromGridBundle,
    EditSubstitutionBundle,
    BigramFrequencyAnalysisBundle,
    ApplySubstitutionBundle,
  ],
};
