# Vendored Canvas UI components

Third-party visual-effect components taken from [Canvas UI](https://canvasui.dev)
([DavidHDev/canvas-ui](https://github.com/DavidHDev/canvas-ui)), by David Haz —
the author of react-bits.

Everything in this directory is **third-party source**, not site code. Site-owned
glue lives one level up: `../CanvasStage.vue`, `../TokenBarsMotif.vue` and
`../../composables/useCanvasStage.ts`.

---

## Third-party attribution and licensing

| | |
|---|---|
| Upstream project | Canvas UI — https://canvasui.dev |
| Repository | https://github.com/DavidHDev/canvas-ui |
| Author | David Haz |
| Copyright | Copyright (c) 2026 David Haz |
| Licence | **MIT + Commons Clause License Condition v1.0** |
| Full licence text | [`./LICENSE-canvasui`](./LICENSE-canvasui) (verbatim upstream `LICENSE.md`) |

**This is not the same licence as the repository root.** The root
[`LICENSE`](../../../../LICENSE) is plain MIT. The files in this directory carry
MIT **plus** the Commons Clause restriction, which permits use — including
commercial use — inside an application, website or product, but forbids selling,
sublicensing or redistributing the components themselves, "whether alone, in a
bundle, or as a ported version."

Shipping them as part of this marketing site is squarely inside the grant.
Republishing them as a component library, a paid template, or a port to another
framework is not.

The repository owner should add a `THIRD-PARTY-NOTICES` entry recording this
divergence, so the mixed licensing is discoverable from the repository root
rather than only from this directory. Every file below also carries an
attribution header naming the component, author, licence and source URL.

---

## How these files got here

Not with the `shadcn` CLI. `web/` has no `components.json`, and the current CLI
targets Tailwind CSS v4 while this project is pinned to v3 — running it risks
rewriting `tailwind.config.ts` and breaking the build. Instead each component was
fetched from the registry and written out by hand:

```sh
curl -s https://canvasui.dev/r/registry.json                  # component index
curl -s https://canvasui.dev/r/ascii-object-vue.json | jq -r '.files[].content'
```

To refresh a component, re-fetch the payload and re-apply the local
modifications listed in that file's header.

---

## Inventory

All four are from the registry's **3D Effects** category, all four are **pure
WebGL2 via three.js**, and none touches the experimental **html-in-canvas** API —
so none depends on a Chrome origin trial or flag, and all four render on any
browser with WebGL2.

| File | Registry name | Source URL | Vendored | Browser support |
|---|---|---|---|---|
| `AsciiObject.vue` | `ascii-object-vue` | https://canvasui.dev/r/ascii-object-vue.json | 2026-08-19 | Pure WebGL2 (three.js) |
| `DitheredObject.vue` | `dithered-object-vue` | https://canvasui.dev/r/dithered-object-vue.json | 2026-08-19 | Pure WebGL2 (three.js) |
| `ParticleObject.vue` | `particle-object-vue` | https://canvasui.dev/r/particle-object-vue.json | 2026-08-19 | Pure WebGL2 (three.js) |
| `GlassObject.vue` | `glass-object-vue` | https://canvasui.dev/r/glass-object-vue.json | 2026-08-19 | Pure WebGL2 (three.js) |
| `rect-cache.ts` | *(not in the registry)* | https://raw.githubusercontent.com/DavidHDev/canvas-ui/main/src/lib/rect-cache.ts | 2026-08-19 | n/a (DOM helper) |

`rect-cache.ts` is a shared helper that `particle-object-vue` imports but the
registry payload neither ships nor declares in `registryDependencies`. It was
taken from the upstream repository so the import resolves.

### npm dependencies declared by the registry

| Package | Pinned version | Scope |
|---|---|---|
| `three` | `0.185.1` | `dependencies` |
| `@types/three` | `0.185.4` | `devDependencies` |

All four components share the same engine — no second 3D runtime is installed.

---

## Local modifications

Each file's header lists its own. Summarised:

1. **WebGL failure is reported, not swallowed.** Upstream's `create*` factory
   returns `null` when the renderer cannot get a WebGL2 context, and the Vue
   wrapper then leaves an empty canvas mounted. The wrappers now call
   `props.onError` in that case so `CanvasStage` can fall back to static markup.
2. **Draco removed.** `three/addons/loaders/DRACOLoader.js` resolves its decoder
   with `new URL(..., import.meta.url)` at module scope, so importing it alone
   makes Vite emit roughly 1.3 MB of decoder artefacts — and upstream's default
   `dracoDecoderPath` pointed at `gstatic.com`, a runtime fetch to a third party.
   This site never loads a Draco-compressed GLB, so the import, the wiring and
   the `dracoDecoderPath` option were all dropped. Uncompressed GLB/glTF, SVG and
   bitmap loading is untouched.
3. **`rect-cache` import repointed** to the co-vendored copy (`ParticleObject.vue`
   only).
4. Trailing whitespace stripped; attribution header prepended. Nothing else.

Upstream already handles the rest of this project's requirements properly, which
is why the diff is small: `prefers-reduced-motion` is honoured internally, the
render loop is `IntersectionObserver`-gated, and `destroy()` cancels the
`requestAnimationFrame` loop and disposes every geometry, material, texture,
render target, shader program and the renderer itself. The Vue wrappers call
`destroy()` in `onBeforeUnmount`, so nothing survives a `vue-router` navigation.

---

## Using them

Do not mount these directly. Go through `../CanvasStage.vue`, which:

- renders the static `TokenBarsMotif` instead of the 3D layer when WebGL2 is
  absent, when the user prefers reduced motion, when the asset fails to decode,
  or when the stage is far from the viewport;
- resolves `--color-accent`, `--color-cool`, `--color-bone` and friends from
  `style.css` into the `#rrggbb` strings these components expect, and re-resolves
  them when `html.light` is toggled — no colour is hardcoded;
- generates the object itself: the favicon motif (three ascending bars) is
  emitted as a theme-coloured SVG `data:` URL, which these components sniff and
  extrude into real geometry. No binary model is committed and nothing is fetched
  over the network, so the site builds and renders offline.

Callers wrap the component in `defineAsyncComponent(() => import(...))` so
three.js stays out of the initial route chunk.
