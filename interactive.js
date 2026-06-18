// interactive.js
// Adds interactive behaviors to index.html (without requiring a backend).

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  // ---- PLK map rendering (used by plk-map.html) ----
  // Expects Leaflet loaded and window.PLK_LAT / window.PLK_LNG set.
  if (typeof window !== 'undefined' && window.L && typeof window.PLK_LAT === 'number' && typeof window.PLK_LNG === 'number') {
    const mapEl = document.getElementById('map');
    const coordsEl = document.getElementById('plk-coords');

    if (mapEl) {
      const PLK_LAT = window.PLK_LAT;
      const PLK_LNG = window.PLK_LNG;

      const map = L.map('map', { scrollWheelZoom: true }).setView([PLK_LAT, PLK_LNG], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const marker = L.marker([PLK_LAT, PLK_LNG]).addTo(map);

      marker.bindPopup(`
        <div style="font-weight:800; margin-bottom:6px;">PLK Location</div>
        <div style="opacity:0.9; font-size:13px;">Lat: ${PLK_LAT.toFixed(6)}<br/>Lng: ${PLK_LNG.toFixed(6)}</div>
        <div style="margin-top:10px; font-size:13px; opacity:0.9;">Tip: Drag map, zoom, and click marker again to reopen.</div>
      `);

      if (coordsEl) coordsEl.textContent = `${PLK_LAT.toFixed(6)}, ${PLK_LNG.toFixed(6)}`;

      map.once('load', () => map.fitBounds(marker.getBounds().pad(0.25)));
    }
  }

  const originalSubmitStory = window.submitStory;

  function sanitizeText(str) {
    return String(str)
      .replace(/\u0000/g, '')
      .trim();
  }

  window.submitStory = function submitStory(event) {
    try {
      if (event && typeof event.preventDefault === 'function') event.preventDefault();

      const storyEl = $('#story');
      const testimonialsEl = $('#testimonials');
      if (!storyEl || !testimonialsEl) {
        // Fallback: call whatever was there before.
        if (typeof originalSubmitStory === 'function') {
          return originalSubmitStory(event);
        }
        return;
      }

      const raw = storyEl.value;
      const story = sanitizeText(raw);

      // Minimal client-side guardrails
      if (!story) return;
      if (story.length < 10) {
        testimonialsEl.innerHTML =
          '<p><em>Please write a little more so moderators can understand your message.</em></p>';
        return;
      }

      // Add to UI as anonymous submission
      const p = document.createElement('p');
      p.innerHTML =
        '<em>Thank you for sharing. Your story has been submitted for moderation (anonymous).</em>';
      testimonialsEl.appendChild(p);

      storyEl.value = '';

      // Optional: add a tiny confirmation toast

      // In production, send to moderated backend anonymously.
      // No network calls in this project.
      return;
    } catch (e) {
      // If enhancement fails, defer to the original.
      if (typeof originalSubmitStory === 'function') {
        return originalSubmitStory(event);
      }
    }
  };

  // ---- Add a keyboard convenience: Ctrl/⌘ + Enter submits story ----
  // If the page includes a story textarea and its form has onsubmit.
  document.addEventListener('keydown', (e) => {
    const storyEl = $('#story');
    if (!storyEl) return;
    const isMac = navigator.platform.toLowerCase().includes('mac');
    const metaOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    if (metaOrCtrl && e.key === 'Enter') {
      const form = storyEl.closest('form');
      if (form) form.requestSubmit();
    }
  });

  // ---- Enhance focus outline for accessibility ----
  document.addEventListener('mousedown', () => {
    document.body.dataset.usingMouse = 'true';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.body.dataset.usingMouse = 'false';
  });

  // ---- Basic “quick exit” hardening (keep behavior, but ensure function exists) ----
  if (typeof window.quickExit !== 'function') {
    window.quickExit = function quickExit() {
      window.open('about:blank', '_self');
    };
  }
})();

