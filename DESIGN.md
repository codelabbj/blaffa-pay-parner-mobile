# Cahier de design — Application « Blaffa Pay Partners » (ConnectPro)

> À remettre à un développeur ou à coller dans GPT pour générer un design propre.
> L'application existe déjà et fonctionne. On NE change PAS la logique ni les fonctionnalités :
> on refait uniquement l'habillage (UI) pour qu'il soit plus net, plus professionnel et plus lisible.

## 1. Contexte
Application Android de partenaire de paiement mobile money (Côte d'Ivoire). L'utilisateur fait des
dépôts et retraits mobile money, des transferts entre partenaires, des recharges, et des
dépôts/retraits sur des plateformes de paris (1XBET, MELBET, 888starz, BETWINNER…). Langue : français.
Monnaie : FCFA (XOF).

## 2. Direction visuelle
- Style **fintech sobre et premium** : en-tête foncé, fond clair, cartes blanches, beaucoup d'air.
- Hiérarchie typographique forte, montants bien visibles, statuts lisibles d'un coup d'œil.
- On enlève l'aspect « pastel » générique actuel.

## 3. Système de couleurs (par rôle)
- **Navy structure / en-tête** : `#0E1A2E`
- **Fond d'écran** : `#EEF2F8`  · **Cartes** : `#FFFFFF`
- **Vert = ACTIF / crédit / dépôt** : `#0E9F6E`  (règle maison : un réglage allumé est vert)
- **Rouge = débit / retrait / échec** : `#E5484D`
- **Bleu = secondaire / inactif** : `#2F6BFF`
- **Ambre = en attente** (commission non versée, délai) : `#C77A08`
- Texte principal `#0F1B2D`, texte secondaire `#74839A`, traits `#E6ECF4`.

## 4. Typographie
- **Une seule police partout : Plus Jakarta Sans** (poids 400 à 800). Google Fonts.
- Titres + montants en 700/800 ; texte courant en 400/500/600.
- Montants et colonnes de chiffres : chiffres à chasse fixe (tabular-nums).

## 5. Composants
- **Cartes** : coins arrondis 18 px, ombre douce, 1 px de trait clair.
- **Pastilles de statut** (toujours colorées) : Succès = vert, Envoyé = bleu, Annulation demandée = ambre, Échec = rouge.
- **Icônes** dans une pastille arrondie de la couleur de leur rôle (dépôt vert, retrait rouge/bleu, etc.).
- **Boutons principaux** en vert plein ; secondaires en bleu ; destructifs (déconnexion) en rouge.
- Marges latérales constantes 16 px, mêmes hauteurs de carte, mêmes rayons partout.

## 6. Écrans

### Connexion
- **Identifiant = ADRESSE E-MAIL** (plus de numéro de téléphone), + mot de passe, bouton « Se connecter ».
- Exemple affiché : `partenaire@exemple.com` (ne jamais mettre un vrai e-mail).

### Accueil
- En-tête foncé navy : **icône de menu ☰ à gauche** (c'est le menu — PAS un avatar/initiale) + « Bonjour, … » + date, cloche (notifications), roue (réglages).
- **Solde total** en grand sur l'en-tête.
- **Commission du mois** : carte verte sous le solde (montant + lien « Historique ›» vers l'historique des commissions).
- Sous l'en-tête, 3 actions qui chevauchent la carte : **Dépôt** (vert +), **Retrait** (bleu −), **Transfert** (violet ➤).
- **Activité récente** : liste de cartes (icône de sens ↗/↘, nom, type, pastille de statut, montant coloré, référence TXN).

### Menu latéral (ouvert par l'icône ☰ de l'accueil) — REFONDU
- **Ouvert par une icône de menu ☰** (3 traits), pas par un avatar/initiale.
- En-tête « Blaffa Pay · Partners ».
- **Une seule section : HISTORIQUE**, avec exactement : **Transactions · Recharges · Transferts · Paris · Dépôts**.
- **À RETIRER du menu** : « Recharge », « Transfert », « Paiement groupé » (ce ne sont plus des entrées de menu).
- Bouton **Déconnexion** en rouge en bas.

### Dépôt
- **Mobile Money** et **Dépôt en masse** sont OPTIONNELS : ils n'apparaissent que si l'admin les a activés pour le compte. Un compte partenaire standard N'A PAS ces deux options.
- Donc, pour un partenaire standard, cliquer sur **Dépôt** l'amène **directement sur la liste des plateformes de paris (MobCash)** — pas d'écran « type de dépôt ».
- L'écran « Type de dépôt » (3 cartes : Mobile Money · MobCash — Paris · Dépôt en masse) n'est montré qu'en **vue admin**.
- Parcours MobCash : liste des plateformes (logo, ville, rue) → page « ID utilisateur de Paris » → **le bouton « Rechercher le compte » est JUSTE sous le champ ID** (pas en bas de l'écran).
- Après la recherche : **carte « VÉRIFIÉ »** qui affiche **le NOM DU CLIENT rechargé** (ex. « Gerard La merveille K. », nom complet, pas tronqué), l'ID, la plateforme (1XBET) et ville/rue → **le montant**, puis **le bouton « Déposer » JUSTE sous le montant**.
- Ce **nom du client** doit se retrouver dans le détail de la transaction (c'est le nom de celui qui a été rechargé, pas le nom du partenaire).
- **Écran de succès** après dépôt : « Dépôt effectué · crédité à [nom du client] » + bouton « Retour à l'accueil ».
- Mobile Money (vue admin) : choix du réseau (MOOV, MTN, ORANGE, WAVE…) → numéro + montant → confirmation.

### Détail d'une transaction + annulation (Blaffa Cancel)
- Détail : statut, montant, **Nom du client** mis en avant, ID, plateforme, référence, date.
- **Bouton « Annuler la transaction » (rouge) placé HAUT, juste sous les infos** (pas collé en bas).
- L'annulation passe par **Blaffa Cancel** : afficher la réponse de Blaffa Cancel (carte rouge) + un toast « Transaction annulée » ; le client est notifié.

### Transfert — PAR SURNOM, en 3 étapes
- Chaque utilisateur Blaffa Pay définit un **surnom (pseudo)** unique, ex. `@le_boss` (réglage de profil).
- **Étape 1 — Choisir** : à l'ouverture, **liste des partenaires par surnom** (avatar + surnom), **sans jamais montrer le vrai nom** (confidentialité) ; barre de recherche par surnom. **Pas de montant sur cette page.** On tape sur une personne.
- **Étape 2 — Montant** : écran dédié qui affiche le surnom choisi + un grand champ **Montant**, puis le bouton **« ➤ Envoyer à @surnom »**. **Aucune observation/description.**
- **Étape 3 — Envoyé** : écran de succès « Transfert envoyé · Envoyé à @surnom » + bouton « Retour à l'accueil ».
- Règle : un surnom = un seul compte ; recherche uniquement par surnom (le nom réel n'est jamais exposé).

### Notifications
- **Historique des notifications** : transferts envoyés, dépôts validés, annulations.

### Commissions
- **Historique des commissions** (accessible depuis la carte « Commission du mois » de l'accueil).

### Transactions de Paris
- Titre + compteur (« 1 850 transactions »), barre de recherche + filtre.
- Cartes de pari : nom, plateforme (1XBET…), pastille de statut (Réussi / Annulation demandée…), montant en vert, date + ID, commission en ambre.

### Transfert UV — PAR SURNOM (nouveau)
- Chaque utilisateur Blaffa Pay peut définir un **surnom (pseudo)** unique, ex. `@le_boss` (réglage de profil).
- À l'ouverture de Transfert, afficher **la liste de tous les partenaires par surnom** (avatar + surnom), **sans jamais montrer le vrai nom** (confidentialité).
- Barre de recherche **par surnom** : on tape ou on colle le surnom → la personne apparaît.
- On sélectionne le surnom → on saisit le **Montant** → bouton **« Envoyer à @surnom »**.
- Règle : un surnom = un seul compte ; la recherche se fait uniquement par surnom (le nom réel n'est pas exposé).

### Recharge
- Solde disponible, Montant, Description de preuve, Image de preuve (upload), bouton « Créer la recharge ».

### Paramètres
- Compte → Profil ; Préférences → Langue (Français), Thème (clair/sombre) ; Déconnexion en rouge.

## 7. À NE PAS oublier
- Garder le français et le format FCFA.
- Prévoir un **mode sombre** cohérent (mêmes rôles de couleur).
- Accessibilité : contrastes suffisants, zones tactiles ≥ 44 px.
