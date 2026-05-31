/* Génère sdg.json — 200 jours (40 semaines × 5 jours), 2 blocs/jour (matin 7-9h, soir 15-18h).
   Compose à partir de banques d'activités qui tournent + thèmes saisonniers. node _generate-sdg.js */
const fs = require('fs');

const JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi'];

// Thème par bloc de semaines (saison scolaire québécoise, ~40 semaines sept→juin)
function theme(semaine){
  if(semaine<=4)  return {nom:'Rentrée & nouvelles amitiés', emo:'🍂'};
  if(semaine<=8)  return {nom:'Automne & couleurs', emo:'🍁'};
  if(semaine<=12) return {nom:'Vers l\'hiver', emo:'🧤'};
  if(semaine<=16) return {nom:'Fêtes & partage', emo:'🎁'};
  if(semaine<=21) return {nom:'Plein hiver', emo:'❄️'};
  if(semaine<=25) return {nom:'Carnaval & jeux de neige', emo:'⛄'};
  if(semaine<=30) return {nom:'Le printemps arrive', emo:'🌱'};
  if(semaine<=35) return {nom:'Nature & grand air', emo:'🌷'};
  return {nom:'Vers l\'été', emo:'☀️'};
}

// ---- Banques (qui tournent par index) ----
const ACCUEIL = [
  {nom:'Coin lecture',desc:'Livres et albums au choix, ambiance feutrée à l\'arrivée.',lieu:'local',materiel:['livres','coussins']},
  {nom:'Coin dessin libre',desc:'Feuilles et crayons; thème libre sur musique douce.',lieu:'local',materiel:['feuilles','crayons']},
  {nom:'Casse-têtes & société calmes',desc:'Tables de casse-têtes et petits jeux de société à l\'accueil.',lieu:'local',materiel:['casse-têtes','jeux de société']},
  {nom:'Coin construction',desc:'Blocs et briques; bâtir librement, seul ou à deux.',lieu:'local',materiel:['blocs']},
  {nom:'Pâte à modeler',desc:'Modelage libre aux tables, pour se centrer en douceur.',lieu:'local',materiel:['pâte à modeler']},
  {nom:'Coloriage thématique',desc:'Coloriages liés au thème de la semaine.',lieu:'local',materiel:['coloriages','crayons']},
  {nom:'Coin écoute',desc:'Histoire audio ou musique calme avec coussins.',lieu:'local',materiel:['enceinte']}
];
const CALME = [
  {nom:'Tour des humeurs',desc:'En cercle, chacun nomme son humeur du matin avec un geste.',lieu:'local',materiel:[]},
  {nom:'Devine le son',desc:'Yeux fermés, identifier les sons produits par l\'animateur.',lieu:'local',materiel:[]},
  {nom:'Le roi du silence',desc:'Avancer en silence pour toucher la chaise sans se faire repérer.',lieu:'local',materiel:['1 chaise']},
  {nom:'Memory géant',desc:'Cartes à retourner au sol, en équipes calmes.',lieu:'local',materiel:['cartes memory']},
  {nom:'Yoga des animaux',desc:'Postures douces (chat, arbre, cobra) tenues en respirant.',lieu:'local',materiel:['tapis']},
  {nom:'Histoire à rebondir',desc:'On construit une histoire, chacun ajoute une phrase.',lieu:'local',materiel:[]},
  {nom:'Téléphone arabe',desc:'Transmettre une phrase chuchotée jusqu\'au dernier.',lieu:'local',materiel:[]},
  {nom:'Dessin coopératif',desc:'Une grande fresque où chacun ajoute un élément.',lieu:'local',materiel:['grande feuille','crayons']}
];
const ACTIF_M = [
  {nom:'Statues musicales',desc:'On bouge, on fige au signal; doux réveil du corps.',lieu:'local',materiel:['musique']},
  {nom:'Jacques a dit',desc:'Mouvements guidés pour se dégourdir avant l\'école.',lieu:'local',materiel:[]},
  {nom:'Déplacements d\'animaux',desc:'Traverser le local en ours, crabe, grenouille.',lieu:'local',materiel:[]},
  {nom:'Parcours express',desc:'Mini-parcours coussins/cônes à enchaîner 2-3 fois.',lieu:'local',materiel:['coussins','cônes']},
  {nom:'Danse du matin',desc:'Courte chorégraphie simple à suivre ensemble.',lieu:'local',materiel:['musique']},
  {nom:'Chaises coopératives',desc:'Variante de la chaise musicale où l\'on s\'entraide.',lieu:'local',materiel:['chaises']}
];
const ACTIF_S = [
  {nom:'Poule, renard, vipère',desc:'Trois équipes se chassent en triangle dans la cour.',lieu:'cour',materiel:['dossards']},
  {nom:'Ballon-chasseur doux',desc:'Ballons mousse, élimination douce et retour rapide au jeu.',lieu:'cour',materiel:['ballons mousse']},
  {nom:'Capture du foulard',desc:'Voler le foulard du camp adverse sans se faire toucher.',lieu:'cour',materiel:['foulards','cônes']},
  {nom:'Grand jeu de course',desc:'Relais et courses variées par équipes.',lieu:'cour',materiel:['cônes']},
  {nom:'Soccer libre',desc:'Match amical encadré, équipes mixtes.',lieu:'cour',materiel:['ballon']},
  {nom:'Kickball',desc:'Croisement baseball-soccer, tout le monde frappe.',lieu:'cour',materiel:['ballon','buts']},
  {nom:'Parcours d\'obstacles',desc:'Circuit extérieur d\'adresse et d\'équilibre.',lieu:'cour',materiel:['cônes','cerceaux']},
  {nom:'Drapeau-défis',desc:'Capture du drapeau avec mini-épreuves aux stations.',lieu:'cour',materiel:['drapeaux','cônes']}
];
const ATELIER_S = [
  {nom:'Bricolage récup',desc:'Créer un objet libre à partir de matériel recyclé.',lieu:'local',materiel:['carton','colle','retailles']},
  {nom:'Atelier dessin',desc:'Dessin guidé ou libre lié au thème de la semaine.',lieu:'local',materiel:['feuilles','crayons']},
  {nom:'Jeux de société',desc:'Tournoi amical de jeux de plateau en petits groupes.',lieu:'local',materiel:['jeux de société']},
  {nom:'Coin construction libre',desc:'Défis de construction (la plus haute tour, un pont).',lieu:'local',materiel:['blocs']},
  {nom:'Atelier scientifique',desc:'Petite expérience simple et sécuritaire à observer.',lieu:'local',materiel:['matériel d\'expérience']},
  {nom:'Cuisine sans cuisson',desc:'Brochettes de fruits ou trempettes à préparer ensemble.',lieu:'local',materiel:['aliments','ustensiles']},
  {nom:'Lecture & BD',desc:'Coin lecture libre, albums et bandes dessinées.',lieu:'local',materiel:['livres']},
  {nom:'Aide aux devoirs',desc:'Temps calme encadré pour les devoirs, par niveau.',lieu:'local',materiel:['matériel scolaire']}
];
const RETOUR_M = [
  {nom:'Transition vers les classes',desc:'Rangement en chanson, rappel des consignes, départ calme au signal.',lieu:'local',materiel:[]},
  {nom:'File tranquille',desc:'On se met en rang en silence et on rejoint les classes.',lieu:'local',materiel:[]}
];
const DEPART_S = [
  {nom:'Départ échelonné',desc:'Coin calme près de la porte, jeu de société tranquille en attendant les parents.',lieu:'local',materiel:['jeux de société']},
  {nom:'Cercle de fin',desc:'Bilan de la journée et rangement avant le départ.',lieu:'local',materiel:[]}
];
function planPluie(actif){
  return {type:'plan_pluie',nom:'Plan B pluie',desc:`Si la cour est inaccessible : « ${actif.nom} » se fait au gymnase, ou parcours moteur et chaises coopératives en local.`,lieu:'gym',materiel:['tapis','coussins']};
}
const COLLATION = {type:'accueil',nom:'Collation & détente',desc:'Lavage des mains, collation et temps calme pour décompresser de l\'école.',lieu:'local',materiel:['collation']};

const pick = (a,i)=>a[((i%a.length)+a.length)%a.length];

const days = [];
for(let j=0;j<200;j++){
  const semaine = Math.floor(j/5)+1;
  const jourSem = j%5;
  const th = theme(semaine);
  const acc = pick(ACCUEIL, j);
  const cal = pick(CALME, j*2+1);
  const actM = pick(ACTIF_M, j+jourSem);
  const retM = pick(RETOUR_M, j);
  const actS = pick(ACTIF_S, j*3+2);
  const ate = pick(ATELIER_S, j*2);
  const dep = pick(DEPART_S, j);
  days.push({
    jour: j+1, semaine, jourSem: jourSem+1,
    label: `Semaine ${semaine} · ${JOURS[jourSem]}`,
    theme: `${th.emo} ${th.nom}`,
    blocs: {
      matin: { plage:'7 h 00 – 9 h 00', items:[
        {type:'accueil', ...acc},
        {type:'jeu_calme', ...cal},
        {type:'jeu_actif', ...actM},
        planPluie(actM),
        {type:'retour', ...retM}
      ]},
      aprem: { plage:'15 h 00 – 18 h 00', items:[
        COLLATION,
        {type:'jeu_actif', ...actS},
        {type:'jeu_calme', ...ate},
        planPluie(actS),
        {type:'retour', ...dep}
      ]}
    },
    tags:{ age:['5-12'], lieu:['local','cour','gym'], moment:'matin', contexte:['plan_pluie'] }
  });
}
fs.writeFileSync(__dirname+'/sdg.json', JSON.stringify(days));
console.log('sdg.json écrit :', days.length, 'jours,', JSON.stringify(days).length, 'octets');
