# Mettre DIAZBEATS en ligne avec paiement

## 1. Stripe (le paiement par carte)
1. Crée un compte sur stripe.com au nom de ton ami et active le **mode test**.
2. Dans Développeurs > Clés API, copie la **clé secrète** (elle commence par `sk_test_`).

## 2. Cloudflare R2 (le stockage privé des fichiers)
1. Crée un compte sur cloudflare.com, puis un espace R2 (bucket) en **privé**. Vérifie les conditions et le quota gratuit actuels.
2. Envoie-y tes 6 fichiers en les **renommant exactement** :
   - `scuderia.mp3` et `scuderia.wav` (essai n°165)
   - `creeper.mp3` et `creeper.wav` (essai n°157_2)
   - `no-mans-land.mp3` et `no-mans-land.wav` (essai n°158)
3. Crée un jeton d'accès API R2 avec droit de lecture. Note l'ID de compte, l'ID d'accès et la clé secrète.

## 3. Netlify (l'hébergement)
1. Mets ce dossier dans un dépôt GitHub (envoi de fichiers depuis le site de GitHub).
2. Sur netlify.com : Add new site > Import from Git, et choisis ce dépôt.
3. Dans Site settings > Environment variables, ajoute :
   `STRIPE_SECRET_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` (nom de ton bucket).
4. Relance le déploiement.

## Apple Pay, Google Pay et PayPal
Le site utilise la page de paiement de Stripe, donc rien à changer dans le code.
- **Cartes (Visa, Mastercard, CB), Apple Pay et Google Pay :** ils s'affichent d'eux-mêmes sur les appareils compatibles. Dans Stripe, vérifie quand même Paramètres > Moyens de paiement qu'ils sont bien activés.
- **PayPal :** dans le même menu, active PayPal. Il faudra peut-être lier un compte PayPal et accepter ses conditions. Vérifie la disponibilité pour ton compte.
- Chaque moyen de paiement a sa propre commission : elle est indiquée dans les réglages de Stripe.
- Essaie chaque moyen en mode test avant de passer en réel.

## Formulaire de contact
Il utilise Netlify Forms (rien à installer). Après le déploiement, va dans Netlify > Forms > Form notifications et ajoute ton e-mail pour recevoir les messages. Vérifie le quota gratuit actuel.

## 4. Essayer avant de vendre
Achète une prod avec la carte de test `4242 4242 4242 4242` (date future, code au choix). Tu dois arriver sur la page « Merci » avec un lien de téléchargement qui marche.

## 5. Vendre pour de vrai
Dans Stripe, passe en mode réel, remplace `STRIPE_SECRET_KEY` par la clé `sk_live_...` sur Netlify, puis relance le déploiement.

## Ajouter une prod (sans toucher au code)
1. Ouvre `outils/ajouter-une-prod.html` dans ton navigateur (double-clic).
2. Remplis les infos, choisis la pochette et le MP3, clique « Ajouter la prod ».
3. Télécharge les fichiers proposés : `beats.json`, la pochette et l'extrait.
4. Sur GitHub : mets `beats.json` dans `public/` (remplace l'ancien), la pochette dans `public/covers/`, l'extrait dans `public/previews/`.
5. Mets le MP3 et le WAV complets dans R2, nommés `titre.mp3` et `titre.wav` (le nom exact est affiché par l'outil).
Netlify met le site à jour tout seul. Les prix ne sont pas dans `beats.json` : ils sont dans `netlify/functions/checkout.js` (et affichés dans `public/index.html`).

## À compléter avant de vendre
Dans `public/index.html`, cherche les crochets [ ] de la section « Conditions » (nom, statut et SIRET, adresse, e-mail, médiateur, TVA) et remplis-les. Fais relire ces textes par un professionnel : ce n’est pas un avis juridique.
