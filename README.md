# PPSC Child Protection Officer (BPS-17) – 1000 MCQ Practice Site

20 practice tests × 50 MCQs (A–D options, PPSC style). Instant feedback, a full explanation after every attempt, score and answer review, timer, progress saved in your browser. No build step or dependencies; it is a static site.

## Deploy on GitHub Pages
1. Create a new repository and upload **all files from this folder** (keep `data/`, `src/`, `.nojekyll`).
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
3. Open `https://<your-username>.github.io/<repo-name>/` after a minute.

Local preview: `python3 -m http.server 8000` and open http://localhost:8000.

## Test list
| # | Topic |
|---|-------|
| 1–4 | Child protection law (Punjab, UNCRC, Pakistan laws) |
| 5–6 | Social work I & II / welfare / research |
| 7 | Psychology and child development |
| 8 | Sociology |
| 9 | Criminology and juvenile delinquency |
| 10 | Subject mock (scenarios) |
| 11–13 | Pakistan Studies, Constitution and governance, Islamiat |
| 14–15 | Current affairs (Pakistan, world) |
| 16–19 | Science and IT, English, Urdu, Mental ability and maths |
| 20 | Full mock paper |

## Editing questions
Questions live in `src/tNN.txt`, one per line:

```
question|correct answer|wrong 1|wrong 2|wrong 3|explanation
@question|A|B|C|D|answerIndex(0-3)|explanation      (fixed option order)
```
Then run `python3 build.py` to regenerate `data/*.js` (it checks that each test has exactly 50 questions, and shuffles answer positions with a fixed seed).

## Important
These are predicted questions, not official past papers. Verify law sections, helpline numbers, office-holders and current affairs against the bare Acts, the PPSC syllabus/advertisement and recent news before the exam.
