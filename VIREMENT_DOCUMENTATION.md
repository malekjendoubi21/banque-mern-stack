# Fonctionnalité de Virement

## Description
Nouvelle fonctionnalité permettant aux clients d'effectuer des virements entre comptes bancaires avec validation en temps réel et sécurité renforcée.

## Fonctionnalités implémentées

### Frontend
- **Bouton Virement** : Ajouté à côté des boutons "Détails" et "Recharger" pour chaque compte actif
- **Modal de virement** : Interface utilisateur intuitive avec :
  - Affichage des informations du compte source
  - Champ de saisie du numéro de compte destinataire
  - Recherche automatique et affichage des informations du destinataire
  - Champ de montant avec validation du solde
  - Champ de description optionnel
  - Aperçu du nouveau solde après virement
  - Messages d'erreur et de validation en temps réel
  - Bouton de confirmation avec protection contre les doubles clics

### Backend
- **Route de recherche** : `/api/comptes/search/:numeroCompte` pour rechercher un compte destinataire
- **Route de virement** : `/api/virements` (POST) pour effectuer un virement
- **Validation complète** :
  - Vérification de l'existence et de l'état des comptes
  - Validation du solde suffisant
  - Prévention des virements vers le même compte
  - Vérification des droits d'accès
- **Transactions atomiques** : Utilisation de transactions Sequelize pour garantir la cohérence
- **Création automatique des transactions** : Enregistrement automatique dans la table transaction

### Base de données
- **Table virement** mise à jour avec :
  - `compte_source` : Numéro du compte source
  - `compte_destination` : Numéro du compte destinataire
  - `description` : Description du virement
  - `date_virement` : Date et heure du virement
  - `etat` : État du virement (pending, completed, failed)
- **Table transaction** mise à jour avec :
  - `idvirement` : Lien vers le virement associé
  - Création automatique de deux transactions (débit et crédit)

## Sécurité
- **Authentification** : Seuls les clients connectés peuvent effectuer des virements
- **Autorisation** : Un client ne peut virer que depuis ses propres comptes
- **Validation** : Vérifications multiples côté backend
- **Prévention des erreurs** : Empêche les virements vers le même compte

## Utilisation
1. Connectez-vous en tant que client
2. Allez sur la page "Mes Comptes"
3. Cliquez sur le bouton "Virement" d'un compte actif
4. Saisissez le numéro du compte destinataire
5. Vérifiez les informations du destinataire affichées automatiquement
6. Saisissez le montant et une description optionnelle
7. Cliquez sur "Confirmer le virement"

## Notes techniques
- **Gestion d'erreurs** : Messages d'erreur clairs pour l'utilisateur
- **Interface responsive** : Compatible mobile et desktop
- **Animations** : Interface fluide avec animations CSS
- **Performance** : Recherche optimisée avec index sur la base de données

## Installation
1. Exécutez le script SQL `update_virement_schema.sql` pour mettre à jour la base de données
2. Redémarrez le serveur backend
3. L'interface frontend est prête à l'emploi

## Tests recommandés
- [ ] Virement entre deux comptes différents
- [ ] Tentative de virement avec solde insuffisant
- [ ] Tentative de virement vers le même compte
- [ ] Tentative de virement vers un compte inexistant
- [ ] Tentative de virement depuis un compte qui n'appartient pas à l'utilisateur
- [ ] Vérification de la création des transactions associées
- [ ] Test de l'interface utilisateur sur mobile et desktop
