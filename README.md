# Geschiedenis H4 - Quiz App

Quiz PWA voor Hoofdstuk 4: **Tijd van pruiken en revoluties** (1700-1800).

**Live app:** https://karel314.github.io/geschiedenis-h4/

## Features

- **175 vragen** over 9 leerdoelen (4.1 + 4.3)
- **4 vraagtypes:** meerkeuze, meerdere antwoorden, invullen, volgorde
- **Slim herhalen:** zwakke onderwerpen komen vaker terug
- **Voortgang:** scores per leerdoel, met reset-optie
- **Flashcards:** voor leerdoelen die je nog niet beheerst
- **9 Badges:** verdien ze bij 80%+ beheersing per leerdoel
- **Offline:** werkt zonder internet na eerste keer laden (PWA)

## Installeren op iPhone

1. Open https://karel314.github.io/geschiedenis-h4/ in **Safari**
2. Tik op het **deelicoon** (vierkantje met pijltje)
3. Kies **"Zet op beginscherm"**
4. Tik **"Voeg toe"**

## Leerdoelen

| # | Leerdoel | Vragen | Badge |
|---|----------|--------|-------|
| 1 | De Pruikentijd | 10 | Pruikenmeester |
| 2 | De Franse standenmaatschappij | 10 | Standenkenner |
| 3 | De Verlichting | 10 | Verlichtingsdenker |
| 4 | Verlichte ideeën en denkers | 15 | Filosoof |
| 5 | Het begin van de Franse Revolutie | 10 | Revolutionair |
| 6 | Politieke veranderingen in de Franse Revolutie | 10 | Politiek Strateeg |
| 7 | Personen | 50 | Geschiedenisheld |
| 8 | Tijdlijn | 50 | Tijdreiziger |
| 9 | Begrippen | 10 | Woordenmeester |

## Technisch

- Vanilla HTML/CSS/JS, geen frameworks
- Service worker met cache-first strategie voor offline support
- localStorage voor voortgang (blijft bewaard bij updates)
- PWA manifest voor installatie op homescreen

## Vragenbank updaten

1. Vervang `data/vragen.json` met de nieuwe database
2. Bump de cache versie in `sw.js` (bijv. `v2` → `v3`)
3. Commit en push naar GitHub — de app update automatisch
