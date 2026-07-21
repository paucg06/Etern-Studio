/* ==========================================================================
   Etern Studio - OS Detection, Direct Download & Category Filtering Engine
   ========================================================================== */

const REPO_OWNER = 'paucg06';
const REPO_NAME = 'Etern-Notes';
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

// Direct download URL mappings
const DOWNLOAD_URLS = {
  windows: `${REPO_URL}/releases/latest/download/EternNotes-Windows-x64.exe`,
  linux: `${REPO_URL}/releases/latest/download/EternNotes-Linux-x64`,
  mac_arm: `${REPO_URL}/releases/latest/download/EternNotes-macOS-AppleSilicon`,
  mac_intel: `${REPO_URL}/releases/latest/download/EternNotes-macOS-Intel`,
  fallback: `${REPO_URL}/releases`
};

// OS Detection Engine
function detectOS() {
  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();

  if (platform.includes('win') || ua.includes('windows')) {
    return {
      key: 'windows',
      name: 'Windows',
      icon: '🪟',
      detail: '64-bit Executable (.exe)',
      url: DOWNLOAD_URLS.windows
    };
  }

  if (platform.includes('mac') || ua.includes('macintosh') || ua.includes('mac os')) {
    const isAppleSilicon = ua.includes('mac os x') && (navigator.maxTouchPoints > 0 || (window.screen && window.screen.width > 0 && navigator.hardwareConcurrency >= 8));
    if (isAppleSilicon) {
      return {
        key: 'mac_arm',
        name: 'macOS (Apple Silicon M1/M2/M3/M4)',
        icon: '🍎',
        detail: 'Universal macOS Binary',
        url: DOWNLOAD_URLS.mac_arm
      };
    } else {
      return {
        key: 'mac_intel',
        name: 'macOS (Intel)',
        icon: '🍎',
        detail: 'Intel 64-bit Binary',
        url: DOWNLOAD_URLS.mac_intel
      };
    }
  }

  if (platform.includes('linux') || ua.includes('linux') || ua.includes('ubuntu') || ua.includes('debian')) {
    return {
      key: 'linux',
      name: 'Linux / Ubuntu',
      icon: '🐧',
      detail: 'Standalone 64-bit Binary',
      url: DOWNLOAD_URLS.linux
    };
  }

  return {
    key: 'windows',
    name: 'Windows (Predeterminado)',
    icon: '🪟',
    detail: 'Standalone Executable',
    url: DOWNLOAD_URLS.windows
  };
}

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
  const userOS = detectOS();
  updateOSBanner(userOS);
  setupMainDownloadButton(userOS);
  setupCoffeeModal();
  setupCategoryFilters();
});

// Update OS Banner in Hero
function updateOSBanner(os) {
  const osIcon = document.getElementById('detected-os-icon');
  const osName = document.getElementById('detected-os-name');
  const osDetail = document.getElementById('detected-os-detail');

  if (osIcon) osIcon.textContent = os.icon;
  if (osName) osName.textContent = os.name;
  if (osDetail) osDetail.textContent = `Sistema detectado • ${os.detail}`;
}

// Setup Smart Download Button
function setupMainDownloadButton(os) {
  const btn = document.getElementById('btn-download-etern');
  const dropdown = document.getElementById('etern-os-select');

  if (btn) {
    btn.innerHTML = `${os.icon} Descargar para ${os.name}`;
    btn.href = os.url;

    btn.addEventListener('click', () => {
      showToast(`Descargando Etern-Notes para ${os.name}...`);
    });
  }

  if (dropdown) {
    dropdown.value = os.key;
    dropdown.addEventListener('change', (e) => {
      const selectedKey = e.target.value;
      const targetUrl = DOWNLOAD_URLS[selectedKey] || DOWNLOAD_URLS.fallback;
      const selectedText = dropdown.options[dropdown.selectedIndex].text;

      if (btn) {
        btn.innerHTML = `Descargar para ${selectedText}`;
        btn.href = targetUrl;
      }
    });
  }
}

// Category Filter Engine (Adobe Tab Style)
function setupCategoryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.app-card');
  const featuredCard = document.querySelector('.featured-hero-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      // Show/hide featured hero card if filter is apps or all
      if (featuredCard) {
        if (filter === 'games') {
          featuredCard.style.display = 'none';
        } else {
          featuredCard.style.display = 'grid';
        }
      }

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Coffee Modal Logic
function setupCoffeeModal() {
  const modal = document.getElementById('coffee-modal');
  const closeBtn = document.getElementById('modal-close');
  const triggers = document.querySelectorAll('.trigger-coffee');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (modal) modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}

// Toast notification (Adobe Blue Style)
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `⚡ ${message}`;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #0F172A;
    border: 1px solid #3B82F6;
    color: #FFFFFF;
    padding: 14px 22px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 14px;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.25);
    z-index: 2000;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
