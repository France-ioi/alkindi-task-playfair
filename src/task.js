import React from 'react';

export class Task extends React.PureComponent {

   render () {
      const {task} = this.props;
      const lines = task.cipher_text.match(/.{1,40}/g);
      return (
         <div className="playfair-task">
            <div className="playfair-annonces">
               <p className="playfair-title">Annonces :</p>
               <ul>
                  <li>Le concours est prolongé jusqu'au samedi 23 janvier à 20h</li>
               </ul>
            </div>
            <p>
               {"Votre amie Alice a récupéré une pochette contenant un message chiffré (allez lire la" }
               <a href="http://concours-alkindi.fr/#/pageBD" title="bande dessinée d'introduction du concours" target="new">
                  {" bande dessinée de son aventure"}
               </a>
               {" quand vous avez un peu de temps). "}
               {"Voici le texte du message :"}
            </p>
            <div className="y-scrollBloc playfair-text" style={{width:'480px',margin:'0 auto 15px'}}>
               {lines.map((line, i) => <div key={i} className="playfair-line">{line}</div>)}
            </div>
            <p>{"Votre but est de l’aider à déchiffrer ce texte. Vous devez y trouver une adresse et deux nombres à calculer pour accéder à un coffre."}</p>
            <p>{"Alice a remarqué plusieurs éléments qui vont vous aider :"}</p>
            <p><strong>{"Prénom :"}</strong>{" sur la pochette se trouve le prénom du destinataire du message : <strong>${firstname}</strong>. Notez que ce prénom n’est probablement pas présent dans le message, mais pourra vous être utile."}</p>
            <p><strong>{"Type de chiffrement :"}</strong>{" il s’agit du chiffrement appelé Playfair, qui est décrit plus bas."}</p>
            <p><strong>{"Outils :"}</strong>{" dans l’onglet “cryptanalyse” accessible en haut de votre interface, vous disposez d’outils pour vous aider à déchiffrer le message (voir lien vers la documentation en haut de cette page)."}</p>
            <p><strong>{"Indices :"}</strong>{" le deuxième de ces outils permet d’obtenir des indices. Chaque indice retire 10 points au score que vous obtiendrez après avoir résolu le sujet. Initialement vous avez un capital de 500 points. Il est difficile de réussir sans indices, donc n’hésitez pas à en demander quelques-uns en les choisissant bien. Assurez-vous cependant que votre équipe est d’accord sur votre stratégie avant de demander des indices."}</p>
            <p><strong>{"Entraînement et tentatives :"}</strong>{" au départ vous avez un sujet d’entraînement à résoudre sans limite de temps. Le score obtenu sur ce sujet ne compte pas (c’est seulement pour vous donner une indication). Une fois résolu, vous aurez 3 tentatives pour résoudre en 1 heure à chaque fois un sujet avec un message un peu différent, chiffré selon le même principe, mais une clé différente (la grille Playfair) et bien sûr une adresse et des nombres à trouver différents. À chaque tentative, vous repartez d’une grille presque vide et d’un capital de 500 points."}</p>
            <p><strong>{"La méthode de chiffrement de Playfair :"}</strong>{" voici quelques explications sur les points importants de la méthode qui a été utilisée pour chiffrer le message."}</p>
            <ol className="clearfix">
               <li><p>{"Le message a été converti en majuscules et les accents retirés, alors que les espaces et les signes de ponctuation sont laissés tels quels."}</p></li>
               <li><p>{"Tous les W du message ont été remplacés par des V."}</p></li>
               <li>
                  <p>{"Le texte a ensuite été découpé en paires de lettres successives, appelées <strong>bigrammes</strong>. Ainsi le texte “MON TEXTE” est découpé en 4 bigrammes, “MO”, “NT, “EX”, “TE”."}</p>
                  <p>{"Pour éviter des bigrammes consitués de deux fois la même lettre, des X sont insérés dans le texte entre certaines lettres doubles. Ainsi, le texte “BELLE” devient “BE”, “LX”, “LE”. Par contre le texte “ELLE” devient “EL” “LE” car les deux L ne tombent pas dans le même bigramme donc il n’est pas utile d’insérer un X.."}</p>
               </li>
               <li>
                  <p>{"Une grille de 5x5 cases a été remplie avec les lettres de l’alphabet sauf le W. Dans notre cas, considérez que les lettres ont été placées au hasard."}</p>
               </li>
               <li>
                  <p>{"Chaque bigramme du texte est remplacé par un bigramme chiffré en utilisant la position des lettres de l’alphabet dans la grille. Par exemple pour “MO”, on a trois cas possibles :"}</p>
                  <ol>
                     <li>
                     <p>{"si le M et le O ne sont ni sur la même ligne, ni sur la même colonne :"}</p>
                     <table className="playfair-outer"><tbody>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td colSpan='4' rowSpan='2' className="playfair-redBorder">
                              <table><tbody>
                                 <tr>
                                    <td className="playfair-background">O</td>
                                    <td></td>
                                    <td></td>
                                    <td>R</td>
                                 </tr>
                                 <tr>
                                    <td>C</td>
                                    <td></td>
                                    <td></td>
                                    <td className="playfair-background">M</td>
                                 </tr>
                              </tbody></table>
                           </td>
                        </tr>
                        <tr>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                     </tbody></table>
                     <p>{"Les deux lettres définissent alors les deux coins d’un rectangle, représenté en rouge dans l’exemple de grille (incomplète) ci-contre. Pour chiffrer “MO”, on remplace alors le M et le O par les lettres situées aux 2 autres coins du rectangle, en prenant pour chaque lettre du bigramme d’origine la lettre du coin situé sur la même ligne, donc C pour M et R pour O dans notre exemple. Le bigramme “MO” est donc chiffré en “CR” pour cet exemple de grille. Le bigramme “RC” est chiffré “OM”, etc."}</p>
                     <p>{"Pour déchiffrer un bigramme de ce type, on fait exactement la même chose. Déchiffrer “CR” donne “MO”."}</p>
                  </li>
                  <li>
                     <p>{"Si le M et le O sont sur la même ligne."}</p>
                     <table className="playfair-outer"><tbody>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td>{"S"}</td>
                           <td></td>
                           <td className="playfair-background">{"O"}</td>
                           <td>{"T"}</td>
                           <td className="playfair-background">{"M"}</td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                     </tbody></table>
                     <p>{"Chaque lettre du bigramme est alors remplacée par la lettre qui se trouve juste à sa droite sur la même ligne, ou bien si l’on est sur la dernière colonne, la lettre qui se trouve à la première colonne de la même ligne."}</p>
                     <p>{"Ainsi pour l’exemple (incomplet) de grille ci-contre, le bigramme “MO” serait chiffré en “ST”"}</p>
                     <p>{"Pour déchiffrer un bigramme, il faut faire le contraire et prendre la lettre à gauche de chaque lettre. “ST” redevient alors “MO”."}</p>
                  </li>
                  <li>
                     <p>{"Si le M et le O sont sur la même colonne."}</p>
                     <table className="playfair-outer"><tbody>
                        <tr>
                           <td></td>
                           <td></td>
                           <td>{"K"}</td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td className="playfair-background">{"M"}</td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td>{"T"}</td>
                           <td></td>
                           <td></td>
                        </tr>
                        <tr>
                           <td></td>
                           <td></td>
                           <td className="playfair-background">{"O"}</td>
                           <td></td>
                           <td></td>
                        </tr>
                     </tbody></table>
                     <p>{"Le principe est similaire, sauf que pour chiffrer chaque lettre du bigramme, on prend la lettre juste en dessous (ou sur la première ligne si on est déjà en bas), et pour déchiffrer, on fait l’inverse."}</p>
                     <p>{"Dans l’exemple (incomplet) de grille ci-contre, le bigramme “MO” est chiffré en “TK”."}</p>
                  </li>
                  </ol>
               </li>
            </ol>
            <p>{"Voilà, vous avez toutes les informations utiles en votre possession. À vous de jouer. Bonne chance !"}</p>
         </div>);
   }

};
