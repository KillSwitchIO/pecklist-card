# Releasing

The card is developed on GitLab and installed from its GitHub mirror, where HACS looks. A release
is a plain `x.y.z` tag that matches `package.json`; the built `pecklist-card.js` is attached to the
GitHub release, not kept in the repository.

## Once, before the first release

- [ ] The GitLab project is public and mirrors one way to `KillSwitchIO/pecklist-card`.
- [ ] On GitHub: a description, topics (`home-assistant`, `hacs`, `lovelace`, `dashboard`,
      `custom-card`, `pecklist`), and issues turned on. HACS checks all three.
- [ ] GitHub recognises the license as MIT.
- [ ] The README's screenshots show on GitHub (HACS requires images for a dashboard card).
- [ ] The card has run on a real Home Assistant for a while, installed as a HACS custom
      repository.

HACS looks for `pecklist-card.js` in `dist/`, then in the latest release, then in the repository
root. This repository keeps none in git, so the HACS check on GitHub can only pass once a release
exists: make the first release, then run the **Validate** workflow by hand and see it green.

## Every release

1. Decide the version: a new feature is a minor release, a fix a patch.
2. If the card uses something new from the integration (a websocket field or command), check the
   integration release that has it is out, and say which in the changelog.
3. On a branch:
   - `npm version x.y.z --no-git-tag-version` (sets `package.json` and the lockfile);
   - in `CHANGELOG.md`, move the notes under **Unreleased** to a heading for the version and date.
4. Run everything, and look at the result:

   ```bash
   npm ci
   npm run build && npm run lint && npm test
   npm run demo        # open dist/demo.html in light and dark
   ```

5. Merge to `main`, wait for the GitLab pipeline, then tag the merge commit `x.y.z` (no `v`) and
   push the tag.
6. The tag mirrors to GitHub, where the **Release** workflow builds the card from the tag, attests
   it, and publishes the GitHub release with `pecklist-card.js` attached.
7. Update the card on a Home Assistant through HACS, reload the browser, and check a dashboard.
   Home Assistant caches the old file hard: HACS changes the resource address for you, a manual
   install needs a new `?v=` on it.

## If a release is bad

Publish a fixed patch release. Do not delete or move a tag: HACS users may already have it.
