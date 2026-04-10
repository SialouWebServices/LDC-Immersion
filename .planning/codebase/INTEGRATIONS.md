# Intégrations

## Convex
- **Nom du service :** Backend Convex
- **Point d'intégration :** Côté client via la bibliothèque `convex`.
- **Objectif :** Agit comme le magasin de données principal, la couche de synchronisation en temps réel et l'exécuteur de la logique métier. Gère :
  - L'état persistant pour `poles`, `contacts`, `notes`, `programs`
  - Le temps réel natif
  - Le stockage de fichiers (File Storage)
  - L'exécution des synthèses IA via des Actions

## AI (OpenAI / Anthropic via Convex Actions)
- **Point d'intégration :** Appel à la fonction `client.action('ai:generateReport')`.
- **Objectif :** Génère des synthèses et des plans d'action à partir des données collectées. La logique d'appel aux LLM est encapsulée dans le backend Convex.
