/**
 * Data Miner: The Treasure Hunt - Main Game Loop & State Manager
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER', 'GRAND_VICTORY'
    this.currentLevel = 1;

    // Player stats
    this.maxLives = 3;
    this.lives = 3;
    this.maxEnergy = 100;
    this.energy = 100;
    this.coins = 0;
    this.xp = 0;
    
    // Player entity
    this.player = {
      x: 96,
      y: 96,
      width: 24,
      height: 24,
      vx: 0,
      vy: 0,
      speed: 3.2,
      dir: 'down',
      animTimer: 0,
      animFrame: 0,
      isMining: false,
      miningCooldown: 0
    };

    // Level runtime entities
    this.currentConfig = null;
    this.map = [];
    this.rocks = [];
    this.items = [];
    this.levelObjectiveCompleted = false;
    this.chestOpened = false;
    this.nearInteractable = null;

    // Engines
    this.camera = new Camera(this.canvas.width, this.canvas.height);
    this.camera.follow(this.player);
    this.particles = new ParticleSystem();
    this.lighting = new LightingEngine();
    this.lights = [];

    // Controller
    this.scanner = new DataScanner(this);
    window.dataScanner = this.scanner;

    // Random Question Set selection (fixed for this game session)
    this.activeQuestionSetId = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3

    // Input state
    this.keys = {};

    // Atmospheric cave dust particles (motes)
    this.ambientMotes = [];
    for (let i = 0; i < 35; i++) {
      this.ambientMotes.push({
        x: Math.random() * 24 * 32,
        y: Math.random() * 18 * 32,
        vx: (Math.random() - 0.5) * 8,
        vy: -5 - Math.random() * 8,
        size: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.4 + 0.2,
        pulse: Math.random() * Math.PI * 2
      });
    }

    this.initEvents();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Initialize Level 1 configuration immediately so state is valid from frame 0
    this.loadLevel(1, false);
    this.state = 'MENU';

    // Start loop
    this.lastTime = performance.now();
    requestAnimationFrame(time => this.gameLoop(time));
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.camera.resize(this.canvas.width, this.canvas.height);
    this.lighting.resize(this.canvas.width, this.canvas.height, this.camera.scale);
  }

  initEvents() {
    window.addEventListener('keydown', e => {
      const k = e.key ? e.key.toLowerCase() : '';
      const c = e.code ? e.code.toLowerCase() : '';
      if (k) this.keys[k] = true;
      if (c) this.keys[c] = true;

      // Prevent default scrolling on arrow keys and space in game
      const navKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'up', 'down', 'left', 'right', ' ', 'space'];
      if (navKeys.includes(k) || navKeys.includes(c)) {
        e.preventDefault();
      }

      // Unmute / start audio on first keypress
      window.soundEngine.init();

      if (e.key === 'Escape') {
        this.togglePause();
      }

      if (this.state === 'PLAYING') {
        if (k === 'e' || c === 'keye') {
          this.interactOrActivate();
        }
        if (k === ' ' || c === 'space') {
          this.interactOrActivate();
        }
      }
    });

    window.addEventListener('keyup', e => {
      const k = e.key ? e.key.toLowerCase() : '';
      const c = e.code ? e.code.toLowerCase() : '';
      if (k) this.keys[k] = false;
      if (c) this.keys[c] = false;
    });

    // Clear stuck keys if window loses focus
    window.addEventListener('blur', () => {
      this.keys = {};
    });

    // Main Menu Buttons: Clean & Simple (Start Game, How to Play)
    const btnPlay = document.getElementById('btn-play');
    if (btnPlay) {
      btnPlay.onclick = () => this.startGame();
    }
    const btnHowToPlay = document.getElementById('btn-how-to-play');
    if (btnHowToPlay) {
      btnHowToPlay.onclick = () => this.showModal('how-to-play-modal');
    }

    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.onclick = () => this.hideModals();
    });

    // Initialize Peer Feedback Form & Modal
    this.initFeedbackSystem();

    // Initialize Public Explorer Reviews Modal
    this.initReviewsSystem();
  }

  initReviewsSystem() {
    const reviewsMenuBtn = document.getElementById('btn-reviews-menu');
    const reviewsVictoryBtn = document.getElementById('btn-victory-reviews');
    const reviewsGameoverBtn = document.getElementById('btn-gameover-reviews');
    const reviewsModal = document.getElementById('reviews-modal');
    const reviewsCloseBtn = document.getElementById('reviews-close-btn');
    const reviewsBackBtn = document.getElementById('btn-reviews-back');
    const btnPrev = document.getElementById('btn-reviews-prev');
    const btnNext = document.getElementById('btn-reviews-next');

    let previousScreenId = null;
    let currentReviewPage = 1;

    const openReviews = (prevId) => {
      previousScreenId = prevId;
      if (prevId) {
        const prevModal = document.getElementById(prevId);
        if (prevModal) prevModal.style.display = 'none';
      }
      if (reviewsModal) reviewsModal.style.display = 'flex';
      window.soundEngine.playScannerBeep();
      currentReviewPage = 1;
      this.fetchAndRenderReviews(1);
    };

    const closeReviews = () => {
      if (reviewsModal) reviewsModal.style.display = 'none';
      if (previousScreenId) {
        const prevModal = document.getElementById(previousScreenId);
        if (prevModal) prevModal.style.display = 'flex';
      } else {
        const menu = document.getElementById('main-menu-screen');
        if (menu) menu.style.display = 'flex';
      }
    };

    if (reviewsMenuBtn) reviewsMenuBtn.onclick = () => openReviews('main-menu-screen');
    if (reviewsVictoryBtn) reviewsVictoryBtn.onclick = () => openReviews('victory-modal');
    if (reviewsGameoverBtn) reviewsGameoverBtn.onclick = () => openReviews('gameover-modal');
    if (reviewsCloseBtn) reviewsCloseBtn.onclick = () => closeReviews();
    if (reviewsBackBtn) reviewsBackBtn.onclick = () => closeReviews();

    if (btnPrev) {
      btnPrev.onclick = () => {
        if (currentReviewPage > 1) {
          currentReviewPage--;
          this.fetchAndRenderReviews(currentReviewPage);
        }
      };
    }

    if (btnNext) {
      btnNext.onclick = () => {
        currentReviewPage++;
        this.fetchAndRenderReviews(currentReviewPage);
      };
    }

    this.openPlayerReviews = openReviews;
  }

  async fetchAndRenderReviews(page = 1) {
    const listContainer = document.getElementById('reviews-list-container');
    const avgRatingEl = document.getElementById('reviews-avg-rating');
    const totalCountEl = document.getElementById('reviews-total-count');
    const paginationEl = document.getElementById('reviews-pagination');
    const pageInfoEl = document.getElementById('reviews-page-info');
    const btnPrev = document.getElementById('btn-reviews-prev');
    const btnNext = document.getElementById('btn-reviews-next');

    const escapeHtml = (str) => {
      return String(str || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[m]));
    };

    if (listContainer) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding:30px; font-family:'VT323'; font-size:20px; color:var(--glow-cyan);">
          CONSULTING ANCIENT EXPLORER ARCHIVES...
        </div>
      `;
    }

    try {
      const res = await fetch(`/api/feedback/public?page=${page}&per_page=6`);
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message || 'Error loading reviews');

      // Top stats
      if (avgRatingEl) {
        const avg = json.average_rating || 0;
        avgRatingEl.textContent = `★ ${avg.toFixed(1)} / 5.0`;
      }
      if (totalCountEl) {
        totalCountEl.textContent = `${json.total_reviews} ${json.total_reviews === 1 ? 'Review' : 'Reviews'}`;
      }

      if (!json.reviews || json.reviews.length === 0) {
        if (listContainer) {
          listContainer.innerHTML = `
            <div style="text-align:center; padding:40px; font-family:'VT323'; font-size:20px; color:#94a3b8; line-height:1.5;">
              <div style="font-size:26px; color:var(--glow-gold); margin-bottom:10px;">⛏️ NO FIELD LOGS YET! ⛏️</div>
              <p>Be the first courageous data miner to conquer the caverns and leave your review in the archives!</p>
            </div>
          `;
        }
        if (paginationEl) paginationEl.style.display = 'none';
        return;
      }

      // Render cards
      let html = '';
      json.reviews.forEach(r => {
        const starsGold = '★'.repeat(r.rating);
        const starsDim = '☆'.repeat(5 - r.rating);

        html += `
          <div class="review-card">
            <div class="review-top-bar">
              <span class="review-author">👤 ${escapeHtml(r.name || 'Anonymous Explorer')}</span>
              <span class="review-date">🕒 ${escapeHtml(r.timestamp || '')}</span>
            </div>
            <div class="review-stars-row">
              <span class="review-stars-gold">${starsGold}${starsDim}</span>
              <span class="review-rating-num">${r.rating}/5</span>
            </div>
            <div class="review-badges-row">
              <span class="review-badge badge-diff">DIFFICULTY: ${escapeHtml(r.difficulty || 'Medium')}</span>
              <span class="review-badge badge-learn">LEARNING: ${escapeHtml(r.learning_experience || 'Somewhat')}</span>
              <span class="review-badge badge-level">CHALLENGE: ${escapeHtml(r.challenging_level || 'General')}</span>
            </div>
            ${r.comments ? `
              <div class="review-comment-box">
                "${escapeHtml(r.comments)}"
              </div>
            ` : ''}
          </div>
        `;
      });

      if (listContainer) listContainer.innerHTML = html;

      // Pagination setup
      if (paginationEl && json.total_pages > 1) {
        paginationEl.style.display = 'flex';
        if (pageInfoEl) pageInfoEl.textContent = `Page ${json.page} of ${json.total_pages}`;
        if (btnPrev) btnPrev.disabled = (json.page <= 1);
        if (btnNext) btnNext.disabled = !json.has_more;
      } else if (paginationEl) {
        paginationEl.style.display = 'none';
      }

    } catch (e) {
      if (listContainer) {
        listContainer.innerHTML = `
          <div style="color:var(--glow-red); text-align:center; padding:20px; font-family:'VT323'; font-size:18px;">
            Error retrieving explorer logs: ${escapeHtml(e.message)}
          </div>
        `;
      }
    }
  }

  initFeedbackSystem() {
    const victoryFbBtn = document.getElementById('btn-victory-feedback');
    const gameoverFbBtn = document.getElementById('btn-gameover-feedback');
    const fbModal = document.getElementById('feedback-modal');
    const fbCloseBtn = document.getElementById('fb-close-btn');
    const fbBackBtn = document.getElementById('btn-feedback-back');
    const fbForm = document.getElementById('peer-feedback-form');
    const statusMsg = document.getElementById('feedback-status-msg');

    let previousModalId = null;

    const openFeedback = (prevId) => {
      previousModalId = prevId;
      if (prevId) {
        const prevModal = document.getElementById(prevId);
        if (prevModal) prevModal.style.display = 'none';
      }
      if (fbModal) fbModal.style.display = 'flex';
      window.soundEngine.playScannerBeep();
    };

    const closeFeedback = () => {
      if (fbModal) fbModal.style.display = 'none';
      if (previousModalId) {
        const prevModal = document.getElementById(previousModalId);
        if (prevModal) prevModal.style.display = 'flex';
      }
    };

    if (victoryFbBtn) victoryFbBtn.onclick = () => openFeedback('victory-modal');
    if (gameoverFbBtn) gameoverFbBtn.onclick = () => openFeedback('gameover-modal');
    if (fbCloseBtn) fbCloseBtn.onclick = () => closeFeedback();
    if (fbBackBtn) fbBackBtn.onclick = () => closeFeedback();

    // 1. Interactive Star Rating selector (1-5 Stars)
    const starBox = document.getElementById('star-rating-box');
    const starInput = document.getElementById('fb-rating-val');
    const starText = document.getElementById('star-rating-text');
    const starLabels = {
      1: '★ 1/5 - Poor',
      2: '★ 2/5 - Fair',
      3: '★ 3/5 - Good',
      4: '★ 4/5 - Great',
      5: '★ 5/5 - Excellent'
    };

    if (starBox) {
      const stars = starBox.querySelectorAll('.star-item');
      stars.forEach(s => {
        s.onclick = () => {
          const val = parseInt(s.dataset.val, 10);
          if (starInput) starInput.value = val;
          stars.forEach(st => {
            const sVal = parseInt(st.dataset.val, 10);
            if (sVal <= val) {
              st.classList.add('active');
            } else {
              st.classList.remove('active');
            }
          });
          if (starText) {
            starText.textContent = starLabels[val] || `${val}/5 Stars`;
            starText.style.color = '#fde047';
          }
          window.soundEngine.playCoin();
        };
      });
    }

    // 2. Interactive Selection Chips (Difficulty, Learning, Gameplay)
    document.querySelectorAll('.choice-chip').forEach(chip => {
      chip.onclick = () => {
        const group = chip.dataset.group;
        const val = chip.dataset.val;
        document.querySelectorAll(`.choice-chip[data-group="${group}"]`).forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const hiddenInput = document.getElementById(`fb-${group}-val`);
        if (hiddenInput) hiddenInput.value = val;
        window.soundEngine.playStep();
      };
    });

    // 3. Form Submit Validation and API call
    if (fbForm) {
      fbForm.onsubmit = async (e) => {
        e.preventDefault();

        const name = document.getElementById('fb-player-name')?.value.trim();
        const rating = parseInt(document.getElementById('fb-rating-val')?.value || '0', 10);
        const difficulty = document.getElementById('fb-difficulty-val')?.value;
        const learning = document.getElementById('fb-learning-val')?.value;
        const gameplay = document.getElementById('fb-gameplay-val')?.value;
        const challengingLevel = document.getElementById('fb-level-val')?.value;
        const comments = document.getElementById('fb-comments')?.value.trim();

        // Validation
        if (!rating || rating < 1 || rating > 5) {
          showStatus('Please provide an overall rating by clicking 1 to 5 stars.', 'error');
          return;
        }
        if (!difficulty) {
          showStatus('Please select a Game Difficulty option.', 'error');
          return;
        }
        if (!learning) {
          showStatus('Please answer question 4 regarding Data Science learning comprehension.', 'error');
          return;
        }
        if (!gameplay) {
          showStatus('Please select how you found the overall gameplay experience.', 'error');
          return;
        }
        if (!challengingLevel) {
          showStatus('Please select which Data Science level you found most challenging.', 'error');
          return;
        }

        const submitBtn = document.getElementById('btn-submit-feedback');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'TRANSMITTING FEEDBACK...';
        }

        try {
          const res = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name || 'Anonymous Explorer',
              rating: rating,
              difficulty: difficulty,
              learning_experience: learning,
              gameplay_experience: gameplay,
              challenging_level: challengingLevel,
              comments: comments || ''
            })
          });

          const json = await res.json();
          if (json.status === 'success') {
            window.soundEngine.playVictory();
            showStatus(
              `<div style="font-size:22px; color:var(--glow-green); font-weight:bold; margin-bottom:8px;">★ THANK YOU, EXPLORER! ★</div>` +
              `<p style="margin-bottom:12px;">${json.message || 'Your feedback helps us improve DATA MINER.'}</p>` +
              `<div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">` +
              `  <button type="button" class="pixel-btn primary" onclick="location.reload()" style="font-size:11px; padding:10px 14px;">RETURN TO MAIN MENU</button>` +
              `</div>`,
              'success'
            );
            // Hide the input fields to prevent duplicate submissions
            document.querySelectorAll('#peer-feedback-form .form-group').forEach(fg => fg.style.display = 'none');
            if (submitBtn) submitBtn.style.display = 'none';
          } else {
            window.soundEngine.playError();
            showStatus(json.message || 'Submission error. Please check your answers.', 'error');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'SUBMIT FEEDBACK';
            }
          }
        } catch (err) {
          window.soundEngine.playError();
          showStatus(`Transmission failed: ${err.message}`, 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'SUBMIT FEEDBACK';
          }
        }
      };
    }

    function showStatus(msgHtml, type) {
      if (!statusMsg) return;
      statusMsg.style.display = 'block';
      if (type === 'success') {
        statusMsg.style.background = 'rgba(57, 255, 20, 0.15)';
        statusMsg.style.border = '2px solid var(--glow-green)';
        statusMsg.style.color = '#e2e8f0';
      } else {
        statusMsg.style.background = 'rgba(255, 51, 68, 0.15)';
        statusMsg.style.border = '2px solid var(--glow-red)';
        statusMsg.style.color = '#fca5a5';
      }
      statusMsg.innerHTML = msgHtml;
    }
  }

  getActiveSetData() {
    const id = this.activeQuestionSetId || 1;
    if (window.QUESTION_SETS_BANK && window.QUESTION_SETS_BANK[id]) {
      return window.QUESTION_SETS_BANK[id];
    }
    return {
      set_id: id,
      name: `Protocol ${id}`,
      difficulty: "Moderate to Hard",
      questions: []
    };
  }

  getActiveSetQuestion(level) {
    const setData = this.getActiveSetData();
    if (!setData || !setData.questions) return null;
    return setData.questions.find(q => q.level === level) || setData.questions[0];
  }

  startGame() {
    // 1. Randomly select ONE set from the three sets (fixed for this game session)
    this.activeQuestionSetId = Math.floor(Math.random() * 3) + 1;
    // 2. Start automatically from Level 1
    this.currentLevel = 1;
    this.lives = this.maxLives;
    this.energy = this.maxEnergy;
    this.coins = 0;
    this.xp = 0;
    this.hideModals();
    document.getElementById('main-menu-screen').style.display = 'none';
    this.loadLevel(this.currentLevel, true);
    this.state = 'PLAYING';
    window.soundEngine.startCaveMusic();
  }

  loadLevel(levelId, showToast = true) {
    const config = LEVEL_CONFIGS.find(l => l.id === levelId) || LEVEL_CONFIGS[0];
    this.currentConfig = config;
    this.levelObjectiveCompleted = false;
    this.chestOpened = false;
    this.keys = {};

    // Deep copy map layout
    this.map = config.map.map(row => [...row]);
    this.rocks = config.rocks.map(r => ({ ...r, currentHp: r.hp }));
    this.items = config.items.map(i => ({ ...i, collected: false, lastCharged: 0, lastAutoCharge: 0 }));

    // Player position
    this.player.x = config.playerStart.x;
    this.player.y = config.playerStart.y;
    this.player.vx = 0;
    this.player.vy = 0;

    // Safety unstuck: if start position collides, search nearest open tile
    if (this.checkCollision(this.player.x, this.player.y)) {
      for (let radius = 1; radius <= 5; radius++) {
        let found = false;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const testX = config.playerStart.x + dx * TILE_SIZE;
            const testY = config.playerStart.y + dy * TILE_SIZE;
            if (!this.checkCollision(testX, testY)) {
              this.player.x = testX;
              this.player.y = testY;
              found = true;
              break;
            }
          }
          if (found) break;
        }
        if (found) break;
      }
    }

    // Validate and guarantee open placement for all items (Charging Points & Coins)
    this.validateAndPlaceItems();

    const worldW = this.currentConfig.width * TILE_SIZE;
    const worldH = this.currentConfig.height * TILE_SIZE;
    this.camera.update(worldW, worldH);

    this.setupLights();
    this.updateHUD();

    // Temporary Welcome / Mission Instruction (auto-fades in 3.5s)
    let missionMsg = `🎯 <strong>MISSION:</strong> Move with <strong>WASD / Arrow Keys</strong> to the glowing <strong>Terminal</strong> &bull; Press <strong>[E]</strong> to analyze data!`;
    if (config.id === 1) {
      missionMsg = `🎯 <strong>OBJECTIVE:</strong> Move with <strong>WASD / Arrow Keys</strong> to the glowing <strong>Terminal</strong> &bull; Press <strong>[E]</strong> to impute missing values!`;
    } else if (config.id === 2) {
      missionMsg = `🎯 <strong>OBJECTIVE:</strong> Head to the Terminal &bull; Press <strong>[E]</strong> to analyze Pearson correlation and find the richest vein!`;
    } else if (config.id === 3) {
      missionMsg = `🎯 <strong>OBJECTIVE:</strong> Use the Terminal <strong>[E]</strong> to run K-Means and isolate Mythic Star Crystals!`;
    } else if (config.id === 4) {
      missionMsg = `⚠️ <strong>OBJECTIVE:</strong> Scan rocks with <strong>[E]</strong> &bull; Use IQR to disarm unstable explosive hazards!`;
    } else if (config.id === 5) {
      missionMsg = `🏆 <strong>OBJECTIVE:</strong> Train ML models at the Master Vault Terminal <strong>[E]</strong> to predict valuation and crack the lock!`;
    }
    this.showObjectiveBanner(missionMsg, 3500);

    if (showToast) {
      this.showToast(`LEVEL ${config.id}: ${config.name}`);
    }
  }

  /**
   * Guarantees all charging points and items spawn on open, walkable floor tiles.
   * Never inside walls, rocks, obstacles, or overlapping player/chest/terminal/gate.
   * If blocked, finds the nearest valid floor position automatically.
   */
  validateAndPlaceItems() {
    const occupied = new Set();

    // 1. Mark player spawn area
    const pTileX = Math.floor(this.player.x / TILE_SIZE);
    const pTileY = Math.floor(this.player.y / TILE_SIZE);
    occupied.add(`${pTileX},${pTileY}`);

    // 2. Mark critical game objects
    if (this.currentConfig.terminalPos) {
      occupied.add(`${this.currentConfig.terminalPos.x},${this.currentConfig.terminalPos.y}`);
    }
    if (this.currentConfig.chestPos) {
      occupied.add(`${this.currentConfig.chestPos.x},${this.currentConfig.chestPos.y}`);
    }
    if (this.currentConfig.gatePos) {
      occupied.add(`${this.currentConfig.gatePos.x},${this.currentConfig.gatePos.y}`);
    }
    if (this.currentConfig.secretWallPos) {
      occupied.add(`${this.currentConfig.secretWallPos.x},${this.currentConfig.secretWallPos.y}`);
    }

    // 3. Mark breakable rocks
    for (const r of this.rocks) {
      if (r.currentHp > 0) {
        occupied.add(`${r.x},${r.y}`);
      }
    }

    const isTileOpenAndWalkable = (x, y) => {
      if (y < 0 || y >= this.map.length || x < 0 || x >= this.map[0].length) return false;
      const tile = this.map[y][x];
      // Must be floor (0) or floor detail (2). Cannot be wall (1), secret wall (3), etc.
      if (tile !== 0 && tile !== 2) return false;
      if (occupied.has(`${x},${y}`)) return false;

      // Must have at least one adjacent open floor tile for player access
      const neighbors = [
        [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
      ];
      let openNeighbors = 0;
      for (const [nx, ny] of neighbors) {
        if (ny >= 0 && ny < this.map.length && nx >= 0 && nx < this.map[0].length) {
          const nTile = this.map[ny][nx];
          if ((nTile === 0 || nTile === 2) && !occupied.has(`${nx},${ny}`)) {
            openNeighbors++;
          }
        }
      }
      return openNeighbors >= 1;
    };

    // 4. Validate and relocate any item if blocked
    for (const item of this.items) {
      if (isTileOpenAndWalkable(item.x, item.y)) {
        occupied.add(`${item.x},${item.y}`);
        continue;
      }

      // Blocked! Search outward in expanding rings for nearest valid tile
      let relocated = false;
      for (let radius = 1; radius <= 8 && !relocated; radius++) {
        for (let dy = -radius; dy <= radius && !relocated; dy++) {
          for (let dx = -radius; dx <= radius && !relocated; dx++) {
            if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
              const testX = item.x + dx;
              const testY = item.y + dy;
              if (isTileOpenAndWalkable(testX, testY)) {
                item.x = testX;
                item.y = testY;
                occupied.add(`${testX},${testY}`);
                relocated = true;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Displays temporary instruction / data restored banner for 3-4 seconds, then auto-fades.
   * If called again while active, cleanly restarts timer without stacking.
   */
  showObjectiveBanner(htmlMsg, durationMs = 3500) {
    const banner = document.getElementById('objective-banner');
    if (!banner) return;

    if (this.bannerTimer) {
      clearTimeout(this.bannerTimer);
      this.bannerTimer = null;
    }
    if (this.bannerFadeTimer) {
      clearTimeout(this.bannerFadeTimer);
      this.bannerFadeTimer = null;
    }

    banner.innerHTML = htmlMsg;
    banner.style.display = 'block';
    void banner.offsetWidth; // Force reflow
    banner.classList.add('visible');

    this.bannerFadeTimer = setTimeout(() => {
      banner.classList.remove('visible');
      this.bannerTimer = setTimeout(() => {
        banner.style.display = 'none';
      }, 450);
    }, durationMs);
  }

  updateObjectiveBanner() {
    if (!this.levelObjectiveCompleted) {
      if (this.currentLevel === 1) {
        this.showObjectiveBanner(`🎯 <strong>OBJECTIVE:</strong> Move with <strong>WASD / Arrow Keys</strong> to the glowing <strong>Terminal</strong> &bull; Press <strong>[E]</strong> to impute missing values!`, 3500);
      } else if (this.currentLevel === 2) {
        this.showObjectiveBanner(`🎯 <strong>OBJECTIVE:</strong> Head to the Terminal &bull; Press <strong>[E]</strong> to analyze Pearson correlation and find the richest vein!`, 3500);
      } else if (this.currentLevel === 3) {
        this.showObjectiveBanner(`🎯 <strong>OBJECTIVE:</strong> Use the Terminal <strong>[E]</strong> to run K-Means and isolate Mythic Star Crystals!`, 3500);
      } else if (this.currentLevel === 4) {
        this.showObjectiveBanner(`⚠️ <strong>OBJECTIVE:</strong> Scan rocks with <strong>[E]</strong> &bull; Use IQR to disarm unstable explosive hazards!`, 3500);
      } else if (this.currentLevel === 5) {
        this.showObjectiveBanner(`🏆 <strong>OBJECTIVE:</strong> Train ML models at the Master Vault Terminal <strong>[E]</strong> to predict valuation and crack the lock!`, 3500);
      }
    } else if (!this.chestOpened) {
      this.showObjectiveBanner(`✨ <strong>DATA RESTORED!</strong> Walk to the glowing Treasure Chest on the right and press <strong>[SPACEBAR]</strong>!`, 3500);
    } else {
      this.showObjectiveBanner(`🚪 <strong>GATE UNLOCKED!</strong> Step into the swirling mystical portal archway to advance!`, 3500);
    }
  }

  setupLights() {
    this.lights = [];

    // Player lantern light — subtle warm golden ambient (NO oversized glowing halo)
    this.playerLight = new LightSource(this.player.x + 12, this.player.y + 12, 100, 'rgba(255, 225, 170, 0.30)', true);
    this.lights.push(this.playerLight);

    // Terminal Light — soft muted cyan (reduced glow intensity, NO blinding halo)
    if (this.currentConfig && this.currentConfig.terminalPos) {
      const tx = this.currentConfig.terminalPos.x * TILE_SIZE + 16;
      const ty = this.currentConfig.terminalPos.y * TILE_SIZE + 16;
      this.lights.push(new LightSource(tx, ty, 50, 'rgba(13, 148, 136, 0.22)', false));
    }

    // Chest Light — subtle warm golden highlight (natural gold, NOT excessively bright)
    if (this.currentConfig && this.currentConfig.chestPos) {
      const cx = this.currentConfig.chestPos.x * TILE_SIZE + 16;
      const cy = this.currentConfig.chestPos.y * TILE_SIZE + 16;
      this.lights.push(new LightSource(cx, cy, 50, 'rgba(217, 140, 20, 0.24)', false));
    }

    // Gate Light — gentle warm amber portal illumination
    if (this.currentConfig && this.currentConfig.gatePos) {
      const gx = this.currentConfig.gatePos.x * TILE_SIZE + 16;
      const gy = this.currentConfig.gatePos.y * TILE_SIZE + 16;
      this.lights.push(new LightSource(gx, gy, 50, 'rgba(200, 110, 15, 0.22)', true));
    }
  }

  showToast(msg, durationMs = 2800) {
    const toast = document.getElementById('game-toast');
    if (!toast) return;

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    if (this.toastFadeTimer) {
      clearTimeout(this.toastFadeTimer);
      this.toastFadeTimer = null;
    }

    toast.textContent = msg;
    toast.style.display = 'block';
    void toast.offsetWidth;
    toast.classList.add('visible');

    this.toastFadeTimer = setTimeout(() => {
      toast.classList.remove('visible');
      this.toastTimer = setTimeout(() => {
        toast.style.display = 'none';
      }, 350);
    }, durationMs);
  }

  triggerScanner() {
    this.scanner.open(this.currentLevel);
  }

  completeLevelObjective(lvl) {
    this.levelObjectiveCompleted = true;
    this.xp += 150;
    this.updateHUD();

    // Show temporary 3-4s instruction banner to advance to the treasure chest
    this.showObjectiveBanner(`✨ <strong>DATA RESTORED!</strong> Walk to the glowing Treasure Chest on the right and press <strong>[SPACEBAR]</strong>!`, 3500);

    // If Level 2, shatter secret wall
    if (lvl === 2 && this.currentConfig.secretWallPos) {
      const wx = this.currentConfig.secretWallPos.x;
      const wy = this.currentConfig.secretWallPos.y;
      this.map[wy][wx] = 0; // Turn wall into floor!
      this.particles.emit(wx * TILE_SIZE + 16, wy * TILE_SIZE + 16, '#ffd700', 30, 3, 50);
      this.showToast('SECRET PASSAGE TO THE GOLD CHEST REVEALED!');
    } else {
      this.showToast(`DATA PIPELINE VERIFIED! TREASURE UNLOCKED!`);
    }
  }

  // Unified interact method: both E and Space call this.
  // Checks terminal, chest, charging point, then mining in priority order.
  interactOrActivate() {
    const pCenter = { x: this.player.x + 12, y: this.player.y + 12 };

    // 1. Check Terminal proximity (range 52px)
    if (this.currentConfig.terminalPos) {
      const tPos = {
        x: this.currentConfig.terminalPos.x * TILE_SIZE + 16,
        y: this.currentConfig.terminalPos.y * TILE_SIZE + 16
      };
      if (Math.hypot(pCenter.x - tPos.x, pCenter.y - tPos.y) < 52) {
        this.triggerScanner();
        return;
      }
    }

    // 2. Check Chest proximity (range 52px)
    if (this.currentConfig.chestPos) {
      const cPos = {
        x: this.currentConfig.chestPos.x * TILE_SIZE + 16,
        y: this.currentConfig.chestPos.y * TILE_SIZE + 16
      };
      if (Math.hypot(pCenter.x - cPos.x, pCenter.y - cPos.y) < 52) {
        this.openChest();
        return;
      }
    }

    // 3. Check Charging Point proximity (range 44px)
    for (const item of this.items) {
      if (item.type === 'energy' && !item.collected) {
        const iPos = { x: item.x * TILE_SIZE + 16, y: item.y * TILE_SIZE + 16 };
        if (Math.hypot(pCenter.x - iPos.x, pCenter.y - iPos.y) < 44) {
          this.collectEnergyPack(item);
          return;
        }
      }
    }

    // 4. Otherwise try mining an adjacent rock
    this.mineRock();
  }

  /**
   * Restores energy by strictly 3% per pickup, maximum 100%.
   * Upon touching/collecting, the charging capsule disappears and cannot be used again.
   * If current charging is 98% or 99%, it caps cleanly at 100%.
   */
  collectEnergyPack(item) {
    if (item.collected) return;

    const currentEnergy = Math.round(this.energy);
    if (currentEnergy >= 100) {
      const now = Date.now();
      if (!item.lastFullToast || now - item.lastFullToast > 2000) {
        item.lastFullToast = now;
        this.showToast('⚡ BATTERY FULL! (100% Charge)');
      }
      return;
    }

    // Increase energy by strictly 3%, capped at 100% (e.g. 98% -> 100%, 99% -> 100%)
    const newEnergy = Math.min(100, currentEnergy + 3);
    const gained = newEnergy - currentEnergy;
    this.energy = newEnergy;

    // Disappear permanently — user cannot use it again
    item.collected = true;

    window.soundEngine.playGemChime();
    const iCenter = { x: item.x * TILE_SIZE + 16, y: item.y * TILE_SIZE + 16 };
    this.particles.emit(iCenter.x, iCenter.y, '#22c55e', 24, 2.5);

    this.showToast(`⚡ Recharged +${gained}% Energy! (${newEnergy}%)`);
    this.updateHUD();

    const prompt = document.getElementById('action-prompt');
    if (prompt && this.nearInteractable && this.nearInteractable.item === item) {
      prompt.style.display = 'none';
      this.nearInteractable = null;
    }
  }

  useChargingPoint(item) {
    this.collectEnergyPack(item);
  }

  mineRock() {
    const pCenter = { x: this.player.x + 12, y: this.player.y + 12 };
    let reachDist = 44;
    let hitRock = null;

    for (const rock of this.rocks) {
      if (rock.currentHp <= 0) continue;
      const rCenter = { x: rock.x * TILE_SIZE + 16, y: rock.y * TILE_SIZE + 16 };
      const dist = Math.hypot(pCenter.x - rCenter.x, pCenter.y - rCenter.y);
      if (dist < reachDist) {
        hitRock = rock;
        break;
      }
    }

    if (!hitRock) return;

    this.player.isMining = true;
    this.player.miningCooldown = 12;
    this.energy = Math.max(0, this.energy - 1.5);
    hitRock.currentHp--;

    window.soundEngine.playMineHit();
    this.particles.emit(hitRock.x * TILE_SIZE + 16, hitRock.y * TILE_SIZE + 16, '#94a3b8', 10, 2);

    if (hitRock.currentHp <= 0) {
      // Rock shattered!
      this.coins += hitRock.coins;
      this.xp += 25;
      this.particles.emit(hitRock.x * TILE_SIZE + 16, hitRock.y * TILE_SIZE + 16, '#ffd700', 20, 3);
      window.soundEngine.playCoin();
      this.showToast(`Mined ${hitRock.type.toUpperCase()}! +${hitRock.coins} Gold`);
    }
    this.updateHUD();
  }

  openChest() {
    if (!this.levelObjectiveCompleted) {
      this.showToast('CHEST IS LOCKED! Restore sensor data at the Terminal first.');
      window.soundEngine.playError();
      return;
    }
    if (this.chestOpened) return;

    this.chestOpened = true;
    const bonus = 200 + this.currentLevel * 50;
    this.coins += bonus;
    this.xp += 100;
    window.soundEngine.playVictory();
    this.particles.emit(this.currentConfig.chestPos.x * TILE_SIZE + 16, this.currentConfig.chestPos.y * TILE_SIZE + 16, '#ffd700', 40, 4, 60);
    this.showToast(`TREASURE CHEST OPENED! +${bonus} GOLD! GATE IS NOW ACTIVE!`);
    this.updateHUD();
    this.updateObjectiveBanner();
  }

  penalizeEnergy(amt) {
    this.energy = Math.max(0, this.energy - amt);
    this.updateHUD();
    if (this.energy <= 0) {
      this.handleGameOver('Your miner ran out of battery charge! Collect ⚡ charging symbols to stay powered.');
    }
  }

  rewardChallengeSuccess() {
    this.coins += 50;
    this.xp += 100;
    this.updateHUD();
    this.showToast('★ CHALLENGE SOLVED! +50 GOLD & +100 XP! ★');
  }

  penalizeChallengeError(isRepeated = false) {
    // 1. Deduct 20 gold (clamped at 0)
    const goldToDeduct = Math.min(20, this.coins);
    this.coins -= goldToDeduct;

    let energyLost = 0;
    let livesLost = 0;

    // 2. If repeated error on same challenge, reduce energy (-15%) or health
    if (isRepeated) {
      if (this.energy > 15) {
        this.energy -= 15;
        energyLost = 15;
      } else {
        if (this.lives > 1) {
          this.lives -= 1;
          this.energy = 50;
          livesLost = 1;
        } else {
          this.energy = Math.max(0, this.energy - 10);
          energyLost = 10;
        }
      }
    }

    this.updateHUD();

    let msg = `[CHALLENGE INCORRECT: -${goldToDeduct} Gold]`;
    if (energyLost > 0) msg += ` [-${energyLost}% Energy]`;
    if (livesLost > 0) msg += ` [-1 Life]`;
    this.showToast(msg);

    return {
      goldDeducted: goldToDeduct,
      energyDeducted: energyLost,
      livesDeducted: livesLost,
      currentGold: this.coins,
      currentEnergy: Math.round(this.energy),
      currentLives: this.lives
    };
  }

  handleGameOver(reason) {
    this.state = 'GAMEOVER';
    window.soundEngine.playError();
    const modal = document.getElementById('gameover-modal');
    document.getElementById('gameover-reason').textContent = reason || 'Mission Failed!';
    modal.style.display = 'flex';
  }

  showGrandVictory() {
    this.state = 'GRAND_VICTORY';
    window.soundEngine.playVictory();
    const modal = document.getElementById('victory-modal');
    const finalCoins = document.getElementById('final-coins-val');
    if (finalCoins) finalCoins.textContent = this.coins;
    modal.style.display = 'flex';
  }

  updateHUD() {
    // 1. Level Information (Cave #, Title, Subtitle)
    if (this.currentConfig) {
      const lvlNumEl = document.getElementById('hud-level-num');
      if (lvlNumEl) lvlNumEl.textContent = this.currentConfig.id || this.currentLevel;

      const lvlTitleEl = document.getElementById('hud-level-title');
      if (lvlTitleEl) lvlTitleEl.textContent = this.currentConfig.name;

      const lvlSubEl = document.getElementById('hud-level-sub');
      if (lvlSubEl) lvlSubEl.textContent = this.currentConfig.subtitle;
    }

    // 2. Battery / Power status: ⚡ CHARGING & visual progress bar
    const chargeVal = Math.max(0, Math.min(100, Math.round(this.energy)));
    const chargeEl = document.getElementById('hud-charging');
    if (chargeEl) {
      chargeEl.textContent = `${chargeVal}%`;
    }

    const energyFill = document.getElementById('hud-energy-fill');
    if (energyFill) {
      energyFill.style.width = `${chargeVal}%`;
      energyFill.className = 'hud-meter-fill ' + (chargeVal > 50 ? 'energy-high' : (chargeVal > 25 ? 'energy-mid' : 'energy-low'));
    }

    // Visual feedback when energy decreases noticeably
    if (this._lastEnergy !== undefined && this.energy < this._lastEnergy - 3) {
      const meterWrap = document.querySelector('.hud-meter-wrap');
      if (meterWrap) {
        meterWrap.classList.remove('pulse-decrease');
        void meterWrap.offsetWidth;
        meterWrap.classList.add('pulse-decrease');
      }
    }
    this._lastEnergy = this.energy;

    // 3. Lives: ❤️ Heart Icons
    const heartsContainer = document.getElementById('hud-hearts');
    if (heartsContainer) {
      const maxHearts = 3;
      let heartsHtml = '';
      for (let i = 0; i < maxHearts; i++) {
        if (i < this.lives) {
          heartsHtml += '<span class="hud-heart active">❤️</span>';
        } else {
          heartsHtml += '<span class="hud-heart lost">🖤</span>';
        }
      }
      heartsContainer.innerHTML = heartsHtml;
    }

    const livesEl = document.getElementById('hud-lives');
    if (livesEl) livesEl.textContent = this.lives;

    // 4. Gold / Coins: 🪙 GOLD with pulse animation on increase
    const coinsEl = document.getElementById('hud-coins');
    if (coinsEl) {
      if (this._lastCoins !== undefined && this.coins > this._lastCoins) {
        coinsEl.classList.remove('pulse-increase');
        void coinsEl.offsetWidth;
        coinsEl.classList.add('pulse-increase');
      }
      coinsEl.textContent = this.coins;
    }
    this._lastCoins = this.coins;

    // 5. Experience: 🏆 XP with pulse animation on increase
    const xpEl = document.getElementById('hud-xp');
    if (xpEl) {
      if (this._lastXp !== undefined && this.xp > this._lastXp) {
        xpEl.classList.remove('pulse-increase');
        void xpEl.offsetWidth;
        xpEl.classList.add('pulse-increase');
      }
      xpEl.textContent = this.xp;
    }
    this._lastXp = this.xp;
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      document.getElementById('pause-modal').style.display = 'flex';
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      document.getElementById('pause-modal').style.display = 'none';
    }
  }

  showModal(id) {
    this.hideModals();
    document.getElementById(id).style.display = 'flex';
  }

  hideModals() {
    document.querySelectorAll('.game-screen').forEach(m => {
      if (m.id !== 'main-menu-screen') m.style.display = 'none';
    });
    // If we're still in the MENU state, make sure the main menu is visible
    if (this.state === 'MENU') {
      document.getElementById('main-menu-screen').style.display = 'flex';
    }
  }

  // --- Main Update Loop --- //
  update(dt) {
    if (!this.currentConfig) return;

    // Camera & lighting update
    const worldW = this.currentConfig.width * TILE_SIZE;
    const worldH = this.currentConfig.height * TILE_SIZE;
    this.playerLight.x = this.player.x + 12;
    this.playerLight.y = this.player.y + 12;
    for (const l of this.lights) l.update();
    this.camera.update(worldW, worldH);
    this.particles.update();

    // Update ambient cave dust motes
    if (this.ambientMotes) {
      for (const m of this.ambientMotes) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.pulse += dt * 2.5;
        if (m.y < 0) {
          m.y = worldH;
          m.x = Math.random() * worldW;
        }
        if (m.x < 0) m.x = worldW;
        if (m.x > worldW) m.x = 0;
      }
    }

    if (this.state !== 'PLAYING') return;

    // 1. Movement Inputs
    let dx = 0;
    let dy = 0;

    const isUp = this.keys['arrowup'] || this.keys['up'] || this.keys['w'] || this.keys['keyw'] || this.keys['z'] || this.keys['keyz'];
    const isDown = this.keys['arrowdown'] || this.keys['down'] || this.keys['s'] || this.keys['keys'];
    const isLeft = this.keys['arrowleft'] || this.keys['left'] || this.keys['a'] || this.keys['keya'] || this.keys['q'] || this.keys['keyq'];
    const isRight = this.keys['arrowright'] || this.keys['right'] || this.keys['d'] || this.keys['keyd'];

    if (isUp) { dy -= 1; this.player.dir = 'up'; }
    if (isDown) { dy += 1; this.player.dir = 'down'; }
    if (isLeft) { dx -= 1; this.player.dir = 'left'; }
    if (isRight) { dx += 1; this.player.dir = 'right'; }

    // Normalize diagonal
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    const isMoving = (dx !== 0 || dy !== 0);

    if (isMoving) {
      const nextX = this.player.x + dx * this.player.speed;
      const nextY = this.player.y + dy * this.player.speed;

      // Check collision on X
      if (!this.checkCollision(nextX, this.player.y)) {
        this.player.x = nextX;
      }
      // Check collision on Y
      if (!this.checkCollision(this.player.x, nextY)) {
        this.player.y = nextY;
      }

      this.player.animTimer++;
      if (this.player.animTimer > 8) {
        this.player.animFrame = (this.player.animFrame + 1) % 2;
        this.player.animTimer = 0;
        window.soundEngine.playStep();
      }

      // Energy slow depletion while traversing
      this.energy = Math.max(0, this.energy - 0.008);
      this.updateHUD();
    } else {
      this.player.animFrame = 0;
    }

    // Mining animation cooldown
    if (this.player.miningCooldown > 0) {
      this.player.miningCooldown--;
      if (this.player.miningCooldown === 0) {
        this.player.isMining = false;
      }
    }

    // 2. Item pickups & Charging Points
    const pCenter = { x: this.player.x + 12, y: this.player.y + 12 };
    for (const item of this.items) {
      if (item.collected) continue;
      const iCenter = { x: item.x * TILE_SIZE + 16, y: item.y * TILE_SIZE + 16 };
      const dist = Math.hypot(pCenter.x - iCenter.x, pCenter.y - iCenter.y);

      if (item.type === 'coin') {
        if (dist < 28) {
          item.collected = true;
          this.coins += item.value;
          window.soundEngine.playCoin();
          this.particles.emit(iCenter.x, iCenter.y, '#ffd700', 16, 2);
          this.showToast(`⭐ +${item.value} Points!`);
          this.updateHUD();
        }
      } else if (item.type === 'energy') {
        // Touching the charging point restores strictly +3% (capped at 100%) and disappears permanently
        if (dist < 28) {
          this.collectEnergyPack(item);
        }
      }
    }

    // 3. Proximity Checks (Terminal, Chest, Charging Points, Gateway)
    this.checkProximity();
  }

  checkCollision(x, y) {
    const pBox = { x: x + 4, y: y + 8, w: 16, h: 16 };

    // Check map tiles (subtract epsilon so touching outer edge doesn't count as entering next tile)
    const leftTile = Math.floor(pBox.x / TILE_SIZE);
    const rightTile = Math.floor((pBox.x + pBox.w - 0.1) / TILE_SIZE);
    const topTile = Math.floor(pBox.y / TILE_SIZE);
    const bottomTile = Math.floor((pBox.y + pBox.h - 0.1) / TILE_SIZE);

    for (let ty = topTile; ty <= bottomTile; ty++) {
      for (let tx = leftTile; tx <= rightTile; tx++) {
        if (ty < 0 || ty >= this.map.length || tx < 0 || tx >= this.map[0].length) return true;
        const tile = this.map[ty][tx];
        // Solid wall or secret wall before discovery
        if (tile === 1 || tile === 3) return true;
      }
    }

    // Check rocks
    for (const r of this.rocks) {
      if (r.currentHp > 0) {
        const rBox = { x: r.x * TILE_SIZE + 4, y: r.y * TILE_SIZE + 4, w: 24, h: 24 };
        if (this.boxesOverlap(pBox, rBox)) return true;
      }
    }

    return false;
  }

  boxesOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  checkProximity() {
    const prompt = document.getElementById('action-prompt');
    const pCenter = { x: this.player.x + 12, y: this.player.y + 12 };

    // Check Terminal
    if (this.currentConfig.terminalPos) {
      const tPos = { x: this.currentConfig.terminalPos.x * TILE_SIZE + 16, y: this.currentConfig.terminalPos.y * TILE_SIZE + 16 };
      if (Math.hypot(pCenter.x - tPos.x, pCenter.y - tPos.y) < 48) {
        this.nearInteractable = { type: 'terminal' };
        prompt.innerHTML = `[E] SCAN TERMINAL &bull; LEVEL ${this.currentLevel} DATA MISSION`;
        prompt.style.display = 'block';
        return;
      }
    }

    // Check Chest
    if (this.currentConfig.chestPos) {
      const cPos = { x: this.currentConfig.chestPos.x * TILE_SIZE + 16, y: this.currentConfig.chestPos.y * TILE_SIZE + 16 };
      if (Math.hypot(pCenter.x - cPos.x, pCenter.y - cPos.y) < 48) {
        this.nearInteractable = { type: 'chest' };
        if (!this.chestOpened) {
          prompt.innerHTML = `[SPACE] OPEN TREASURE CHEST`;
          prompt.style.display = 'block';
        } else {
          prompt.style.display = 'none';
        }
        return;
      }
    }

    // Check Charging Points
    for (const item of this.items) {
      if (item.type === 'energy' && !item.collected) {
        const iPos = { x: item.x * TILE_SIZE + 16, y: item.y * TILE_SIZE + 16 };
        if (Math.hypot(pCenter.x - iPos.x, pCenter.y - iPos.y) < 44) {
          this.nearInteractable = { type: 'energy', item: item };
          const cur = Math.round(this.energy);
          if (cur >= 100) {
            prompt.innerHTML = `⚡ POWER CAPSULE &bull; 100% MAXIMUM CHARGE`;
          } else {
            prompt.innerHTML = `⚡ TOUCH CAPSULE TO RECHARGE (+3%) &bull; ${cur}%`;
          }
          prompt.style.display = 'block';
          return;
        }
      }
    }

    // Check Gateway to next level
    if (this.currentConfig.gatePos) {
      const gPos = { x: this.currentConfig.gatePos.x * TILE_SIZE + 16, y: this.currentConfig.gatePos.y * TILE_SIZE + 16 };
      if (Math.hypot(pCenter.x - gPos.x, pCenter.y - gPos.y) < 44) {
        if (this.levelObjectiveCompleted && this.chestOpened) {
          // Advance to next level!
          if (this.currentLevel < 5) {
            window.soundEngine.playVictory();
            this.currentLevel++;
            this.loadLevel(this.currentLevel, true);
          } else {
            this.showGrandVictory();
          }
        }
      }
    }

    this.nearInteractable = null;
    prompt.style.display = 'none';
  }

  // --- Rendering Loop --- //
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.currentConfig || !this.map || this.map.length === 0) {
      return;
    }

    // Save context and apply camera scaling (crisp pixel-art zoom)
    this.ctx.save();
    this.ctx.scale(this.camera.scale, this.camera.scale);

    // Warm deep subterranean bedrock backdrop outside playable cavern boundaries
    this.ctx.fillStyle = '#180e08';
    this.ctx.fillRect(0, 0, this.canvas.width / this.camera.scale, this.canvas.height / this.camera.scale);

    // 1. Render Map Tiles
    for (let r = 0; r < this.map.length; r++) {
      for (let c = 0; c < this.map[r].length; c++) {
        const tile = this.map[r][c];
        const screenX = this.camera.toScreenX(c * TILE_SIZE);
        const screenY = this.camera.toScreenY(r * TILE_SIZE);

        // Outer boundary vs interior maze check
        const isBoundary = (r === 0 || r === this.map.length - 1 || c === 0 || c === this.map[r].length - 1);

        // Deterministic floor tile variation based on coordinates
        const floorSeed = ((r * 13 + c * 29) ^ (r * c * 7)) % 10;
        let floorKey = 'floor_0';
        if (floorSeed === 7) floorKey = 'floor_1';
        else if (floorSeed === 8) floorKey = 'floor_2';
        else if (floorSeed === 9) floorKey = 'floor_3';

        // Always draw cave floor bedrock under objects
        this.ctx.drawImage(window.spriteManager.get(floorKey), screenX, screenY);

        if (tile === 1) {
          // Perimeter walls are natural rocky cave walls; interior obstacles are realistic wooden plank barricades
          const wallSprite = isBoundary ? 'wall_rock' : 'wall_wood';
          this.ctx.drawImage(window.spriteManager.get(wallSprite), screenX, screenY);

          // For inner wooden barriers, add realistic 3D drop shadow and subtle organic moss accents
          if (!isBoundary) {
            if (r + 1 < this.map.length && this.map[r + 1][c] !== 1 && this.map[r + 1][c] !== 3) {
              this.ctx.fillStyle = 'rgba(40, 20, 10, 0.32)';
              this.ctx.fillRect(screenX, screenY + TILE_SIZE, TILE_SIZE, 5);

              // Organic moss clumps hugging the barrier base (like in reference image)
              if ((r * 7 + c * 13) % 3 === 0) {
                this.ctx.fillStyle = '#4a6d26';
                this.ctx.fillRect(screenX + 2, screenY + TILE_SIZE - 2, 5, 3);
                this.ctx.fillRect(screenX + 5, screenY + TILE_SIZE - 1, 3, 2);
                this.ctx.fillStyle = '#6a9234';
                this.ctx.fillRect(screenX + 3, screenY + TILE_SIZE - 2, 2, 2);
              } else if ((r * 11 + c * 5) % 3 === 1) {
                this.ctx.fillStyle = '#4a6d26';
                this.ctx.fillRect(screenX + TILE_SIZE - 7, screenY + TILE_SIZE - 2, 5, 3);
                this.ctx.fillRect(screenX + TILE_SIZE - 4, screenY + TILE_SIZE - 1, 3, 2);
                this.ctx.fillStyle = '#6a9234';
                this.ctx.fillRect(screenX + TILE_SIZE - 6, screenY + TILE_SIZE - 2, 3, 2);
              }
            }
          }
        } else if (tile === 2) {
          this.ctx.drawImage(window.spriteManager.get('floor_detail'), screenX, screenY);
        } else if (tile === 3) {
          this.ctx.drawImage(window.spriteManager.get('secret_wall'), screenX, screenY);
          if (r + 1 < this.map.length && this.map[r + 1][c] !== 1 && this.map[r + 1][c] !== 3) {
            this.ctx.fillStyle = 'rgba(40, 20, 10, 0.32)';
            this.ctx.fillRect(screenX, screenY + TILE_SIZE, TILE_SIZE, 5);
          }
        } else if (tile === 4) {
          const isOpen = (this.levelObjectiveCompleted && this.chestOpened);
          this.ctx.drawImage(window.spriteManager.get(isOpen ? 'gateway_open' : 'gateway_locked'), screenX, screenY);
          if (isOpen) {
            // Subtle rotating portal aura (warm amber)
            const spin = (Date.now() / 420) % (Math.PI * 2);
            this.ctx.save();
            this.ctx.translate(screenX + 16, screenY + 16);
            this.ctx.rotate(spin);
            this.ctx.strokeStyle = 'rgba(217, 140, 20, 0.35)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(-8, -8, 16, 16);
            this.ctx.restore();
          }
        } else if (tile === 5) {
          // Terminal — soft muted cyan projection (non-blinding, no huge halo)
          const holoPulse = Math.sin(Date.now() / 300);
          this.ctx.strokeStyle = `rgba(13, 148, 136, ${0.12 + holoPulse * 0.05})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.ellipse(screenX + 16, screenY + 28, 10 + holoPulse * 1, 3.5, 0, 0, Math.PI * 2);
          this.ctx.stroke();

          this.ctx.drawImage(window.spriteManager.get('data_terminal'), screenX, screenY);
        } else if (tile === 6) {
          // Chest — subtle golden floor aura
          const goldPulse = Math.sin(Date.now() / 320);
          this.ctx.fillStyle = `rgba(217, 140, 20, ${0.05 + goldPulse * 0.03})`;
          this.ctx.beginPath();
          this.ctx.ellipse(screenX + 16, screenY + 26, 10, 4, 0, 0, Math.PI * 2);
          this.ctx.fill();

          this.ctx.drawImage(window.spriteManager.get(this.chestOpened ? 'chest_open' : 'chest_closed'), screenX, screenY);
        }
      }
    }

    // 2. Render Items
    for (const item of this.items) {
      if (item.collected) continue;
      const screenX = this.camera.toScreenX(item.x * TILE_SIZE + 8);
      const screenY = this.camera.toScreenY(item.y * TILE_SIZE + 8);
      if (item.type === 'energy') {
        // Natural soft drop shadow under energy power capsule (NO giant glowing halo or floating text)
        this.ctx.fillStyle = 'rgba(70, 45, 25, 0.22)';
        this.ctx.beginPath();
        this.ctx.ellipse(screenX + 8, screenY + 14, 6, 2.5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.drawImage(window.spriteManager.get('energy_pack'), screenX, screenY);
      } else if (item.type === 'coin') {
        this.ctx.drawImage(window.spriteManager.get('coin'), screenX, screenY);
      }
    }

    // 3. Render Breakable Rocks
    for (const rock of this.rocks) {
      if (rock.currentHp <= 0) continue;
      const screenX = this.camera.toScreenX(rock.x * TILE_SIZE);
      const screenY = this.camera.toScreenY(rock.y * TILE_SIZE);

      if (rock.type === 'hazard') {
        this.ctx.drawImage(window.spriteManager.get('hazard_rock'), screenX, screenY);
      } else if (rock.type === 'celestial') {
        this.ctx.drawImage(window.spriteManager.get('celestial_diamond'), screenX, screenY);
      } else {
        this.ctx.drawImage(window.spriteManager.get(`ore_${rock.type}`), screenX, screenY);
      }

      // Small HP bar if damaged
      if (rock.currentHp < rock.hp) {
        this.ctx.fillStyle = '#b91c1c';
        this.ctx.fillRect(screenX + 4, screenY - 4, 24, 3);
        this.ctx.fillStyle = '#10b981';
        this.ctx.fillRect(screenX + 4, screenY - 4, (rock.currentHp / rock.hp) * 24, 3);
      }
    }

    // 4. Render Terminal, Chest, and Gateway World Indicators
    const pCenter = { x: this.player.x + 12, y: this.player.y + 12 };

    if (this.currentConfig.terminalPos && !this.levelObjectiveCompleted) {
      const tX = this.camera.toScreenX(this.currentConfig.terminalPos.x * TILE_SIZE + 16);
      const tY = this.camera.toScreenY(this.currentConfig.terminalPos.y * TILE_SIZE);
      const tCenter = { x: this.currentConfig.terminalPos.x * TILE_SIZE + 16, y: this.currentConfig.terminalPos.y * TILE_SIZE + 16 };
      const dist = Math.hypot(pCenter.x - tCenter.x, pCenter.y - tCenter.y);
      const bob = Math.sin(Date.now() / 240) * 2;

      // Subtle beacon indicator ring (reduced glow, muted cyan)
      const bRad = 13 + Math.sin(Date.now() / 260) * 1.5;
      this.ctx.strokeStyle = dist < 52 ? 'rgba(13, 148, 136, 0.60)' : 'rgba(13, 148, 136, 0.22)';
      this.ctx.lineWidth = dist < 52 ? 1.5 : 0.8;
      this.ctx.beginPath();
      this.ctx.arc(tX, tY + 16, bRad, 0, Math.PI * 2);
      this.ctx.stroke();

      // Floating interactive badge — warm brown aesthetic, readable
      const pillText = dist < 52 ? '▶ [E] ANALYZE DATA' : 'DATA TERMINAL';
      this.ctx.font = '7px "Press Start 2P"';
      const textW = this.ctx.measureText(pillText).width;
      const pillW = textW + 12;
      const pillH = 14;
      const pillX = tX - pillW / 2;
      const pillY = tY - 14 + bob;

      this.ctx.fillStyle = dist < 52 ? 'rgba(56, 38, 24, 0.94)' : 'rgba(46, 30, 18, 0.90)';
      this.ctx.strokeStyle = dist < 52 ? '#14b8a6' : '#6b482c';
      this.ctx.lineWidth = 1;
      this.ctx.fillRect(pillX, pillY, pillW, pillH);
      this.ctx.strokeRect(pillX, pillY, pillW, pillH);

      this.ctx.fillStyle = '#f5e8d8';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(pillText, tX, pillY + 10);
    }

    if (this.currentConfig.chestPos && !this.chestOpened) {
      const cX = this.camera.toScreenX(this.currentConfig.chestPos.x * TILE_SIZE + 16);
      const cY = this.camera.toScreenY(this.currentConfig.chestPos.y * TILE_SIZE);
      const cCenter = { x: this.currentConfig.chestPos.x * TILE_SIZE + 16, y: this.currentConfig.chestPos.y * TILE_SIZE + 16 };
      const dist = Math.hypot(pCenter.x - cCenter.x, pCenter.y - cCenter.y);
      const bob = Math.sin(Date.now() / 240) * 2;

      const pillText = dist < 48 ? '★ [SPACE] OPEN CHEST' : 'GOLD CHEST';
      this.ctx.font = '7px "Press Start 2P"';
      const textW = this.ctx.measureText(pillText).width;
      const pillW = textW + 12;
      const pillH = 14;
      const pillX = cX - pillW / 2;
      const pillY = cY - 14 + bob;

      this.ctx.fillStyle = dist < 48 ? 'rgba(56, 38, 24, 0.94)' : 'rgba(46, 30, 18, 0.90)';
      this.ctx.strokeStyle = dist < 48 ? '#f59e0b' : '#6b482c';
      this.ctx.lineWidth = 1;
      this.ctx.fillRect(pillX, pillY, pillW, pillH);
      this.ctx.strokeRect(pillX, pillY, pillW, pillH);

      this.ctx.fillStyle = '#f5e8d8';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(pillText, cX, pillY + 10);
    }

    if (this.currentConfig.gatePos && (this.levelObjectiveCompleted && this.chestOpened)) {
      const gX = this.camera.toScreenX(this.currentConfig.gatePos.x * TILE_SIZE + 16);
      const gY = this.camera.toScreenY(this.currentConfig.gatePos.y * TILE_SIZE);
      const bob = Math.sin(Date.now() / 240) * 2;

      const pillText = '⚡ [ENTER] NEXT CAVE';
      this.ctx.font = '7px "Press Start 2P"';
      const textW = this.ctx.measureText(pillText).width;
      const pillW = textW + 12;
      const pillH = 14;
      const pillX = gX - pillW / 2;
      const pillY = gY - 14 + bob;

      this.ctx.fillStyle = 'rgba(56, 38, 24, 0.94)';
      this.ctx.strokeStyle = '#d97706';
      this.ctx.lineWidth = 1;
      this.ctx.fillRect(pillX, pillY, pillW, pillH);
      this.ctx.strokeRect(pillX, pillY, pillW, pillH);

      this.ctx.fillStyle = '#f5e8d8';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(pillText, gX, pillY + 10);
    }

    // 5. Render Atmospheric Cave Dust Particles (Soft subtle warm amber motes)
    if (this.ambientMotes) {
      for (const m of this.ambientMotes) {
        const sx = this.camera.toScreenX(m.x);
        const sy = this.camera.toScreenY(m.y);
        const alpha = Math.max(0.05, Math.min(0.3, m.alpha + Math.sin(m.pulse) * 0.1));
        this.ctx.fillStyle = `rgba(215, 175, 120, ${alpha * 0.22})`;
        this.ctx.fillRect(sx, sy, m.size, m.size);
      }
    }

    // 6. Render Player Miner & Natural Character Appearance (NO giant glowing halos)
    const pScreenX = this.camera.toScreenX(this.player.x);
    const pScreenY = this.camera.toScreenY(this.player.y);
    const pCenterX = pScreenX + 12;
    const pCenterY = pScreenY + 12;

    // Soft, very subtle directional headlamp beam (gentle lantern warmth, non-blinding)
    let beamAngle = Math.PI / 2; // down
    if (this.player.dir === 'up') beamAngle = -Math.PI / 2;
    else if (this.player.dir === 'left') beamAngle = Math.PI;
    else if (this.player.dir === 'right') beamAngle = 0;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(pCenterX, pCenterY);
    this.ctx.arc(pCenterX, pCenterY, 60, beamAngle - 0.38, beamAngle + 0.38);
    this.ctx.closePath();
    const beamGrad = this.ctx.createRadialGradient(pCenterX, pCenterY, 5, pCenterX, pCenterY, 60);
    beamGrad.addColorStop(0, 'rgba(255, 230, 180, 0.08)');
    beamGrad.addColorStop(1, 'rgba(217, 140, 20, 0)');
    this.ctx.fillStyle = beamGrad;
    this.ctx.fill();
    this.ctx.restore();

    // Subtle small indicator ring under miner (gentle, unobtrusive)
    const pRingRad = 11 + Math.sin(Date.now() / 260) * 1.2;
    this.ctx.strokeStyle = 'rgba(180, 130, 70, 0.22)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.ellipse(pScreenX + 12, pScreenY + 24, pRingRad, pRingRad * 0.45, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    // Miner Sprite
    let spriteKey = `miner_${this.player.dir}_${this.player.animFrame}`;
    if (this.player.isMining) {
      spriteKey = `miner_${this.player.dir}_swing`;
    }
    this.ctx.drawImage(window.spriteManager.get(spriteKey), pScreenX - 4, pScreenY - 6);

    // Floating "▼ YOU" indicator above miner — clean, readable, single line, honey-gold
    this.ctx.fillStyle = '#f5c660';
    this.ctx.font = '7px "Press Start 2P"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('▼ YOU', pScreenX + 12, pScreenY - 10 + Math.sin(Date.now() / 280) * 1.5);

    // 7. Particles
    this.particles.draw(this.ctx, this.camera);

    // 8. Dynamic Atmospheric Cave Lighting
    // darkOpacity: 0.16 — balanced, comfortable, beautiful ambient lighting throughout the cave
    this.lighting.render(this.ctx, this.camera, this.lights, 0.16);

    this.ctx.restore();
  }

  gameLoop(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    this.update(dt);
    this.render();

    requestAnimationFrame(t => this.gameLoop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
