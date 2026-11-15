/**
 * Data Miner: The Treasure Hunt - Complete Educational Data Scanner Controller
 * Implements the 3-Stage Experiential Learning Cycle in Every Level:
 *   STAGE 1: LEARN (Beginner-friendly concepts, analogies, principles)
 *   STAGE 2: EXPERIMENT (Hands-on interactive workbenches with real calculations)
 *   STAGE 3: CHALLENGE (Scenario-based challenges, real consequences, dynamic rewards)
 */

class DataScanner {
  constructor(game) {
    this.game = game;
    this.modal = document.getElementById('scanner-modal');
    this.body = document.getElementById('scanner-body');
    this.title = document.getElementById('scanner-title-text');
    this.closeBtn = document.getElementById('scanner-close-btn');

    this.activeLevel = 1;
    this.activeStage = 'learn'; // 'learn' | 'experiment' | 'challenge'

    // Per-level experiment workbench runtime state
    this.experimentState = {
      1: { strategy: 'median' },
      2: { feature: 'Crystal_Size_mm' },
      3: { k: 3 },
      4: { multiplier: 1.5 },
      5: { modelType: 'random_forest' }
    };

    // Cached responses to make stage navigation smooth & instant
    this.cache = {};

    // Track consecutive wrong challenge attempts per level for penalty scaling
    this.wrongAttempts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.lastSubmitted = { 1: '', 2: '', 3: '', 4: '', 5: '' };

    this.closeBtn.addEventListener('click', () => this.close());
  }

  open(levelId) {
    this.activeLevel = levelId || this.game.currentLevel;
    this.activeStage = 'learn'; // Always start with Learn when opening a terminal
    this.modal.style.display = 'flex';
    this.game.state = 'SCANNER';
    window.soundEngine.playScannerBeep();

    this.title.textContent = `ANCIENT DATA TERMINAL â€¢ LEVEL ${this.activeLevel}`;
    this.render();
  }

  close() {
    this.modal.style.display = 'none';
    this.game.state = 'PLAYING';
    window.soundEngine.playScannerBeep();
  }

  setStage(stageName) {
    if (this.activeStage === stageName) return;
    this.activeStage = stageName;
    window.soundEngine.playScannerBeep();
    this.render();
  }

  render() {
    const lvl = this.activeLevel;
    const stage = this.activeStage;

    // Render Stage Navigation Header + Content Container
    this.body.innerHTML = `
      <div class="terminal-stage-nav">
        <button class="stage-nav-tab ${stage === 'learn' ? 'active' : ''}" id="tab-stage-learn" onclick="window.dataScanner.setStage('learn')">
          <span class="stage-num">STAGE 1</span>
          <span class="stage-name">ðŸ“– LEARN CONCEPT</span>
        </button>
        <button class="stage-nav-tab ${stage === 'experiment' ? 'active' : ''}" id="tab-stage-exp" onclick="window.dataScanner.setStage('experiment')">
          <span class="stage-num">STAGE 2</span>
          <span class="stage-name">ðŸ”¬ EXPERIMENT (HANDS-ON)</span>
        </button>
        <button class="stage-nav-tab ${stage === 'challenge' ? 'active' : ''}" id="tab-stage-chall" onclick="window.dataScanner.setStage('challenge')">
          <span class="stage-num">STAGE 3</span>
          <span class="stage-name">â­ CHALLENGE &amp; REWARD</span>
        </button>
      </div>

      <div id="stage-viewport" class="stage-view">
        <div style="text-align: center; padding: 30px; color: var(--glow-gold);">
          <p>INITIALIZING DATA SENSORS...</p>
        </div>
      </div>
    `;

    if (stage === 'learn') {
      this.renderLearnStage(lvl);
    } else if (stage === 'experiment') {
      this.renderExperimentStage(lvl);
    } else if (stage === 'challenge') {
      this.renderChallengeStage(lvl);
    }
  }

  // =========================================================================
  // STAGE 1: LEARN â€“ CONCEPT EXPLANATION & PEDAGOGY
  // =========================================================================
  renderLearnStage(lvl) {
    const container = document.getElementById('stage-viewport');
    if (!container) return;

    const learnData = this.getLearnContent(lvl);

    container.innerHTML = `
      <div class="learn-concept-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #5c381c; padding-bottom:8px;">
          <h3 style="margin:0;">
            <span style="color:var(--glow-gold); font-size:14px;">LEVEL ${lvl}:</span> ${learnData.title}
          </h3>
          <span class="concept-badge">${learnData.badge}</span>
        </div>

        <div style="font-size: 19px; line-height: 1.45; color: #f5ecdf; margin-bottom: 12px;">
          ${learnData.intro}
        </div>

        <div class="analogy-box">
          <strong style="color:var(--glow-gold); font-family:'Press Start 2P'; font-size:10px; display:block; margin-bottom:4px;">
            â›ï¸ REAL-WORLD MINING ANALOGY:
          </strong>
          ${learnData.analogy}
        </div>

        <div style="background:#1c0f08; border:1px solid #4a2c16; border-radius:4px; padding:12px; margin: 12px 0;">
          <strong style="color:var(--glow-gold); font-family:'Press Start 2P'; font-size:10px; display:block; margin-bottom:6px;">
            ðŸ” HOW IT WORKS IN DATA SCIENCE:
          </strong>
          <ul class="concept-key-takeaways">
            ${learnData.points.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>

        <div class="concept-highlight">
          <strong style="color:var(--glow-gold); font-family:'Press Start 2P'; font-size:10px; display:block; margin-bottom:4px;">
            âš¡ KEY TAKEAWAY FOR THIS CAVE:
          </strong>
          ${learnData.takeaway}
        </div>

        <div class="stage-nav-bar">
          <span style="color:#8a6840; font-size:14px;">Stage 1 of 3 &bull; No penalties in Learn &amp; Experiment modes</span>
          <button class="pixel-btn primary stage-nav-btn" onclick="window.dataScanner.setStage('experiment')">
            PROCEED TO EXPERIMENT (HANDS-ON) &gt;&gt;
          </button>
        </div>
      </div>
    `;
  }

  getLearnContent(lvl) {
    if (lvl === 1) {
      return {
        title: "DATA CLEANING & MISSING VALUES",
        badge: "PANDAS IMPUTATION",
        intro: "In real-world data science, datasets are rarely pristine. Sensors get damaged, radio signals drop, and miners skip logging columns. In Python, these gaps are stored as <strong>NaN (Not a Number)</strong>. Machine learning algorithms cannot run on missing values!",
        analogy: "Imagine an ancient treasure map with holes burned through three coordinates. If you throw away the whole map, you lose the treasure location forever! If you guess the missing coordinate smartly, you can safely navigate to the gold.",
        points: [
          "<strong>Row Dropping (df.dropna()):</strong> Deletes every sample with any missing cell. Fast and easy, but risks throwing away precious rare specimens!",
          "<strong>Mean Imputation (df.fillna(df.mean())):</strong> Fills missing values with the arithmetic average. Good for uniform data, but heavily skewed by extreme outliers.",
          "<strong>Median Imputation (df.fillna(df.median())):</strong> Fills missing values with the exact middle number (50th percentile). Highly robust against extreme price outliers!"
        ],
        takeaway: "In skewed mineral price distributions, extreme diamond values pull the arithmetic mean sky-high. Median imputation is far more reliable because it ignores extreme outliers!"
      };
    } else if (lvl === 2) {
      return {
        title: "EXPLORATORY DATA ANALYSIS (EDA) & CORRELATION",
        badge: "PEARSON CORRELATION (r)",
        intro: "Exploratory Data Analysis (EDA) is how data scientists investigate datasets before making decisions. The most powerful tool is the <strong>Pearson Correlation Coefficient (r)</strong>, which measures the linear association between two variables on a scale from <strong>-1.0 to +1.0</strong>.",
        analogy: "Think of your geological scanner radar. When you walk toward a radio beacon, the signal volume goes up as distance goes down (negative correlation). When you find thicker veins, the coin value goes up (positive correlation).",
        points: [
          "<strong>Positive Correlation (r &gt; 0):</strong> As variable X increases, variable Y increases (e.g. larger Crystal Size &rarr; higher Market Value).",
          "<strong>Negative Correlation (r &lt; 0):</strong> As variable X increases, variable Y decreases (e.g. higher Extraction Depth &rarr; harder access / lower profit).",
          "<strong>Zero / Weak Correlation (r &approx; 0):</strong> The two variables have no linear connection.",
          "<strong>GOLDEN DATA SCIENCE RULE:</strong> <em>Correlation does NOT imply causation!</em> Just because two numbers move together doesn't mean one causes the other."
        ],
        takeaway: "To unlock the secret chamber in this cave, examine the correlation radar and follow the physical property that has the strongest positive correlation (highest r) with Market Value!"
      };
    } else if (lvl === 3) {
      return {
        title: "UNSUPERVISED LEARNING & K-MEANS CLUSTERING",
        badge: "SCIKIT-LEARN K-MEANS",
        intro: "In <strong>Supervised Learning</strong>, data comes with answers (labels). In <strong>Unsupervised Learning</strong>, there are no labels! <strong>K-Means Clustering</strong> automatically discovers natural groups of similar items based on multi-dimensional geometric distance.",
        analogy: "You discover 135 glowing crystals scattered across a pitch-black cavern. Nobody told you what types they are. By grouping them into K piles based on hardness and luminosity, you can isolate the ultra-rare Mythic Star Crystals from ordinary geodes!",
        points: [
          "<strong>The Parameter K:</strong> The number of distinct clusters you instruct the algorithm to form.",
          "<strong>Centroids:</strong> The mathematical center point (&mu;) of each cluster.",
          "<strong>Euclidean Distance:</strong> The straight-line distance formula d = &radic;((x&minus;c&sub1;)&sup2; + (y&minus;c&sub2;)&sup2;) used to assign each crystal to its nearest centroid.",
          "<strong>Inertia (Within-Cluster Sum of Squares):</strong> Measures how tightly grouped the clusters are. Lower inertia means denser, better-fitted clusters."
        ],
        takeaway: "Feature scale matters! If one feature ranges from 1 to 1000 and another from 1 to 10, the large feature dominates distance calculations unless you standardise the data."
      };
    } else if (lvl === 4) {
      return {
        title: "STATISTICAL OUTLIER DETECTION (IQR METHOD)",
        badge: "IQR OUTLIER ANALYSIS",
        intro: "An <strong>outlier</strong> is an observation that deviates significantly from the overall pattern of a dataset. Detecting outliers is crucial because extreme values can heavily distort summary statistics (like the mean and variance) and degrade machine learning model accuracy.",
        analogy: "Imagine measuring student test scores where most students score between 60% and 85%. If a recording error enters a score of 950%, that number is an extreme outlier! The IQR method mathematically flags these abnormal values so data scientists can investigate them.",
        points: [
          "<strong>Q1 (First Quartile / 25th Percentile):</strong> 25% of all values fall below this point.",
          "<strong>Q3 (Third Quartile / 75th Percentile):</strong> 75% of all values fall below this point.",
          "<strong>IQR (Interquartile Range) = Q3 &minus; Q1:</strong> Measures the statistical dispersion of the middle 50% of the data.",
          "<strong>Lower Outlier Boundary = Q1 &minus; 1.5 &times; IQR:</strong> Any value falling below this cutoff is flagged as an outlier.",
          "<strong>Upper Outlier Boundary = Q3 + 1.5 &times; IQR:</strong> Any value exceeding this cutoff is flagged as an outlier."
        ],
        takeaway: "Outlier Boundary Rule: Lower = Q1 &minus; 1.5&times;IQR and Upper = Q3 + 1.5&times;IQR. Any value outside this range is a statistical outlier!"
      };
    } else {
      return {
        title: "SUPERVISED REGRESSION & MODEL EVALUATION",
        badge: "MAE, RMSE & RÂ² METRICS",
        intro: "In <strong>Supervised Regression</strong>, the machine learning model learns from historical training examples (features: purity, carats, depth, hardness) to predict a continuous numerical value: the true <strong>Vault Value in Gold Coins</strong>.",
        analogy: "The Mountain King's Diamond Vault has an ancient digital combination lock that requires the exact predicted valuation of the legendary Master Gem. The wrong prediction triggers the security lockdown!",
        points: [
          "<strong>80/20 Train/Test Split:</strong> Train models on 80% of data, but evaluate exclusively on 20% unseen test data to detect overfitting.",
          "<strong>Linear Regression:</strong> Fits a straight line (y = mx + b). Simple and interpretable, but cannot capture complex non-linear curves.",
          "<strong>Decision Tree Regressor:</strong> Splits data into hierarchical if/else branches. Highly flexible, but prone to <strong>overfitting</strong> (memorizing noise).",
          "<strong>Random Forest Regressor:</strong> An ensemble of 50 diverse decision trees voting together. Averages out individual tree errors to achieve superior generalization!",
          "<strong>RMSE (Root Mean Squared Error):</strong> Strongly penalizes large catastrophic errors. Lower RMSE = superior predictive reliability!"
        ],
        takeaway: "Always select the model with the lowest test RMSE and highest RÂ² score to crack the final vault combination!"
      };
    }
  }

  // =========================================================================
  // STAGE 2: EXPERIMENT â€“ HANDS-ON WORKBENCH WITH REAL COMPUTATIONS
  // =========================================================================
  renderExperimentStage(lvl) {
    const container = document.getElementById('stage-viewport');
    if (!container) return;

    if (lvl === 1) this.loadExperimentLevel1();
    else if (lvl === 2) this.loadExperimentLevel2();
    else if (lvl === 3) this.loadExperimentLevel3();
    else if (lvl === 4) this.loadExperimentLevel4();
    else if (lvl === 5) this.loadExperimentLevel5();
  }

  // --- LEVEL 1 WORKBENCH: DATA CLEANING & IMPUTATION ---
  async loadExperimentLevel1(strategy = null) {
    const container = document.getElementById('stage-viewport');
    if (!container) return;

    const chosenStrategy = strategy || this.experimentState[1].strategy || 'median';
    this.experimentState[1].strategy = chosenStrategy;

    container.innerHTML = `
      <div style="text-align:center; padding:30px; color:var(--glow-gold); font-family:'VT323'; font-size:20px;">
        EXECUTING PANDAS IMPUTATION ENGINE (${chosenStrategy.toUpperCase()})...
      </div>
    `;

    try {
      // 1. Fetch raw data preview
      const rawRes = await fetch('/api/level1/raw');
      const rawJson = await rawRes.json();
      const rawData = rawJson.data;

      // 2. Fetch cleaned data under chosen strategy
      const cleanRes = await fetch('/api/level1/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: chosenStrategy })
      });
      const cleanJson = await cleanRes.json();
      const cleanResult = cleanJson.result;

      let tableHtml = `
        <table class="retro-table">
          <thead>
            <tr>
              <th>ID</th><th>Mineral</th><th>Weight (ct)</th><th>Hardness</th><th>Value (Coins)</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Show cleaned preview rows
      (cleanResult.restored_samples && cleanResult.restored_samples.length > 0 ? cleanResult.restored_samples : rawData.preview.slice(0, 5)).forEach(row => {
        tableHtml += `
          <tr>
            <td>${row.Sample_ID}</td>
            <td style="font-weight:bold; color:var(--glow-gold);">${row.Mineral}</td>
            <td class="imputed-val">${row.Weight_Carats}</td>
            <td class="imputed-val">${row.Hardness_Mohs}</td>
            <td class="imputed-val">${row.Estimated_Value_Coins}</td>
          </tr>
        `;
      });
      tableHtml += `</tbody></table>`;

      let bannerClass = chosenStrategy === 'median' ? 'success' : (chosenStrategy === 'mean' ? 'warning' : 'danger');

      container.innerHTML = `
        <div class="scanner-card">
          <h4>STAGE 2: HANDS-ON IMPUTATION WORKBENCH (PANDAS PIPELINE)</h4>
          <div style="font-family:'VT323'; font-size:18px; color:#e8d8c4; line-height:1.4;">
            Select an imputation strategy below. Observe how Pandas dynamically recalculates missing cells, descriptive statistics, and sample retention!
          </div>

          <div class="interactive-toolbar">
            <span class="toolbar-label">STRATEGY:</span>
            <button class="tool-chip-btn ${chosenStrategy === 'median' ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel1('median')">
              â˜… MEDIAN IMPUTATION (ROBUST)
            </button>
            <button class="tool-chip-btn ${chosenStrategy === 'mean' ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel1('mean')">
              MEAN IMPUTATION (SKEWED)
            </button>
            <button class="tool-chip-btn ${chosenStrategy === 'drop' ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel1('drop')">
              DROP ROWS (DATA LOSS)
            </button>
          </div>

          <div class="challenge-grid" style="margin-top:6px;">
            <div>
              <div style="font-size:10px; color:var(--glow-gold); font-family:'Press Start 2P'; margin-bottom:4px;">RECOVERED DATA PREVIEW:</div>
              <div class="data-table-container">
                ${tableHtml}
              </div>
            </div>

            <div>
              <div style="font-size:10px; color:var(--glow-gold); font-family:'Press Start 2P'; margin-bottom:4px;">STATISTICAL IMPACT:</div>
              <div style="background:#1c0f08; border:1px solid #4a2c16; border-radius:4px; padding:10px; font-family:'VT323'; font-size:18px; line-height:1.5;">
                <p>&bull; Missing Gaps Before: <strong style="color:var(--glow-red);">${cleanResult.missing_before} cells</strong> (${rawData.missing_percentage}%)</p>
                <p>&bull; Missing Gaps After: <strong style="color:var(--glow-green);">${cleanResult.missing_after} cells</strong></p>
                <p>&bull; Samples Preserved: <strong style="color:#fff;">${cleanResult.rows_remaining} / ${rawData.total_rows}</strong> ${cleanResult.rows_dropped ? `(<span style="color:var(--glow-red); font-weight:bold;">${cleanResult.rows_dropped} DROPPED!</span>)` : '(<span style="color:var(--glow-green);">100% Retained</span>)'}</p>
                ${chosenStrategy !== 'drop' ? `
                  <p>&bull; Imputed Weight: <strong style="color:var(--glow-cyan);">${cleanResult.imputed_values.Weight_Carats} ct</strong> | Hardness: <strong style="color:var(--glow-cyan);">${cleanResult.imputed_values.Hardness_Mohs} Mohs</strong></p>
                  <p>&bull; Imputed Value: <strong style="color:var(--glow-gold);">${cleanResult.imputed_values.Estimated_Value_Coins} Coins</strong></p>
                ` : ''}
              </div>
            </div>
          </div>

          <div class="consequence-banner ${bannerClass}">
            <strong style="font-family:'Press Start 2P'; font-size:9px; display:block; margin-bottom:4px;">
              ${chosenStrategy === 'median' ? 'â˜… STATISTICAL OUTCOME: OPTIMAL RECOVERY' : (chosenStrategy === 'mean' ? 'âš ï¸ STATISTICAL OUTCOME: MEAN SKEW DISTORTION' : 'âŒ STATISTICAL OUTCOME: SEVERE DATA LOSS')}
            </strong>
            ${cleanResult.explanation}
          </div>

          <div class="stage-nav-bar">
            <button class="pixel-btn stage-nav-btn" onclick="window.dataScanner.setStage('learn')">
              &lt;&lt; BACK TO LEARN
            </button>
            <span style="color:#8a6840; font-size:13px; font-family:'VT323';">Experimentation is free &bull; No penalties apply</span>
            <button class="pixel-btn primary stage-nav-btn" onclick="window.dataScanner.setStage('challenge')">
              PROCEED TO STAGE 3: CHALLENGE &gt;&gt;
            </button>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div style="color:red; padding:20px;">Error running imputation engine: ${e.message}</div>`;
    }
  }

  // --- LEVEL 2 WORKBENCH: EDA & FEATURE CORRELATION ---
  async loadExperimentLevel2(feature = null) {
    const container = document.getElementById('stage-viewport');
    if (!container) return;

    const chosenFeature = feature || this.experimentState[2].feature || 'Crystal_Size_mm';
    this.experimentState[2].feature = chosenFeature;

    container.innerHTML = `
      <div style="text-align:center; padding:30px; color:var(--glow-gold); font-family:'VT323'; font-size:20px;">
        COMPUTING PEARSON CORRELATION MATRIX &amp; SCATTER PLOT (${chosenFeature})...
      </div>
    `;

    try {
      const res = await fetch(`/api/level2/eda?feature=${chosenFeature}`);
      const json = await res.json();
      const data = json.data;

      const corrs = data.correlations_with_value;
      const rVal = data.active_corr_value;
      const isStrongest = (chosenFeature === data.strongest_feature);

      container.innerHTML = `
        <div class="scanner-card">
          <h4>STAGE 2: INTERACTIVE EDA CORRELATION RADAR</h4>
          <div style="font-family:'VT323'; font-size:18px; color:#e8d8c4; line-height:1.4;">
            Select different geological features below to observe the live Pearson correlation coefficient (r) and the Matplotlib ordinary least squares (OLS) trendline!
          </div>

          <div class="interactive-toolbar">
            <span class="toolbar-label">SELECT FEATURE:</span>
            <button class="tool-chip-btn ${chosenFeature === 'Crystal_Size_mm' ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel2('Crystal_Size_mm')">
              CRYSTAL SIZE (mm)
            </button>
            <button class="tool-chip-btn ${chosenFeature === 'Hardness_Mohs' ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel2('Hardness_Mohs')">
              HARDNESS (Mohs)
            </button>
            <button class="tool-chip-btn ${chosenFeature === 'Weight_Carats' ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel2('Weight_Carats')">
              WEIGHT (Carats)
            </button>
            <button class="tool-chip-btn ${chosenFeature === 'Extraction_Depth_m' ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel2('Extraction_Depth_m')">
              EXTRACTION DEPTH (m)
            </button>
          </div>

          <div class="challenge-grid">
            <div class="plot-container">
              <img src="data:image/png;base64,${data.chart_image_base64}" alt="Correlation Plot">
            </div>

            <div style="display:flex; flex-direction:column; justify-content:center;">
              <div style="background:#1c0f08; border:1px solid #4a2c16; border-radius:4px; padding:12px; font-family:'VT323'; font-size:19px; line-height:1.5;">
                <div style="font-family:'Press Start 2P'; font-size:10px; color:var(--glow-gold); margin-bottom:6px;">LIVE CORRELATION METRICS:</div>
                <p>&bull; Active Feature: <strong style="color:#fff;">${chosenFeature.replace('_', ' ')}</strong></p>
                <p>&bull; Pearson Coefficient: <strong style="font-size:22px; color:${rVal > 0.6 ? 'var(--glow-green)' : (rVal > 0 ? '#facc15' : 'var(--glow-red)')};">r = ${rVal > 0 ? '+' : ''}${rVal.toFixed(2)}</strong></p>
                <p>&bull; Relationship Type: <strong style="color:#d4973b;">${data.relationship_type}</strong></p>
                <p>&bull; Strongest Geological Predictor: <strong style="color:var(--glow-green);">${data.strongest_feature.replace('_', ' ')} (r = +${data.strongest_corr_value})</strong></p>
              </div>

              <div class="consequence-banner ${isStrongest ? 'success' : 'warning'}" style="margin-top:10px;">
                <strong style="font-family:'Press Start 2P'; font-size:9px; display:block; margin-bottom:4px;">
                  ${isStrongest ? 'â˜… OPTIMAL VEIN DETECTED' : 'âš ï¸ WEAKER VEIN PROPERTY'}
                </strong>
                ${data.relationship_description}
                <div style="font-size:15px; color:#cca888; margin-top:4px;">* Reminder: Observational correlation does not prove causation!</div>
              </div>
            </div>
          </div>

          <div class="stage-nav-bar">
            <button class="pixel-btn stage-nav-btn" onclick="window.dataScanner.setStage('learn')">
              &lt;&lt; BACK TO LEARN
            </button>
            <span style="color:#8a6840; font-size:13px; font-family:'VT323';">Experimentation is free &bull; No penalties apply</span>
            <button class="pixel-btn primary stage-nav-btn" onclick="window.dataScanner.setStage('challenge')">
              PROCEED TO STAGE 3: CHALLENGE &gt;&gt;
            </button>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div style="color:red; padding:20px;">Error running EDA engine: ${e.message}</div>`;
    }
  }

  // --- LEVEL 3 WORKBENCH: K-MEANS CLUSTERING ---
  async loadExperimentLevel3(k = null) {
    const container = document.getElementById('stage-viewport');
    if (!container) return;

    const chosenK = k !== null ? k : (this.experimentState[3].k || 3);
    this.experimentState[3].k = chosenK;

    container.innerHTML = `
      <div style="text-align:center; padding:30px; color:var(--glow-gold); font-family:'VT323'; font-size:20px;">
        RUNNING SCIKIT-LEARN K-MEANS ALGORITHM (K=${chosenK})...
      </div>
    `;

    try {
      const res = await fetch(`/api/level3/cluster?k=${chosenK}`);
      const json = await res.json();
      const data = json.data;

      let clusterCardsHtml = '';
      data.cluster_summaries.forEach(c => {
        const isRare = (c.cluster_id === data.rare_cluster_id);
        clusterCardsHtml += `
          <div style="background:${isRare ? 'rgba(212, 151, 59, 0.2)' : '#24140b'}; border:1px solid ${isRare ? 'var(--glow-gold)' : '#4d2d17'}; padding:6px 10px; border-radius:4px; margin-bottom:5px;">
            <div style="color:${isRare ? 'var(--glow-gold)' : '#cca888'}; font-weight:bold; font-size:12px;">
              CLUSTER ${c.cluster_id} (${c.count} crystals) ${isRare ? 'â˜… MYTHIC STAR CRYSTALS â˜…' : ''}
            </div>
            <div style="font-size:15px; color:#e8d8c4; margin-top:2px;">
              Luminosity: <strong style="color:#fff;">${c.mean_luminosity} lm</strong> | Hardness: <strong style="color:#fff;">${c.mean_hardness} Mohs</strong> | Density: ${c.mean_density}
            </div>
          </div>
        `;
      });

      container.innerHTML = `
        <div class="scanner-card">
          <h4>STAGE 2: SCIKIT-LEARN K-MEANS CLUSTERING STUDIO</h4>
          <div style="font-family:'VT323'; font-size:18px; color:#e8d8c4; line-height:1.4;">
            Modify parameter <strong>K</strong> below to execute Scikit-learn's iterative centroid relocation and observe how crystals are partitioned in feature space!
          </div>

          <div class="interactive-toolbar">
            <span class="toolbar-label">CLUSTERS (K):</span>
            <button class="tool-chip-btn ${chosenK === 2 ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel3(2)">K = 2</button>
            <button class="tool-chip-btn ${chosenK === 3 ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel3(3)">K = 3 (NATURAL)</button>
            <button class="tool-chip-btn ${chosenK === 4 ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel3(4)">K = 4</button>
            <button class="tool-chip-btn ${chosenK === 5 ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel3(5)">K = 5</button>
          </div>

          <div class="challenge-grid">
            <div>
              <div class="plot-container">
                <img src="data:image/png;base64,${data.chart_image_base64}" alt="K-Means Cluster Scatter">
              </div>
              <div style="font-size:12px; color:#cca888; text-align:center; font-family:'VT323'; margin-top:4px;">
                Within-Cluster Sum of Squares (Inertia): <strong style="color:var(--glow-gold); font-size:16px;">${data.inertia}</strong>
              </div>
            </div>

            <div>
              <div style="font-size:10px; color:var(--glow-gold); font-family:'Press Start 2P'; margin-bottom:4px;">CLUSTER CENTROIDS &amp; PROPERTIES:</div>
              <div style="max-height:180px; overflow-y:auto; font-family:'VT323';">
                ${clusterCardsHtml}
              </div>

              <div class="consequence-banner ${chosenK === 3 ? 'success' : 'warning'}" style="margin-top:8px;">
                <strong style="font-family:'Press Start 2P'; font-size:9px; display:block; margin-bottom:4px;">
                  ${chosenK === 3 ? 'â˜… OPTIMAL CLUSTER NUMBER (K=3)' : 'âš ï¸ SUB-OPTIMAL PARTITIONING'}
                </strong>
                ${chosenK === 3 ? 'K=3 cleanly segments the crystals into Common Geodes, Prismatic Beryls, and the ultra-rare Mythic Star Crystals!' : (chosenK < 3 ? 'K=2 under-clusters, merging distinct mineral families into a single noisy group.' : 'K>3 over-fragments the natural clusters, creating redundant splits.')}
              </div>
            </div>
          </div>

          <div class="stage-nav-bar">
            <button class="pixel-btn stage-nav-btn" onclick="window.dataScanner.setStage('learn')">
              &lt;&lt; BACK TO LEARN
            </button>
            <span style="color:#8a6840; font-size:13px; font-family:'VT323';">Experimentation is free &bull; No penalties apply</span>
            <button class="pixel-btn primary stage-nav-btn" onclick="window.dataScanner.setStage('challenge')">
              PROCEED TO STAGE 3: CHALLENGE &gt;&gt;
            </button>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div style="color:red; padding:20px;">Error running clustering studio: ${e.message}</div>`;
    }
  }

  // --- LEVEL 4 WORKBENCH: IQR OUTLIER DETECTION ---
  async loadExperimentLevel4(multiplier = null) {
    const container = document.getElementById('stage-viewport');
    if (!container) return;

    const chosenMult = multiplier !== null ? multiplier : (this.experimentState[4].multiplier || 1.5);
    this.experimentState[4].multiplier = chosenMult;

    container.innerHTML = `
      <div style="text-align:center; padding:30px; color:var(--glow-gold); font-family:'VT323'; font-size:20px;">
        RECALCULATING IQR BOUNDARIES &amp; OUTLIERS (MULTIPLIER = ${chosenMult}x)...
      </div>
    `;

    try {
      const res = await fetch(`/api/level4/outliers?multiplier=${chosenMult}`);
      const json = await res.json();
      const data = json.data;

      const vibeStats = data.iqr_stats.vibration;
      const count = data.outlier_count;

      container.innerHTML = `
        <div class="scanner-card">
          <h4>STAGE 2: INTERACTIVE IQR OUTLIER DETECTION LAB</h4>
          <div style="font-family:'VT323'; font-size:18px; color:#e8d8c4; line-height:1.4;">
            Tune the IQR multiplier below. Watch the upper and lower outlier boundaries adjust dynamically and observe how many data samples are flagged!
          </div>

          <div class="interactive-toolbar">
            <span class="toolbar-label">IQR MULTIPLIER:</span>
            <button class="tool-chip-btn ${chosenMult === 1.0 ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel4(1.0)">1.0x (AGGRESSIVE)</button>
            <button class="tool-chip-btn ${chosenMult === 1.5 ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel4(1.5)">1.5x (STANDARD)</button>
            <button class="tool-chip-btn ${chosenMult === 2.0 ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel4(2.0)">2.0x (CONSERVATIVE)</button>
            <button class="tool-chip-btn ${chosenMult === 2.5 ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel4(2.5)">2.5x (EXTREME)</button>
          </div>

          <div class="challenge-grid">
            <div class="plot-container">
              <img src="data:image/png;base64,${data.chart_image_base64}" alt="IQR Box Plot">
            </div>

            <div style="display:flex; flex-direction:column; justify-content:center;">
              <div style="background:#1c0f08; border:1px solid #4a2c16; border-radius:4px; padding:12px; font-family:'VT323'; font-size:19px; line-height:1.5;">
                <div style="font-family:'Press Start 2P'; font-size:10px; color:var(--glow-gold); margin-bottom:6px;">IQR STATISTICAL THRESHOLDS:</div>
                <p>&bull; Q1 (25th percentile): <strong style="color:#fff;">${vibeStats.q1}</strong></p>
                <p>&bull; Q3 (75th percentile): <strong style="color:#fff;">${vibeStats.q3}</strong></p>
                <p>&bull; Spread (IQR = Q3 - Q1): <strong style="color:var(--glow-gold);">${vibeStats.iqr}</strong></p>
                <p>&bull; Upper Boundary (Q3 + ${chosenMult}&times;IQR): <strong style="color:var(--glow-red); font-size:22px;">&gt; ${vibeStats.upper_bound}</strong></p>
                <p>&bull; Flagged Outliers: <strong style="color:var(--glow-gold); font-size:20px;">${count} samples</strong></p>
              </div>

              <div class="consequence-banner ${chosenMult === 1.5 ? 'success' : 'warning'}" style="margin-top:8px;">
                <strong style="font-family:'Press Start 2P'; font-size:9px; display:block; margin-bottom:4px;">
                  ${chosenMult === 1.5 ? 'â˜… BALANCED DETECTION SENSITIVITY' : (chosenMult < 1.5 ? 'âš ï¸ HIGH FALSE ALARM RATE' : 'âš ï¸ MISSED HAZARD RISK')}
                </strong>
                ${chosenMult === 1.5 ? 'Standard 1.5x IQR accurately isolates extreme values while preserving normal data distribution!' : (chosenMult < 1.5 ? 'Setting multiplier to 1.0x is overly aggressive, falsely classifying normal data points as outliers.' : 'Setting multiplier above 2.0x is too conservative, allowing extreme outliers to go undetected!')}
              </div>
            </div>
          </div>

          <div class="stage-nav-bar">
            <button class="pixel-btn stage-nav-btn" onclick="window.dataScanner.setStage('learn')">
              &lt;&lt; BACK TO LEARN
            </button>
            <span style="color:#8a6840; font-size:13px; font-family:'VT323';">Experimentation is free &bull; No penalties apply</span>
            <button class="pixel-btn primary stage-nav-btn" onclick="window.dataScanner.setStage('challenge')">
              PROCEED TO STAGE 3: CHALLENGE &gt;&gt;
            </button>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div style="color:red; padding:20px;">Error running outlier lab: ${e.message}</div>`;
    }
  }

  // --- LEVEL 5 WORKBENCH: REGRESSION & MODEL EVALUATION ---
  async loadExperimentLevel5(modelType = null) {
    const container = document.getElementById('stage-viewport');
    if (!container) return;

    const chosenModel = modelType || this.experimentState[5].modelType || 'random_forest';
    this.experimentState[5].modelType = chosenModel;

    container.innerHTML = `
      <div style="text-align:center; padding:30px; color:var(--glow-gold); font-family:'VT323'; font-size:20px;">
        TRAINING &amp; EVALUATING REGRESSION MODELS ON 80/20 SPLIT (${chosenModel.toUpperCase()})...
      </div>
    `;

    try {
      // 1. Fetch side-by-side leaderboard comparison
      const compRes = await fetch('/api/level5/compare');
      const compJson = await compRes.json();
      const compData = compJson.data;

      // 2. Train and inspect selected model
      const trainRes = await fetch('/api/level5/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_type: chosenModel })
      });
      const trainJson = await trainRes.json();
      const trainResult = trainJson.result;

      let leaderboardHtml = `
        <table class="retro-table">
          <thead>
            <tr>
              <th>Model</th><th>MAE</th><th>RMSE</th><th>RÂ² Score</th>
            </tr>
          </thead>
          <tbody>
      `;

      compData.leaderboard.forEach(m => {
        const isBest = (m.model_type === compData.best_model);
        const isSelected = (m.model_type === chosenModel);
        leaderboardHtml += `
          <tr style="${isSelected ? 'background:rgba(0,240,255,0.15); border:1px solid var(--glow-cyan);' : (isBest ? 'background:rgba(57,255,20,0.08);' : '')}">
            <td style="font-weight:bold; ${isBest ? 'color:var(--glow-green);' : ''}">${m.model_name} ${isBest ? 'â˜…' : ''}</td>
            <td>${m.mae}</td>
            <td style="${isBest ? 'color:var(--glow-green); font-weight:bold;' : ''}">${m.rmse}</td>
            <td>${m.r2_score}</td>
          </tr>
        `;
      });
      leaderboardHtml += `</tbody></table>`;

      container.innerHTML = `
        <div class="scanner-card">
          <h4>STAGE 2: SUPERVISED REGRESSION ARENA (TEST SET EVALUATION)</h4>
          <div style="font-family:'VT323'; font-size:18px; color:#e8d8c4; line-height:1.4;">
            Train and inspect the three machine learning regressors on unseen test data (20% holdout). Compare their Mean Absolute Error, Root Mean Squared Error, and RÂ² scores!
          </div>

          <div class="interactive-toolbar">
            <span class="toolbar-label">SELECT MODEL:</span>
            <button class="tool-chip-btn ${chosenModel === 'random_forest' ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel5('random_forest')">
              â˜… RANDOM FOREST (ENSEMBLE)
            </button>
            <button class="tool-chip-btn ${chosenModel === 'decision_tree' ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel5('decision_tree')">
              DECISION TREE (SINGLE)
            </button>
            <button class="tool-chip-btn ${chosenModel === 'linear' ? 'active' : ''}" onclick="window.dataScanner.loadExperimentLevel5('linear')">
              LINEAR REGRESSION (OLS)
            </button>
          </div>

          <div class="challenge-grid">
            <div>
              <div style="font-size:10px; color:var(--glow-gold); font-family:'Press Start 2P'; margin-bottom:4px;">MODEL TEST LEADERBOARD:</div>
              <div class="data-table-container">
                ${leaderboardHtml}
              </div>

              <div class="consequence-banner ${chosenModel === compData.best_model ? 'success' : 'warning'}" style="margin-top:8px;">
                <strong style="font-family:'Press Start 2P'; font-size:9px; display:block; margin-bottom:4px;">
                  ${chosenModel === compData.best_model ? 'â˜… CHAMPION GENERALIZATION MODEL' : 'âš ï¸ HIGHER PREDICTION ERROR'}
                </strong>
                ${chosenModel === 'random_forest' ? 'Random Forest averages 50 decision trees, slashing variance and achieving the lowest RMSE on unseen test samples!' : (chosenModel === 'decision_tree' ? 'A single unpruned Decision Tree suffers from high variance (overfitting), memorizing training noise.' : 'Linear Regression is too rigid to capture non-linear mineral interaction terms.')}
              </div>
            </div>

            <div>
              <div style="font-size:10px; color:var(--glow-gold); font-family:'Press Start 2P'; margin-bottom:4px;">ACTUAL VS PREDICTED (TEST SAMPLES):</div>
              <div class="plot-container">
                <img src="data:image/png;base64,${trainResult.chart_image_base64}" alt="Regression Plot">
              </div>
              <div style="text-align:center; font-family:'VT323'; font-size:18px; color:var(--glow-gold); margin-top:4px;">
                Vault Gem Valuation Prediction: <strong style="font-size:22px;">${trainResult.vault_gem_prediction} Gold</strong>
              </div>
            </div>
          </div>

          <div class="stage-nav-bar">
            <button class="pixel-btn stage-nav-btn" onclick="window.dataScanner.setStage('learn')">
              &lt;&lt; BACK TO LEARN
            </button>
            <span style="color:#8a6840; font-size:13px; font-family:'VT323';">Experimentation is free &bull; No penalties apply</span>
            <button class="pixel-btn primary stage-nav-btn" onclick="window.dataScanner.setStage('challenge')">
              PROCEED TO STAGE 3: CHALLENGE &gt;&gt;
            </button>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div style="color:red; padding:20px;">Error running regression arena: ${e.message}</div>`;
    }
  }

  // =========================================================================
  // STAGE 3: CHALLENGE â€“ TEST UNDERSTANDING & MEANINGFUL CONSEQUENCES
  // =========================================================================
  renderChallengeStage(lvl) {
    const container = document.getElementById('stage-viewport');
    if (!container) return;

    if (!this.game || !this.game.getActiveSetQuestion) {
      container.innerHTML = '<div style="color:red;">Error: Question system not initialized.</div>';
      return;
    }
    const q = this.game.getActiveSetQuestion(lvl);
    if (!q) {
      container.innerHTML = '<div style="color:red;">Error: No question found for this level.</div>';
      return;
    }

    let inputHtml = '';
    if (q.type === 'mcq') {
      let opts = '';
      for (const [key, text] of Object.entries(q.options || {})) {
        opts += `
          <button class="pixel-btn term-opt-btn" data-opt="${key}">
            <strong style="color:var(--glow-gold); font-size:12px; margin-right:6px;">${key})</strong> ${text}
          </button>
        `;
      }
      inputHtml = `<div class="question-options-container" id="q-options-container-${lvl}">${opts}</div>`;
    } else {
      const placeholder = q.input_placeholder || (q.type === 'numerical' ? 'Enter numerical value' : (q.type === 'multi_part' ? 'Format: 18, 28, 10, Yes' : 'Enter answer'));
      inputHtml = `
        <div style="margin-top: 10px;">
          <input type="text" id="q-text-input-${lvl}" class="pixel-input" placeholder="${placeholder}" autocomplete="off" style="margin-bottom: 12px; font-size: 20px; width: 100%;">
          <button class="pixel-btn primary" id="q-submit-btn-${lvl}" style="width: 100%; padding: 12px; font-size: 11px;">SUBMIT ANALYSIS</button>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="scanner-card challenge-question-card" style="border: 2px solid #8c5a2b; background: #24150d; box-shadow: 0 0 16px rgba(212,151,59,0.22); padding: 16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="background:#3d2414; color:#f5c660; border: 1px solid #8c5a2b; font-size:10px; padding:3px 8px; border-radius:3px; font-weight:bold;">
            LEVEL ${lvl} CHALLENGE
          </span>
          <span style="background:#2a180e; color:#cca888; border: 1px solid #5a361a; font-size:9px; padding:2px 7px; border-radius:3px; font-weight:bold;">
            ${(q.type || 'MCQ').toUpperCase().replace('_', ' ')}
          </span>
        </div>

        <div style="font-size:11px; color:var(--glow-gold); font-weight:bold; margin-bottom:6px;">
          TOPIC: ${q.topic.toUpperCase()}
        </div>

        <div style="font-family:'VT323'; font-size:19px; color:#f8efe6; line-height:1.45; margin-bottom:12px; background:#1b0f08; padding:12px; border-radius:4px; border: 1px solid #4a2c16; border-left:4px solid #d4973b; white-space:pre-line;">
          ${q.question}
        </div>

        ${inputHtml}

        <div id="q-feedback-box-${lvl}" style="display:none; margin-top:10px; font-family:'VT323'; font-size:18px; line-height:1.45; padding:10px; border-radius:4px;"></div>

        <div class="stage-nav-bar" style="margin-top:14px;">
          <button class="pixel-btn stage-nav-btn" onclick="window.dataScanner.setStage('experiment')">
            &lt;&lt; BACK TO EXPERIMENT WORKBENCH
          </button>
          <span style="color:#cca888; font-size:13px; font-family:'VT323';">
            Rewards: <strong style="color:var(--glow-gold);">+50 Gold, +100 XP</strong> &bull; Error: <strong style="color:var(--glow-red);">-20 Gold</strong>
          </span>
        </div>
      </div>
    `;

    this.bindQuestionCard(lvl);
  }

  bindQuestionCard(level) {
    if (!this.game || !this.game.getActiveSetQuestion) return;
    const q = this.game.getActiveSetQuestion(level);
    if (!q) return;

    const feedbackBox = document.getElementById(`q-feedback-box-${level}`);
    if (!feedbackBox) return;

    const handleSubmit = async (userAnswer) => {
      const trimmedAnswer = String(userAnswer || '').trim();
      if (!trimmedAnswer) {
        feedbackBox.style.display = 'block';
        feedbackBox.style.background = 'rgba(255, 51, 68, 0.15)';
        feedbackBox.style.border = '2px solid var(--glow-red)';
        feedbackBox.style.color = '#fca5a5';
        feedbackBox.innerHTML = '<div style="color:var(--glow-red); font-weight:bold;">Please enter or select an answer before submitting.</div>';
        return;
      }

      // Prevent accidental duplicate submission of the exact same wrong answer
      if (this.lastSubmitted[level] === trimmedAnswer && this.wrongAttempts[level] > 0) {
        feedbackBox.style.display = 'block';
        feedbackBox.style.background = 'rgba(245, 158, 11, 0.15)';
        feedbackBox.style.border = '2px solid var(--glow-gold)';
        feedbackBox.style.color = '#fef08a';
        feedbackBox.innerHTML = `<div>You just submitted "${trimmedAnswer}". Review the question and your calculations, then try a different answer!</div>`;
        return;
      }

      this.lastSubmitted[level] = trimmedAnswer;
      this.setQuestionInputsDisabled(level, true);
      feedbackBox.style.display = 'block';
      feedbackBox.style.background = 'rgba(212, 151, 59, 0.18)';
      feedbackBox.style.border = '1.5px solid var(--glow-gold)';
      feedbackBox.style.color = '#fef08a';
      feedbackBox.innerHTML = 'ANALYZING SUBMISSION WITH PYTHON FLASK ENGINE...';

      try {
        const res = await fetch('/api/questions/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            set_id: this.game.activeQuestionSetId || 1,
            question_id: q.id,
            chosen_option: trimmedAnswer
          })
        });
        const json = await res.json();
        this.handleVerificationResult(level, q, json, trimmedAnswer);
      } catch (e) {
        // Fallback local verification using JS dynamic solver
        const localResult = this.localVerify(q, trimmedAnswer);
        this.handleVerificationResult(level, q, localResult, trimmedAnswer);
      }
    };

    if (q.type === 'mcq') {
      const container = document.getElementById(`q-options-container-${level}`);
      if (container) {
        container.querySelectorAll('.term-opt-btn').forEach(btn => {
          btn.onclick = () => handleSubmit(btn.dataset.opt);
        });
      }
    } else {
      const input = document.getElementById(`q-text-input-${level}`);
      const submitBtn = document.getElementById(`q-submit-btn-${level}`);
      if (submitBtn && input) {
        submitBtn.onclick = () => handleSubmit(input.value);
        input.onkeydown = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(input.value);
          }
        };
        setTimeout(() => input.focus(), 120);
      }
    }
  }

  setQuestionInputsDisabled(level, disabled) {
    const container = document.getElementById(`q-options-container-${level}`);
    if (container) {
      container.querySelectorAll('.term-opt-btn').forEach(btn => btn.disabled = disabled);
    }
    const input = document.getElementById(`q-text-input-${level}`);
    if (input) input.disabled = disabled;
    const submitBtn = document.getElementById(`q-submit-btn-${level}`);
    if (submitBtn) submitBtn.disabled = disabled;
  }

  handleVerificationResult(level, question, result, answer) {
    const feedbackBox = document.getElementById(`q-feedback-box-${level}`);
    if (!feedbackBox) return;

    if (result.is_correct) {
      // Reset wrong attempt counter
      this.wrongAttempts[level] = 0;
      this.lastSubmitted[level] = '';

      window.soundEngine.playVictory();
      feedbackBox.style.display = 'block';
      feedbackBox.style.background = 'rgba(57, 255, 20, 0.15)';
      feedbackBox.style.border = '2px solid var(--glow-green)';
      feedbackBox.style.color = '#e2e8f0';

      const continueBtnText = (level === 5)
        ? 'â˜… UNLOCK FINAL DIAMOND VAULT &gt;&gt;'
        : 'PROCEED TO CHEST &amp; GATEWAY &gt;&gt;';

      feedbackBox.innerHTML = `
        <div style="color:var(--glow-green); font-weight:bold; font-size:19px; margin-bottom:6px;">
          â˜… ANALYSIS VERIFIED! (+50 Gold &bull; +100 XP) â˜…
        </div>
        <p style="margin-bottom:8px;">${result.explanation || question.explanation || 'Calculations verified by sensor engine.'}</p>
        <div style="margin-top:10px;">
          <button class="pixel-btn primary" id="btn-q-proceed" style="width:100%; padding:10px; font-size:11px;">
            ${continueBtnText}
          </button>
        </div>
      `;

      // Reward points, XP, and mark objective complete
      if (this.game.rewardChallengeSuccess) {
        this.game.rewardChallengeSuccess();
      } else {
        this.game.coins += 50;
        this.game.xp += 100;
        this.game.updateHUD();
      }
      this.game.completeLevelObjective(level);

      const proceedBtn = document.getElementById('btn-q-proceed');
      if (proceedBtn) {
        proceedBtn.onclick = () => {
          this.close();
          if (level === 5) {
            this.game.showToast('FINAL VAULT CRACKED! OPEN THE GOLDEN VAULT CHEST!');
          }
        };
      }
    } else {
      // Incremental penalty handling
      this.wrongAttempts[level] = (this.wrongAttempts[level] || 0) + 1;
      const isRepeated = this.wrongAttempts[level] >= 2;

      window.soundEngine.playError();
      feedbackBox.style.display = 'block';
      feedbackBox.style.background = 'rgba(255, 51, 68, 0.15)';
      feedbackBox.style.border = '2px solid var(--glow-red)';
      feedbackBox.style.color = '#fca5a5';

      // Deduct consequences via Game controller
      let penaltyInfo = { goldDeducted: 20, energyDeducted: 0, livesDeducted: 0 };
      if (this.game.penalizeChallengeError) {
        penaltyInfo = this.game.penalizeChallengeError(isRepeated);
      } else {
        const goldLost = Math.min(20, this.game.coins);
        this.game.coins -= goldLost;
        if (isRepeated) this.game.penalizeEnergy(15);
        this.game.updateHUD();
        penaltyInfo.goldDeducted = goldLost;
      }

      feedbackBox.innerHTML = `
        <div style="color:var(--glow-red); font-weight:bold; font-size:18px; margin-bottom:6px;">
          âŒ INCORRECT ANALYSIS [-${penaltyInfo.goldDeducted} Gold${isRepeated ? ` | -${penaltyInfo.energyDeducted}% Energy` : ''}]
        </div>
        <p style="margin-bottom:8px;">${result.feedback || 'Incorrect calculation. Review your formulas and try again.'}</p>
        <div style="font-size:14px; color:#e8d8c4; margin-top:4px;">
          ${isRepeated ? '<span style="color:#facc15;">Repeated errors drain scanner battery charge! You can return to Stage 2 to review the live data before retrying.</span>' : 'Learn from this mistake and test another answer!'}
        </div>
      `;

      // Re-enable inputs so player can retry immediately
      this.setQuestionInputsDisabled(level, false);
      const input = document.getElementById(`q-text-input-${level}`);
      if (input) {
        input.select();
        input.focus();
      }
    }
  }

  localVerify(question, chosenAnswer) {
    const raw = String(chosenAnswer || '').trim();
    let isCorrect = false;
    let explanation = question.explanation;

    // Execute dynamic JS solver if present
    if (typeof question.verifier === 'function' && typeof question.solver === 'function') {
      const solved = question.solver();
      isCorrect = question.verifier(raw, solved);
      explanation = solved.explanation || explanation;
    } else if (window.JSQuestionSolvers && typeof window.JSQuestionSolvers[`verify_${question.id}`] === 'function') {
      const solverFn = window.JSQuestionSolvers[`solve_${question.id}`];
      const verifierFn = window.JSQuestionSolvers[`verify_${question.id}`];
      const solved = solverFn ? solverFn() : {};
      isCorrect = verifierFn(raw, solved);
      explanation = solved.explanation || explanation;
    } else {
      const type = question.type || 'mcq';
      if (type === 'mcq') {
        let opt = raw.toUpperCase();
        if (opt.length > 0 && ['A', 'B', 'C', 'D'].includes(opt[0])) opt = opt[0];
        isCorrect = (opt === String(question.correct_answer).trim().toUpperCase());
      } else if (type === 'numerical') {
        const numMatch = raw.match(/[-+]?\d*\.?\d+/);
        const num = numMatch ? parseFloat(numMatch[0]) : NaN;
        const target = parseFloat(question.correct_answer);
        isCorrect = !isNaN(num) && !isNaN(target) && Math.abs(num - target) < 0.05;
      } else if (type === 'short_text') {
        const cleanUser = raw.toLowerCase().replace(/\s+/g, ' ');
        const cleanTarget = String(question.correct_answer).toLowerCase().replace(/\s+/g, ' ');
        isCorrect = (cleanUser === cleanTarget);
      }
    }

    return {
      is_correct: isCorrect,
      explanation: explanation,
      feedback: isCorrect ? 'Analysis Verified! (+50 Gold & +100 XP)' : 'Incorrect analysis. Review your calculations and try again.'
    };
  }
}

window.DataScanner = DataScanner;
