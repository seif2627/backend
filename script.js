const promptInput = document.getElementById('prompt');
const styleOptions = document.querySelectorAll('#style-options .chip');
const ratioSelect = document.getElementById('ratio');
const resolutionSelect = document.getElementById('resolution');
const seedInput = document.getElementById('seed');
const generateBtn = document.getElementById('generate-btn');
const outputPanel = document.getElementById('output-panel');
const placeholder = document.getElementById('placeholder');
const resultSection = document.getElementById('result');
const resultImg = document.getElementById('result-img');
const resultPrompt = document.getElementById('result-prompt');
const resultStyle = document.getElementById('result-style');
const resultRatio = document.getElementById('result-ratio');
const resultRes = document.getElementById('result-res');
const resultSeed = document.getElementById('result-seed');
const statusFill = document.getElementById('status-fill');
const saveBtn = document.getElementById('save-btn');
const downloadBtn = document.getElementById('download-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const galleryGrid = document.getElementById('gallery-grid');
const shuffleBtn = document.getElementById('shuffle-btn');
const clearBtn = document.getElementById('clear-btn');
const presets = document.querySelectorAll('.preset');
const styleGrid = document.getElementById('style-grid');
const filterInput = document.getElementById('filter-input');
const faqAccordion = document.getElementById('faq-accordion');

const placeholderImages = [
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80'
];

const stylePreviews = [
  { title: 'Realistic', img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Cinematic', img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Illustration', img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Anime', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80' },
  { title: '3D Render', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Pixel Art', img: 'https://images.unsplash.com/photo-1505238680356-667803448bb6?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Noir', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Watercolor', img: 'https://images.unsplash.com/photo-1453227588063-bb302b62f50b?auto=format&fit=crop&w=1200&q=80' },
];

const galleryState = [];

function chooseRandomPlaceholder() {
  const index = Math.floor(Math.random() * placeholderImages.length);
  return placeholderImages[index];
}

function setStyle(style) {
  styleOptions.forEach(option => option.classList.toggle('chip-selected', option.dataset.style === style));
}

styleOptions.forEach(option => {
  option.addEventListener('click', () => setStyle(option.dataset.style));
});

presets.forEach(preset => {
  preset.addEventListener('click', () => {
    promptInput.value = preset.dataset.prompt;
    promptInput.focus();
  });
});

function simulateProgress() {
  let progress = 0;
  statusFill.style.width = '0%';
  const interval = setInterval(() => {
    progress += Math.random() * 18;
    statusFill.style.width = `${Math.min(progress, 100)}%`;
    if (progress >= 100) {
      clearInterval(interval);
    }
  }, 220);
}

function renderResult(imageUrl, prompt, style, ratio, resolution, seed) {
  placeholder.classList.add('hidden');
  resultSection.classList.remove('hidden');
  resultImg.src = imageUrl;
  resultPrompt.textContent = prompt;
  resultStyle.textContent = style;
  resultRatio.textContent = ratio;
  resultRes.textContent = `${resolution}px`;
  resultSeed.textContent = seed ? `Seed ${seed}` : 'Random seed';
  resultSeed.dataset.seed = seed || '';
  simulateProgress();
}

function generateImage(event) {
  event.preventDefault();
  const prompt = promptInput.value.trim() || 'A majestic placeholder scene with vibrant colors and dramatic lighting';
  const style = [...styleOptions].find(option => option.classList.contains('chip-selected'))?.dataset.style || 'Realistic';
  const ratio = ratioSelect.value;
  const resolution = resolutionSelect.value;
  const seed = seedInput.value.trim();
  const resolvedSeed = seed || Math.floor(Math.random() * 90000 + 10000).toString();
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';
  resultSection.classList.add('hidden');
  placeholder.classList.remove('hidden');
  simulateProgress();

  setTimeout(() => {
    const imageUrl = `${chooseRandomPlaceholder()}&timestamp=${Date.now()}`;
    renderResult(imageUrl, prompt, style, ratio, resolution, resolvedSeed);
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate';
  }, 1800);
}

document.getElementById('create-form').addEventListener('submit', generateImage);

function addToGallery(entry) {
  galleryState.unshift(entry);
  renderGallery();
}

function renderGallery() {
  galleryGrid.innerHTML = '';
  galleryState.forEach((item, index) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.innerHTML = `
      <img src="${item.image}" alt="${item.prompt}">
      <div class="tile-body">
        <p>${item.prompt}</p>
        <div class="badge-row">
          <span class="chip chip-soft">${item.style}</span>
          <span class="chip chip-soft">${item.ratio}</span>
          <span class="chip chip-soft">${item.res}px</span>
          <span class="chip chip-soft">${item.seed === 'Random' ? 'Random seed' : `Seed ${item.seed}`}</span>
        </div>
        <div class="badge-row">
          <button class="btn btn-ghost" data-index="${index}" data-action="rerun">Rerun</button>
          <button class="btn btn-primary" data-index="${index}" data-action="duplicate">Duplicate</button>
        </div>
      </div>
    `;
    galleryGrid.appendChild(tile);
  });
}

saveBtn.addEventListener('click', () => {
  const prompt = resultPrompt.textContent;
  if (!prompt) return;
  const entry = {
    prompt,
    style: resultStyle.textContent,
    ratio: resultRatio.textContent,
    res: resultRes.textContent.replace('px', ''),
    seed: resultSeed.dataset.seed || 'Random',
    image: resultImg.src,
  };
  addToGallery(entry);
});

shuffleBtn.addEventListener('click', () => {
  for (let i = galleryState.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [galleryState[i], galleryState[j]] = [galleryState[j], galleryState[i]];
  }
  renderGallery();
});

clearBtn.addEventListener('click', () => {
  galleryState.length = 0;
  renderGallery();
});

galleryGrid.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const { index, action } = button.dataset;
  const entry = galleryState[Number(index)];
  if (!entry) return;
  if (action === 'rerun') {
    promptInput.value = entry.prompt;
    setStyle(entry.style);
    ratioSelect.value = entry.ratio;
    resolutionSelect.value = entry.res;
    seedInput.value = entry.seed === 'Random' ? '' : entry.seed;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (action === 'duplicate') {
    const duplicate = { ...entry, image: `${entry.image}&copy=${Date.now()}` };
    addToGallery(duplicate);
  }
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = resultImg.src || chooseRandomPlaceholder();
  link.download = 'dreamcanvas-placeholder.png';
  link.click();
});

favoriteBtn.addEventListener('click', () => {
  favoriteBtn.textContent = favoriteBtn.textContent.includes('Added') ? 'Add to favorites' : 'Added to favorites';
});

function renderStyleGrid(filter = '') {
  styleGrid.innerHTML = '';
  stylePreviews
    .filter(item => item.title.toLowerCase().includes(filter.toLowerCase()))
    .forEach(item => {
      const card = document.createElement('div');
      card.className = 'style-card';
      card.innerHTML = `
        <img src="${item.img}" alt="${item.title} preview">
        <div class="info">
          <div>
            <strong>${item.title}</strong>
            <p class="tiny">Tap to apply style</p>
          </div>
          <button class="btn btn-ghost" data-style="${item.title}">Use</button>
        </div>
      `;
      card.querySelector('button').addEventListener('click', () => setStyle(item.title));
      styleGrid.appendChild(card);
    });
}

filterInput.addEventListener('input', event => renderStyleGrid(event.target.value));
renderStyleGrid();

function setupAccordion() {
  faqAccordion.querySelectorAll('.accordion-item').forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      item.classList.toggle('open');
    });
  });
}

setupAccordion();

// initialize with a default generation
renderResult(chooseRandomPlaceholder(), 'A serene digital landscape with soft fog and glowing towers', 'Realistic', '16:9', '1024', '4312');
