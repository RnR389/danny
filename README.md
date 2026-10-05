# Hua Hin Dream Homes – Website

Statische Website für **Hua Hin Dream Homes**, persönliche Immobilienberatung in Hua Hin, Thailand (Danny, Shawn & Takkie). Zweisprachig Deutsch/Englisch, ohne Build-Schritt: `index.html` im Browser öffnen genügt.

## Struktur

```
index.html          Startseite (alle Abschnitte)
impressum.html      Impressum (Vorlage)
datenschutz.html    Datenschutzerklärung (Vorlage)
assets/css/         Stylesheet
assets/js/          Sprachumschaltung, Menü, Animationen, Kontaktformular
assets/img/         Logo, Startbild, Teamfotos, Favicon
```

## Pflege

- Texte stehen paarweise im HTML: `lang="de"` und `lang="en"`.
- Bildplatzhalter sind `<figure class="ph">`-Elemente. Zum Austauschen das ganze `<figure>` durch ein `<img>` ersetzen.
- Kontaktformular: Formular-Endpunkt (z. B. Formspree) bei `data-endpoint` am `<form>` eintragen. Ohne Endpunkt öffnet das Formular WhatsApp mit vorausgefüllter Nachricht.

## Offen vor dem Livegang

- [ ] Echte Fotos für die 6 Bildplatzhalter (3 Objekte, 3 Region)
- [ ] Startbild in höherer Auflösung (mind. 2400 px), Bildrechte prüfen
- [ ] Formular-Endpunkt einrichten
- [ ] E-Mail-Adresse ergänzen
- [ ] Impressum und Datenschutz mit echten Angaben füllen und prüfen lassen
- [ ] Google Fonts lokal einbinden (DSGVO)
- [ ] FAQ-Angaben (Freehold/Leasehold, Kaufnebenkosten) fachlich gegenlesen
- [ ] Logo als Vektordatei (SVG) einbinden, falls vorhanden
