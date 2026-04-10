# LDC Immersion Tracker — Rodrigue & Henriette SIALOU

## Objectif
Créer une application web mono-fichier (HTML + JS intégrés) permettant à un couple (Rodrigue & Henriette SIALOU) de suivre et documenter ensemble leur immersion de 3 jours au bureau du LDC (Service Local Développement-Construction) de la filiale de Côte d'Ivoire, du 15 au 17 avril 2025 au Béthel, Angré, Cocody, Abidjan.

## Fonctionnalités
- Sélection d'identité : l'utilisateur choisit entre Rodrigue ou Henriette avant de saisir des données — chaque action est attribuée à la bonne personne
- Suivi des 6 pôles LDC : Planning, Conception, Gestion de projet & Construction, Qualité Assurance, Fonctionnement & Maintenance, Support — chaque pôle est marquable comme "visité" par personne
- Prise de notes par pôle : deux zones de texte côte à côte (une par personne) pour saisir les observations individuelles
- Questions à poser : ajout et suppression de questions par pôle, avec attribution à Rodrigue ou Henriette
- Carnet de contacts : ajout de frères/sœurs rencontrés avec nom, rôle/pôle, mémo rapide et indication de qui les a ajoutés
- Tableau de bord : stats en temps réel (pôles visités, notes prises, contacts, questions), barre de progression, programme des 3 jours affiché jour par jour
- Synthèse IA : bouton qui envoie toutes les notes du duo à l'API Anthropic et génère un rapport structuré en français (résumé, points forts par pôle, opportunités de contribution, prochaines étapes)

## Pages / Écrans
- Onglet Aperçu : barre de progression + statistiques du duo + programme des 3 jours
- Onglet Pôles LDC : grille des 6 pôles avec indicateurs visuels de visite + panneau de détail au clic (notes duo + questions)
- Onglet Contacts : liste des contacts ajoutés + formulaire d'ajout rapide
- Onglet Synthèse IA : zone de génération du rapport final via l'API Anthropic

## Contraintes techniques
- Tout dans un seul fichier HTML (CSS + JS intégrés)
- Pas de framework, JavaScript simple
- Design sobre et professionnel, mobile-friendly
- Les données ne sont pas stockées dans le localStorage du navigateur
- Appels API Anthropic via fetch vers https://api.anthropic.com/v1/messages, modèle claude-sonnet-4-20250514, sans passer de clé API (elle est gérée en amont)

## Ce que l'app ne fait PAS
- Pas de login / authentification
- Pas de synchronisation en temps réel entre deux appareils distincts
- Pas de sauvegarde persistante des données entre sessions
- Pas de notifications push
- Pas de gestion multi-immersion (une seule immersion à la fois)
