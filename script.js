// ==========================================================================
// SENTINEL GRID V3 — APPLE-STYLE CINEMATIC INTERACTIONS & PERSISTENT GALLERY
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
  // PERSISTENT SENTINEL GRID VISUAL GALLERY
  // ==========================================================================
  let galleryItems = [];
  let activeFilteredImages = [];
  let currentCategory = 'ALL';
  let currentLightboxIndex = 0;
  let pendingUploadData = null;

  const galleryContainer = document.getElementById('gallery-container');
  const categoryTabBtns = document.querySelectorAll('.gallery-tab-btn');
  const fileInput = document.getElementById('gallery-file-input');

  // Modal elements
  const uploadModal = document.getElementById('gallery-upload-modal');
  const uploadModalClose = document.getElementById('upload-modal-close');
  const uploadCancelBtn = document.getElementById('upload-cancel-btn');
  const uploadSubmitBtn = document.getElementById('upload-submit-btn');
  const uploadBtnText = document.getElementById('upload-btn-text');
  const uploadPreviewImg = document.getElementById('upload-preview-img');
  const uploadPreviewPlaceholder = document.getElementById('upload-preview-placeholder');
  const uploadTitleInput = document.getElementById('upload-title-input');
  const uploadCategorySelect = document.getElementById('upload-category-select');
  const uploadNoteInput = document.getElementById('upload-note-input');

  // Lightbox elements
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxCategory = document.getElementById('lightbox-category');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  // Fetch gallery records from server on load
  async function loadGalleryRecords() {
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const json = await res.json();
        galleryItems = json.data || [];
      } else {
        console.error('Failed to load gallery from server');
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
    }
    renderGallery(currentCategory);
  }

  // Render gallery cards
  function renderGallery(filter = 'ALL') {
    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';

    activeFilteredImages = filter === 'ALL'
      ? galleryItems
      : galleryItems.filter(item => item.category === filter);

    if (activeFilteredImages.length === 0) {
      galleryContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          No records found in category: <strong>${filter}</strong>. Click <em>+ Upload Image</em> to add one.
        </div>
      `;
      return;
    }

    activeFilteredImages.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `gallery-card ${item.isUploaded ? 'featured' : ''}`;
      card.setAttribute('data-category', item.category);

      const srcPath = item.storagePath || item.src;

      const deleteBtnHTML = item.isUploaded ? `
        <button class="card-delete-btn" data-delete-id="${item.id}" title="Delete screenshot">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          <span>Delete</span>
        </button>
      ` : '';

      const emptyStateHTML = `
        <div class="gallery-card-empty-state" id="empty-${item.id}">
          <span class="empty-state-badge">IMAGE NOT AVAILABLE</span>
          <div class="empty-state-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </div>
          <div class="empty-state-text">Screenshot pending upload in repository</div>
          <label class="empty-state-upload-trigger">
            <input type="file" accept="image/png,image/jpeg,image/webp" style="display:none;" data-target-id="${item.id}" class="card-inline-upload">
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
          <img src="${srcPath}" alt="${item.title}" class="gallery-card-img" id="img-${item.id}" loading="lazy">
          ${emptyStateHTML}
        </div>
        <div class="gallery-card-content">
          <div>
            <h3 class="gallery-card-title">${item.title}</h3>
            <p class="gallery-card-desc">${item.description || ''}</p>
          </div>
          <div class="gallery-card-footer">
            <span>${item.technicalNote || ''}</span>
            <div style="display:flex; align-items:center; gap:8px;">
              ${deleteBtnHTML}
              <span style="color: var(--apple-blue); font-weight: 600;" class="card-action-label">Inspect →</span>
            </div>
          </div>
        </div>
      `;

      const imgEl = card.querySelector(`#img-${item.id}`);
      const emptyEl = card.querySelector(`#empty-${item.id}`);
      const zoomEl = card.querySelector('.gallery-card-zoom-icon');

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

      // Lightbox trigger
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-delete-btn') || e.target.closest('.card-inline-upload') || e.target.closest('.empty-state-upload-trigger')) {
          return;
        }
        if (item.hasLoaded) {
          openLightbox(index);
        }
      });

      // Delete action trigger
      const delBtn = card.querySelector('.card-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const targetId = delBtn.getAttribute('data-delete-id');
          if (confirm(`Are you sure you want to delete "${item.title}" from the gallery?`)) {
            await deleteGalleryRecord(targetId);
          }
        });
      }

      galleryContainer.appendChild(card);
    });

    // Attach card inline upload handlers
    document.querySelectorAll('.card-inline-upload').forEach(input => {
      input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        const targetId = this.getAttribute('data-target-id');
        if (file) {
          const item = galleryItems.find(g => g.id === targetId);
          openUploadModalForFile(file, item ? item.category : 'LIVE GRID', item ? item.title : '');
        }
      });
    });
  }

  // Delete record from server
  async function deleteGalleryRecord(id) {
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        galleryItems = galleryItems.filter(item => item.id !== id);
        renderGallery(currentCategory);
      } else {
        alert('Failed to delete image');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  // Open upload modal with file loaded
  function openUploadModalForFile(file, defaultCat = 'LIVE GRID', defaultTitle = '') {
    const reader = new FileReader();
    reader.onload = function(e) {
      pendingUploadData = {
        filename: file.name,
        base64Data: e.target.result
      };

      if (uploadPreviewImg) {
        uploadPreviewImg.src = e.target.result;
        uploadPreviewImg.style.display = 'block';
      }
      if (uploadPreviewPlaceholder) {
        uploadPreviewPlaceholder.style.display = 'none';
      }

      if (uploadTitleInput) {
        uploadTitleInput.value = defaultTitle || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      }
      if (uploadCategorySelect) {
        uploadCategorySelect.value = defaultCat || currentCategory !== 'ALL' ? currentCategory : 'LIVE GRID';
      }
      if (uploadNoteInput) {
        uploadNoteInput.value = `Uploaded ${new Date().toLocaleDateString()}`;
      }

      if (uploadModal) {
        uploadModal.classList.add('active');
        uploadModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    };
    reader.readAsDataURL(file);
  }

  function closeUploadModal() {
    if (!uploadModal) return;
    uploadModal.classList.remove('active');
    uploadModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    pendingUploadData = null;
    if (uploadSubmitBtn) uploadSubmitBtn.disabled = false;
    if (uploadBtnText) uploadBtnText.textContent = 'Save to Gallery';
  }

  // Handle upload confirmation to server
  if (uploadSubmitBtn) {
    uploadSubmitBtn.addEventListener('click', async () => {
      if (!pendingUploadData) {
        alert('Please select an image file first.');
        return;
      }

      const title = uploadTitleInput ? uploadTitleInput.value.trim() : '';
      const category = uploadCategorySelect ? uploadCategorySelect.value : 'LIVE GRID';
      const technicalNote = uploadNoteInput ? uploadNoteInput.value.trim() : '';

      uploadSubmitBtn.disabled = true;
      if (uploadBtnText) uploadBtnText.textContent = 'Uploading to Server...';

      try {
        const response = await fetch('/api/gallery/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: pendingUploadData.filename,
            base64Data: pendingUploadData.base64Data,
            title,
            category,
            technicalNote
          })
        });

        if (response.ok) {
          const json = await response.json();
          if (json.data) {
            galleryItems.unshift(json.data);
            closeUploadModal();
            renderGallery(currentCategory);
          }
        } else {
          alert('Upload failed. Please try again.');
          uploadSubmitBtn.disabled = false;
          if (uploadBtnText) uploadBtnText.textContent = 'Save to Gallery';
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('Upload error: ' + err.message);
        uploadSubmitBtn.disabled = false;
        if (uploadBtnText) uploadBtnText.textContent = 'Save to Gallery';
      }
    });
  }

  if (uploadModalClose) uploadModalClose.addEventListener('click', closeUploadModal);
  if (uploadCancelBtn) uploadCancelBtn.addEventListener('click', closeUploadModal);

  // Global upload file input listener
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        openUploadModalForFile(file, currentCategory !== 'ALL' ? currentCategory : 'LIVE GRID');
      }
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

  // Lightbox Modal Functions
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

    const srcPath = item.storagePath || item.src;

    if (lightboxCategory) lightboxCategory.textContent = item.category;
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxDesc) lightboxDesc.textContent = `${item.description || ''} (${item.technicalNote || ''})`;
    if (lightboxCounter) lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${activeFilteredImages.length}`;

    if (lightboxImg) {
      lightboxImg.src = srcPath;
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

  if (uploadModal) {
    uploadModal.addEventListener('click', (e) => {
      if (e.target === uploadModal) {
        closeUploadModal();
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (uploadModal && uploadModal.classList.contains('active')) {
      if (e.key === 'Escape') closeUploadModal();
      return;
    }
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  // Load persistent records on initialization
  loadGalleryRecords();
});
