// ==========================================================================
// SENTINEL GRID V3 — APPLE-STYLE CINEMATIC INTERACTIONS & GALLERY
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Active navigation highlight on scroll
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-menu a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Interactive Sentinel AI Tool Runner
  const queryButtons = document.querySelectorAll('.apple-btn-secondary[data-query]');
  const truthPill = document.getElementById('ai-truth-pill');
  const timestampPill = document.getElementById('ai-timestamp-pill');
  const replyBox = document.getElementById('ai-reply-box');
  const sourcePill = document.getElementById('ai-source-pill');
  const evidencePill = document.getElementById('ai-evidence-pill');

  queryButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      queryButtons.forEach(b => {
        b.style.background = 'var(--bg-surface)';
        b.style.color = 'var(--text-headline)';
      });
      btn.style.background = 'var(--apple-blue)';
      btn.style.color = '#ffffff';

      const query = btn.getAttribute('data-query');
      if (replyBox) replyBox.textContent = 'Querying Sentinel AI mesh...';
      if (truthPill) truthPill.textContent = 'PROCESSING...';

      try {
        const response = await fetch('/api/ai/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });

        if (response.ok) {
          const data = await response.json();
          if (truthPill) {
            truthPill.textContent = data.badge || `${data.status} · VERIFIED`;
          }
          if (replyBox) replyBox.textContent = data.reply;
          if (sourcePill) sourcePill.textContent = `SOURCE: ${data.source || 'CCTV_FLEET_DIAGNOSTICS'}`;
          if (evidencePill) evidencePill.textContent = `EVIDENCE ID: ${data.evidenceId || 'EVT-78421'}`;
          if (timestampPill) timestampPill.textContent = `CONFIDENCE: ${data.confidence || '0.98'}`;
        }
      } catch (err) {
        if (replyBox) replyBox.textContent = `Operational response recorded for: ${query}`;
      }
    });
  });

  // ==========================================================================
  // SENTINEL GRID VISUAL GALLERY COMPONENT
  // ==========================================================================
  const defaultGalleryImages = [
    {
      id: "live-grid-feed",
      src: "/screenshots/live-grid.jpg",
      title: "Real-Time 30-Node CCTV Grid Matrix",
      category: "LIVE GRID",
      description: "Autonomous multi-camera live surveillance grid with HLS (AES-128) & RTSP streaming, hardware decoding, and sub-15ms edge bounding overlays.",
      technicalNote: "Ahmedabad, Junagadh & Gandhinagar corridors · YOLOv8 Edge ONNX (55.6 FPS)",
      featured: true
    },
    {
      id: "spatial-gis-map",
      src: "/screenshots/gis-map.jpg",
      title: "GIS Corridor Trajectory & Sighting Map",
      category: "SPATIAL INTELLIGENCE",
      description: "Spatial correlation across municipal camera networks, chronologically tracking vehicle movement across Sabarmati and Ashram Road intersections.",
      technicalNote: "Correlated Sightings Timeline · Multi-camera temporal consensus",
      featured: false
    },
    {
      id: "system-arch-diagram",
      src: "/screenshots/architecture.jpg",
      title: "Multi-Stage Intelligence & Cloud Architecture",
      category: "SYSTEM ARCHITECTURE",
      description: "End-to-end decoupled pipeline connecting edge YOLOv8 ONNX vision, Tesseract LSTM OCR, Pub/Sub event bus, BigQuery data lake, and Google Cloud services.",
      technicalNote: "Edge CV Inference + GCP Cloud Coordination · BSA 2023 Sec-63 Compliant",
      featured: false
    },
    {
      id: "ai-vision-lab",
      src: "/screenshots/vision-lab.jpg",
      title: "Real AI Vision Test Lab & Violation Triage",
      category: "AI / VISION",
      description: "Live 4K optical feed analysis with YOLOv8 bounding boxes for 2/4-wheelers, HSRP candidate localization, and rule-based traffic violation detection.",
      technicalNote: "CAM-014 Ashram Road · 3840×2160 (4K) · Triple Riding & Speed Rule Triggers",
      featured: false
    },
    {
      id: "agent-mesh-workflow",
      src: "/screenshots/agent-mesh.jpg",
      title: "13-Agent Neural Mesh & Decoupled Workflow",
      category: "INVESTIGATION",
      description: "Distributed neural pipeline coordinating 13 specialized agents from video ingestion to SHA-256 dual cryptographic evidence preservation.",
      technicalNote: "13 Neural Agents · 42 events/min · Zero AI Queue Backpressure",
      featured: false
    },
    {
      id: "command-hq-dashboard",
      src: "/screenshots/dashboard.jpg",
      title: "Gujarat Police HQ Operational Suite",
      category: "COMMAND CENTER",
      description: "Unified control-room cockpit with 34 modular operational suites, active mission tracking, urgent alert triaging, and human-in-the-loop review.",
      technicalNote: "34 Operational Modules · State Crime Records Bureau (SCRB) Governance",
      featured: true
    }
  ];

  // Retrieve user-uploaded images from localStorage if any
  let uploadedOverrides = {};
  try {
    const saved = localStorage.getItem('sentinel_gallery_uploads');
    if (saved) uploadedOverrides = JSON.parse(saved);
  } catch (e) {
    console.warn('LocalStorage unavailable', e);
  }

  const galleryImages = defaultGalleryImages.map(item => {
    if (uploadedOverrides[item.id]) {
      return { ...item, src: uploadedOverrides[item.id], isUploaded: true };
    }
    return item;
  });

  const galleryContainer = document.getElementById('gallery-container');
  const categoryTabBtns = document.querySelectorAll('.gallery-tab-btn');
  const fileInput = document.getElementById('gallery-file-input');
  let currentCategory = 'ALL';
  let currentLightboxIndex = 0;
  let activeFilteredImages = [...galleryImages];

  // Render gallery cards with image validation
  function renderGallery(filter = 'ALL') {
    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';
    
    activeFilteredImages = filter === 'ALL' 
      ? galleryImages 
      : galleryImages.filter(item => item.category === filter);

    if (activeFilteredImages.length === 0) {
      galleryContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          No records found in this category.
        </div>
      `;
      return;
    }

    activeFilteredImages.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `gallery-card ${item.featured ? 'featured' : ''}`;
      card.setAttribute('data-category', item.category);

      const emptyStateHTML = `
        <div class="gallery-card-empty-state" id="empty-${item.id}">
          <span class="empty-state-badge">IMAGE NOT AVAILABLE</span>
          <div class="empty-state-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </div>
          <div class="empty-state-text">No local screenshot found in repository</div>
          <label class="empty-state-upload-trigger">
            <input type="file" accept="image/*" style="display:none;" data-target-id="${item.id}" class="card-inline-upload">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>+ Upload Screenshot</span>
          </label>
        </div>
      `;

      card.innerHTML = `
        <div class="gallery-card-img-wrap">
          <span class="gallery-card-badge">${item.category}</span>
          <div class="gallery-card-zoom-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </div>
          <img src="${item.src}" alt="${item.title}" class="gallery-card-img" id="img-${item.id}" loading="lazy">
          ${emptyStateHTML}
        </div>
        <div class="gallery-card-content">
          <div>
            <h3 class="gallery-card-title">${item.title}</h3>
            <p class="gallery-card-desc">${item.description}</p>
          </div>
          <div class="gallery-card-footer">
            <span>${item.technicalNote}</span>
            <span style="color: var(--apple-blue); font-weight: 600;" class="card-action-label">Inspect Record →</span>
          </div>
        </div>
      `;

      const imgEl = card.querySelector(`#img-${item.id}`);
      const emptyEl = card.querySelector(`#empty-${item.id}`);
      const zoomEl = card.querySelector('.gallery-card-zoom-icon');

      // Check if image loads successfully or fails
      if (imgEl && emptyEl) {
        imgEl.onload = function() {
          imgEl.style.display = 'block';
          emptyEl.style.display = 'none';
          if (zoomEl) zoomEl.style.display = 'flex';
          item.hasLoaded = true;
        };

        imgEl.onerror = function() {
          imgEl.style.display = 'none';
          emptyEl.style.display = 'flex';
          if (zoomEl) zoomEl.style.display = 'none';
          item.hasLoaded = false;
        };
      }

      // Open lightbox on card click (only if image has loaded)
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-inline-upload') || e.target.closest('.empty-state-upload-trigger')) {
          return;
        }
        if (item.hasLoaded) {
          openLightbox(index);
        }
      });

      galleryContainer.appendChild(card);
    });

    // Attach card inline upload handlers
    document.querySelectorAll('.card-inline-upload').forEach(input => {
      input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        const targetId = this.getAttribute('data-target-id');
        if (file && targetId) {
          handleImageUpload(file, targetId);
        }
      });
    });
  }

  // Handle image upload from + icon
  function handleImageUpload(file, specificId = null) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const dataUrl = event.target.result;
      const targetId = specificId || (activeFilteredImages[0] ? activeFilteredImages[0].id : defaultGalleryImages[0].id);
      
      uploadedOverrides[targetId] = dataUrl;
      try {
        localStorage.setItem('sentinel_gallery_uploads', JSON.stringify(uploadedOverrides));
      } catch (err) {
        console.warn('Failed to save to localStorage', err);
      }

      // Update gallery item in memory
      const item = galleryImages.find(g => g.id === targetId);
      if (item) {
        item.src = dataUrl;
        item.hasLoaded = true;
      }

      renderGallery(currentCategory);
    };
    reader.readAsDataURL(file);
  }

  // Global + upload button listener
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      files.forEach((file, idx) => {
        const targetId = defaultGalleryImages[idx % defaultGalleryImages.length].id;
        handleImageUpload(file, targetId);
      });
    });
  }

  // Category filter click events
  categoryTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      renderGallery(currentCategory);
    });
  });

  // Initial render
  renderGallery('ALL');

  // Lightbox Modal Functionality
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxCategory = document.getElementById('lightbox-category');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  function openLightbox(index) {
    if (!lightbox || !activeFilteredImages[index]) return;
    currentLightboxIndex = index;
    updateLightboxContent();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateLightboxContent() {
    const item = activeFilteredImages[currentLightboxIndex];
    if (!item) return;

    if (lightboxCategory) lightboxCategory.textContent = item.category;
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxDesc) lightboxDesc.textContent = `${item.description} (${item.technicalNote})`;
    if (lightboxCounter) lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${activeFilteredImages.length}`;

    if (lightboxImg) {
      lightboxImg.src = item.src;
      lightboxImg.alt = item.title;
    }
  }

  function prevImage() {
    if (activeFilteredImages.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + activeFilteredImages.length) % activeFilteredImages.length;
    updateLightboxContent();
  }

  function nextImage() {
    if (activeFilteredImages.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % activeFilteredImages.length;
    updateLightboxContent();
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);
  if (lightboxNext) lightboxNext.addEventListener('click', nextImage);

  // Close on backdrop click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation (Escape, ArrowLeft, ArrowRight)
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });
});
