# Architecture Technique (Stack)

## Frontend (Application Mono-fichier)
- **HTML5 :** Syntaxe sémantique pour la structure, entièrement contenue dans `index.html`.
- **CSS3 :** Styles globaux et variables définis directement dans le bloc `<style>` de `index.html`. Les propriétés personnalisées sont massivement utilisées pour le thème (`--rodrigue-main`, `--henriette-main`). La mise en page responsive est conçue principalement pour les interfaces mobiles.
- **JavaScript (Vanilla JS/ES6) :** Aucun framework frontend comme React ou Vue. L'état (state) est entièrement géré par un objet global `state`.
- **Service Worker :** Inclut un fichier `sw.js` et un `manifest.json` pour le fonctionnement en PWA (Progressive Web App).

## Backend & Base de données
- **Convex :** Backend-as-code utilisé pour la base de données, les fonctions (queries, mutations, actions) et le temps réel.
    - **Base de données :** Base de données documentaire réactive pour les tables `poles`, `contacts`, `notes`, `programs`.
    - **Temps réel :** Natif à Convex via les abonnements (subscriptions) aux queries, remplaçant Supabase Channels.
    - **Stockage (File Storage) :** Utilisé pour les photos, vidéos et enregistrements audio.
    - **IA (Actions) :** Les synthèses IA sont exécutées via des `Convex Actions`.
- **Note sur la persistance :** Suppression de `Dexie.js`. La synchronisation est désormais gérée nativement par le client Convex (retry et cache).

## Exécution & Enveloppes Mobiles (Wrappers)
- **Capacitor :** Wrapper web-vers-natif utilisé pour déployer l'application web sur Android.
    - `@capacitor/core`, `@capacitor/android`, `@capacitor/cli`
- **Node.js (pour les outils) :** Scripts npm utilisés uniquement pour les outils en ligne de commande (CLI).

## Bibliothèques & Outils
- `html2pdf.js` : Génère des exports PDF à partir du contenu HTML côté client.
- `marked.js` : Convertit le contenu markdown en HTML (largement utilisé pour formater les réponses de l'IA).
