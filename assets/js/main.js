/* ==========================================================================
   ASD & Co. GmbH — Verhalten
   Sprachumschaltung, Navigation, Scroll-Effekte, Formular.
   Läuft ohne Abhängigkeiten und ohne Build-Schritt.
   ========================================================================== */
(function () {
  "use strict";

  var DICT      = window.I18N || {};
  var SUPPORTED = ["de", "ru", "en"];
  var FALLBACK  = "de";
  var STORE_KEY = "asd-lang";

  /* ------------------------------------------------------------------ Hilfen */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* localStorage kann im Privatmodus werfen — nie den Rest des Skripts mitreißen. */
  function readStore(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeStore(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* bewusst ignoriert */ }
  }

  /* ==========================================================================
     Sprache
     ========================================================================== */

  /* Reihenfolge: gespeicherte Wahl → Browsersprachen → Deutsch */
  function detectLang() {
    var saved = readStore(STORE_KEY);
    if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;

    var prefs = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < prefs.length; i++) {
      var code = String(prefs[i]).toLowerCase().split("-")[0];
      if (SUPPORTED.indexOf(code) !== -1) return code;
    }
    return FALLBACK;
  }

  function translate(key, lang) {
    var table = DICT[lang] || {};
    if (Object.prototype.hasOwnProperty.call(table, key)) return table[key];

    // Fehlender Schlüssel: auf Deutsch zurückfallen, aber sichtbar melden.
    if (lang !== FALLBACK && DICT[FALLBACK] && Object.prototype.hasOwnProperty.call(DICT[FALLBACK], key)) {
      console.warn("[i18n] Schlüssel fehlt in \"" + lang + "\": " + key);
      return DICT[FALLBACK][key];
    }
    console.warn("[i18n] Unbekannter Schlüssel: " + key);
    return null;
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = FALLBACK;

    document.documentElement.lang = lang;

    // Reiner Text
    $$("[data-i18n]").forEach(function (el) {
      var value = translate(el.getAttribute("data-i18n"), lang);
      if (value === null) return;

      // <title> und <meta content> brauchen ein anderes Ziel als textContent.
      if (el.tagName === "TITLE") { document.title = value; return; }
      var attr = el.getAttribute("data-i18n-attr");
      if (attr) { el.setAttribute(attr, value); return; }

      el.textContent = value;
    });

    // Text mit erlaubtem Inline-Markup (nur eigene Wörterbuchinhalte, keine Nutzereingaben)
    $$("[data-i18n-html]").forEach(function (el) {
      var value = translate(el.getAttribute("data-i18n-html"), lang);
      if (value !== null) el.innerHTML = value;
    });

    // Attribute
    $$("[data-i18n-placeholder]").forEach(function (el) {
      var value = translate(el.getAttribute("data-i18n-placeholder"), lang);
      if (value !== null) el.setAttribute("placeholder", value);
    });
    $$("[data-i18n-aria]").forEach(function (el) {
      var value = translate(el.getAttribute("data-i18n-aria"), lang);
      if (value !== null) el.setAttribute("aria-label", value);
    });
    $$("[data-i18n-alt]").forEach(function (el) {
      var value = translate(el.getAttribute("data-i18n-alt"), lang);
      if (value !== null) el.setAttribute("alt", value);
    });

    // Zustand der Umschalter (Kopf- und Fußzeile)
    $$(".lang__btn").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === lang));
    });

    writeStore(STORE_KEY, lang);
  }

  $$(".lang__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-lang"));
    });
  });

  applyLang(detectLang());

  /* ==========================================================================
     Kopfzeile und Navigation
     ========================================================================== */
  var header = $("#header");
  var nav    = $("#nav");
  var burger = $("#burger");

  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });

    // Nach einem Sprung im Ausklappmenü wieder schließen
    nav.addEventListener("click", function (e) {
      if (e.target.closest(".nav__link")) {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });

    // Esc schließt das Menü und gibt den Fokus zurück
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        burger.focus();
      }
    });
  }

  /* Aktiven Navigationspunkt anhand der sichtbaren Sektion markieren */
  var sections = $$("main section[id]");
  var navLinks = $$(".nav__link");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ==========================================================================
     Einblendungen beim Scrollen
     ========================================================================== */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = $$(".reveal");

  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    // Bewusst kein obs.unobserve(): die Animation soll bei jedem Rein- und
    // Rausscrollen erneut laufen, nicht nur beim ersten Mal.
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ==========================================================================
     Jahreszahl in der Fußzeile
     ========================================================================== */
  var year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ==========================================================================
     Kontaktformular
     ========================================================================== */
  var form     = $("#contact-form");
  var formWrap = $("#form-wrap");

  // Google Apps Script Web App: schreibt die Anfrage in ein Google Sheet und
  // verschickt eine Benachrichtigung an info@asd-co.de. Kein eigener Server nötig.
  var FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbyIWyz9fOCQfD7pWNVl9jgloG8WMD37VkkPGkPgEEjEdy_j9NuNCRtUHjInNJ6tUn3V/exec";

  if (form && formWrap) {
    /* --- Feldvalidierung --- */
    function fieldOf(input) { return input.closest(".field"); }

    function validateField(input) {
      var ok = true;

      if (input.type === "checkbox") {
        ok = !input.required || input.checked;
      } else if (input.required && !input.value.trim()) {
        ok = false;
      } else if (input.type === "email" && input.value.trim()) {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
      }

      var field = fieldOf(input);
      if (field) field.classList.toggle("has-error", !ok);
      input.setAttribute("aria-invalid", String(!ok));
      return ok;
    }

    var validatable = $$("input, textarea, select", form).filter(function (el) {
      return el.type !== "submit";
    });

    // Erst nach dem ersten Absenden live mitvalidieren — sonst meckert das
    // Formular schon beim Tippen im ersten Feld.
    var submitted = false;
    validatable.forEach(function (input) {
      input.addEventListener("blur", function () { if (submitted) validateField(input); });
      input.addEventListener("input", function () { if (submitted) validateField(input); });
      input.addEventListener("change", function () { if (submitted) validateField(input); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitted = true;

      var allValid = true;
      var firstBad = null;

      validatable.forEach(function (input) {
        if (!validateField(input)) {
          allValid = false;
          if (!firstBad) firstBad = input;
        }
      });
      if (!allValid) {
        if (firstBad && firstBad.focus) firstBad.focus();
        return;
      }

      var submitBtn  = $("button[type=submit]", form);
      var errorBox   = $("#form-send-error", form);
      var sendingTxt = translate("form.sending", document.documentElement.lang);
      var originalTxt = submitBtn.textContent;

      var payload = {
        name:    $("#f-name", form).value.trim(),
        company: $("#f-company", form).value.trim(),
        country: $("#f-country", form).value.trim(),
        email:   $("#f-email", form).value.trim(),
        phone:   $("#f-phone", form).value.trim(),
        message: $("#f-message", form).value.trim()
      };

      errorBox.hidden = true;
      submitBtn.disabled = true;
      if (sendingTxt) submitBtn.textContent = sendingTxt;

      // Google Apps Script leitet jede Anfrage intern über eine zweite Adresse
      // um (script.googleusercontent.com), und genau auf diesem Umweg fehlen
      // die CORS-Kopfzeilen, die ein Browser zum Auslesen der Antwort braucht
      // — anders als curl prüft ein Browser das. Mit mode:"no-cors" kommt die
      // Anfrage trotzdem beim Script an (Sheet-Zeile + E-Mail funktionieren),
      // wir können die Antwort dann nur nicht mehr inhaltlich auswerten.
      //
      // Der Umweg über die zweite Adresse kann gut und gerne über 15 Sekunden
      // dauern — das Zeitlimit unten hat schon einmal fälschlich abgebrochen,
      // während die Anfrage bei Google trotzdem fertig durchgelaufen ist (ein
      // Abbruch im Browser stoppt die bereits laufende Ausführung auf Googles
      // Server nämlich nicht). Bewusst großzügig auf 45 Sekunden gesetzt, damit
      // eine erfolgreiche Anfrage nicht fälschlich als Fehler angezeigt wird.
      var controller = new AbortController();
      var timeout = setTimeout(function () { controller.abort(); }, 45000);

      fetch(FORM_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(payload),
        signal: controller.signal
      })
        .then(function () {
          clearTimeout(timeout);
          formWrap.classList.add("is-sent");
          formWrap.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
        })
        .catch(function () {
          clearTimeout(timeout);
          errorBox.hidden = false;
          submitBtn.disabled = false;
          submitBtn.textContent = originalTxt;
        });
    });
  }
})();
