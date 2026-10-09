#!/usr/bin/env python3
"""Build data/*.js from src/tNN.txt.

Line formats (one MCQ per line, '|' separated):
  question|correct|wrong1|wrong2|wrong3|explanation      -> options are shuffled (seeded)
  @question|A|B|C|D|answerIndex(0-3)|explanation          -> options kept in the written order
Lines starting with '#' or blank lines are ignored.
Run:  python3 build.py
"""
import json, os, random, sys

META = [
 (1,"Punjab Child Protection Law I","Destitute & Neglected Children Act 2004, Bureau, courts, procedures","Child Protection Law","#7c3aed"),
 (2,"Punjab Child Protection Law II","Bureau operations, CPO duties, rescue, rehabilitation, case management","Child Protection Law","#db2777"),
 (3,"UNCRC & International Child Rights","Convention on the Rights of the Child, protocols, SDGs, treaties","Child Protection Law","#0ea5e9"),
 (4,"Pakistan Child-Related Laws","JJSA, PPC, Zainab Alert, labour, marriage, education, Constitution","Child Protection Law","#16a34a"),
 (5,"Social Work I","Methods, casework, group work, community organization, theory","Social Sciences","#f59e0b"),
 (6,"Social Work II & Welfare","Counselling, NGOs, welfare, field practice, research","Social Sciences","#ef4444"),
 (7,"Psychology & Child Development","Piaget, Erikson, Freud, learning, abuse, trauma, behaviour","Social Sciences","#8b5cf6"),
 (8,"Sociology","Concepts, family, culture, deviance, stratification, theorists","Social Sciences","#06b6d4"),
 (9,"Criminology & Juvenile Delinquency","Theories, causes, juvenile justice, probation, prevention","Social Sciences","#f97316"),
 (10,"Subject Mock I","Mixed subject paper: law + social sciences","Mock Papers","#e11d48"),
 (11,"Pakistan Studies","History, Pakistan Movement, geography, resources","General Knowledge","#059669"),
 (12,"Constitution & Governance","Constitution of Pakistan, Punjab govt, local govt, public admin","General Knowledge","#2563eb"),
 (13,"Islamiat","Quran, Seerah, pillars, rights of children and family in Islam","General Knowledge","#15803d"),
 (14,"Current Affairs Pakistan","Recent events, awards, sports, economy, policies","General Knowledge","#c026d3"),
 (15,"Current Affairs World & GK","International orgs, countries, awards, days, capitals","General Knowledge","#0891b2"),
 (16,"Everyday Science & IT","Physics, chemistry, biology, health, computers","General Knowledge","#ca8a04"),
 (17,"English","Grammar, vocabulary, idioms, one-word substitution, comprehension","General Knowledge","#4f46e5"),
 (18,"Urdu / اردو","Urdu literature, grammar, proverbs, poets","General Knowledge","#be123c"),
 (19,"Mental Ability & Maths","Series, ratio, percentage, reasoning, analogies","General Knowledge","#0d9488"),
 (20,"Full Mock Paper","Mixed paper in PPSC proportion","Mock Papers","#9333ea"),
]

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src")
OUT = os.path.join(HERE, "data")
os.makedirs(OUT, exist_ok=True)
errors = []

def parse(tid):
    path = os.path.join(SRC, "t%02d.txt" % tid)
    rows = []
    if not os.path.exists(path):
        errors.append("missing %s" % path); return rows
    rng = random.Random(1000 + tid)
    for ln, line in enumerate(open(path, encoding="utf-8"), 1):
        line = line.strip()
        if not line or line.startswith("#"): continue
        p = [x.strip() for x in line.split("|")]
        try:
            if p[0].startswith("@"):
                q = p[0][1:].strip(); opts = p[1:5]; a = int(p[5]); e = p[6]
                if len(p) != 7: raise ValueError("fixed needs 7 fields, got %d" % len(p))
            else:
                if len(p) != 6: raise ValueError("needs 6 fields, got %d" % len(p))
                q, good, w1, w2, w3, e = p
                opts = [w1, w2, w3]
                a = rng.randrange(4)
                opts.insert(a, good)
            if len(set(o.lower() for o in opts)) != 4: raise ValueError("duplicate options")
            if not (0 <= a <= 3) or not q or not e: raise ValueError("bad field")
        except Exception as ex:
            errors.append("t%02d line %d: %s" % (tid, ln, ex)); continue
        rows.append({"q": q, "o": opts, "a": a, "e": e})
    return rows

reg = []
total = 0
dist = [0, 0, 0, 0]
for tid, title, desc, group, color in META:
    rows = parse(tid)
    for r in rows:
        r["c"] = group if group == "Mock Papers" else title
    # allow tests to carry per-line category via nothing; keep simple
    for r in rows: dist[r["a"]] += 1
    if len(rows) != 50: errors.append("t%02d has %d questions (need 50)" % (tid, len(rows)))
    total += len(rows)
    with open(os.path.join(OUT, "t%02d.js" % tid), "w", encoding="utf-8") as f:
        f.write("window.TESTS=window.TESTS||{};window.TESTS[%d]=%s;\n" % (tid, json.dumps(rows, ensure_ascii=False)))
    reg.append({"id": tid, "title": title, "desc": desc, "group": group, "color": color})

with open(os.path.join(OUT, "registry.js"), "w", encoding="utf-8") as f:
    f.write("window.REGISTRY=%s;\n" % json.dumps(reg, ensure_ascii=False))

print("Total questions:", total, "| answer position A/B/C/D:", dist)
if errors:
    print("PROBLEMS:"); [print(" -", e) for e in errors]; sys.exit(1)
print("OK")
