# PPSC Child Protection Officer (BPS-17) – 2,100 MCQ Practice Site

42 practice tests × 50 MCQs (A–D options, PPSC style), plus a **100-MCQ / 90-minute exam simulator** (two blueprints, −0.25 per wrong answer) and a **pattern & strategy** page. Instant feedback and an explanation after every attempt, score and review, progress saved in your browser. Static site: no build step or dependencies.

## Deploy on GitHub Pages
1. Create a repo and upload every file in this folder (keep the `data/` folder).
2. Settings → Pages → Deploy from branch → `main` / root.
3. Open the URL GitHub shows.

## What is inside
- Tests 1–3: Punjab Destitute and Neglected Children Act 2004 (text-based, section by section).
- Tests 4–13: child rights/law, child protection practice, social work, psychology, sociology, criminology.
- Tests 14–28: Pakistan Studies, Islamic Studies, current affairs, world geography, GK.
- Tests 29–42: science, computer, English, Urdu, maths and reasoning.

## Editing questions
Questions live in `src/tNN.txt` (pipe-separated): `question|correct|wrong1|wrong2|wrong3|explanation`. Run `python3 build.py` to regenerate `data/` (it shuffles option order, validates 50 per test, and reports problems).

## Honest caveats
- Questions are predictions modelled on PPSC style, not leaked papers.
- Verify the Act on punjablaws.gov.pk and current affairs (2025–26) on a news source.
- Check the official syllabus for this post on ppsc.gop.pk.
- Known source conflicts are listed on the Pattern & Strategy page.
