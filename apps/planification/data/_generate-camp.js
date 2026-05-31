/* Génère camp.json — 7 semaines thématiques × 3 groupes d'âge (5-7/8-10/11-12) × 7 blocs/jour (9h-16h).
   node _generate-camp.js */
const fs = require('fs');

const HEURES = [
  {heure:'9 h 00', plage:'9 h 00 – 9 h 30',  slot:'arrivee'},
  {heure:'9 h 30', plage:'9 h 30 – 10 h 45', slot:'am1'},
  {heure:'10 h 45',plage:'10 h 45 – 12 h 00',slot:'am2'},
  {heure:'12 h 00',plage:'12 h 00 – 13 h 00',slot:'diner'},
  {heure:'13 h 00',plage:'13 h 00 – 14 h 30',slot:'pm1'},
  {heure:'14 h 30',plage:'14 h 30 – 15 h 30',slot:'pm2'},
  {heure:'15 h 30',plage:'15 h 30 – 16 h 00',slot:'depart'}
];

// Pour chaque thème : blocs partagés + grands jeux déclinés par âge (am1, pm1)
const THEMES = [
  { semaine:1, theme:'Pirates & chasse au trésor', couleur:'#ff6b00',
    planB:'Pluie : abordage au gymnase (capture du trésor, parcours pirates). Canicule : jeux d\'eau l\'après-midi, ombre le matin.',
    arrivee:{nom:'Embarquement',desc:'Chanson des pirates, code du bateau, présentation de la journée.',mat:['foulards']},
    am2:{nom:'Atelier carte au trésor',desc:'Chaque enfant crée sa carte au trésor vieillie.',lieu:'local',e:'calme',mat:['papier','crayons']},
    pm2:{nom:'Danse du perroquet',desc:'Jeux musicaux et statues sur le thème, retour graduel au calme.',lieu:'local',e:'moyen',mat:['musique']},
    am1:{nom:'À l\'abordage!','5-7':'Voler le trésor (foulards) du navire adverse, zones-refuge généreuses.','8-10':'Bataille navale : capture du drapeau avec prison et trésors multiples.','11-12':'Conquête des îles : capturer et défendre des zones avec ressources limitées.',mat:['foulards','cônes']},
    pm1:{nom:'La piste du trésor','5-7':'Jeu de piste avec indices imagés jusqu\'au coffre.','8-10':'Rallye des 7 mers : énigmes et épreuves d\'adresse pour des pièces d\'or.','11-12':'Grand rallye codé : déchiffrer un message pour trouver le trésor légendaire.',mat:['indices','coffre']} },
  { semaine:2, theme:'Mission espace', couleur:'#5b6cff',
    planB:'Pluie : station spatiale au gymnase (parcours apesanteur). Canicule : observation et ateliers à l\'ombre, jeux d\'eau « météorites ».',
    arrivee:{nom:'Briefing de mission',desc:'Compte à rebours, noms d\'équipages d\'astronautes, plan de la journée.',mat:['badges']},
    am2:{nom:'Construis ta fusée',desc:'Fabrication d\'une fusée en récup, décollage symbolique.',lieu:'local',e:'moyen',mat:['carton','rouleaux']},
    pm2:{nom:'Danse des planètes',desc:'Rondes et statues cosmiques, retour au calme « gravité zéro ».',lieu:'local',e:'moyen',mat:['musique']},
    am1:{nom:'Pluie de météorites','5-7':'Esquiver les ballons mousse pour protéger la base.','8-10':'Défense de la station : esquive + récupération de cristaux d\'énergie.','11-12':'Guerre des galaxies : stratégie d\'attaque/défense de plusieurs bases.',mat:['ballons mousse','cônes']},
    pm1:{nom:'Exploration galactique','5-7':'Chasse aux étoiles cachées dans la cour.','8-10':'Rallye des planètes : épreuves à chaque station-planète.','11-12':'Mission Mars : parcours d\'obstacles chronométré en équipe.',mat:['étoiles','stations']} },
  { semaine:3, theme:'Chevaliers & château fort', couleur:'#a06a3c',
    planB:'Pluie : tournoi au gymnase (joutes molles, parcours). Canicule : ateliers à l\'ombre, douves d\'eau l\'après-midi.',
    arrivee:{nom:'Adoubement',desc:'Formation des royaumes, blasons d\'équipe, serment du jour.',mat:['blasons']},
    am2:{nom:'Atelier blason & épée',desc:'Créer son blason et une épée en mousse/carton.',lieu:'local',e:'moyen',mat:['carton','couleurs']},
    pm2:{nom:'Bal du château',desc:'Danses médiévales simples, retour au calme au son du luth.',lieu:'local',e:'moyen',mat:['musique']},
    am1:{nom:'Le siège du château','5-7':'Protéger le drapeau du château contre les attaquants doux.','8-10':'Attaque et défense du château en 3 manches, rôles inversés.','11-12':'Guerre des royaumes : conquête de territoires et ressources.',mat:['drapeaux','cônes']},
    pm1:{nom:'La quête du dragon','5-7':'Suivre les indices pour réveiller le gentil dragon.','8-10':'Rallye-épreuves de chevalerie (force, adresse, énigme).','11-12':'Grande quête : déjouer les pièges et libérer le royaume.',mat:['indices','stations']} },
  { semaine:4, theme:'Safari dans la jungle', couleur:'#2faa5d',
    planB:'Pluie : jungle au gymnase (lianes-cordes, parcours). Canicule : point d\'eau « rivière », ateliers ombragés.',
    arrivee:{nom:'Réveil de la jungle',desc:'Cris d\'animaux, équipes-tribus, carte de l\'expédition.',mat:[]},
    am2:{nom:'Masques d\'animaux',desc:'Fabriquer un masque de l\'animal de son équipe.',lieu:'local',e:'moyen',mat:['carton','élastiques']},
    pm2:{nom:'Danse tribale',desc:'Rythmes et percussions corporelles, retour au calme « coucher de soleil ».',lieu:'local',e:'moyen',mat:['percussions']},
    am1:{nom:'Chasse photo','5-7':'Repérer et imiter les moniteurs-animaux cachés.','8-10':'Safari à stations : trouver et « photographier » tous les animaux.','11-12':'Expédition : explorer la jungle, éviter les prédateurs-tagueurs.',mat:['cartes animaux']},
    pm1:{nom:'De liane en liane','5-7':'Traverser la rivière en marchant dans les cerceaux.','8-10':'Parcours de la jungle : grimper, ramper, équilibrer en équipe.','11-12':'Course de survie : franchir les obstacles sans toucher le « sol-lave ».',mat:['cerceaux','tapis']} },
  { semaine:5, theme:'Académie des super-héros', couleur:'#e83b5a',
    planB:'Pluie : entraînement de héros au gymnase. Canicule : « pouvoirs d\'eau », ateliers à l\'ombre.',
    arrivee:{nom:'Recrutement des héros',desc:'Choix d\'un super-pouvoir et d\'un nom de héros, mission du jour.',mat:['capes (foulards)']},
    am2:{nom:'Crée ton emblème',desc:'Dessiner son logo de héros et un masque.',lieu:'local',e:'moyen',mat:['feuilles','couleurs']},
    pm2:{nom:'Pose de héros',desc:'Jeu de statues héroïques et mime de pouvoirs, retour au calme.',lieu:'local',e:'moyen',mat:['musique']},
    am1:{nom:'Entraînement de héros','5-7':'Parcours d\'agilité pour gagner ses pouvoirs.','8-10':'Académie : circuit d\'épreuves de force, vitesse et précision.','11-12':'Mission d\'équipe : sauver la ville en relevant des défis chronométrés.',mat:['cônes','cerceaux']},
    pm1:{nom:'Capture du super-vilain','5-7':'Attraper doucement le vilain qui se sauve.','8-10':'Traque en équipe du vilain à travers des zones.','11-12':'Grand affrontement héros/vilains : capture du drapeau thématique.',mat:['dossards','foulards']} },
  { semaine:6, theme:'Labo des sciences folles', couleur:'#8e44d6',
    planB:'Pluie : labo au gymnase (défis physiques). Canicule : expériences d\'eau, ateliers ombragés.',
    arrivee:{nom:'Blouse de savant',desc:'Équipes de laboratoire, mission scientifique du jour.',mat:[]},
    am2:{nom:'Expérience surprise',desc:'Petite expérience sécuritaire (volcan, slime, bulles géantes).',lieu:'local',e:'calme',mat:['matériel d\'expérience']},
    pm2:{nom:'Énigmes du savant',desc:'Défis logiques et devinettes en équipe, retour au calme.',lieu:'local',e:'calme',mat:['fiches']},
    am1:{nom:'Réaction en chaîne','5-7':'Relais où l\'on transporte des « éprouvettes » sans renverser.','8-10':'Défi labo : stations d\'expériences-épreuves à réussir en équipe.','11-12':'Mission décontamination : parcours stratégique contre le chrono.',mat:['gobelets','cônes']},
    pm1:{nom:'Chasse aux éléments','5-7':'Trouver les ingrédients colorés cachés dans la cour.','8-10':'Rallye scientifique : indices et énigmes à résoudre.','11-12':'Enquête : collecter des preuves et déduire la formule secrète.',mat:['indices','fioles']} },
  { semaine:7, theme:'Grandes olympiades', couleur:'#f2b705',
    planB:'Pluie : olympiades au gymnase (épreuves intérieures). Canicule : épreuves d\'eau, pauses fréquentes à l\'ombre.',
    arrivee:{nom:'Cérémonie d\'ouverture',desc:'Défilé des équipes-pays, flamme symbolique, hymne du camp.',mat:['fanions']},
    am2:{nom:'Médailles & bannières',desc:'Fabriquer médailles et bannières d\'équipe pour la semaine.',lieu:'local',e:'moyen',mat:['carton','rubans']},
    pm2:{nom:'Cérémonie & remise',desc:'Remise de médailles, photo d\'équipe, retour au calme festif.',lieu:'local',e:'moyen',mat:['médailles']},
    am1:{nom:'Épreuves d\'athlétisme','5-7':'Mini-épreuves : course, saut, lancer adaptés.','8-10':'Pentathlon : 5 épreuves d\'athlétisme avec pointage.','11-12':'Décathlon junior : épreuves variées et classement inter-équipes.',mat:['cônes','sacs de sable']},
    pm1:{nom:'Tournois coopératifs','5-7':'Jeux d\'équipe sans élimination (parachute, ballon).','8-10':'Tournoi à la ronde de grands jeux (kickball, drapeau).','11-12':'Grand tournoi stratégique avec pointage cumulatif.',mat:['ballons','dossards']} },
];

const AGES = ['5-7','8-10','11-12'];
function blocksFor(t, age){
  return [
    {heure:'9 h 00', plage:'9 h 00 – 9 h 30',  nom:'Arrivée — '+t.arrivee.nom, desc:t.arrivee.desc, lieu:'local', energie:'calme', materiel:t.arrivee.mat},
    {heure:'9 h 30', plage:'9 h 30 – 10 h 45', nom:'Avant-midi 1 — '+t.am1.nom, desc:t.am1[age], lieu:'cour', energie:'defoulement', materiel:t.am1.mat},
    {heure:'10 h 45',plage:'10 h 45 – 12 h 00',nom:'Avant-midi 2 — '+t.am2.nom, desc:t.am2.desc, lieu:t.am2.lieu, energie:t.am2.e, materiel:t.am2.mat},
    {heure:'12 h 00',plage:'12 h 00 – 13 h 00',nom:'Dîner', desc:'Repas puis jeu calme ou histoire sur le thème de la semaine.', lieu:'local', energie:'calme', materiel:[]},
    {heure:'13 h 00',plage:'13 h 00 – 14 h 30',nom:'Après-midi 1 — '+t.pm1.nom, desc:t.pm1[age], lieu:'cour', energie:'moyen', materiel:t.pm1.mat},
    {heure:'14 h 30',plage:'14 h 30 – 15 h 30',nom:'Après-midi 2 — '+t.pm2.nom, desc:t.pm2.desc, lieu:t.pm2.lieu, energie:t.pm2.e, materiel:t.pm2.mat},
    {heure:'15 h 30',plage:'15 h 30 – 16 h 00',nom:'Départ', desc:'Cercle de fin (moment préféré du jour), rangement et préparation au départ.', lieu:'local', energie:'calme', materiel:[]}
  ];
}
const weeks = THEMES.map(t=>({
  semaine:t.semaine, theme:t.theme, couleur:t.couleur, plan_b_meteo:t.planB,
  groupes:{ '5-7':{blocs:blocksFor(t,'5-7')}, '8-10':{blocs:blocksFor(t,'8-10')}, '11-12':{blocs:blocksFor(t,'11-12')} },
  tags:{ age:AGES, lieu:['cour','local','parc'], energie:'defoulement', moment:'matin', contexte:['theme','plan_meteo'] }
}));
fs.writeFileSync(__dirname+'/camp.json', JSON.stringify(weeks));
console.log('camp.json :', weeks.length, 'semaines ×', AGES.length, 'groupes ×', weeks[0].groupes['5-7'].blocs.length, 'blocs');
