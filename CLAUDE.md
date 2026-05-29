# BRIEF MAÎTRE — Refonte « Zone Total Sport » (nouvelle home + apps)

> Document de référence pour Claude Code. À placer à la racine du repo (idéalement renommé `CLAUDE.md` pour lecture automatique). Source de vérité : si un doute survient, suivre ce brief, et demander avant d'inventer.

---

## 0. Rôle & contexte

- **Projet :** Zone Total Sport — portail québécois 100 % gratuit de ressources pour faire bouger les enfants du primaire.
- **Marque :** mascotte **Mr. Root**, un bûcheron sportif. Univers visuel **Pop Art** (couleurs vives, contours noirs épais, trame de points façon BD, ombres franches) + touche « bûcheron » (bois, carreauté rouge/noir).
- **Créateur :** Joey Root (Racine), enseignant en ÉPS depuis 20+ ans.
- **Le site sert 3 corps de métier :** 🏃 Éducation physique · 🧸 Service de garde · 🏕️ Camps de jour (animation).
- **État actuel :** `index.html` est un **mockup** (aperçu non fonctionnel). Ta job : le **rendre vivant et fonctionnel**, puis bâtir l'écosystème d'apps autour, le tout dans une mise en page **unifiée et magnifique**.

### Repo
- Dépôt de travail : `github.com/ZoneTotalSport/zts-x3n0lr` (publié sur `https://zonetotalsport.github.io/zts-x3n0lr/`, protégé par mot de passe côté client).
- Contenu actuel : `index.html` (~152 Ko), `apps-nhl/` et `apps-nba/` (vraies apps fonctionnelles, API live), images `perso-ep.png` / `perso-sdg.png` / `perso-camp.png` et `bg-*.jpg`.
- Site de production existant : `https://zonetotalsport.ca` (22 repos sous le compte `ZoneTotalSport` — plusieurs apps déjà en ligne, voir §6).

### Stack & contraintes
- **100 % statique** : HTML + CSS + JS vanilla. Hébergement GitHub Pages + Cloudflare + Firebase.
- **Pas de framework lourd** ni de build step obligatoire (« code once, run everywhere », léger). Pas de dépendance qui casse hors-ligne.
- Doit fonctionner sur **TNI / TBI** (tableau blanc interactif), tablette et mobile. Responsive obligatoire.
- Performance : images optimisées, chargement rapide.

---

## 1. Objectif global (les 5 chantiers)

1. **Réparer** tout ce qui est non fonctionnel dans le mockup (le rendre vivant).
2. **Design system unifié** : créer UN gabarit/charte partagé pour que la home ET toutes les apps aient exactement la même mise en page → un site « incroyablement beau » et cohérent.
3. **Intégrer les apps existantes** de zonetotalsport.ca dans l'interface à 3 métiers.
4. **Bilingue FR/EN** sur l'interface **et** les apps (système i18n réutilisable).
5. **Créer les nouvelles apps** proposées, par métier (voir §7), toutes sur le même gabarit.

Le client veut une livraison « **tout en bloc** » mais on procède par **phases** (§8) pour pouvoir valider en cours de route.

---

## 2. Design system unifié — LE point central

> Exigence du client : **toutes les apps doivent avoir la même mise en page.** Crée un système central et fais que chaque page (home + chaque app) le consomme. Aucune app ne définit son style en solo.

### 2.1 Fichiers partagés à créer
- `/shared/zts.css` — design tokens + composants + styles globaux.
- `/shared/zts.js` — utilitaires communs (init header/footer, i18n, helpers modales, thème métier).
- `/shared/i18n/fr.json` et `/shared/i18n/en.json` — dictionnaires de traduction.
- `/shared/header.html` + `/shared/footer.html` — gabarits injectés par JS (fetch + innerHTML) OU composant `<zts-header>` / `<zts-footer>` en Web Component. Choisir UNE approche et l'appliquer partout.
- `/shared/app-template.html` — gabarit vierge d'une app (header, zone contenu, footer, toggle langue, bouton « retour métier » déjà câblés). Toute nouvelle app part de ce gabarit.

### 2.2 Design tokens (CSS variables)
Définir dans `:root`. Proposition de palette Pop Art / bûcheron (ajuster finement mais garder l'esprit) :
- `--zts-noir: #1A1A1A;` (contours, texte)
- `--zts-creme: #FFF8EC;` (fonds)
- `--zts-rouge: #E63329;` (bûcheron / accent fort)
- `--zts-orange: #FF8A3D;`
- `--zts-jaune: #FFD23F;` (pop)
- `--zts-cyan: #19B5C9;`
- `--zts-bois: #8B5A2B;` (brun bois)
- **Accents par métier** (thématisation) :
  - ÉP : `--metier: var(--zts-orange);`
  - Service de garde : `--metier: #2BB673;` (vert)
  - Camps de jour : `--metier: var(--zts-cyan);`
- Contours : épaisseur standard `--bord: 3px solid var(--zts-noir);` + ombre BD `--ombre: 4px 4px 0 var(--zts-noir);`
- Rayons, espacements, tailles de police : définir une échelle (`--r-1`, `--space-1..6`, `--fs-1..6`) et l'utiliser partout — **zéro valeur en dur** dans les apps.
- Typo : titres = police display percutante (style affiche/BD), corps = sans-serif très lisible. Réutiliser les polices déjà présentes dans `apps-nhl/fonts/` si pertinent (LuckiestGuy, Kranky…), sinon Google Fonts légères.

### 2.3 Composants partagés (mêmes classes partout)
- **Header** : logo Mr. Root + nom, nav (Accueil, métiers, Ressources, Communauté, Dons), **toggle langue FR/EN**, salutation user. Sticky.
- **Footer** : 4 colonnes (Pour qui / Ressources / Outils / Extras) + réseaux sociaux + mentions. **Tous les liens doivent être réels** (voir §5).
- **Carte app** (`.zts-app-card`) : icône/mascotte, titre, courte description, tag (Nouveau / IA / Pro / Bientôt), bouton d'action. Identique partout.
- **Bouton** (`.zts-btn`, variantes `--primary/--metier/--ghost`), **modale** (`.zts-modal` + overlay + bouton ✕ qui ferme vraiment + fermeture sur clic overlay + touche Échap), **badges/tags**, **barre de stats** (compteurs animés), **bannière métier**.
- **Sous-nav « retour »** sur chaque app : « ← Retour à [métier] » + « ← Accueil ».

### 2.4 Style visuel
- Contours noirs épais, ombres décalées (effet autocollant/BD), trames de points en arrière-plan, aplats de couleur vifs. Cohérent avec Mr. Root.
- Animations sobres et utiles (hover des cartes, compteurs qui montent, ouverture modale). Rien qui nuit à la lisibilité au TNI.
- Accessibilité : contraste AA, focus visible, cibles tactiles ≥ 44 px, `alt` sur images, navigation clavier.

---

## 3. Internationalisation FR/EN

- Système **i18n par attribut** : chaque texte porte `data-i18n="cle"`; `zts.js` remplace le contenu selon la langue active. Les attributs (placeholder, title, aria-label) via `data-i18n-attr`.
- Dictionnaires `fr.json` / `en.json` (mêmes clés). Langue par défaut **FR**; choix mémorisé dans `localStorage` (`zts_lang`).
- Le **toggle FR/EN** du header pilote toute la page sans rechargement.
- Le `<html lang>` se met à jour. Prévoir d'ajouter 中/ES plus tard (garder l'archi extensible) mais **livrer FR + EN seulement**.
- **Apps existantes** : celles déjà multilingues (Planificateur, Générateur) gardent leur système; pour les autres, brancher le même i18n. (Chantier accepté par le client : interface **+** apps.)

---

## 4. Rendre le mockup « vivant » — comportements à câbler

- Les **3 CTA métier** (« C'est parti! / On y va! / En avant! ») doivent fonctionner : appliquer le thème du métier (`body[data-metier]`) + révéler la section/hub du métier (ou naviguer vers `metier-ep.html` etc. — choisir l'archi en §6 et s'y tenir).
- **Compteurs** (Jeux / SAÉ / Pros) : animation count-up au scroll (IntersectionObserver). Brancher de vraies valeurs (ou valeurs de config centralisées), cohérentes avec le footer.
- **Modales** (pause syndicale, scores LNH/NBA, outils) : ouverture + **fermeture** (✕, clic overlay, Échap).
- **Boutons SÉRIES LNH / NBA** : ouvrir la modale **ou** lier vers `apps-nhl/` et `apps-nba/` (qui marchent). Ne pas laisser en `#`.
- **Formulaire d'inscription** : le brancher (Firebase/Newsletter existant) ou, à défaut, état « bientôt » honnête — pas de bouton mort.
- **Mot de passe d'aperçu** : OK de le garder pour la préprod, mais documenter que c'est une protection front-end seulement (non sécurisée).

---

## 5. Corriger l'audit — liens & éléments morts

Référence d'audit (à **vérifier dans le code**, le mockup pouvant évoluer) :
- **~30 liens `href="#"`** à corriger : barre du haut (Accueil, Ressources, Dons, profil), logo, colonnes du footer (POUR QUI / RESSOURCES / OUTILS / EXTRAS), « voir 150 autres jeux », « faire un don », sélecteur de langues.
- Chaque lien doit pointer vers : une vraie page du site, une app réelle, une ancre valide, ou être marqué **« Bientôt »** (état désactivé clair) — **jamais** un `#` mort.
- Corriger le retour « Accueil » des apps LNH/NBA (`../../` → chemin correct selon l'archi finale).
- **Definition of Done liens** : `grep` ne doit plus retourner aucun `href="#"` ni `href=""` ; tout bouton déclenche une action ou affiche un état « bientôt ».

---

## 6. Architecture des 3 métiers + intégration des apps existantes

### 6.1 Architecture proposée
- Home `index.html` = porte d'entrée avec les 3 cartes métier + sélecteur de langue.
- Un **hub par métier** : `ep.html`, `service-de-garde.html`, `camps-de-jour.html` (même gabarit), listant les apps pertinentes du métier en `.zts-app-card`.
- Dossier `/apps/<nom-app>/index.html` pour chaque app, toutes sur `app-template.html`.
- **Avant de coder les liens : confirmer les vraies URLs.** Récupérer la liste des 22 repos `ZoneTotalSport` + crawler `zonetotalsport.ca` pour mapper chaque app à son URL réelle (certaines sont des sous-domaines ou pages live, d'autres encore des `#`).

### 6.2 Mapping apps existantes → métier
URLs confirmées :
- Planificateur ÉPS — `https://zonetotalsport.ca/apps/planificateur/`
- Boîte à outils (transitions) — `https://zonetotalsport.ca/apps/transitions/`
- Tableau indicateur (scoreboard) — `https://zonetotalsport.ca/apps/scoreboard/`
- 90 cours maternelle — `https://zonetotalsport.ca/apps/cours-maternelle/`
- Aidons-nous (communauté) — `https://zonetotalsport.ca/aidons-nous/`
- Blog — `https://zonetotalsport.ca/blog.html`
- Répertoire mondial — `https://zonetotalsport.ca/repertoire.html`
- Avis & témoignages — `https://zonetotalsport.ca/avis.html`
- Ma Suppléance — `https://suppleance.zonetotalsport.ca`
- App Gym — `https://gym.zonetotalsport.ca`
- Séries LNH / NBA — `apps-nhl/`, `apps-nba/` (dans le repo)
- Portail apps GitHub — `jeuxsportifs/`, `sae/`, `musiques/` sous `zonetotalsport.github.io`

URLs **à confirmer** (souvent `#` sur le live) : Banque de jeux, SAÉ, Générateur de jeux IA, Générateur de SAÉ, Banque d'éducatifs, Intervention Groupe (PWA), Tableau blanc TNI, Grille horaire, Carnet de notes, Agenda, Musique.

Répartition par métier (une app peut apparaître dans plusieurs métiers) :
- **🏃 ÉP :** banque de jeux, SAÉ, générateurs IA, planificateur, boîte à outils, scoreboard, grille horaire, TNI, carnet de notes, agenda, 90 cours maternelle, Intervention Groupe, musique, répertoire, suppléance, éducatifs.
- **🧸 Service de garde :** banque de jeux (filtrée), musique, Intervention Groupe (SOS), boîte à outils (chrono/équipes/message), mini-outils + nouvelles apps SDG (§7).
- **🏕️ Camps de jour :** banque de jeux (grands jeux/plein air), musique, scoreboard (olympiades), mini-outils + nouvelles apps camp (§7).

---

## 7. Nouvelles apps à créer (toutes sur le gabarit commun, FR/EN)

> Spécs courtes; chaque app = page autonome, données en JSON local, filtrable, imprimable/TNI-friendly.

### 🧸 Service de garde
- **Jeux rapides** — banque filtrée < 5–10 min, sans matériel, par âge. Recherche + fiche.
- **Jeux calmes / retour au calme** — activités de transition et d'apaisement.
- **Plan B jours de pluie** — activités intérieures, grands groupes.
- **SOS conflits** — étapes de médiation rapides + scénarios fréquents.
- **Activités par durée** — filtre 15 / 30 / 60 min.
- **Journées pédagogiques** — bâtir une programmation de journée complète.
- **Bricolages sans préparation** — idées matériel minimal.
- **Roue de responsabilités / minuteur de routines** (collation, devoirs, jeu libre).

### 🏕️ Camps de jour
- **Chansons & cris de camp** — paroles + audio + filtres (énergie, thème). *(exemple demandé par le client)*
- **Grands jeux** — jeux grands groupes, fiches complètes.
- **Jeux par thème** — banque thématique (pirates, espace, etc.).
- **Brise-glace** — activités de présentation/début de semaine.
- **Rallyes / chasses au trésor** — modèles + générateur d'indices.
- **Activités de veillée / feu de camp**.
- **Jeux d'eau**.
- **Olympiades / tournois** — réutiliser le scoreboard + système de pointage inter-équipes.
- **Plan B météo** + **générateur de noms de clans**.

### 🏃 Éducation physique
- **Tabata / minuteur d'intervalles** (séries, repos, sons).
- **Rotation de stations/ateliers** (circuit + signal sonore).
- **Sonomètre visuel** (gestion du bruit au gym).
- **Sélecteur d'élèves + générateur d'équipes équilibrées**.
- **Fiches échauffement / retour au calme**.
- **Aide-mémoire premiers soins**.

### 💡 Transversal
- **Boîte à outils universelle** partagée par les 3 métiers : dé, roue, chrono, minuteur, générateur d'équipes, message du jour, sonomètre. Centraliser les mini-outils existants.

*La liste reste ouverte : le client veut en discuter/ajouter d'autres. Construire d'abord les exemples explicites (Chansons de camp, Jeux rapides) comme apps « modèles » qui valident le gabarit.*

---

## 8. Plan de livraison par phases

- **Phase 0 — Fondations :** design system (`zts.css`/`zts.js`), header/footer partagés, `app-template.html`, système i18n FR/EN. Migrer la home dessus.
- **Phase 1 — Home vivante :** corriger les ~30 liens, câbler les 3 CTA métier, modales, compteurs, formulaire. `grep` propre.
- **Phase 2 — Hubs métiers + intégration :** créer `ep.html` / `service-de-garde.html` / `camps-de-jour.html`, confirmer les URLs réelles, brancher toutes les apps existantes.
- **Phase 3 — Apps modèles :** construire **Chansons & cris de camp** et **Jeux rapides** sur le gabarit (preuve du design unifié), + Boîte à outils universelle.
- **Phase 4 — Nouvelles apps restantes** (§7), par lots.
- **Phase 5 — Bilingue complet des apps existantes** + QA finale (responsive, TNI, accessibilité, perf).

À la fin de chaque phase : commit clair + court résumé de ce qui a changé, pour validation.

---

## 9. Definition of Done (qualité)

- Aucune `href="#"` / `href=""` / bouton mort. Tout déclenche une action ou un état « Bientôt ».
- Home + toutes les apps utilisent le **même** `zts.css` / header / footer — zéro style en double, zéro valeur en dur.
- Toggle **FR/EN** fonctionne partout, choix mémorisé, aucune chaîne non traduite.
- Toutes les modales s'ouvrent **et se ferment** (✕, overlay, Échap).
- Responsive impeccable mobile / tablette / TNI; contraste AA; navigation clavier.
- Liens d'apps pointent vers des URLs **vérifiées**.
- Pas d'erreur console. Images optimisées.

## 10. Ne pas faire
- Ne pas introduire de framework lourd ni de build obligatoire.
- Ne pas casser `apps-nhl/` / `apps-nba/` (déjà fonctionnelles).
- Ne pas présenter le mot de passe d'aperçu comme une vraie sécurité.
- Ne pas inventer d'URL : si non confirmée, marquer « Bientôt » et le signaler.
- Ne pas styliser une app en solo : tout passe par le design system.
