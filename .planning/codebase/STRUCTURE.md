# Structure du Projet

Le projet a une structure relativement plate et monolithique où la logique, la vue et le style sont fusionnés.

## Fichiers Centraux
- `index.html` : Coeur de l'application. Contient l'arborescence HTML, la plupart du CSS local, et plus de 1000 lignes de JavaScript qui dictent toute l'interactivité et les appels API.
- `sw.js` : Configuration classique du Service Worker (pour la mise en cache et pour permettre l'installation hors ligne en tant que PWA).
- `manifest.json` : Manifeste Web App définissant le nom de l'application, la couleur de thème et les icônes.

## Configuration & Outils
- `package.json` : Gère les dépendances npm de base, utilisées principalement pour la compilation Capacitor.
- `capacitor.config.json` : Fichier de configuration de Capacitor spécifiant le dossier de build et l'ID du paquet Android natif (`com.ldc.immersion`).

## Documentation
- `instructions.md` : Consignes et spécifications des fonctionnalités de l'application demandées par le cahier des charges initial.
- `brand-guidelines.md` : Guide visuel des couleurs, de la typographie, des thèmes et des choix de design du projet.

## Dossiers
- `convex/` : Contient la logique backend-as-code (schéma, requêtes, mutations et actions IA).
- `www/` : Le dossier de distribution web, servi aux utilisateurs finaux et utilisé par Capacitor lors du processus de compilation.
- `src/` : Code source JavaScript modulaire (utilisé par Vite).
- `android/` : Dossier du projet Android natif généré automatiquement par Capacitor.
- `node_modules/` : Paquets et modules de dépendances.
