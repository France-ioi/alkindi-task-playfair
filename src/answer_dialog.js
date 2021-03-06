import React from 'react';
import {Alert, Button} from 'react-bootstrap';

class AnswerDialog extends React.PureComponent {

   _refAddress = el => { this._address = el; };
   _refNumber1 = el => { this._number1 = el; };
   _refNumber2 = el => { this._number2 = el; };

   _onSubmit = () => {
      this.props.submit({
         a: this._address.value, n1: this._number1.value, n2: this._number2.value
      });
   };

   componentDidMount () {
      // When the component mounts, select the first input box.
      this._address && this._address.focus();
   };

   render () {
      const {answers, feedback, onSuccess} = this.props;
      return (
         <div className='playfair-answer-dialog'>
            <div className='section'>
               <p>
                  Entrez ci-dessous les trois parties de votre réponse, puis
                  cliquez sur le bouton Soumettre pour connaître le score obtenu.
               </p>
               <p>
                  Vous pouvez soumettre plusieurs réponses. La seule limite est
                  que vous ne pouvez pas soumettre plus de deux fois en moins
                  d'une minute.
               </p>
               <p className="input">
                  <label htmlFor="answer-a">{'Adresse : '}</label>
                  <input type="text" id="answer-a" ref={this._refAddress} />
                  <span>{' (le numéro doit être en chiffres ; par exemple : 125 RUE DE LA PAIX)'}</span>
               </p>
               <p className="input">
                  <label htmlFor="answer-n1">{'Nombre 1 : '}</label>
                  <input type="text" id="answer-n1" ref={this._refNumber1} />
                  <span>{' (il doit contenir 2 chiffres)'}</span>
               </p>
               <p className="input">
                  <label htmlFor="answer-n2">{'Nombre 2 : '}</label>
                  <input type="text" id="answer-n2" ref={this._refNumber2} />
                  <span>{' (il doit contenir 3 chiffres)'}</span>
               </p>
               <p><Button onClick={this._onSubmit}>Soumettre</Button></p>
            </div>
            {feedback && <Feedback feedback={feedback} onSuccess={onSuccess}/>}
            <div className='section'>
               {answers}
            </div>
            <div className='section'>
               <p>
                  Remarque : les différences d'espaces, d'accents, de
                  minuscules/majuscules, de W à la place de V ou vice-versa,
                  et de X en trop ou manquants sont ignorées lors de la
                  comparaison entre l'adresse fournie et celle attendue.
               </p>
               <p>Le score est calculé comme suit :</p>
               <ul>
                  <li>vous partez d'un capital de 500 points ;</li>
                  <li>10 points sont retirés de ce capital pour chaque indice
                      demandé avant votre réponse ;</li>
                  <li>si vous avez à la fois la bonne adresse et les deux nombres,
                     votre score est égal au capital restant ;</li>
                  <li>si vous n'avez que l'adresse, ou bien que les deux nombres,
                      votre score est égal à la moitié du capital restant.</li>
               </ul>
               <p>Autres remarques sur les scores :</p>
               <ul>
                  <li>le score de l'équipe pour un sujet est le meilleur score
                      parmi toutes les soumissions ;</li>
                  <li>obtenir un score non nul à l'entraînement permettra à
                      l'équipe d'accéder aux sujets en temps limité ;</li>
                  <li>le score du tour est le meilleur score obtenu parmi les
                      trois sujets en temps limité</li>
               </ul>
            </div>
         </div>
      );
   };

};

const fullScore = <p>Votre score est la totalité de vos points disponibles.</p>;
const halfScore = <p>Votre score est égal à la moitié de vos points disponibles.</p>;

class Feedback extends React.PureComponent {

   render () {
      const {feedback, onSuccess} = this.props;
      return (
         <div className='playfair-feedback'>
            {feedback.address
             ? (feedback.numbers
                  ? <div>
                        <Alert bsStyle='success'>
                           <p>Félicitations, vos réponses sont correctes !</p>
                           {fullScore}
                        </Alert>
                        <p><strong>
                           Vous avez atteint le score maximum que vous pouvez obtenir à
                           cette épreuve, compte tenu des indices que vous avez obtenus.
                        </strong></p>
                        <p className="text-center">
                           <Button bsStyle="primary" bsSize="large" onClick={onSuccess}>
                              <i className="fa fa-left-arrow"/> retour aux épreuves
                           </Button>
                        </p>
                     </div>
                  : <div>
                        <Alert bsStyle='warning'>
                           <p>L'adresse est la bonne, mais au moins un des deux nombres est faux.</p>
                           {halfScore}
                        </Alert>
                     </div>)
             : (feedback.numbers
                  ? <div>
                        <Alert bsStyle='warning'>
                           <p>Les deux nombres sont les bons, mais l'adresse est fausse.</p>
                           {halfScore}
                        </Alert>
                     </div>
                  : <Alert bsStyle='danger'>Ni l'adresse ni les nombres ne sont les bons.</Alert>)}
         </div>
      );
   }

};

export default AnswerDialog;
