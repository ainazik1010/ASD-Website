# ASD & CO — Website

Mehrsprachige Firmenwebsite (Deutsch/Russisch/Englisch) für ein Unternehmen aus der
Lebensmitteltechnik. Statisches HTML/CSS/JavaScript ohne Framework und ohne Build-Schritt.

## Funktionen

- Startseite mit Vorstellung des Unternehmens und der Branche
- Sprachumschaltung DE/RU/EN über ein eigenes i18n-System (`assets/js/i18n.js`)
- Kontaktformular, das Anfragen über ein Google Apps Script in ein Google Sheet schreibt
- Impressum und Datenschutzerklärung nach deutschem Recht

## Technik

```
index.html          Startseite
impressum.html       Impressum
datenschutz.html     Datenschutzerklärung
assets/css/style.css Design-System
assets/js/i18n.js    Übersetzungen DE / RU / EN
assets/js/main.js    Sprachumschaltung, Navigation, Formular
```

Lokal ansehen:

```bash
python3 -m http.server 8080
```
