# TODO — Rami

Outstanding tasks gathered from across the projects.

## ghosttooth.labidi.eu

### Version 3 (not started yet)
1. **Separate category for gaming / work-related devices**
   - Could fall under surveillance, tracking or normal devices.
   - Some are similar to the Quest or Bluetooth speakers.
   - Give this category its own colour.
2. **Extra information from devices found**
   - Collect battery info when available, e.g. `0000180f-0000-1000-8000-00805f9b34fb` (Battery Service).
   - Potentially also read `0000180a-0000-1000-8000-00805f9b34fb` (Device Information).
3. **Add subcategories**
   - Show them on the side of the screen when width allows.
   - Display "Cars", "Phones", "Car chargers", "shavers", … when recognised.
   - See `./test.html` for example devices.

### From labidi.eu todo
- Add **West-Vlaams** language to the website.
- Add cute, non-intrusive, famous easter eggs (hidden, not easily noticed).
- Ghosttooth has been moved to **ghosttooth.labidi.eu** (done — verify all references).

## labidi.eu (start page)
- Keep the projects catalogue up to date (`js/projects.js`).
- Temporal Portal easter egg is live (`js/egg.js`): each click picks randomly
  from hyperjump, UFO abduction, passport stamp or wormhole greeting.

## Done
- [x] Move Mail Ward (the SPF/DKIM/DMARC guide + email header analyzer + volume
      dashboard) out of rami.party/workshop/mail-ward/ to mail.labidi.eu; old paths
      (incl. workshop/mailheaders/ and workshop/trace-results/) are redirect stubs —
      no tombstone service worker needed, it was never a PWA. Listed in `js/projects.js`.
- [x] Move ghosttooth to ghosttooth.labidi.eu.
- [x] note.labidi.eu code editor finished.
- [x] Move Markdown Studio out of rami.party/workshop/md/ to md.labidi.eu, now
      trilingual (EN/NL/FR) and listed in `js/projects.js`.
- [x] Rebuild the notes/todo app from note.lebon.info as **Daily Board** on
      todo.labidi.eu — matching the note/md house style, PWA, twelve themes,
      export/import, all lebon.info branding removed. Listed in `js/projects.js`.
- [x] Move the Phonetic Alphabet Studio out of rami.party/gallery/militaryalphabet/
      to alphabet.labidi.eu; old path left as a redirect + tombstone service worker,
      entry in `js/projects.js` repointed (its description was wrong — it called the
      tool a wake-lock page).
- [x] Ghosttooth v2 enchanted grimoire redesign.
- [x] Consolidate all references to ghosttooth (remove legacy lebon.it / lebon.info).
