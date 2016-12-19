import React from 'react';
import EpicComponent from 'epic-component';
import {Alert, Button} from 'react-bootstrap';

const getQueryCost = function (query) {
   return 50;
};

export const TabHeader = EpicComponent(self => {
   self.render = function () {
      return (
         <div>
            <p>
               Attention, <strong>l'onglet sujet contient des informations essentielles</strong>,
               lisez-le attentivement.
            </p>
            <p>
               {'Voici ci-dessous des outils pour vous aider à déchiffrer le message, '}
               {'leur documentation est '}
               <a href="http://concours-alkindi.fr/docs/tour2-outils.pdf" title="documentation des outils au format .PDF" target="new">
                  {'disponible en téléchargement '}
                  <i className="fa fa-download"/>
               </a>.</p>
            <p>Une fois que vous avez déchiffré le message, entrez votre réponse dans l'onglet Réponses.</p>
         </div>);
   };
});

export const Answer = EpicComponent(self => {

   self.render = function () {
      const {answer} = self.props;
      return (
         <div className='playfair-answer'>
            <span className='playfair-address'>{answer.a}</span>{' • '}
            <span className='playfair-number1'>{answer.n1}</span>{' • '}
            <span className='playfair-number2'>{answer.n2}</span>
         </div>
      );
   };

});
