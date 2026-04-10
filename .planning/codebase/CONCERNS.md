# Points de Vigilance (Concerns)

## Taille du Monolithe & Maintenabilité
- Toute la logique, l'architecture et la vue (layout) de l'application résident uniquement ou presque dans `index.html`, le rendant lourd (+ 2000 lignes). Au fur et à mesure que les fonctionnalités augmentent, la traque des problèmes logiques ou de syntaxe deviendra proportionnellement plus difficile.

## Sécurité
- **Clé API IA :** La migration vers des Convex Actions sécurise la clé API (Claude/OpenAI), car elle est désormais stockée en tant que variable d'environnement sur le serveur Convex et n'est plus accessible côté client.
- **Accès aux données :** L'application utilise les fonctions Convex (Queries/Mutations). La sécurité est gérée au niveau des serveurs via la logique des fonctions, réduisant l'exposition directe de la base de données.

## Persistance et Gestion de l'état
- L'utilisation de `render()` pour actualiser l'interface peut causer des pertes de focus. Une refonte vers un framework comme React ou une gestion plus fine du DOM serait nécessaire à terme pour plus de fluidité.
- **Concurrence :** Convex résout nativement les problèmes de concurrence et de conditions de course (race conditions) grâce à son modèle d'exécution transactionnelle déterministe.

## Gestionnaires Multimédias (Médias)
- L’API web `navigator.mediaDevices` et les autres composants chargés des éléments audio/vidéo stockent les fichiers directement dans le cache temporaire (Blob) avant le téléversement final. De gros fichiers non fragmentés pourraient potentiellement créer de sérieux cas de débordements de mémoire (Memory Overflows) du navigateur web local en cas de connectivité ralentie.
