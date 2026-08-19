# GitHub repository setup

**Repo:** https://github.com/KangaZero/tokenmaxxingman

---

## 1. Adding the `NPM_TOKEN` secret

The release workflow reads `secrets.NPM_TOKEN`. Without it, the publish step
fails with an authentication error.

### Get an npm Automation token

1. Go to: https://www.npmjs.com/settings/YOUR_NPM_USERNAME/tokens
   (replace `YOUR_NPM_USERNAME` with your npm account username)
2. Click **"Generate New Token"** → **"Automation"**.
   - Use **Automation** type, not Publish. Automation tokens bypass the 2FA
     prompt, which a non-interactive workflow cannot answer.
3. Copy the token immediately — it is shown only once.

### Add the secret to the repository

1. Go to: https://github.com/KangaZero/tokenmaxxingman/settings/secrets/actions
   (Settings → Secrets and variables → Actions)
2. Click **"New repository secret"**.
3. Fill in:
   - **Name:** `NPM_TOKEN`
   - **Secret:** paste the Automation token you copied above
4. Click **"Add secret"**.

The secret is now available to the release workflow as
`${{ secrets.NPM_TOKEN }}`.

---

## 2. Branch protection for `main` (recommended)

`main` is the default branch. Protect it to prevent accidental direct pushes.

1. Go to: https://github.com/KangaZero/tokenmaxxingman/settings/branches
2. Click **"Add branch protection rule"** (or edit the existing rule).
3. Set **Branch name pattern:** `main`
4. Enable the following:
   - **Require a pull request before merging**
     - Require at least 1 approval
   - **Require status checks to pass before merging**
     - Search for and add exactly: `ci / Node 22` and `ci / Node 26.2`

       These names are derived, not chosen. `ci.yml` names the job
       `Node ${{ matrix.node-version }}` and the matrix is `['22', '26.2']`, so
       the checks GitHub reports are `ci / Node 22` and `ci / Node 26.2`. Read
       the matrix out of `.github/workflows/ci.yml` before typing anything here,
       and re-read it whenever the matrix moves. A required check that no job
       ever reports does not fail — it stays pending, and every pull request
       against `main` is blocked permanently with no failing check to point at.
       This is the single most effective way to lock yourself out of your own
       repository.
   - **Do not allow bypassing the above settings**
   - **Allow force pushes:** leave OFF
   - **Allow deletions:** leave OFF
5. Click **"Save changes"**.

With this in place, every PR must pass the full CI matrix before it can be
merged: typecheck, lint, test, and build for the CLI, plus typecheck and build
for the web app, on Node 22 and 26.2.

---

## 3. Triggering the release workflow

After merging to `main` and tagging a release (see `DEPLOY.md` section 4):

1. Go to: https://github.com/KangaZero/tokenmaxxingman/actions/workflows/release.yml
2. Click **"Run workflow"** (top right of the workflow list).
3. Select the branch or ref to publish from.
4. Click the green **"Run workflow"** button.

The workflow runs `pnpm install --frozen-lockfile` → `pnpm run typecheck` →
`pnpm run lint` → `pnpm test` → `pnpm run build` → `pnpm publish`. Beyond the
`NPM_TOKEN` secret, no further setup is required.

Provenance attestation is **not** currently produced. `release.yml` already grants
`id-token: write`, which is the prerequisite, but the attestation itself is opt-in
per publish and neither `publishConfig.provenance` nor a `--provenance` flag is
set. See the open decision at the end of `DEPLOY.md`.
