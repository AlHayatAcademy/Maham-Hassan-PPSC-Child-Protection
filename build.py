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
 (1,"Punjab Act I: Sections 1-23","PDNCA 2004: preliminary, definitions, Bureau, Board, Director General, courts","Child Protection Act","#7c3aed"),
 (2,"Punjab Act II: Sections 24-51","Rescue, custody, offences and penalties, fund, miscellaneous","Child Protection Act","#db2777"),
 (3,"Punjab Act III: Numbers & One-liners","Rapid-fire drill: parts, periods, amounts, ages, who is who","Child Protection Act","#e11d48"),
 (4,"UNCRC & International Child Rights","Convention articles, protocols, ILO, SDGs, international days","Child Rights & Law","#0ea5e9"),
 (5,"Pakistan Child-Related Laws","JJSA, PPC, Zainab Alert, labour, marriage, education, Constitution","Child Rights & Law","#16a34a"),
 (6,"Child Protection Practice I","CPO duties, interviewing, rescue, referral, case management","Child Rights & Law","#f59e0b"),
 (7,"Child Protection Scenarios","Situation-based questions, health, welfare, abbreviations","Child Rights & Law","#ef4444"),
 (8,"Child Protection Concepts & Policy","Abuse types, alternative care, trafficking, prevention","Child Rights & Law","#8b5cf6"),
 (9,"Social Work I","Methods, casework, group work, community organization, theory","Social Sciences","#06b6d4"),
 (10,"Social Work II & Welfare","Counselling, NGOs, welfare, field practice, research","Social Sciences","#f97316"),
 (11,"Psychology & Child Development","Piaget, Erikson, Freud, learning, trauma, behaviour","Social Sciences","#be123c"),
 (12,"Sociology","Concepts, family, culture, deviance, stratification, theorists","Social Sciences","#0d9488"),
 (13,"Criminology & Juvenile Delinquency","Theories, juvenile justice, probation, prevention","Social Sciences","#9333ea"),
 (14,"Pakistan Studies I","Pakistan Movement, history, geography basics","Pakistan Studies","#059669"),
 (15,"Constitution & Governance","Constitution of Pakistan, Punjab govt, public administration","Pakistan Studies","#2563eb"),
 (16,"Pakistan: History & Firsts","Pakistan firsts, leaders, treaties, wars, amendments","Pakistan Studies","#c026d3"),
 (17,"Pakistan: Geography & Economy","Rivers, mountains, dams, minerals, crops, cities, CPEC","Pakistan Studies","#0891b2"),
 (18,"Pakistan: Culture & Personalities","Festivals, languages, heroes, awards, sports, landmarks","Pakistan Studies","#ca8a04"),
 (19,"Islamic Studies I","Quran, Seerah, pillars, Khulafa, rights of children in Islam","Islamic Studies","#15803d"),
 (20,"Islamic Studies II","Hadith, fiqh, Islamic history, battles, prophets","Islamic Studies","#4f46e5"),
 (21,"Current Affairs: Pakistan I","Politics, economy, awards, sports, policies","Current Affairs","#dc2626"),
 (22,"Current Affairs: Pakistan II","Institutions, projects, laws, disasters, Punjab updates","Current Affairs","#7c3aed"),
 (23,"Current Affairs: World I","International orgs, summits, countries, days","Current Affairs","#db2777"),
 (24,"Current Affairs: World II","Leaders, conflicts, treaties, awards, sports events","Current Affairs","#0ea5e9"),
 (25,"World Geography I","Continents, countries, capitals, rivers, oceans","GK & Geography","#16a34a"),
 (26,"World Geography & History II","Landmarks, deserts, lakes, world history, wars","GK & Geography","#f59e0b"),
 (27,"GK: Organizations, Inventions, Awards","UN agencies, inventions, Nobel, treaties, abbreviations","GK & Geography","#ef4444"),
 (28,"GK: Personalities, Books, Landmarks","Famous people, authors, monuments, firsts, sports","GK & Geography","#8b5cf6"),
 (29,"Everyday Science I","Physics, chemistry, biology, health, basics of IT","Science & Computer","#06b6d4"),
 (30,"Everyday Science II","Human body, diseases, units, elements, space, environment","Science & Computer","#f97316"),
 (31,"Computer Skills I","Hardware, software, MS Word, shortcuts","Science & Computer","#be123c"),
 (32,"Computer Skills II","MS Excel, PowerPoint, formulas, file formats","Science & Computer","#0d9488"),
 (33,"Computer Skills III","Internet, email, networking, number systems, security","Science & Computer","#9333ea"),
 (34,"English I","Grammar, vocabulary, idioms, one-word substitution","English","#059669"),
 (35,"English II: Grammar & Voice","Tenses, voice, narration, articles, prepositions","English","#2563eb"),
 (36,"English III: Vocabulary","Synonyms, antonyms, analogies, confused words","English","#c026d3"),
 (37,"English IV: Idioms, Spelling & Errors","Idioms, phrases, spelling, sentence correction","English","#0891b2"),
 (38,"Urdu I / اردو","Urdu literature, grammar, proverbs, poets","Urdu","#ca8a04"),
 (39,"Urdu II / اردو","Poets, prose writers, books, idioms","Urdu","#dc2626"),
 (40,"Urdu III / اردو","Grammar, synonyms, antonyms, proverbs, mazameen","Urdu","#7c3aed"),
 (41,"Mental Ability & Maths I","Series, ratio, percentage, reasoning, analogies","Maths & Reasoning","#db2777"),
 (42,"Mental Ability & Maths II","Arithmetic, algebra, geometry, time-work, data","Maths & Reasoning","#0ea5e9"),
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
        r["c"] = group
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
