const promptInput = document.getElementById('prompt');
const styleSelect = document.getElementById('style');
const sizeSelect = document.getElementById('size');
const guidanceRange = document.getElementById('guidance');
const guidanceValue = document.getElementById('guidanceValue');
const seedInput = document.getElementById('seed');
const paletteSelect = document.getElementById('palette');
const generateBtn = document.getElementById('generateBtn');
const form = document.getElementById('generateForm');
const galleryGrid = document.getElementById('galleryGrid');
const emptyState = document.getElementById('emptyState');
const historyList = document.getElementById('historyList');
const toast = document.getElementById('toast');
const statTotal = document.getElementById('statTotal');
const statFavorites = document.getElementById('statFavorites');
const statDownload = document.getElementById('statDownload');
const previewPrompt = document.getElementById('previewPrompt');
const previewMeta = document.getElementById('previewMeta');
const previewImage = document.getElementById('previewImage');
const startCreating = document.getElementById('startCreating');
const viewGallery = document.getElementById('viewGallery');
const filterChips = document.querySelectorAll('.filters .chip');

let generations = [];
let stats = { downloads: 0 };

guidanceRange.addEventListener('input', () => {
  guidanceValue.textContent = guidanceRange.value;
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  generateImage();
});

document.getElementById('suggestions').addEventListener('click', (e) => {
  if (e.target.classList.contains('chip')) {
    promptInput.value = e.target.textContent;
    updatePreviewText();
  }
});

document.getElementById('randomize').addEventListener('click', () => {
  const prompts = [
    'Glass greenhouse in a misty forest, glowing with lanterns',
    'Retro-futuristic subway station, neon reflections on wet tiles',
    'Isometric village floating on clouds, pastel color palette',
    'Minimalist interior with soft morning light and calm tones'
  ];
  const random = prompts[Math.floor(Math.random() * prompts.length)];
  promptInput.value = random;
  styleSelect.selectedIndex = Math.floor(Math.random() * styleSelect.options.length);
  paletteSelect.selectedIndex = Math.floor(Math.random() * paletteSelect.options.length);
  sizeSelect.selectedIndex = Math.floor(Math.random() * sizeSelect.options.length);
  guidanceRange.value = Math.floor(Math.random() * 21);
  guidanceValue.textContent = guidanceRange.value;
  updatePreviewText();
});

startCreating.addEventListener('click', () => {
  document.getElementById('creator').scrollIntoView({ behavior: 'smooth' });
});

viewGallery.addEventListener('click', () => {
  document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
});

filterChips.forEach((chip) =>
  chip.addEventListener('click', () => {
    filterChips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
    chip.setAttribute('aria-pressed', 'true');
    renderGallery();
  })
);

guidanceRange.addEventListener('input', updatePreviewText);
promptInput.addEventListener('input', updatePreviewText);
styleSelect.addEventListener('change', updatePreviewText);
sizeSelect.addEventListener('change', updatePreviewText);
paletteSelect.addEventListener('change', updatePreviewText);

function updatePreviewText() {
  previewPrompt.textContent = promptInput.value || 'Describe your masterpiece to see it appear here.';
  const sizeLabel = sizeSelect.options[sizeSelect.selectedIndex].textContent.split(' ')[0];
  previewMeta.textContent = `Style: ${styleSelect.options[styleSelect.selectedIndex].textContent} · Size: ${sizeLabel}`;
}

function generateImage() {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    showToast('Add a descriptive prompt to generate an image.');
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating…';

  setTimeout(() => {
    const entry = buildGeneration(prompt);
    generations.unshift(entry);
    renderGallery();
    renderHistory();
    updateStats();
    updatePreview(entry);
    showToast('Placeholder image generated.');
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate';
  }, 650);
}

function buildGeneration(prompt) {
  const id = crypto.randomUUID();
  const style = styleSelect.value;
  const size = sizeSelect.value;
  const palette = paletteSelect.value;
  const seed = seedInput.value || Math.floor(Math.random() * 999999);
  const guidance = Number(guidanceRange.value);
  const safe = document.getElementById('safeMode').checked;
  const turbo = document.getElementById('turboMode').checked;

  return {
    id,
    prompt,
    style,
    size,
    palette,
    seed,
    guidance,
    safe,
    turbo,
    favorite: false,
    timestamp: new Date(),
    image: createPlaceholderImage({ prompt, style, size, palette, seed })
  };
}

function createPlaceholderImage({ prompt, style, size, palette, seed }) {
  const palettes = {
    sunset: ['#ff8fb1', '#ffd166', '#845ec2'],
    forest: ['#2d6a4f', '#74c69d', '#95d5b2'],
    ocean: ['#0077b6', '#90e0ef', '#00b4d8'],
    mono: ['#0b0d13', '#1c1f2e', '#43495d'],
    candy: ['#ff6f91', '#ffc75f', '#f9f871']
  };

  const sizes = {
    square: [640, 640],
    portrait: [640, 840],
    landscape: [840, 472]
  };

  const [width, height] = sizes[size] || sizes.square;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const colors = palettes[palette];
  const rng = mulberry32(Number(seed));
  const grad = ctx.createLinearGradient(0, 0, width, height);
  colors.forEach((color, idx) => grad.addColorStop(idx / (colors.length - 1), color));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(20, 20, width - 40, height - 40);

  ctx.fillStyle = '#fff';
  ctx.font = '700 28px Manrope';
  ctx.fillText(style.toUpperCase(), 32, 56);
  ctx.font = '600 18px Manrope';
  wrapText(ctx, prompt, 32, 90, width - 64, 28);

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  return canvas.toDataURL('image/png');
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function mulberry32(a) {
  let t = a + 0x6d2b79f5;
  return function () {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function renderGallery() {
  galleryGrid.innerHTML = '';
  const activeFilter = [...filterChips].find((c) => c.getAttribute('aria-pressed') === 'true')?.dataset.filter;
  const items = generations.filter((item) => {
    if (activeFilter === 'favorite') return item.favorite;
    if (activeFilter === 'landscape') return item.size === 'landscape';
    if (activeFilter === 'portrait') return item.size === 'portrait';
    if (activeFilter === 'square') return item.size === 'square';
    return true;
  });

  emptyState.style.display = items.length ? 'none' : 'block';

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="badge">Seed ${item.seed}</div>
      <img src="${item.image}" alt="Generated placeholder for ${item.prompt}">
      <div class="card__body">
        <p class="label">${item.style} · ${item.size}</p>
        <p class="card__prompt">${item.prompt}</p>
        <div class="card__meta">
          <span>Guidance ${item.guidance}</span>
          <span>${item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="card__actions">
          <button class="btn" data-action="favorite">${item.favorite ? '★ Favorited' : '☆ Favorite'}</button>
          <button class="btn" data-action="download">Download</button>
          <button class="btn" data-action="share">Share</button>
          <button class="btn" data-action="delete">Delete</button>
        </div>
      </div>
    `;

    card.querySelectorAll('button').forEach((btn) =>
      btn.addEventListener('click', () => handleCardAction(item.id, btn.dataset.action))
    );

    galleryGrid.appendChild(card);
  });
}

function handleCardAction(id, action) {
  const entry = generations.find((g) => g.id === id);
  if (!entry) return;

  if (action === 'favorite') {
    entry.favorite = !entry.favorite;
    showToast(entry.favorite ? 'Added to favorites' : 'Removed from favorites');
  }

  if (action === 'download') {
    const link = document.createElement('a');
    link.href = entry.image;
    link.download = `${entry.prompt.slice(0, 24) || 'image'}.png`;
    link.click();
    stats.downloads += 1;
    showToast('Download started');
  }

  if (action === 'share') {
    navigator.clipboard?.writeText(entry.prompt);
    showToast('Prompt copied to clipboard');
  }

  if (action === 'delete') {
    generations = generations.filter((g) => g.id !== id);
    showToast('Generation removed');
  }

  renderGallery();
  renderHistory();
  updateStats();
}

function renderHistory() {
  historyList.innerHTML = '';
  generations.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <div>
        <p class="history-item__prompt">${item.prompt}</p>
        <p class="history-item__meta">${item.style} · ${item.size} · Seed ${item.seed}</p>
      </div>
      <div class="history-item__actions">
        <button class="btn" data-action="reuse">Reuse</button>
        <button class="btn btn-secondary" data-action="remove">Remove</button>
      </div>
    `;

    li.querySelector('[data-action="reuse"]').addEventListener('click', () => {
      promptInput.value = item.prompt;
      styleSelect.value = item.style;
      sizeSelect.value = item.size;
      paletteSelect.value = item.palette;
      guidanceRange.value = item.guidance;
      guidanceValue.textContent = item.guidance;
      seedInput.value = item.seed;
      updatePreviewText();
      document.getElementById('creator').scrollIntoView({ behavior: 'smooth' });
    });

    li.querySelector('[data-action="remove"]').addEventListener('click', () => {
      generations = generations.filter((g) => g.id !== item.id);
      renderGallery();
      renderHistory();
      updateStats();
    });

    historyList.appendChild(li);
  });
}

function updateStats() {
  statTotal.textContent = generations.length.toString();
  statFavorites.textContent = generations.filter((g) => g.favorite).length.toString();
  statDownload.textContent = stats.downloads.toString();
}

function updatePreview(entry) {
  previewImage.src = entry.image;
  previewImage.alt = `Preview for ${entry.prompt}`;
  previewPrompt.textContent = entry.prompt;
  const sizeLabel = sizeSelect.options[sizeSelect.selectedIndex].textContent.split(' ')[0];
  previewMeta.textContent = `Style: ${entry.style} · Size: ${sizeLabel}`;
}

document.getElementById('exportLog').addEventListener('click', () => {
  if (!generations.length) return showToast('No generations to export');
  const data = generations
    .map((g) => `${g.timestamp.toISOString()} — ${g.prompt} [${g.style}, ${g.size}, seed ${g.seed}]`)
    .join('\n');
  const blob = new Blob([data], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'prompt-log.txt';
  link.click();
  URL.revokeObjectURL(url);
  showToast('Prompt log exported');
});

document.getElementById('clearLog').addEventListener('click', () => {
  generations = [];
  renderGallery();
  renderHistory();
  updateStats();
  showToast('History cleared');
});

document.addEventListener('DOMContentLoaded', () => {
  updatePreviewText();
  renderGallery();
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}
