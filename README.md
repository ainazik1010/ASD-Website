# ASD & CO — Website

Multilingual company website (German/Russian/English) for a company in the food technology
industry. Static HTML/CSS/JavaScript, no framework and no build step.

## Features

- Home page presenting the company and its industry
- Language switch DE/RU/EN via a custom i18n system (`assets/js/i18n.js`)
- Contact form that submits inquiries to a Google Sheet via a Google Apps Script
- Imprint and privacy policy compliant with German law

## Tech

```
index.html            Home page
impressum.html          Imprint
datenschutz.html        Privacy policy
assets/css/style.css    Design system
assets/js/i18n.js       Translations DE / RU / EN
assets/js/main.js       Language switching, navigation, form
```

Local preview:

```bash
python3 -m http.server 8080
```
