# Working on the PeckList card

A Home Assistant dashboard card (TypeScript and Lit, bundled by esbuild into
`dist/pecklist-card.js`), installed through HACS as a Dashboard repository.

## Rules

- The card talks only to the PeckList integration's websocket commands (`pecklist/accounts`,
  `pecklist/subscribe`, `pecklist/task/*` in `killswitch10/pecklist-home-assistant`). Never to a
  PeckList server, so no key lives in the browser.
- `src/data.ts` has no DOM and no Home Assistant: filtering, sorting, grouping, the heatmap and
  date maths live there and test plainly. Days are `YYYY-MM-DD` strings, never `Date` objects in
  local time.
- "Today" comes from Home Assistant's time zone, not the browser's.
- An edit sends only the fields that changed.
- Follow the Home Assistant theme through its CSS variables; own colors go through the `--pl-*`
  variables in `src/styles.ts`. Check light and dark.
- Everything works by touch and by keyboard; controls are real buttons with labels. The wall tablet
  layout needs no keyboard at all.
- Sentence case in UI text. No layout shifts on hover or selection.
- Behavior changes come with tests in `tests/`, using the stand-in Home Assistant in
  `tests/fake-hass.ts`. Look at the result too: `npm run demo` builds `dist/demo.html`, the card
  over the same stand-in.
- Conventional Commits, signed commits, explicit `git add` paths.

## Commands

```bash
npm ci
npm run build && npm run lint && npm test
npm run demo
```

## Releases

`npm version <x.y.z>` (the tag has no `v` prefix, set in `.npmrc`). Pushing
the tag to GitLab mirrors it to GitHub, where `.github/workflows/release.yml` builds and attaches
`pecklist-card.js` to the release HACS installs.
