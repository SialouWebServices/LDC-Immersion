# Brand Guidelines — LDC Immersion Tracker

## Identité visuelle
Application sobre et professionnelle, à l'image d'un outil de terrain utilisé dans un contexte de service bénévole. Le design doit inspirer confiance, clarté et sérieux, sans être froid. L'ambiance est légèrement chaleureuse pour refléter le caractère humain et communautaire du projet.

## Couleurs

### Couleurs principales du duo
- **Rodrigue** — Violet : `#7F77DD` (principal), `#EEEDFE` (fond clair), `#3C3489` (texte sombre)
- **Henriette** — Rose : `#D4537E` (principal), `#FBEAF0` (fond clair), `#72243E` (texte sombre)

Ces deux couleurs sont utilisées systématiquement pour distinguer les contributions de chaque personne : zones de notes, badges, pastilles de visite, tags de contact.

### Couleurs neutres
- Fond principal : `#ffffff`
- Fond secondaire : `#f5f5f3`
- Fond tertiaire : `#f0ede8`
- Texte principal : `#1a1a18`
- Texte secondaire : `#888880`
- Texte tertiaire : `#aaa`
- Bordures : `0.5px solid #cccccc`

### Couleur spéciale "duo validé"
- Vert doux : `#E1F5EE` fond / `#085041` texte — utilisé quand les deux ont visité un pôle ou validé une étape ensemble

### Couleur contacts
- Bleu info : `#B5D4F4` fond avatar / `#185FA5` texte — pour les initiales des contacts rencontrés

## Typographie
- Police : `system-ui, sans-serif` (natif, pas de chargement externe)
- Taille corps : 13–14px
- Titres section : 16–18px, font-weight 500
- Labels & méta : 11–12px, couleur secondaire
- Pas de gras lourd (600+), uniquement font-weight 400 et 500

## Espacements
- Padding cards : `1rem 1.25rem`
- Gap grille : `12px`
- Border-radius cards : `12px`
- Border-radius éléments internes : `8px`
- Border-radius pastilles/tags : `8px`

## Composants clés

### Badges d'identité (header)
Affichés en permanence en haut à droite. Le badge actif prend la couleur de la personne. L'avatar est un cercle de 22px avec initiale.

### Cartes de pôle
Fond blanc, bordure 0.5px, radius 12px. Contiennent : icône emoji, nom du pôle, description courte, deux pastilles de visite (une par personne). La carte sélectionnée a une bordure violette de 1.5px.

### Pastilles de visite
Deux petits cercles de 8px : gris par défaut, violet si Rodrigue a visité, rose si Henriette a visité. Un tag texte "Visité duo" (vert), "Rodrigue" (violet) ou "Henriette" (rose) s'affiche selon l'état.

### Notes duo
Deux colonnes côte à côte avec label coloré (violet / rose), textarea sur fond `#f5f5f3` avec focus violet.

### Stat cards
Fond `#f0ede8`, radius 8px, valeur en 20px/500, label en 11px gris. Disposées en rangée de 4.

### Barre de progression
4px de hauteur, dégradé `linear-gradient(90deg, #7F77DD, #D4537E)`, représente le % de pôles visités.

## Icônes des pôles
- Planning : 📋
- Conception : ✏️
- Gestion de projet : 🏗️
- Qualité Assurance : 🛡️
- Fonctionnement & Maintenance : ⚙️
- Support : 💻

## Ton de l'interface
- Français, tutoiement implicite via les prénoms
- Labels courts et directs : "Ajouter", "Visité", "Générer la synthèse IA"
- Placeholders descriptifs : "Observations de Rodrigue…", "Mémo rapide"
- Le bouton de synthèse IA est sobre, pas coloré — il se distingue par son action, pas par sa couleur

## Ce qu'on évite
- Pas de dégradés sur les fonds de containers
- Pas d'ombres portées (box-shadow)
- Pas de couleurs vives en dehors de la palette duo
- Pas d'animations complexes
- Pas de dark mode forcé (l'app s'adapte au système si besoin mais n'impose rien)
