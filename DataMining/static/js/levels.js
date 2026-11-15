/**
 * Data Miner: The Treasure Hunt - Level Maps & Objectives
 * Full tile layouts, breakable rocks, collectibles, terminals, and objectives.
 */

const TILE_SIZE = 32;

// Tile types:
// 0: Floor
// 1: Wall
// 2: Floor Detail
// 3: Secret Wall (reveals passage)
// 4: Locked Gateway (opens to next level)
// 5: Ancient Data Terminal
// 6: Treasure Chest

const LEVEL_CONFIGS = [
  // -------------------------------------------------------------
  // LEVEL 1: THE MISSING MINERALS (Data Cleaning & Imputation)
  // -------------------------------------------------------------
  {
    id: 1,
    name: "THE MISSING MINERALS",
    subtitle: "Data Cleaning & Missing Value Imputation",
    concept: "Missing Values & Imputation (Mean vs Median vs Drop)",
    story: "You have descended into an abandoned mine. An ancient mineral surveyor terminal holds the coordinates to the mother lode, but critical sensor readings are missing! Mine through the rocks, reach the terminal, and impute the missing values to restore the records.",
    width: 24,
    height: 18,
    playerStart: { x: 3 * 32, y: 3 * 32 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,0,0,1,0,2,0,0,0,1,0,2,0,0,0,0,1,0,0,2,0,0,1],
      [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
      [1,0,2,0,0,0,1,1,1,0,0,0,1,1,1,0,0,2,0,0,1,1,0,1],
      [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,0,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,0,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,1,0,1,5,0,1,0,1,0,0,0,0,1,0,1],
      [1,0,0,0,1,1,0,0,0,1,0,1,0,0,1,0,1,0,2,0,0,1,0,1],
      [1,1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1],
      [1,0,2,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,6,1],
      [1,0,0,0,1,0,0,2,0,1,0,2,0,0,2,0,0,0,1,0,0,0,0,1],
      [1,1,1,0,1,1,0,0,0,1,1,1,1,1,1,0,1,1,1,0,0,0,4,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    rocks: [
      { x: 5, y: 1, type: 'ruby', hp: 2, coins: 25 },
      { x: 7, y: 3, type: 'emerald', hp: 2, coins: 20 },
      { x: 3, y: 7, type: 'gold', hp: 2, coins: 15 },
      { x: 9, y: 7, type: 'amethyst', hp: 2, coins: 15 },
      { x: 13, y: 7, type: 'diamond', hp: 3, coins: 40 },
      { x: 17, y: 7, type: 'ruby', hp: 2, coins: 25 },
      { x: 6, y: 11, type: 'gold', hp: 2, coins: 15 },
      { x: 10, y: 13, type: 'emerald', hp: 2, coins: 20 },
      { x: 14, y: 13, type: 'ruby', hp: 2, coins: 25 },
      { x: 19, y: 14, type: 'diamond', hp: 3, coins: 40 }
    ],
    items: [
      { x: 2, y: 9, type: 'energy', value: 35 },
      { x: 16, y: 2, type: 'coin', value: 10 },
      { x: 8, y: 14, type: 'energy', value: 30 }
    ],
    terminalPos: { x: 12, y: 9 },
    chestPos: { x: 22, y: 13 },
    gatePos: { x: 22, y: 15 },
    ambientColor: 'rgba(0, 240, 255, 0.15)'
  },

  // -------------------------------------------------------------
  // LEVEL 2: THE HIDDEN TREASURE (EDA & Correlation)
  // -------------------------------------------------------------
  {
    id: 2,
    name: "THE HIDDEN TREASURE",
    subtitle: "Exploratory Data Analysis & Feature Correlation",
    concept: "Descriptive Statistics, Pearson Correlation Matrix, Scatter Plots",
    story: "Deep within the Glimmering Chasm, multiple ore veins branch into darkness. One specific geological property has a near-perfect correlation with high market value. Perform EDA at the scanner terminal and identify the strongest feature to unlock the secret passage!",
    width: 24,
    height: 18,
    playerStart: { x: 2 * 32, y: 2 * 32 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,2,0,0,1,0,2,0,0,0,1,0,0,2,0,0,1,1,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
      [1,1,1,0,1,1,1,1,0,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,2,0,1,0,0,1,1,1,0,5,0,1,1,0,0,2,0,0,1,0,0,1],
      [1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,1],
      [1,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,1,1,1,0,1,1,0,1],
      [1,0,0,0,0,1,0,2,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
      [1,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,1,0,1],
      [1,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,1,0,1],
      [1,0,0,0,1,1,0,0,1,1,1,3,1,1,1,0,0,0,1,0,0,0,0,1], // (11, 12) is secret wall!
      [1,0,2,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,2,0,6,1], // (22, 13) is chest!
      [1,0,0,0,1,0,2,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,1],
      [1,1,1,0,1,1,1,1,1,1,0,0,0,1,1,1,1,0,1,0,0,0,4,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    rocks: [
      { x: 4, y: 2, type: 'gold', hp: 2, coins: 20 },
      { x: 9, y: 2, type: 'emerald', hp: 2, coins: 25 },
      { x: 15, y: 3, type: 'ruby', hp: 2, coins: 30 },
      { x: 3, y: 6, type: 'diamond', hp: 3, coins: 45 },
      { x: 18, y: 7, type: 'gold', hp: 2, coins: 20 },
      { x: 7, y: 10, type: 'amethyst', hp: 2, coins: 20 },
      { x: 13, y: 10, type: 'ruby', hp: 2, coins: 30 },
      { x: 10, y: 14, type: 'diamond', hp: 3, coins: 50 },
      { x: 12, y: 14, type: 'gold', hp: 2, coins: 25 }
    ],
    items: [
      { x: 3, y: 9, type: 'energy', value: 40 },
      { x: 14, y: 9, type: 'energy', value: 40 },
      { x: 20, y: 3, type: 'coin', value: 15 }
    ],
    terminalPos: { x: 11, y: 6 },
    secretWallPos: { x: 11, y: 12 },
    chestPos: { x: 22, y: 13 },
    gatePos: { x: 22, y: 15 },
    ambientColor: 'rgba(255, 215, 0, 0.15)'
  },

  // -------------------------------------------------------------
  // LEVEL 3: THE CRYSTAL KINGDOM (K-Means Clustering)
  // -------------------------------------------------------------
  {
    id: 3,
    name: "THE CRYSTAL KINGDOM",
    subtitle: "Unsupervised Learning & K-Means Clustering",
    concept: "K-Means, Cluster Centroids, Inertia, Feature Grouping",
    story: "You have stepped into the breathtaking Crystal Kingdom! Hundreds of glowing crystals surround you, but their types are unknown. Use Scikit-learn K-Means clustering at the terminal to partition the specimens into clusters and isolate the ultra-rare Mythic Star Crystals!",
    width: 24,
    height: 18,
    playerStart: { x: 2 * 32, y: 8 * 32 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1],
      [1,0,2,0,1,0,2,0,0,0,0,1,0,2,0,0,0,0,1,0,2,0,0,1],
      [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
      [1,1,1,0,1,1,0,0,1,1,0,0,0,1,1,1,0,0,1,1,0,1,1,1],
      [1,0,0,0,0,1,0,0,0,0,0,5,0,0,0,0,0,0,1,0,0,0,0,1],
      [1,0,2,0,0,1,0,2,0,0,0,0,0,0,0,2,0,0,1,0,0,2,0,1],
      [1,0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,1,1,0,0,1,0,0,1,0,2,0,0,0,1,0,0,1,0,0,1,1,1,1],
      [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,2,0,0,1,1,0,0,1,1,0,1,1,0,0,1,1,0,0,2,0,0,1],
      [1,1,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,1,1,1],
      [1,0,0,0,1,1,0,0,0,1,0,0,0,1,0,0,0,1,1,0,0,0,6,1],
      [1,0,2,0,1,0,0,2,0,0,0,2,0,0,0,2,0,0,1,0,0,0,0,1],
      [1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,4,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    rocks: [
      { x: 4, y: 3, type: 'diamond', hp: 3, coins: 40 },
      { x: 9, y: 3, type: 'amethyst', hp: 2, coins: 25 },
      { x: 14, y: 3, type: 'ruby', hp: 2, coins: 30 },
      { x: 7, y: 6, type: 'emerald', hp: 2, coins: 25 },
      { x: 16, y: 6, type: 'gold', hp: 2, coins: 30 },
      { x: 4, y: 10, type: 'amethyst', hp: 2, coins: 25 },
      { x: 19, y: 10, type: 'diamond', hp: 3, coins: 50 },
      { x: 11, y: 13, type: 'ruby', hp: 2, coins: 35 },
      { x: 13, y: 13, type: 'gold', hp: 2, coins: 30 }
    ],
    items: [
      { x: 2, y: 3, type: 'energy', value: 45 },
      { x: 21, y: 3, type: 'coin', value: 25 },
      { x: 10, y: 8, type: 'energy', value: 35 }
    ],
    terminalPos: { x: 11, y: 5 },
    chestPos: { x: 22, y: 13 },
    gatePos: { x: 22, y: 15 },
    ambientColor: 'rgba(224, 64, 251, 0.18)'
  },

  // -------------------------------------------------------------
  // LEVEL 4: THE DANGEROUS MINE (Outlier Detection)
  // -------------------------------------------------------------
  {
    id: 4,
    name: "THE OUTLIER VAULT",
    subtitle: "Statistical Quartiles & Outlier Detection (IQR)",
    concept: "Interquartile Range (IQR), Quartiles Q1 & Q3, Box Plots, Outlier Detection",
    story: "You have arrived at a mineral deposit with extreme statistical variation. Calculate quartiles Q1 and Q3, determine the Interquartile Range (IQR), and establish the mathematical boundaries to detect outliers and isolate the rare Celestial Diamond!",
    width: 24,
    height: 18,
    playerStart: { x: 2 * 32, y: 2 * 32 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,2,0,0,1,0,2,0,0,0,1,0,2,0,0,0,1,1,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
      [1,1,1,0,1,1,1,1,0,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,2,0,1,0,0,1,1,1,0,5,0,1,1,0,0,2,0,0,1,0,0,1],
      [1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,1],
      [1,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,1,1,1,0,1,1,0,1],
      [1,0,0,0,0,1,0,2,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
      [1,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,1,0,1],
      [1,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,1,0,1],
      [1,0,0,0,1,1,0,0,1,1,1,0,1,1,1,0,0,0,1,0,0,0,0,1],
      [1,0,2,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,2,0,6,1],
      [1,0,0,0,1,0,2,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,1],
      [1,1,1,0,1,1,1,1,1,1,0,0,0,1,1,1,1,0,1,0,0,0,4,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    rocks: [
      { x: 4, y: 2, type: 'hazard', hp: 3, coins: 50 },
      { x: 9, y: 2, type: 'gold', hp: 2, coins: 25 },
      { x: 15, y: 3, type: 'hazard', hp: 3, coins: 50 },
      { x: 3, y: 6, type: 'celestial', hp: 4, coins: 150 },
      { x: 18, y: 7, type: 'hazard', hp: 3, coins: 50 },
      { x: 7, y: 10, type: 'diamond', hp: 3, coins: 45 },
      { x: 13, y: 10, type: 'hazard', hp: 3, coins: 50 },
      { x: 10, y: 14, type: 'gold', hp: 2, coins: 30 },
      { x: 12, y: 14, type: 'hazard', hp: 3, coins: 50 }
    ],
    items: [
      { x: 3, y: 9, type: 'energy', value: 50 },
      { x: 14, y: 9, type: 'energy', value: 50 },
      { x: 20, y: 3, type: 'coin', value: 30 }
    ],
    terminalPos: { x: 11, y: 6 },
    chestPos: { x: 22, y: 13 },
    gatePos: { x: 22, y: 15 },
    ambientColor: 'rgba(255, 51, 68, 0.16)'
  },

  // -------------------------------------------------------------
  // LEVEL 5: THE FINAL TREASURE (Regression & Model Evaluation)
  // -------------------------------------------------------------
  {
    id: 5,
    name: "THE FINAL TREASURE",
    subtitle: "Supervised Regression & Machine Learning Model Evaluation",
    concept: "Train/Test Split, Linear vs Tree vs Random Forest, MAE, RMSE, Generalization",
    story: "At last, you reach the Legendary Vault of the Mountain King! A cryptographic mechanism protects the vault. It requires the exact market value prediction of the King's Master Gem. Train Linear Regression, Decision Tree, and Random Forest models on historical ore data, evaluate test error (RMSE), and enter the winning model's prediction!",
    width: 24,
    height: 18,
    playerStart: { x: 2 * 32, y: 7 * 32 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1],
      [1,0,2,0,1,0,2,0,0,0,0,1,0,2,0,0,0,0,1,0,2,0,0,1],
      [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
      [1,1,1,0,1,1,0,0,1,1,0,0,0,1,1,1,0,0,1,1,0,1,1,1],
      [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
      [1,0,2,0,0,1,0,2,0,0,0,0,0,0,0,2,0,0,1,0,0,2,0,1],
      [1,0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,1,0,0,5,0,0,1,0,0,0,0,0,0,0,0,1], // (11, 8) Terminal
      [1,1,1,0,0,1,0,0,1,0,2,0,0,0,1,0,0,1,0,0,1,1,1,1],
      [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,2,0,0,1,1,0,0,1,1,0,1,1,0,0,1,1,0,0,2,0,0,1],
      [1,1,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,1,1,1],
      [1,0,0,0,1,1,0,0,0,1,0,0,0,1,0,0,0,1,1,0,0,0,6,1], // Grand Chest
      [1,0,2,0,1,0,0,2,0,0,0,2,0,0,0,2,0,0,1,0,0,0,0,1],
      [1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,4,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    rocks: [
      { x: 4, y: 3, type: 'diamond', hp: 3, coins: 60 },
      { x: 9, y: 3, type: 'gold', hp: 2, coins: 40 },
      { x: 14, y: 3, type: 'ruby', hp: 2, coins: 45 },
      { x: 7, y: 6, type: 'emerald', hp: 2, coins: 40 },
      { x: 16, y: 6, type: 'celestial', hp: 4, coins: 180 },
      { x: 4, y: 10, type: 'diamond', hp: 3, coins: 60 },
      { x: 19, y: 10, type: 'gold', hp: 2, coins: 45 },
      { x: 11, y: 13, type: 'ruby', hp: 2, coins: 50 },
      { x: 13, y: 13, type: 'diamond', hp: 3, coins: 70 }
    ],
    items: [
      { x: 2, y: 3, type: 'energy', value: 60 },
      { x: 21, y: 3, type: 'coin', value: 50 },
      { x: 11, y: 11, type: 'energy', value: 50 }
    ],
    terminalPos: { x: 11, y: 8 },
    chestPos: { x: 22, y: 13 },
    gatePos: { x: 22, y: 15 },
    ambientColor: 'rgba(255, 215, 0, 0.25)'
  }
];

window.LEVEL_CONFIGS = LEVEL_CONFIGS;
window.TILE_SIZE = TILE_SIZE;
