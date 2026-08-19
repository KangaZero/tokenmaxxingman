# Third-Party Notices

The `tokenmaxxingman` package itself is MIT licensed — see [`LICENSE`](./LICENSE).

Some vendored source in the marketing site (`web/`) carries a **different**
licence. That divergence is recorded here so it is discoverable from the
repository root rather than only from a nested directory.

Nothing in this file applies to the published npm package: `package.json`
`"files"` ships only `dist`, `data`, `skills`, `.claude-plugin`, `README.md`,
and `LICENSE`. The `web/` directory is not published.

---

## Canvas UI — MIT + Commons Clause License Condition v1.0

- **Copyright** (c) 2026 David Haz
- **Upstream** <https://github.com/DavidHDev/canvas-ui> · <https://canvasui.dev>
- **Full licence text** [`web/src/components/canvasui/LICENSE-canvasui`](./web/src/components/canvasui/LICENSE-canvasui)
- **Inventory and local modifications** [`web/src/components/canvasui/README.md`](./web/src/components/canvasui/README.md)
- **Vendored** 2026-08-19, from the project's shadcn registry at
  `https://canvasui.dev/r/<component>-vue.json`

### Files under this licence

| File | Registry component |
|------|--------------------|
| `web/src/components/canvasui/AsciiObject.vue` | `ascii-object-vue` |
| `web/src/components/canvasui/DitheredObject.vue` | `dithered-object-vue` |
| `web/src/components/canvasui/GlassObject.vue` | `glass-object-vue` |
| `web/src/components/canvasui/ParticleObject.vue` | `particle-object-vue` |
| `web/src/components/canvasui/rect-cache.ts` | shared internal module |

Each file carries an attribution header naming the component, its registry
name, the source URL, the author, the licence, the vendoring date, and the
local modifications applied.

### What the Commons Clause permits and forbids

The Commons Clause is an additional restriction layered on top of MIT. It
**permits** use of the components — including commercial use — inside an
application, website, or product. It **forbids** selling, sublicensing, or
redistributing the components themselves, "whether alone, in a bundle, or as a
ported version."

Shipping them as part of this marketing site is inside the grant.
Republishing them as a component library, a paid template, or a port to
another framework is not.

---

## Runtime and build dependencies

Ordinary npm dependencies are not reproduced here; their licences travel with
them in `node_modules` and are recorded in `pnpm-lock.yaml`. Two are worth
naming because the project's central claims rest on them:

- **`gpt-tokenizer`** (MIT) — the `cl100k_base` and `o200k_base` byte-pair
  encoding implementations the benchmark measures against. Pinned exactly, and
  excluded from automated dependency updates, so published figures stay
  reproducible.
- **`three`** (MIT) — the WebGL2 engine the Canvas UI 3D components render
  through.
