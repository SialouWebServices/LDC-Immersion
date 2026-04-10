# Architecture

## Architecture Globale
L'application est une application web monopage (SPA) autonome, fonctionnant côté client et contenue principalement dans un seul fichier `index.html`. Elle s'appuie sur le modèle "Backend-as-Code" de **Convex** pour gérer la persistance, la synchronisation temps réel, le stockage de fichiers et l'exécution de la logique métier (IA). La logique s'exécute directement depuis le contexte du navigateur ou de la WebView (sur mobile).

## Gestion de l'état (State Management)
- Une variable globale `state` suit en permanence :
  - L'utilisateur connecté (Rodrigue ou Henriette)
  - Les indicateurs de navigation (`currentTab`, `activePoleTab`, etc.)
  - Les données chargées (`poles`, `contacts`, `generalNotes`, `isGeneratingIA`)
- Le réaffichage complet de l'interface (UI) est géré par une fonction `render()` qui est appelée automatiquement par les abonnements Convex (`watchQuery`) ou manuellement lors des changements d'état locaux.

## Synchronisation des données
- L'application utilise les **Queries réactives** de Convex. Au lieu d'un chargement initial manuel suivi d'une écoute d'événements (Realtime Supabase), Convex maintient une connexion persistante et met à jour automatiquement les données locales dès qu'un changement survient sur le serveur.
- Les mutations sont effectuées via des fonctions Convex (`mutations`) qui garantissent la consistance atomique.
- La gestion hors-ligne est assurée nativement par le client Convex qui gère les retentes de synchronisation dès que la connexion est rétablie.

## Mécanismes de distribution
1. **Application Web / PWA :** Utilise un Service Worker (`sw.js`) et un manifeste (`manifest.json`) pour fonctionner comme une vraie application web installable.
2. **Application Android :** Encapsulée par Capacitor via `capacitor.config.json` pointant vers le dossier web (`www`), permettant de générer un fichier APK natif.
