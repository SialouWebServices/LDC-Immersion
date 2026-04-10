# Conventions

## Style de code
- **Frontend Monolithique :** Les fonctionnalités sont regroupées logiquement à l'intérieur d'une seule balise `<script>` au lieu d'être divisées en plusieurs modules ES (ES Modules).
- **Portée des variables :** Des variables globales (`state`, `sb`) sont utilisées pour gérer la configuration de base et la mémoire de l'application.
- **Convention de nommage :** Le nom des fonctions suit un modèle verbe-nom. Les fonctions effectuant des appels asynchrones à Convex utilisent `client.query`, `client.mutation` ou `client.action`.
- **Modèle de rendu (Rendering) :** Approche basée sur les littéraux de gabarits (template literals) qui parcourent les objets JSON/JS pour produire les structures HTML (`renderOverview`, `renderPoles`, `renderJournal`). Les remplacements complets via `innerHTML` sont privilégiés par rapport aux manipulations complexes de DOM Virtuel.

## Interface Utilisateur (UI/UX) & Formatage
- **Fonctionnalités CSS (Préprocesseur) :** L'approche Vanilla CSS s'appuie sur les propriétés personnalisées (variables) définies tout en haut dans le sélecteur `:root` pour définir les styles globaux (couleurs, dimensions).
- **Sélecteurs de classe :** Suivent une méthodologie plate et standard sans trop d'imbrication profonde (ex: `.btn-primary`, `.toast`, `.card`).
- **Priorité au Mobile (Mobile First) :** Utilisation intensive des variables d'environnement telles que `env(safe-area-inset-bottom)` et conception structurée autour d'une barre de navigation fixe en bas d'écran.
- **Notifications (Toast) :** Utilisation standardisée de la fonction utilitaire `showToast('message', 'type')` pour afficher des retours visuels à l'utilisateur lors de la réussite ou de l'échec des actions.
