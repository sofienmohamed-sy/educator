import type { Subject } from "./types";

/**
 * A topic entry in the curriculum catalog.
 *
 *   label   — short chapter name shown in the dropdown.
 *   limits  — optional scope description fed to the AI in the topic value
 *             (after an em-dash separator). Use this to spell out exactly
 *             what's in/out of the program for the chosen section so the
 *             AI doesn't generate exercises beyond the syllabus.
 */
export interface TopicEntry {
  label: string;
  limits: string;
}
export type Topic = string | TopicEntry;

/**
 * Curriculum topic catalog: country × subject × grade level [× section] → ordered list.
 *
 * Lookup precedence (handled by `topicsFor`):
 *   1. `${COUNTRY}_${subject}_${level}_${section}` — section-specific (preferred)
 *   2. `${COUNTRY}_${subject}_${level}`           — level default (any section)
 *   3. `${COUNTRY}_${subject}`                    — country/subject default
 *   4. `[]`                                       — caller falls back to free-text
 *
 * Entries may be either plain strings (legacy, no scope description) or
 * `TopicEntry` objects with explicit program-limit descriptions. The picker
 * appends the `limits` string to the option value so the AI receives the
 * scope context along with the chapter name.
 *
 * Topics are listed in the order chapters typically appear in the country's
 * official syllabus so the dropdown reads as a table of contents.
 */
const TOPICS: Record<string, Topic[]> = {
  // ── FRANCE ────────────────────────────────────────────────────────────────
  // Spécialité Mathématiques (BO 2019) — programme commun à toute Terminale
  // qui conserve la spé maths. Pas de nombres complexes ni d'arithmétique :
  // ces blocs sont en option Maths Expertes uniquement.
  "FR_math_Terminale_Spécialité Maths": [
    {
      label: "Suites numériques",
      limits:
        "Convergence, limite finie ou infinie ; suites monotones bornées ; suites définies par récurrence (preuve de convergence par limite de la fonction associée). Démonstration par récurrence. PAS les suites complexes, PAS les suites de Cauchy.",
    },
    {
      label: "Limites de fonctions",
      limits:
        "Limites en l'infini et en un point, opérations sur les limites, formes indéterminées ; limites comparées (e^x vs x^n, ln x vs x^n) ; théorèmes de comparaison et des gendarmes. PAS de développements limités.",
    },
    {
      label: "Continuité",
      limits:
        "Continuité d'une fonction sur un intervalle, continuité d'une composée ; TVI et corollaire (existence d'une solution unique pour une fonction strictement monotone). PAS le théorème de Heine.",
    },
    {
      label: "Compléments sur la dérivation",
      limits:
        "Dérivée d'une fonction composée (chain rule) ; dérivée des fonctions x → f(ax+b), e^(u(x)), ln(u(x)), u(x)^n. PAS la formule de Leibniz d'ordre supérieur.",
    },
    {
      label: "Convexité",
      limits:
        "Définition par les sécantes et par f'' ≥ 0 ; tangente toujours en-dessous (ou au-dessus) ; point d'inflexion (changement de concavité, équivalent à f''=0 avec changement de signe).",
    },
    {
      label: "Fonction logarithme népérien",
      limits:
        "ln x : définition comme primitive de 1/x, propriétés algébriques, dérivée, limites usuelles (lim x→+∞ ln x/x = 0) ; études de fonctions composées avec ln.",
    },
    {
      label: "Fonction exponentielle",
      limits:
        "e^x : définition comme solution de y' = y avec y(0)=1, propriétés algébriques, dérivée, limites usuelles ; études de fonctions x → e^(u(x)).",
    },
    {
      label: "Primitives et intégration",
      limits:
        "Primitives usuelles, théorème fondamental du calcul intégral ; intégration par parties ; calcul d'aires sous une courbe et entre deux courbes, valeur moyenne. PAS le changement de variable formel en Spé Maths seule.",
    },
    {
      label: "Équations différentielles",
      limits:
        "y' = ay (croissance/décroissance exponentielle) ; y' = ay + b (équilibre asymptotique) ; PAS d'équations du second ordre (réservées à la prépa), PAS de second membre non constant.",
    },
    {
      label: "Probabilités conditionnelles",
      limits:
        "P(A|B) = P(A∩B)/P(B), formule des probabilités totales ; arbres pondérés ; indépendance ; formule de Bayes (cas simples).",
    },
    {
      label: "Variables aléatoires (espérance, variance)",
      limits:
        "Variables aléatoires discrètes : loi de probabilité, espérance, variance, écart-type ; somme de variables (linéarité de l'espérance), variance d'une somme de variables INDÉPENDANTES.",
    },
    {
      label: "Loi binomiale",
      limits:
        "Schéma de Bernoulli, coefficients binomiaux ; loi binomiale B(n,p), espérance np, variance np(1-p) ; calcul de probabilités cumulées (à la calculatrice ou Python).",
    },
    {
      label: "Loi des grands nombres",
      limits:
        "Inégalité de Bienaymé-Tchebychev (au programme depuis 2020) ; loi faible des grands nombres : la moyenne de n variables iid converge en probabilité vers l'espérance.",
    },
    {
      label: "Combinatoire et dénombrement",
      limits:
        "Cardinal d'un produit cartésien, k-uplets, k-uplets distincts (arrangements), parties à k éléments (combinaisons) ; formule du binôme de Newton et triangle de Pascal.",
    },
    {
      label: "Vecteurs et géométrie dans l'espace",
      limits:
        "Combinaisons linéaires, vecteurs colinéaires/coplanaires ; représentations paramétriques de droites et plans ; positions relatives. PAS d'espaces vectoriels formels.",
    },
    {
      label: "Produit scalaire dans l'espace",
      limits:
        "Définition et propriétés, expression analytique en base orthonormée ; vecteur normal à un plan, équation cartésienne d'un plan ; distance d'un point à un plan, projeté orthogonal.",
    },
    {
      label: "Algorithmique et programmation (Python)",
      limits:
        "Implémentation Python de suites récurrentes, méthode de dichotomie, méthode de Newton (introduction), simulation de variables aléatoires (random.random()), seuils et listes. PAS de bibliothèques numpy/scipy avancées.",
    },
  ],

  // Maths Expertes (option, 3h/semaine) — vient EN PLUS de la Spé Maths,
  // pas à la place. Ajoute complexes, arithmétique avec Fermat, et graphes.
  "FR_math_Terminale_Maths Expertes (option)": [
    {
      label: "Nombres complexes — formes et opérations",
      limits:
        "Formes algébrique, trigonométrique ET exponentielle (formule d'Euler) ; opérations, conjugué, module, argument ; formule de Moivre ; linéarisation de cos^n(x) et sin^n(x) ; PAS la fonction de variable complexe.",
    },
    {
      label: "Équations dans ℂ et racines nèmes",
      limits:
        "Résolution du second degré à coefficients réels ou complexes ; racines nèmes de l'unité (n petit, configuration géométrique en n-gone régulier) ; racines nèmes d'un complexe quelconque.",
    },
    {
      label: "Géométrie complexe (similitudes)",
      limits:
        "Interprétation géométrique de z → az+b : translation, rotation, homothétie, similitude directe (centre, rapport, angle) ; alignement et orthogonalité via affixes ; PAS les similitudes indirectes (z → az̄+b) au programme expertes standard.",
    },
    {
      label: "Arithmétique : divisibilité et PGCD",
      limits:
        "Divisibilité dans ℤ, division euclidienne ; PGCD par algorithme d'Euclide et algorithme d'Euclide étendu ; nombres premiers entre eux ; décomposition en produit de facteurs premiers (existence et unicité).",
    },
    {
      label: "Théorèmes de Bézout, Gauss, Fermat",
      limits:
        "Identité de Bézout (et résolution d'équations diophantiennes ax+by=c) ; lemme de Gauss ; petit théorème de Fermat (a^p ≡ a [p] pour p premier) ET sa réciproque partielle ; INCLUS au programme Maths Expertes (contrairement à la Spé Maths seule).",
    },
    {
      label: "Congruences modulo n",
      limits:
        "Définition, opérations compatibles, classes de congruence ; résolution d'équations ax ≡ b [n] via Bézout ; applications au calendrier, aux clés de contrôle, à la cryptographie RSA (notion).",
    },
    {
      label: "Graphes et matrices",
      limits:
        "Graphes simples non-orientés et orientés ; ordre, degré, chaîne, cycle, connexité ; matrice d'adjacence ; nombre de chemins de longueur k via M^k ; introduction à la coloration. PAS de Dijkstra (ça relève de la spécialité NSI).",
    },
    {
      label: "Matrices et systèmes linéaires",
      limits:
        "Matrices carrées, opérations (somme, produit, puissance) ; matrice inverse de petites matrices (2×2, 3×3 simples) ; résolution de systèmes par méthode matricielle ou Gauss ; suites couplées via diagonalisation simple. PAS la théorie spectrale formelle.",
    },
  ],

  // Maths Complémentaires (option, 3h/semaine) — pour les élèves qui
  // ont abandonné la Spé Maths en fin de Première mais souhaitent
  // garder un volume de maths léger en Terminale (typiquement filière
  // SVT, économie, ou orientations post-bac non-scientifiques).
  "FR_math_Terminale_Maths Complémentaires (option)": [
    {
      label: "Suites et récurrences",
      limits:
        "Suites arithmétiques et géométriques (rappels), suite définie par récurrence (étude graphique avec le « bissecteur ») ; convergence et limites simples. PAS de démonstration formelle par récurrence.",
    },
    {
      label: "Fonctions : dérivation et étude",
      limits:
        "Dérivée des fonctions usuelles, dérivée d'une somme/produit/quotient ; tableau de variations, extremums ; PAS la composition formelle (chain rule absent du programme Complémentaires).",
    },
    {
      label: "Fonction logarithme népérien",
      limits:
        "ln x : propriétés, dérivée, courbe, applications à des modèles concrets (croissance, décibels, pH). Sans technique d'analyse avancée.",
    },
    {
      label: "Fonction exponentielle",
      limits:
        "e^x : propriétés, dérivée, courbe, modèles d'évolution exponentielle ; lien y' = ay (notion de croissance proportionnelle). Sans équation différentielle formelle.",
    },
    {
      label: "Primitives et calcul d'aire",
      limits:
        "Primitives des fonctions usuelles ; intégrale comme aire sous la courbe, valeur moyenne, application au calcul de probabilités à densité. PAS d'intégration par parties.",
    },
    {
      label: "Modèles d'évolution",
      limits:
        "Modèle linéaire, exponentiel, logarithmique, logistique (descriptif) ; ajustement de données expérimentales, choix du modèle adapté.",
    },
    {
      label: "Variables aléatoires et lois usuelles",
      limits:
        "Variables aléatoires discrètes, espérance ; loi binomiale (rappels) ; introduction à la loi normale et à l'approximation d'une binomiale par une loi normale.",
    },
    {
      label: "Intervalle de confiance",
      limits:
        "Intervalle de confiance d'une proportion à 95% (formule p ± 1/√n) ; estimation et prise de décision en contexte appliqué. PAS la théorie statistique formelle.",
    },
    {
      label: "Algorithmique (Python)",
      limits:
        "Programmes simples : suites, dichotomie, simulation de variables aléatoires ; lecture/exécution d'algorithmes plutôt que conception complexe.",
    },
  ],
  // Generic fallback FR Terminale (no section selected).
  "FR_math_Terminale": [
    "Suites numériques (limites, monotonie)",
    "Limites de fonctions",
    "Continuité",
    "Compléments sur la dérivation",
    "Convexité",
    "Fonction logarithme népérien",
    "Fonction exponentielle",
    "Primitives et intégration",
    "Vecteurs et géométrie dans l'espace",
    "Produit scalaire dans l'espace",
    "Probabilités conditionnelles",
    "Variables aléatoires (espérance, variance)",
    "Loi binomiale",
    "Loi des grands nombres",
    "Combinatoire et dénombrement",
    "Algorithmique (Python)",
  ],
  "FR_math_Première": [
    "Second degré",
    "Suites arithmétiques et géométriques",
    "Dérivation",
    "Variations et extremums",
    "Fonctions trigonométriques",
    "Fonction exponentielle (introduction)",
    "Géométrie repérée",
    "Produit scalaire dans le plan",
    "Probabilités conditionnelles",
    "Variables aléatoires",
    "Loi binomiale (introduction)",
  ],
  // Spécialité Physique-Chimie Terminale (BO 2019). La même clé est
  // utilisée pour la section « Spécialité Physique-Chimie ». Le
  // fallback générique reste pour les sessions sans spé sélectionnée.
  "FR_physics_Terminale_Spécialité Physique-Chimie": [
    {
      label: "Mouvements et lois de Newton",
      limits:
        "Référentiel galiléen, 1ère/2ème/3ème lois de Newton ; vecteur position, vitesse, accélération ; PFD vectoriel : ΣF = m·a. PAS le repère de Frenet en spé Physique-Chimie standard.",
    },
    {
      label: "Mouvements dans un champ de pesanteur uniforme",
      limits:
        "Projectile : équations horaires, trajectoire parabolique, portée, flèche, durée ; champ g uniforme avec g ≈ 9,81 m/s² (parfois 10) ; influence des conditions initiales. Frottements négligés.",
    },
    {
      label: "Mouvements dans un champ électrique uniforme",
      limits:
        "Particule chargée entre plaques parallèles, champ E uniforme = U/d ; déviation, gain d'énergie cinétique qU = ½mv². Application à l'oscilloscope cathodique et accélérateurs simples.",
    },
    {
      label: "Aspects énergétiques (travail, énergie)",
      limits:
        "Travail d'une force constante, théorème de l'énergie cinétique ; énergie potentielle de pesanteur Ep = mgz, énergie mécanique Em = Ec + Ep ; conservation et variation de Em (forces non conservatives).",
    },
    {
      label: "Mouvement d'un satellite, lois de Kepler",
      limits:
        "3 lois de Kepler (orbites elliptiques, loi des aires, T² ∝ a³) ; mouvement circulaire uniforme : v² = GM/r, T² = 4π²r³/(GM) ; satellite géostationnaire. PAS d'orbites elliptiques en calcul détaillé.",
    },
    {
      label: "Ondes mécaniques progressives",
      limits:
        "Onde transversale et longitudinale, célérité, retard ; longueur d'onde λ, fréquence f, période T ; relation λ = c·T = c/f. Application : corde, surface d'eau, sons.",
    },
    {
      label: "Effet Doppler",
      limits:
        "Décalage en fréquence d'une source en mouvement par rapport à l'observateur ; cas non-relativiste : f' = f·(c±v_obs)/(c∓v_src) ; applications : radar, astronomie (mesure de vitesse radiale d'étoiles).",
    },
    {
      label: "Interférences et diffraction",
      limits:
        "Interférences à 2 sources cohérentes (fentes d'Young) : interfrange i = λD/a, conditions de cohérence ; diffraction par fente : θ = λ/a (ordre 0). Caractère ondulatoire mis en évidence.",
    },
    {
      label: "Lumière : modèle ondulatoire et particulaire",
      limits:
        "Dualité onde-corpuscule ; photon d'énergie E = hν = hc/λ ; effet photoélectrique : seuil ν₀ = W₀/h, équation de conservation hν = W₀ + Ec ; spectre d'émission/absorption.",
    },
    {
      label: "Niveaux d'énergie atomique, lasers",
      limits:
        "Quantification de l'énergie, transitions En → Em avec hν = |En - Em| ; émission spontanée, stimulée ; principe du laser (inversion de population, cavité). PAS de calculs quantiques formels.",
    },
    {
      label: "Décroissance radioactive",
      limits:
        "Loi de décroissance N(t) = N₀·e^(-λt) ; demi-vie t₁/₂ = ln 2 / λ ; activité A = λN ; types α, β⁻, β⁺, γ ; conservation du nombre de masse et de charge.",
    },
    {
      label: "Énergie de liaison nucléaire",
      limits:
        "Défaut de masse Δm, équivalence E = Δm·c² ; énergie de liaison par nucléon ; courbe d'Aston, fission et fusion ; bilan énergétique de réactions nucléaires.",
    },
    {
      label: "Bilans énergétiques (système thermodynamique)",
      limits:
        "Énergie interne U, transferts thermiques Q et travail W ; 1er principe ΔU = Q + W ; modes de transfert (conduction, convection, rayonnement, loi de Stefan-Boltzmann pour le rayonnement). PAS le 2nd principe au programme.",
    },
  ],
  "FR_physics_Terminale": [
    "Mouvements et lois de Newton",
    "Mouvements dans un champ uniforme (gravitation, électrique)",
    "Aspects énergétiques (cinétique, potentielle, mécanique)",
    "Mouvement d'un satellite, lois de Kepler",
    "Ondes mécaniques progressives",
    "Effet Doppler",
    "Interférences et diffraction",
    "Modèle ondulatoire de la lumière",
    "Modèle particulaire — effet photoélectrique",
    "Niveaux d'énergie atomique, lasers",
    "Décroissance radioactive",
    "Désintégrations nucléaires, énergie de liaison",
    "Évolution d'un système — bilans énergétiques",
  ],
  "FR_chemistry_Terminale_Spécialité Physique-Chimie": [
    {
      label: "Cinétique chimique",
      limits:
        "Vitesse volumique de réaction, facteurs cinétiques (concentration, T, catalyseur) ; loi de vitesse d'ordre 1 (parfois 0) avec décroissance exponentielle de la concentration ; temps de demi-réaction t₁/₂ = ln 2 / k. PAS la loi d'Arrhenius formelle k = A·e^(-Ea/RT) en spé standard (présente en CPGE).",
    },
    {
      label: "Réactions acide-base, pH, Ke",
      limits:
        "Couple acide/base, autoprotolyse de l'eau Ke = [H₃O⁺][HO⁻] = 10⁻¹⁴ à 25°C ; pH = -log[H₃O⁺] ; solutions acides, basiques, neutres. PAS les diagrammes E-pH.",
    },
    {
      label: "Constantes d'acidité Ka et diagrammes",
      limits:
        "Force des acides/bases : Ka, pKa = -log Ka ; diagramme de prédominance et de distribution ; pH d'un acide faible (formule pH = ½(pKa - log Ca) avec hypothèses).",
    },
    {
      label: "Réactions d'oxydoréduction",
      limits:
        "Couple Ox/Red, demi-équations, équilibrage en milieu acide ou basique ; échelle qualitative des potentiels standard E° (sans calcul de Nernst formel).",
    },
    {
      label: "Pile et électrolyse",
      limits:
        "Pile : anode/cathode, fem, sens spontané ; pile Daniell ; électrolyse : produit imposé, loi de Faraday Q = It = nF·z. PAS la pile à combustible quantitative.",
    },
    {
      label: "Solubilité, produit de solubilité Ks",
      limits:
        "Équilibre de précipitation/dissolution ; Ks et solubilité s ; effet d'ion commun. Calculs sur sels peu solubles (AgCl, CaF₂, BaSO₄).",
    },
    {
      label: "Mécanismes réactionnels (flèches courbes)",
      limits:
        "Sites donneurs/accepteurs de doublets, polarité de liaison ; flèches courbes représentant le mouvement des doublets ; étapes élémentaires (substitution, addition, élimination). PAS de calculs orbitalaires.",
    },
    {
      label: "Stéréoisomérie (chiralité, énantiomères)",
      limits:
        "Carbone asymétrique, configurations R/S (notion), énantiomères et diastéréoisomères ; mélange racémique, activité optique (sens et loi de Biot qualitative).",
    },
    {
      label: "Spectroscopie IR et RMN",
      limits:
        "IR : bandes caractéristiques (O-H, N-H, C=O, C-O…) sur table de référence ; RMN ¹H : déplacement chimique δ, multiplicité (n+1), intégration. PAS la RMN ¹³C ni la spectrométrie de masse au programme spé PC standard.",
    },
    {
      label: "Synthèse organique",
      limits:
        "Stratégie de synthèse : protection/déprotection (notion), sélectivité (chimio-, régio-, stéréo-) ; rendement et économie d'atomes ; étapes multiples avec analyse rétrosynthétique simple. PAS la synthèse asymétrique catalytique.",
    },
    {
      label: "Dosages par titrage",
      limits:
        "Titrage acide-base suivi par pH-métrie ou colorimétrie ; détermination de l'équivalence ; titrage redox (permanganate, iode-thiosulfate) ; titrage conductimétrique.",
    },
  ],
  "FR_chemistry_Terminale": [
    "Réactions acide-base, pH, Ke",
    "Constantes d'acidité Ka et diagrammes",
    "Réactions d'oxydoréduction",
    "Pile et électrolyse",
    "Solubilité, produit de solubilité Ks",
    "Cinétique chimique (vitesse, ordre, loi d'Arrhenius)",
    "Mécanismes réactionnels (flèches courbes)",
    "Stéréoisomérie (chiralité, énantiomères)",
    "Spectroscopie IR et RMN",
    "Synthèse organique multi-étapes",
    "Dosages par titrage (acide-base, redox)",
  ],
  // Spécialité NSI Terminale (BO 2019) — la seule spé informatique du
  // lycée français. La même clé est référencée comme « Spécialité NSI »
  // (cohérent avec sections.ts) ; le fallback générique est conservé.
  "FR_informatics_Terminale_Spécialité NSI": [
    {
      label: "Structures de données linéaires",
      limits:
        "Tableaux (Python : list), listes chaînées (implémentation maison via classe Maillon/Cellule), piles (LIFO) et files (FIFO) avec interfaces empiler/dépiler/enfiler/défiler ; PAS les deques double-ended.",
    },
    {
      label: "Arbres binaires et de recherche",
      limits:
        "Arbre binaire : nœud, fils gauche/droit, profondeur, hauteur, parcours préfixe/infixe/suffixe ; arbre binaire de recherche (ABR) avec insertion et recherche O(h). PAS les arbres équilibrés (AVL, rouge-noir) au programme NSI standard.",
    },
    {
      label: "Graphes",
      limits:
        "Représentations : matrice d'adjacence et liste d'adjacence ; graphe orienté/non-orienté, pondéré ; degré, chemin, cycle, connexité. PAS les graphes orientés acycliques (DAG) en tant que concept formel.",
    },
    {
      label: "Récursivité",
      limits:
        "Définition récursive, cas de base, pile d'appels (notion) ; preuve de terminaison par variant de boucle ; exemples : factorielle, Fibonacci, tours de Hanoi, parcours d'arbre. PAS la récursion mutuelle au programme.",
    },
    {
      label: "Programmation orientée objet (Python)",
      limits:
        "Classe, attribut, méthode, instance, constructeur __init__, méthode __str__/__repr__ ; héritage simple ; encapsulation par convention (préfixe _). PAS les métaclasses, PAS la résolution MRO multiple.",
    },
    {
      label: "Algorithmes de tri",
      limits:
        "Tri par insertion, tri par sélection (rappel de 1ère) ; tri fusion (merge sort, complexité O(n log n) avec preuve par récurrence T(n) = 2T(n/2) + n) ; tri rapide (quicksort, étude de cas). PAS le tri par tas en NSI standard.",
    },
    {
      label: "Diviser pour régner",
      limits:
        "Paradigme : diviser, résoudre, combiner ; recherche dichotomique O(log n), tri fusion, exponentiation rapide x^n en O(log n). PAS de master theorem formel.",
    },
    {
      label: "Programmation dynamique",
      limits:
        "Sous-problèmes optimaux et chevauchement ; mémoïsation top-down vs tabulation bottom-up ; exemples : rendu de monnaie, distance d'édition (Levenshtein), problème du sac à dos (0/1).",
    },
    {
      label: "Parcours de graphes (BFS, DFS)",
      limits:
        "BFS avec une file → distances en arêtes dans un graphe non pondéré ; DFS avec une pile ou par récursion → détection de cycles, tri topologique d'un DAG. PAS de Tarjan ni Kosaraju pour composantes fortement connexes.",
    },
    {
      label: "Plus court chemin (Dijkstra)",
      limits:
        "Algorithme de Dijkstra avec file de priorité, pour graphe orienté pondéré à poids POSITIFS uniquement. PAS Bellman-Ford (poids négatifs), PAS Floyd-Warshall (toutes paires), PAS A*.",
    },
    {
      label: "Bases de données relationnelles",
      limits:
        "Modèle relationnel : table, attribut, clé primaire, clé étrangère, contraintes d'intégrité ; algèbre relationnelle (sélection σ, projection π, jointure ⋈, union, différence). PAS la 3e forme normale formelle.",
    },
    {
      label: "Langage SQL",
      limits:
        "SELECT…FROM…WHERE, ORDER BY, GROUP BY, HAVING ; INNER JOIN, LEFT/RIGHT JOIN ; fonctions d'agrégation COUNT/SUM/AVG/MIN/MAX. PAS les vues, PAS les triggers, PAS les transactions ACID au programme NSI.",
    },
    {
      label: "Systèmes d'exploitation",
      limits:
        "Notion de processus (PID, états : prêt/élu/bloqué), ordonnancement round-robin (notion) ; gestion de fichiers (chemin absolu/relatif, droits UNIX rwx). PAS la gestion de mémoire virtuelle, PAS les interruptions matérielles.",
    },
    {
      label: "Réseaux : modèle TCP/IP",
      limits:
        "4 couches (accès, internet/IP, transport TCP/UDP, application) ; adressage IPv4 (classes, masque, adresse réseau/diffusion), notion d'IPv6 ; routage : table de routage, principe du plus court chemin (lien avec Dijkstra).",
    },
    {
      label: "Protocoles HTTP/HTTPS et chiffrement",
      limits:
        "Requêtes/réponses HTTP (méthodes GET, POST ; codes 200, 404, 500) ; cookies et sessions ; HTTPS = HTTP + TLS ; chiffrement symétrique (AES, notion) et asymétrique (RSA, Diffie-Hellman, notion) ; certificats. PAS le détail des suites cryptographiques.",
    },
  ],
  "FR_informatics_Terminale": [
    "Structures de données : pile, file",
    "Récursivité",
    "Programmation orientée objet (POO)",
    "Algorithmes de tri (tri fusion, tri rapide)",
    "Diviser pour régner",
    "Programmation dynamique",
    "Algorithmes de graphe : BFS, DFS",
    "Algorithme de Dijkstra",
    "Bases de données relationnelles, SQL",
    "Systèmes d'exploitation, processus",
    "Réseaux : routage, TCP/IP",
    "Protocoles HTTP / HTTPS",
  ],

  // ── MOROCCO ────────────────────────────────────────────────────────────────
  // Sciences Mathématiques A (SM-A) — programme le plus complet, unique
  // filière avec structures algébriques ET arithmétique avancée.
  "MA_math_2ème Bac_Sciences Mathématiques A": [
    {
      label: "Limites et continuité",
      limits:
        "Limites finies et infinies, opérations, formes indéterminées, limites comparées (e^x / x^n, ln x / x^n) ; TVI et corollaire, prolongement par continuité. Théorème des valeurs intermédiaires avec démonstration.",
    },
    {
      label: "Dérivabilité et étude de fonctions",
      limits:
        "Dérivées composées (chain rule), dérivée d'une bijection réciproque ; théorème de Rolle, théorème des accroissements finis ; convexité (f'' ≥ 0) ; branches infinies (asymptote horizontale, verticale, oblique).",
    },
    {
      label: "Fonction logarithme",
      limits:
        "ln x : propriétés, dérivées et primitives ; fonctions du type u/u' ; limites en 0 et +∞, étude de fonctions composées.",
    },
    {
      label: "Fonction exponentielle",
      limits:
        "e^x et a^x : propriétés, dérivées, primitives ; études de fonctions du type e^(u(x)) ; résolution d'équations et inéquations. Lien y' = y.",
    },
    {
      label: "Suites numériques",
      limits:
        "Convergence, limites, suites monotones bornées, suites adjacentes ; suites définies par récurrence (un+1 = f(un)), points fixes, convergence par étude de la fonction. Récurrence à deux termes. PAS le critère de Cauchy.",
    },
    {
      label: "Calcul intégral",
      limits:
        "Primitives usuelles, intégrale de Riemann, valeur moyenne ; intégration par parties ; changement de variable ; calcul d'aires, volumes de révolution.",
    },
    {
      label: "Équations différentielles",
      limits:
        "1er ordre : y' + a(x)y = b(x) avec variation de la constante ; 2e ordre : ay'' + by' + cy = 0 (équation caractéristique) et avec second membre polynôme ou exponentielle.",
    },
    {
      label: "Nombres complexes",
      limits:
        "Formes algébrique, trigonométrique ET exponentielle (Euler, Moivre) ; racines nèmes de l'unité ; résolution dans ℂ ; interprétation géométrique (similitudes directes et indirectes).",
    },
    {
      label: "Géométrie dans l'espace",
      limits:
        "Vecteurs, plans, droites ; orthogonalité, positions relatives ; sphères ; représentations paramétriques ; distances et angles. PAS la géométrie affine par coordonnées barycentriques.",
    },
    {
      label: "Dénombrement et probabilités",
      limits:
        "Arrangements, permutations, combinaisons, formule du binôme ; probabilités conditionnelles, Bayes ; variables aléatoires discrètes, espérance, variance, loi binomiale, loi géométrique.",
    },
    {
      label: "Arithmétique dans ℤ",
      limits:
        "Divisibilité, PGCD (Euclide étendu), Bézout, Gauss, congruences modulo n ; applications aux PGCD de polynômes (notion). PAS le petit théorème de Fermat au programme standard SM-A.",
    },
    {
      label: "Structures algébriques",
      limits:
        "Groupe (axiomes, sous-groupes, ordre d'un élément, groupes cycliques) ; anneau (ℤ, ℤ/nℤ) ; corps (ℚ, ℝ, ℂ, ℤ/pℤ) ; morphismes, isomorphismes. UNIQUEMENT filières Sciences Mathématiques.",
    },
  ],

  // Sciences Mathématiques B (SM-B) — programme proche de SM-A mais sans
  // les structures algébriques et avec une arithmétique plus légère.
  "MA_math_2ème Bac_Sciences Mathématiques B": [
    {
      label: "Limites et continuité",
      limits: "Limites, formes indéterminées, TVI ; similaire à SM-A mais sans démonstration du TAF.",
    },
    {
      label: "Dérivabilité et étude de fonctions",
      limits:
        "Dérivées composées, convexité, branches infinies ; PAS le théorème de Rolle ni le TAF formel.",
    },
    {
      label: "Fonction logarithme",
      limits: "ln x : propriétés, dérivées, primitives, études de fonctions.",
    },
    {
      label: "Fonction exponentielle",
      limits: "e^x : propriétés, dérivées, primitives, études.",
    },
    {
      label: "Suites numériques",
      limits:
        "Convergence, limites, monotonie, points fixes pour un+1 = f(un) ; PAS les suites adjacentes, PAS la récurrence à deux termes.",
    },
    {
      label: "Calcul intégral",
      limits:
        "Primitives, intégrale de Riemann, intégration par parties, changement de variable ; calcul d'aires.",
    },
    {
      label: "Équations différentielles",
      limits:
        "1er ordre y' + ay = b ; 2e ordre ay'' + by' + cy = 0 ; second membre polynomial ou exponentiel simple.",
    },
    {
      label: "Nombres complexes",
      limits:
        "Formes algébrique, trigonométrique ET exponentielle ; racines nèmes de l'unité ; similitudes dans le plan.",
    },
    {
      label: "Géométrie dans l'espace",
      limits: "Vecteurs, plans, droites, distances, angles ; sphères.",
    },
    {
      label: "Dénombrement et probabilités",
      limits:
        "Arrangements, combinaisons, formule du binôme ; probabilités conditionnelles, Bayes ; variables aléatoires, loi binomiale.",
    },
    {
      label: "Arithmétique dans ℤ",
      limits:
        "Divisibilité, PGCD, Bézout, Gauss, congruences ; même profondeur que SM-A mais sans applications aux structures.",
    },
  ],

  // Sciences Physiques (PC) — math allégée pour laisser de la place à
  // la physique-chimie ; pas de structures algébriques.
  "MA_math_2ème Bac_Sciences Physiques (PC)": [
    {
      label: "Limites et continuité",
      limits:
        "Limites usuelles, formes indéterminées simples, TVI (application numérique) ; PAS le TAF ni le prolongement par continuité formel.",
    },
    {
      label: "Dérivabilité et étude de fonctions",
      limits:
        "Dérivées composées, tableau de variations, extremums, convexité basique ; PAS les branches infinies obliques.",
    },
    {
      label: "Fonction logarithme et exponentielle",
      limits:
        "ln x et e^x : propriétés, dérivées, primitives usuelles ; études de fonctions simples. Même contenu que SM mais moins d'approfondissement.",
    },
    {
      label: "Suites numériques",
      limits:
        "Convergence, limites, monotonie, suites définies par récurrence simple (un terme). PAS les suites adjacentes.",
    },
    {
      label: "Calcul intégral",
      limits:
        "Primitives usuelles, intégrale, valeur moyenne ; intégration par parties basique ; calcul d'aires. PAS le changement de variable.",
    },
    {
      label: "Équations différentielles",
      limits:
        "1er ordre y' + ay = b (coefficient constant) ; PAS les équations du 2e ordre au programme PC.",
    },
    {
      label: "Nombres complexes",
      limits:
        "Formes algébrique et trigonométrique ; PAS la forme exponentielle (Euler) au programme PC.",
    },
    {
      label: "Probabilités",
      limits:
        "Probabilités conditionnelles, indépendance, Bayes ; variables aléatoires discrètes, espérance, variance, loi binomiale.",
    },
  ],

  // Sciences de la Vie et de la Terre (SVT) — programme math très allégé.
  "MA_math_2ème Bac_Sciences de la Vie et de la Terre (SVT)": [
    {
      label: "Fonctions : limites et continuité",
      limits:
        "Limites usuelles, TVI ; PAS le TAF, PAS les formes indéterminées avancées.",
    },
    {
      label: "Dérivation et étude de fonctions",
      limits:
        "Dérivée, tableau de variations, extremums ; applications pratiques (modèles biologiques). PAS les branches infinies.",
    },
    {
      label: "Fonction logarithme et exponentielle",
      limits:
        "ln x et e^x : propriétés de base, dérivées, modèles biologiques (croissance, pharmacocinétique). Sans approfondissement analytique.",
    },
    {
      label: "Calcul intégral",
      limits:
        "Primitives usuelles, intégrale, calcul d'aires. PAS l'intégration par parties.",
    },
    {
      label: "Probabilités",
      limits:
        "Probabilités conditionnelles, Bayes ; variables aléatoires discrètes, espérance, loi binomiale. Application en génétique et en statistiques biologiques.",
    },
    {
      label: "Statistiques (données biologiques)",
      limits:
        "Séries statistiques, indicateurs de tendance centrale et de dispersion ; régression linéaire simple. Application à des données expérimentales de SVT.",
    },
  ],

  // Sciences Économiques (SEG) — math orientée économie et gestion.
  "MA_math_2ème Bac_Sciences Économiques": [
    {
      label: "Fonctions numériques",
      limits:
        "Dérivée, extremum, élasticité prix-demande, coût marginal ; étude de fonctions économiques (coût total, recette, profit).",
    },
    {
      label: "Suites et applications financières",
      limits:
        "Suites arithmétiques et géométriques ; intérêts simples et composés, valeur acquise, valeur actuelle, annuités constantes. PAS les suites définies par récurrence générale.",
    },
    {
      label: "Calcul intégral",
      limits:
        "Primitives, intégrale ; surplus du consommateur et du producteur. Sans technique d'intégration avancée.",
    },
    {
      label: "Probabilités et statistiques",
      limits:
        "Probabilités conditionnelles, Bayes ; variables aléatoires, espérance ; statistiques à deux variables : régression linéaire, indices simples et synthétiques.",
    },
  ],

  // Fallback générique MA 2ème Bac (pas de section sélectionnée).
  "MA_math_2ème Bac": [
    "Limites et continuité",
    "Dérivabilité",
    "Étude de fonctions",
    "Fonction logarithme népérien",
    "Fonction exponentielle",
    "Suites numériques",
    "Calcul intégral",
    "Équations différentielles",
    "Nombres complexes",
    "Géométrie dans l'espace",
    "Probabilités",
    "Dénombrement",
    "Arithmétique dans ℤ (PGCD, congruences)",
    "Structures algébriques (filières Maths uniquement)",
  ],
  "MA_math_1ère Bac": [
    "Généralités sur les fonctions",
    "Limites et continuité (introduction)",
    "Dérivation",
    "Étude de fonctions polynômes et rationnelles",
    "Suites numériques",
    "Trigonométrie",
    "Géométrie analytique",
    "Produit scalaire",
    "Statistiques",
    "Probabilités",
  ],
  "MA_physics_2ème Bac": [
    {
      label: "Mécanique : lois de Newton",
      limits:
        "Référentiel galiléen, 1re/2e/3e lois de Newton (g = 10 m/s² au Maroc) ; PFD vectoriel ; plan incliné, frottements f = μN ; PAS le repère de Frenet.",
    },
    {
      label: "Mouvements dans les champs",
      limits:
        "Champ de pesanteur (projectile, trajectoire parabolique) et champ électrique uniforme (déflexion d'une particule chargée) ; énergie cinétique gagnée qU = ½mv².",
    },
    {
      label: "Mouvement circulaire",
      limits:
        "Mouvement circulaire uniforme : accélération centripète ac = v²/r = ω²r ; force centripète, rotation de la Terre (notion). PAS le mouvement circulaire non-uniforme.",
    },
    {
      label: "Oscillations mécaniques",
      limits:
        "Pendule élastique et pendule pesant (petites oscillations) ; équation différentielle ẍ + ω₀²x = 0 ; période T₀ ; énergie mécanique. Oscillations libres amorties (notion d'amortissement).",
    },
    {
      label: "Ondes mécaniques progressives",
      limits:
        "Définition, célérité, longueur d'onde λ = cT, retard τ = d/c ; ondes transversales et longitudinales ; ondes à la surface de l'eau et sur corde. PAS les ondes stationnaires en détail.",
    },
    {
      label: "Ondes lumineuses, diffraction et interférences",
      limits:
        "Diffraction par fente : écart angulaire θ = λ/a ; interférences (fentes de Young) : interfrange i = λD/a ; nature ondulatoire de la lumière. Réfraction (loi de Snell-Descartes).",
    },
    {
      label: "Dipôle RC et RL",
      limits:
        "Charge/décharge d'un condensateur (τ = RC) ; établissement/rupture de courant dans une bobine (τ = L/R) ; bilans énergétiques Ec = ½Cu², EL = ½Li².",
    },
    {
      label: "Circuit RLC — oscillations électriques",
      limits:
        "Régime libre : pseudo-période, amortissement, équation LC q̈ + q/LC = 0 (cas idéal) ; analogie mécanique. Régime forcé sinusoïdal : résonance d'intensité, facteur de qualité.",
    },
    {
      label: "Modulation et démodulation",
      limits:
        "Modulation d'amplitude (AM) : signal modulé s(t) = (A + m·a(t))cos(2πf_p t) ; démodulation par détection d'enveloppe. Notion de modulation de fréquence (FM). Applications radio.",
    },
    {
      label: "Décroissance radioactive et réactions nucléaires",
      limits:
        "Désintégrations α, β⁻, β⁺ ; loi N(t) = N₀e^(-λt), demi-vie ; énergie de liaison, défaut de masse, courbe d'Aston ; fission (U235) et fusion (H+H). Calcul Q = Δm·c².",
    },
  ],
  "MA_chemistry_2ème Bac": [
    {
      label: "Cinétique chimique",
      limits:
        "Vitesse volumique de réaction, facteurs cinétiques (concentration, T, catalyseur) ; temps de demi-réaction t₁/₂ ; loi d'ordre 1 et 0 (selon le programme MAR). Approche expérimentale ; PAS la loi d'Arrhenius formelle.",
    },
    {
      label: "Équilibre chimique",
      limits:
        "Réactions limitées, quotient de réaction Qr, constante d'équilibre K ; loi de modération (Le Chatelier) appliquée à C, P, T ; calcul de taux d'avancement à l'équilibre.",
    },
    {
      label: "Réactions acide-base, pH",
      limits:
        "Couple acide/base, autoprotolyse de l'eau Ke = 10⁻¹⁴ à 25°C, pH = -log[H₃O⁺] ; force des acides/bases (Ka, pKa) ; diagramme de prédominance ; solutions tampons. PAS les diagrammes E-pH.",
    },
    {
      label: "Constantes d'acidité Ka et diagrammes de distribution",
      limits:
        "Ka, pKa ; diagramme de distribution (fractions molaires) ; calcul de pH d'acides/bases faibles ou forts ; mélange acide-base.",
    },
    {
      label: "Réactions d'oxydoréduction",
      limits:
        "Couple Ox/Red, demi-équations électroniques ; équilibrage en milieu acide ou basique ; potentiel standard E° (notion qualitative).",
    },
    {
      label: "Pile et électrolyse",
      limits:
        "Pile : anode/cathode, fem, prévision du sens spontané ; pile Daniell ; électrolyse : loi de Faraday Q = nFz (Q = It).",
    },
    {
      label: "Dosages (titrages)",
      limits:
        "Titrage acide-base (pH-métrie, colorimétrie) et redox (permanganate, iode-thiosulfate) ; courbe de titrage, équivalence, choix de l'indicateur. Dosage conductimétrique (notion).",
    },
    {
      label: "Chimie organique : groupes fonctionnels et réactions",
      limits:
        "Alcools (I, II, III) et leur oxydation ; acides carboxyliques et esters (estérification/saponification) ; amines et amides (notion) ; nomenclature IUPAC des composés organiques.",
    },
    {
      label: "Mécanismes réactionnels",
      limits:
        "Sites électrophiles/nucléophiles, flèches courbes ; substitution nucléophile (SN2 simple), addition, élimination. PAS les calculs orbitalaires.",
    },
  ],
  "MA_informatics_2ème Bac": [
    {
      label: "Algorithmique : structures de contrôle",
      limits:
        "Pseudo-code marocain (SI/SINON, TANT QUE, POUR) ; conditions composées, structures imbriquées ; validation d'entrées.",
    },
    {
      label: "Structures de données : tableaux et listes",
      limits:
        "Tableaux 1D (déclaration, parcours, recherche, tri simple) ; tableaux 2D ; introduction aux listes chaînées (nœud, pointeur). PAS les piles et files en programme standard MA.",
    },
    {
      label: "Procédures et fonctions",
      limits:
        "Sous-programmes : procédure (sans retour) vs fonction (avec retour) ; passage par valeur et par référence ; portée des variables locales/globales.",
    },
    {
      label: "Récursivité",
      limits:
        "Cas de base et appel récursif ; exemples : factorielle, Fibonacci, PGCD d'Euclide, puissance rapide. PAS l'analyse formelle de la pile d'appels.",
    },
    {
      label: "Algorithmes de tri et de recherche",
      limits:
        "Tri à bulles, tri par sélection, tri par insertion (complexité O(n²)) ; recherche séquentielle et dichotomique (tableau trié, O(log n)). PAS le tri fusion au programme standard MA.",
    },
    {
      label: "Bases de données et SQL",
      limits:
        "Modèle relationnel ; SQL : CREATE/INSERT/SELECT/WHERE/UPDATE/DELETE ; jointures INNER JOIN ; GROUP BY basique. PAS les vues ni les procédures stockées.",
    },
    {
      label: "Programmation Python",
      limits:
        "Variables, types, structures de contrôle, fonctions, listes, dictionnaires ; fichiers texte ; bibliothèques standard (math, random). Introduction à la programmation orientée objet (notion de classe).",
    },
  ],

  // ── TUNISIA ────────────────────────────────────────────────────────────────
  // 1ère année secondaire — Tronc commun (toutes sections).
  // Source : Fiches pédagogiques officielles rédigées sous la direction de
  // l'inspecteur principal Amor Jeridi, DRE Gabès (2010-2012). Chaque entrée
  // correspond à un chapitre du programme ; les limits reproduisent les
  // "Aptitudes à développer" de la fiche et délimitent précisément le contenu.
  "TN_math_1ère année secondaire": [
    {
      label: "Les angles",
      limits:
        "Définition d'un angle, mesure en degrés (rapporteur), classification : aigu (0°<α<90°), droit (90°), obtus (90°<α<180°), plat (180°), nul (0°), saillant, rentrant. Couples d'angles : opposés par le sommet (égaux), adjacents, complémentaires (somme 90°), supplémentaires (somme 180°). Angles et figures de base : angle extérieur d'un triangle = somme des deux angles non adjacents. Droites parallèles et sécante : alternes-internes égaux, correspondants égaux, intérieurs même côté supplémentaires (et réciproques). Angles inscrits dans un cercle : vocabulaire (corde, arc, demi-cercle, diamètre) ; angle inscrit = ½ angle au centre associé ; deux angles inscrits interceptant le même arc sont égaux ; angle inscrit dans un demi-cercle = 90°. Longueur d'un arc : l = m·π·r/180. PAS les formules d'addition trigonométrique, PAS le cercle inscrit/exinscrit.",
    },
    {
      label: "Thalès et sa réciproque",
      limits:
        "Droite des milieux dans un triangle : la droite joignant les milieux de deux côtés est parallèle au troisième et mesure la moitié. Théorème de Thalès dans un triangle : si (MN)//(BC) alors AM/AB = AN/AC = MN/BC. Réciproque de Thalès : si AM/AB = AN/AC alors (MN)//(BC). PAS les configurations avec deux sécantes hors du triangle (Thalès 'papillon'), PAS le théorème des milieux dans le parallélogramme.",
    },
    {
      label: "Rapports trigonométriques",
      limits:
        "Cosinus, sinus, tangente d'un angle aigu dans un triangle rectangle (définitions par côtés adjacent, opposé, hypoténuse). Utilisation de la calculatrice (trouver cos/sin/tan d'un angle, et arccos/arcsin/arctan). Valeurs remarquables : cos 30°=√3/2, sin 30°=1/2, tan 30°=1/√3 ; cos 45°=sin 45°=√2/2, tan 45°=1 ; cos 60°=1/2, sin 60°=√3/2, tan 60°=√3. Relations trigonométriques : sin²(α)+cos²(α)=1 et sin(α)/cos(α)=tan(α). Relations métriques dans un triangle rectangle : théorème de Pythagore et ses applications. Construction d'un angle aigu connaissant l'un de ses rapports trigonométriques. Construction d'un segment de longueur √(ab). PAS la trigonométrie des angles quelconques (cercle trigonométrique), PAS sin(a+b).",
    },
    {
      label: "Vecteurs et translations",
      limits:
        "Définition d'un vecteur : représentant, direction, sens, norme (longueur). Égalité de deux vecteurs (même direction, sens, norme). Vecteur nul ; vecteurs opposés. Caractérisations vectorielles : ABCD parallélogramme ⟺ AB⃗=DC⃗ ; I milieu de [AB] ⟺ IA⃗+IB⃗=0⃗ ; A, B, C alignés ⟺ AB⃗ et AC⃗ colinéaires. Translation de vecteur u⃗ : image d'un point, image d'une figure (conservation des longueurs, des angles, du parallélisme). PAS les coordonnées dans un repère (chapitre 6), PAS les rotations d'angle quelconque.",
    },
    {
      label: "Somme de deux vecteurs",
      limits:
        "Relation de Chasles : AB⃗+BC⃗=AC⃗ (et ses conséquences : AB⃗+BA⃗=0⃗). Somme de deux vecteurs : définition (règle tête-queue ou du parallélogramme), représentation. Propriétés : commutativité, associativité, élément neutre 0⃗. Produit d'un réel k par un vecteur u⃗ : direction, sens (même si k>0, opposé si k<0), norme |k|·||u⃗||. Vecteurs colinéaires : u⃗ et v⃗ colinéaires ⟺ ∃k∈ℝ, u⃗=k·v⃗. Vecteurs colinéaires et droites parallèles. Milieu d'un segment : I milieu de [AB] ⟺ AI⃗=IB⃗. PAS la décomposition dans une base du plan, PAS le produit scalaire.",
    },
    {
      label: "Activités dans un repère",
      limits:
        "Repère cartésien d'une droite (O, OI⃗) : abscisse d'un point M (OM⃗=x·OI⃗). Milieu sur une droite graduée : xI=(xA+xB)/2. Mesure algébrique d'un vecteur AB⃗ sur une droite graduée : AB⃗=xB-xA. Distance entre deux points sur une droite : AB=|xB-xA|. Repère orthogonal du plan (O,i⃗,j⃗) : coordonnées (x;y) d'un point, coordonnées d'un vecteur. Milieu d'un segment dans le plan : coordonnées du milieu I. Distance dans le plan : AB=√((xB-xA)²+(yB-yA)²). PAS les équations de droites (cela vient avec les fonctions affines).",
    },
    {
      label: "Quart de tour",
      limits:
        "Définition du quart de tour de centre O et de sens donné (direct = antihoraire, indirect = horaire). Construction de l'image d'un point par un quart de tour (utilisation de la règle et du compas). Image d'une figure géométrique par un quart de tour. Propriétés : isométrie (conservation des distances et des angles), conservation de la forme. Lieux géométriques liés au quart de tour. PAS les rotations d'angle quelconque, PAS la composition de deux rotations.",
    },
    {
      label: "Sections planes d'un solide",
      limits:
        "Reconnaissance et représentation des solides usuels : prisme droit, parallélépipède rectangle, cube, pyramide droite, cône de révolution, cylindre droit, sphère. Calcul de volumes et d'aires latérales/totales de ces solides. Section d'un prisme ou d'un parallélépipède par un plan parallèle à une face. Section d'une pyramide ou d'un cône par un plan parallèle à la base (section semblable à la base). Section d'une sphère par un plan (cercle). PAS les sections obliques, PAS le calcul avec des plans non parallèles à une face.",
    },
    {
      label: "Activités numériques I",
      limits:
        "Ensembles des nombres : ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ (reconnaissance et appartenance). Division euclidienne : quotient, reste, dividende, diviseur. Diviseurs d'un entier ; critères de divisibilité par 2, 3, 4, 5, 9. Nombres premiers : définition, liste des premiers nombres premiers. Décomposition en facteurs premiers. PGCD de deux entiers par décomposition en facteurs premiers. Algorithme d'Euclide pour le PGCD. PPCM de deux entiers. Nombres premiers entre eux (PGCD = 1) ; fraction irréductible (diviser numérateur et dénominateur par leur PGCD). Nombres décimaux (écriture décimale finie). PAS le théorème de Bézout, PAS les congruences.",
    },
    {
      label: "Activités numériques II",
      limits:
        "Règles opératoires dans ℝ : priorités, simplification d'expressions littérales. Puissances d'un réel : a^n (n entier relatif), propriétés (a^m·a^n=a^(m+n), (a^m)^n=a^(mn), (ab)^n=a^n·b^n). Valeur absolue : |x| = x si x≥0, = -x si x<0 ; propriétés (|xy|=|x||y|, inégalité triangulaire) ; calcul d'expressions avec valeur absolue. Racine carrée d'un réel positif : définition (√a est l'unique réel ≥0 dont le carré est a) ; √(ab)=√a·√b, √(a/b)=√a/√b (a,b≥0) ; simplification et rationalisation du dénominateur. Comparaison de réels, encadrements, ordre dans ℝ. PAS les suites numériques, PAS les logarithmes.",
    },
    {
      label: "Activités algébriques",
      limits:
        "Développement, réduction et ordonnancement d'expressions littérales. Identités remarquables du 2ème degré : (a+b)²=a²+2ab+b², (a-b)²=a²-2ab+b², (a+b)(a-b)=a²-b². Factorisation par les identités d'ordre 2. Identités remarquables du 3ème degré : (a+b)³=a³+3a²b+3ab²+b³, (a-b)³=a³-3a²b+3ab²-b³, a³+b³=(a+b)(a²-ab+b²), a³-b³=(a-b)(a²+ab+b²). Développement et factorisation complète d'expressions algébriques (combinaison des identités). PAS le binôme de Newton généralisé, PAS les fractions algébriques.",
    },
    {
      label: "Fonctions linéaires",
      limits:
        "Définition d'une fonction linéaire : f(x)=ax (a≠0, a∈ℝ). Image et antécédent d'un réel. Propriétés : f(x+y)=f(x)+f(y), f(kx)=k·f(x), conservation du rapport (proportionnalité). Représentation graphique : droite passant par l'origine O de pente a. Lecture graphique : lire une image/antécédent, lire la pente. Résolution de problèmes concrets faisant intervenir la proportionnalité (modélisation d'une augmentation ou baisse par une fonction linéaire). PAS les fonctions affines f(x)=ax+b avec b≠0 (chapitre suivant).",
    },
    {
      label: "Équations et inéquations du 1er degré",
      limits:
        "Équations du 1er degré à une inconnue : forme ax+b=0 et ax+b=cx+d ; résolution (x=-b/a si a≠0) ; mise en équation d'un problème concret. Inéquations du 1er degré : ax+b>0, <0, ≥0, ≤0 ; règles de résolution (le sens s'inverse quand on multiplie/divise par un réel négatif) ; représentation sur la droite réelle. PAS les équations du 2ème degré, PAS les systèmes (chapitre 15), PAS la valeur absolue dans les équations.",
    },
    {
      label: "Fonctions affines",
      limits:
        "Définition : f(x)=ax+b avec a∈ℝ, b∈ℝ (a=0 donne une fonction constante). Représentation graphique : droite de pente a et ordonnée à l'origine b=f(0). Calcul de la pente : a=(f(x)-f(x'))/(x-x') pour x≠x'. Sens de variation : f croissante si a>0, décroissante si a<0, constante si a=0. Lecture graphique : lire l'image/antécédent, déterminer équation d'une droite passant par deux points. PAS la dérivée (non au programme 1ère AS), PAS les fonctions quadratiques.",
    },
    {
      label: "Système de 2 équations à 2 inconnues",
      limits:
        "Équation du 1er degré à 2 inconnues ax+by=c : ensemble des solutions (droite dans le plan), représentation graphique. Système de 2 équations du 1er degré à 2 inconnues. Méthodes de résolution : substitution et combinaison (addition-soustraction après multiplication). Interprétation graphique : intersection de 2 droites (système possible déterminé, possible indéterminé — droites confondues, impossible — droites parallèles distinctes). Modélisation de problèmes concrets par un système. PAS les systèmes 3×3, PAS les matrices.",
    },
    {
      label: "Exploitation de l'information",
      limits:
        "Série statistique à variable discrète : tableau de fréquences absolues et relatives, représentations graphiques (diagramme en bâtons, circulaire). Indicateurs statistiques : moyenne arithmétique simple et pondérée, médiane (valeur qui partage l'effectif en deux moitiés égales), mode. Série à valeurs regroupées par classes [ai, ai+1[ : tableau avec effectifs et fréquences, histogramme, effectifs cumulés. Série chronologique : représentation graphique, comparaison de deux séries. Expériences aléatoires : univers, événement, probabilité classique P(A)=nombre de cas favorables/nombre de cas possibles (résultats équiprobables). PAS la variance, l'écart-type, ni les distributions de probabilité (binomiale, normale).",
    },
  ],

  // 2ème année secondaire — filières Sciences & Sciences de l'informatique.
  // Source : Fiches pédagogiques officielles rédigées sous la direction de
  // l'inspecteur principal Amor Jeridi, DRE Gabès (2013-2014). Chaque entrée
  // correspond à un chapitre du programme ; les limits reproduisent les
  // "Aptitudes à développer" de la fiche et délimitent précisément le contenu.
  "TN_math_2ème année secondaire_Sciences": [
    {
      label: "Calcul dans IR",
      limits:
        "Ensembles de nombres IN⊂Z⊂D⊂Q⊂IR et leurs inclusions. Proportionnalités et pourcentages. Produits remarquables : développer et factoriser. Comparaison de réels : a, a² et √a pour a≥0 ; comparaison de a et 1/a (si 0<a<1 alors a<1/a, si a>1 alors a>1/a). Encadrer une somme ou un produit de réels. Calcul sur les radicaux : √(a²)=|a|, √(ab)=√a·√b, √(a/b)=√a/√b ; conjugué d'une expression avec radical. Valeur absolue : |x|≤a ↔ -a≤x≤a ; |x|≥a ↔ x≤-a ou x≥a. Valeur approchée, arrondi, ordre de grandeur. PAS logarithmes, PAS exposants irrationnels.",
    },
    {
      label: "Problèmes du 1er et du 2ème degré",
      limits:
        "Rappel 1er degré : équation ax+b=0, inéquation ax+b≥0 (ou ≤,>,<). Équations et inéquations faisant appel aux valeurs absolues. Équations et inéquations renfermant l'inconnue au dénominateur. Équations et inéquations irrationnelles (contenant des radicaux). Problèmes du 1er degré. Équation du 2ème degré ax²+bx+c=0 (a≠0) : définition, forme canonique a(x-α)²+β ; discriminant Δ=b²-4ac, résolution (méthode d'Alkhawarizmi) ; discriminant réduit Δ'=b'²-ac (si b=2b') ; somme x₁+x₂=-b/a, produit x₁·x₂=c/a ; factorisation ax²+bx+c=a(x-x₁)(x-x₂) ; équations réductibles au 2ème degré ; inéquations du 2ème degré (signe du trinôme) ; problèmes du 2ème degré. PAS équations du 3ème degré ou plus, PAS équations exponentielles.",
    },
    {
      label: "Notion de polynômes",
      limits:
        "Reconnaître une fonction polynôme (degré, coefficient dominant, terme constant). Opérations sur les polynômes : addition, multiplication, division euclidienne P(x)=Q(x)·D(x)+R(x). Factorisation : si α est racine d'un polynôme P de degré ≥1, alors (x-α) divise P(x) ; si α et β sont deux racines d'un polynôme de degré ≥2, alors (x-α)(x-β) divise P(x). Fonction rationnelle : quotient de deux polynômes, domaine de définition. PAS décomposition en éléments simples, PAS dérivée de polynôme.",
    },
    {
      label: "Arithmétique",
      limits:
        "Division euclidienne : a=b·q+r avec 0≤r<b. Divisibilité : b|a ↔ reste nul, propriétés (b|a et b|c ⇒ b|(αa+βc)). Critères de divisibilité : par 2 et 5 (chiffre des unités) ; par 4 et 25 (deux derniers chiffres) ; par 8 (trois derniers chiffres) ; par 3 et 9 (somme des chiffres) ; par 11 (alternance S₁-S₂) ; par 7 (règle de la chaîne abjad). PGCD et algorithme d'Euclide, PPCM. Nombres premiers. Raisonnement par l'absurde. PAS congruences modulo n au sens général, PAS décomposition en facteurs premiers exhaustive.",
    },
    {
      label: "Suites arithmétiques",
      limits:
        "Notion de suite réelle : définition, notation indicielle Uₙ, calcul des termes, suites définies par une formule explicite ou par récurrence Uₙ₊₁=f(Uₙ). Suite arithmétique : reconnaissance (Uₙ₊₁-Uₙ=r constant), raison r, terme général Uₙ=U₀+n·r (ou Uₙ=U₁+(n-1)·r). Somme des n premiers termes : Sₙ=n·(U₀+Uₙ₋₁)/2. Exercices intégratifs incluant suites mêlant arithmétique et géométrique. PAS convergence, PAS limite d'une suite, PAS suites récurrentes d'ordre 2.",
    },
    {
      label: "Suites géométriques",
      limits:
        "Suite géométrique : définition Uₙ₊₁=q·Uₙ (q réel), raison q ; trois termes en progression géométrique a, b, c ↔ b²=ac. Terme général : Uₙ=U₀·qⁿ ; Uₙ=Up·q^(n-p) ; U₁·q^(n-1). Suite de la forme uₙ=aⁿ est géométrique. Représentation graphique des termes. Somme de n termes consécutifs : S=U₀·(1-qⁿ)/(1-q) (q≠1) ; identité 1+x+x²+…+xⁿ=(1-x^(n+1))/(1-x). PAS limite d'une suite géométrique, PAS calcul de la somme pour q=1.",
    },
    {
      label: "Généralités sur les fonctions",
      limits:
        "Définition d'une fonction f : domaine de définition Df, image f(x) d'un réel, antécédent d'un réel (résolution de f(x)=k). Représentation graphique : lire image et antécédent graphiquement. Résolution graphique d'équations f(x)=g(x) et d'inéquations f(x)>g(x). Sens de variations sur un intervalle : croissante/décroissante, tableau de variations, extrema locaux. Parité : paire f(-x)=f(x) (courbe symétrique par rapport à l'axe des ordonnées), impaire f(-x)=-f(x) (symétrique par rapport à O). PAS dérivée, PAS limites, PAS continuité.",
    },
    {
      label: "Fonctions de référence",
      limits:
        "x↦x² : variations, parabole sommets O(0,0), axe x=0 ; x↦ax² : parabole homothétée, sommet O, sens selon signe de a. x↦a(x-α)²+β : parabole sommet S(α,β), axe x=α. x↦ax²+bx+c (a≠0) : mise sous forme canonique, sommet S(-b/(2a), …), tableau de variations, résolution graphique d'équations. x↦√x (domaine [0,+∞), croissante), x↦√(x+b) (translation). x↦1/x et x↦a/x (a≠0) : domaine ℝ\\{0}, hyperbole, variations sur ]-∞,0[ et ]0,+∞[. x↦a/(x+b) : translation de l'hyperbole. x↦(ax+b)/(cx+d) (c≠0) : domaine ℝ\\{-d/c}, asymptotes x=-d/c et y=a/c. PAS dérivée, PAS fonctions trigonométriques (elles sont au chapitre Trigonométrie).",
    },
    {
      label: "Calcul vectoriel",
      limits:
        "Rappel : addition de vecteurs et produit d'un vecteur par un réel (espace vectoriel ℝ²). Vecteurs colinéaires : u⃗=k·v⃗, condition analytique ab'-a'b=0. Base de ℝ² : deux vecteurs non colinéaires. Composantes d'un vecteur selon une base, coordonnées d'un point dans un repère cartésien. Repère orthonormé : base orthonormée (vecteurs orthogonaux et de norme 1), norme ‖u⃗‖=√(x²+y²). Distance AB=√((xB-xA)²+(yB-yA)²). Vecteurs orthogonaux : u⃗⊥v⃗ ↔ aa'+bb'=0. PAS produit scalaire développé (formule bilinéaire), PAS géométrie vectorielle dans ℝ³.",
    },
    {
      label: "Barycentre",
      limits:
        "Barycentre de deux points pondérés (A,α) et (B,β) (α+β≠0) : point G vérifiant α·GA⃗+β·GB⃗=0⃗ ; construction par la méthode des parallèles ; propriété AG/AB=β/(α+β) ; coordonnées xG=(α·xA+β·xB)/(α+β). Barycentre de trois points pondérés (A,α),(B,β),(C,γ) (α+β+γ≠0) : définition, construction, associativité. Cas particuliers : milieu (α=β=1), centre de gravité (α=β=γ). PAS barycentre de plus de 3 points sans décomposition, PAS coordonnées 3D.",
    },
    {
      label: "Translations",
      limits:
        "Notion d'application du plan dans lui-même : image, antécédent. Translation tu⃗ : M↦M' avec MM'⃗=u⃗ ; t0⃗ = identité. Propriété caractéristique : f est translation ↔ M'N'⃗=MN⃗ pour tous M, N. Conservation : distances (M'N'=MN), angles, alignement, parallélisme. Images d'une droite, d'un segment, d'une demi-droite et d'un cercle par une translation. Conservation du barycentre. PAS composition de translations, PAS translations dans ℝ³.",
    },
    {
      label: "Homothéties",
      limits:
        "Définition h(O,k) : M↦M' avec OM'⃗=k·OM⃗ (k réel, k≠0). Cas particuliers : k=1 (identité), k=-1 (symétrie centrale de centre O). Reconnaissance et construction de l'image d'un point. Images d'une droite, d'un segment, d'une demi-droite par h(O,k) : parallèles à l'original, rapport de longueurs |k|. Image d'un cercle de centre Ω et rayon R : cercle de centre h(O,k)(Ω) et rayon |k|·R. Conservation de l'alignement et des angles ; rapport des longueurs |k|. PAS composition d'homothéties, PAS similitudes directes/indirectes.",
    },
    {
      label: "Rotations",
      limits:
        "Radian : longueur d'arc L=Rθ, aire du secteur circulaire R²θ/2 ; conversion θ_rad=θ_deg·π/180. Définition de la rotation r(O,θ) : OM'=OM et M̂OM'=θ (directe si sens trigonométrique). Cas particuliers : θ=π (symétrie centrale), θ=0 (identité). Construction de l'image d'un point. Images d'une droite, d'un segment, d'une demi-droite (isométrique, angle θ avec l'original). Image d'un cercle : même rayon, centre image. Conservation du barycentre, milieu, alignement, parallélisme, orthogonalité. Figures invariantes : axe de symétrie, centre de symétrie. PAS composition de rotations, PAS groupe des isométries.",
    },
    {
      label: "Géométrie analytique",
      limits:
        "Coordonnées du barycentre de 2 ou 3 points pondérés. Équation cartésienne d'une droite ax+by+c=0 ; vecteur directeur (-b, a). Positions relatives de deux droites (sécantes, parallèles, confondues). Condition analytique de parallélisme : ab'-a'b=0. Vecteur normal (a, b) à la droite ax+by+c=0 ; condition de perpendicularité : aa'+bb'=0. Équation réduite y=mx+p. Distance d'un point A(xA,yA) à la droite ax+by+c=0 : d=|axA+byA+c|/√(a²+b²). Équation du cercle de centre I(a,b) rayon R : (x-a)²+(y-b)²=R² ; forme x²+y²+px+qy+r=0 (centre et rayon). Position relative d'un cercle et d'une droite. PAS droites paramétriques, PAS coniques autres (ellipse, hyperbole, parabole).",
    },
    {
      label: "Trigonométrie et mesures des grandeurs",
      limits:
        "Degrés sexagésimaux (DMS) et décimaux ; radian ; conversion degrés↔radians. Demi-cercle trigonométrique : cos θ et sin θ pour θ∈[0,π] (abscisse et ordonnée du point M associé) ; relation cos²θ+sin²θ=1. Angles supplémentaires : cos(π-θ)=-cosθ, sin(π-θ)=sinθ. Angles complémentaires : cos(π/2-θ)=sinθ, sin(π/2-θ)=cosθ. Tangente tan θ=sinθ/cosθ (θ≠π/2), cotangente cot θ=cosθ/sinθ (θ≠0). Construction d'un angle à partir d'un rapport trigonométrique. Loi des sinus : a/sinA=b/sinB=c/sinC=2R. Théorème des bissectrices : AB/AC=IB/IC. Aire d'un triangle : S=(1/2)bc·sinA=abc/(4R). Théorème d'El-Kashi : a²=b²+c²-2bc·cosA. Relations métriques dans le triangle rectangle : AH²=HB·HC, AB²=BH·BC. PAS formules d'addition sin(a±b)/cos(a±b), PAS cercle trigonométrique complet pour angles∈ℝ.",
    },
    {
      label: "Droites et plans de l'espace",
      limits:
        "Solides usuels (cube, parallélépipède, pyramide, tétraèdre, prisme) : faces, arêtes, sommets. Quatre axiomes d'incidence. Coplanarité de points et de droites. Détermination d'un plan : 3 points non alignés ; 1 droite + 1 point extérieur ; 2 droites sécantes ; 2 droites parallèles. Positions relatives de deux droites : sécantes, parallèles (coplanaires), ou gauches/non coplanaires. Positions relatives d'une droite et d'un plan : sécants (droite perce le plan en un point), parallèles (intersection vide), droite incluse dans le plan. Positions relatives de deux plans : sécants (intersection = droite), strictement parallèles, confondus. PAS orthogonalité (droite⊥plan, plan⊥plan), PAS projections orthogonales.",
    },
    {
      label: "Parallélisme dans l'espace",
      limits:
        "Parallélisme de droites dans l'espace : définition (coplanaires et parallèles dans ce plan), unicité de la parallèle par un point, transitivité. Droite parallèle à un plan : définition (droite // à une droite incluse dans le plan) ; propriétés : si D//P et plan Q coupe P, alors l'intersection de Q avec P est // à D ; si D₁//D₂ tout plan // à l'une est // à l'autre ; si D // à deux plans sécants, D // à leur droite d'intersection. Plans parallèles : définition, propriétés (toute droite d'un plan est // à l'autre ; plan coupant l'un coupe l'autre avec intersections // ; critère : deux droites sécantes de l'un // à deux droites sécantes de l'autre ; transitivité). Section d'un prisme ou d'une pyramide par un plan parallèle à la base. PAS orthogonalité, PAS projections orthogonales.",
    },
  ],

  // 2ème année secondaire — filière Économie & Services.
  // Source : Programmes officiels de mathématiques, Ministère de l'Éducation
  // tunisien (septembre 2008), pages 23-27.
  "TN_math_2ème année secondaire_Économie & Services": [
    {
      label: "Activités numériques",
      limits:
        "Estimation, arrondi, ordre de grandeur. Pourcentages et proportions : évolutions successives, valeur initiale. Suites arithmétiques et géométriques : raison, terme général, somme, représentation graphique ; applications (intérêts simples/composés, échelonnements d'emprunts, évolution démographique). Dénombrement : principe additif et arbres de choix. PAS logarithmes, PAS exponentielles, PAS permutations/combinaisons.",
    },
    {
      label: "Activités algébriques",
      limits:
        "Équations et inéquations du 1er degré. Trinôme du 2nd degré : racines, factorisation, signe. Équations et inéquations du 2nd degré. Signe de produits et quotients de polynômes ou trinômes du second degré. Systèmes de 2 ou 3 équations linéaires à 2 ou 3 inconnues (méthode du pivot de Gauss) ; systèmes de 2 inéquations linéaires à 2 inconnues. PAS déterminants, PAS matrices, PAS méthode de Cramer.",
    },
    {
      label: "Fonctions et représentations graphiques",
      limits:
        "Fonctions affines par intervalles. Inéquation linéaire à deux inconnues (représentation graphique). Étude et représentation graphique des fonctions x↦ax²+bx+c, x↦a/(x+b), x↦√(x+b), x↦ax³ : domaine, parité, variations, sommet/asymptotes, branches infinies, extrema. Résolution graphique de systèmes d'équations/inéquations à deux inconnues. PAS fonctions trigonométriques, PAS logarithmes/exponentielles, PAS dérivée.",
    },
    {
      label: "Activités statistiques",
      limits:
        "Séries statistiques à une variable : paramètres de position (médiane, quartiles, moyenne, mode) et de dispersion (étendue, variance, écart-type) ; représentations graphiques (diagrammes, histogramme, courbes, séries chronologiques). Simulation d'expériences aléatoires (estimation de probabilité par fréquence). PAS probabilités formelles, PAS deux variables, PAS régression.",
    },
  ],

  // 2ème année secondaire — filière Lettres.
  // Source : Programmes officiels, pages 28-32.
  "TN_math_2ème année secondaire_Lettres": [
    {
      label: "Activités numériques",
      limits:
        "Valeur approchée, arrondi, écriture scientifique. Pourcentages et proportions : évolutions successives. Suites arithmétiques et géométriques : raison, terme général, somme, représentation graphique ; applications (évolution démographique). PAS dénombrement combinatoire, PAS suites récurrentes.",
    },
    {
      label: "Activités algébriques",
      limits:
        "Équations et inéquations du 1er degré à une inconnue (se ramenant à ax+b=0). Signe de produits et quotients de binômes du 1er degré. Systèmes de 2 équations linéaires à 2 inconnues. PAS second degré, PAS systèmes à 3 inconnues.",
    },
    {
      label: "Fonctions et représentations graphiques",
      limits:
        "Fonctions affines par intervalles. Inéquation linéaire à deux inconnues. Étude et représentation graphique des fonctions x↦ax², x↦(x-a)²+b, x↦1/(x+b) : domaine, parité, variations, sommet, asymptotes, branches infinies. Résolution graphique d'un système de deux équations à deux inconnues. PAS fonctions du 3ème degré, PAS trigonométrie, PAS dérivée.",
    },
    {
      label: "Activités statistiques",
      limits:
        "Séries statistiques à une variable : paramètres de position (médiane, quartiles, moyenne, mode) et de dispersion (étendue, variance, écart-type) ; représentations graphiques (diagrammes, histogramme, courbes chronologiques). Simulation d'expériences aléatoires (estimation par fréquence). PAS probabilités formelles, PAS séries à deux variables, PAS régression.",
    },
  ],

  // ── 3ème ANNÉE SECONDAIRE ─────────────────────────────────────────────────
  // Source : Programmes officiels, pages 33-68.
  // Chaque entrée correspond à un grand thème du programme ; les limites
  // précisent le contenu disciplinaire et les aptitudes à développer, ainsi que
  // les exclusions explicites ou implicites par rapport aux autres sections.

  // Section Mathématiques (3ème AS SM) — programme le plus complet.
  "TN_math_3ème année secondaire_Mathématiques": [
    {
      label: "Analyse — Fonctions",
      limits:
        "Généralités : domaine de définition, parité, restriction, majorant/minorant, opérations algébriques sur les fonctions. Fonctions affines par intervalles. Continuité : en un réel, sur un intervalle, image d'un intervalle, TVI (admis), prolongement par continuité. Limites finies et infinies avec asymptotes horizontales, verticales et obliques (y=ax+b quand f(x)-(ax+b)→0). Dérivabilité : nombre dérivé, tangente/demi-tangente, approximation affine ; dérivée sur un intervalle ; lien signe f'—variations—extrema locaux. Fonctions du programme : polynômes (deg 1-3 et bicarrées), rationnelles (ax+b)/(cx+d), (ax²+bx+c)/(dx+e), (ax²+bx+c)/(dx²+ex+f), x↦√(ax+b), x↦√(ax²+bx+c), circulaires x↦sin(ax+b)/cos(ax+b)/tan(x). Axe/centre de symétrie d'une courbe, changement de repère. PAS logarithmes ni exponentielles (chapitre 4ème AS), PAS dérivée seconde (4ème AS).",
    },
    {
      label: "Analyse — Suites numériques",
      limits:
        "Comportement global : croissante/décroissante, majorée/minorée. Suites arithmétiques et géométriques (limite admise, somme exploitée). Suites Uₙ=f(n) avec f polynôme ou rationnelle : limite par théorèmes sur les fonctions. Développement décimal illimité périodique → fraction. Suites récurrentes Uₙ₊₁=f(Uₙ) avec f affine ou homographique : étude via suite auxiliaire géométrique, représentation graphique des (n,Uₙ) et sur axe. Convergence : définition, théorèmes de comparaison (3 théorèmes encadrement). Principe de récurrence (pour majoration/minoration et variations). PAS suites à 2 termes, PAS suites adjacentes (4ème AS SM uniquement).",
    },
    {
      label: "Statistiques et probabilités",
      limits:
        "Séries à un caractère : paramètres de position (médiane, quartiles, moyenne, mode) et de dispersion (variance, écart-type) ; interprétation d'une distribution normale (initiation). Séries à deux caractères : tableau, distributions marginales, nuage de points, point moyen. Probabilité uniforme sur ensemble fini : définition, P(A∪B), P(A∩B), équiprobabilité, épreuves successives indépendantes et dépendantes (arbre de choix). PAS loi binomiale (4ème AS), PAS régression/ajustement (SM), PAS loi normale formelle.",
    },
    {
      label: "Géométrie",
      limits:
        "Produit scalaire plan : définition, propriétés, expression analytique, lieux géométriques. Arcs orientés, cercle trigonométrique, angles orientés, angle inscrit/angle au centre, déterminant de deux vecteurs. Trigonométrie sur ℝ : cos/sin/tan d'un réel, coordonnées polaires, formules d'addition et de multiplication par 2, transformation a·cosθ+b·sinθ=r·cos(θ-φ), résolution équations/inéquations cos(ax+b)=c, sin(ax+b)=c, tanx=c. Rotations dans le plan : composée de deux rotations de même centre. Nombres complexes : forme algébrique, conjugué, opérations, module, argument, écriture trigonométrique, affixe (point et vecteur), lieux géométriques. Vecteurs de l'espace, déterminant de 3 vecteurs, produit scalaire et vectoriel dans l'espace, équations de droites/plans/sphères, positions relatives, intersection plan-sphère. PAS similitudes (4ème AS SM).",
    },
    {
      label: "Arithmétique et dénombrement",
      limits:
        "Dénombrement : cardinal d'un ensemble fini, combinaison C(n,k), permutation, arrangement, formule du binôme de Newton. Principe de récurrence. Division euclidienne dans ℕ, PGCD (algorithme d'Euclide), PPCM, entiers premiers entre eux, lemme de Gauss. Nombres premiers : théorème d'Euclide (infinité), petit théorème de Fermat, théorème fondamental de l'arithmétique (décomposition unique en facteurs premiers — existence démontrée, unicité admise). PAS identité de Bézout (4ème AS Math/Info), PAS congruences modulo n (4ème AS).",
    },
  ],

  // Section Sciences expérimentales (3ème AS SE).
  "TN_math_3ème année secondaire_Sciences expérimentales": [
    {
      label: "Analyse — Fonctions et suites",
      limits:
        "Même programme d'analyse que la section Mathématiques (fonctions, continuité TVI, limites, dérivée, fonctions du programme identiques). Principe de récurrence inclus. Suites récurrentes Uₙ₊₁=f(Uₙ) avec f affine ou homographique. PAS asymptotes obliques dans les aptitudes requises (mais abordées), PAS suites adjacentes, PAS suites à deux termes, PAS intégrale.",
    },
    {
      label: "Géométrie",
      limits:
        "Produit scalaire plan : applications longueurs, angles, lieux géométriques. Arcs/angles orientés, cercle trigonométrique, déterminant de 2 vecteurs. Trigonométrie : cos/sin/tan d'un réel, coordonnées polaires, formules d'addition et ×2, résolution équations/inéquations. Nombres complexes : forme algébrique, conjugué, opérations, module, argument, écriture trigonométrique, affixe point/vecteur, lieux géométriques. Vecteurs de l'espace, déterminant de 3 vecteurs, produit scalaire dans l'espace, équations de droites et plans (paramétriques et cartésiennes), positions relatives, équation d'une sphère. PAS rotations (réservées à la section Mathématiques), PAS produit vectoriel (SE), PAS intersection plan-sphère (SE).",
    },
    {
      label: "Statistiques, dénombrement et probabilités",
      limits:
        "Séries à un caractère (paramètres position/dispersion, initiation distribution normale) et à deux caractères (tableau, marginales, nuage, point moyen). Dénombrement : cardinal, combinaison, permutation, arrangement, binôme. Probabilité uniforme : définition, P(A∪B), P(A∩B), équiprobabilité, épreuves successives indépendantes et dépendantes (arbre). PAS loi binomiale, PAS régression/ajustement affine.",
    },
  ],

  // Section Sciences techniques (3ème AS ST).
  "TN_math_3ème année secondaire_Sciences techniques": [
    {
      label: "Analyse — Fonctions et suites",
      limits:
        "Même catalogue de fonctions que SM/SE (polynômes deg 1-3, bicarrées, rationnelles, circulaires). Limites introduites intuitivement (sans définition ε-δ), asymptotes décrites graphiquement. Dérivabilité, tangente, approximation affine, lien signe f'—variations—extrema. Principe de récurrence. Suites récurrentes Uₙ₊₁=f(Uₙ) avec f affine ou homographique ; limite de la suite géométrique admise. Formules trigonométriques d'addition et ×2, résolution équations/inéquations circulaires. PAS recherche d'asymptotes obliques (hors programme ST), PAS suites homographiques convergentes vers irrationnels (ST), PAS produit vectoriel espace.",
    },
    {
      label: "Géométrie",
      limits:
        "Produit scalaire plan. Arcs/angles orientés, cercle trigonométrique. Nombres complexes : forme algébrique, conjugué, opérations, module, argument, écriture trigonométrique, affixe point/vecteur. Vecteurs de l'espace : base, opérations, produit scalaire, produit vectoriel ET produit mixte dans l'espace, équations paramétriques et cartésiennes des droites et plans, intersections. PAS sphères (ST), PAS rotations du plan (ST), PAS lieux géométriques complexes avancés.",
    },
    {
      label: "Statistiques, dénombrement et probabilités",
      limits:
        "Séries à un caractère et à deux caractères (tableau, marginales, nuage, point moyen). Dénombrement : cardinal, combinaison, permutation, arrangement, nombre d'applications d'un ensemble fini dans un autre, binôme. Probabilité uniforme : définition, P(A∪B), P(A∩B), équiprobabilité. PAS épreuves successives dépendantes formalisées (ST), PAS loi binomiale, PAS régression.",
    },
  ],

  // Section Sciences de l'informatique (3ème AS SI).
  "TN_math_3ème année secondaire_Informatique": [
    {
      label: "Analyse — Fonctions et suites",
      limits:
        "Suites récurrentes Uₙ₊₁=aUₙ+b : terme, représentation graphique, limite via suite géométrique auxiliaire ; limite de la suite géométrique admise. Généralités sur les fonctions (domaine, parité, périodicité, variation, extrema). Limites finies/infinies (intuitives, sans ε-δ), asymptotes. Continuité et dérivabilité sur les fonctions du programme. Fonctions du programme : polynômes deg 1-3, bicarrées, (ax+b)/(cx+d), (ax²+bx+c)/(dx+e), x↦√(ax+b), circulaires x↦sin(ax+b), x↦cos(ax+b) (pas de tan). Asymptotes obliques possibles. PAS fonctions trigonométriques tan, PAS homographies suites, PAS formules addition trigonométriques.",
    },
    {
      label: "Géométrie et algèbre",
      limits:
        "Produit scalaire plan (longueurs, angles, aires, équation droite/cercle, formule d'Al-Kashi). Cercle trigonométrique, arcs orientés, cos/sin/tan d'un réel, formules d'addition et ×2, résolution cos x=c/sin x=c et inéquations. Systèmes linéaires (2×2, 3×2, 2×3, 3×3) par substitution, déterminant (2×2), pivot de Gauss ; notion de matrice et matrice complète. PAS vecteurs de l'espace, PAS nombres complexes (SI 3ème AS), PAS produit vectoriel.",
    },
    {
      label: "Logique, arithmétique et systèmes de numération",
      limits:
        "Logique propositionnelle : proposition, table de vérité, négation, connecteurs (∧, ∨, ⇒, ⇔), loi de De Morgan, réciproque, contraposée. Principe de récurrence. Arithmétique dans ℕ : division euclidienne, PGCD, PPCM, entiers premiers entre eux, lemme de Gauss, nombres premiers (théorème d'Euclide, crible d'Ératosthène). Systèmes de numération en base 2, 8, 16 : conversion entre bases et opérations (addition, multiplication) dans la même base. PAS petit théorème de Fermat (SI 3ème AS), PAS décomposition en facteurs premiers formelle.",
    },
    {
      label: "Dénombrement et probabilités",
      limits:
        "Dénombrement : cardinal d'un ensemble fini, nombre d'applications, combinaison, permutation, arrangement, formule du binôme. Probabilité sur ensemble fini : définition, langage probabiliste, P(A∪B), P(A∩B), équiprobabilité. Expériences indépendantes et dépendantes évoquées (simulation). PAS épreuves successives formalisées, PAS loi binomiale, PAS arbre de choix probabiliste développé.",
    },
  ],

  // Section Économie & Gestion (3ème AS SEG).
  "TN_math_3ème année secondaire_Économie & gestion": [
    {
      label: "Analyse — Fonctions, suites et trigonométrie",
      limits:
        "Généralités sur les fonctions (domaine, parité, périodicité, variation, extrema). Continuité et limites intuitives, asymptotes. Dérivabilité : nombre dérivé, tangente, approximation affine, lien f'—variations—extrema. Fonctions du programme : polynômes deg 1-3, bicarrées, (ax+b)/(cx+d), (ax²+bx+c)/(dx+e), x↦√(ax+b). Cercle trigonométrique, cos/sin/tan d'un réel, x↦sin(x+a), x↦cos(x+a), résolution équations/inéquations cosX=c, sinX=c. Principe de récurrence. Suites récurrentes Uₙ₊₁=aUₙ+b via suite auxiliaire géométrique, limite admise. PAS formules d'addition trigonométriques, PAS asymptotes obliques formelles.",
    },
    {
      label: "Statistiques, dénombrement et probabilités",
      limits:
        "Séries à un caractère (paramètres position/dispersion, distribution normale initiation) et à deux caractères (tableau, marginales, nuage, point moyen). Dénombrement : cardinal, combinaison, permutation, arrangement, binôme. Probabilité uniforme : définition, P(A∪B), P(A∩B), équiprobabilité, épreuves successives indépendantes et dépendantes (arbre). PAS loi binomiale, PAS régression/ajustement affine.",
    },
    {
      label: "Algèbre et théorie des graphes",
      limits:
        "Systèmes linéaires à n lignes et m colonnes (1≤n≤4, 1≤m≤3) : méthode de substitution et méthode du pivot de Gauss. Théorie des graphes : sommets, arêtes, ordre, nombre chromatique, théorème d'Euler, chaînes, algorithme de Dijkstra (plus courte chaîne), coloration d'un graphe, reconnaissance d'une chaîne eulérienne. PAS matrices inversibles, PAS programmation linéaire.",
    },
  ],

  // Section Lettres (3ème AS SL).
  "TN_math_3ème année secondaire_Lettres": [
    {
      label: "Analyse — Fonctions et problèmes du 2ème degré",
      limits:
        "Problèmes du 2nd degré : racines d'un trinôme, signe du trinôme. Dérivabilité : nombre dérivé, tangente, approximation affine, lien f'—variations—extrema locaux. Fonctions du programme : polynômes deg 1-3, bicarrées, (ax+b)/(cx+d). Étude graphique complète (domaine, parité, variations, extrema, position relative de deux courbes). PAS limites formelles, PAS continuité, PAS fonctions circulaires, PAS trigonométrie.",
    },
    {
      label: "Analyse — Suites numériques",
      limits:
        "Suites arithmétiques et géométriques (limite admise, somme exploitée). Suites récurrentes Uₙ₊₁=aUₙ+b : calcul des termes, représentation graphique (n,Uₙ) et sur axe, limite via suite auxiliaire géométrique. Développement décimal illimité périodique → fraction. PAS suites Uₙ=f(n) (hors programme SL), PAS principe de récurrence.",
    },
    {
      label: "Statistiques, dénombrement et probabilités",
      limits:
        "Séries à un caractère (paramètres position/dispersion) et à deux caractères (tableau, marginales, nuage, point moyen, ajustement affine). Cardinal d'un ensemble fini (sans formules combinatoires). Probabilité uniforme : définition, P(A∪B), P(A∩B), équiprobabilité, épreuves successives indépendantes et dépendantes (arbre). PAS combinaisons/permutations/arrangements formels, PAS loi binomiale.",
    },
  ],

  // Section Mathématiques (SM) — programme le plus complet, seul à inclure
  // similitudes et structures algébriques.
  "TN_math_4ème (Bac)_Mathématiques": [
    {
      label: "Suites numériques",
      limits:
        "Convergence, limite, monotonie, suites majorées/minorées ; suites définies par récurrence à 1 ET 2 termes ; suites adjacentes. PAS le critère de Cauchy.",
    },
    {
      label: "Limites et continuité",
      limits:
        "Limites en un point et à l'infini, formes indéterminées, limites comparées (lim x→+∞ e^x/x^n et ln x/x^n) ; théorème des gendarmes ; TVI et corollaire ; prolongement par continuité.",
    },
    {
      label: "Dérivabilité",
      limits:
        "Nombre dérivé, dérivées composées, dérivée d'une bijection réciproque ; théorème de Rolle, théorème des accroissements finis (TAF) ; convexité et points d'inflexion. Section Mathématiques uniquement pour Rolle/TAF.",
    },
    {
      label: "Fonctions logarithme et exponentielle",
      limits:
        "ln x et e^x : définitions, propriétés, dérivées, primitives ; études de fonctions associées ; équations et inéquations.",
    },
    {
      label: "Calcul intégral et primitives",
      limits:
        "Primitives usuelles ; intégrale de Riemann, propriétés ; intégration par parties ET changement de variable ; valeur moyenne ; calcul d'aires, longueurs et volumes de révolution.",
    },
    {
      label: "Équations différentielles",
      limits:
        "1er ordre linéaire (y' + ay = f, avec f constante, polynôme ou exponentielle) ; 2e ordre à coefficients constants (ay'' + by' + cy = 0) ; PAS les systèmes ED, PAS Wronskien.",
    },
    {
      label: "Nombres complexes",
      limits:
        "Formes algébrique, trigonométrique ET exponentielle (formules d'Euler et de Moivre) ; racines nèmes de l'unité ; résolution dans ℂ ; interprétation géométrique dans le plan complexe.",
    },
    {
      label: "Isométries et similitudes",
      limits:
        "Isométries planes (translations, rotations, réflexions, symétries glissées) ; similitudes directes ET indirectes (centre, rapport, angle) ; composition ; applications aux polygones réguliers. Section Mathématiques uniquement.",
    },
    {
      label: "Dénombrement et probabilités",
      limits:
        "Arrangements, combinaisons, formule du binôme ; variables aléatoires discrètes, espérance, variance, écart-type ; loi binomiale. PAS la loi normale ni la loi de Poisson en SM.",
    },
    {
      label: "Arithmétique dans ℤ",
      limits:
        "Divisibilité, division euclidienne, PGCD (algorithme d'Euclide étendu) ; identité de Bézout, lemme de Gauss ; congruences modulo n ; critères de divisibilité. PAS le petit théorème de Fermat (hors programme TN).",
    },
    {
      label: "Structures algébriques",
      limits:
        "Lois de composition internes ; groupe (axiomes, sous-groupes, groupes cycliques) ; anneau (ℤ, ℤ/nℤ) ; corps (ℚ, ℝ, ℂ, ℤ/pℤ pour p premier) ; morphismes. Section Mathématiques EXCLUSIVEMENT.",
    },
  ],

  // Section Sciences expérimentales (SE) — programme allégé : pas de
  // similitudes, pas de forme exponentielle, pas d'arithmétique formelle.
  "TN_math_4ème (Bac)_Sciences expérimentales": [
    {
      label: "Suites numériques",
      limits:
        "Convergence, limites, monotonie ; suites définies par récurrence simple (un seul terme précédent). PAS les suites à 2 termes, PAS les suites adjacentes.",
    },
    {
      label: "Limites et continuité",
      limits:
        "Limites usuelles, formes indéterminées de base, limites comparées simples ; TVI (énoncé et application). PAS le prolongement par continuité formel.",
    },
    {
      label: "Dérivabilité",
      limits:
        "Nombre dérivé, équation de tangente, tableau de variations, dérivées des fonctions usuelles. PAS le théorème de Rolle, PAS le théorème des accroissements finis.",
    },
    {
      label: "Fonctions logarithme et exponentielle",
      limits:
        "ln x et e^x : propriétés, dérivées, primitives élémentaires, étude graphique. Approche moins technique qu'en section Mathématiques.",
    },
    {
      label: "Calcul intégral et primitives",
      limits:
        "Primitives usuelles, intégrale de Riemann, valeur moyenne, calcul d'aires simples. PAS l'intégration par parties, PAS le changement de variable.",
    },
    {
      label: "Nombres complexes",
      limits:
        "Formes algébrique et trigonométrique UNIQUEMENT ; module, argument, conjugué ; résolution du second degré dans ℂ. PAS la forme exponentielle (Euler), PAS les racines nèmes de l'unité.",
    },
    {
      label: "Géométrie dans l'espace",
      limits:
        "Vecteurs, équations de plans et droites, orthogonalité, positions relatives ; isométries simples (translations, symétries planes/centrales). PAS de similitudes (réservées à la section Mathématiques).",
    },
    {
      label: "Probabilités",
      limits:
        "Probabilités conditionnelles, indépendance, formule de Bayes ; variables aléatoires discrètes, espérance, variance ; loi binomiale. PAS la loi normale, PAS de dénombrement avancé.",
    },
  ],

  // Section Informatique (SI) — math allégée comme SE, mais avec une
  // arithmétique solide pour la cryptographie ; pas de similitudes ni d'ED.
  "TN_math_4ème (Bac)_Informatique": [
    {
      label: "Suites numériques",
      limits:
        "Convergence, limites, suites récurrentes simples ; applications algorithmiques (étude de complexité). PAS les suites à 2 termes.",
    },
    {
      label: "Limites et continuité",
      limits: "Limites usuelles, continuité, TVI ; sans technicité avancée.",
    },
    {
      label: "Dérivabilité",
      limits:
        "Dérivées, tableau de variations ; PAS Rolle ni TAF.",
    },
    {
      label: "Fonctions logarithme et exponentielle",
      limits: "ln x et e^x : propriétés, dérivées, primitives basiques.",
    },
    {
      label: "Calcul intégral et primitives",
      limits:
        "Primitives usuelles, intégrale de Riemann ; PAS intégration par parties.",
    },
    {
      label: "Nombres complexes",
      limits:
        "Formes algébrique et trigonométrique ; opérations, module, argument. PAS la forme exponentielle.",
    },
    {
      label: "Dénombrement",
      limits:
        "Arrangements, combinaisons, formule du binôme ; applications à l'analyse de complexité d'algorithmes.",
    },
    {
      label: "Arithmétique dans ℤ",
      limits:
        "Divisibilité, PGCD (algo d'Euclide ET Euclide étendu), Bézout, lemme de Gauss, congruences modulo n ; applications cryptographiques (notion de RSA). PAS Fermat.",
    },
    {
      label: "Probabilités",
      limits:
        "Probabilités conditionnelles, variables aléatoires discrètes, espérance, variance, loi binomiale.",
    },
  ],

  // Section Technique (ST) — math appliquée à la technique ; pas de
  // nombres complexes avancés, pas d'arithmétique formelle.
  "TN_math_4ème (Bac)_Technique": [
    {
      label: "Fonctions et dérivées",
      limits:
        "Limites simples, continuité informelle, dérivée et étude de variations ; applications techniques (optimisation simple, taux de variation).",
    },
    {
      label: "Suites numériques",
      limits:
        "Suites arithmétiques et géométriques (raison, terme général, somme) ; applications pratiques. PAS les suites définies par récurrence générale.",
    },
    {
      label: "Calcul intégral",
      limits:
        "Primitives usuelles, intégrale comme aire ; PAS intégration par parties, PAS changement de variable.",
    },
    {
      label: "Logarithme et exponentielle",
      limits:
        "ln x et e^x : propriétés et dérivées de base ; applications techniques.",
    },
    {
      label: "Probabilités",
      limits: "Loi binomiale, espérance, variance ; sans dénombrement avancé.",
    },
    {
      label: "Statistiques",
      limits:
        "Séries statistiques à une et deux variables, indices, ajustement linéaire (régression).",
    },
  ],

  // Section Économie & Gestion (SEG) — accent sur applications financières
  // et statistiques ; pas de nombres complexes, pas d'arithmétique.
  "TN_math_4ème (Bac)_Économie & Gestion": [
    {
      label: "Fonctions numériques",
      limits:
        "Dérivée, étude de variations, extremums ; applications économiques : élasticité, coût marginal, recettes. PAS les théorèmes de Rolle/TAF.",
    },
    {
      label: "Suites numériques (applications financières)",
      limits:
        "Suites arithmétiques et géométriques ; intérêts simples et composés, valeur acquise et valeur actuelle, annuités constantes, amortissements.",
    },
    {
      label: "Calcul intégral",
      limits:
        "Primitives usuelles, intégrale et aire ; surplus du consommateur/producteur. Sans technique d'intégration avancée.",
    },
    {
      label: "Probabilités",
      limits:
        "Probabilités conditionnelles, formule de Bayes ; variables aléatoires discrètes, espérance, variance, loi binomiale.",
    },
    {
      label: "Statistiques à deux variables",
      limits:
        "Régression linéaire (méthode des moindres carrés), coefficient de corrélation ; séries chronologiques, indices simples et synthétiques, taux de variation.",
    },
  ],

  // Fallback générique 4ème AS (toutes sections confondues).
  // Utilisé quand aucune section n'est précisée. Contenu = union de toutes les
  // sections ; le champ limits indique quelles sections couvrent le sujet.
  "TN_math_4ème (Bac)": [
    {
      label: "Suites numériques",
      limits:
        "Toutes sections : limite d'une suite arithmétique/géométrique, suites récurrentes Uₙ₊₁=f(Uₙ). SM uniquement : suites à 2 termes, suites adjacentes, suites définies par une intégrale.",
    },
    {
      label: "Limites et continuité",
      limits:
        "Toutes sections (SM/SE/SI/ST) : limites finies et infinies, formes indéterminées, asymptotes, TVI, prolongement par continuité. SE/SI/ST : traitement plus intuitif que SM.",
    },
    {
      label: "Dérivabilité",
      limits:
        "Toutes sections : nombre dérivé, dérivées usuelles et composées, tableau de variations, extrema. SM uniquement : théorème de Rolle, théorème des accroissements finis, convexité, point d'inflexion, dérivée d'une bijection réciproque.",
    },
    {
      label: "Fonctions logarithme et exponentielle",
      limits:
        "SM/SE/ST/SI : ln x et e^x, propriétés, dérivées, primitives, études de fonctions. SM uniquement : limites usuelles avec xⁿ·ln x, eⁿˣ/xᵐ ; fonctions x↦xʳ (r∈ℝ), x↦aˣ. SEG/ST : approche plus applicative.",
    },
    {
      label: "Calcul intégral et primitives",
      limits:
        "Toutes sections : primitives usuelles, intégrale de Riemann, valeur moyenne, calcul d'aires. SM uniquement : intégration par parties ET changement de variable, volumes de révolution, fonctions définies par une intégrale. SE/SI/SEG/SL : PAS intégration par parties.",
    },
    {
      label: "Équations différentielles",
      limits:
        "SM uniquement : y'=ay+b (1er ordre linéaire) ; y''+a²y=0 (2ème ordre à coefficients constants). PAS dans les autres sections.",
    },
    {
      label: "Nombres complexes",
      limits:
        "SM/SE/ST/SI : forme algébrique, conjugué, module, argument, écriture trigonométrique, affixe, lieux géométriques. SM uniquement : forme exponentielle (Euler e^(iθ)), formule de Moivre, racines nèmes de l'unité. SE/ST/SI : PAS forme exponentielle.",
    },
    {
      label: "Géométrie dans l'espace",
      limits:
        "SM/SE/ST : vecteurs de l'espace, produit scalaire, produit vectoriel (SM/ST), équations droites/plans, positions relatives. SM uniquement : sphères, intersection plan-sphère, produit mixte (SM). SE : PAS produit vectoriel. Voir aussi le programme de 3ème AS pour les prérequis.",
    },
    {
      label: "Isométries et similitudes",
      limits:
        "SM uniquement : isométries planes (translations, rotations, réflexions, symétries glissées), similitudes directes et indirectes (centre, rapport, angle), composition, polygones réguliers. PAS dans les autres sections.",
    },
    {
      label: "Probabilités",
      limits:
        "Toutes sections : probabilités conditionnelles, indépendance, formule de Bayes, variables aléatoires discrètes, espérance, variance. Toutes sections : loi binomiale (SM/SE/SI/ST/SEG). PAS loi normale, PAS loi de Poisson.",
    },
    {
      label: "Dénombrement",
      limits:
        "SM/SI : arrangements, combinaisons, formule du binôme. SE/ST : également inclus au programme. SEG/SL : non ou très allégé.",
    },
    {
      label: "Arithmétique dans ℤ",
      limits:
        "SM/SI : divisibilité, division euclidienne, PGCD (Euclide étendu), identité de Bézout, lemme de Gauss, congruences modulo n, critères de divisibilité. SM : petit théorème de Fermat inclus. PAS dans SE/ST/SEG/SL.",
    },
    {
      label: "Structures algébriques",
      limits:
        "SM uniquement : lois de composition internes, groupe (axiomes, sous-groupes, groupes cycliques), anneau (ℤ, ℤ/nℤ), corps (ℚ, ℝ, ℂ, ℤ/pℤ), morphismes. PAS dans toutes les autres sections.",
    },
  ],

  "TN_physics_4ème (Bac)": [
    {
      label: "Mécanique : lois de Newton",
      limits:
        "Système de référence galiléen, 3 lois de Newton, théorème du centre d'inertie ; applications : chute libre, plan incliné, frottements solides f = μN.",
    },
    {
      label: "Mouvement dans un champ de pesanteur uniforme",
      limits:
        "Projectile dans le champ g = 9,8 m/s² (parfois 10 en TN) ; équations horaires, trajectoire parabolique, portée et flèche. PAS de résistance de l'air.",
    },
    {
      label: "Mouvement dans un champ électrique uniforme",
      limits:
        "Particule chargée entre plaques parallèles ; déviation, énergie cinétique gagnée (qU = ½mv²) ; oscilloscope cathodique.",
    },
    {
      label: "Oscillations mécaniques libres",
      limits:
        "Pendule élastique horizontal, pendule pesant (petites oscillations) ; équation différentielle ẍ + ω₀²x = 0 ; période propre T₀ = 2π/ω₀ ; analyse énergétique.",
    },
    {
      label: "Oscillations mécaniques forcées",
      limits:
        "Régime sinusoïdal forcé, résonance d'amplitude et résonance de vitesse ; facteur de qualité Q ; bande passante.",
    },
    {
      label: "Ondes mécaniques progressives",
      limits:
        "Onde transversale et longitudinale ; célérité, longueur d'onde λ = cT ; phénomène de propagation sur corde et à la surface d'un liquide. PAS l'onde stationnaire en détail.",
    },
    {
      label: "Ondes lumineuses (diffraction, interférences)",
      limits:
        "Diffraction par fente, écart angulaire θ = λ/a ; interférences à 2 fentes (Young), interfrange i = λD/a ; nature ondulatoire de la lumière.",
    },
    {
      label: "Dipôles RC et RL",
      limits:
        "Charge/décharge d'un condensateur (constante de temps τ = RC) ; établissement et rupture du courant dans une bobine (τ = L/R) ; énergie stockée.",
    },
    {
      label: "Oscillations électriques libres dans le RLC",
      limits:
        "Régime libre du circuit RLC série ; pseudo-période, amortissement ; équation différentielle q̈ + (R/L)q̇ + q/(LC) = 0.",
    },
    {
      label: "Oscillations électriques forcées (RLC)",
      limits:
        "Régime sinusoïdal forcé, résonance d'intensité ; impédance Z = √(R² + (Lω - 1/Cω)²) ; déphasage ; puissance moyenne P = UI cos φ.",
    },
    {
      label: "Réactions nucléaires et radioactivité",
      limits:
        "Désintégrations α, β⁻, β⁺, γ ; loi de décroissance radioactive N(t) = N₀ e^(-λt), demi-vie ; fission et fusion ; énergie de liaison par nucléon (courbe d'Aston).",
    },
  ],

  "TN_chemistry_4ème (Bac)": [
    {
      label: "Cinétique chimique",
      limits:
        "Vitesse instantanée et vitesse moyenne, facteurs cinétiques (concentration, T, catalyseur) ; temps de demi-réaction. Approche expérimentale, sans loi d'Arrhenius.",
    },
    {
      label: "Équilibre chimique",
      limits:
        "Réactions limitées, quotient de réaction Qr, constante d'équilibre K ; loi de modération (Le Chatelier) appliquée aux variations de concentration, P et T.",
    },
    {
      label: "Réactions acide-base, pH, Ke",
      limits:
        "Couple acide/base, autoprotolyse de l'eau (Ke = 10⁻¹⁴ à 25°C), pH = -log[H₃O⁺] ; force des acides et bases, Ka et pKa ; diagramme de prédominance.",
    },
    {
      label: "Solutions tampons",
      limits:
        "Définition, mélange acide faible / base conjuguée ; formule pH = pKa + log([A⁻]/[AH]) ; pouvoir tampon. Préparation pratique.",
    },
    {
      label: "Réactions d'oxydoréduction",
      limits:
        "Couple Ox/Red, demi-équations électroniques, équilibrage en milieu acide/basique ; potentiel standard E° (notion).",
    },
    {
      label: "Pile et électrolyse",
      limits:
        "Pile Daniell, demi-piles, force électromotrice, sens spontané ; électrolyse aqueuse (cuivre, eau) ; loi de Faraday (Q = It = nF).",
    },
    {
      label: "Dosages acide-base et redox",
      limits:
        "Dosage par étalonnage et par titrage colorimétrique/pH-métrique ; courbes de titrage, équivalence, choix de l'indicateur. Dosage redox au permanganate.",
    },
    {
      label: "Chimie organique : alcools, acides, esters",
      limits:
        "Nomenclature, classes d'alcools (I, II, III) ; oxydation des alcools ; réaction acide carboxylique + alcool → ester (estérification, équilibrée) ; saponification (totale).",
    },
  ],

  "TN_informatics_4ème (Bac)": [
    {
      label: "Algorithmique : structures de contrôle",
      limits:
        "Pseudo-code TN (DEBUT/FIN, SI…ALORS…SINON, TANT QUE…FAIRE, POUR…FAIRE) ; conditions composées, structures imbriquées.",
    },
    {
      label: "Types de données et opérations",
      limits:
        "ENTIER, REEL, CHAINE, BOOLEEN, CARACTERE ; opérations sur chaînes (longueur, sous-chaîne, concaténation), conversion de types.",
    },
    {
      label: "Tableaux et matrices",
      limits:
        "Tableaux 1D, parcours, recherche, mise à jour ; matrices (tableaux 2D), parcours par lignes/colonnes ; PAS les structures dynamiques (listes chaînées).",
    },
    {
      label: "Procédures et fonctions",
      limits:
        "Sous-programmes : FONCTION (renvoie une valeur) vs PROCEDURE ; passage de paramètres par valeur et par référence (variable) ; portée des variables.",
    },
    {
      label: "Récursivité",
      limits:
        "Définition récursive, cas de base, appels récursifs ; exemples : factorielle, Fibonacci, somme d'un tableau. PAS d'analyse formelle de la pile d'appels.",
    },
    {
      label: "Algorithmes de tri",
      limits:
        "Tri à bulles, tri par sélection, tri par insertion ; complexité O(n²) (notion). PAS le tri fusion ni le tri rapide au programme TN standard.",
    },
    {
      label: "Algorithmes de recherche",
      limits:
        "Recherche séquentielle (linéaire) sur un tableau quelconque ; recherche dichotomique sur tableau trié, complexité O(log n).",
    },
    {
      label: "Programmation Pascal",
      limits:
        "Langage Pascal (référence officielle) : program, var, begin/end, structures, procédures et fonctions, fichiers texte.",
    },
    {
      label: "Programmation Python",
      limits:
        "Initiation : variables, types, structures de contrôle, fonctions, listes ; introduit récemment en TN, utilisé en complément du Pascal.",
    },
    {
      label: "Bases de données et SQL",
      limits:
        "Modèle relationnel (table, attribut, clé primaire, clé étrangère) ; SQL : CREATE, INSERT, SELECT…FROM…WHERE, UPDATE, DELETE, jointures simples (INNER JOIN). PAS GROUP BY avancé, PAS sous-requêtes complexes.",
    },
  ],

  // ── UNITED STATES ──────────────────────────────────────────────────────────
  // Grade 12 AP track — single key covering BOTH AP Calculus AB and AP
  // Calculus BC. AB is a strict subset of BC; entries flag (AB+BC) for
  // shared content and (BC only) for items unique to the BC exam.
  "US_math_Grade 12 (AP)_AP track": [
    {
      label: "Limits and continuity",
      limits:
        "AB+BC. Limit laws, one-sided limits, limits at infinity, indeterminate forms (resolved without ε-δ); IVT and squeeze (sandwich) theorem; continuity on intervals. NOT formal ε-δ proofs.",
    },
    {
      label: "Differentiation: rules and basic applications",
      limits:
        "AB+BC. Power, product, quotient, chain rules; derivatives of polynomial, rational, exponential, logarithmic, trig and inverse trig (arctan, arcsin, arccos) functions; tangent line, normal line.",
    },
    {
      label: "Implicit differentiation and related rates",
      limits:
        "AB+BC. Differentiate equations not solvable for y; classic related-rates problems (sliding ladder, expanding sphere, shadow length, water tank). Set up dV/dt = (dV/dh)·(dh/dt).",
    },
    {
      label: "Mean Value Theorem and l'Hôpital's rule",
      limits:
        "AB+BC. MVT and Rolle's theorem; l'Hôpital for indeterminate forms 0/0 and ∞/∞ (also 0·∞, ∞-∞ via algebraic manipulation, and 1^∞ via logs). Applied to limits before more advanced techniques.",
    },
    {
      label: "Curve analysis (extrema, concavity, optimization)",
      limits:
        "AB+BC. Critical points, FDT/SDT, increasing/decreasing intervals, concavity and inflection; optimization problems (max area, min cost). Connecting f, f', f'' graphically.",
    },
    {
      label: "Integration and Fundamental Theorem",
      limits:
        "AB+BC. Riemann sums (left/right/midpoint/trapezoidal), definite integral as limit; FTC Part 1 (d/dx ∫ₐˣ f = f(x)) and Part 2 (∫ₐᵇ f = F(b)-F(a)); u-substitution for both definite and indefinite integrals.",
    },
    {
      label: "Advanced integration techniques",
      limits:
        "BC ONLY. Integration by parts (∫ u dv = uv - ∫ v du); partial fractions for rational functions with distinct linear factors; improper integrals (with limit definition). NOT trigonometric substitutions on the AP exam.",
    },
    {
      label: "Applications of integration (area, average value)",
      limits:
        "AB+BC. Area between two curves (vertical and horizontal slicing); average value of a function; accumulation functions g(x) = ∫ₐˣ f(t)dt and their derivatives (FTC).",
    },
    {
      label: "Volumes of revolution",
      limits:
        "AB+BC for disk/washer methods (perpendicular cross-sections); BC ONLY for the shell method. Cross-sections of known shape (squares, semicircles, equilateral triangles) included in both.",
    },
    {
      label: "Arc length and surface area",
      limits:
        "BC ONLY. Arc length L = ∫ √(1 + (dy/dx)²) dx for Cartesian curves and L = ∫ √((dx/dt)² + (dy/dt)²) dt for parametric. NOT surface area of revolution on the AP exam.",
    },
    {
      label: "Differential equations and slope fields",
      limits:
        "AB+BC. Slope fields (visualize solutions); separable DE solved by separation of variables; exponential growth/decay y' = ky; logistic growth y' = ky(1 - y/L) is BC ONLY.",
    },
    {
      label: "Euler's method (numerical DE)",
      limits:
        "BC ONLY. Approximate solution to y' = f(x,y) given (x₀,y₀) using y_{n+1} = y_n + h·f(x_n, y_n). Step size h analysis. NOT Runge-Kutta on the AP exam.",
    },
    {
      label: "Sequences and series — convergence",
      limits:
        "BC ONLY. nth-term test for divergence; geometric series Σ ar^n converges iff |r|<1; p-series Σ 1/n^p converges iff p>1; comparison test, limit comparison test, integral test, ratio test, root test, alternating series test (with error bound).",
    },
    {
      label: "Taylor and Maclaurin series",
      limits:
        "BC ONLY. Taylor polynomial of degree n centered at a; Lagrange error bound; Maclaurin series for e^x, sin x, cos x, 1/(1-x), ln(1+x); manipulate known series (substitution, differentiation, integration) to find new ones; interval and radius of convergence via ratio test.",
    },
    {
      label: "Parametric and polar functions",
      limits:
        "BC ONLY. Parametric: dy/dx = (dy/dt)/(dx/dt), velocity vector ⟨x'(t), y'(t)⟩, speed |v|; polar curves r = f(θ), area A = ½ ∫ r² dθ between angles, conversion to Cartesian. NOT 3D space curves.",
    },
    {
      label: "Vector-valued functions (motion in plane)",
      limits:
        "BC ONLY. Position r(t) = ⟨x(t), y(t)⟩, velocity, speed, acceleration; motion problems (with vectors) on the plane only. NOT vectors in 3D.",
    },
  ],
  // Honors track — same conceptual coverage as AP Calc AB but without
  // the AP exam pressure; emphasis on intuition and applications.
  "US_math_Grade 12 (AP)_Honors": [
    {
      label: "Limits and continuity",
      limits:
        "Informal limit definition, limit laws, one-sided limits, infinite limits, IVT. NOT formal ε-δ proofs, NOT squeeze theorem at the level rigor required by AP.",
    },
    {
      label: "Differentiation: rules and applications",
      limits:
        "Power rule, product/quotient/chain rules; derivatives of polynomial, rational, trig (sin, cos, tan), exp and log functions. Implicit differentiation; selected related rates problems. NOT inverse trig derivatives in detail.",
    },
    {
      label: "Curve sketching and optimization",
      limits:
        "Critical points, FDT, concavity and inflection (SDT), curve sketching combining f, f', f''; optimization with constraint via substitution. Less algebraic complexity than AP.",
    },
    {
      label: "Integration and Fundamental Theorem",
      limits:
        "Antiderivatives of basic functions; FTC Part 1 and 2; u-substitution. Riemann sums (informal). NOT integration by parts, NOT partial fractions.",
    },
    {
      label: "Applications of integration",
      limits:
        "Area between curves, average value, volumes by disk method (rotation around a horizontal/vertical line). NOT washer or shell method at full AP rigor.",
    },
    {
      label: "Introduction to differential equations",
      limits:
        "Recognize separable DE; solve y' = ky for exponential growth/decay; informal slope fields. NOT logistic growth, NOT Euler's method, NOT systems of DE.",
    },
    {
      label: "Pre-calculus review and analytic geometry",
      limits:
        "Polynomial, rational, exponential, logarithmic, trigonometric functions; conic sections (parabola, ellipse, hyperbola); polar coordinates introduction. Often interleaved with calculus units.",
    },
  ],

  // Regular track — typically a Pre-Calculus or Algebra II / Trig
  // course, with a brief informal calculus introduction.
  "US_math_Grade 12 (AP)_Regular": [
    {
      label: "Polynomial and rational functions",
      limits:
        "Factoring, end behavior, zeros (Rational Root Theorem, synthetic division), graphing rational functions with asymptotes. Long division of polynomials.",
    },
    {
      label: "Exponential and logarithmic functions",
      limits:
        "Properties of exponents and logs, change of base; solving exponential and logarithmic equations; modeling growth/decay (continuous compounding A = Pe^(rt)).",
    },
    {
      label: "Trigonometric functions and identities",
      limits:
        "Unit circle, six trig functions, graphs (period, amplitude, phase shift); Pythagorean, sum/difference, double-angle identities; solving trig equations on [0, 2π).",
    },
    {
      label: "Sequences and series (algebraic)",
      limits:
        "Arithmetic and geometric sequences; sum formulas Sₙ = n(a₁+aₙ)/2 and Sₙ = a₁(1-rⁿ)/(1-r); infinite geometric series sum a/(1-r) for |r|<1. NOT calculus-based convergence tests.",
    },
    {
      label: "Conic sections",
      limits:
        "Parabolas, ellipses, hyperbolas: standard form equations, vertices, foci, directrix, asymptotes; basic graphing. Translations of conic sections.",
    },
    {
      label: "Probability and combinatorics",
      limits:
        "Sample spaces, basic probability rules (addition, multiplication, complement); permutations and combinations (nPr, nCr); conditional probability (informal). NOT distributions.",
    },
    {
      label: "Statistics: distributions and summary",
      limits:
        "Mean, median, mode; standard deviation (calculator-based); normal distribution and z-scores (introductory level); reading scatterplots and finding line of best fit. NOT formal inference.",
    },
    {
      label: "Limits — introduction to calculus",
      limits:
        "Informal idea of limit, limit laws (verbal), one-sided limits; limit at infinity for rational functions. Possibly a basic derivative as 'rate of change'. NOT integration.",
    },
  ],

  // Generic fallback for US_math_Grade 12 (AP) when no section is chosen.
  "US_math_Grade 12 (AP)": [
    "Limits and continuity",
    "Differentiation: rules and applications",
    "Implicit differentiation, related rates",
    "Mean Value Theorem",
    "Optimization problems",
    "Integration and Fundamental Theorem of Calculus",
    "Techniques of integration (u-sub, parts, partial fractions)",
    "Applications of integration (area, volume)",
    "Differential equations (separable)",
    "Sequences and series (BC)",
    "Taylor and Maclaurin series (BC)",
    "Parametric, polar, and vector functions (BC)",
  ],
  "US_math_Grade 11": [
    "Polynomial and rational functions",
    "Exponential and logarithmic functions",
    "Trigonometric functions and identities",
    "Conic sections",
    "Sequences and series",
    "Vectors and matrices",
    "Probability and combinatorics",
    "Statistics: distributions",
    "Limits (intro to calculus)",
  ],
  "US_physics_Grade 12 (AP)": [
    "Kinematics in 1D and 2D",
    "Newton's laws and applications",
    "Work, energy, and power",
    "Linear momentum and collisions",
    "Circular motion and gravitation",
    "Rotational motion and torque",
    "Simple harmonic motion",
    "Mechanical waves and sound",
    "Electrostatics and Coulomb's law",
    "DC circuits",
    "Magnetic fields and forces",
    "Electromagnetic induction (AP Physics C)",
  ],
  "US_chemistry_Grade 12 (AP)": [
    "Atomic structure and periodicity",
    "Chemical bonding (Lewis, VSEPR, hybridization)",
    "Stoichiometry and reactions",
    "Thermochemistry (ΔH, Hess's law)",
    "Kinetics (rate laws, Arrhenius)",
    "Chemical equilibrium (Kc, Kp)",
    "Acid-base equilibria, Ka/Kb, Kw",
    "Buffers and titrations",
    "Solubility equilibria, Ksp",
    "Thermodynamics (ΔG, ΔS, spontaneity)",
    "Electrochemistry, standard potentials",
  ],
  // AP Computer Science A — Java-based, official College Board curriculum.
  // The CS Principles course (less coding) is NOT mapped here.
  "US_informatics_Grade 12 (AP)_AP track": [
    {
      label: "Java syntax and primitive types",
      limits:
        "int, double, boolean, char, String (immutable reference type); arithmetic, compound assignment (+=, *=); casting between numeric types; integer overflow (notion). NOT byte, short, long, float as separate study topics.",
    },
    {
      label: "Control structures",
      limits:
        "if/else, while, for, enhanced for-each loops; nested loops; short-circuit evaluation of && and ||; De Morgan's laws applied to boolean conditions. NOT switch statements (not on AP CS A exam).",
    },
    {
      label: "Classes and objects (OOP)",
      limits:
        "Class, instance variable, method (instance vs static), constructor, this reference; access modifiers public/private (NOT protected, NOT package-private on the AP exam); accessor and mutator methods (getters/setters).",
    },
    {
      label: "Inheritance and polymorphism",
      limits:
        "extends keyword, super for parent constructor and methods; method overriding (not overloading at the same level), polymorphism via parent reference to child object; abstract classes. NOT interfaces beyond Comparable<T>; NOT generics beyond ArrayList<T>.",
    },
    {
      label: "Strings and the String class",
      limits:
        "Methods on AP subset: length(), substring(int)/substring(int,int), indexOf(String), equals, compareTo, concat (and +); String immutability; NOT StringBuilder/StringBuffer.",
    },
    {
      label: "Arrays (1D)",
      limits:
        "Declaration, instantiation with new int[size], length attribute (not method); traversal with indexed for-loop and enhanced for-loop; common patterns: find min/max, count, search. Arrays are objects in Java (reference semantics).",
    },
    {
      label: "Two-dimensional arrays",
      limits:
        "Declared as int[][]; row-major traversal with nested loops; arr[r][c], arr.length (rows), arr[0].length (cols). Sometimes called matrices. NOT jagged arrays in detail.",
    },
    {
      label: "ArrayList<T>",
      limits:
        "On the AP subset: add(E), add(int, E), get(int), set(int, E), remove(int), size(), isEmpty() ; autoboxing of primitives (int ↔ Integer); iterating with for-each. NOT Iterator<T> directly, NOT List<T> interface separately.",
    },
    {
      label: "Recursion",
      limits:
        "Base case and recursive case; recursion on numbers (factorial, Fibonacci with note on inefficiency), strings, arrays, ArrayLists; binary search recursive implementation. NOT mutual recursion, NOT memoization on the exam.",
    },
    {
      label: "Searching algorithms",
      limits:
        "Linear search (O(n)) on any array/list; binary search (O(log n)) on a SORTED array, both iterative and recursive forms. NOT hash-based lookup.",
    },
    {
      label: "Sorting algorithms",
      limits:
        "Selection sort, insertion sort, merge sort (with array-based partition); trace through executions ; complexity intuition (selection/insertion O(n²), merge O(n log n)). NOT quicksort, NOT heap sort on the AP exam.",
    },
    {
      label: "Algorithm analysis (informal)",
      limits:
        "Counting statements/comparisons in a loop or nested loop; informal Big-O for O(1), O(n), O(n²), O(log n), O(n log n) by recognition. NOT Master Theorem, NOT formal Big-O proofs.",
    },
  ],

  // Generic fallback for the previous flat list — preserved for sessions
  // without an explicit track selection.
  "US_informatics_Grade 12 (AP)": [
    "Java syntax and primitive types",
    "Classes and objects (OOP)",
    "Inheritance and polymorphism",
    "ArrayLists and 2D arrays",
    "Recursion",
    "Searching algorithms (linear, binary)",
    "Sorting algorithms (selection, insertion, merge)",
    "Iteration over data structures",
    "Algorithm analysis (informal)",
  ],

  // ── UNITED KINGDOM ─────────────────────────────────────────────────────────
  // GB A-level scope notes: AQA/Edexcel/OCR boards share ~95 % of Pure content.
  // Statistics component: large data set, binomial, normal, hypothesis testing.
  // Mechanics component: suvat, Newton's laws, moments (content chosen by centre).
  "GB_math_A-level": [
    {
      label: "Algebraic methods",
      limits:
        "Proof by contradiction; surds and rationalising the denominator; laws of indices; factor theorem and polynomial division; partial fractions (proper, improper). PAS abstract algebra, group theory.",
    },
    {
      label: "Coordinate geometry and circles",
      limits:
        "Straight-line equations; circle equation (x−a)²+(y−b)²=r²; tangent perpendicular to radius; chord/arc/sector (radians). Parametric equations: Cartesian conversion, dy/dx via chain rule. PAS 3-D analytic geometry (Further Maths).",
    },
    {
      label: "Trigonometry",
      limits:
        "Exact values; sin²θ+cos²θ=1, sec², cosec², cot² variants; addition and double-angle formulae; R sin(θ+α) form; radian measure; small-angle approximations. PAS hyperbolic functions.",
    },
    {
      label: "Differentiation",
      limits:
        "Product, quotient, chain rules; implicit and parametric differentiation; second derivatives and concavity; related rates of change; stationary points and curve sketching. PAS ε-δ limits, higher-order implicit derivatives beyond A-level scope.",
    },
    {
      label: "Integration",
      limits:
        "Reverse chain rule; integration by parts; substitution; partial fractions; definite integrals (areas, volumes of revolution around x-axis for most boards); trapezium rule. PAS double/triple integrals.",
    },
    {
      label: "Sequences and series",
      limits:
        "Arithmetic and geometric progressions (nth term, sum formulas); binomial expansion for positive integer n (exact) and fractional/negative n (approximation, validity |x|<1). Sigma notation. PAS Taylor/Maclaurin series.",
    },
    {
      label: "Exponentials and logarithms",
      limits:
        "e^x and ln x: properties, derivatives, integrals; log laws; solving equations; exponential growth and decay models. Logarithmic graphs (linearisation).",
    },
    {
      label: "Vectors",
      limits:
        "2-D and 3-D position/direction vectors; magnitude; scalar (dot) product; angle between vectors; vector equations of lines; checking intersection/skew. PAS cross product, planes (Further Maths).",
    },
    {
      label: "Numerical methods",
      limits:
        "Change of sign / bisection; Newton-Raphson iteration; fixed-point iteration (convergence condition); trapezium rule for numerical integration (error awareness). PAS Runge-Kutta, numerical ODE solvers.",
    },
    {
      label: "Probability and statistics",
      limits:
        "Probability rules; binomial distribution B(n,p): mean np, variance npq; normal distribution N(μ,σ²): standardising, tables; Pearson correlation coefficient; regression line (PMCC). Large data set context (AQA/Edexcel).",
    },
    {
      label: "Hypothesis testing",
      limits:
        "One- and two-tailed tests for a proportion (binomial) and for a mean (normal); critical region; p-value vs significance level; Type I error. PAS Type II error, χ² test (A-level only for some boards).",
    },
    {
      label: "Mechanics: kinematics and dynamics",
      limits:
        "Suvat equations; projectile motion; Newton's 1st, 2nd, 3rd laws; connected particles (Atwood); friction (F = μR). PAS circular motion and moments if not chosen by centre.",
    },
    {
      label: "Mechanics: moments and equilibrium",
      limits:
        "Moment of a force about a point; conditions for equilibrium of a rigid body; centre of mass of uniform bodies; leaning ladder / tilting problems. PAS dynamic rotation (Further Maths).",
    },
  ],
  "GB_physics_A-level": [
    {
      label: "Mechanics: motion and forces",
      limits:
        "Suvat equations, projectile motion; Newton's laws; resolving forces; work-energy theorem, power; conservation of momentum; elastic/inelastic collisions. PAS rotational dynamics (Further Maths Physics).",
    },
    {
      label: "Materials",
      limits:
        "Hooke's law (spring constant); Young's modulus (σ = Eε); stress-strain graphs; elastic limit, yield point, plastic deformation; brittle vs ductile. Density and pressure.",
    },
    {
      label: "Waves",
      limits:
        "Progressive waves: v = fλ; transverse and longitudinal; stationary waves (harmonics); superposition and interference; path difference; coherence. Doppler effect formula. PAS Fourier analysis.",
    },
    {
      label: "Diffraction and refraction",
      limits:
        "Snell's law; total internal reflection; diffraction grating equation nλ = d sinθ; single-slit and double-slit patterns (qualitative). Refractive index n = c/v.",
    },
    {
      label: "Quantum phenomena",
      limits:
        "Photoelectric effect: hf = φ + ½mv²max, stopping voltage; photon model; wave-particle duality; de Broglie wavelength λ = h/p; energy levels and emission spectra. PAS Schrödinger equation, quantum numbers.",
    },
    {
      label: "Electricity",
      limits:
        "V = IR; series/parallel circuits; Kirchhoff's current and voltage laws; power P = IV; resistivity ρ = RA/L; EMF and internal resistance ε = I(R+r); potential divider. PAS complex AC circuits.",
    },
    {
      label: "Electric fields and capacitance",
      limits:
        "Coulomb's law; uniform field E = V/d; field lines; capacitance C = Q/V; energy ½CV²; charging/discharging RC circuits (exponential equations); time constant τ = RC. PAS Gauss's law.",
    },
    {
      label: "Magnetic fields and induction",
      limits:
        "F = BIL; F = Bqv; Fleming's left-hand rule; circular motion in magnetic field; Faraday's and Lenz's laws; ε = −dΦ/dt; transformers (ideal). PAS Maxwell's equations in full.",
    },
    {
      label: "Nuclear physics",
      limits:
        "Alpha, beta, gamma radiation; nuclear equations; radioactive decay law A = A₀e^(−λt); half-life; binding energy per nucleon; mass-energy E = mc²; fission and fusion (qualitative). PAS nuclear models beyond liquid-drop.",
    },
    {
      label: "Thermal physics and ideal gas",
      limits:
        "Internal energy; specific heat capacity Q = mcΔT; specific latent heat; gas laws (Boyle, Charles, Gay-Lussac); ideal gas equation pV = nRT = NkT; kinetic theory (mean KE = 3/2 kT). PAS van der Waals corrections.",
    },
    {
      label: "Astrophysics (option)",
      limits:
        "HR diagram; stellar evolution; Hubble's law v = Hd; redshift; cosmic microwave background; Chandrasekhar limit; black holes (descriptive). This is the AQA/Edexcel optional topic — only assess if centre selected it.",
    },
    {
      label: "Special relativity",
      limits:
        "Time dilation t = γt₀; length contraction L = L₀/γ; Lorentz factor γ = 1/√(1−v²/c²); relativistic momentum; E = mc² (rest mass energy). Covered in Edexcel A-level and AQA optional section.",
    },
  ],
  "GB_chemistry_A-level": [
    {
      label: "Atomic structure and bonding",
      limits:
        "Mass spectrometry (relative atomic mass); electron configuration in s/p/d orbitals; ionisation energy trends; ionic, covalent, metallic bonding; Lewis structures; VSEPR (shapes up to 6 pairs); intermolecular forces (London, dipole-dipole, H-bond). PAS MO theory.",
    },
    {
      label: "Energetics",
      limits:
        "Enthalpy of formation, combustion, neutralisation; Hess's law; mean bond enthalpies; Born-Haber cycle (ionic lattice energy); entropy ΔS; Gibbs free energy ΔG = ΔH − TΔS (feasibility). PAS statistical thermodynamics.",
    },
    {
      label: "Kinetics",
      limits:
        "Rate equation rate = k[A]^m[B]^n (orders determined experimentally); rate constant k units; half-life of first-order reaction; Arrhenius equation k = Ae^(−Ea/RT); reaction mechanisms (rate-determining step). PAS steady-state approximation.",
    },
    {
      label: "Equilibria",
      limits:
        "Kc and Kp expressions; units; Le Chatelier's principle (temperature, pressure, concentration effects on position and on K); heterogeneous equilibria. PAS activity, fugacity, rigorous thermodynamic derivation.",
    },
    {
      label: "Acids, bases and buffers",
      limits:
        "Brønsted-Lowry definition; pH = −log[H⁺]; Ka, Kb, Kw (pKa, pKb); strong vs weak acids/bases; pH titration curves; buffer action: Henderson-Hasselbalch; indicator choice. PAS Lewis acid-base theory beyond A-level scope.",
    },
    {
      label: "Redox and electrochemistry",
      limits:
        "Oxidation numbers; half-equations; standard electrode potentials E°; EMF = E°(cathode) − E°(anode); feasibility; electrolysis — preferential discharge, Faraday's laws (m = ItM/nF). PAS Nernst equation (some boards mention but do not calculate).",
    },
    {
      label: "Periodicity and transition metals",
      limits:
        "Period 3 oxides and chlorides (reactions with water, acid, alkali); d-block: variable oxidation states, complex ions, colour (crystal field qualitative), catalysis. NO detailed crystal field splitting calculations.",
    },
    {
      label: "Organic: alkanes, alkenes, halogenoalkanes",
      limits:
        "Homologous series; IUPAC nomenclature; free-radical substitution (alkanes); electrophilic addition (alkenes, Markovnikov); halogenoalkane reactions (SN1/SN2 with rate evidence). PAS elimination kinetics.",
    },
    {
      label: "Organic mechanisms",
      limits:
        "Curly-arrow mechanism for SN1, SN2, E1, E2, electrophilic addition, nucleophilic addition to carbonyls, acyl substitution. Stereochemistry: optical isomerism, racemisation. PAS pericyclic mechanisms.",
    },
    {
      label: "Aromatic chemistry",
      limits:
        "Benzene: Kekulé vs delocalised model; electrophilic aromatic substitution (nitration, halogenation with Lewis acid, Friedel-Crafts acylation/alkylation); electron-donating/withdrawing substituent effects on reactivity and position. PAS heterocyclic aromatic compounds.",
    },
    {
      label: "Carbonyls, carboxylic acids and derivatives",
      limits:
        "Aldehydes and ketones: nucleophilic addition (NaBH₄, HCN, tollens'/Fehling's tests); carboxylic acids: reactions; esters (esterification, hydrolysis); amines (basic, alkyl vs aryl); amides (polyamides, peptide bond). Fats and oils (saponification). PAS retrosynthetic analysis beyond A-level.",
    },
    {
      label: "Spectroscopy",
      limits:
        "Infrared: C=O ~1700, O−H 2500-3300, N−H 3200-3500 cm⁻¹; ¹H NMR: chemical shift table, integration, n+1 splitting rule; mass spectrometry: M⁺ peak, common fragment losses (m/z = 15 CH₃, 29 CHO, 45 OEt). Combined structure elucidation problems.",
    },
  ],
  "GB_informatics_A-level": [
    {
      label: "Programming fundamentals",
      limits:
        "Variables, data types, selection (if/elif/else), iteration (for/while), functions/procedures, parameter passing, local vs global scope. File I/O. Exception handling. PAS async/await, multi-threading.",
    },
    {
      label: "Data structures",
      limits:
        "Arrays/lists, stacks (LIFO — push/pop), queues (FIFO — enqueue/dequeue), linked lists, binary trees (traversal: pre/in/post-order), hash tables (hashing and collision handling), graphs (adjacency matrix/list). PAS B-trees, red-black trees.",
    },
    {
      label: "Algorithms: sorting and searching",
      limits:
        "Bubble, insertion, merge, quick sort (worst/average case); linear and binary search; Dijkstra's shortest path; A* pathfinding (AQA optional). Trace tables. PAS NP-completeness proofs.",
    },
    {
      label: "Complexity and Big-O",
      limits:
        "Time and space complexity; O(1), O(log n), O(n), O(n log n), O(n²); best/worst/average case; comparing algorithms; limits of computability (halting problem). PAS master theorem for recurrences.",
    },
    {
      label: "Boolean algebra and logic",
      limits:
        "AND, OR, NOT, XOR, NAND, NOR gates; truth tables; De Morgan's laws; simplification using Boolean laws; half-adder, full-adder circuits; Karnaugh maps (up to 4 variables — some boards).",
    },
    {
      label: "Automata and computability",
      limits:
        "Finite state machines / DFAs: state diagrams, transition tables; regular expressions (basic notation); Mealy and Moore machines; concept of the Turing machine (tape, read/write head, halting problem). PAS PDA, context-free grammars (A-level boundary).",
    },
    {
      label: "Databases and SQL",
      limits:
        "Entity-relationship (ER) diagrams; relational model; normalisation to 3NF; SQL: SELECT with WHERE, ORDER BY, GROUP BY, HAVING, JOIN (INNER, LEFT). Transactions, ACID. PAS stored procedures, triggers.",
    },
    {
      label: "Networking",
      limits:
        "OSI model (7 layers) and TCP/IP stack; IP addressing (IPv4, subnetting basics); packet switching; HTTP/HTTPS; DNS; MAC addressing; encryption: symmetric (AES) vs asymmetric (RSA) and digital certificates. PAS BGP routing internals.",
    },
    {
      label: "Object-oriented programming",
      limits:
        "Classes, objects, attributes, methods; encapsulation; inheritance (subclassing, method overriding); polymorphism; abstraction; interfaces. UML class diagrams (simple). PAS design patterns beyond scope.",
    },
    {
      label: "Recursion",
      limits:
        "Base case and recursive case; call stack; factorial, Fibonacci, tree traversal examples; tail recursion concept; converting between iterative and recursive solutions. PAS continuation-passing style.",
    },
  ],

  // ── GERMANY ────────────────────────────────────────────────────────────────
  // Leistungskurs (LK) — 5h/Woche, vertieftes Niveau. Alle Themen mit
  // formalen Beweisen; Kurvendiskussion mit Nachweis, nicht nur Rezept.
  "DE_math_Abitur_Leistungskurs (LK)": [
    {
      label: "Analysis: Grenzwerte und Stetigkeit",
      limits:
        "Grenzwert einer Funktion an einer Stelle und im Unendlichen ; Regeln ; unbestimmte Formen (l'Hôpital im LK) ; Stetigkeit, Zwischenwertsatz mit Beweis. NICHT der ε-δ-Begriff in voller Strenge.",
    },
    {
      label: "Differentialrechnung und Kurvendiskussion",
      limits:
        "Ableitungsregeln (Ketten-, Produkt-, Quotientenregel), Ableitungen von e^x, ln x, Trigonometrie ; Monotonie, lokale Extrema (1. und 2. Ableitung), Wendepunkte, Asymptoten ; vollständige Kurvendiskussion mit Begründung.",
    },
    {
      label: "Exponential- und Logarithmusfunktionen",
      limits:
        "e^x und ln x : Eigenschaften, Ableitungen, Stammfunktionen ; allgemeine Exponentialfunktion a^x = e^(x ln a) ; Wachstumsmodelle (unbegrenzt, beschränkt, logistisch). Umkehrfunktion.",
    },
    {
      label: "Integralrechnung",
      limits:
        "Stammfunktionen (auch per partieller Integration und einfacher Substitution im LK) ; Hauptsatz der Differential- und Integralrechnung ; Flächenberechnung (zwischen Kurven), Mittelwert einer Funktion, uneigentliche Integrale (Grenzwert).",
    },
    {
      label: "Gleichgewichtspunkte und Differentialgleichungen",
      limits:
        "Separierbare DGL y' = f(x)g(y) ; Wachstums-/Zerfallsgleichung y' = ky ; Logistik y' = ay(1 - y/K). Richtungsfelder. PAS lineare DGL 2. Ordnung im LK-Standard.",
    },
    {
      label: "Analytische Geometrie: Vektoren im Raum",
      limits:
        "Vektoren (Addition, Skalarmultiplikation) ; Betrag, Einheitsvektor ; Skalarprodukt und Orthogonalität ; Kreuzprodukt (im LK) ; lineare Abhängigkeit.",
    },
    {
      label: "Geraden und Ebenen",
      limits:
        "Parameterdarstellung von Geraden und Ebenen ; Normalenvektor, Koordinatenform, Hessesche Normalform (HNF) ; Abstände (Punkt–Ebene, Punkt–Gerade, Gerade–Ebene) ; Schnittwinkel.",
    },
    {
      label: "Stochastik: Wahrscheinlichkeit und Kombinatorik",
      limits:
        "Zufallsexperimente, bedingte Wahrscheinlichkeit, Satz von Bayes ; Bernoulli-Ketten ; Zufallsgrößen, Erwartungswert, Varianz, Standardabweichung.",
    },
    {
      label: "Binomial- und Normalverteilung",
      limits:
        "Binomialverteilung B(n,p) ; Normalverteilung N(μ,σ²), Standardisierung, Tabelle ; Approximation Binomial → Normal (Faustregel σ ≥ 3). Kumulierte Verteilungsfunktion.",
    },
    {
      label: "Hypothesentests",
      limits:
        "Einseitige und zweiseitige Signifikanztests für Binomialverteilung ; Fehler 1. und 2. Art, Signifikanzniveau α = 5 % oder 1 % ; kritischer Bereich. PAS Konfidenzintervalle für stetige Verteilungen im LK-Standard.",
    },
    {
      label: "Matrizen (LK, je nach Bundesland)",
      limits:
        "Matrix-Operationen (Addition, Multiplikation) ; Inverse (2×2, 3×3) ; Anwendung auf lineare Gleichungssysteme (Gauß) und Übergangsmatrizen (Markov-Ketten). NICHT in jedem Bundesland Pflicht.",
    },
  ],

  // Grundkurs (GK) — 3h/Woche, Grundniveau. Weniger formale Beweise;
  // Kernthemen ohne spezifische LK-Vertiefungen.
  "DE_math_Abitur_Grundkurs (GK)": [
    {
      label: "Analysis: Grenzwerte und Stetigkeit",
      limits:
        "Grenzwert und Stetigkeit auf Anwendungsebene, Zwischenwertsatz (ohne Beweis) ; PAS l'Hôpital, PAS ε-δ.",
    },
    {
      label: "Differentialrechnung und Kurvendiskussion",
      limits:
        "Ableitungsregeln ; Monotonie, Extrema (notwendige und hinreichende Bedingungen), Wendepunkte ; Kurvendiskussion mit Skizze. PAS vollständige formale Begründung.",
    },
    {
      label: "Exponential- und Logarithmusfunktionen",
      limits:
        "e^x und ln x : Eigenschaften, Ableitungen, einfache Stammfunktionen ; Wachstumsmodelle (unbegrenzt und begrenzt beschrieben).",
    },
    {
      label: "Integralrechnung",
      limits:
        "Stammfunktionen, Hauptsatz (FTC) ; Flächenberechnung ; einfache Substitution. PAS Integration durch Teile im GK.",
    },
    {
      label: "Analytische Geometrie: Vektoren im Raum",
      limits:
        "Vektoren, Skalarprodukt, Orthogonalität ; PAS Kreuzprodukt (typisch LK). Geraden- und Ebenengleichungen (Parameterform und Koordinatenform).",
    },
    {
      label: "Geraden und Ebenen (Abstände)",
      limits:
        "Abstände Punkt–Ebene (HNF) ; Schnittmengen ; einfache Winkel. PAS Abstand Gerade–Ebene im GK.",
    },
    {
      label: "Stochastik: Grundlagen und Verteilungen",
      limits:
        "Bedingte Wahrscheinlichkeit, Bayes (einfache Fälle), Binomialverteilung, Normalverteilung (Standardisierung) ; einseitiger Hypothesentest.",
    },
  ],

  // Fallback ohne Kurs-Niveau.
  "DE_math_Abitur": [
    "Analysis: Funktionen, Grenzwerte",
    "Ableitungen und Kurvendiskussion",
    "Integralrechnung",
    "Exponential- und Logarithmusfunktionen",
    "Analytische Geometrie: Vektoren im Raum",
    "Geraden und Ebenen",
    "Skalarprodukt, Abstandsberechnungen",
    "Stochastik: Wahrscheinlichkeit",
    "Binomial- und Normalverteilung",
    "Hypothesentests",
    "Matrizen (in einigen Bundesländern)",
  ],
  "DE_physics_Abitur": [
    {
      label: "Mechanik: Kinematik und Dynamik",
      limits:
        "Gleichförmige, gleichmäßig beschleunigte Bewegung, Kreisbewegung ; Kräfte, Reibung, Newtonsche Gesetze ; Impulserhaltung (elastischer und inelastischer Stoß). Im LK auch Variationsrechnung und Reibungsmodelle.",
    },
    {
      label: "Energie, Arbeit und Impuls",
      limits:
        "Mechanische Energie (kinetisch, potentiell, elastisch), Energieerhaltung ; Arbeit W = F·d·cos θ, Leistung P = W/t ; Impuls p = mv, Impulserhaltung.",
    },
    {
      label: "Schwingungen und Wellen",
      limits:
        "Harmonische Schwingung: x(t) = A cos(ωt+φ), ω₀ für Feder und Pendel ; gedämpfte Schwingung (Dämpfungskonstante) ; Resonanz ; Wellengleichung, Ausbreitung, Überlagerung (Schwebung, stehende Wellen).",
    },
    {
      label: "Elektromagnetismus und Felder",
      limits:
        "Elektrisches Feld (Coulomb, Plattenkondensator E = U/d) ; magnetisches Feld (Spule, Lorentzkraft F = qv×B) ; Feld- und Potentiallinien, Kapazität C = Q/U.",
    },
    {
      label: "Elektromagnetische Induktion",
      limits:
        "Faradaysches Induktionsgesetz |ε| = dΦ/dt ; Lenzsche Regel ; Selbstinduktion L (Energie EL = ½LI²) ; Wechselstromgenerator (qualitativ), Transformator.",
    },
    {
      label: "Quantenphysik",
      limits:
        "Photoelektrischer Effekt : E = hf = W₀ + Ekin ; Photon (Energie und Impuls) ; De-Broglie-Wellenlänge λ = h/p ; Materiewellen, Wellennatur des Elektrons (Doppelspalt). PAS vollständige Schrödinger-Gleichung.",
    },
    {
      label: "Atomphysik und Energieniveaus",
      limits:
        "Bohr-Modell (Energieniveaus En = -13,6 eV/n²) ; Emission und Absorption (Linienspektrum, hf = E2 - E1) ; Röntgenstrahlung (Bremsstrahlung und charakteristische Strahlung, Moseley-Gesetz in Grundzügen).",
    },
    {
      label: "Spezielle Relativitätstheorie",
      limits:
        "Postulate Einsteins ; Zeitdilatation Δt' = γΔt ; Längenkontraktion ; relativistischer Impuls und Energie E = mc² ; Lorentz-Faktor γ = 1/√(1-v²/c²). PAS die allgemeine Relativitätstheorie.",
    },
    {
      label: "Kernphysik",
      limits:
        "Radioaktiver Zerfall (α, β, γ) ; Zerfallsgesetz N(t) = N₀e^(-λt), Halbwertszeit ; Bindungsenergie, Massendefekt, E = Δmc² ; Kernspaltung (Kettenreaktion, Reaktorprinzip) ; Kernfusion (Sonne).",
    },
  ],
  "DE_chemistry_Abitur": [
    {
      label: "Atombau und Periodensystem",
      limits:
        "Schalenmodell, Orbitalmodell (s, p, d-Orbitale) ; Elektronenkonfiguration, Periodengesetz ; Ionisierungsenergie, Elektronenaffinität, Atomradius als Periodentrendsn. PAS die f-Orbitale im Detail.",
    },
    {
      label: "Chemische Bindung",
      limits:
        "Ionenbindung, kovalente Bindung (Elektronenpaar, polare Bindung, Dipolmoment) ; Metalldung ; VB-Modell (Hybridisierung sp, sp², sp³) ; VSEPR ; Molekülgeometrie ; Wasserstoffbrücken, Van-der-Waals-Kräfte.",
    },
    {
      label: "Reaktionen und Energetik (Thermochemie)",
      limits:
        "Enthalpie ΔH, Satz von Hess, Bildungsenthalpien ; Gibbs-Energie ΔG = ΔH - TΔS, Spontanität. PAS die detaillierte Berechnung von Entropieänderungen aus Tabellen (GK).",
    },
    {
      label: "Chemisches Gleichgewicht",
      limits:
        "Massenwirkungsgesetz (MWG) : Kc und Kp ; Prinzip von Le Chatelier ; Haber-Bosch-Verfahren als Beispiel. Gleichgewichtsberechnungen (Konzentration bei Gleichgewicht).",
    },
    {
      label: "Säuren und Basen",
      limits:
        "Brønsted-Definition ; Ka, Kb, Kw ; pH-Berechnung (starke und schwache Säuren/Basen) ; Pufferlösungen (Henderson-Hasselbalch pH = pKa + log [A⁻]/[HA]) ; Titration und Indikatoren.",
    },
    {
      label: "Redoxreaktionen und Elektrochemie",
      limits:
        "Oxidationszahlen ; galvanische Elemente (Daniell) ; Nernst-Gleichung (LK) : E = E° - (RT/nF)lnQ ; Standardpotentiale ; Elektrolyse, Faradaygesetze.",
    },
    {
      label: "Kinetik",
      limits:
        "Reaktionsgeschwindigkeit, Aktivierungsenergie, Arrhenius-Gleichung k = A·e^(-Ea/RT) (LK) ; Reaktionsordnung 1 und 2 ; katalytische Wirkung.",
    },
    {
      label: "Organische Chemie: Funktionalitäten",
      limits:
        "Alkane, Alkene (Addition), Alkine (Grundstruktur) ; Alkohole, Aldehyde, Ketone, Carbonsäuren, Ester, Amine ; Benennung nach IUPAC.",
    },
    {
      label: "Reaktionsmechanismen",
      limits:
        "Radikalische Substitution (Halogenierung von Alkanen) ; elektrophile Addition (Alkene + Br₂, HX, Markovnikov-Regel) ; nukleophile Substitution (SN1, SN2) ; Kondensationsreaktionen (Ester, Amid).",
    },
  ],
  "DE_informatics_Abitur": [
    {
      label: "Objektorientierte Programmierung (Java/Python)",
      limits:
        "Klasse, Objekt, Attribut, Methode, Konstruktor ; Vererbung (extends), Polymorphismus ; Schnittstellen (Interface) ; abstrakte Klassen. Sprache je nach Bundesland (meist Java oder Python).",
    },
    {
      label: "Datenstrukturen: Listen, Stapel, Schlangen",
      limits:
        "Verkettete Listen (einfach), Stapel (LIFO), Schlangen (FIFO) ; Operationen einfügen, entfernen, suchen. Implementierung mit Klassen.",
    },
    {
      label: "Bäume und Graphen",
      limits:
        "Binärbaum (Knoten, Blatt, Tiefe, Höhe) ; binärer Suchbaum (Einfügen, Suchen, Traversierung: Pre-/In-/Postorder) ; Graphen (gerichtet/ungerichtet, Matrix- und Adjazenzlisten-Darstellung) ; BFS und DFS.",
    },
    {
      label: "Algorithmen und Komplexität",
      limits:
        "Suche (linear, binär) ; Sortierung (Bubble, Selection, Insertion, Merge-Sort im LK) ; informelle Laufzeitanalyse O(n), O(n²), O(log n), O(n log n). PAS Master-Theorem.",
    },
    {
      label: "Relationale Datenbanken und SQL",
      limits:
        "Relationsmodell, Primärschlüssel, Fremdschlüssel, Entity-Relationship-Modell ; SQL : SELECT/FROM/WHERE/GROUP BY/HAVING/JOIN. PAS Normalformen in voller Theorie.",
    },
    {
      label: "Endliche Automaten (DEA, NEA)",
      limits:
        "Deterministischer und nicht-deterministischer endlicher Automat ; Zustandsübergangsfunktion, Akzeptierungssprache ; Reguläre Ausdrücke, Äquivalenz DEA–NEA (Potenzmengenkonstruktion). PAS das Pumping Lemma.",
    },
    {
      label: "Formale Sprachen (Chomsky-Hierarchie)",
      limits:
        "Typ-0 bis Typ-3 Grammatiken ; reguläre, kontextfreie, kontextsensitive, unbeschränkte Sprachen ; Ableitungsbäume kontextfreier Sprachen. PAS CYK-Algorithmus.",
    },
    {
      label: "Turingmaschinen",
      limits:
        "Aufbau und Funktionsweise ; Turingberechenbarkeit ; Halteproblem (nicht entscheidbar, Beweis durch Diagonalisierung — nur LK). PAS nichtdeterministische TM in voller Tiefe.",
    },
    {
      label: "Netzwerke und Datensicherheit",
      limits:
        "TCP/IP-Schichtenmodell, IP-Adressen, Routing (Grundprinzip) ; HTTP/HTTPS ; symmetrische Verschlüsselung (AES) ; asymmetrische Verschlüsselung (RSA, Diffie-Hellman) ; digitale Signaturen.",
    },
  ],

  // ── ITALY ──────────────────────────────────────────────────────────────────
  // 5° anno Liceo Scientifico — Indicazioni Nazionali (DM 211/2010).
  // La matematica ha un programma comune a tutti gli indirizzi; fisica e chimica
  // approfondiscono i temi dell'anno conclusivo (elettromagnetismo, relatività,
  // quantistica). La chimica organica viene in genere completata al 4° anno;
  // al 5° si possono ripassare biomolecole e polimeri.
  "IT_math_5ª Liceo Scientifico": [
    {
      label: "Limiti di funzioni",
      limits:
        "Definizione di limite (intorno, ε-δ in modo intuitivo) ; operazioni sui limiti ; forme indeterminate (∞/∞, 0/0) ; limiti notevoli (lim sin x/x = 1, lim (1+1/n)^n = e) ; asintoti (verticali, orizzontali, obliqui). PAS la topologia formale.",
    },
    {
      label: "Continuità",
      limits:
        "Definizione di continuità in un punto e su un intervallo ; classificazione delle discontinuità (1°, 2°, 3° specie) ; teorema di Bolzano (esistenza degli zeri) ; teorema di Weierstrass (max e min su compatto) ; teorema dei valori intermedi. PAS la continuità uniforme.",
    },
    {
      label: "Derivate e teoremi del calcolo differenziale",
      limits:
        "Derivate fondamentali ; regola del prodotto, quoziente, funzione composta ; derivata della funzione inversa ; teorema di Rolle, Lagrange (valore medio), Cauchy ; teorema di De L'Hôpital (applicazione alle forme indeterminate). PAS le derivate di ordine superiore oltre il programma.",
    },
    {
      label: "Studio di funzione",
      limits:
        "Dominio, parità, periodicità ; segno, intersezioni con gli assi ; monotonia, massimi/minimi locali e globali ; concavità, convessità, flessi (condizioni necessarie e sufficienti) ; asintoti ; grafico qualitativo. Comprende funzioni composte, irrazionali, trigonometriche, esponenziali, logaritmiche.",
    },
    {
      label: "Integrali indefiniti e definiti",
      limits:
        "Primitiva e integrale indefinito ; proprietà di linearità ; integrazione per sostituzione, per parti ; integrali di funzioni razionali (fratti semplici) ; teorema fondamentale del calcolo integrale (Torricelli-Barrow) ; area tra curve ; volume di solido di rotazione (metodo dei dischei). PAS gli integrali impropri (se non trattati dal docente).",
    },
    {
      label: "Calcolo combinatorio",
      limits:
        "Disposizioni, permutazioni, combinazioni (con e senza ripetizione) ; coefficienti binomiali, triangolo di Pascal ; teorema binomiale (Newton). PAS il principio di inclusione-esclusione.",
    },
    {
      label: "Probabilità",
      limits:
        "Probabilità classica, frequentista, assiomatica ; probabilità condizionata P(A|B) ; regola della moltiplicazione ; eventi indipendenti ; teorema della probabilità totale ; teorema di Bayes ; distribuzione binomiale B(n,p) ; distribuzione di Poisson (cenni). PAS la distribuzione normale (a meno che trattata dal docente).",
    },
    {
      label: "Geometria analitica nello spazio",
      limits:
        "Vettori in R³ (prodotto scalare, prodotto vettoriale) ; equazione del piano (forma cartesiana e parametrica) ; equazione della retta nello spazio ; distanze punto-piano, punto-retta, retta-retta ; sfere. PAS la geometria differenziale delle curve.",
    },
    {
      label: "Equazioni differenziali",
      limits:
        "EDO del 1° ordine a variabili separabili ; EDO lineare del 1° ordine (fattore integrante) ; EDO lineare del 2° ordine omogenea a coefficienti costanti (equazione caratteristica, radici reali distinte, reali coincidenti, complesse coniugate). PAS i sistemi differenziali e le trasformate di Laplace.",
    },
    {
      label: "Numeri complessi",
      limits:
        "Forma algebrica z = a + bi ; coniugato, modulo, operazioni ; forma trigonometrica (modulo e argomento) ; formula di Euler e^(iθ) = cosθ + i sinθ ; teorema di De Moivre ; radici n-esime di un numero complesso. PAS le serie di Laurent e i residui.",
    },
  ],
  "IT_physics_5ª Liceo Scientifico": [
    {
      label: "Elettrostatica e campo elettrico",
      limits:
        "Legge di Coulomb ; campo elettrico (vettore E) ; principio di sovrapposizione ; flusso del campo elettrico ; teorema di Gauss (per distribuzioni simmetriche) ; campo uniforme tra le armature del condensatore. PAS la forma differenziale delle equazioni di Maxwell.",
    },
    {
      label: "Potenziale elettrico e condensatori",
      limits:
        "Energia potenziale elettrica ; potenziale V, superfici equipotenziali ; circuitazione del campo elettrico (campo conservativo) ; condensatore piano: C = ε₀A/d, energia ½CV² ; condensatori in serie e in parallelo ; effetto dielettrico (costante dielettrica relativa).",
    },
    {
      label: "Corrente elettrica e circuiti",
      limits:
        "Corrente I = dq/dt ; resistività ρ, resistenza R = ρl/A ; prima e seconda legge di Ohm ; leggi di Kirchhoff ; potenza P = VI = I²R ; resistenze in serie/parallelo ; circuiti RC (carica e scarica, costante di tempo τ = RC).",
    },
    {
      label: "Campo magnetico e forza di Lorentz",
      limits:
        "Campo magnetico B ; forza di Lorentz F = qv×B ; forza su conduttore percorso da corrente F = BIl ; filo infinito (Biot-Savart semplificato) ; legge di Ampère ; solenoide B = μ₀nI ; moto di cariche in campo magnetico (eliche, ciclotrone). PAS il tensore elettromagnetico.",
    },
    {
      label: "Induzione elettromagnetica",
      limits:
        "Flusso magnetico Φ = BS cosθ ; legge di Faraday-Neumann |ε| = dΦ/dt ; regola di Lenz ; corrente indotta e forza controelettromotrice ; autoinduzione L (energia ½LI²) ; alternatore (tensione sinusoidale e^iωt in forma fasoriale). Trasformatore ideale.",
    },
    {
      label: "Onde elettromagnetiche",
      limits:
        "Equazioni di Maxwell (forma qualitativa) ; onde EM trasversali, velocità c = 1/√(ε₀μ₀) ; spettro EM (radio, micro, IR, visibile, UV, X, γ) ; energia e intensità di un'onda EM ; pressione di radiazione. PAS il calcolo esplicito delle soluzioni delle equazioni di Maxwell.",
    },
    {
      label: "Relatività ristretta",
      limits:
        "Postulati di Einstein ; simultaneità relativa ; dilatazione del tempo Δt' = γΔt₀ ; contrazione delle lunghezze L' = L₀/γ ; addizione relativistica delle velocità ; equivalenza massa-energia E = mc² ; energia totale e impulso relativistici. PAS la relatività generale.",
    },
    {
      label: "Fisica quantistica",
      limits:
        "Radiazione del corpo nero, catastrofe ultravioletta ; ipotesi di Planck E = hf ; effetto fotoelettrico (Einstein) ; effetto Compton (cenni) ; dualità onda-corpuscolo ; principio di indeterminazione di Heisenberg. PAS la meccanica quantistica ondulatoria (equazione di Schrödinger).",
    },
    {
      label: "Modelli atomici e spettri",
      limits:
        "Modello di Rutherford ; modello di Bohr: En = -13,6 eV/n² ; transizioni e spettri di emissione/assorbimento dell'idrogeno (serie di Balmer, Lyman) ; numeri quantici (cenni) ; lunghezza d'onda di De Broglie applicata agli orbitali di Bohr.",
    },
    {
      label: "Fisica nucleare",
      limits:
        "Nucleo: protoni e neutroni, numero atomico Z, numero di massa A ; forza nucleare ; radioattività: decadimento α, β⁻, β⁺, γ ; legge del decadimento N(t) = N₀e^(-λt), vita media, tempo di dimezzamento ; reazione nucleare, difetto di massa, energia di legame ; fissione (reazione a catena) e fusione (cenni).",
    },
  ],
  "IT_chemistry_5ª Liceo Scientifico": [
    {
      label: "Struttura atomica e tavola periodica",
      limits:
        "Modello a gusci e orbitali (s, p, d) ; configurazione elettronica, regola di Hund e principio di esclusione di Pauli ; proprietà periodiche (raggi atomici, energia di ionizzazione, elettronegatività, affinità elettronica). PAS gli orbitali f e i lantanidi/attinidi nel dettaglio.",
    },
    {
      label: "Legami chimici",
      limits:
        "Legame ionico, covalente puro e polare, metallico ; teoria VSEPR (previsione geometria) ; ibridizzazione sp, sp², sp³ ; momento di dipolo ; forze intermolecolari (London, dipolo-dipolo, legame a idrogeno) e loro influenza su punto di fusione/ebollizione. PAS la teoria MO.",
    },
    {
      label: "Termochimica",
      limits:
        "Entalpia di reazione ΔH ; legge di Hess ; calore di formazione, combustione, neutralizzazione ; entropia ΔS (concetto qualitativo) ; energia libera di Gibbs ΔG = ΔH - TΔS ; spontaneità di reazione. PAS il calcolo rigoroso dell'entropia da tavole.",
    },
    {
      label: "Cinetica chimica",
      limits:
        "Velocità di reazione ; legge cinetica (ordine rispetto ai reagenti, costante k) ; effetto di temperatura (equazione di Arrhenius k = Ae^(-Ea/RT)) ; meccanismo di reazione e stadio limitante ; catalisi (omogenea ed eterogenea).",
    },
    {
      label: "Equilibrio chimico",
      limits:
        "Costante di equilibrio Kc e Kp ; quoziente di reazione Q ; principio di Le Chatelier (effetti di temperatura, pressione, concentrazione) ; equilibri eterogenei ; solubilità e prodotto di solubilità Ksp. PAS la termodinamica formale dell'equilibrio (attività, fugacità).",
    },
    {
      label: "Acidi, basi e pH",
      limits:
        "Teoria di Brønsted-Lowry ; pH = -log[H⁺] ; Ka e Kb, pKa, pKw = 14 ; acidi e basi forti vs deboli ; soluzione di acido debole (approssimazione della √) ; soluzioni tampone (Henderson-Hasselbalch) ; titolazione acido-base, curva di titolazione, scelta dell'indicatore. PAS la teoria di Lewis nell'analisi quantitativa.",
    },
    {
      label: "Elettrochimica",
      limits:
        "Potenziale standard di riduzione E° ; pila elettrochimica: FEM = E°(catodo) - E°(anodo) ; equazione di Nernst E = E° - (RT/nF)ln Q ; elettrolisi: leggi di Faraday m = MIt/(nF) ; applicazioni (galvanica, accumulatore al piombo). PAS le celle a combustibile nel dettaglio.",
    },
    {
      label: "Chimica organica: idrocarburi",
      limits:
        "Alcani, alcheni, alchini, areni (IUPAC, isomeri, proprietà fisiche) ; stereoisomeria geometrica (cis/trans) e chiralità (enantiomeri, R/S) ; reazioni: sostituzione radicalica (alcani), addizione elettrofila (alcheni: Markovnikov), sostituzione elettrofila aromatica (benzene: alogenazione, nitrazione).",
    },
    {
      label: "Gruppi funzionali e biomolecole",
      limits:
        "Alcoli, fenoli, eteri, aldeidi, chetoni, acidi carbossilici, esteri, ammine, ammidi ; reazioni di esterificazione, saponificazione, amidazione ; biomolecole: glucidi (glucosio, amido, cellulosa), lipidi (trigliceridi), proteine (amminoacidi, legame peptidico, struttura primaria) ; acidi nucleici (struttura del DNA in linea di massima). PAS la sintesi peptidica dettagliata e la catena metabolica.",
    },
  ],

  // ── SPAIN ──────────────────────────────────────────────────────────────────
  // Matemáticas II — solo para la modalidad Ciencias y Tecnología.
  // Incluye álgebra lineal (matrices, determinantes, sistemas) y
  // geometría vectorial en el espacio, que NO existen en Matemáticas CCSS.
  "ES_math_2º Bachillerato_Ciencias y Tecnología": [
    {
      label: "Álgebra: matrices y determinantes",
      limits:
        "Operaciones con matrices (suma, producto, traspuesta, inversa por cofactores o por Gauss) ; determinantes hasta 3×3 (Sarrus, Laplace) ; rango de una matriz ; aplicación a sistemas lineales. Solo Matemáticas II (Ciencias), NO en CCSS.",
    },
    {
      label: "Sistemas de ecuaciones lineales",
      limits:
        "Teorema de Rouché-Fröbenius ; sistemas compatibles determinados/indeterminados, incompatibles ; resolución por Gauss-Jordan y por Cramer (det ≠ 0) ; discusión paramétrica. NO en Matemáticas CCSS.",
    },
    {
      label: "Geometría vectorial en el espacio",
      limits:
        "Vectores en ℝ³ (módulo, ángulo, producto escalar, vectorial y mixto) ; ecuaciones de recta y plano (vectorial, paramétrica, continua, implícita) ; posiciones relativas recta-recta, recta-plano, plano-plano ; distancias y ángulos. Solo Ciencias.",
    },
    {
      label: "Límites y continuidad",
      limits:
        "Límites en un punto y en el infinito, operaciones, formas indeterminadas ; ramas infinitas (asíntotas horizontales, verticales, oblicuas) ; Teorema de Bolzano (TVI). PAS los límites en ℝⁿ.",
    },
    {
      label: "Derivadas y aplicaciones",
      limits:
        "Derivadas de funciones elementales ; reglas (producto, cociente, cadena) ; diferencial ; crecimiento y decrecimiento, extremos relativos/absolutos ; regla de L'Hôpital (formas 0/0 y ∞/∞) ; tasa de variación y problemas de optimización.",
    },
    {
      label: "Estudio completo de funciones",
      limits:
        "Dominio, continuidad, ramas infinitas, monotonía, curvatura (cóncava/convexa, puntos de inflexión), extremos ; representación gráfica completa. Funciones racional, exponencial, logarítmica, trigonométrica.",
    },
    {
      label: "Integrales indefinidas",
      limits:
        "Primitivas inmediatas ; integración por partes ; cambio de variable ; descomposición en fracciones simples (denominador de 1er y 2º grado). PAS la integración de funciones trigonométricas complejas.",
    },
    {
      label: "Integrales definidas y aplicaciones",
      limits:
        "Regla de Barrow (FTC) ; área entre dos curvas (eje X o Y como referencia) ; volumen de revolución (método del disco). PAS la longitud de arco.",
    },
    {
      label: "Probabilidad condicionada y Bayes",
      limits:
        "Probabilidad condicionada P(A|B) ; regla de la multiplicación ; independencia ; teorema de la probabilidad total ; Bayes (fórmula y árbol). No confundir con Estadística inferencial.",
    },
    {
      label: "Distribuciones: binomial y normal",
      limits:
        "Distribución binomial B(n,p): esperanza np, varianza npq ; distribución normal N(μ,σ²): propiedades, tipificación Z = (X-μ)/σ, tablas ; aproximación binomial→normal (criterio: np ≥ 5 y nq ≥ 5).",
    },
    {
      label: "Inferencia estadística",
      limits:
        "Distribución de la media muestral (TCL) ; intervalo de confianza para la media (σ conocida, z) y para una proporción ; determinación del tamaño muestral. PAS los contrastes de hipótesis formales en Bachillerato estándar.",
    },
  ],

  // Matemáticas Aplicadas a las CCSS II — Humanidades y Ciencias Sociales.
  // Sin matrices, sin geometría vectorial en el espacio, sin límites avanzados.
  "ES_math_2º Bachillerato_Humanidades y Ciencias Sociales": [
    {
      label: "Álgebra: programación lineal",
      limits:
        "Inecuaciones lineales, sistemas de inecuaciones en ℝ² ; método gráfico para optimización lineal (región factible, vértices) ; problemas aplicados (economía, logística). PAS matrices ni determinantes.",
    },
    {
      label: "Funciones: estudio y representación",
      limits:
        "Dominio, continuidad (Bolzano) ; ramas infinitas (asíntotas) ; monotonía, extremos ; curvatura básica ; representación gráfica de funciones polinómicas, racionales simples, exponenciales, logarítmicas. Sin geometría en el espacio.",
    },
    {
      label: "Derivadas y aplicaciones (CCSS)",
      limits:
        "Derivadas de funciones elementales, regla de la cadena ; crecimiento, mínimos y máximos ; elasticidad de la demanda (aplicación económica) ; interpretación de la derivada como tasa de variación instantánea.",
    },
    {
      label: "Integrales definidas y aplicaciones (CCSS)",
      limits:
        "Primitivas inmediatas (sin técnicas avanzadas) ; regla de Barrow ; área entre curvas (figuras planas sencillas). PAS cambio de variable, PAS partes, PAS fracciones simples en detalle.",
    },
    {
      label: "Estadística descriptiva bivariante",
      limits:
        "Nube de puntos, covarianza, coeficiente de correlación de Pearson r ; recta de regresión por mínimos cuadrados ; predicción ; interpretación de r² (coeficiente de determinación).",
    },
    {
      label: "Probabilidad y Bayes (CCSS)",
      limits:
        "Probabilidad condicionada, regla de la multiplicación, independencia, Bayes ; con énfasis en aplicaciones sociales y económicas (sanidad, marketing).",
    },
    {
      label: "Distribuciones: binomial y normal (CCSS)",
      limits:
        "Distribución binomial B(n,p) ; distribución normal N(μ,σ²), tipificación, tablas, propiedades de simetría ; aproximación de la binomial por la normal.",
    },
    {
      label: "Inferencia estadística (CCSS)",
      limits:
        "Distribución de la media muestral, TCL ; intervalo de confianza para la media y para una proporción ; tamaño muestral necesario. PAS contrastes de hipótesis.",
    },
  ],

  // Fallback genérico sin modalidad.
  "ES_math_2º Bachillerato": [
    "Álgebra: matrices y determinantes",
    "Sistemas de ecuaciones lineales",
    "Geometría en el espacio (vectores, rectas, planos)",
    "Límites y continuidad",
    "Derivadas y aplicaciones",
    "Estudio de funciones",
    "Integrales indefinidas y definidas",
    "Aplicaciones de la integral",
    "Probabilidad condicionada, Bayes",
    "Distribuciones (binomial, normal)",
    "Inferencia estadística",
  ],
  "ES_physics_2º Bachillerato": [
    {
      label: "Gravitación universal y campo gravitatorio",
      limits:
        "Ley de Newton, fuerza y campo gravitatorio g = GM/r² ; energía potencial gravitatoria Ep = -GMm/r ; leyes de Kepler ; satélites (velocidad, período) ; movimiento orbital circular. PAS mecánica celestial relativista.",
    },
    {
      label: "Movimiento ondulatorio",
      limits:
        "Magnitudes (amplitud, período, frecuencia, longitud de onda, velocidad) ; ecuación de onda y = A sin(ωt - kx) ; energía de una onda ; efecto Doppler (fuente y observador en movimiento) ; ondas estacionarias.",
    },
    {
      label: "Óptica geométrica y física",
      limits:
        "Reflexión y refracción (Snell), índice de refracción ; reflexión total interna ; espejos y lentes delgadas (ecuación de las lentes, distancia focal) ; difracción e interferencias (Young, condición de máximos/mínimos).",
    },
    {
      label: "Campo eléctrico y potencial",
      limits:
        "Ley de Coulomb ; campo E y potencial V en cargas puntuales y distribuciones simétricas ; energía potencial eléctrica ; capacitor plano (E = σ/ε₀) ; trabajo W = qΔV. PAS la ecuación de Poisson.",
    },
    {
      label: "Campo magnético e inducción",
      limits:
        "Fuerza de Lorentz F = qv×B ; campo de un hilo rectilíneo, espira, solenoide (B = μ₀nI) ; inducción: ley de Faraday |ε| = dΦ/dt, Lenz ; fem de movimiento.",
    },
    {
      label: "Física cuántica (efecto fotoeléctrico, dualidad)",
      limits:
        "Cuerpo negro (catástrofe ultravioleta, ley de Wien, Stefan — cualitativamente) ; efecto fotoeléctrico: hf = W₀ + Ekin ; dualidad onda-corpúsculo, longitud de De Broglie λ = h/p. PAS la ecuación de Schrödinger.",
    },
    {
      label: "Relatividad especial",
      limits:
        "Postulados de Einstein ; dilatación temporal Δt' = γΔt ; contracción espacial l' = l/γ ; masa relativista y energía E = mc² ; E² = (pc)² + (m₀c²)². PAS relatividad general.",
    },
    {
      label: "Física nuclear",
      limits:
        "Composición del núcleo, número másico y atómico ; energía de enlace, defecto de masa ΔE = Δmc² ; radiactividad (α, β, γ), ley de desintegración N(t) = N₀e^(-λt) ; fisión y fusión (aplicaciones). PAS modelos nucleares de capas.",
    },
  ],
  "ES_chemistry_2º Bachillerato": [
    {
      label: "Estructura atómica y configuración electrónica",
      limits:
        "Números cuánticos (n, l, m, s) ; orbitales (s, p, d, f) ; principio de Aufbau, Hund, Pauli ; configuración electrónica y propiedades periódicas (radio, energía de ionización, electronegatividad).",
    },
    {
      label: "Enlace químico y geometría molecular",
      limits:
        "Enlace iónico, covalente, metálico ; energía de enlace ; VSEPR (geometría de Gillespie) ; hibridación (sp, sp², sp³) ; polaridad de enlace y molécula ; fuerzas intermoleculares.",
    },
    {
      label: "Termoquímica",
      limits:
        "Entalpía ΔH : calor de reacción, formación, combustión ; ley de Hess ; energía de red (ciclo de Born-Haber en conceptual). PAS la entropía y la energía libre de Gibbs en detalle.",
    },
    {
      label: "Cinética química",
      limits:
        "Velocidad de reacción, factores (concentración, T, catalizador, superficie) ; ley de velocidad (orden 0, 1, 2) ; t₁/₂ para orden 1 ; ecuación de Arrhenius k = Ae^(-Ea/RT) ; catálisis (homogénea, heterogénea, enzimática).",
    },
    {
      label: "Equilibrio químico",
      limits:
        "Constante de equilibrio Kc y Kp (relación Kp = Kc(RT)^Δn) ; ley de Le Chatelier ; grado de disociación ; equilibrios heterogéneos (Kc solo con gases/disoluciones). PAS la termodinámica del equilibrio (ΔG = -RT ln K).",
    },
    {
      label: "Equilibrios en disolución (ácido-base)",
      limits:
        "Ka, Kb, Kw ; pH de soluciones de ácidos/bases fuertes y débiles ; soluciones tampón (Henderson-Hasselbalch) ; hidrólisis de sales ; curvas de valoración (titulación) ; indicadores.",
    },
    {
      label: "Reacciones de oxidación-reducción",
      limits:
        "Números de oxidación, ajuste por el método del ion-electrón (en medio ácido y básico). Identificación de oxidante/reductor.",
    },
    {
      label: "Electroquímica",
      limits:
        "Celda galvánica (ánodo, cátodo) ; potenciales estándar de electrodo E° ; FEM = E°(cátodo) - E°(ánodo) ; predicción de reacciones espontáneas ; electrólisis, ley de Faraday Q = nFz.",
    },
    {
      label: "Química orgánica: nomenclatura e isomería",
      limits:
        "Nomenclatura IUPAC de alcanos, alquenos, alquinos, ciclocompuestos, grupos funcionales (OH, CHO, CO, COOH, NH₂, halógenos) ; isomería constitucional y estereoisomería (geométrica cis/trans, quiral con C*). PAS nomenclatura IUPAC 2013 de prioridad R/S formal.",
    },
    {
      label: "Reacciones orgánicas",
      limits:
        "Sustitución (SN1, SN2 básico) ; adición electrofílica (alquenos + HX, X₂, H₂O/Markovnikov) ; eliminación (regla de Zaitsev) ; sustitución aromática electrofílica (benceno) ; esterificación, saponificación.",
    },
    {
      label: "Polímeros y biomoléculas",
      limits:
        "Polímeros de adición y condensación ; plásticos (polietileno, PVC, nylon, poliéster) ; gomas ; biomoléculas (glúcidos, lípidos, proteínas, ácidos nucleicos) — nivel descriptivo. PAS síntesis orgánica multietapa.",
    },
  ],

  // ── EGYPT ──────────────────────────────────────────────────────────────────
  // Scientific — Mathematics section: full mathematics program including
  // complex numbers, 3D analytic geometry, and calculus.
  "EG_math_Grade 12 (Thanaweya Amma)_Scientific — Mathematics section": [
    {
      label: "Algebra and complex numbers",
      limits:
        "Complex number z = a+bi: algebraic, trigonometric and exponential (Euler) forms; De Moivre; n-th roots of unity; solving equations in ℂ; geometric interpretation. Polynomials: remainder theorem, factor theorem, Vieta's formulas.",
    },
    {
      label: "Trigonometry and identities",
      limits:
        "Sum/difference, double-angle, half-angle identities; solving trig equations on [0, 2π]; inverse trig (arcsin, arccos, arctan — principal values); trig form of complex numbers.",
    },
    {
      label: "Analytic geometry (2D and 3D)",
      limits:
        "Conic sections (circle, parabola, ellipse, hyperbola) — standard forms, foci, directrices ; 3D: coordinates, distance, direction cosines, equation of a line and plane in space. NOT Bézier curves.",
    },
    {
      label: "Differential calculus",
      limits:
        "Limits and continuity (IVT) ; derivatives (rules, chain, implicit) ; L'Hôpital ; higher-order derivatives ; Taylor expansion (first few terms). NOT formal ε-δ.",
    },
    {
      label: "Applications of derivatives",
      limits:
        "Increasing/decreasing, extrema (FDT/SDT), concavity ; optimization problems ; related rates (selected). NOT calculus of variations.",
    },
    {
      label: "Integral calculus",
      limits:
        "Antiderivatives ; FTC ; integration by substitution and by parts ; area between curves ; volume of revolution (disk method). NOT surface area of revolution.",
    },
    {
      label: "Differential equations",
      limits:
        "Separable DE ; first-order linear DE (integrating factor) ; exponential growth/decay ; simple second-order DE with constant coefficients (ay'' + by' + cy = 0). NOT Laplace transforms.",
    },
    {
      label: "Statistics and probability",
      limits:
        "Descriptive statistics (mean, variance, SD) ; frequency distributions ; permutations and combinations ; probability rules, Bayes ; binomial distribution ; introduction to normal distribution (z-scores).",
    },
  ],

  // Scientific — Sciences section: lighter math; no complex numbers in
  // exponential form and no 3D analytic geometry.
  "EG_math_Grade 12 (Thanaweya Amma)_Scientific — Sciences section": [
    {
      label: "Algebra and functions",
      limits:
        "Polynomial functions, rational expressions, partial fractions ; quadratic equations and inequalities. Complex numbers: algebraic and trigonometric forms ONLY (NO exponential/Euler form).",
    },
    {
      label: "Trigonometry",
      limits:
        "Core identities, solving equations ; inverse trig (arctan mainly) ; law of sines/cosines applied to triangles. Simpler scope than Mathematics section.",
    },
    {
      label: "Analytic geometry (2D)",
      limits:
        "Conic sections (circle, parabola) in standard form ; basic locus problems. NO 3D geometry for the Sciences section.",
    },
    {
      label: "Differential calculus",
      limits:
        "Limits (informal), derivatives (standard rules) ; relative extrema ; no L'Hôpital, no Taylor expansion. Applied focus (rate of change).",
    },
    {
      label: "Integral calculus",
      limits:
        "Antiderivatives, FTC ; u-substitution ; area under a curve. NO integration by parts, NO volume of revolution in Sciences section.",
    },
    {
      label: "Statistics and probability",
      limits:
        "Descriptive statistics ; permutations, combinations ; probability rules, Bayes (applied to science contexts) ; binomial distribution basics.",
    },
  ],

  // Generic fallback — no section selected.
  "EG_math_Grade 12 (Thanaweya Amma)": [
    "Algebra and complex numbers",
    "Trigonometry and identities",
    "Analytic geometry (3D)",
    "Differential calculus",
    "Applications of derivatives",
    "Integral calculus",
    "Differential equations (introduction)",
    "Statistics and probability",
  ],
  "EG_physics_Grade 12 (Thanaweya Amma)": [
    {
      label: "Mechanics: dynamics and Newton's laws",
      limits:
        "Newton's 3 laws (Arabic textbook: g ≈ 9.8 m/s² or 10 m/s²) ; kinematics (1D and 2D with vectors) ; work-energy theorem ; momentum and impulse ; circular motion (centripetal force).",
    },
    {
      label: "Waves and sound",
      limits:
        "Mechanical waves : speed, frequency, wavelength (v = fλ) ; transverse vs longitudinal ; superposition, stationary waves ; sound speed, Doppler effect. NOT EM waves here.",
    },
    {
      label: "Geometric optics",
      limits:
        "Reflection, refraction (Snell's law), critical angle and TIR ; mirrors (concave, convex) and lenses (converging, diverging) using mirror/lens equation 1/f = 1/u + 1/v ; magnification.",
    },
    {
      label: "Electrostatics and capacitors",
      limits:
        "Coulomb's law ; electric field E = F/q ; potential V = kQ/r ; capacitor C = Q/V ; energy stored U = ½CV² ; parallel plate capacitor. NOT Gauss's law in detail.",
    },
    {
      label: "Current electricity",
      limits:
        "Ohm's law, resistivity ; series/parallel circuits ; Kirchhoff's laws ; EMF and internal resistance ; power P = I²R = V²/R.",
    },
    {
      label: "Magnetism and electromagnetic induction",
      limits:
        "Magnetic force on moving charge F = qvBsinθ ; force on current-carrying wire ; solenoid B = μ₀nI ; Faraday's law |ε| = N|ΔΦ/Δt| ; Lenz's law ; AC generator principle.",
    },
    {
      label: "Modern physics (photoelectric effect, atomic models)",
      limits:
        "Photoelectric effect : hf = W₀ + Ekin ; photon E = hf ; Bohr model En = -13.6/n² eV ; spectral series ; de Broglie λ = h/p. NOT Schrödinger equation.",
    },
    {
      label: "Nuclear physics",
      limits:
        "Radioactive decay (α, β, γ) ; half-life t₁/₂ = 0.693/λ ; binding energy and Q-value via E = Δmc² ; fission and fusion (conceptual). NOT chain reaction engineering.",
    },
  ],
  "EG_chemistry_Grade 12 (Thanaweya Amma)": [
    {
      label: "Periodic table and atomic structure",
      limits:
        "Electron configuration (subshells) ; periodic trends (atomic radius, ionization energy, electronegativity) ; types of elements (s, p, d, f blocks). NOT relativistic effects on heavy elements.",
    },
    {
      label: "Chemical bonding",
      limits:
        "Ionic, covalent, metallic bonding ; Lewis structures ; VSEPR ; hybridization (sp, sp², sp³) ; polar bonds and molecular polarity ; intermolecular forces (H-bond, van der Waals).",
    },
    {
      label: "Stoichiometry and chemical reactions",
      limits:
        "Mole concept, Avogadro's number ; molar mass ; percent composition ; empirical and molecular formulas ; limiting reagent ; yield. NOT complex titrimetry.",
    },
    {
      label: "Chemical equilibrium",
      limits:
        "Kc and Kp ; Le Chatelier's principle ; Haber and Contact processes as examples ; solubility product Ksp (introduced here in EG curriculum).",
    },
    {
      label: "Acids, bases, and salts",
      limits:
        "Arrhenius, Brønsted-Lowry definitions ; strong vs weak acids/bases ; pH = -log[H⁺] ; neutralisation ; salt hydrolysis ; buffer solution (qualitative). NOT Henderson-Hasselbalch in detail.",
    },
    {
      label: "Redox and electrochemistry",
      limits:
        "Oxidation numbers ; balancing redox (half-reaction method) ; galvanic cell (EMF) ; electrolysis (Faraday's laws Q = nFz). NOT Nernst equation.",
    },
    {
      label: "Organic chemistry: hydrocarbons and functional groups",
      limits:
        "IUPAC nomenclature (alkanes, alkenes, alkynes, alcohols, aldehydes, ketones, carboxylic acids, esters, amines) ; isomers ; main reaction types (addition, substitution, elimination, esterification). NOT stereochemistry in depth.",
    },
    {
      label: "Industrial chemistry",
      limits:
        "Haber process (nitrogen fixation, conditions) ; Contact process (SO₃ → H₂SO₄) ; cracking of petroleum ; important polymers (PVC, polyethylene, nylon). Conceptual level, NOT process engineering calculations.",
    },
  ],

  // ── INDIA ──────────────────────────────────────────────────────────────────
  // PCM stream — Science stream with Physics, Chemistry, Mathematics.
  // NCERT/CBSE Class 12. Mathematics is compulsory in this stream.
  "IN_math_Class 12_Science (PCM — Physics, Chemistry, Math)": [
    {
      label: "Relations and functions",
      limits:
        "Types of relations (reflexive, symmetric, transitive, equivalence); types of functions (injective, surjective, bijective); composition and inverse of functions. NOT abstract group theory.",
    },
    {
      label: "Inverse trigonometric functions",
      limits:
        "Definitions, domain and range; principal value branch; properties (sin⁻¹(-x) = -sin⁻¹x, etc.) and identities; evaluation of expressions. NOT inverse of sec/csc/cot in depth.",
    },
    {
      label: "Matrices",
      limits:
        "Types of matrices; addition, scalar multiplication, transpose, symmetric/skew-symmetric; matrix multiplication; elementary row operations for row-echelon form. NOT eigenvalues.",
    },
    {
      label: "Determinants",
      limits:
        "Expansion along any row/column; properties of determinants; area of a triangle; cofactors, adjugate; inverse matrix A⁻¹ = adj(A)/det(A); solving linear systems via Cramer's rule or inverse. Determinants up to 3×3.",
    },
    {
      label: "Continuity and differentiability",
      limits:
        "Continuous functions, algebra of continuous functions; differentiability at a point; chain rule; implicit differentiation; derivatives of parametric functions; second-order derivatives; Rolle's theorem and MVT (statements + applications). NOT ε-δ proofs.",
    },
    {
      label: "Applications of derivatives",
      limits:
        "Rate of change, increasing/decreasing functions (sign of f'); tangent and normal; maxima/minima (first and second derivative tests); approximation using differentials. NOT calculus of variations.",
    },
    {
      label: "Integrals (indefinite and definite)",
      limits:
        "Standard integrals; substitution; integration by parts (∫uv dx = u∫v dx – ∫(u'∫v dx)dx); partial fractions (linear and quadratic factors); definite integral (FTC); properties (∫ₐᵇ f = ∫ₐᵇ f(a+b-x)). NOT improper integrals in depth.",
    },
    {
      label: "Applications of integrals",
      limits:
        "Area under a curve (between curve and x/y axis); area between two curves. Only standard regions from NCERT examples; NOT surface area or volumes of revolution.",
    },
    {
      label: "Differential equations",
      limits:
        "Order, degree; solutions (general and particular); variable separable; homogeneous DE (y = vx substitution); linear 1st order (integrating factor μ = e^∫P dx). NOT 2nd order DE.",
    },
    {
      label: "Vector algebra",
      limits:
        "Types of vectors; addition, scalar multiplication, position vectors; dot product (angle, projection); cross product (area of parallelogram/triangle); scalar triple product. In component form and geometrically.",
    },
    {
      label: "Three-dimensional geometry",
      limits:
        "Direction cosines and ratios; equation of a line (vector and Cartesian forms); angle between lines; equation of a plane (normal and intercept forms); distance of a point from a plane; angle between line and plane. NOT curved surfaces in 3D.",
    },
    {
      label: "Linear programming",
      limits:
        "Feasible region, corner-point method; maximise/minimise a linear objective function subject to linear constraints. 2D problems only; graphical method. NOT simplex algorithm.",
    },
    {
      label: "Probability (Bayes' theorem)",
      limits:
        "Conditional probability; multiplication rule; independent events; Bayes' theorem; random variable (discrete), expected value, variance; Bernoulli trials; binomial distribution B(n,p). NOT normal or Poisson distributions in NCERT Class 12 standard.",
    },
  ],
  // Fallback: PCB stream has no math at Class 12 standard level.
  "IN_math_Class 12": [
    "Relations and functions",
    "Inverse trigonometric functions",
    "Matrices",
    "Determinants",
    "Continuity and differentiability",
    "Applications of derivatives",
    "Integrals (indefinite and definite)",
    "Applications of integrals",
    "Differential equations",
    "Vector algebra",
    "Three-dimensional geometry",
    "Linear programming",
    "Probability (Bayes' theorem)",
  ],
  "IN_physics_Class 12": [
    {
      label: "Electrostatics and Gauss's law",
      limits:
        "Coulomb's law (in vector form), electric field lines, flux, Gauss's theorem (symmetric charge distributions: sphere, cylinder, plane); electric potential V, potential energy, work done; equipotential surfaces. NOT multipole expansion.",
    },
    {
      label: "Capacitance and dielectrics",
      limits:
        "Capacitor: parallel plate, spherical, cylindrical; capacitance C = Q/V; energy U = ½CV²; combinations in series/parallel; dielectric (polarisation, dielectric constant, effect on C). NOT RC circuit transients here.",
    },
    {
      label: "Current electricity",
      limits:
        "Ohm's law, resistivity, temperature dependence; Kirchhoff's laws; Wheatstone bridge; meter bridge (potentiometer); internal resistance of a cell. NOT AC circuits in this chapter.",
    },
    {
      label: "Magnetic effects of current",
      limits:
        "Biot-Savart law (circular loop, solenoid, toroid) ; Ampere's circuital law ; force on a current-carrying conductor in B ; torque on a current loop (galvanometer) ; moving coil galvanometer, ammeter, voltmeter. NOT Hall effect.",
    },
    {
      label: "Electromagnetic induction",
      limits:
        "Faraday's law, Lenz's law ; motional EMF ε = Bvl ; mutual and self-inductance (L = NΦ/I) ; energy stored in an inductor E = ½LI². NOT eddy currents in depth.",
    },
    {
      label: "Alternating current",
      limits:
        "AC voltage, rms values ; resistors, inductors and capacitors in AC ; phasors ; series LCR circuit, resonance (ω₀ = 1/√LC), Q-factor ; power in AC circuits (P = V_rms I_rms cos φ) ; transformer (ideal).",
    },
    {
      label: "Electromagnetic waves",
      limits:
        "Displacement current, Maxwell's equations (qualitative) ; EM spectrum (wavelengths and uses) ; energy density of EM waves ; speed of EM waves c = 1/√(ε₀μ₀). NOT derivation of wave equation.",
    },
    {
      label: "Ray optics and optical instruments",
      limits:
        "Reflection (mirror formula), refraction (Snell, critical angle, TIR) ; lens maker's equation, thin lens formula ; combination of lenses and mirrors ; power of lens ; microscope and telescope (magnification). NOT wave optics here.",
    },
    {
      label: "Wave optics",
      limits:
        "Huygens' principle ; Young's double slit (fringe width β = λD/d) ; coherence ; single-slit diffraction (minima: a sin θ = mλ) ; resolving power (Rayleigh criterion). NOT diffraction grating formula in NCERT standard.",
    },
    {
      label: "Dual nature of matter and radiation",
      limits:
        "Photoelectric effect (work function W₀, threshold frequency, stopping potential eV₀ = hf - W₀) ; Einstein's photon theory ; De Broglie wavelength λ = h/p ; Davisson-Germer experiment. NOT Compton effect in NCERT Class 12.",
    },
    {
      label: "Atoms — Bohr model",
      limits:
        "Rutherford model, Bohr postulates ; energy levels En = -13.6/n² eV ; spectral lines (Lyman, Balmer, Paschen series) ; ionisation and excitation energy. NOT quantum mechanical model.",
    },
    {
      label: "Nuclei",
      limits:
        "Nuclear radius (R = R₀A^(1/3)), binding energy, B/A curve ; Q-value of a reaction ; radioactive decay (α, β, γ) ; law N(t) = N₀e^(-λt), half-life ; nuclear fission and fusion (Q-values). NOT detailed nuclear models.",
    },
    {
      label: "Semiconductor electronics",
      limits:
        "p-type, n-type semiconductors ; p-n junction diode (IV characteristic, forward/reverse bias) ; half-wave and full-wave rectification ; Zener diode (voltage regulator) ; transistor (NPN, CE config, amplifier action, α and β) ; logic gates (AND, OR, NOT, NAND, NOR, XOR). NOT MOSFETs.",
    },
  ],
  "IN_chemistry_Class 12": [
    {
      label: "Solid state",
      limits:
        "Crystal lattices and unit cells (cubic: SC, BCC, FCC) ; packing efficiency ; point defects (Schottky, Frenkel, interstitial) ; electrical and magnetic properties of solids. NOT advanced group theory of crystals.",
    },
    {
      label: "Solutions and colligative properties",
      limits:
        "Henry's law ; Raoult's law (vapour pressure lowering) ; colligative properties: elevation of boiling point, depression of freezing point, osmotic pressure ; van't Hoff factor i for electrolytes. NOT activity coefficients.",
    },
    {
      label: "Electrochemistry",
      limits:
        "Galvanic cell, SHE, Nernst equation E = E° - (RT/nF)ln Q ; standard electrode potentials ; electrolysis, Faraday's laws ; conductance (molar and specific), Kohlrausch's law.",
    },
    {
      label: "Chemical kinetics",
      limits:
        "Rate law, order, rate constant k ; integrated rate equations (zero, first, second order) ; half-life ; Arrhenius equation k = Ae^(-Ea/RT), activation energy from graph ; collision theory (qualitative).",
    },
    {
      label: "Surface chemistry",
      limits:
        "Adsorption (physisorption vs chemisorption, Freundlich isotherm) ; colloids (types, Tyndall effect, Brownian motion, coagulation) ; emulsions. NOT detailed BET theory.",
    },
    {
      label: "p-block elements (Group 15–18)",
      limits:
        "Group 15 (N, P — allotropy, hybridisation in compounds, oxoacids) ; Group 16 (O, S) ; Group 17 (halogens, interhalogen) ; Group 18 (noble gases, compounds of Xe). Properties and trends.",
    },
    {
      label: "d- and f-block elements and coordination compounds",
      limits:
        "Transition metals: electronic configuration, color, magnetic behavior, oxidation states ; inner transition (lanthanoids, actinoids) ; coordination compounds: nomenclature, isomerism (geometrical, optical), VBT and CFT (basic). Werner's theory.",
    },
    {
      label: "Haloalkanes and haloarenes",
      limits:
        "Nomenclature, nature of C–X bond ; nucleophilic substitution (SN1 and SN2 mechanisms, stereochemistry) ; elimination (E2 basics) ; Grignard reagent (concept). NOT radical reactions.",
    },
    {
      label: "Alcohols, phenols, and ethers",
      limits:
        "Classification, nomenclature ; acidity of alcohols and phenols ; oxidation reactions (primary → aldehyde → acid) ; reactions of phenol (electrophilic aromatic substitution) ; ether preparation (Williamson synthesis).",
    },
    {
      label: "Aldehydes, ketones, and carboxylic acids",
      limits:
        "Preparation, nucleophilic addition (Grignard, CN⁻, HCN, LiAlH₄ concept) ; aldol condensation ; Cannizzaro reaction ; carboxylic acid derivatives (acyl chlorides, esters, amides) ; HVZ reaction. NOT multistep synthesis problems.",
    },
    {
      label: "Amines",
      limits:
        "Classification (1°, 2°, 3°, quaternary) ; basicity, salt formation ; diazotisation of primary amines ; coupling reaction (azo dye). NOT complex heterocyclic amine synthesis.",
    },
    {
      label: "Biomolecules and polymers",
      limits:
        "Carbohydrates (mono-, di-, polysaccharides ; reducing vs non-reducing sugars ; Fischer projections concept) ; proteins (amino acids, peptide bond, denaturation) ; nucleic acids (DNA/RNA structure, Watson-Crick) ; polymers (addition, condensation, natural and synthetic). NOT detailed biochemical pathways.",
    },
  ],
  "IN_informatics_Class 12": [
    "Python programming review",
    "Data structures: lists, tuples, dictionaries",
    "Stacks and queues",
    "File handling",
    "Functions and recursion",
    "Sorting (bubble, insertion, selection)",
    "Searching (linear, binary)",
    "SQL: DDL, DML, joins",
    "Computer networks (TCP/IP, topologies)",
    "Society, law, and ethics",
  ],

  // ── CHINA ──────────────────────────────────────────────────────────────────
  // 高三 全国卷 (Gaokao) — 高考数学 reflects the 2017 课标 (Curriculum Standards).
  // 理科 (sciences) and 文科 (humanities) used to differ; the new 新高考 unifies
  // most content. Notes below cover the unified 全国卷 scope.
  "CN_math_高三 (Gaokao)": [
    {
      label: "集合与逻辑 (Sets and logic)",
      limits:
        "集合的运算 (并、交、补) ; 命题 (逆、否、逆否) ; 充分条件、必要条件、充要条件 ; 全称量词 ∀ 与存在量词 ∃。不包含集合论的公理化与基数。",
    },
    {
      label: "函数 (Functions)",
      limits:
        "定义域、值域 ; 单调性、奇偶性、周期性 ; 分段函数 ; 复合函数 ; 反函数 ; 指数函数 a^x、对数函数 log_a x、幂函数 x^α 的图像与性质。不包含 ε-δ 严格定义。",
    },
    {
      label: "三角函数 (Trigonometric functions)",
      limits:
        "弧度制 ; 任意角的三角函数定义 (单位圆) ; 同角三角函数关系 (sin²+cos²=1) ; 诱导公式 ; 两角和差、二倍角公式 ; 正余弦定理 ; 辅助角公式 a sin x + b cos x = √(a²+b²) sin(x+φ) ; 三角函数图像变换。",
    },
    {
      label: "数列 (Sequences and series)",
      limits:
        "等差数列 (通项 aₙ=a₁+(n-1)d, 求和 Sₙ=n(a₁+aₙ)/2) ; 等比数列 (通项 aₙ=a₁q^(n-1), 求和 Sₙ=a₁(1-q^n)/(1-q) 当 q≠1) ; 数学归纳法 ; 由递推关系求通项 (常见技巧 : 累加、累乘、构造法)。不包含级数收敛性判别。",
    },
    {
      label: "不等式 (Inequalities)",
      limits:
        "一元二次不等式 ; 绝对值不等式 ; 均值不等式 (a+b ≥ 2√(ab) 当 a,b > 0) ; 柯西不等式 (选修 4-5 的部分命题考)。不包含切比雪夫不等式、Jensen 不等式。",
    },
    {
      label: "导数及其应用 (Derivatives and applications)",
      limits:
        "基本初等函数的导数公式 ; 导数四则运算法则 ; 复合函数求导 ; 利用导数判断单调性、求极值/最值 ; 切线方程 ; 简单的不等式证明 (含参数讨论)。不考二阶导数判断凹凸的形式化推导以外的高阶。",
    },
    {
      label: "立体几何 (Solid geometry)",
      limits:
        "棱柱、棱锥、棱台、圆柱、圆锥、圆台、球的表面积与体积 ; 直线与平面的位置关系 (平行、垂直判定与性质定理) ; 二面角、线面角的计算 ; 空间向量法 (建立坐标系求角与距离)。",
    },
    {
      label: "解析几何 (Analytic geometry)",
      limits:
        "直线方程 ; 圆的方程 ; 椭圆、双曲线、抛物线的标准方程 ; 离心率、准线、焦点 ; 直线与圆锥曲线的位置关系 (相交、相切、相离 ; 弦长公式)。不考圆锥曲线的极坐标统一方程的高考拓展。",
    },
    {
      label: "概率与统计 (Probability and statistics)",
      limits:
        "古典概型与几何概型 ; 条件概率 P(A|B) ; 独立事件 ; 二项分布 B(n,p) (E=np, D=npq) ; 离散型随机变量分布列、期望、方差 ; 正态分布 N(μ,σ²) (3σ 原则) ; 抽样方法 (简单随机、分层) ; 线性回归 ; 独立性检验 (2×2 列联表 χ²)。",
    },
    {
      label: "排列组合与二项式定理 (Permutations, combinations, binomial)",
      limits:
        "加法/乘法计数原理 ; 排列 A(n,k) 与组合 C(n,k) ; 二项式定理 (a+b)^n 通项 T_(k+1)=C(n,k)a^(n-k)b^k ; 二项式系数性质。不考多项式定理。",
    },
  ],
  "CN_physics_高三 (Gaokao)": [
    {
      label: "运动学 (Kinematics)",
      limits:
        "直线运动 (匀速、匀变速 v=v₀+at, x=v₀t+½at², v²-v₀²=2ax) ; 自由落体 ; 位移-时间图、速度-时间图 ; 相对运动。",
    },
    {
      label: "牛顿运动定律 (Newton's laws)",
      limits:
        "三大定律 (惯性、F=ma、作用与反作用) ; 摩擦力 (滑动 f=μN, 静摩擦最大值) ; 受力分析 ; 共点力平衡 ; 连接体问题 (整体法、隔离法)。",
    },
    {
      label: "曲线运动 (Curvilinear motion)",
      limits:
        "运动的合成与分解 ; 平抛运动 (水平匀速、竖直自由落体的合成) ; 匀速圆周运动 (周期 T=2π/ω, 向心力 F=mv²/r=mω²r) ; 一般圆周运动的临界问题 (绳模型、杆模型)。",
    },
    {
      label: "万有引力与航天 (Gravitation and spaceflight)",
      limits:
        "万有引力定律 F=GMm/r² ; 第一宇宙速度 (近地卫星) ; 同步卫星 ; 开普勒第三定律 T²/a³=常数 ; 双星系统问题。不考广义相对论修正。",
    },
    {
      label: "机械能守恒 (Conservation of energy)",
      limits:
        "功 W=Fx cosθ, 功率 P=Fv ; 动能定理 W_合=ΔE_k ; 重力势能 ; 弹性势能 ; 机械能守恒条件与判断 ; 含摩擦的能量转化问题。",
    },
    {
      label: "动量守恒 (Momentum conservation)",
      limits:
        "冲量 I=Ft, 动量定理 I=Δp ; 动量守恒条件 ; 完全弹性碰撞、完全非弹性碰撞、一般碰撞 ; 反冲、爆炸 ; 多体多过程问题。",
    },
    {
      label: "热学 (Thermodynamics, kinetic theory)",
      limits:
        "分子动理论 (布朗运动、阿伏伽德罗常数) ; 理想气体状态方程 pV=nRT ; 气体三大实验定律 (玻意耳、查理、盖-吕萨克) ; 内能、热力学第一定律 ΔU=Q+W ; 热力学第二定律 (定性认识)。不考统计热力学。",
    },
    {
      label: "静电场 (Electrostatics)",
      limits:
        "库仑定律 F=kq₁q₂/r² ; 电场强度 E、叠加原理 ; 电场线、等势面 ; 电势差 U_AB=W_AB/q ; 电场力做功与电势能 ; 平行板电容器 C=Q/U=εS/(4πkd)。不考高斯定理。",
    },
    {
      label: "恒定电流 (Steady current)",
      limits:
        "欧姆定律 I=U/R ; 部分电路与全电路 (电源电动势 ε、内阻 r ; ε=U_外+Ir) ; 串、并联电路 ; 焦耳定律 Q=I²Rt ; 电表的改装 (分压、分流) ; 实验 : 测电阻、测电源 ε 和 r。",
    },
    {
      label: "磁场 (Magnetic field)",
      limits:
        "磁感应强度 B ; 磁感线 ; 安培力 F=BIL sinθ ; 洛伦兹力 F=qv×B ; 带电粒子在匀强磁场中的圆周运动 (回旋半径 r=mv/(qB), 周期 T=2πm/(qB)) ; 速度选择器、质谱仪、回旋加速器原理。",
    },
    {
      label: "电磁感应 (Electromagnetic induction)",
      limits:
        "磁通量 Φ=BS cosθ ; 法拉第电磁感应定律 ε=-dΦ/dt ; 楞次定律 ; 自感、互感 (定性) ; 交流电的产生、有效值 ; 变压器 U₁/U₂=n₁/n₂ ; 远距离输电。",
    },
    {
      label: "光学与近代物理 (Optics and modern physics)",
      limits:
        "几何光学 : 反射、折射、全反射、薄透镜成像公式 ; 光的干涉 (杨氏双缝)、衍射、偏振 ; 光电效应 hf=W₀+½mv²_max ; 玻尔氢原子模型 (能级公式 Eₙ=-13.6/n² eV) ; 原子核 : α、β、γ衰变, 半衰期, 质量亏损与结合能 E=Δmc² ; 核反应方程的配平。",
    },
  ],
  "CN_chemistry_高三 (Gaokao)": [
    {
      label: "原子结构与元素周期律",
      limits:
        "原子核外电子排布 (1-36 号元素) ; 能级、能层、原子轨道 (s, p, d) ; 元素周期表的结构 ; 原子半径、第一电离能、电负性的周期性变化。",
    },
    {
      label: "化学键与晶体结构",
      limits:
        "离子键、共价键 (σ键、π键)、金属键 ; 共价分子的极性 ; 杂化轨道理论 (sp, sp², sp³) 与 VSEPR ; 分子间作用力 (范德华力、氢键) ; 四种晶体类型 (离子、原子、分子、金属) 及其性质对比。",
    },
    {
      label: "化学反应与能量",
      limits:
        "焓变 ΔH 与反应热 ; 热化学方程式的书写 ; 盖斯定律 (ΔH 的加和性) ; 反应自发性的判据 ΔG=ΔH-TΔS<0 (定性)。不考绝对熵的计算。",
    },
    {
      label: "化学反应速率与化学平衡",
      limits:
        "反应速率的表示与影响因素 (浓度、温度、催化剂、压强) ; 化学平衡常数 K (与温度有关) ; 勒夏特列原理 ; 平衡转化率的计算 (三段式) ; 等效平衡。",
    },
    {
      label: "电解质溶液与离子平衡",
      limits:
        "强弱电解质 ; 弱酸/弱碱的电离平衡 (Ka, Kb) ; 水的离子积 Kw=10⁻¹⁴ (25°C) ; pH 的计算 (强酸强碱、弱酸弱碱、缓冲溶液) ; 盐类水解 (规律 : 谁弱谁水解, 越弱越水解) ; 沉淀溶解平衡 Ksp。",
    },
    {
      label: "氧化还原反应",
      limits:
        "氧化数的判定 ; 氧化剂、还原剂 ; 半反应法配平 (酸性、碱性介质) ; 双线桥与单线桥的分析 ; 氧化性、还原性的强弱比较。",
    },
    {
      label: "电化学 (原电池, 电解池)",
      limits:
        "原电池 : 正负极判断、电极反应式 ; 电动势 (定性) ; 常见电池 (干电池、铅蓄电池、锂电池、燃料电池) ; 电解池 : 阴阳极放电规律 ; 电镀、精炼铜、氯碱工业 ; 法拉第定律 m=MIt/(nF)。",
    },
    {
      label: "有机化学 (烃, 醇, 醛, 酸, 酯)",
      limits:
        "烷烃、烯烃、炔烃、芳香烃 (苯及其同系物) ; 醇、酚、醛、酮、羧酸、酯、卤代烃 ; 主要反应类型 (取代、加成、消去、氧化、还原、酯化、水解、加聚、缩聚) ; 同分异构体的书写 ; 简单合成路线设计 (3-4 步)。",
    },
    {
      label: "实验化学",
      limits:
        "常见仪器的使用 ; 物质的分离与提纯 (过滤、蒸发、蒸馏、萃取、分液、层析) ; 物质的检验 (常见离子、有机基团) ; 中和滴定 ; 实验室制备 (Cl₂、NH₃、SO₂、O₂、H₂、CO₂、乙烯、乙酸乙酯)。",
    },
  ],

  // ── JAPAN ──────────────────────────────────────────────────────────────────
  // 高3 共通テスト — 学習指導要領 (2018 年改訂、2022 年度高校入学生から実施)。
  // 数学は「数学I+A」と「数学II+B+C」の2科目構成 ; 「数学III」は二次試験
  // (個別大学) のみ出題。理科 4 科目から 2 つを選択 (物理基礎/物理、化学基礎/化学、
  // 生物基礎/生物、地学基礎/地学)。情報I は 2025 年度から共通テスト必須。
  "JP_math_高3 (共通テスト)": [
    {
      label: "数学I: 数と式, 図形と計量",
      limits:
        "数と式 (実数、平方根、絶対値、整式の展開・因数分解、二次方程式・不等式) ; 図形と計量 (鋭角・鈍角の三角比、正弦定理 a/sinA=2R、余弦定理 a²=b²+c²-2bc cosA、面積公式 S=½ab sinC)。共通テストでは数学IA で必須。",
    },
    {
      label: "数学II: 三角関数, 指数・対数",
      limits:
        "三角関数 (一般角の三角関数、加法定理 sin(α+β)=sinα cosβ+cosα sinβ、二倍角・半角・合成 R sin(θ+α))、グラフ ; 指数関数 a^x と対数関数 log_a x のグラフと方程式 ; 指数・対数の不等式。共通テストでは数学IIB で必須。",
    },
    {
      label: "数学III: 極限",
      limits:
        "数列の極限 (収束・発散、はさみうちの原理) ; 関数の極限 (lim_{x→a} f(x)、片側極限、無限小・無限大) ; 三角関数・指数関数・対数関数の極限 (lim sin x/x = 1) ; 連続関数。理系のみ・共通テスト範囲外、個別二次試験で出題。",
    },
    {
      label: "数学III: 微分法",
      limits:
        "三角関数・指数関数・対数関数・無理関数・分数関数の導関数 ; 合成関数・逆関数の微分 ; 高次導関数 ; 関数のグラフの凹凸と変曲点 ; 速度・加速度。理系のみ。",
    },
    {
      label: "数学III: 積分法",
      limits:
        "不定積分・定積分 (置換積分、部分積分) ; 区分求積法 (定積分の定義) ; 面積、体積 (回転体、断面積) ; 弧長 ; 微分方程式 (簡単な変数分離形のみ)。理系のみ。",
    },
    {
      label: "数学III: 複素数平面",
      limits:
        "複素数の極形式 z=r(cosθ+i sinθ) ; 加減乗除の幾何的意味 (回転と拡大) ; ド・モアブルの定理 (cosθ+i sinθ)^n = cos(nθ)+i sin(nθ) ; 1のn乗根 ; 複素数を係数とする方程式の解。理系のみ。",
    },
    {
      label: "数学A: 場合の数と確率",
      limits:
        "順列 P(n,r) と組合せ C(n,r) ; 重複順列・重複組合せ ; 事象の確率 ; 独立試行・反復試行 ; 条件付き確率 P(A|B) ; 期待値 E(X)。共通テスト数学IA で頻出。",
    },
    {
      label: "数学A: 整数の性質",
      limits:
        "ユークリッドの互除法 ; 一次不定方程式 ax+by=c の整数解 ; 合同式 (剰余) の性質 ; 進法 (n進法→10進法、10進法→n進法の変換)。共通テスト数学IA で選択。",
    },
    {
      label: "数学B: 数列",
      limits:
        "等差数列 (一般項 a_n=a₁+(n-1)d、和 S_n=n(a₁+a_n)/2) ; 等比数列 (一般項 a_n=a₁r^(n-1)、和 S_n=a₁(1-r^n)/(1-r)) ; Σ記号と公式 (Σk=n(n+1)/2, Σk²=n(n+1)(2n+1)/6) ; 漸化式 ; 数学的帰納法。",
    },
    {
      label: "数学B: ベクトル",
      limits:
        "平面ベクトル・空間ベクトル (大きさ、内積 a·b=|a||b|cosθ) ; ベクトルの分解と成分表示 ; 位置ベクトル ; 直線・平面の方程式 ; 内積を用いた図形問題 (内分点、重心、外心)。",
    },
    {
      label: "数学C: 平面上の曲線",
      limits:
        "二次曲線 (楕円 x²/a²+y²/b²=1、双曲線、放物線 y²=4px) ; 焦点・準線・離心率 ; 媒介変数表示 (サイクロイド、リサジュー曲線) ; 極座標 r=f(θ) と直交座標との変換。",
    },
  ],
  "JP_physics_高3 (共通テスト)": [
    {
      label: "力学: 運動と力",
      limits:
        "等速直線運動・等加速度直線運動 (v=v₀+at, x=v₀t+½at², v²-v₀²=2ax) ; 落体運動 ; ニュートンの運動の法則 (慣性、F=ma、作用反作用) ; 摩擦力 (静止摩擦・動摩擦) ; 力のつり合い・連結体の問題。",
    },
    {
      label: "力学: 運動量とエネルギー",
      limits:
        "仕事 W=Fx cosθ、運動エネルギー K=½mv²、位置エネルギー (重力 mgh、弾性 ½kx²) ; 力学的エネルギー保存則 ; 運動量 p=mv、力積 J=Ft、運動量保存則 ; 弾性衝突・非弾性衝突 (反発係数 e)。",
    },
    {
      label: "力学: 円運動と単振動",
      limits:
        "等速円運動 (周期 T=2π/ω、向心力 F=mv²/r=mrω²) ; 単振動 (x=A sin(ωt+φ)、周期 T=2π√(m/k) for ばね、T=2π√(L/g) for 単振り子) ; 万有引力 F=GMm/r²、ケプラーの第三法則。",
    },
    {
      label: "熱力学",
      limits:
        "気体の状態方程式 pV=nRT ; ボイル・シャルルの法則 ; 気体の内部エネルギー U=(3/2)nRT (単原子) ; 熱力学第一法則 ΔU=Q+W ; 等温・定積・定圧・断熱変化のp-V図 ; 熱効率 η=1-Q_2/Q_1。",
    },
    {
      label: "波動: 波の性質, 音, 光",
      limits:
        "波の基本式 v=fλ ; 横波と縦波 ; 重ね合わせの原理、定常波 ; 反射・屈折 (Snell の法則 n=sini/sinr)、回折、干渉 (ヤングの実験 dx/L=λ) ; ドップラー効果 f'=(V-vO)/(V-vS)·f ; 光の分散・偏光 ; 薄膜干渉。",
    },
    {
      label: "電磁気: 電場と電位",
      limits:
        "クーロンの法則 F=kq₁q₂/r² ; 電場 E、電位 V (V=kq/r、E=-dV/dx) ; 等電位面と電気力線 ; コンデンサー (平行板 C=εS/d、エネルギー U=½CV²) ; 直列・並列接続 ; 誘電体。",
    },
    {
      label: "電磁気: 電流と磁場",
      limits:
        "オームの法則 V=IR、抵抗率 ρ、抵抗の直列・並列 ; キルヒホッフの法則 ; 電流の作る磁場 (直線電流 B=μ₀I/(2πr)、円形電流、ソレノイド B=μ₀nI) ; アンペールの法則 ; 磁場中の電流に働く力 F=BIL、荷電粒子に働くローレンツ力 F=qvB ; ホール効果。",
    },
    {
      label: "電磁気: 電磁誘導",
      limits:
        "磁束 Φ=BS cosθ ; ファラデーの電磁誘導の法則 ε=-dΦ/dt ; レンツの法則 ; 自己誘導 L (エネルギー ½LI²)、相互誘導 ; 交流発電機・変圧器 V₁/V₂=N₁/N₂ ; LC 回路の共振 ω=1/√(LC)。",
    },
    {
      label: "原子: 光電効果, ボーア模型",
      limits:
        "光電効果 hf=W₀+½mv²_max (限界振動数 ν₀) ; コンプトン効果 (定性) ; ド・ブロイ波長 λ=h/p ; ボーアの水素原子モデル (E_n=-13.6/n² eV、量子条件 mvr=nh/(2π)) ; 原子のスペクトル (バルマー系列など)。",
    },
    {
      label: "原子核: 放射性崩壊",
      limits:
        "α崩壊・β崩壊・γ崩壊と放射線の性質 ; 放射性崩壊の法則 N=N₀e^(-λt) (半減期 T=ln2/λ) ; 質量欠損と結合エネルギー E=Δmc² ; 核分裂・核融合 (定性) ; 核反応式の和の保存。",
    },
  ],
  "JP_chemistry_高3 (共通テスト)": [
    {
      label: "物質の構成と化学結合",
      limits:
        "原子の構造、同位体、電子配置 (1-20 番元素中心) ; モル質量、アボガドロ定数 ; イオン結合・共有結合・金属結合 ; 配位結合 ; 結晶の種類 (イオン、分子、共有結合、金属) ; 分子の形 (正四面体、正三角錐、平面)、極性。",
    },
    {
      label: "物質の状態 (気体, 液体, 固体)",
      limits:
        "気体の状態方程式 pV=nRT、混合気体 (分圧 = モル分率×全圧) ; 蒸気圧、状態図 ; 結晶格子 (体心立方、面心立方、六方最密) と充填率 ; 溶液の濃度 (モル濃度、質量モル濃度) ; 凝固点降下・沸点上昇・浸透圧 (ファントホッフの法則 πV=nRT)。",
    },
    {
      label: "化学反応とエネルギー",
      limits:
        "反応熱 (生成熱、燃焼熱、中和熱、溶解熱) ; ヘスの法則 ; 結合エネルギー ; 化学反応式の量的関係 (mol、g、L) ; 熱化学方程式の書き方。",
    },
    {
      label: "反応速度と化学平衡",
      limits:
        "反応速度の表し方 ; 速度定数 k と濃度依存性 (反応次数) ; 活性化エネルギーと触媒の役割 ; 平衡定数 K ; ル・シャトリエの原理 ; 弱酸・弱塩基の電離定数 Ka, Kb ; 緩衝液 (ヘンダーソン-ハッセルバルヒ)。",
    },
    {
      label: "酸と塩基, pH",
      limits:
        "ブレンステッドの酸塩基 ; pH=-log[H⁺] ; 強酸・強塩基の pH ; 弱酸・弱塩基の pH (近似計算) ; 中和反応と中和滴定 ; 滴定曲線と指示薬の選択 ; 塩の加水分解。",
    },
    {
      label: "酸化還元と電池",
      limits:
        "酸化数 ; 半反応式と電子バランス ; イオン化傾向 ; 電池 (ダニエル電池、ボルタ電池、鉛蓄電池、リチウムイオン電池、燃料電池) ; 標準電極電位 E° (定性) ; 電気分解とファラデーの法則 m=MIt/(nF)。",
    },
    {
      label: "無機物質",
      limits:
        "周期表の典型元素 (1, 2, 13-18 族 — Na, Mg, Al, C, N, P, O, S, ハロゲン、希ガス) の単体・化合物の性質と反応 ; 工業的製法 (ハーバー・ボッシュ法、接触法、アンモニアソーダ法、電解工業) ; 遷移元素 (Fe, Cu, Ag, Cr, Mn) の特徴 ; 金属イオンの定性分析 (沈殿の系統分離)。",
    },
    {
      label: "有機化合物 (脂肪族, 芳香族)",
      limits:
        "脂肪族 (アルカン、アルケン、アルキン、アルコール、アルデヒド、ケトン、カルボン酸、エステル、アミン) の IUPAC 命名と反応 ; 芳香族 (ベンゼン、フェノール、アニリン、サリチル酸、安息香酸) の置換反応 ; 異性体 (構造、立体、光学) ; 官能基の検出反応 (フェーリング、銀鏡、ヨードホルム反応など)。",
    },
    {
      label: "高分子化合物",
      limits:
        "重合反応 (付加重合、縮合重合) ; 合成繊維 (ナイロン、ポリエステル、アクリル) ; 合成樹脂 (熱可塑性 vs 熱硬化性) ; 天然高分子 (デンプン、セルロース、タンパク質、核酸) ; 糖類 (単糖、二糖、多糖)、アミノ酸とペプチド結合、酵素のはたらき。",
    },
  ],
  "JP_informatics_高3 (共通テスト)": [
    {
      label: "情報社会と情報倫理",
      limits:
        "個人情報保護、知的財産権 (著作権、産業財産権)、サイバー犯罪 ; インターネット利用の倫理 ; 情報社会の課題 (デジタルデバイド、フェイクニュース、SNS の問題) ; 個人情報保護法、不正アクセス禁止法。",
    },
    {
      label: "コンピュータの仕組み",
      limits:
        "ハードウェア構成 (CPU、メモリ、ストレージ、I/O) ; CPU の動作原理 (フェッチ・デコード・実行サイクル) ; 機械語と高級言語 ; 論理演算 (AND、OR、NOT、XOR) と論理回路 ; OS の役割。",
    },
    {
      label: "アルゴリズムとプログラミング (Python)",
      limits:
        "変数、データ型、演算子 ; 制御構造 (順次、選択 if、反復 for/while) ; 関数の定義と呼び出し ; リスト、文字列の操作 ; 共通テスト用擬似言語 (DNCL) と Python の対応 ; 整列アルゴリズム (バブルソート、選択ソート)、探索 (線形、二分探索)。",
    },
    {
      label: "データの表現 (二進法, 文字コード)",
      limits:
        "10進法・2進法・16進法の相互変換 ; 整数の表現 (符号付き、符号なし、2の補数) ; 浮動小数点数 (IEEE 754 概要) ; 文字コード (ASCII、JIS、Unicode) ; 画像 (RGB、ピクセル) と音 (サンプリング、量子化) のデジタル化、圧縮の概念 (可逆/非可逆)。",
    },
    {
      label: "ネットワークとセキュリティ",
      limits:
        "TCP/IP プロトコルの階層モデル ; IPアドレス (IPv4)、サブネットマスク、DNS ; HTTP/HTTPS、メールの仕組み ; 暗号化 (共通鍵、公開鍵、ハイブリッド方式) ; 電子署名と認証局 ; ファイアウォール、ウイルス対策。",
    },
    {
      label: "データベース基礎",
      limits:
        "関係データベースの基本 (テーブル、レコード、フィールド、主キー、外部キー) ; SQL の基本 (SELECT、WHERE、ORDER BY、JOIN — 簡単なもの) ; 正規化 (1NF まで) ; ER 図の読み取り ; トランザクションの概念 (ACID は概要のみ)。",
    },
    {
      label: "問題解決とモデル化",
      limits:
        "シミュレーション (確定的・確率的) ; 表計算ソフトでの統計分析 (平均、分散、標準偏差、相関係数 r) ; データの可視化 (棒グラフ、折れ線、散布図、箱ひげ図) ; 回帰分析 (一次回帰の概念) ; 仮説検定の概念 (有意水準、p 値の解釈)。",
    },
  ],

  // ── SOUTH KOREA ────────────────────────────────────────────────────────────
  // 2015 개정 교육과정 — 수학 영역 「공통과목 + 선택과목」 체제.
  // 공통 (수학Ⅰ, 수학Ⅱ) + 선택 1과목 (확률과 통계 / 미적분 / 기하) 응시.
  // 자연계열 학생은 일반적으로 「미적분 + 기하」, 인문계열은 「확률과 통계」 선택.
  "KR_math_고3 (수능)": [
    {
      label: "지수함수와 로그함수",
      limits:
        "지수의 확장 (실수 지수, 음의 지수, 분수 지수) ; 지수함수 a^x의 그래프와 성질 (a>1, 0<a<1) ; 로그의 정의와 성질 (밑변환, log_a b = ln b / ln a) ; 로그함수의 그래프 ; 지수·로그 방정식과 부등식. 수학Ⅰ에서 다룸.",
    },
    {
      label: "삼각함수",
      limits:
        "일반각과 호도법 (radian) ; 삼각함수의 정의와 그래프 (사인, 코사인, 탄젠트의 주기·범위) ; 사인법칙 (a/sinA = 2R), 코사인법칙 (a² = b² + c² - 2bc cosA) ; 덧셈정리 (sin(α±β), cos(α±β), tan(α±β)) - 미적분 선택자만 ; 합성 R sin(θ+φ). 수학Ⅰ.",
    },
    {
      label: "수열 (등차, 등비, 점화식)",
      limits:
        "등차수열 (일반항 a_n = a + (n-1)d, 합 S_n = n(a+l)/2) ; 등비수열 (일반항 ar^(n-1), 합 a(1-r^n)/(1-r)) ; 시그마 표기 ; Σk, Σk², Σk³ 공식 ; 점화식 (a_(n+1) = pa_n + q 형태) ; 수학적 귀납법. 수학Ⅰ.",
    },
    {
      label: "수열의 극한",
      limits:
        "수열의 수렴·발산 ; 수렴 조건 (단조수렴 정리는 수능에서는 직관적으로) ; 무한등비급수 Σ ar^(n-1) (|r|<1일 때 a/(1-r)) ; 등비급수의 활용 (소수의 분수 표현, 도형의 길이·넓이의 무한합). 미적분 선택과목.",
    },
    {
      label: "함수의 극한과 연속",
      limits:
        "함수의 극한 (좌극한, 우극한, 무한대로의 극한) ; 극한값의 계산 (인수분해, 유리화, 0/0과 ∞/∞ 꼴) ; 연속의 정의와 성질 ; 사잇값 정리 (IVT) ; 최대·최소 정리. 수학Ⅱ.",
    },
    {
      label: "미분법 (다항함수, 초월함수)",
      limits:
        "수학Ⅱ : 다항함수의 미분 (도함수의 정의, 곱·합 미분법) ; 접선의 방정식, 평균값정리, 함수의 증감과 극값. 미적분 선택 : 합성함수·역함수의 미분 (연쇄법칙) ; 삼각·지수·로그 함수의 도함수 (예 : (e^x)' = e^x, (ln x)' = 1/x, (sin x)' = cos x).",
    },
    {
      label: "적분법 (다항함수, 초월함수)",
      limits:
        "수학Ⅱ : 다항함수의 부정적분·정적분 (구분구적법, 미적분의 기본정리) ; 정적분으로 정의된 함수. 미적분 선택 : 치환적분, 부분적분 ; 삼각·지수·로그 함수의 적분 ; 정적분의 활용 (넓이, 부피, 곡선의 길이는 수능 출제 안 됨).",
    },
    {
      label: "확률과 통계: 경우의 수",
      limits:
        "원순열, 같은 것이 있는 순열, 중복순열, 중복조합 (H_n^r = C(n+r-1, r)) ; 조합 nC_r과 그 성질 ; 이항정리 (a+b)^n의 일반항 C(n,r)a^(n-r)b^r ; 다항정리 (간단한 경우). 확률과 통계 선택과목.",
    },
    {
      label: "확률 (조건부, 독립)",
      limits:
        "확률의 정의와 성질 ; 조건부확률 P(B|A) = P(A∩B)/P(A) ; 사건의 독립 (P(A∩B) = P(A)P(B)) ; 독립시행의 확률 (이항분포의 기초). 확률과 통계 선택과목.",
    },
    {
      label: "통계 (이항분포, 정규분포)",
      limits:
        "확률변수와 확률분포 (이산형, 연속형) ; 평균 E(X), 분산 V(X) ; 이항분포 B(n,p) (E=np, V=np(1-p)) ; 정규분포 N(μ,σ²) (표준정규분포 표 사용) ; 표본평균의 분포와 신뢰구간 ; 모평균의 추정. 확률과 통계 선택과목.",
    },
    {
      label: "기하: 이차곡선, 평면벡터, 공간도형",
      limits:
        "이차곡선 : 포물선, 타원, 쌍곡선의 정의·표준형·접선 ; 평면벡터 : 벡터의 연산, 내적 a·b = |a||b|cosθ ; 공간도형과 공간좌표 ; 공간벡터 (방향벡터, 법선벡터) ; 평면의 방정식 ; 점과 평면 사이의 거리. 기하 선택과목.",
    },
  ],
  // 2015 개정 교육과정 「물리학Ⅱ」수준. 수능 선택과목으로 응시자 약 5%.
  "KR_physics_고3 (수능)": [
    {
      label: "역학과 에너지",
      limits:
        "등가속도 운동 (v=v₀+at, x=v₀t+½at², v²-v₀²=2ax) ; 뉴턴 운동법칙 (관성, F=ma, 작용·반작용) ; 평면운동 (포물선·등속원운동 — 구심력 F=mv²/r) ; 일과 에너지 (W=Fs cosθ, K=½mv², U=mgh, 탄성에너지 ½kx²) ; 역학적 에너지 보존.",
    },
    {
      label: "운동량과 충돌",
      limits:
        "운동량 p=mv ; 충격량 J=Ft=Δp ; 운동량 보존법칙 ; 탄성충돌·비탄성충돌 (반발계수 e의 정의) ; 1차원·2차원 충돌 분석.",
    },
    {
      label: "유체와 열역학",
      limits:
        "유체의 압력, 부력 (아르키메데스 원리), 베르누이의 원리 (정성적) ; 이상기체 상태방정식 PV=nRT ; 기체의 운동에너지와 온도의 관계 (½mv²=(3/2)kT) ; 열역학 제1법칙 ΔU=Q-W ; 열기관과 효율 ; 열역학 제2법칙 (정성적).",
    },
    {
      label: "전자기학: 전기장, 전류",
      limits:
        "쿨롱법칙 F=kq₁q₂/r² ; 전기장 E와 전위 V (등전위면, 전기력선) ; 전기용량 C=Q/V (평행판 콘덴서, 직렬·병렬) ; 옴의 법칙 V=IR, 비저항 ρ ; 키르히호프 법칙 ; 전력 P=VI=I²R ; 트랜지스터·반도체 (정성적, p형·n형, p-n 접합).",
    },
    {
      label: "전자기 유도",
      limits:
        "자기장 (전류가 만드는 자기장 : 직선전류, 원형전류, 솔레노이드) ; 자기장 속 전류·전하에 작용하는 힘 (F=BIL, F=qvB) ; 자기 선속 Φ=BS cosθ ; 패러데이 법칙 ε=-dΦ/dt ; 렌츠 법칙 ; 발전기·변압기·교류 (RMS 값).",
    },
    {
      label: "파동과 정보통신",
      limits:
        "파동의 기본 (v=fλ, 횡파·종파, 중첩, 정상파) ; 도플러 효과 (음원·관측자 이동) ; 빛의 굴절 (스넬 법칙 n=sini/sinr), 전반사 ; 간섭 (영의 이중슬릿 dx/L=λ), 회절 ; 편광 ; 광통신·전자기파 스펙트럼.",
    },
    {
      label: "빛과 물질의 이중성",
      limits:
        "광전효과 (hf=W₀+½mv²_max, 한계진동수 ν₀, 빛의 입자성) ; 콤프턴 효과 (정성적) ; 드브로이 물질파 λ=h/p ; 전자 회절 실험 ; 입자성과 파동성의 상호보완성. 슈뢰딩거 방정식 풀이는 출제 안 됨.",
    },
    {
      label: "현대물리: 상대성이론",
      limits:
        "특수상대성이론의 두 가지 가설 (광속 불변, 상대성 원리) ; 시간 지연 Δt=γΔt₀, 길이 수축 L=L₀/γ ; 상대론적 운동량과 에너지 E=mc²·γ, 정지에너지 E₀=mc² ; 일반상대성이론은 정성적 소개 (등가원리, 중력에 의한 시공간의 휘어짐).",
    },
    {
      label: "원자와 원자핵",
      limits:
        "보어 원자모형 (En = -13.6/n² eV, 양자조건 mvr = nh/(2π)) ; 수소 원자의 스펙트럼 (라이먼·발머·파셴 계열) ; 원자핵의 구성 (양성자·중성자, 동위원소) ; α, β, γ 붕괴와 핵반응식 ; 반감기 N=N₀(½)^(t/T) ; 질량결손과 결합에너지 E=Δmc² ; 핵분열·핵융합 (정성적).",
    },
  ],
  // 2015 개정 「화학Ⅰ + 화학Ⅱ」 통합 — 수능 선택과목 「화학Ⅰ」이 응시자 비율 가장 높음.
  // 「화학Ⅱ」는 일부 자연계열 상위 학생만 선택. 아래는 두 과목의 결합 범위.
  "KR_chemistry_고3 (수능)": [
    {
      label: "화학의 첫걸음",
      limits:
        "화학의 유용성과 일상 속 화학 ; 몰의 개념과 아보가드로수 N_A=6.022×10²³ ; 화학식량과 몰질량 ; 화학반응식의 균형 맞추기 ; 양적 관계 (몰·g·L 변환), 한계반응물·이론수득량. 화학Ⅰ.",
    },
    {
      label: "원자의 세계",
      limits:
        "원자모형의 발전 (돌턴·톰슨·러더퍼드·보어·현대 양자역학적 모형) ; 양자수 (n, l, m_l, m_s) ; 오비탈 (s, p, d) ; 전자배치 원리 (쌓음·파울리·훈트) ; 주기율표의 구조와 주기적 성질 (원자반지름, 이온화에너지, 전자친화도, 전기음성도). 화학Ⅰ.",
    },
    {
      label: "화학결합과 분자의 세계",
      limits:
        "이온결합·공유결합·금속결합 ; 루이스 전자점식·구조식 ; 결합의 극성 (전기음성도 차이) ; VSEPR 모형으로 분자의 모양 예측 (정사면체, 평면삼각형, 굽은형, 직선형) ; 분자의 극성 ; 분자간 힘 (분산력, 쌍극자-쌍극자, 수소결합)과 물질의 물리적 성질. 화학Ⅰ + 화학Ⅱ.",
    },
    {
      label: "역동적인 화학반응",
      limits:
        "화학반응의 반응열 (발열·흡열) ; 엔탈피 변화 ΔH ; 헤스의 법칙 ; 결합에너지로 ΔH 계산 ; 자유에너지 ΔG=ΔH-TΔS와 반응의 자발성 (화학Ⅱ에서 정성적). 화학Ⅰ에서는 정성, 화학Ⅱ에서 정량.",
    },
    {
      label: "산화-환원 반응과 전기화학",
      limits:
        "산화수의 결정 ; 산화·환원 반응의 알짜이온반응식 (반쪽반응법으로 균형) ; 금속의 이온화 경향 ; 화학전지 (다니엘 전지, 납축전지, 알칼리 전지) ; 표준 환원 전위 E° ; 패러데이 법칙 m=MIt/(nF). 화학Ⅰ + 화학Ⅱ.",
    },
    {
      label: "물의 자동이온화와 pH",
      limits:
        "물의 자동이온화 K_w=[H⁺][OH⁻]=1.0×10⁻¹⁴ (25°C) ; pH=-log[H⁺], pOH=-log[OH⁻], pH+pOH=14 ; 강산·강염기의 pH 계산 ; 약산·약염기의 pH (이온화도 α, 이온화상수 K_a, K_b) ; 중화반응. 화학Ⅰ + 화학Ⅱ.",
    },
    {
      label: "산-염기 평형",
      limits:
        "브뢴스테드-로우리 산·염기와 짝산·짝염기 ; 약산·약염기의 K_a, K_b 와 pK_a, pK_b ; 완충용액 (헨더슨-하셀발흐 식 pH=pK_a+log([A⁻]/[HA])) ; 중화 적정과 적정곡선, 지시약의 선택 ; 염의 가수분해. 화학Ⅱ.",
    },
    {
      label: "화학평형",
      limits:
        "동적 평형의 개념 ; 평형상수 K_c, K_p ; 반응지수 Q와 반응 진행 방향 ; 르샤틀리에 원리 (농도·압력·온도 변화의 영향) ; 용해도곱 K_sp ; 공통이온 효과. 화학Ⅱ.",
    },
    {
      label: "반응속도",
      limits:
        "반응속도의 표현 (단위 mol/(L·s)) ; 속도식 (v=k[A]^m[B]^n, 반응 차수의 실험적 결정) ; 활성화에너지와 아레니우스 식 k=Ae^(-E_a/RT) ; 촉매의 역할 (정촉매·부촉매) ; 반응 메커니즘과 속도결정단계. 화학Ⅱ.",
    },
    {
      label: "유기화학",
      limits:
        "탄화수소의 분류 (알케인, 알켄, 알카인, 방향족) ; IUPAC 명명법 ; 작용기 (-OH, -CHO, -COOH, -COO-, -NH₂) 와 그 반응 ; 대표적인 유기 반응 (치환, 첨가, 제거, 산화, 환원, 에스터화) ; 이성질체 (구조이성질체, 기하이성질체, 광학이성질체). 화학Ⅱ.",
    },
  ],

  // ── BRAZIL ─────────────────────────────────────────────────────────────────
  // BNCC (Base Nacional Comum Curricular) — 3º ano do Ensino Médio.
  // Foco no ENEM: matemática contextualizada, física com cálculo simples
  // (sem cálculo diferencial), química com forte ênfase em interpretação
  // de gráficos e tabelas. ENEM usa g = 10 m/s² por convenção.
  "BR_math_3º ano EM (ENEM)": [
    {
      label: "Funções (afim, quadrática, exponencial, logarítmica)",
      limits:
        "Função afim f(x)=ax+b (gráfico, raízes, sinal) ; função quadrática f(x)=ax²+bx+c (vértice, raízes por Bhaskara, máximo/mínimo) ; função exponencial f(x)=a^x (a>0, a≠1) e função logarítmica f(x)=log_a x ; propriedades dos logaritmos ; equações exponenciais e logarítmicas. NÃO há cálculo diferencial no ENEM.",
    },
    {
      label: "Progressões aritméticas e geométricas",
      limits:
        "PA : termo geral a_n=a_1+(n-1)r, soma S_n=n(a_1+a_n)/2 ; PG : termo geral a_n=a_1·q^(n-1), soma S_n=a_1(1-q^n)/(1-q) ; soma da PG infinita S=a_1/(1-q) quando |q|<1. Aplicações : juros simples (regime PA) e juros compostos (regime PG).",
    },
    {
      label: "Trigonometria",
      limits:
        "Razões trigonométricas no triângulo retângulo (sen, cos, tg) ; ângulos notáveis (30°, 45°, 60°) ; ciclo trigonométrico, radianos ; lei dos senos a/sen A = 2R, lei dos cossenos a²=b²+c²-2bc·cos A ; identidades fundamentais sen²+cos²=1 ; equações trigonométricas simples. NÃO formulário de adição de arcos avançado no ENEM.",
    },
    {
      label: "Geometria plana e espacial",
      limits:
        "Geometria plana : áreas e perímetros (triângulo, quadrilátero, círculo, setor) ; semelhança de triângulos ; teorema de Pitágoras, teorema de Tales. Geometria espacial : volumes e áreas de superfície (prisma, pirâmide, cilindro, cone, esfera) ; troncos. Forte ênfase em problemas práticos e conversão de unidades.",
    },
    {
      label: "Geometria analítica",
      limits:
        "Distância entre dois pontos d=√((x₂-x₁)²+(y₂-y₁)²) ; ponto médio ; equação da reta (geral, reduzida, segmentária) ; coeficiente angular ; paralelismo e perpendicularidade ; equação da circunferência (x-a)²+(y-b)²=r². NÃO cônicas (elipse, hipérbole, parábola) no formato analítico — são apenas mencionadas conceitualmente.",
    },
    {
      label: "Análise combinatória",
      limits:
        "Princípio fundamental da contagem (multiplicação) ; arranjos A(n,p)=n!/(n-p)! ; combinações C(n,p)=n!/(p!(n-p)!) ; permutações simples e com repetição ; binômio de Newton (termo geral T_(k+1)=C(n,k)a^(n-k)b^k) — em nível introdutório no ENEM.",
    },
    {
      label: "Probabilidade",
      limits:
        "Probabilidade clássica P(A)=#favoráveis/#totais ; probabilidade condicional P(A|B)=P(A∩B)/P(B) ; eventos independentes ; eventos mutuamente excludentes ; probabilidade da união P(A∪B)=P(A)+P(B)-P(A∩B). NÃO há distribuições de probabilidade contínuas no ENEM.",
    },
    {
      label: "Estatística (média, mediana, desvio)",
      limits:
        "Tabelas de frequência (absoluta, relativa, acumulada) ; gráficos (barras, histograma, setores, linha, boxplot) ; medidas de tendência central : média aritmética simples e ponderada, mediana, moda ; medidas de dispersão : amplitude, variância σ², desvio padrão σ ; quartis, decis, percentis. ENEM usa estatística descritiva contextualizada.",
    },
    {
      label: "Matrizes e sistemas lineares",
      limits:
        "Matrizes : operações (soma, produto por escalar, multiplicação) ; matriz transposta, identidade, inversa (até 3×3) ; determinantes (regra de Sarrus para 3×3, Laplace) ; sistemas lineares 2×2 e 3×3 (regra de Cramer, escalonamento) ; classificação (SPD, SPI, SI). NÃO matrizes maiores que 3×3 no ENEM.",
    },
    {
      label: "Números complexos",
      limits:
        "Forma algébrica z=a+bi (operações, conjugado z̄=a-bi, módulo |z|=√(a²+b²)) ; representação no plano de Argand-Gauss ; forma trigonométrica z=|z|(cos θ+i sen θ) ; multiplicação e divisão na forma trigonométrica (soma e diferença dos argumentos) ; primeira fórmula de De Moivre z^n=|z|^n(cos nθ+i sen nθ). Tema raro no ENEM mas presente em vestibulares.",
    },
  ],
  "BR_physics_3º ano EM (ENEM)": [
    {
      label: "Cinemática",
      limits:
        "MRU (movimento retilíneo uniforme) : S=S₀+vt ; MRUV : v=v₀+at, S=S₀+v₀t+½at², equação de Torricelli v²=v₀²+2aΔS ; queda livre e lançamento vertical (g=10 m/s²) ; lançamento horizontal e oblíquo (decomposição) ; movimento circular uniforme (T, f, ω, v=ωR, a_cp=v²/R).",
    },
    {
      label: "Dinâmica (leis de Newton, g = 10 m/s²)",
      limits:
        "1ª lei (inércia), 2ª lei F=ma, 3ª lei (ação-reação) ; força peso P=mg ; força de atrito (estático μ_e e cinético μ_c, F_at=μN) ; tração em fios e roldanas ; plano inclinado ; força centrípeta F_cp=mv²/R ; sistemas com várias massas (problemas de blocos e cordas).",
    },
    {
      label: "Energia e trabalho",
      limits:
        "Trabalho de força constante τ=F·d·cos θ ; trabalho da força peso τ_P=±mgh ; energia cinética E_c=½mv² ; energia potencial gravitacional E_p=mgh, elástica E_pe=½kx² ; potência P=τ/Δt=F·v ; rendimento η=P_útil/P_total ; teorema da energia cinética τ_total=ΔE_c ; conservação da energia mecânica (em sistemas conservativos).",
    },
    {
      label: "Termologia, calorimetria",
      limits:
        "Termometria (escalas Celsius, Fahrenheit, Kelvin ; conversões) ; dilatação térmica (linear, superficial, volumétrica ; α, β=2α, γ=3α) ; calor sensível Q=mcΔT, calor latente Q=mL ; trocas de calor (princípio da conservação) ; mudanças de estado físico ; transmissão de calor (condução, convecção, irradiação — qualitativo).",
    },
    {
      label: "Termodinâmica",
      limits:
        "Equação de Clapeyron pV=nRT (gás ideal) ; transformações isobárica, isocórica, isotérmica, adiabática (gráficos p×V) ; 1ª lei da termodinâmica Q=ΔU+W ; trabalho de gás W=p·ΔV (isobárica) ; máquinas térmicas (rendimento η=1-Q_f/Q_q) ; ciclo de Carnot η_max=1-T_f/T_q ; 2ª lei da termodinâmica (qualitativa).",
    },
    {
      label: "Óptica geométrica",
      limits:
        "Reflexão (lei : ângulo de incidência = ângulo de reflexão) ; espelhos planos (formação de imagem, simetria) ; espelhos esféricos (côncavo e convexo : equação de Gauss 1/f=1/p+1/p', aumento A=-p'/p, distância focal f=R/2) ; refração (lei de Snell n₁ sen θ₁=n₂ sen θ₂) ; lentes delgadas (convergente e divergente) ; instrumentos ópticos (lupa, olho humano — defeitos qualitativos).",
    },
    {
      label: "Ondulatória",
      limits:
        "Tipos de ondas (mecânicas vs eletromagnéticas, transversais vs longitudinais) ; equação fundamental v=λf ; reflexão, refração, difração, polarização ; ondas estacionárias e ressonância (cordas e tubos sonoros : harmônicos f_n=nv/(2L) cordas, f_n=nv/(4L) tubo fechado) ; efeito Doppler f'=f(v±v_obs)/(v±v_fonte) ; intensidade sonora em decibéis (qualitativa).",
    },
    {
      label: "Eletrostática",
      limits:
        "Carga elétrica (quantização Q=ne, e=1,6×10⁻¹⁹ C) ; processos de eletrização (atrito, contato, indução) ; lei de Coulomb F=k|q₁q₂|/r² (k=9×10⁹ N·m²/C²) ; campo elétrico E=F/q (em torno de carga puntiforme E=kQ/r²) ; potencial elétrico V=kQ/r ; energia potencial elétrica E_p=qV ; capacitor de placas paralelas (qualitativo).",
    },
    {
      label: "Eletrodinâmica",
      limits:
        "Corrente elétrica i=Δq/Δt ; resistência elétrica e 1ª lei de Ohm V=Ri ; 2ª lei de Ohm R=ρL/A ; potência elétrica P=Vi=Ri²=V²/R ; consumo de energia (kWh) ; associação de resistores (série R_eq=R₁+R₂+..., paralelo 1/R_eq=1/R₁+1/R₂+...) ; geradores reais (fem ε, resistência interna r ; U=ε-ri) ; receptores ; leis de Kirchhoff (qualitativas).",
    },
    {
      label: "Eletromagnetismo",
      limits:
        "Campo magnético (linhas de indução, ímãs, campo terrestre) ; campo magnético criado por corrente (fio retilíneo B=μ₀i/(2πr), espira circular, solenoide B=μ₀ni) ; força magnética sobre carga F=qvB sen θ (regra da mão direita) ; força magnética sobre fio F=BiL sen θ ; indução eletromagnética (lei de Faraday-Neumann ε=-ΔΦ/Δt, lei de Lenz) ; transformador U₁/U₂=n₁/n₂.",
    },
    {
      label: "Física moderna (introdução)",
      limits:
        "Relatividade restrita (postulados de Einstein ; dilatação do tempo Δt=γΔt₀, contração do comprimento L=L₀/γ ; equivalência massa-energia E=mc²) — qualitativo no ENEM ; efeito fotoelétrico (E=hf=W₀+E_cmax) ; dualidade onda-partícula ; modelo atômico de Bohr (níveis quantizados) ; radioatividade (α, β, γ ; meia-vida T_½ ; aplicações : datação por carbono-14, medicina nuclear).",
    },
  ],
  "BR_chemistry_3º ano EM (ENEM)": [
    {
      label: "Estequiometria",
      limits:
        "Mol e número de Avogadro N_A=6,02×10²³ ; massa molar ; cálculos estequiométricos a partir de equações balanceadas (mol→mol, g→g, L→L com gases nas CNTP) ; reagente limitante e em excesso ; rendimento da reação ; pureza de reagentes. Forte ênfase em ENEM por contextos industriais e ambientais.",
    },
    {
      label: "Soluções e concentrações",
      limits:
        "Tipos de soluções (saturadas, insaturadas, supersaturadas) ; coeficiente de solubilidade (curvas de solubilidade) ; concentração comum (g/L), concentração em mol/L (molaridade), título (% massa, % volume), ppm ; diluição C₁V₁=C₂V₂ ; mistura de soluções (mesmo soluto e solutos diferentes) ; propriedades coligativas (tonoscopia, ebulioscopia, crioscopia, osmoscopia — qualitativas).",
    },
    {
      label: "Termoquímica",
      limits:
        "Reações exotérmicas (ΔH<0) e endotérmicas (ΔH>0) ; entalpia de formação, combustão, neutralização ; lei de Hess (ΔH é função de estado, não depende do caminho) ; cálculo de ΔH a partir de entalpias de ligação ; diagrama de energia. NÃO entropia (ΔS) e energia de Gibbs (ΔG) detalhadas no ENEM.",
    },
    {
      label: "Cinética química",
      limits:
        "Velocidade de reação (média, em função de reagentes/produtos) ; fatores que afetam a velocidade (temperatura, concentração, superfície de contato, catalisador) ; energia de ativação E_a (gráficos de energia x progresso da reação) ; equação de Arrhenius k=Ae^(-E_a/RT) (qualitativa no ENEM) ; mecanismo de reação e etapa lenta determinante.",
    },
    {
      label: "Equilíbrio químico, pH",
      limits:
        "Equilíbrio dinâmico ; constante de equilíbrio K_c (em termos de concentrações) e K_p (pressões parciais para gases) ; princípio de Le Chatelier (deslocamento por concentração, pressão, temperatura) ; equilíbrio iônico K_w=10⁻¹⁴ ; pH=-log[H⁺] e pOH=-log[OH⁻] ; ácidos e bases fortes vs fracas (K_a, K_b, grau de ionização α) ; soluções tampão (qualitativo).",
    },
    {
      label: "Eletroquímica (pilhas, eletrólise)",
      limits:
        "Reações de oxirredução (NOX, agente oxidante, agente redutor, balanceamento) ; pilha de Daniell e outras (cátodo é redução, ânodo é oxidação) ; potencial padrão de redução E° ; ddp da pilha ΔE°=E°_cátodo-E°_ânodo (espontaneidade : ΔE°>0) ; eletrólise (ígnea e aquosa) ; leis de Faraday m=MIt/(nF) ; aplicações (galvanoplastia, refino do alumínio, baterias).",
    },
    {
      label: "Química orgânica: funções e nomenclatura",
      limits:
        "Cadeias carbônicas (classificação) ; nomenclatura IUPAC para hidrocarbonetos (alcanos, alcenos, alcinos, aromáticos), álcoois, fenóis, éteres, aldeídos, cetonas, ácidos carboxílicos, ésteres, aminas, amidas, haletos orgânicos ; isomeria plana (de cadeia, posição, função, metameria, tautomeria) ; isomeria espacial (geométrica cis/trans e óptica — quiralidade) — em nível introdutório.",
    },
    {
      label: "Reações orgânicas (tipos gerais)",
      limits:
        "Substituição (em alcanos : halogenação ; aromáticos : nitração, halogenação, sulfonação, alquilação) ; adição (em alcenos e alcinos : H₂, X₂, HX — regra de Markovnikov, H₂O) ; eliminação (desidratação de álcool, desidro-halogenação) ; oxidação (combustão, oxidação branda de alceno, oxidação de álcool a aldeído/cetona/ácido) ; esterificação e saponificação ; polimerização (adição e condensação, exemplos : PE, PVC, PET, náilon).",
    },
    {
      label: "Química ambiental",
      limits:
        "Ciclos biogeoquímicos (água, carbono, nitrogênio) ; poluição atmosférica (efeito estufa : CO₂, CH₄, N₂O ; chuva ácida : SO₂, NOx ; destruição da camada de ozônio : CFCs) ; poluição da água (eutrofização, metais pesados, óleos) ; tratamento de água e esgoto ; combustíveis fósseis vs energias renováveis ; reciclagem ; pegada de carbono. Tema muito frequente no ENEM por contexto socioambiental.",
    },
  ],

  // ── CANADA ─────────────────────────────────────────────────────────────────
  // Grade 12 — provincial curricula vary, but content largely matches the
  // Ontario MCV4U/MHF4U/MDM4U bundle (Calculus & Vectors, Advanced Functions,
  // Data Management). BC, AB, QC use similar scope under different course
  // codes. Notes below take Ontario as the reference and call out provincial
  // differences where relevant.
  "CA_math_Grade 12": [
    {
      label: "Limits and continuity",
      limits:
        "Intuitive limit definition (no formal ε-δ); evaluation by direct substitution, factoring, rationalization, conjugates; one-sided limits; limits at infinity, vertical and horizontal asymptotes; continuity at a point and on an interval; Intermediate Value Theorem. MCV4U scope.",
    },
    {
      label: "Derivatives (chain, product, quotient rules)",
      limits:
        "First principles definition f'(x) = lim_{h→0}[f(x+h)-f(x)]/h; power rule, product rule, quotient rule, chain rule; derivatives of polynomial, rational, exponential (e^x, a^x), logarithmic (ln x), and trigonometric functions; implicit differentiation. MCV4U scope.",
    },
    {
      label: "Applications of derivatives, optimization",
      limits:
        "Rates of change, related rates problems; tangent and normal line equations; critical points, intervals of increase/decrease; concavity (second derivative test), inflection points; optimization (max/min word problems with constraint); curve sketching combining all features. NO Newton's method (covered as enrichment only).",
    },
    {
      label: "Vectors in 2D and 3D",
      limits:
        "Vector representation (geometric and Cartesian/component); magnitude; unit vectors; vector addition, subtraction, scalar multiplication; dot product u·v = |u||v|cosθ and cross product u×v (3D only) with applications (work, torque, area of parallelogram, projection). MCV4U scope.",
    },
    {
      label: "Lines and planes in 3D",
      limits:
        "Vector and parametric equations of a line; symmetric equations; vector and scalar (Cartesian) equations of a plane; intersections of lines, of a line and a plane, of two planes; angles between lines/planes; distance from a point to a line or plane. MCV4U scope.",
    },
    {
      label: "Polynomial and rational functions",
      limits:
        "Factor theorem, remainder theorem; rational root theorem; polynomial long and synthetic division; graphing polynomials of degree ≤ 4 (end behaviour, zeros with multiplicity); rational functions (x-intercepts, vertical/horizontal/oblique asymptotes, holes); polynomial and rational inequalities. MHF4U scope.",
    },
    {
      label: "Exponential and logarithmic functions",
      limits:
        "Properties of exponential functions a^x; natural exponential e^x; logarithmic functions log_a x and ln x; logarithm laws (product, quotient, power, change of base); solving exponential and logarithmic equations and inequalities; modeling exponential growth and decay. MHF4U scope.",
    },
    {
      label: "Trigonometric functions and identities",
      limits:
        "Radian measure; unit circle definitions; graphs of sin, cos, tan, csc, sec, cot (period, amplitude, phase shift); reciprocal, Pythagorean (sin²+cos²=1), quotient, addition (sin(a±b), cos(a±b)), double-angle identities; solving trigonometric equations on [0, 2π]; transformations of trig graphs. MHF4U scope.",
    },
    {
      label: "Combinatorics and probability",
      limits:
        "Fundamental counting principle; permutations P(n,r) (with and without repetition, circular permutations); combinations C(n,r); Pascal's triangle and binomial theorem; classical probability; conditional probability P(A|B); independent and mutually exclusive events; tree diagrams. MDM4U scope.",
    },
    {
      label: "Statistics: distributions",
      limits:
        "Measures of central tendency (mean, median, mode, weighted mean); measures of spread (range, variance, standard deviation); discrete probability distributions; binomial distribution B(n, p) (mean np, variance npq); geometric distribution; normal distribution N(μ, σ²) with z-score table lookup; one-variable and two-variable data analysis. MDM4U scope.",
    },
  ],
  "CA_physics_Grade 12": [
    {
      label: "Kinematics and dynamics",
      limits:
        "Vector kinematics in 2D (projectile motion, components); Newton's three laws applied to inclined planes, pulleys, connected systems; static and kinetic friction (F_f = μF_N); free-body diagrams. Ontario SPH4U / BC Physics 12 scope.",
    },
    {
      label: "Energy and momentum",
      limits:
        "Work W = F·d cosθ; kinetic energy K = ½mv²; gravitational potential energy U_g = mgh (near surface) and U_g = -GMm/r (general); elastic potential energy U_s = ½kx²; conservation of mechanical energy with non-conservative forces; impulse J = FΔt = Δp; conservation of linear momentum in 1D and 2D collisions (elastic and inelastic). NO rotational kinetic energy or angular momentum.",
    },
    {
      label: "Circular motion and gravitation",
      limits:
        "Uniform circular motion: a_c = v²/r = ω²r, centripetal force F_c = mv²/r; banked curves; Newton's law of universal gravitation F = GMm/r²; gravitational field strength g = GM/r²; Kepler's three laws (third law T² ∝ r³); orbital velocity, escape velocity v_esc = √(2GM/r); satellite motion (geosynchronous orbit).",
    },
    {
      label: "Simple harmonic motion",
      limits:
        "Mass on a spring: x(t) = A cos(ωt + φ), period T = 2π√(m/k); simple pendulum T = 2π√(L/g) for small angles; energy in SHM (transfer between U_s and K, total energy ½kA²); damped oscillations (qualitative). Resonance.",
    },
    {
      label: "Mechanical waves and sound",
      limits:
        "Transverse and longitudinal waves; v = fλ; superposition, interference (constructive and destructive); standing waves on strings (f_n = nv/2L) and in air columns (open: f_n = nv/2L; closed: f_n = nv/4L for odd n); resonance; Doppler effect f' = f(v ± v_o)/(v ∓ v_s); intensity in decibels (formula given).",
    },
    {
      label: "Electric field and potential",
      limits:
        "Coulomb's law F = kq₁q₂/r² (k = 8.99×10⁹); electric field E = F/q (point charge: E = kQ/r²); field lines; superposition; electric potential V = kQ/r; potential difference and work W = qΔV; capacitance C = Q/V; parallel-plate capacitor C = ε₀A/d. NO Gauss's law.",
    },
    {
      label: "Magnetic fields and induction",
      limits:
        "Magnetic field B; force on a moving charge F = qv×B (magnitude qvB sinθ, direction by right-hand rule); force on a current-carrying wire F = BIL sinθ; magnetic field of long straight wire B = μ₀I/(2πr) and solenoid B = μ₀nI; magnetic flux Φ = BA cosθ; Faraday's law ε = -dΦ/dt; Lenz's law; transformers V_p/V_s = N_p/N_s.",
    },
    {
      label: "Electromagnetic radiation",
      limits:
        "EM spectrum (radio → gamma rays); speed of light c = fλ = 3×10⁸ m/s; properties of EM waves (transverse, c-velocity in vacuum, no medium); generation of EM waves by accelerating charges (qualitative); Maxwell's equations as a unified theory (named, qualitative; not solved).",
    },
    {
      label: "Quantum mechanics (intro)",
      limits:
        "Photoelectric effect: hf = W₀ + ½mv²_max, threshold frequency, stopping potential; Einstein's photon model; Compton scattering (qualitative); de Broglie wavelength λ = h/p; wave-particle duality; Bohr model of hydrogen (E_n = -13.6/n² eV, transitions and emission spectra: Lyman, Balmer, Paschen series); Heisenberg uncertainty principle (qualitative). NO Schrödinger equation.",
    },
    {
      label: "Special relativity",
      limits:
        "Postulates of special relativity (constancy of c, principle of relativity); time dilation Δt = γΔt₀; length contraction L = L₀/γ; relativistic momentum p = γmv and energy E = γmc²; rest energy E₀ = mc²; mass-energy equivalence and applications (e.g. nuclear reactions). NO general relativity (mentioned descriptively only).",
    },
    {
      label: "Nuclear physics",
      limits:
        "Atomic structure (Z, A, isotopes); nuclear force; radioactive decay (α, β⁻, β⁺, γ) with balanced nuclear equations; decay law N(t) = N₀e^(-λt), half-life T_½ = ln(2)/λ; binding energy and mass defect E = Δmc²; binding energy per nucleon curve; nuclear fission and fusion; medical, industrial, and energy applications.",
    },
  ],
  "CA_chemistry_Grade 12": [
    {
      label: "Thermochemistry (ΔH, Hess)",
      limits:
        "Enthalpy change ΔH; exothermic vs endothermic reactions; molar enthalpies of reaction, formation, combustion, neutralization, dissolution; calorimetry q = mcΔT; Hess's law; calculation of ΔH from standard heats of formation ΔH°_f; bond energies. SCH4U scope.",
    },
    {
      label: "Reaction rates and kinetics",
      limits:
        "Average and instantaneous rates; factors affecting rate (concentration, temperature, surface area, catalyst); rate law rate = k[A]^m[B]^n (orders determined experimentally); integrated rate laws for first-order (ln[A] vs t) and second-order (1/[A] vs t); half-life formulas; Arrhenius equation k = Ae^(-E_a/RT); reaction mechanisms and rate-determining step.",
    },
    {
      label: "Chemical equilibrium",
      limits:
        "Dynamic equilibrium concept; equilibrium constant K_c (concentrations) and K_p (partial pressures, gases); reaction quotient Q to determine direction; Le Chatelier's principle (effects of concentration, pressure, volume, temperature); ICE tables to compute equilibrium concentrations.",
    },
    {
      label: "Acid-base equilibria, pH, Ka, Kb",
      limits:
        "Brønsted-Lowry acid-base theory; conjugate acid-base pairs; pH = -log[H⁺], pOH = -log[OH⁻], pH + pOH = 14; K_w = 10⁻¹⁴ at 25°C; strong vs weak acids/bases; K_a, K_b, pK_a, pK_b; calculations for weak acid/base solutions (use approximation if α < 5%); buffer solutions (Henderson-Hasselbalch); acid-base titration curves and indicator selection.",
    },
    {
      label: "Solubility equilibria, Ksp",
      limits:
        "Saturated solutions; solubility product K_sp; molar solubility from K_sp; predicting precipitation (Q vs K_sp); common ion effect on solubility; selective precipitation; pH effect on solubility of hydroxide and carbonate salts. NO complex ion equilibria with K_f beyond Grade 12.",
    },
    {
      label: "Thermodynamics (ΔG, ΔS)",
      limits:
        "Entropy ΔS as a measure of disorder; second law of thermodynamics (ΔS_universe > 0 for spontaneous); Gibbs free energy ΔG = ΔH - TΔS; sign of ΔG and spontaneity; standard ΔG° from ΔG°_f or from ΔG° = -RT ln K. NO statistical thermodynamics.",
    },
    {
      label: "Electrochemistry, redox",
      limits:
        "Oxidation states; balancing redox equations by half-reaction method (acidic and basic conditions); galvanic (voltaic) cells: anode (oxidation), cathode (reduction), salt bridge, cell notation; standard reduction potentials E° and standard cell potential E°_cell = E°_cathode - E°_anode; ΔG° = -nFE°; spontaneity (E°>0 for spontaneous); electrolysis: products at electrodes, Faraday's laws m = MIt/(nF). NO Nernst equation in detail (mentioned).",
    },
    {
      label: "Organic chemistry: nomenclature",
      limits:
        "IUPAC naming of: alkanes, alkenes, alkynes, aromatic compounds (benzene derivatives), alkyl halides, alcohols, ethers, aldehydes, ketones, carboxylic acids, esters, amines, amides; structural isomers; stereoisomers (cis/trans, R/S — introduced); hybridization (sp³, sp², sp); functional group recognition.",
    },
    {
      label: "Organic reaction mechanisms (SN1, SN2)",
      limits:
        "Substitution reactions (alkanes via free-radical halogenation; alkyl halides via SN1 and SN2 — distinguish by substrate, nucleophile, solvent, kinetics); elimination reactions (E1, E2; Zaitsev's rule); addition reactions (alkenes: Markovnikov rule for HX, hydration, hydrogenation; alkynes); aromatic electrophilic substitution (qualitative); oxidation (alcohols → aldehydes/ketones/carboxylic acids); esterification and saponification.",
    },
    {
      label: "Polymers and biochemistry",
      limits:
        "Addition polymers (polyethylene, PVC, polystyrene); condensation polymers (polyester, polyamide/nylon); natural polymers: carbohydrates (mono-, di-, polysaccharides), lipids (triglycerides, fatty acids), amino acids and proteins (peptide bond, primary structure), nucleic acids (DNA bases at intro level). NO detailed enzyme kinetics.",
    },
  ],
  "CA_informatics_Grade 12": [
    {
      label: "Object-oriented programming",
      limits:
        "Classes and objects; attributes (instance variables) and methods; constructors; encapsulation (public/private access); inheritance (subclasses, method overriding); polymorphism (interfaces, dynamic dispatch); UML class diagrams (basic). Ontario ICS4U / BC Computer Science 12 scope, typically Java or Python.",
    },
    {
      label: "Algorithm design and analysis",
      limits:
        "Top-down design and stepwise refinement; pseudocode; flowcharts; algorithm correctness (test cases, edge cases); efficiency analysis: Big-O notation (O(1), O(log n), O(n), O(n log n), O(n²)); comparing algorithms by time and space complexity; trade-offs.",
    },
    {
      label: "Recursion",
      limits:
        "Base case and recursive case; recursion vs iteration; classic examples: factorial, Fibonacci, sum of array, binary search, tree traversal (pre-, in-, post-order); call stack visualization; tail recursion concept; converting between recursive and iterative solutions. NO continuation-passing style.",
    },
    {
      label: "Data structures (lists, stacks, queues, trees)",
      limits:
        "Arrays/lists (1D and 2D); stacks (LIFO: push, pop, peek); queues (FIFO: enqueue, dequeue); linked lists (singly and doubly); binary trees (insertion, traversal); binary search trees (search, insert); hash tables (hash function, collision handling: chaining, open addressing). NO red-black trees or AVL trees.",
    },
    {
      label: "Sorting and searching",
      limits:
        "Sorting: bubble sort, selection sort, insertion sort (all O(n²) average); merge sort O(n log n); quicksort (average O(n log n), worst O(n²)); ability to trace and analyze each. Searching: linear search O(n); binary search O(log n) on sorted data. NO heap sort or radix sort in detail.",
    },
    {
      label: "File I/O and persistence",
      limits:
        "Reading from and writing to text files; CSV parsing; basic exception handling (try/except, try/catch); serialization (e.g. JSON, pickle in Python); database persistence (SQLite or equivalent at intro level). NO XML schema validation or binary protocols.",
    },
    {
      label: "Software development lifecycle",
      limits:
        "Phases: requirements analysis, design, implementation, testing, deployment, maintenance; agile vs waterfall (overview); version control with Git (commit, branch, merge — basics); code review; documentation; software ethics (privacy, security, intellectual property).",
    },
    {
      label: "Networking basics",
      limits:
        "TCP/IP model and OSI layers (qualitative); IP addressing (IPv4 dotted decimal); DNS; HTTP/HTTPS request-response cycle; client-server architecture; basic encryption (symmetric vs asymmetric — concepts); network security (firewalls, password hashing). NO routing protocols beyond a conceptual level.",
    },
  ],

  // ── AUSTRALIA ──────────────────────────────────────────────────────────────
  // Year 12 ATAR — Australian Curriculum Senior Secondary (ACARA) with state
  // adaptations (NSW, VIC, QLD, WA, SA). Three maths streams sit alongside
  // each other: Mathematics Advanced (Methods), Mathematics Specialist, and
  // Mathematics General (Standard/Essential). Some topics are Specialist-only
  // and explicitly marked. Physics, chemistry, informatics follow ACARA.
  "AU_math_Year 12 (ATAR)": [
    {
      label: "Functions and graphs",
      limits:
        "Domain and range; polynomial functions (factor, remainder theorems); rational functions (asymptotes); exponential a^x, e^x and logarithmic ln x, log_a x functions; transformations (translation, dilation, reflection); inverse functions; piecewise functions. Mathematics Advanced (Methods) scope.",
    },
    {
      label: "Trigonometric functions and identities",
      limits:
        "Radian measure; unit circle definitions; graphs of sin, cos, tan with period, amplitude, phase shift; reciprocal trig functions (Specialist only); Pythagorean identities sin²+cos²=1; sum/difference and double-angle identities (Specialist); solving trigonometric equations on [0, 2π]; small-angle approximations (Specialist).",
    },
    {
      label: "Differential calculus",
      limits:
        "Definition of derivative as a limit; rules: power, product, quotient, chain; derivatives of polynomial, exponential, logarithmic, trigonometric (sin, cos, tan), inverse trig (Specialist), and hyperbolic (some Specialist syllabi); implicit differentiation (Specialist); applications (rates of change, related rates, optimization, kinematics).",
    },
    {
      label: "Integral calculus",
      limits:
        "Antiderivatives of polynomials, e^x, 1/x, sin x, cos x, sec²x; substitution u = g(x) (Methods, basic); integration by parts (Specialist); partial fractions (Specialist); fundamental theorem of calculus; definite integrals; areas between curves; volumes of revolution about x or y axis (Specialist). NO improper integrals at Year 12.",
    },
    {
      label: "Differential equations (Specialist)",
      limits:
        "Separable first-order ODEs dy/dx = f(x)g(y); first-order linear with integrating factor (some syllabi); applications (population growth, Newton's law of cooling, mechanics with v dv/dx); slope fields (qualitative). Specialist Mathematics ONLY — not in Methods or General.",
    },
    {
      label: "Vectors in 2D and 3D",
      limits:
        "Cartesian and component form; magnitude; unit vectors; vector addition, subtraction, scalar multiplication; dot product u·v = |u||v|cosθ; cross product u×v (Specialist 3D); scalar projection; vector and parametric equations of a line; vector equation of a plane (Specialist); position and displacement vectors in mechanics. Specialist Mathematics for cross product and 3D planes.",
    },
    {
      label: "Complex numbers (Specialist)",
      limits:
        "Cartesian form z = a + bi; conjugate, modulus |z|, argument arg(z); Argand diagram; polar/exponential form z = r·e^(iθ); De Moivre's theorem (cosθ + i sinθ)^n = cos(nθ) + i sin(nθ); roots of complex numbers (n-th roots of unity); fundamental theorem of algebra; loci on the Argand plane. Specialist Mathematics ONLY.",
    },
    {
      label: "Proof techniques (Specialist)",
      limits:
        "Direct proof; proof by contrapositive; proof by contradiction (e.g. irrationality of √2); proof by mathematical induction (sums of series, divisibility, inequalities); deductive geometry proofs; counterexamples. Specialist Mathematics ONLY — Methods and General do not require formal proofs.",
    },
    {
      label: "Probability distributions (binomial, normal)",
      limits:
        "Discrete random variables: probability distribution, expected value E(X), variance Var(X); binomial distribution B(n, p) with mean np, variance np(1-p); continuous random variables: probability density functions; normal distribution N(μ, σ²) with z-scores and table lookup; central limit theorem (Methods/Specialist).",
    },
    {
      label: "Statistical inference",
      limits:
        "Sample proportions and means (sampling distribution); confidence intervals for population proportion (Methods) and population mean using normal/t-distribution (Specialist some syllabi); margin of error; sample size calculations. NO formal hypothesis testing in most state syllabi at Year 12 (varies by state).",
    },
  ],
  "AU_physics_Year 12 (ATAR)": [
    {
      label: "Projectile and circular motion",
      limits:
        "2D projectile motion (range, max height, time of flight; resolved into horizontal and vertical components); uniform circular motion (period T, frequency f, angular velocity ω, centripetal acceleration a = v²/r = ω²r); banked curves; conical pendulum. ACARA Unit 3 scope.",
    },
    {
      label: "Gravitation and orbits",
      limits:
        "Newton's law of universal gravitation F = GMm/r² (G = 6.67×10⁻¹¹); gravitational field strength g = GM/r²; Kepler's three laws (third: T² ∝ r³); orbital velocity v = √(GM/r); satellite motion (low-Earth orbit, geostationary); escape velocity v_esc = √(2GM/r); gravitational potential energy U = -GMm/r.",
    },
    {
      label: "Special relativity",
      limits:
        "Frames of reference; Einstein's two postulates (constancy of c, principle of relativity); time dilation Δt = γΔt₀; length contraction L = L₀/γ; relativistic momentum p = γmv; mass-energy equivalence E = mc² (rest energy E₀ = mc²); experimental evidence (muon decay, particle accelerators). NO general relativity (mentioned only).",
    },
    {
      label: "Electric and magnetic fields",
      limits:
        "Coulomb's law F = kq₁q₂/r²; electric field E = F/q (point charge E = kQ/r²); uniform field between parallel plates E = V/d; electric potential energy and potential difference; magnetic field B; force on a moving charge F = qvB sinθ (right-hand rule); force on a current-carrying wire F = BIL sinθ; magnetic field of solenoid B = μ₀nI. NO Gauss's law or Ampère's law in formal vector form.",
    },
    {
      label: "Electromagnetic induction",
      limits:
        "Magnetic flux Φ = BA cosθ; Faraday's law ε = -dΦ/dt (or ε = -N·dΦ/dt for N turns); Lenz's law; induced EMF in moving conductors; AC generators (sinusoidal output); transformers (V_p/V_s = N_p/N_s, ideal); RMS values for AC; power transmission and step-up/step-down transformers. NO LC oscillation circuits in detail.",
    },
    {
      label: "Light and quantum theory",
      limits:
        "Wave nature of light: Young's double-slit experiment (fringe spacing d sinθ = nλ); diffraction grating; thin-film interference (qualitative); blackbody radiation curves and Wien's law λ_max·T = b; photoelectric effect: hf = W₀ + ½mv²_max, Einstein's photon model; wave-particle duality; de Broglie wavelength λ = h/p.",
    },
    {
      label: "Atomic and nuclear physics",
      limits:
        "Bohr model of hydrogen (E_n = -13.6/n² eV; transitions and emission/absorption spectra: Lyman, Balmer, Paschen series); nuclear structure (Z, A, isotopes); strong nuclear force; radioactive decay (α, β⁻, β⁺, γ) with balanced equations; decay law N(t) = N₀e^(-λt), half-life T_½ = ln(2)/λ; binding energy and mass defect E = Δmc²; binding energy per nucleon curve; fission and fusion.",
    },
    {
      label: "Particle physics (introduction)",
      limits:
        "Standard Model: quarks (up, down, charm, strange, top, bottom), leptons (electron, muon, tau, neutrinos), gauge bosons (photon, W, Z, gluon, Higgs); fundamental forces (electromagnetic, strong, weak, gravity); particle classification (hadrons: baryons, mesons; leptons); antimatter; conservation laws (charge, baryon number, lepton number). NO QCD calculations or Feynman diagrams beyond schematic level.",
    },
  ],
  "AU_chemistry_Year 12 (ATAR)": [
    {
      label: "Reaction rates and equilibrium",
      limits:
        "Factors affecting rate (concentration, temperature, surface area, catalyst); collision theory and activation energy E_a; Maxwell-Boltzmann distribution (qualitative); Arrhenius equation k = Ae^(-E_a/RT) (qualitative for ATAR Chemistry); dynamic equilibrium; equilibrium constant K_c (and K_p for gases — some states); reaction quotient Q; Le Chatelier's principle. ACARA Unit 3 scope.",
    },
    {
      label: "Acids and bases, pH",
      limits:
        "Brønsted-Lowry theory; conjugate acid-base pairs; pH = -log[H⁺]; pOH; K_w = 10⁻¹⁴ at 25°C; strong vs weak acids/bases; K_a, K_b, pK_a, pK_b; calculations of pH for strong and weak monoprotic acids/bases; buffer solutions (qualitative and Henderson-Hasselbalch); acid-base titrations (curves, indicator selection, equivalence point).",
    },
    {
      label: "Redox and electrochemistry",
      limits:
        "Oxidation states; balancing redox half-equations (acidic and basic conditions); galvanic (voltaic) cells: anode/cathode, salt bridge, cell notation; standard reduction potentials E° from data sheet; cell potential E°_cell = E°_cathode - E°_anode; spontaneity; electrolytic cells (electrolysis of molten salts, aqueous solutions); Faraday's laws m = MIt/(nF); applications (corrosion, batteries, fuel cells). NO Nernst equation.",
    },
    {
      label: "Organic chemistry and mechanisms",
      limits:
        "Functional groups: alkanes, alkenes, alkynes, alcohols, aldehydes, ketones, carboxylic acids, esters, amines, amides, haloalkanes; IUPAC nomenclature; reactions: substitution (free-radical halogenation in alkanes; SN1/SN2 in haloalkanes — some states), addition (alkenes: hydrogenation, halogenation, hydration with Markovnikov), oxidation (alcohols → aldehydes/ketones/acids; using K₂Cr₂O₇ or KMnO₄), esterification, hydrolysis. Stereochemistry: structural isomers, cis/trans, optical isomers (chirality).",
    },
    {
      label: "Polymers and synthesis",
      limits:
        "Addition polymers (polyethylene, PVC, polystyrene, Teflon — monomer to polymer); condensation polymers (polyesters: PET; polyamides: nylon-6,6; with formation of small molecule by-product); biopolymers: amino acids and proteins (peptide bond, primary structure), carbohydrates (mono-, di-, polysaccharides, glycosidic bond), triglycerides (ester linkage); multi-step synthesis (designing routes from given starting materials).",
    },
    {
      label: "Analytical techniques (chromatography, spectroscopy)",
      limits:
        "Chromatography: TLC (thin-layer), column, paper, gas chromatography (GC), HPLC (qualitative principles, R_f values); mass spectrometry (M+ peak, fragmentation patterns, isotope patterns); IR spectroscopy (key absorption bands: O-H 3200-3500, C=O 1700, N-H 3300-3500, C-H 2900); ¹H NMR (chemical shift, integration, n+1 splitting); UV-Vis spectroscopy (qualitative); structural elucidation by combined techniques.",
    },
  ],
  "AU_informatics_Year 12 (ATAR)": [
    {
      label: "Programming in Python",
      limits:
        "Variables, data types (int, float, str, bool, list, dict, tuple, set); control structures (if/elif/else, for, while); functions with parameters and return values; scope (local, global); modular design; exception handling (try/except); file I/O; libraries (collections, math, random — basic). State syllabi vary; some VCE/HSC accept other languages but Python is dominant.",
    },
    {
      label: "Algorithms and complexity (Big-O — VIC Algorithmics)",
      limits:
        "Algorithm design (top-down decomposition, pseudocode); searching (linear O(n), binary O(log n)); sorting (bubble, selection, insertion O(n²); merge, quicksort O(n log n)); recursion vs iteration; Big-O notation: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ); time and space complexity comparison. VIC Algorithmics goes deepest; other states cover lighter Big-O.",
    },
    {
      label: "Data structures",
      limits:
        "Arrays/lists (1D and 2D); stacks (LIFO); queues (FIFO); linked lists (singly); dictionaries/hash tables (hashing, collision); binary trees and traversal (pre-, in-, post-order); binary search trees; basic graphs (adjacency list/matrix). NO red-black trees, AVL trees, or B-trees.",
    },
    {
      label: "Databases and SQL",
      limits:
        "Relational data model: tables, rows, columns, primary keys, foreign keys; entity-relationship diagrams (ER); normalisation to 1NF, 2NF, 3NF (introductory); SQL (SELECT, FROM, WHERE, ORDER BY, GROUP BY, HAVING, INNER JOIN); CRUD operations; transactions (ACID concept). NO stored procedures, triggers, or complex query optimization.",
    },
    {
      label: "Networking and security",
      limits:
        "OSI 7-layer model and TCP/IP 4-layer model; IP addressing (IPv4, subnet basics); DNS; HTTP/HTTPS; client-server architecture; encryption (symmetric: AES; asymmetric: RSA — concepts); digital signatures and certificates; threats (malware, phishing, DDoS); defenses (firewalls, intrusion detection, secure password hashing — bcrypt). NO BGP routing protocols.",
    },
    {
      label: "Software development project",
      limits:
        "Software development lifecycle (SDLC): requirements gathering, design (UML class diagrams, use-case diagrams, flowcharts), implementation, testing (unit, integration, user acceptance), deployment, maintenance; agile vs waterfall methodologies; version control with Git (commit, branch, merge); documentation; ethics (privacy, accessibility, intellectual property, sustainability of software).",
    },
  ],
};

function normalize(list: Topic[]): TopicEntry[] {
  return list.map((t) => (typeof t === "string" ? { label: t, limits: "" } : t));
}

export function topicsFor(
  countryCode: string,
  subject: Subject,
  gradeLevel?: string,
  section?: string,
): TopicEntry[] {
  const c = countryCode.toUpperCase();
  if (gradeLevel && section) {
    const sectional = TOPICS[`${c}_${subject}_${gradeLevel}_${section}`];
    if (sectional?.length) return normalize(sectional);
  }
  if (gradeLevel) {
    const byLevel = TOPICS[`${c}_${subject}_${gradeLevel}`];
    if (byLevel?.length) return normalize(byLevel);
  }
  const fallback = TOPICS[`${c}_${subject}`];
  return fallback?.length ? normalize(fallback) : [];
}

/** The string actually sent as the `topic` field on API requests. */
export function topicValue(t: TopicEntry): string {
  return t.limits ? `${t.label} — ${t.limits}` : t.label;
}
