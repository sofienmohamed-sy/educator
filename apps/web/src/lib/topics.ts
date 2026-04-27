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

  // Fallback générique TN math (utilisé si aucune section n'est précisée).
  "TN_math_4ème (Bac)": [
    "Suites numériques",
    "Limites et continuité",
    "Dérivabilité",
    "Fonction logarithme népérien",
    "Fonction exponentielle",
    "Calcul intégral et primitives",
    "Équations différentielles (section Mathématiques)",
    "Nombres complexes",
    "Géométrie dans l'espace",
    "Isométries et similitudes (section Mathématiques)",
    "Probabilités conditionnelles",
    "Loi binomiale",
    "Arithmétique : divisibilité, congruences (sections Math/Info)",
    "Structures algébriques (section Mathématiques)",
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
  "GB_math_A-level": [
    "Algebraic methods (proof, surds, indices)",
    "Coordinate geometry, equation of a circle",
    "Trigonometric identities and equations",
    "Differentiation (product, quotient, chain)",
    "Integration techniques",
    "Sequences and series, binomial expansion",
    "Exponentials and logarithms",
    "Vectors in 3D",
    "Numerical methods (Newton-Raphson)",
    "Probability and statistics",
    "Hypothesis testing",
    "Mechanics: kinematics and Newton's laws",
    "Mechanics: moments and statics",
  ],
  "GB_physics_A-level": [
    "Mechanics: forces, motion, energy",
    "Materials: Hooke's law, Young's modulus",
    "Waves: progressive, stationary, interference",
    "Diffraction and refraction",
    "Quantum phenomena: photoelectric effect",
    "Electricity: circuits, Kirchhoff's laws",
    "Electric fields and capacitance",
    "Magnetic fields and induction",
    "Nuclear physics: radioactivity, decay",
    "Thermal physics, ideal gas",
    "Astrophysics or Medical Physics (option)",
    "Special relativity (Edexcel/AQA)",
  ],
  "GB_chemistry_A-level": [
    "Atomic structure and bonding",
    "Energetics (enthalpy, Hess's law)",
    "Kinetics, Arrhenius equation",
    "Equilibria: Kc, Kp, Le Chatelier",
    "Acids and bases, Kw, buffers",
    "Redox and electrochemistry",
    "Periodicity, transition metals",
    "Organic: alkanes, alkenes, halogenoalkanes",
    "Organic mechanisms (curly arrows: SN1, SN2, E1, E2)",
    "Aromatic chemistry, electrophilic substitution",
    "Carbonyls, carboxylic acids, esters",
    "Spectroscopy: IR, NMR, mass spec",
  ],
  "GB_informatics_A-level": [
    "Programming fundamentals (Python)",
    "Data structures: lists, stacks, queues, trees",
    "Algorithms: sorting, searching",
    "Big-O complexity analysis",
    "Boolean algebra, logic gates",
    "Finite state machines, Turing machines",
    "Databases and SQL",
    "Networking: TCP/IP, OSI model",
    "Object-oriented programming",
    "Recursion",
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
  "IT_math_5ª Liceo Scientifico": [
    "Limiti di funzioni",
    "Continuità",
    "Derivate e teoremi del calcolo differenziale",
    "Teorema di De L'Hôpital",
    "Studio di funzione",
    "Integrali indefiniti e definiti",
    "Calcolo combinatorio",
    "Probabilità",
    "Geometria analitica nello spazio",
    "Equazioni differenziali",
    "Numeri complessi",
  ],
  "IT_physics_5ª Liceo Scientifico": [
    "Elettrostatica e campo elettrico",
    "Potenziale elettrico, condensatori",
    "Corrente elettrica, leggi di Ohm",
    "Campo magnetico, forza di Lorentz",
    "Induzione elettromagnetica",
    "Onde elettromagnetiche",
    "Relatività ristretta",
    "Fisica quantistica (introduzione)",
    "Effetto fotoelettrico",
    "Modelli atomici",
    "Fisica nucleare",
  ],
  "IT_chemistry_5ª Liceo Scientifico": [
    "Struttura atomica e tavola periodica",
    "Legami chimici",
    "Termochimica",
    "Cinetica chimica",
    "Equilibrio chimico",
    "Acidi e basi, pH",
    "Elettrochimica",
    "Chimica organica: idrocarburi",
    "Gruppi funzionali, biomolecole",
  ],

  // ── SPAIN ──────────────────────────────────────────────────────────────────
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
    "Gravitación universal",
    "Campo gravitatorio",
    "Movimiento ondulatorio",
    "Óptica geométrica y física",
    "Campo eléctrico, potencial",
    "Campo magnético, inducción",
    "Física cuántica (efecto fotoeléctrico, dualidad)",
    "Relatividad especial",
    "Física nuclear",
  ],
  "ES_chemistry_2º Bachillerato": [
    "Estructura atómica, configuración electrónica",
    "Enlace químico",
    "Termoquímica",
    "Cinética química",
    "Equilibrio químico",
    "Reacciones ácido-base, pH",
    "Reacciones de oxidación-reducción",
    "Electroquímica",
    "Química orgánica: nomenclatura, isomería",
    "Reacciones orgánicas (tipos generales)",
    "Polímeros y biomoléculas",
  ],

  // ── EGYPT ──────────────────────────────────────────────────────────────────
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
    "Mechanics: dynamics and Newton's laws",
    "Work, energy, power",
    "Waves and sound",
    "Geometric optics",
    "Electrostatics, capacitors",
    "Current electricity",
    "Magnetism and electromagnetic induction",
    "Modern physics (photoelectric, atomic models)",
    "Nuclear physics",
  ],
  "EG_chemistry_Grade 12 (Thanaweya Amma)": [
    "Periodic table and atomic structure",
    "Chemical bonding",
    "Stoichiometry",
    "Chemical equilibrium",
    "Acids, bases, salts",
    "Redox and electrochemistry",
    "Organic chemistry: hydrocarbons, functional groups",
    "Industrial chemistry",
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
  "CN_math_高三 (Gaokao)": [
    "集合与逻辑 (Sets and logic)",
    "函数 (Functions)",
    "三角函数 (Trigonometric functions)",
    "数列 (Sequences and series)",
    "不等式 (Inequalities)",
    "导数及其应用 (Derivatives and applications)",
    "立体几何 (Solid geometry)",
    "解析几何 (Analytic geometry — circles, conics)",
    "概率与统计 (Probability and statistics)",
    "排列组合与二项式定理 (Permutations, combinations, binomial)",
  ],
  "CN_physics_高三 (Gaokao)": [
    "运动学 (Kinematics)",
    "牛顿运动定律 (Newton's laws)",
    "曲线运动 (Curvilinear motion)",
    "万有引力与航天 (Gravitation and spaceflight)",
    "机械能守恒 (Conservation of energy)",
    "动量守恒 (Momentum conservation)",
    "热学 (Thermodynamics, kinetic theory)",
    "静电场 (Electrostatics)",
    "恒定电流 (Steady current)",
    "磁场 (Magnetic field)",
    "电磁感应 (Electromagnetic induction)",
    "光学与近代物理 (Optics and modern physics)",
  ],
  "CN_chemistry_高三 (Gaokao)": [
    "原子结构与元素周期律",
    "化学键与晶体结构",
    "化学反应与能量",
    "化学反应速率与化学平衡",
    "电解质溶液与离子平衡",
    "氧化还原反应",
    "电化学 (原电池, 电解池)",
    "有机化学 (烃, 醇, 醛, 酸, 酯)",
    "实验化学",
  ],

  // ── JAPAN ──────────────────────────────────────────────────────────────────
  "JP_math_高3 (共通テスト)": [
    "数学I: 数と式, 図形と計量",
    "数学II: 三角関数, 指数・対数",
    "数学III: 極限",
    "数学III: 微分法",
    "数学III: 積分法",
    "数学III: 複素数平面",
    "数学A: 場合の数と確率",
    "数学A: 整数の性質",
    "数学B: 数列",
    "数学B: ベクトル",
    "数学C: 平面上の曲線",
  ],
  "JP_physics_高3 (共通テスト)": [
    "力学: 運動と力",
    "力学: 運動量とエネルギー",
    "力学: 円運動と単振動",
    "熱力学",
    "波動: 波の性質, 音, 光",
    "電磁気: 電場と電位",
    "電磁気: 電流と磁場",
    "電磁気: 電磁誘導",
    "原子: 光電効果, ボーア模型",
    "原子核: 放射性崩壊",
  ],
  "JP_chemistry_高3 (共通テスト)": [
    "物質の構成と化学結合",
    "物質の状態 (気体, 液体, 固体)",
    "化学反応とエネルギー",
    "反応速度と化学平衡",
    "酸と塩基, pH",
    "酸化還元と電池",
    "無機物質",
    "有機化合物 (脂肪族, 芳香族)",
    "高分子化合物",
  ],
  "JP_informatics_高3 (共通テスト)": [
    "情報社会と情報倫理",
    "コンピュータの仕組み",
    "アルゴリズムとプログラミング (Python)",
    "データの表現 (二進法, 文字コード)",
    "ネットワークとセキュリティ",
    "データベース基礎",
    "問題解決とモデル化",
  ],

  // ── SOUTH KOREA ────────────────────────────────────────────────────────────
  "KR_math_고3 (수능)": [
    "지수함수와 로그함수",
    "삼각함수",
    "수열 (등차, 등비, 점화식)",
    "수열의 극한",
    "함수의 극한과 연속",
    "미분법 (다항함수, 초월함수)",
    "적분법 (다항함수, 초월함수)",
    "확률과 통계: 경우의 수",
    "확률 (조건부, 독립)",
    "통계 (이항분포, 정규분포)",
    "기하: 이차곡선, 평면벡터, 공간도형",
  ],
  "KR_physics_고3 (수능)": [
    "역학과 에너지",
    "운동량과 충돌",
    "유체와 열역학",
    "전자기학: 전기장, 전류",
    "전자기 유도",
    "파동과 정보통신",
    "빛과 물질의 이중성",
    "현대물리: 상대성이론",
    "원자와 원자핵",
  ],
  "KR_chemistry_고3 (수능)": [
    "화학의 첫걸음",
    "원자의 세계",
    "화학결합과 분자의 세계",
    "역동적인 화학반응",
    "산화-환원 반응과 전기화학",
    "물의 자동이온화와 pH",
    "산-염기 평형",
    "화학평형",
    "반응속도",
    "유기화학",
  ],

  // ── BRAZIL ─────────────────────────────────────────────────────────────────
  "BR_math_3º ano EM (ENEM)": [
    "Funções (afim, quadrática, exponencial, logarítmica)",
    "Progressões aritméticas e geométricas",
    "Trigonometria",
    "Geometria plana e espacial",
    "Geometria analítica",
    "Análise combinatória",
    "Probabilidade",
    "Estatística (média, mediana, desvio)",
    "Matrizes e sistemas lineares",
    "Números complexos",
  ],
  "BR_physics_3º ano EM (ENEM)": [
    "Cinemática",
    "Dinâmica (leis de Newton, g = 10 m/s²)",
    "Energia e trabalho",
    "Termologia, calorimetria",
    "Termodinâmica",
    "Óptica geométrica",
    "Ondulatória",
    "Eletrostática",
    "Eletrodinâmica",
    "Eletromagnetismo",
    "Física moderna (introdução)",
  ],
  "BR_chemistry_3º ano EM (ENEM)": [
    "Estequiometria",
    "Soluções e concentrações",
    "Termoquímica",
    "Cinética química",
    "Equilíbrio químico, pH",
    "Eletroquímica (pilhas, eletrólise)",
    "Química orgânica: funções e nomenclatura",
    "Reações orgânicas (tipos gerais)",
    "Química ambiental",
  ],

  // ── CANADA ─────────────────────────────────────────────────────────────────
  "CA_math_Grade 12": [
    "Limits and continuity",
    "Derivatives (chain, product, quotient rules)",
    "Applications of derivatives, optimization",
    "Vectors in 2D and 3D",
    "Lines and planes in 3D",
    "Polynomial and rational functions",
    "Exponential and logarithmic functions",
    "Trigonometric functions and identities",
    "Combinatorics and probability",
    "Statistics: distributions",
  ],
  "CA_physics_Grade 12": [
    "Kinematics and dynamics",
    "Energy and momentum",
    "Circular motion and gravitation",
    "Simple harmonic motion",
    "Mechanical waves and sound",
    "Electric field and potential",
    "Magnetic fields and induction",
    "Electromagnetic radiation",
    "Quantum mechanics (intro)",
    "Special relativity",
    "Nuclear physics",
  ],
  "CA_chemistry_Grade 12": [
    "Thermochemistry (ΔH, Hess)",
    "Reaction rates and kinetics",
    "Chemical equilibrium",
    "Acid-base equilibria, pH, Ka, Kb",
    "Solubility equilibria, Ksp",
    "Thermodynamics (ΔG, ΔS)",
    "Electrochemistry, redox",
    "Organic chemistry: nomenclature",
    "Organic reaction mechanisms (SN1, SN2)",
    "Polymers and biochemistry",
  ],
  "CA_informatics_Grade 12": [
    "Object-oriented programming",
    "Algorithm design and analysis",
    "Recursion",
    "Data structures (lists, stacks, queues, trees)",
    "Sorting and searching",
    "File I/O and persistence",
    "Software development lifecycle",
    "Networking basics",
  ],

  // ── AUSTRALIA ──────────────────────────────────────────────────────────────
  "AU_math_Year 12 (ATAR)": [
    "Functions and graphs",
    "Trigonometric functions and identities",
    "Differential calculus",
    "Integral calculus",
    "Differential equations (Specialist)",
    "Vectors in 2D and 3D",
    "Complex numbers (Specialist)",
    "Proof techniques (Specialist)",
    "Probability distributions (binomial, normal)",
    "Statistical inference",
  ],
  "AU_physics_Year 12 (ATAR)": [
    "Projectile and circular motion",
    "Gravitation and orbits",
    "Special relativity",
    "Electric and magnetic fields",
    "Electromagnetic induction",
    "Light and quantum theory",
    "Atomic and nuclear physics",
    "Particle physics (introduction)",
  ],
  "AU_chemistry_Year 12 (ATAR)": [
    "Reaction rates and equilibrium",
    "Acids and bases, pH",
    "Redox and electrochemistry",
    "Organic chemistry and mechanisms",
    "Polymers and synthesis",
    "Analytical techniques (chromatography, spectroscopy)",
  ],
  "AU_informatics_Year 12 (ATAR)": [
    "Programming in Python",
    "Algorithms and complexity (Big-O — VIC Algorithmics)",
    "Data structures",
    "Databases and SQL",
    "Networking and security",
    "Software development project",
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
