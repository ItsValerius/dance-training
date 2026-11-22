---
name: Tanztraining
description: A friendly learning app where dance students watch their trainer's exercises and check them off.
colors:
  background: "oklch(0.975 0.01 350)"
  foreground: "oklch(0.27 0.05 350)"
  card: "oklch(1 0 0)"
  primary: "oklch(0.55 0.2 2)"
  primary-foreground: "oklch(0.99 0.005 350)"
  secondary: "oklch(0.94 0.035 355)"
  secondary-foreground: "oklch(0.45 0.15 355)"
  muted: "oklch(0.95 0.015 350)"
  muted-foreground: "oklch(0.48 0.04 350)"
  border: "oklch(0.9 0.02 350)"
  input: "oklch(0.86 0.03 350)"
  ring: "oklch(0.65 0.18 2)"
  destructive: "oklch(0.5 0.17 28)"
  success: "oklch(0.45 0.15 320)"
  success-foreground: "oklch(0.99 0.01 320)"
  success-soft: "oklch(0.95 0.03 320)"
  success-ink: "oklch(0.4 0.13 320)"
typography:
  display:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  heading:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.33
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
  title:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.375
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "\"tnum\""
  numeral:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  label:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.43
  button:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.33
rounded:
  md: "9.6px"
  lg: "12px"
  xl: "16.8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.muted}"
  button-ghost:
    textColor: "{colors.foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.muted}"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "4px 14px"
    height: "44px"
  surface:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "20px"
  surface-done:
    backgroundColor: "{colors.success-soft}"
  done-row:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
    height: "56px"
  welcome-card:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.xl}"
    padding: "20px"
  play-disc:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    size: "64px"
  done-disc:
    backgroundColor: "{colors.success}"
    textColor: "{colors.success-foreground}"
    rounded: "{rounded.full}"
    size: "56px"
  done-status:
    textColor: "{colors.success-ink}"
    typography: "{typography.body}"
    height: "44px"
  done-status-disc:
    backgroundColor: "{colors.success}"
    textColor: "{colors.success-foreground}"
    rounded: "{rounded.full}"
    size: "28px"
  progress-toast:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "12px 12px 12px 16px"
    width: "448px"
  skeleton:
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.lg}"
  badge:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
    height: "24px"
  nav-link:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
  nav-link-active:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
  progress-track:
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.full}"
    height: "16px"
  progress-fill:
    backgroundColor: "{colors.success}"
    rounded: "{rounded.full}"
  status-chip:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  status-chip-done:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success-ink}"
---


# Design System: Tanztraining

## Overview

**Creative North Star: "The Practice Card"**

A friendly, category-standard learning app built to the craft bar of the best consumer learning products. Every screen is a stack of soft white cards on a warm blush ground, and the first thing a student sees is how much is done. One committed raspberry carries brand and action; plum appears only when something is finished, so checking off an exercise visibly changes the page: the card itself turns into its plum done row.

Density is relaxed and thumb-first: 44px controls, a full-width check-off button on every open exercise, open work shown in full while finished work folds away, a single narrow reading column for students, and for trainers searchable tables whose creating and picking happens in dialogs. Type is a single family, Figtree, with heavy 800 page headings and bold 700 section and card titles, so hierarchy comes from weight rather than size jumps. Every neutral is tinted from the blush hue; there is no flat grey in the system.

The system deliberately replaces shadcn's stock neutral theme (Geist, near-black primary, hairline flat cards): the components keep their shadcn structure but every token, radius and shadow is restyled.

**Key Characteristics:**
- Warm blush ground, white raised surfaces, plum-ink text and blush-tinted borders.
- One raspberry action color; plum reserved exclusively for "done"; brick red for delete, kept visibly apart from the brand.
- Figtree throughout; 800 for page headings, 700 for titles, 600 for labels and buttons.
- Two corners: about 17px on cards and surfaces, 12px on controls; pills for chips and nav.
- Soft, blush-tinted ambient shadows; never hard offsets.
- 44px minimum touch targets.
- Motion that explains state: the check-off morph, rows that open smoothly, one celebration burst when the last exercise is ticked, entrances that decelerate and exits that are shorter.
- Nothing moves under the thumb: once a student starts a video or ticks something, the page order holds still until the next visit.

## Colors

A warm one-family world: every neutral sits on blush hue 350, the raspberry primary on hue 2, and a single plum family (hue 320) set apart for completion. Light-mode values are the frontmatter tokens; a full dark theme (`.dark`) remaps each token to the same hues at inverted lightness (see sidecar).

### Primary
- **Raspberry** (`primary`, about #C62468): the wordmark, primary buttons (including the open done toggle "Als erledigt markieren" and the toast's "Nächste Übung"), the video play disc, checked checkboxes, the empty-state icon, links on auth pages, focus rings (via `ring`), text caret and selection tint. Carries white text. The one voice of action and brand.
- **Raspberry Ink on Blush** (`secondary` / `secondary-foreground`): category badges, the active nav pill and the one-time welcome card (with a 30% raspberry border). A quiet tint of the primary, never a second accent.

### Tertiary
- **Done Plum** (`success`): the progress-bar fill and the solid check discs (28px in the "Erledigt" status, 40px in the progress toast, 56px in the all-done card, plus its burst ring). Carries white text. The token keeps the semantic name `success`.
- **Done Lilac** (`success-soft`): the ground of finished-exercise rows and the all-done progress card (both with a 40% plum border).
- **Done Plum Ink** (`success-ink`): plum text and icons on done items ("Nochmal ansehen", check and chevron), the bold "Erledigt" status and its ghost "Rückgängig" button, "Alles geschafft!" and its line, a category count once the category is complete, per-exercise "n erledigt" counts and done student chips on trainer pages.

### Neutral
- **Blush Mist** (`background`): the page ground.
- **Paper White** (`card`): every raised surface, inputs, outline buttons, the sticky nav bar.
- **Plum Ink** (`foreground`): body and heading text.
- **Mauve Slate** (`muted-foreground`): secondary text, subtitles, counts, inactive nav links.
- **Blush Haze** (`muted`): hover fills, the progress track, open student chips, video placeholders.
- **Blush Hairline** (`border`) and **Blush Field Stroke** (`input`): surface borders and dividers; control strokes and the scrollbar thumb.
- **Brick** (`destructive`, hue 28): errors and delete actions, used as text on a 10% tint, not as a solid fill. Warmer and more orange than the raspberry so "delete" never reads as brand.

### Named Rules
**The Plum Means Done Rule.** Plum (`success*`) marks completion and nothing else: no plum for "save", links, generic success toasts, or decoration. The check-off progress toast is plum because it reports completion, not because an action succeeded. Its scarcity is what makes ticking an exercise feel like progress.

**The No Grey Rule.** Every neutral carries blush chroma (hue 350). Never introduce a zero-chroma grey; pure white is allowed only for raised surfaces.

**The Brick Is Not Brand Rule.** Destructive stays on the brick hue (28), never on the raspberry hue, so a delete action can't be mistaken for the primary action.

## Typography

**Display Font:** Figtree (with ui-sans-serif, system-ui)
**Body Font:** Figtree

**Character:** A rounded, friendly geometric sans used at four weights. Heavy 800 headings give the app its confident, game-like voice; body stays regular and readable.

### Hierarchy
- **Numeral** (800, 2.25rem, -0.025em): the done count in the student progress card, the single largest glyph in the app.
- **Display** (800, 1.875rem, 1.2, -0.025em): trainer page headings ("Übungen", an exercise title), balanced wrap.
- **Heading** (800, 1.5rem, -0.025em): student and error page headings ("Hallo, Mia!", "Etwas ist schiefgelaufen"), "Alles geschafft!", the auth wordmark (raspberry) and auth card titles.
- **Headline** (700, 1.25rem): trainer section headings and the empty-state title.
- **Title** (700, 1.125rem, 1.375): exercise card titles (break-words, hyphens-auto for long German compounds), the "von N erledigt" tail of the progress line. Student category headings use 800 at this size, followed by an inline 600 label count ("1/2") that turns Done Plum Ink when the category is complete. The nav wordmark and the welcome line use 800 at 1.125rem.
- **Body** (400, 1rem, 1.5): descriptions and form text, tabular numerals globally.
- **Label** (600, 0.875rem): nav links, counts, status lines, badges (0.75rem).
- **Button** (600, 15px): all button text.

### Named Rules
**The Weight Not Size Rule.** Hierarchy steps by weight (800 / 700 / 600 / 400) over a narrow size range (0.75rem to 1.875rem). The one exception is the Numeral: on the student home the done count outranks the greeting, because progress is the first thing a student should see. Don't add other large sizes or a second family.

## Layout

Every page is a centered column with a 16px side gutter, 24px top and 64px bottom padding; the page reserves the scrollbar gutter (`scrollbar-gutter: stable`) so short and long pages don't shift sideways. The student home is a single 42rem column at every width: the "Hallo" greeting, the optional welcome card, then one block per current plan, 40px apart. Plans with open work come first; a plan already finished when the page loads folds into one Done Lilac row ("Woche 2 · alles geschafft") that opens to the full plan. Plan order and folding are fixed for the visit, so ticking a plan's last exercise celebrates in place. Each plan block is the plan title (h2, Heading size) with a Mauve Slate line "Bis <date> · von <trainer who made the plan>", its progress card, then its categories (h3, Body size, bold) stacked 32px apart. Categories with open work come first, but that order freezes on the first video play or the first tick or undo of a visit, and an exercise whose video was started keeps its form (card or row) until reload, so nothing moves under the thumb and a playing video never unmounts. In each, the heading sits 12px above a one-column list of open exercise cards (20px gaps), followed by the finished exercises as collapsed rows 8px apart. An exercise that also sits in another current plan says so under its title ("Auch in Woche 2"). Past plans (`/verlauf/<id>`) reuse the same view read-only: "Vorbei seit <date>" and no done toggles. Auth pages (login, invite, password reset) center a 24rem card under the wordmark, with a footer link below; every route has a skeleton loading state shaped like its page; on the student home each text placeholder sits in a box of the real line height so nothing shifts when content arrives. Trainer pages cap at 64rem and stack sections 24px apart. Trainer list pages (Pläne, Übungen, Schüler) are a heading row with the create button at its right end, then a toolbar (search plus filter) over a data table; columns that don't fit a phone fold into lines under the row title. Detail pages put every action at the right end of its heading row: the page heading carries Bearbeiten and Löschen (icon-only below 640px so they fit beside the title), each section heading carries its one action ("Übungen hinzufügen", "Zuweisen"). Nothing is edited inline on a detail page: editing, adding and assigning open dialogs. The exercise detail page shows the video (max 48rem) and description, then "Pläne" with per-plan done status per student. The nav is sticky, full-bleed white with a bottom hairline; on phones the links move into a right-side menu sheet with 48px rows.

Scrolling is smooth (`scroll-behavior: smooth`, `auto` under reduced motion); exercise cards carry `scroll-mt-20` so a scrolled-to card clears the sticky nav. The viewport uses `viewport-fit=cover` so the bottom toast can clear the home indicator via `env(safe-area-inset-bottom)`.

Spacing rhythm is a 4px base: 4, 8, 12, 16, 20 and 32px are the steps actually used. Card interiors are 20px (16px for exercise-card bodies and list rows).

## Elevation & Depth

A hybrid of tonal layering and soft shadow: white surfaces sit on the tinted ground with a 1px blush hairline plus a two-layer ambient shadow tinted with the blush shadow color (`345 40% 25%`, near-black `345 50% 4%` in dark). Depth is quiet and constant; there are no hover lifts. The one exercise being checked off paints above anything moving past it during the morph.

### Shadow Vocabulary
- **Surface** (`0 1px 2px hsl(345 40% 25% / 0.06), 0 6px 16px -4px hsl(345 40% 25% / 0.08)`): every card, list panel, check-list fieldset and progress card.
- **Primary press** (`0 2px 6px -1px hsl(345 40% 25% / 0.25)`): under the primary button.
- **Play disc** (`0 4px 16px -2px hsl(345 40% 25% / 0.45)`): under the raspberry play disc on video posters.

### Named Rules
**The Soft Lift Rule.** Shadows are diffuse, tinted with the blush shadow color, and offset only downward by a few pixels. Never a hard, zero-blur offset.

## Shapes

Generously rounded, on two steps. Containers (cards, panels, the progress card, popovers) use about 17px (`rounded.xl`, 1.4x the 0.75rem base radius); the check-off morph clips to the same corner, so a card never shows square edges mid-transition. Controls (buttons, inputs, textareas, select triggers) and hover rows inside panels use the 12px base (`rounded.lg`), so a control sits visibly inside its card's curve. Compact buttons use 9.6px, checkboxes 6px; dialogs and a standalone video use about 22px. Skeleton blocks take the shape of what they stand in for: 12px for controls, pills for text lines (the student home uses 9.6px bars inside line-height boxes). Badges, nav links, status chips and the progress bar are full pills. Videos inside a card are clipped by the card's corner (square themselves).

## Components

Motion across components uses three easing tokens: **enter** (`cubic-bezier(0.16, 1, 0.3, 1)`, decelerating) for anything appearing, **exit** (`cubic-bezier(0.3, 0, 0.8, 0.15)`, accelerating, and always shorter than its entrance) for anything leaving, and **move** (`cubic-bezier(0.2, 0, 0, 1)`) for things changing place on screen. Under `prefers-reduced-motion` every keyframe animation, transition and view transition listed below is switched off.

### Buttons
Confident and tactile.
- **Shape:** 12px corner, 44px tall for every app action (48px `lg` on the login submit only).
- **Primary:** raspberry fill, white text, 600 weight at 15px, soft press shadow; hover drops to 90% opacity; presses nudge down 1px (150ms).
- **Outline:** white fill with the field stroke; hover fills with Blush Haze.
- **Ghost:** transparent with haze hover; the light/dark toggle, sign-out, and "Rückgängig" (in Done Plum Ink) next to the done status.
- **Destructive:** brick text on a 10% brick tint, never a solid fill.
- **Focus:** ring-colored border plus a 3px ring at 50%.

### Chips (Badges)
- **Style:** 24px pill, 600 weight at 0.75rem; the trainer list uses the blush `secondary` variant for categories. Passive states (a plan's "abgelaufen") use the outline variant with Mauve Slate text, never raspberry.

### Cards / Containers
- **Corner Style:** about 17px.
- **Background:** Paper White; done surfaces (finished rows, a finished exercise held as a card because its video was played, the all-done card) switch to Done Lilac with a 40% plum border.
- **Shadow Strategy:** Surface shadow (see Elevation).
- **Border:** 1px Blush Hairline; lists inside a surface divide rows with the same hairline.
- **Internal Padding:** 20px (12px for the small card size).

### Inputs / Fields
- **Style:** white fill, 1px field stroke, 12px corner, 44px tall, 14px horizontal padding, 1rem text.
- **Focus:** ring-colored border plus a 3px ring at 50%.
- **Error / Disabled:** brick border with a 20% brick ring; 50% opacity.
- **Checkbox:** 20px square with a 6px corner (it must never read as a radio or as the round done disc), 2px field stroke, fills raspberry when checked; its row label is a 48px-tall hover row.
- **Password field:** every password input (login, invite, new password) carries a 44px eye button inside its right edge (`aria-pressed`, "Passwort anzeigen" / "verbergen"), Mauve Slate turning Plum Ink on hover; the field pads 48px on the right to make room.
- **Login identity field:** a single field labelled "E-Mail" (it may be a parent's address).
- **Field hints:** one short Mauve Slate line under the field, tied with `aria-describedby`.

### Navigation
- **Style:** sticky white bar, 1px bottom hairline; the wordmark "Tanztraining" in 800 raspberry at 1.125rem; a ghost light/dark toggle; user name in 600 Mauve Slate.
- **Links:** 44px-tall pills, 16px horizontal padding, 600 at 0.875rem; inactive Mauve Slate with haze hover; active is the blush pill with `aria-current`.

### Dialogs
- **Scrim:** the shadow color at 32% (`hsl(var(--shadow-color) / 0.32)`), no blur; dialogs, confirm dialogs and the phone menu sheet share it. Never a flat black wash.
- **Panel:** Paper White, about 22px corner, 1px hairline, a soft two-layer lift tinted with the shadow color; the close button is a 44px ghost icon.
- **Header:** title in 700 at Title size; the description is one short line, never a paragraph. Explanations that don't fit one line belong in a field hint or nowhere.
- **Footer:** secondary action left, primary right from 640px; stacked full-width on phones.
- **Edit triggers:** outline button with a pencil; create triggers are primary with a plus.

### Pick List
The way trainers choose several things at once (exercises for a plan, groups and students for a plan): a checklist inside a surface, scrolling at most 24rem or half the viewport, with a search box above once there are more than six rows. Rows are 48px hover labels: checkbox, the name in 600, optional category chips, and a Mauve Slate hint at the right end (member count, email). Picked rows take a 60% blush tint. Sections ("Gruppen", "Schüler") get sticky 600 Mauve Slate labels. The exercise picker's footer holds "Neue Übung" on the left, which swaps the same dialog to the create form ("Zur Liste" returns), and "Hinzufügen" on the right, naming the count when several are picked. The assignment picker edits a draft: "Fertig" saves it, "Abbrechen", Escape or the close button discard it; the page shows "Wird gespeichert…" while saving and only an error after, in a polite live region.

### Data Table
White surface, header row 48px with 600 labels; sortable headers are 44px ghost buttons with an arrow icon (faded when unsorted). Body rows are at least 52px with 12px vertical padding; the whole row opens the item, and the title cell is still a real link for keyboard users. Only the title cell wraps. The Pläne table shows Fällig, Übungen, Für (groups, then students assigned directly) and Erledigt (`finished/reached fertig` over a 6px plum bar, Done Plum Ink when everyone is done).

### Done Toggle (signature)
Two states that deliberately look different, so a double tap can never silently un-tick. Open: a full-width 44px primary (raspberry) button with a circle icon, "Als erledigt markieren". Done: not a button but a status line with no box or fill, a 28px Done Plum disc holding a bold check (zooms in from 50% over 300ms on the enter curve) and "Erledigt" in bold Done Plum Ink; beside it a ghost "Rückgängig" button with an undo icon, also in Done Plum Ink. Both buttons carry `data-toggle`, and their accessible names start with the visible label and add the exercise title. It updates optimistically and reports each change to the list (`onToggle`). On failure the state reverts and a 0.875rem brick line ("Hat nicht geklappt…", `role=alert`) appears centered underneath.

### Check-off Morph (signature)
Checking off an exercise turns its card into its done row (and unchecking turns it back) with a React `<ViewTransition>` shared by name per exercise. The group resizes over 380ms on the move curve, clipped to the 17px container corner; both snapshots stay unscaled and top-aligned so the size change does the morph. The new snapshot stays fully opaque (normal blending) and covers the old one, which fades out in 120ms only where it sticks out, so content never shows twice and moving items never turn see-through. Stacking while moving: the exercise being checked off on top (z-index 2), category headings next (z-index 1), everything else below. Category headings are named too, so they travel with their list when categories reorder; everything else on the page crossfades in 180ms. Because the pressed button unmounts when an exercise changes form, keyboard focus then moves to the exercise's new control: the row's summary, else its toggle. Under reduced motion the view transition is removed and the old snapshot hidden, so the state swaps instantly.

### Video Poster
Poster first: the YouTube thumbnail fades in over 300ms (enter) once loaded, filling a 16:9 Blush Haze box with a 10% foreground scrim (20% on hover) and a centered 64px raspberry play disc with the Play-disc shadow that scales to 1.05 on hover and 0.95 on press (200ms, enter). The privacy-enhanced player (nocookie, autoplay, no related videos) loads only after the tap, fades in over 300ms, and focus moves into it. Inside a card the box is square-cornered and clipped by the card.

### Finished Exercise Row
A finished exercise collapses to a native `<details>` row on Done Lilac: Done Plum Ink check icon, the title in 700, "Nochmal ansehen" in 600 Label and a chevron that rotates 180°. At least 56px tall; hovering deepens the plum border to 70%. Opening it shows the video, description and the done toggle, so a student can rewatch or undo. Where the browser can animate to `auto` (`interpolate-size`), the content opens and closes by height over 360ms on the enter curve with a 240ms fade; elsewhere it toggles instantly. "Nochmal ansehen" fades out (200ms) while the row is open, keeping its space; below 640px it is visually hidden (screen-reader only) to leave room for the title. Rows end their accessible title with ", erledigt", and category counts read "n/m erledigt".

### Progress Toast
After a check-off, a white surface toast (max 28rem, 16px from the bottom or the safe-area inset, whichever is larger) waits 400ms, until the morph has landed, then fades and slides up 16px over 300ms on the enter curve: a 40px plum check disc, "n von N erledigt" in 700 over a thin 8px progress bar, and, while something is still open, a primary 44px "Nächste Übung ↓" button that scrolls the next open card into view and focuses its first control (the video play button). It stays 6s with the button (3.7s without), holds while hovered or focused, and leaves in 200ms on the exit curve (fade, 8px down). When the tick finishes everything, no toast appears: the all-done card carries the moment and the live region only announces "Alles geschafft!". The `role=status` live region stays mounted so each change is announced.

### Welcome Card
Shown once after accepting an invite: a blush surface with a 30% raspberry border, "Willkommen bei Tanztraining!" in 800 and the login email in 800 inline.

### Progress Card (signature)
A surface whose lead is the done count as a Numeral, followed by "von N" in Mauve Slate and "erledigt" at Title size, over a 16px pill progress bar whose plum fill grows its width over 500ms on the enter curve. Nothing else: no open count, no "continue" link. When nothing is open, the card becomes the all-done state: Done Lilac with a 40% plum border, a 56px plum check disc, "Alles geschafft!" at Heading size in Done Plum Ink and the line "Alle N Übungen erledigt. Neue Übungen erscheinen hier, sobald es welche gibt." The two states share one view-transition name (classes `celebrate` and `progress-swap`, group 380ms on the move curve): turning all-done, the progress card fades out in 160ms on the exit curve and the celebration pops in from 94% scale over 420ms on the enter curve after 120ms. Only right after a real tick (not on page load), one 4px plum ring bursts out of the disc (`.celebrate-burst`: scale 1 to 1.9 and 70% to 0 opacity over 700ms on the enter curve, 380ms delay); it is hidden under reduced motion. The trainer side reuses the bar at 6px in the Pläne table and on the plan page; on the exercise page each plan lists its students, finished ones in bold Done Plum Ink with a check, open ones in Mauve Slate.

## Do's and Don'ts

### Do:
- **Do** put every content group on a white surface with the Surface shadow and 1px hairline.
- **Do** keep all touch targets at least 44px tall.
- **Do** use plum only for completion: the progress fill, the done status, done rows, the all-done card, check discs and done counts.
- **Do** show open work in full and fold finished work into a row that can be reopened.
- **Do** keep the layout still once a student is working: freeze ordering on the first play or tick, and move focus to the new control when an element is replaced.
- **Do** tint every new neutral from blush hue 350.
- **Do** use the enter curve for appearing, the exit curve (shorter) for leaving, and the move curve for things changing place.
- **Do** honor reduced motion: the check-off morph, row open/close, progress fill, check zoom, all-done swap and burst ring, toast enter/exit, smooth scrolling, poster and player fades, label fade, chevron turn, play-disc scale and skeleton pulse all switch off under `prefers-reduced-motion`.

### Don't:
- **Don't** use plum for generic success, save confirmation or decoration, and don't bring back green for "done".
- **Don't** put destructive actions on the raspberry hue; delete stays brick.
- **Don't** introduce flat greys, near-black primaries, or the stock shadcn neutral theme.
- **Don't** use a second typeface or system display fonts; Figtree carries every role.
- **Don't** use hard, zero-blur offset shadows.
- **Don't** add uppercase eyebrows or kicker labels above headings; headings stand alone.
