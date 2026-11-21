---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/trainer","src/app/anmelden"]
---

# Surface: whole app (student home, login, nav, trainer screens)

Mode: Operate. Student home is the primary surface (phone, at home); trainer screens share the system.

Audience/job: kids and teens open their assigned videos and check them off; trainers add, assign and see who is done.
Constraints: German copy, du-form, light/dark/system toggle stays, all existing CRUD behaviour stays.

## Direction contract

THESIS: The category standard of a friendly learning app, executed at Duolingo's craft level: progress is the one thing you see first. Refuses shadcn's neutral grey defaults (Geist, black primary, hairline cards).

OWN-WORLD: (Palette changed by the user on 2026-11-21: indigo → raspberry; green → plum for "done".) Blush-tinted ground (hue 350, never grey), one committed raspberry primary, plum owns "done" and nothing else, brick red only for destructive. Figtree throughout, heavy 800 headings. Radius ~17px on surfaces, 12px on controls, 44px+ touch targets, soft tinted shadows, mauve-tinted secondary text.

STORY: The student sees how much is done, watches the next open video, taps the solid "Als erledigt markieren" and sees the card fold into a plum "Erledigt" row and the bar move; a mis-tap is undone with "Rückgängig". The trainer sees per exercise who has checked it off.

FIRST VIEWPORT: Phone: sticky nav with wordmark; "Hallo <Name>" heading with the assigning trainer's name in the subtitle; progress card (large done numeral + bar); then the first category heading and its first open exercise card: video poster, title, full-width primary toggle below.

FORM: canon (standing exit), seed: 7e8583015d6b55b1. Craft bar: Duolingo.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
