/* ==========================================================================
   Etern Suite - OS Detection & Direct Download Logic
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
    // Check if M1/M2/M3 Apple Silicon or Intel
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

    // Direct download action fallback: if release not created yet, go to GitHub Releases page
    btn.addEventListener('click', (e) => {
      // Trigger smooth direct download notification
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

// Toast notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `⚡ ${message}`;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #1E293B;
    border: 1px solid #3B82F6;
    color: #F8FAFC;
    padding: 12px 20px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    z-index: 2000;
    transition: all 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
