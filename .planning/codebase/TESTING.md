# Plan de Tests (Testing)

## Situation Actuelle des Tests
- Il n'y a actuellement aucun framework de test formalisé, installé ou en place dans la base de code (pas de Jest, Cypress, ou Playwright).
- Le bloc de script `test` figurant dans le fichier `package.json` n'est qu'une solution de contournement (placeholder) basique.

## Besoins de Test
- Compte tenu de l'architecture purement monolithique, tester unitairement des fonctions JavaScript individuelles de manière isolée sera complexe sans dissocier préalablement la logique d'arrière-plan des manipulations directes du HTML.
- Les changements d'interface visuelle (UI) ou des déroulements d'actions bénéficieraient fortement de tests complets de bout-en-bout dits E2E (par exemple avec Playwright).
- **Simulation de Synchronisation Backend :** Il serait crucial de tester formellement la synchronisation en temps réel de Convex via des configurations multi-appareils pour garantir la réactivité des Queries et la cohérence de l'objet `state`.

## Stratégie Proposée
Si l'intégration de tests s'avère nécessaire :
1. **Tests de composants de rendu (Rendering Test) :** S'assurer que les chaînes de caractères HTML générées sont correctement retournées pour divers états de fausses API (mocks).
2. **Validation E2E :** Vérifier de bout-en-bout le workflow de sélection "Rodrigue" ou "Henriette" (Splash Screen) et vérifier si les bons marqueurs mettent à jour la base de données.
