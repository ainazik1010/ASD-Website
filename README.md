# ASD & CO — Website

Statische Website (HTML/CSS/JavaScript) ohne Build-Schritt und ohne externe Abhängigkeiten.
Dreisprachig: Deutsch, Russisch, Englisch.

---

## Lokal ansehen

```bash
python3 -m http.server 8080
```

Dann `http://localhost:8080` im Browser öffnen.

> Die Seite muss über einen Server laufen, nicht per Doppelklick als `file://` —
> sonst blockiert der Browser das Laden von `i18n.js`.

---

## Aufbau

```
index.html          Startseite (8 Abschnitte)
impressum.html      Impressum nach § 5 DDG
datenschutz.html    Datenschutzerklärung nach DSGVO
assets/
  css/style.css     Design-System und alle Abschnitte
  js/i18n.js        Übersetzungen DE / RU / EN
  js/main.js        Sprachumschaltung, Navigation, Formular
  images/           Alle Bilder der Website
Foto na Site/       Original-Fotos (NICHT hochladen, siehe unten)
```

---

## Vor der Veröffentlichung — offene Punkte

### 1. Rechtstexte vor Anwalt legen (empfohlen)

Firmenname, Adresse, Geschäftsführer, Registereintrag, Steuernummer, E-Mail,
Telefon und Hosting-Anbieter (IONOS) sind vollständig eingetragen — es gibt
keine offenen Platzhalter mehr in Impressum oder Datenschutzerklärung.

> Die Rechtstexte sind fachlich sauber aufgebaut, aber **keine Rechtsberatung**.
> Lassen Sie Impressum und Datenschutzerklärung vor dem Live-Gang anwaltlich prüfen.

### 2. Kontaktformular anbinden

Das Formular validiert vollständig und zeigt eine Bestätigung, **versendet aber noch nichts**.
Die Stelle zum Anbinden ist in `assets/js/main.js` mit `TODO: Versand anbinden` markiert
und enthält fertige Code-Beispiele für zwei Wege:

- **Web3Forms / Formspree** — funktioniert auf jedem statischen Hosting, Datei-Anhang möglich
- **Eigenes PHP-Skript** — wenn Ihr Hosting PHP unterstützt

Bei einem externen Dienst muss die Datenschutzerklärung um den Auftragsverarbeiter
ergänzt werden.

### 3. Zwei Fotos fehlen noch

Diese beiden Kacheln zeigen noch Platzhalter, die stilistisch aus der Reihe fallen —
sie sind Food- beziehungsweise Gastronomie-Aufnahmen statt Produktionsfotos:

| Datei | Gesucht wird |
|---|---|
| `assets/images/industry-meat.jpg` | Fleischverarbeitung in der Produktion (Edelstahl, Anlage) |
| `assets/images/industry-kitchen.jpg` | Profiküche / Großküche aus Edelstahl |

Optional ließe sich auch `contact-logistics.jpg` (derzeit ein Lager) durch ein Foto
einer Containerverladung ersetzen.

**Ersetzen ohne Code-Änderung:** neues Foto unter demselben Dateinamen ablegen.
Empfohlene Breite 1200 px, Seitenverhältnis etwa 3:2. Verkleinern geht auf dem Mac ohne
Zusatzsoftware:

```bash
sips -Z 1200 -s format jpeg -s formatOptions 72 neu.jpg --out assets/images/industry-meat.jpg
```

Passt das Seitenverhältnis nicht genau, ist das unkritisch — die Kacheln beschneiden
per `object-fit: cover` automatisch.

Denken Sie daran, den zugehörigen Alt-Text in `assets/js/i18n.js` anzupassen
(`ind.meatAlt`, `ind.kitchenAlt`) — in allen drei Sprachen.

---

## Veröffentlichen

Alle Dateien auf den Webspace kopieren — **außer dem Ordner `Foto na Site`**.
Der enthält die Original-Fotos mit rund 500 MB und wird von der Website nicht benutzt.

```bash
# Beispiel: nur die benötigten Dateien in einen Upload-Ordner kopieren
mkdir -p ../upload && rsync -av --exclude 'Foto na Site' --exclude '.DS_Store' --exclude 'README.md' ./ ../upload/
```

Die Seite läuft auf jedem Hosting (IONOS, Strato, Hetzner) und ebenso auf
Netlify, Vercel oder GitHub Pages. Ein Build-Schritt ist nicht nötig.

**Wichtig:** HTTPS aktivieren — die Datenschutzerklärung sagt eine TLS-Verschlüsselung zu.

---

## Bearbeiten

### Texte ändern

Alle sichtbaren Texte stehen in `assets/js/i18n.js`, nicht im HTML. Jeder Text hat
einen Schlüssel, der in allen drei Sprachen identisch vorkommen muss:

```js
"hero.title": "Europäische Lebensmitteltechnik …",   // im de-Block
"hero.title": "Европейское пищевое оборудование …",  // im ru-Block
"hero.title": "European food processing equipment …" // im en-Block
```

Fehlt ein Schlüssel in einer Sprache, zeigt die Seite automatisch den deutschen Text
und schreibt eine Warnung in die Browser-Konsole — es bricht also nichts.

### Farben ändern

Alle Farben stehen ganz oben in `assets/css/style.css` unter `:root`. Die Akzentfarbe
zum Beispiel:

```css
--accent:       #0f3b5c;
--accent-light: #1d5c8a;
```

### Nach Änderungen an CSS oder JS

Die Verweise in den HTML-Dateien tragen einen Versionsparameter (`style.css?v=7`,
aktuell steigend). Erhöhen Sie die Zahl nach jeder Änderung, damit Besucher nicht
die alte, zwischengespeicherte Fassung sehen — die aktuelle Nummer steht am Anfang
jeder der drei HTML-Dateien:

```bash
sed -i '' 's/?v=7/?v=8/g' index.html impressum.html datenschutz.html
```

---

## Technische Entscheidungen

**Keine Google Fonts.** Die Seite nutzt Systemschriften. Das Einbinden von Google Fonts
über das Google-CDN überträgt die IP-Adressen der Besucher in die USA und gilt in
Deutschland seit dem Urteil des LG München (3 O 17493/20) als abmahnfähiger
DSGVO-Verstoß.

**Keine externen Ressourcen beim Seitenaufruf.** Alle Bilder, Skripte und Stile
liegen lokal. Beim bloßen Aufruf der Seite geht keine einzige Anfrage an einen
Drittanbieter. Das **Absenden des Kontaktformulars** ist davon ausgenommen: Es
läuft über ein Google Apps Script (siehe unten) und überträgt die Formulardaten
an Google. Die Datenschutzerklärung weist das im Abschnitt „Formularversand
über Google" entsprechend aus.

**Kontaktformular → Google Sheets + E-Mail.** Das Formular sendet per `fetch()`
an ein Google Apps Script (`FORM_ENDPOINT` in `assets/js/main.js`). Das Script
schreibt jede Anfrage in ein Google Sheet und verschickt eine Benachrichtigung
an `info@asd-co.de`.

Der Aufruf läuft mit `mode: "no-cors"`. Grund: Google Apps Script leitet jede
Anfrage intern über eine zweite Adresse um, und auf diesem Umweg fehlen die
CORS-Kopfzeilen, die ein Browser zum Auslesen der Antwort verlangt — die
Anfrage kommt trotzdem beim Script an, nur lässt sich die Antwort im Browser
nicht mehr inhaltlich prüfen. Ein `AbortController` mit 45-Sekunden-Timeout
verhindert, dass „Wird gesendet …" unbegrenzt hängen bleibt (bewusst großzügig:
ein zu kurzes Zeitlimit brach in der Praxis schon einmal ab, während die
Anfrage bei Google im Hintergrund trotzdem fertig durchlief — ein Abbruch im
Browser stoppt die bereits laufende Ausführung auf Googles Server nicht).
Schlägt der Versand wirklich fehl (Timeout, kein Netz), zeigt das Formular
eine Fehlermeldung statt fälschlich eine Erfolgsmeldung — bricht das Script
selbst später einmal (z. B. nach einer Bearbeitung in Apps Script), zeigt der
Browser das wegen `no-cors` allerdings nicht an. Ab und zu einen Blick ins
Sheet werfen ist daher sinnvoll.

**Kein Cookie-Banner.** Es werden keine Cookies gesetzt. Die Sprachwahl liegt im
`localStorage` und ist eine rein technische Einstellung ohne Personenbezug —
dafür ist keine Einwilligung nötig.

**Ein einziges HTML-Dokument pro Seite für alle drei Sprachen.** Die Umschaltung
tauscht die Texte über `data-i18n`-Attribute aus. Das hält die Pflege einfach.
Wenn die Seite später in allen drei Sprachen bei Google auffindbar sein soll,
wären getrennte URLs pro Sprache (`/de/`, `/ru/`, `/en/`) die bessere Wahl —
das ist ein größerer Umbau und derzeit nicht umgesetzt.
