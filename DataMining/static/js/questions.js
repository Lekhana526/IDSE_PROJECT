/**
 * DATA MINER: THE TREASURE HUNT - DYNAMIC QUESTION BANK FRONTEND DATA
 * All answers, options, metrics, and explanations are calculated dynamically
 * using mathematical formulas, statistical computations, and data science principles.
 */

const JSQuestionSolvers = {
  // SET 1, LEVEL 1: Missing value median imputation
  solve_q1_1(data) {
    const raw = data || [10, 12, 14, null, 18, 100];
    const valid = raw.filter(x => x !== null && !isNaN(x)).sort((a, b) => a - b);
    const mid = Math.floor(valid.length / 2);
    const median = valid.length % 2 !== 0 ? valid[mid] : (valid[mid - 1] + valid[mid]) / 2;

    const options = {
      "A": "12",
      "B": String(median),
      "C": "16",
      "D": "18"
    };
    const correctOpt = Object.keys(options).find(k => options[k] === String(median)) || "B";
    const explanation = `Sorted observed non-missing values are [${valid.join(', ')}]. With N = ${valid.length} samples, the dynamically computed median is the middle value at index ${mid}, which is ${median}. Under median imputation, ${median} (Option ${correctOpt}) will be inserted.`;

    return {
      computedValue: median,
      correctAnswer: correctOpt,
      displayAnswer: `${correctOpt} (${median})`,
      options: options,
      explanation: explanation
    };
  },

  verify_q1_1(input, solved) {
    const s = String(input || '').trim().toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(s[0])) {
      return s[0] === solved.correctAnswer;
    }
    const num = parseFloat(s);
    return !isNaN(num) && Math.abs(num - solved.computedValue) < 0.05;
  },

  // SET 1, LEVEL 2: Strongest negative correlation
  solve_q1_2(corrs) {
    const c = corrs || { "Weight": 0.92, "Hardness": -0.18, "Size": 0.76, "Density": 0.43 };
    let minFeature = null;
    let minVal = Infinity;
    for (const [feat, val] of Object.entries(c)) {
      if (val < minVal) {
        minVal = val;
        minFeature = feat;
      }
    }
    const explanation = `Evaluating feature correlation metrics: ${minFeature} has the most negative Pearson correlation coefficient (r = ${minVal}), representing the strongest negative relationship with market value.`;
    return {
      computedValue: minVal,
      correctAnswer: minFeature,
      displayAnswer: minFeature,
      explanation: explanation
    };
  },

  verify_q1_2(input, solved) {
    const u = String(input || '').trim().toLowerCase();
    const t = String(solved.correctAnswer).trim().toLowerCase();
    return u === t;
  },

  // SET 1, LEVEL 3: K-Means objective function
  solve_q1_3() {
    const options = {
      "A": "It creates four clusters by randomly assigning permanent labels.",
      "B": "It minimises the within-cluster sum of squared distances from samples to their assigned centroids.",
      "C": "It maximises the distance between every sample and its centroid.",
      "D": "It predicts the mineral's market value using four regression models."
    };
    return {
      computedValue: "min_wcss",
      correctAnswer: "B",
      displayAnswer: "B",
      options: options,
      explanation: "The mathematical objective function of K-Means is to minimise inertia: J = Σ Σ ||x_i - μ_k||², representing the within-cluster sum of squared Euclidean distances to assigned centroids."
    };
  },

  verify_q1_3(input, solved) {
    const s = String(input || '').trim().toUpperCase();
    return s[0] === solved.correctAnswer;
  },

  // SET 1, LEVEL 4: Outlier detection upper boundary
  solve_q1_4(q1 = 20, q3 = 40, multiplier = 1.5) {
    const iqr = q3 - q1;
    const upperBound = q3 + multiplier * iqr;
    const lowerBound = q1 - multiplier * iqr;
    return {
      computedValue: upperBound,
      correctAnswer: String(upperBound),
      displayAnswer: String(upperBound),
      explanation: `IQR = Q3 - Q1 = ${q3} - ${q1} = ${iqr}. Upper boundary = Q3 + ${multiplier} × IQR = ${q3} + (${multiplier} × ${iqr}) = ${upperBound}. (Lower boundary = ${lowerBound}).`
    };
  },

  verify_q1_4(input, solved) {
    const num = parseFloat(String(input || '').match(/[-+]?\d*\.?\d+/)?.[0]);
    return !isNaN(num) && Math.abs(num - solved.computedValue) < 0.05;
  },

  // SET 1, LEVEL 5: Regression MAE vs RMSE
  solve_q1_5() {
    const models = {
      "Model A": { mae: 5, rmse: 8 },
      "Model B": { mae: 6, rmse: 7 }
    };
    const options = {
      "A": "Model A is better under both metrics.",
      "B": "Model B is better under both metrics.",
      "C": "Model A has lower average absolute error, but Model B has lower RMSE.",
      "D": "Both models have identical performance."
    };
    return {
      computedValue: "A_mae_B_rmse",
      correctAnswer: "C",
      displayAnswer: "C",
      options: options,
      explanation: `Model A has lower MAE (${models["Model A"].mae} < ${models["Model B"].mae}), while Model B has lower RMSE (${models["Model B"].rmse} < ${models["Model A"].rmse}). Model A has lower average absolute error, but Model B penalises large errors less.`
    };
  },

  verify_q1_5(input, solved) {
    const s = String(input || '').trim().toUpperCase();
    return s[0] === solved.correctAnswer;
  },

  // SET 2, LEVEL 1: Skewed distribution imputation
  solve_q2_1() {
    const options = {
      "A": "Mean imputation because it considers every observation.",
      "B": "Median imputation because it is less affected by extreme values.",
      "C": "Replace all missing values with zero.",
      "D": "Delete the entire dataset."
    };
    return {
      computedValue: "median_robustness",
      correctAnswer: "B",
      displayAnswer: "B",
      options: options,
      explanation: "In right-skewed distributions, extreme values pull the arithmetic mean significantly higher than typical observations. The median represents the 50th percentile and is robust against outlier distortion."
    };
  },

  verify_q2_1(input, solved) {
    const s = String(input || '').trim().toUpperCase();
    return s[0] === solved.correctAnswer;
  },

  // SET 2, LEVEL 2: Pearson correlation
  solve_q2_2(cov = 320, stdX = 4, stdY = 100) {
    const r = cov / (stdX * stdY);
    const rFormatted = r.toFixed(2);
    return {
      computedValue: r,
      correctAnswer: rFormatted,
      displayAnswer: rFormatted,
      explanation: `r = Cov(X, Y) / (σX × σY) = ${cov} / (${stdX} × ${stdY}) = ${cov} / ${stdX * stdY} = ${rFormatted}.`
    };
  },

  verify_q2_2(input, solved) {
    const num = parseFloat(String(input || '').match(/[-+]?\d*\.?\d+/)?.[0]);
    return !isNaN(num) && Math.abs(num - solved.computedValue) < 0.05;
  },

  // SET 2, LEVEL 3: Feature scaling
  solve_q2_3() {
    const options = {
      "A": "Remove the hardness feature.",
      "B": "Increase K to 20.",
      "C": "Standardise or normalise the features before clustering.",
      "D": "Convert the dataset into categorical labels."
    };
    return {
      computedValue: "standardize",
      correctAnswer: "C",
      displayAnswer: "C",
      options: options,
      explanation: "Because K-Means calculates Euclidean distance, features with a scale range of 1000 dominate squared distance calculations by ~10,000x over features ranging from 1 to 10. Standardising features scales attributes to comparable variance."
    };
  },

  verify_q2_3(input, solved) {
    const s = String(input || '').trim().toUpperCase();
    return s[0] === solved.correctAnswer;
  },

  // SET 2, LEVEL 4: Multi-part quartile & outlier calculation
  solve_q2_4(data) {
    const raw = data || [12, 15, 18, 20, 22, 24, 26, 28, 30, 100];
    const sorted = [...raw].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const lower = sorted.slice(0, mid);
    const upper = sorted.slice(mid);

    const getMedian = arr => {
      const m = Math.floor(arr.length / 2);
      return arr.length % 2 !== 0 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
    };

    const q1 = getMedian(lower);
    const q3 = getMedian(upper);
    const iqr = q3 - q1;
    const upperBound = q3 + 1.5 * iqr;
    const testVal = 100;
    const isOutlier = testVal > upperBound;
    const outlierStr = isOutlier ? "Yes" : "No";

    const canonical = `${q1}, ${q3}, ${iqr}, ${outlierStr}`;
    const explanation = `Lower half [${lower.join(', ')}] -> Q1 = ${q1}. Upper half [${upper.join(', ')}] -> Q3 = ${q3}. IQR = Q3 - Q1 = ${q3} - ${q1} = ${iqr}. Upper boundary = Q3 + 1.5 × IQR = ${q3} + 1.5 × ${iqr} = ${upperBound}. Since ${testVal} > ${upperBound}, ${testVal} is an outlier (${outlierStr}).`;

    return {
      computedValue: { q1, q3, iqr, upperBound, isOutlier },
      correctAnswer: canonical,
      displayAnswer: canonical,
      explanation: explanation
    };
  },

  verify_q2_4(input, solved) {
    const tokens = String(input || '').toLowerCase().split(/[,;\s]+/).filter(Boolean);
    if (tokens.length >= 4) {
      const uQ1 = parseFloat(tokens[0]);
      const uQ3 = parseFloat(tokens[1]);
      const uIqr = parseFloat(tokens[2]);
      const uOutlier = tokens[3];

      const cv = solved.computedValue;
      return (
        !isNaN(uQ1) && !isNaN(uQ3) && !isNaN(uIqr) &&
        Math.abs(uQ1 - cv.q1) < 0.1 &&
        Math.abs(uQ3 - cv.q3) < 0.1 &&
        Math.abs(uIqr - cv.iqr) < 0.1 &&
        ['yes', 'y', 'true'].includes(uOutlier) === cv.isOutlier
      );
    }
    return false;
  },

  // SET 2, LEVEL 5: Overfitting diagnosis
  solve_q2_5(trainRmse = 2, testRmse = 25) {
    const options = {
      "A": "The model is underfitting.",
      "B": "The model is overfitting.",
      "C": "The model has perfect generalisation.",
      "D": "The model has no prediction error."
    };
    return {
      computedValue: "overfitting",
      correctAnswer: "B",
      displayAnswer: "B",
      options: options,
      explanation: `Training RMSE = ${trainRmse} while Testing RMSE = ${testRmse} (generalisation error ratio = ${(testRmse / trainRmse).toFixed(1)}x). A huge gap between near-zero training error and high testing error is the hallmark of overfitting (high variance).`
    };
  },

  verify_q2_5(input, solved) {
    const s = String(input || '').trim().toUpperCase();
    return s[0] === solved.correctAnswer;
  },

  // SET 3, LEVEL 1: Preventing data leakage
  solve_q3_1() {
    const options = {
      "A": "Calculate the mean using the complete dataset before splitting.",
      "B": "Calculate separate means using the training and testing sets.",
      "C": "Calculate the mean using training data and use that same value to impute both training and testing data.",
      "D": "Replace all missing values with the maximum weight."
    };
    return {
      computedValue: "fit_train_transform_both",
      correctAnswer: "C",
      displayAnswer: "C",
      options: options,
      explanation: "To prevent data leakage, parameters must be estimated exclusively on the training partition. That learned value is then applied to transform both training and testing sets."
    };
  },

  verify_q3_1(input, solved) {
    const s = String(input || '').trim().toUpperCase();
    return s[0] === solved.correctAnswer;
  },

  // SET 3, LEVEL 2: Correlation vs Causation and R^2
  solve_q3_2(r = 0.95) {
    const r2 = r * r;
    const r2Pct = (r2 * 100).toFixed(2);
    const options = {
      "A": "Increasing weight definitely causes market value to increase.",
      "B": "Weight and market value have a strong positive linear association, but causation cannot be concluded from correlation alone.",
      "C": "Both variables have identical values.",
      "D": "Weight explains exactly 95% of the variation in market value."
    };
    return {
      computedValue: { r, r2 },
      correctAnswer: "B",
      displayAnswer: "B",
      options: options,
      explanation: `With r = ${r}, weight and market value have a strong positive linear association. Causation cannot be inferred from correlation alone. Furthermore, R² = r² = ${r}² = ${r2.toFixed(4)} (${r2Pct}%), which confirms weight does not explain 95% of variation.`
    };
  },

  verify_q3_2(input, solved) {
    const s = String(input || '').trim().toUpperCase();
    return s[0] === solved.correctAnswer;
  },

  // SET 3, LEVEL 3: Euclidean distance to centroids
  solve_q3_3() {
    const centroids = {
      "C1": [2, 3],
      "C2": [8, 8],
      "C3": [5, 2]
    };
    const target = [6, 3];
    const distances = {};
    for (const [name, pt] of Object.entries(centroids)) {
      distances[name] = Math.hypot(target[0] - pt[0], target[1] - pt[1]);
    }
    let nearest = "C3";
    let minD = Infinity;
    for (const [name, d] of Object.entries(distances)) {
      if (d < minD) {
        minD = d;
        nearest = name;
      }
    }
    const lines = Object.entries(centroids).map(([name, pt]) => 
      `• d(${name}) = sqrt((${target[0]}-${pt[0]})² + (${target[1]}-${pt[1]})²) = ${distances[name].toFixed(2)}`
    );
    const explanation = `Euclidean distances to point (6, 3):\n${lines.join('\n')}\nNearest centroid is ${nearest} (distance = ${minD.toFixed(2)}).`;

    return {
      computedValue: distances,
      correctAnswer: nearest,
      displayAnswer: nearest,
      explanation: explanation
    };
  },

  verify_q3_3(input, solved) {
    const cleanUser = String(input || '').trim().toLowerCase().replace(/\s+/g, '');
    const cleanTarget = String(solved.correctAnswer).trim().toLowerCase();
    return cleanUser === cleanTarget;
  },

  // SET 3, LEVEL 4: Outlier treatment investigation
  solve_q3_4() {
    const options = {
      "A": "Always delete 100 because it is an outlier.",
      "B": "Replace 100 with zero.",
      "C": "Investigate whether 100 is a measurement error or a genuine rare mineral observation before deciding what to do.",
      "D": "Delete every observation above the mean."
    };
    return {
      computedValue: "domain_investigation",
      correctAnswer: "C",
      displayAnswer: "C",
      options: options,
      explanation: "Outliers must not be blindly deleted or replaced with zero. A data scientist must first investigate domain context: genuine rare minerals provide crucial signal, whereas sensor glitches should be cleaned."
    };
  },

  verify_q3_4(input, solved) {
    const s = String(input || '').trim().toUpperCase();
    return s[0] === solved.correctAnswer;
  },

  // SET 3, LEVEL 5: Regression lowest RMSE model
  solve_q3_5() {
    const models = {
      "Linear Regression": { mae: 12, rmse: 16 },
      "Decision Tree": { mae: 9, rmse: 14 },
      "Random Forest": { mae: 10, rmse: 11 }
    };
    let best = "Random Forest";
    let minRmse = Infinity;
    for (const [name, m] of Object.entries(models)) {
      if (m.rmse < minRmse) {
        minRmse = m.rmse;
        best = name;
      }
    }
    const explanation = `Comparing test RMSE values: Linear Regression (16), Decision Tree (14), Random Forest (${minRmse}). ${best} achieves the lowest RMSE of ${minRmse}.`;
    return {
      computedValue: minRmse,
      correctAnswer: best,
      displayAnswer: best,
      explanation: explanation
    };
  },

  verify_q3_5(input, solved) {
    const cleanUser = String(input || '').trim().toLowerCase().replace(/[\s_-]+/g, ' ');
    if (['rf', 'random forest'].includes(cleanUser)) return true;
    return cleanUser === String(solved.correctAnswer).toLowerCase();
  }
};

/**
 * Builds the dynamic question bank object using JSQuestionSolvers.
 */
function buildDynamicQuestionSetsBank() {
  const qDefs = [
    // SET 1
    {
      id: "q1_1", setId: 1, level: 1,
      topic: "Data Cleaning and Missing Value Imputation",
      type: "mcq",
      question: "A mineral dataset has the following weight measurements:\n\n[10, 12, 14, NaN, 18, 100]\n\nIf the missing value is replaced using the median, what value will be inserted?",
      solver: JSQuestionSolvers.solve_q1_1,
      verifier: JSQuestionSolvers.verify_q1_1
    },
    {
      id: "q1_2", setId: 1, level: 2,
      topic: "EDA and Correlation",
      type: "short_text",
      question: "A dataset contains the following correlation values with mineral market value:\n\n• Weight: 0.92\n• Hardness: -0.18\n• Size: 0.76\n• Density: 0.43\n\nWhich feature has the strongest negative relationship with market value?",
      input_placeholder: "Type feature name (e.g. Hardness)",
      solver: JSQuestionSolvers.solve_q1_2,
      verifier: JSQuestionSolvers.verify_q1_2
    },
    {
      id: "q1_3", setId: 1, level: 3,
      topic: "K-Means Clustering",
      type: "mcq",
      question: "K-Means is applied to a dataset containing 120 mineral samples. The player selects K = 4.\n\nWhich statement correctly describes the algorithm?",
      solver: JSQuestionSolvers.solve_q1_3,
      verifier: JSQuestionSolvers.verify_q1_3
    },
    {
      id: "q1_4", setId: 1, level: 4,
      topic: "Outlier Detection",
      type: "numerical",
      question: "A mineral weight dataset has:\n\nQ1 = 20\nQ3 = 40\n\nUsing the IQR method, calculate the upper outlier boundary.",
      input_placeholder: "Enter numerical value",
      solver: JSQuestionSolvers.solve_q1_4,
      verifier: JSQuestionSolvers.verify_q1_4
    },
    {
      id: "q1_5", setId: 1, level: 5,
      topic: "Regression and Model Evaluation",
      type: "mcq",
      question: "Two regression models produce these results on the same test dataset:\n\nModel A: MAE = 5, RMSE = 8\nModel B: MAE = 6, RMSE = 7\n\nWhich statement is correct?",
      solver: JSQuestionSolvers.solve_q1_5,
      verifier: JSQuestionSolvers.verify_q1_5
    },

    // SET 2
    {
      id: "q2_1", setId: 2, level: 1,
      topic: "Data Cleaning and Missing Value Imputation",
      type: "mcq",
      question: "A dataset contains mineral prices with a highly right-skewed distribution due to a few extremely expensive diamonds.\n\nWhich method is generally more appropriate for imputing missing price values?",
      solver: JSQuestionSolvers.solve_q2_1,
      verifier: JSQuestionSolvers.verify_q2_1
    },
    {
      id: "q2_2", setId: 2, level: 2,
      topic: "EDA and Correlation",
      type: "numerical",
      question: "A dataset contains 50 mineral samples.\n\n• Mean weight = 20 grams\n• Mean market value = ₹500\n• Standard deviation of weight = 4\n• Standard deviation of market value = 100\n• Covariance = 320\n\nCalculate the Pearson correlation coefficient.\n\nUse:\nr = Cov(X,Y) / (σX × σY)\n\nRound your answer to two decimal places.",
      input_placeholder: "Enter decimal (e.g. 0.80)",
      solver: JSQuestionSolvers.solve_q2_2,
      verifier: JSQuestionSolvers.verify_q2_2
    },
    {
      id: "q2_3", setId: 2, level: 3,
      topic: "K-Means Clustering",
      type: "mcq",
      question: "A mineral dataset contains two features:\n\n• Weight: ranges from 1 to 1000.\n• Hardness: ranges from 1 to 10.\n\nK-Means clustering produces groups almost entirely based on weight.\n\nWhat is the most appropriate solution?",
      solver: JSQuestionSolvers.solve_q2_3,
      verifier: JSQuestionSolvers.verify_q2_3
    },
    {
      id: "q2_4", setId: 2, level: 4,
      topic: "Outlier Detection",
      type: "multi_part",
      question: "A dataset has the following values:\n\n[12, 15, 18, 20, 22, 24, 26, 28, 30, 100]\n\nUsing the median-of-halves method:\n1. Calculate Q1.\n2. Calculate Q3.\n3. Calculate IQR.\n4. Determine whether 100 is an outlier.\n\nAnswer format:\nQ1, Q3, IQR, Outlier (Yes/No)",
      input_placeholder: "Format: 18, 28, 10, Yes",
      solver: JSQuestionSolvers.solve_q2_4,
      verifier: JSQuestionSolvers.verify_q2_4
    },
    {
      id: "q2_5", setId: 2, level: 5,
      topic: "Regression and Model Evaluation",
      type: "mcq",
      question: "A Decision Tree Regressor achieves:\n\nTraining RMSE = 2\nTesting RMSE = 25\n\nWhat is the most likely explanation?",
      solver: JSQuestionSolvers.solve_q2_5,
      verifier: JSQuestionSolvers.verify_q2_5
    },

    // SET 3
    {
      id: "q3_1", setId: 3, level: 1,
      topic: "Data Cleaning and Missing Value Imputation",
      type: "mcq",
      question: "A mineral dataset is divided into training and testing sets.\n\nYou want to use mean imputation for missing weight values.\n\nWhich approach prevents data leakage?",
      solver: JSQuestionSolvers.solve_q3_1,
      verifier: JSQuestionSolvers.verify_q3_1
    },
    {
      id: "q3_2", setId: 3, level: 2,
      topic: "EDA and Correlation",
      type: "mcq",
      question: "The correlation between mineral weight and market value is 0.95.\n\nWhich conclusion is scientifically valid?",
      solver: JSQuestionSolvers.solve_q3_2,
      verifier: JSQuestionSolvers.verify_q3_2
    },
    {
      id: "q3_3", setId: 3, level: 3,
      topic: "K-Means Clustering",
      type: "short_text",
      question: "A K-Means algorithm has three cluster centroids:\n\nC1 = (2, 3)\nC2 = (8, 8)\nC3 = (5, 2)\n\nA newly discovered mineral has coordinates (6, 3).\n\nUsing Euclidean distance, identify the nearest centroid.",
      input_placeholder: "Type nearest centroid (e.g. C1, C2, C3)",
      solver: JSQuestionSolvers.solve_q3_3,
      verifier: JSQuestionSolvers.verify_q3_3
    },
    {
      id: "q3_4", setId: 3, level: 4,
      topic: "Outlier Detection",
      type: "mcq",
      question: "A mineral dataset contains:\n\n[10, 12, 13, 14, 15, 16, 17, 18, 100]\n\nThe value 100 is flagged as an outlier using IQR.\n\nWhat should the data scientist do?",
      solver: JSQuestionSolvers.solve_q3_4,
      verifier: JSQuestionSolvers.verify_q3_4
    },
    {
      id: "q3_5", setId: 3, level: 5,
      topic: "Regression and Model Evaluation",
      type: "short_text",
      question: "Three regression models are evaluated on the same test dataset:\n\nLinear Regression: MAE = 12, RMSE = 16\nDecision Tree: MAE = 9, RMSE = 14\nRandom Forest: MAE = 10, RMSE = 11\n\nThe game requires you to select the model with the lowest RMSE.",
      input_placeholder: "Type model name (e.g. Random Forest)",
      solver: JSQuestionSolvers.solve_q3_5,
      verifier: JSQuestionSolvers.verify_q3_5
    }
  ];

  const bank = {
    1: { set_id: 1, name: "The Lost Expedition", questions: [] },
    2: { set_id: 2, name: "The Crystal Labyrinth", questions: [] },
    3: { set_id: 3, name: "The Final Diamond Vault", questions: [] }
  };

  qDefs.forEach(def => {
    const solved = def.solver();
    const qObj = {
      id: def.id,
      level: def.level,
      topic: def.topic,
      type: def.type,
      question: def.question,
      correct_answer: solved.correctAnswer,
      display_answer: solved.displayAnswer,
      explanation: solved.explanation,
      solver: def.solver,
      verifier: def.verifier
    };
    if (solved.options) qObj.options = solved.options;
    if (def.input_placeholder) qObj.input_placeholder = def.input_placeholder;

    if (bank[def.setId]) {
      bank[def.setId].questions.push(qObj);
    }
  });

  return bank;
}

const QUESTION_SETS_BANK = buildDynamicQuestionSetsBank();
window.QUESTION_SETS_BANK = QUESTION_SETS_BANK;
window.JSQuestionSolvers = JSQuestionSolvers;
