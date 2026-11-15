/**
 * Data Miner: The Treasure Hunt - Illustrated Adventure Cave Sprite Generator
 * Handcrafted 2D canvas illustrated sprites matching the rich underground aesthetic:
 *   - Rich warm orange-brown and sandy terracotta cave soil with moss & pebbles
 *   - Illustrated warm oak and walnut wooden plank obstacles with grain & 3D bevels
 *   - Natural layered rocky cave perimeter walls with embedded sparkling crystals
 *   - Faceted crystal mineral deposits (ruby, emerald, diamond, gold, amethyst)
 *   - Adventure expedition data terminal (holographic cyan laptop)
 *   - Arched wooden & gold treasure chest with radiant golden glow
 *   - Illustrated miner character with hardhat, overalls & backpack
 */

class SpriteManager {
  constructor() {
    this.sprites = {};
    this.tileSize = 32;
    this.generateAll();
  }

  createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    return { canvas: c, ctx: ctx };
  }

  generateAll() {
    this.generateTiles();
    this.generateMiner();
    this.generateMinerals();
    this.generateObjects();
  }

  // =========================================================================
  // 1. TERRAIN, SOIL & OBSTACLES (RICH TERRACOTTA SOIL & ILLUSTRATED WOOD)
  // =========================================================================
  generateTiles() {
    const size = this.tileSize; // 32

    function seededRng(seed) {
      let s = (seed ^ 0xdeadbeef) >>> 0;
      return function () {
        s = Math.imul(s, 1664525) + 1013904223 >>> 0;
        return s / 0x100000000;
      };
    }

    // ── Base Soil Texture Generator (Warm Orange-Brown & Terracotta) ─────
    // Seamless, rich, warm underground soil with organic variation and fine grain.
    const buildSoilBase = (rng) => {
      const { canvas, ctx } = this.createCanvas(size, size);

      // Base warm terracotta
      ctx.fillStyle = '#b66934';
      ctx.fillRect(0, 0, size, size);

      // Organic soil tones: warm orange-brown, earthy terracotta, sandy ochre
      const soilShades = [
        '#a45b29',  // rich terracotta shadow
        '#c5783f',  // warm golden brown
        '#d4864b',  // soft sandy highlight
        '#b86e36',  // warm mid-tone
        '#9e5322',  // deeper earthy cleft
        '#cc8044'   // sunlit amber clay
      ];

      // Soft, blending organic soil patches for natural non-grid look
      for (let i = 0; i < 22; i++) {
        const cx = rng() * size;
        const cy = rng() * size;
        const rx = 3.0 + rng() * 6.0;
        const ry = 2.0 + rng() * 5.0;
        ctx.fillStyle = soilShades[Math.floor(rng() * soilShades.length)];
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, rng() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }

      // Very subtle soil grain texture (fine micro-grains)
      const grains = ['#8d481b', '#deb079'];
      for (let i = 0; i < 14; i++) {
        const gx = Math.floor(rng() * size);
        const gy = Math.floor(rng() * size);
        ctx.fillStyle = grains[Math.floor(rng() * grains.length)];
        ctx.fillRect(gx, gy, 1, 1);
      }

      return { canvas, ctx };
    };

    // Helper: Draw smooth rounded river pebble
    function drawPebble(ctx, cx, cy, rx, ry, angle, colBase, colHl) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      // Soft drop shadow
      ctx.fillStyle = 'rgba(70, 35, 15, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0.5, 1, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      // Stone body
      ctx.fillStyle = colBase;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      // Upper highlight
      ctx.fillStyle = colHl;
      ctx.beginPath();
      ctx.ellipse(-rx * 0.25, -ry * 0.25, rx * 0.45, ry * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ── Floor 0: Natural Cave Soil (Warm Terracotta Bedrock) ──────────────
    {
      const rng = seededRng(42);
      const { canvas, ctx } = buildSoilBase(rng);

      // Subtle smooth pebbles blending into the soil
      drawPebble(ctx, 7, 8, 2.0, 1.4, 0.3, '#8e5630', '#c8926a');
      drawPebble(ctx, 23, 21, 1.8, 1.2, -0.4, '#965e38', '#cca078');

      this.sprites['floor_0'] = canvas;
      this.sprites['floor']   = canvas;
    }

    // ── Floor 1: Gravel & River Silt (Smooth River Stones) ────────────────
    {
      const rng = seededRng(137);
      const { canvas, ctx } = buildSoilBase(rng);

      // Several smooth river pebbles
      drawPebble(ctx, 6, 7, 2.4, 1.6, 0.2, '#88502c', '#c48a64');
      drawPebble(ctx, 22, 9, 2.2, 1.5, -0.5, '#925a34', '#cca07c');
      drawPebble(ctx, 11, 23, 1.9, 1.3, 0.6, '#7e4624', '#b87c58');
      drawPebble(ctx, 25, 23, 2.0, 1.4, -0.2, '#8c542e', '#c4906c');

      this.sprites['floor_1'] = canvas;
    }

    // ── Floor 2: Natural Earth Fissure (Dry Terracotta Crack) ─────────────
    {
      const rng = seededRng(293);
      const { canvas, ctx } = buildSoilBase(rng);

      const cracks = [
        [[4, 5], [9, 11], [14, 13], [19, 12], [24, 16]],
        [[14, 13], [16, 21], [18, 27]]
      ];
      // Dark fissure groove
      ctx.strokeStyle = '#683315';
      ctx.lineWidth = 1.0;
      ctx.lineCap = 'round';
      for (const pts of cracks) {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          const mx = (pts[i - 1][0] + pts[i][0]) / 2 + (rng() - 0.5) * 1.5;
          const my = (pts[i - 1][1] + pts[i][1]) / 2 + (rng() - 0.5) * 1.5;
          ctx.quadraticCurveTo(mx, my, pts[i][0], pts[i][1]);
        }
        ctx.stroke();
      }
      // Warm sandy highlight ridge
      ctx.strokeStyle = '#deb079';
      ctx.lineWidth = 0.5;
      for (const pts of cracks) {
        ctx.beginPath();
        ctx.moveTo(pts[0][0] + 0.6, pts[0][1] + 0.6);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i][0] + 0.6, pts[i][1] + 0.6);
        }
        ctx.stroke();
      }

      this.sprites['floor_2'] = canvas;
    }

    // ── Floor 3: Cave Moss & Lichen (Lush Organic Green Patches) ──────────
    {
      const rng = seededRng(511);
      const { canvas, ctx } = buildSoilBase(rng);

      // Lush moss clumps like in the reference image
      const mossClusters = [
        { cx: 10, cy: 9,  radii: [[0,0,5,3.5], [-2,2,3.5,2.5], [3,1,4,2.8]] },
        { cx: 22, cy: 21, radii: [[0,0,4.5,3], [2,-2,3.5,2], [-2,2,3,2]] }
      ];

      for (const cl of mossClusters) {
        for (const [dx, dy, rx, ry] of cl.radii) {
          ctx.fillStyle = 'rgba(74, 108, 34, 0.45)';
          ctx.beginPath();
          ctx.ellipse(cl.cx + dx, cl.cy + dy, rx, ry, rng() * Math.PI, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(102, 142, 46, 0.40)';
          ctx.beginPath();
          ctx.ellipse(cl.cx + dx - 0.5, cl.cy + dy - 0.5, rx * 0.7, ry * 0.7, rng() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Bright moss spores
      ctx.fillStyle = '#8fad38';
      ctx.fillRect(9, 8, 1, 1);
      ctx.fillRect(12, 10, 1, 1);
      ctx.fillRect(21, 20, 1, 1);

      this.sprites['floor_3'] = canvas;
    }

    // ── Floor Detail: Spiral Ammonite Fossil (Carved in Stone) ────────────
    {
      const rng = seededRng(777);
      const { canvas, ctx } = buildSoilBase(rng);

      const cx = 16, cy = 16;
      ctx.strokeStyle = '#7c401c';
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';

      for (let arm = 0; arm < 2; arm++) {
        ctx.beginPath();
        for (let t = 0; t <= Math.PI * 3.2; t += 0.08) {
          const r = 1.2 + t * 1.5;
          const angle = t + arm * Math.PI;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Warm golden sandstone highlight along spiral ridges
      ctx.strokeStyle = 'rgba(235, 190, 125, 0.55)';
      ctx.lineWidth = 0.6;
      for (let arm = 0; arm < 2; arm++) {
        ctx.beginPath();
        for (let t = 0; t <= Math.PI * 3.2; t += 0.1) {
          const r = 1.7 + t * 1.5;
          const angle = t + arm * Math.PI;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      this.sprites['floor_detail'] = canvas;
    }

    // ── Inner Maze Obstacle: Realistic Illustrated Wooden Planks ──────────
    // Features warm oak and walnut planks, wood grain, plank joints, knots,
    // beveled golden highlights, and depth shading (matching reference image!).
    {
      const rng = seededRng(888);
      const { canvas, ctx } = this.createCanvas(size, size);

      // Deep walnut outline
      ctx.fillStyle = '#442512';
      ctx.fillRect(0, 0, size, size);

      // 3 Stacked horizontal planks
      const planks = [
        { y: 1,  h: 9,  base: '#9e6234', topHl: '#cca46a', midHl: '#b67a48', botSh: '#623518' },
        { y: 11, h: 10, base: '#8e5428', topHl: '#be945c', midHl: '#a46838', botSh: '#542a10' },
        { y: 22, h: 9,  base: '#985c2e', topHl: '#c49a62', midHl: '#ac7040', botSh: '#5a3014' }
      ];

      for (const plank of planks) {
        // Plank body
        ctx.fillStyle = plank.base;
        ctx.fillRect(1, plank.y, size - 2, plank.h);

        // Natural curved horizontal wood-grain lines
        const grainCount = 3 + Math.floor(rng() * 2);
        for (let g = 0; g < grainCount; g++) {
          const gy = plank.y + 1.8 + (rng() * (plank.h - 3.6));
          const bulge = (rng() - 0.5) * 2.5;
          ctx.strokeStyle = `rgba(220, 160, 95, ${0.22 + rng() * 0.20})`;
          ctx.lineWidth = 0.6 + rng() * 0.3;
          ctx.beginPath();
          ctx.moveTo(1, gy);
          ctx.quadraticCurveTo(size / 2, gy + bulge, size - 1, gy + (rng() - 0.5) * 1.5);
          ctx.stroke();
        }

        // Top edge bevel highlight (golden oak warmth)
        ctx.fillStyle = plank.topHl;
        ctx.fillRect(1, plank.y, size - 2, 1);

        // Bottom groove shadow (dark walnut crevice)
        ctx.fillStyle = plank.botSh;
        ctx.fillRect(1, plank.y + plank.h - 1, size - 2, 1);
      }

      // Natural wood knot in center plank
      const kx = 12 + Math.floor(rng() * 8);
      const ky = 16;
      ctx.strokeStyle = '#4e2810';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.ellipse(kx, ky, 2.5, 1.8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#824820';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.ellipse(kx, ky, 1.2, 0.8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Side plank bevels for 3D wood block look
      ctx.fillStyle = 'rgba(230, 175, 105, 0.30)';
      ctx.fillRect(1, 1, 1, size - 2);
      ctx.fillStyle = 'rgba(40, 20, 8, 0.35)';
      ctx.fillRect(size - 2, 1, 1, size - 2);

      this.sprites['wall'] = canvas;
      this.sprites['wall_wood'] = canvas;
    }

    // ── Outer Boundary: Layered Natural Cave Rock Walls ───────────────────
    // Used exclusively for the perimeter boundaries of the cavern.
    // Features chiseled rock strata, warm ochre highlights, and crystal pockets.
    {
      const rng = seededRng(999);
      const { canvas, ctx } = this.createCanvas(size, size);

      // Deep subterranean basalt base
      ctx.fillStyle = '#2e1c14';
      ctx.fillRect(0, 0, size, size);

      // Chiseled rocky brown boulder facets
      ctx.fillStyle = '#4e3020';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(size, 0);
      ctx.lineTo(size - 3, size);
      ctx.lineTo(2, size);
      ctx.closePath();
      ctx.fill();

      // Rock strata layers
      ctx.fillStyle = '#5c3926';
      ctx.beginPath();
      ctx.moveTo(3, 4);
      ctx.lineTo(size - 4, 3);
      ctx.lineTo(size - 6, 15);
      ctx.lineTo(5, 16);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#6e442d';
      ctx.beginPath();
      ctx.moveTo(6, 18);
      ctx.lineTo(size - 5, 17);
      ctx.lineTo(size - 3, 29);
      ctx.lineTo(4, 30);
      ctx.closePath();
      ctx.fill();

      // Warm ochre chiseled rock highlights
      ctx.strokeStyle = '#9c6442';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(3, 3);
      ctx.lineTo(size - 4, 2);
      ctx.moveTo(5, 17);
      ctx.lineTo(size - 5, 16);
      ctx.stroke();

      // Deep shadowy crevices
      ctx.strokeStyle = '#1e1008';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(2, 16);
      ctx.lineTo(size - 2, 16);
      ctx.moveTo(14, 0);
      ctx.lineTo(13, 16);
      ctx.stroke();

      // Embedded crystal flecks in the rock face
      ctx.fillStyle = '#c084fc'; // amethyst glint
      ctx.fillRect(8, 8, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, 8, 1, 1);

      ctx.fillStyle = '#38bdf8'; // diamond glint
      ctx.fillRect(22, 23, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(23, 23, 1, 1);

      this.sprites['wall_rock'] = canvas;
    }

    // ── Secret Wall: Wooden Barrier with Glowing Golden Runic Crack ───────
    {
      const { canvas, ctx } = this.createCanvas(size, size);
      ctx.drawImage(this.sprites['wall_wood'], 0, 0);

      // Branching golden runic fissure (like in Image 1 at (11,12))
      const fissures = [
        { pts: [[14, 3], [15, 9], [13, 14], [16, 18], [15, 24], [16, 30]] },
        { pts: [[13, 14], [8, 15], [4, 18]] },
        { pts: [[16, 18], [21, 17], [26, 19]] }
      ];

      // Golden radiance
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      for (const f of fissures) {
        ctx.beginPath();
        ctx.moveTo(f.pts[0][0], f.pts[0][1]);
        for (let i = 1; i < f.pts.length; i++) ctx.lineTo(f.pts[i][0], f.pts[i][1]);
        ctx.stroke();
      }

      // Bright warm core
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.2;
      for (const f of fissures) {
        ctx.beginPath();
        ctx.moveTo(f.pts[0][0], f.pts[0][1]);
        for (let i = 1; i < f.pts.length; i++) ctx.lineTo(f.pts[i][0], f.pts[i][1]);
        ctx.stroke();
      }

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 0.6;
      for (const f of fissures) {
        ctx.beginPath();
        ctx.moveTo(f.pts[0][0], f.pts[0][1]);
        for (let i = 1; i < f.pts.length; i++) ctx.lineTo(f.pts[i][0], f.pts[i][1]);
        ctx.stroke();
      }

      this.sprites['secret_wall'] = canvas;
    }
  }

  // =========================================================================
  // 2. MINER CHARACTER (ADVENTURER EXPLORER MATCHING THE CAVERN STYLE)
  // =========================================================================
  generateMiner() {
    const size = this.tileSize;
    const directions = ['down', 'up', 'left', 'right'];

    directions.forEach(dir => {
      for (let frame = 0; frame < 2; frame++) {
        const { canvas, ctx } = this.createCanvas(size, size);

        // Soft floor drop shadow
        ctx.fillStyle = 'rgba(60, 30, 15, 0.40)';
        ctx.beginPath();
        ctx.ellipse(size / 2, size - 3, 7.5, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Leather Sturdy Boots
        ctx.fillStyle = '#2e180c';
        if (dir === 'left' || dir === 'right') {
          ctx.fillRect(11, 24, 4, 5);
          ctx.fillRect(17, 24 - (frame ? 2 : 0), 4, 5);
        } else {
          ctx.fillRect(10 + (frame ? 1 : 0), 24, 4, 5);
          ctx.fillRect(18 - (frame ? 1 : 0), 24, 4, 5);
        }

        // Blue Explorer Dungarees / Work Pants
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(11, 16, 10, 9);
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(15, 18, 2, 7); // Center seam

        // Brown Leather Tool Belt with Brass Buckle
        ctx.fillStyle = '#6b3e1c';
        ctx.fillRect(11, 16, 10, 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(15, 16, 2, 2);

        // Flannel Explorer Shirt
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(9, 13, 14, 4);

        // Face & Skin
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(11, 8, 10, 6);

        // Face details based on direction
        if (dir === 'down') {
          // Eyes
          ctx.fillStyle = '#1e1008';
          ctx.fillRect(13, 10, 2, 2);
          ctx.fillRect(17, 10, 2, 2);
          // Friendly explorer beard
          ctx.fillStyle = '#78350f';
          ctx.fillRect(12, 12, 8, 3);
        } else if (dir === 'left') {
          ctx.fillStyle = '#1e1008';
          ctx.fillRect(12, 10, 2, 2);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(11, 12, 4, 3);
        } else if (dir === 'right') {
          ctx.fillStyle = '#1e1008';
          ctx.fillRect(18, 10, 2, 2);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(17, 12, 4, 3);
        } else if (dir === 'up') {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(11, 8, 10, 6); // Brown hair from back
        }

        // Golden Explorer Safety Helmet
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(9, 4, 14, 5);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(10, 3, 12, 2);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(8, 7, 16, 2); // Brim

        // Brass Headlamp with Warm LED Lens
        if (dir !== 'up') {
          const lampX = dir === 'left' ? 9 : (dir === 'right' ? 20 : 15);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(lampX - 1, 3, 4, 4);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(lampX, 4, 2, 2);
        }

        // Steel Pickaxe in Hand
        if (dir === 'right') {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(21, 14, 2, 9);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(19, 12, 8, 3);
        } else if (dir === 'left') {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(9, 14, 2, 9);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(5, 12, 8, 3);
        }

        this.sprites[`miner_${dir}_${frame}`] = canvas;
      }

      // Swing Animation Frame
      {
        const { canvas, ctx } = this.createCanvas(size, size);
        ctx.drawImage(this.sprites[`miner_${dir}_0`], 0, 0);

        // Warm golden swing trail
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        if (dir === 'right') ctx.arc(22, 16, 11, -Math.PI / 3, Math.PI / 3);
        else if (dir === 'left') ctx.arc(10, 16, 11, (Math.PI * 2) / 3, (Math.PI * 4) / 3);
        else if (dir === 'down') ctx.arc(16, 22, 11, 0, Math.PI);
        else ctx.arc(16, 8, 11, Math.PI, 0);
        ctx.stroke();

        this.sprites[`miner_${dir}_swing`] = canvas;
      }
    });
  }

  // =========================================================================
  // 3. MINERALS & COLLECTIBLE GEMS (FACETED CRYSTAL FORMATIONS)
  // =========================================================================
  // NO square face blocks or computer screens. Pure, beautiful natural crystal clusters!
  generateMinerals() {
    const size = this.tileSize;

    const orePalette = {
      ruby:     { base: '#991b1b', main: '#e11d48', glow: '#fb7185', hl: '#ffffff' },
      emerald:  { base: '#065f46', main: '#059669', glow: '#34d399', hl: '#ffffff' },
      diamond:  { base: '#0369a1', main: '#0ea5e9', glow: '#38bdf8', hl: '#ffffff' },
      gold:     { base: '#92400e', main: '#d97706', glow: '#fbbf24', hl: '#ffffff' },
      amethyst: { base: '#6b21a8', main: '#9333ea', glow: '#c084fc', hl: '#ffffff' }
    };

    for (const [ore, pal] of Object.entries(orePalette)) {
      const { canvas, ctx } = this.createCanvas(size, size);

      // Soft ground shadow beneath crystal formation
      ctx.fillStyle = 'rgba(60, 30, 15, 0.40)';
      ctx.beginPath();
      ctx.ellipse(16, 25, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Earthy rock plinth where crystals sprout
      ctx.fillStyle = '#623e25';
      ctx.beginPath();
      ctx.ellipse(16, 24, 8, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- Left Crystal Shard (Sprouting angled left) ---
      ctx.fillStyle = pal.base;
      ctx.beginPath();
      ctx.moveTo(9, 11);
      ctx.lineTo(6, 23);
      ctx.lineTo(11, 23);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = pal.main;
      ctx.beginPath();
      ctx.moveTo(9, 11);
      ctx.lineTo(11, 23);
      ctx.lineTo(13, 21);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = pal.glow;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(9, 11);
      ctx.lineTo(11, 23);
      ctx.stroke();

      // --- Right Crystal Shard (Sprouting angled right) ---
      ctx.fillStyle = pal.base;
      ctx.beginPath();
      ctx.moveTo(23, 13);
      ctx.lineTo(19, 23);
      ctx.lineTo(25, 23);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = pal.main;
      ctx.beginPath();
      ctx.moveTo(23, 13);
      ctx.lineTo(21, 23);
      ctx.lineTo(26, 21);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = pal.glow;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(23, 13);
      ctx.lineTo(21, 23);
      ctx.stroke();

      // --- Main Central Towering Crystal Prism ---
      // Left/dark facet
      ctx.fillStyle = pal.base;
      ctx.beginPath();
      ctx.moveTo(16, 4);
      ctx.lineTo(11, 24);
      ctx.lineTo(16, 24);
      ctx.closePath();
      ctx.fill();

      // Right/bright facet
      ctx.fillStyle = pal.main;
      ctx.beginPath();
      ctx.moveTo(16, 4);
      ctx.lineTo(16, 24);
      ctx.lineTo(21, 24);
      ctx.closePath();
      ctx.fill();

      // Inner glowing core facet
      ctx.fillStyle = pal.glow;
      ctx.beginPath();
      ctx.moveTo(16, 6);
      ctx.lineTo(14, 21);
      ctx.lineTo(17, 21);
      ctx.closePath();
      ctx.fill();

      // Central sharp crystal ridge highlight
      ctx.strokeStyle = pal.hl;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(16, 4);
      ctx.lineTo(16, 24);
      ctx.stroke();

      // Sparkling tip glints
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(15, 5, 2, 2);
      ctx.fillRect(9, 12, 1, 1);
      ctx.fillRect(22, 14, 1, 1);

      this.sprites[`ore_${ore}`] = canvas;
    }

    // Volatile Explosive Nitrogem Rock (Level 4 Hazard) — Jagged volcanic crystal geode
    {
      const { canvas, ctx } = this.createCanvas(size, size);

      ctx.fillStyle = 'rgba(60, 30, 15, 0.40)';
      ctx.beginPath();
      ctx.ellipse(16, 25, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dark basalt stone base
      ctx.fillStyle = '#3e2014';
      ctx.beginPath();
      ctx.ellipse(16, 23, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Jagged molten magma shards
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(16, 5);
      ctx.lineTo(7, 23);
      ctx.lineTo(25, 23);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(16, 7);
      ctx.lineTo(10, 22);
      ctx.lineTo(22, 22);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(16, 11);
      ctx.lineTo(13, 20);
      ctx.lineTo(19, 20);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(15, 13, 2, 3);

      this.sprites['hazard_rock'] = canvas;
    }

    // Celestial Star Diamond (Mythic Treasure) — Brilliant multi-faceted diamond star
    {
      const { canvas, ctx } = this.createCanvas(size, size);

      ctx.fillStyle = 'rgba(60, 30, 15, 0.40)';
      ctx.beginPath();
      ctx.ellipse(16, 26, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(16, 3);
      ctx.lineTo(27, 12);
      ctx.lineTo(16, 27);
      ctx.lineTo(5, 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(16, 3);
      ctx.lineTo(23, 12);
      ctx.lineTo(16, 25);
      ctx.lineTo(9, 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.moveTo(16, 6);
      ctx.lineTo(20, 12);
      ctx.lineTo(16, 22);
      ctx.lineTo(12, 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(15, 8, 2, 8);
      ctx.fillRect(12, 11, 8, 2);

      this.sprites['celestial_diamond'] = canvas;
    }
  }

  // =========================================================================
  // 4. INTERACTIVE OBJECTS (TERMINAL, CHEST, COIN, ENERGY)
  // =========================================================================
  generateObjects() {
    const size = this.tileSize;

    // 1. Ancient Data Terminal (Illustrated Expedition Rugged Holographic Laptop)
    // Matches Image 1: Laptop on plinth with glowing cyan display and side holographic wings
    {
      const { canvas, ctx } = this.createCanvas(size, size);

      // Shadow
      ctx.fillStyle = 'rgba(60, 30, 15, 0.40)';
      ctx.beginPath();
      ctx.ellipse(16, 28, 13, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Heavy bronze/copper plinth base
      ctx.fillStyle = '#4c2e18';
      ctx.fillRect(4, 24, 24, 5);
      ctx.fillStyle = '#6b4022';
      ctx.fillRect(5, 23, 22, 2);

      // Laptop keyboard deck (dark gunmetal/copper chassis)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(5, 17, 22, 7);
      ctx.fillStyle = '#334155';
      ctx.fillRect(6, 18, 20, 5);

      // Backlit keyboard rows
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(7, 19, 18, 1);
      ctx.fillRect(7, 21, 18, 1);

      // Open angled holographic screen housing
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(6, 6, 20, 12);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.strokeRect(6.5, 6.5, 19, 11);

      // Glowing Cyan Display Buffer
      ctx.fillStyle = '#0891b2';
      ctx.fillRect(8, 8, 16, 8);

      // Telemetry waveforms & chart bars
      ctx.fillStyle = '#ecfeff';
      ctx.fillRect(9, 10, 5, 2);
      ctx.fillRect(9, 13, 8, 1);
      ctx.fillRect(19, 9, 3, 4); // Bar graph
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(15, 11, 2, 3);

      // Left Holographic Fin Emitter
      ctx.fillStyle = 'rgba(6, 182, 212, 0.70)';
      ctx.beginPath();
      ctx.moveTo(5, 8);
      ctx.lineTo(2, 5);
      ctx.lineTo(2, 13);
      ctx.lineTo(5, 15);
      ctx.closePath();
      ctx.fill();

      // Right Holographic Fin Emitter
      ctx.beginPath();
      ctx.moveTo(27, 8);
      ctx.lineTo(30, 5);
      ctx.lineTo(30, 13);
      ctx.lineTo(27, 15);
      ctx.closePath();
      ctx.fill();

      this.sprites['data_terminal'] = canvas;
    }

    // 2. Closed Treasure Chest (Rich Aged Oak & Polished Gold Bands)
    // Matches Image 1: Beautiful wooden chest with gold hardware and padlock
    {
      const { canvas, ctx } = this.createCanvas(size, size);

      // Soft ground shadow
      ctx.fillStyle = 'rgba(60, 30, 15, 0.45)';
      ctx.beginPath();
      ctx.ellipse(16, 27, 13, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mahogany/Oak wood chest body
      ctx.fillStyle = '#5c2c12';
      ctx.fillRect(3, 10, 26, 17);
      ctx.fillStyle = '#7a3c18';
      ctx.fillRect(4, 11, 24, 15);
      ctx.fillStyle = '#944a1e';
      ctx.fillRect(5, 12, 22, 13);

      // Curved wooden chest lid top
      ctx.fillStyle = '#b45309';
      ctx.fillRect(3, 9, 26, 4);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(4, 9, 24, 2);

      // Polished Gold Corner Straps
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(3, 9, 4, 18);
      ctx.fillRect(25, 9, 4, 18);
      ctx.fillRect(3, 23, 26, 4);

      ctx.fillStyle = '#fde047';
      ctx.fillRect(4, 10, 2, 16);
      ctx.fillRect(26, 10, 2, 16);
      ctx.fillRect(4, 24, 24, 2);

      // Golden Padlock with Keyhole
      ctx.fillStyle = '#fde047';
      ctx.fillRect(13, 14, 6, 7);
      ctx.fillStyle = '#3a1a08';
      ctx.fillRect(15, 16, 2, 3);

      this.sprites['chest_closed'] = canvas;
    }

    // 3. Open Treasure Chest (Overflowing with Radiant Gold & Colorful Gems)
    {
      const { canvas, ctx } = this.createCanvas(size, size);

      ctx.fillStyle = 'rgba(60, 30, 15, 0.45)';
      ctx.beginPath();
      ctx.ellipse(16, 27, 13, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Open lid angled back
      ctx.fillStyle = '#5c2c12';
      ctx.fillRect(2, 3, 28, 7);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(2, 3, 28, 2);

      // Radiant Gold Interior
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(5, 10, 22, 8);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(8, 11, 16, 4);

      // Gold coins and gems overflowing
      ctx.fillStyle = '#facc15';
      ctx.fillRect(7, 12, 18, 5);
      ctx.fillStyle = '#e11d48'; // ruby gem
      ctx.fillRect(9, 11, 3, 3);
      ctx.fillStyle = '#0ea5e9'; // diamond gem
      ctx.fillRect(15, 10, 3, 3);
      ctx.fillStyle = '#10b981'; // emerald gem
      ctx.fillRect(20, 11, 3, 3);

      // Chest Base
      ctx.fillStyle = '#7a3c18';
      ctx.fillRect(3, 16, 26, 11);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(3, 23, 26, 4);

      this.sprites['chest_open'] = canvas;
    }

    // 4. Locked Gateway Archway (Ancient Megalith Portal)
    {
      const { canvas, ctx } = this.createCanvas(size, size);

      // Ancient stone pillars
      ctx.fillStyle = '#26160c';
      ctx.fillRect(1, 1, 30, 30);
      ctx.fillStyle = '#4c2c18';
      ctx.fillRect(1, 1, 6, 30);
      ctx.fillRect(25, 1, 6, 30);
      ctx.fillRect(1, 1, 30, 6);

      // Runic inscriptions
      ctx.fillStyle = '#d97706';
      ctx.fillRect(3, 8, 2, 4);
      ctx.fillRect(3, 16, 3, 2);
      ctx.fillRect(3, 22, 2, 4);
      ctx.fillRect(27, 8, 2, 4);
      ctx.fillRect(26, 16, 3, 2);
      ctx.fillRect(27, 22, 2, 4);

      // Iron portcullis bars
      ctx.fillStyle = '#3a2012';
      for (let x = 8; x <= 24; x += 3) {
        ctx.fillRect(x, 7, 2, 24);
      }
      ctx.fillRect(7, 15, 18, 3);
      ctx.fillRect(7, 23, 18, 3);

      this.sprites['gateway_locked'] = canvas;
    }

    // 5. Open Gateway (Swirling Golden Amber & Cyan Portal)
    {
      const { canvas, ctx } = this.createCanvas(size, size);

      ctx.fillStyle = '#26160c';
      ctx.fillRect(1, 1, 30, 30);
      ctx.fillStyle = '#4c2c18';
      ctx.fillRect(1, 1, 6, 30);
      ctx.fillRect(25, 1, 6, 30);
      ctx.fillRect(1, 1, 30, 6);

      // Swirling mystical portal vortex
      ctx.fillStyle = '#78350f';
      ctx.fillRect(7, 7, 18, 24);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(9, 9, 14, 20);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(11, 11, 10, 16);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(13, 13, 6, 12);

      this.sprites['gateway_open'] = canvas;
    }

    // 6. Gold Coin Collectible (16x16)
    {
      const { canvas, ctx } = this.createCanvas(16, 16);
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.arc(8, 8, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(8, 8, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(8, 8, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 5, 2, 2);

      this.sprites['coin'] = canvas;
    }

    // 7. Energy Power Cell (16x16) — Golden-amber power rune capsule
    {
      const { canvas, ctx } = this.createCanvas(16, 16);

      // Rounded brass/gold casing
      ctx.fillStyle = '#6b3810';
      ctx.beginPath();
      ctx.arc(8, 8, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(8, 8, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(8, 8, 4, 0, Math.PI * 2);
      ctx.fill();

      // Electric Lightning Bolt
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(9, 2.5);
      ctx.lineTo(5, 7.5);
      ctx.lineTo(8, 7.5);
      ctx.lineTo(7, 13.5);
      ctx.lineTo(11, 7.5);
      ctx.lineTo(8, 7.5);
      ctx.closePath();
      ctx.fill();

      this.sprites['energy_pack'] = canvas;
    }
  }

  get(name) {
    return this.sprites[name] || this.sprites['floor_0'] || this.sprites['floor'];
  }
}

window.spriteManager = new SpriteManager();
