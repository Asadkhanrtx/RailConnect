# PlayPicks – No‑Stakes Prediction Front‑End (Catchy Edition)

This is a **dynamic, no‑stakes** prediction UI with enhanced visuals:
- Gradient hero section + carousel banners
- Team logos, sport icons, colorful event cards
- Virtual coins, picks, result simulation, leaderboard

> **IMPORTANT:** No real money, no wagering, no prizes. Educational demo only.

## Run locally
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure
```
playpicks-nostakes-frontend/
├── index.html
├── assets/
│   ├── css/styles.css
│   ├── js/app.js
│   └── img/
│       ├── logo.svg
│       ├── banners/{grid.svg, hero-illustration.svg, banner1.svg, banner2.svg, banner3.svg}
│       ├── sports/{cricket.svg, football.svg, tennis.svg}
│       └── teams/{tigers.svg, falcons.svg, redfc.svg, bluefc.svg, playerx.svg, playery.svg, royals.svg, kings.svg}
└── pages/
    ├── events.html
    ├── my-picks.html
    ├── leaderboard.html
    └── rules.html
```
