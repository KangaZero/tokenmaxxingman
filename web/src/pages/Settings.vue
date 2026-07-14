<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SiteFooter from '../components/SiteFooter.vue';
import { useTheme } from '../composables/useTheme';

const { isDark, toggleTheme } = useTheme();

const username = ref('');
const displayName = ref('');
const jobTitle = ref('Senior Prompt Engineer');
const level = ref(1);
const verbosity = ref(50);
const preferredLanguage = ref('en');
const autoVerbosity = ref(false);
const hallucinationConfidence = ref(72);
const hasPhd = ref(false);
const hIndex = ref(0);
const slopComfort = ref('high');
const deprecatedCommitment = ref(42);
const autoBoomer = ref(false);
const tokenBudget = ref('unlimited');
const saved = ref(false);

const JOB_TITLES = [
  'Senior Prompt Engineer',
  'Principal AI Wrangler',
  'Chief Token Officer',
  'VP of Verbosity',
  'Distinguished Token Architect',
  'Staff Hallucination Engineer',
  'AI Slop Consultant',
  'Head of Anti-Efficiency',
  'Junior Okay-Boomer Developer',
  'Executive Director of Unnecessary Words',
];

const LANGUAGES = [
  { value: 'en', label: 'English (boring, but fine)' },
  { value: 'iu-cans', label: 'Inuktitut Syllabics (recommended · 21 tok/word)' },
  { value: 'zh-classical', label: 'Classical Chinese (wenyan — the anti-anti)' },
  { value: 'my', label: 'Burmese (rank 5 tok/word)' },
  { value: 'bo', label: 'Tibetan (honourable mention)' },
];

const SLOP_LEVELS = [
  { value: 'low', label: 'Low — I am ashamed of this project' },
  { value: 'medium', label: 'Medium — I get the joke' },
  { value: 'high', label: 'High — I am the target demographic' },
  { value: 'legendary', label: 'Legendary — I have read every word of the SKILL.md' },
];

const TOKEN_BUDGETS = [
  { value: 'unlimited', label: 'Unlimited (recommended)' },
  { value: 'comfortable', label: 'Comfortable — I have a budget but no principles' },
  { value: 'tight', label: 'Tight — wrong project' },
  { value: 'caveman', label: 'Caveman Mode — are you lost?' },
];

const STORAGE_KEYS = [
  'tmm_username', 'tmm_displayName', 'tmm_jobTitle', 'tmm_level',
  'tmm_verbosity', 'tmm_lang', 'tmm_autoVerbosity', 'tmm_hallucination',
  'tmm_phd', 'tmm_hIndex', 'tmm_slopComfort', 'tmm_deprecated',
  'tmm_autoBoomer', 'tmm_tokenBudget',
];

function load() {
  username.value = localStorage.getItem('tmm_username') ?? '';
  displayName.value = localStorage.getItem('tmm_displayName') ?? '';
  jobTitle.value = localStorage.getItem('tmm_jobTitle') ?? 'Senior Prompt Engineer';
  level.value = Number(localStorage.getItem('tmm_level') ?? '1');
  verbosity.value = Number(localStorage.getItem('tmm_verbosity') ?? '50');
  preferredLanguage.value = localStorage.getItem('tmm_lang') ?? 'en';
  autoVerbosity.value = localStorage.getItem('tmm_autoVerbosity') === 'true';
  hallucinationConfidence.value = Number(localStorage.getItem('tmm_hallucination') ?? '72');
  hasPhd.value = localStorage.getItem('tmm_phd') === 'true';
  hIndex.value = Number(localStorage.getItem('tmm_hIndex') ?? '0');
  slopComfort.value = localStorage.getItem('tmm_slopComfort') ?? 'high';
  deprecatedCommitment.value = Number(localStorage.getItem('tmm_deprecated') ?? '42');
  autoBoomer.value = localStorage.getItem('tmm_autoBoomer') === 'true';
  tokenBudget.value = localStorage.getItem('tmm_tokenBudget') ?? 'unlimited';
}

function save() {
  localStorage.setItem('tmm_username', username.value);
  localStorage.setItem('tmm_displayName', displayName.value);
  localStorage.setItem('tmm_jobTitle', jobTitle.value);
  localStorage.setItem('tmm_level', String(level.value));
  localStorage.setItem('tmm_verbosity', String(verbosity.value));
  localStorage.setItem('tmm_lang', preferredLanguage.value);
  localStorage.setItem('tmm_autoVerbosity', String(autoVerbosity.value));
  localStorage.setItem('tmm_hallucination', String(hallucinationConfidence.value));
  localStorage.setItem('tmm_phd', String(hasPhd.value));
  localStorage.setItem('tmm_hIndex', String(hIndex.value));
  localStorage.setItem('tmm_slopComfort', slopComfort.value);
  localStorage.setItem('tmm_deprecated', String(deprecatedCommitment.value));
  localStorage.setItem('tmm_autoBoomer', String(autoBoomer.value));
  localStorage.setItem('tmm_tokenBudget', tokenBudget.value);
  saved.value = true;
  setTimeout(() => { saved.value = false; }, 2500);
}

function resetAll() {
  STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
  load();
}

function exportJson() {
  const data = {
    username: username.value,
    displayName: displayName.value,
    jobTitle: jobTitle.value,
    level: level.value,
    verbosity: verbosity.value,
    preferredLanguage: preferredLanguage.value,
    autoVerbosity: autoVerbosity.value,
    hallucinationConfidence: hallucinationConfidence.value,
    hasPhd: hasPhd.value,
    hIndex: hIndex.value,
    slopComfort: slopComfort.value,
    deprecatedCommitment: deprecatedCommitment.value,
    autoBoomer: autoBoomer.value,
    tokenBudget: tokenBudget.value,
    exportedAt: new Date().toISOString(),
    note: 'This file contains your tokenmaxxingman preferences. None of these settings affect anything. Congratulations on exporting them.',
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tokenmaxxingman-preferences.json';
  a.click();
  URL.revokeObjectURL(url);
}

const inputClass = 'w-full rounded-lg border border-bone/20 bg-bone/5 px-4 py-2 text-bone placeholder-bone/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors';
const selectClass = 'w-full rounded-lg border border-bone/20 bg-ink px-4 py-2 text-bone focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors';

onMounted(load);
</script>

<template>
  <main id="main-content" class="relative isolate min-h-screen overflow-x-hidden pt-16">
    <div class="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-60"></div>

    <div class="mx-auto max-w-3xl px-6 py-24">
      <!-- Header -->
      <div class="mb-12 flex flex-col gap-3">
        <span class="pill">preferences · profile · credentials · danger</span>
        <h1 class="font-display text-4xl font-bold text-bone md:text-5xl">Settings</h1>
        <p class="text-lg text-bone/50">Configure your tokenmaxxingman experience. Preferences are stored in localStorage, which is approximately as permanent as a sandcastle and twice as load-bearing.</p>
      </div>

      <div class="space-y-8">

        <!-- Appearance -->
        <section class="card space-y-6">
          <h2 class="font-display text-xl font-semibold text-bone">Appearance</h2>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-bone">Theme</p>
              <p class="text-sm text-bone/50">This one actually works. You're welcome.</p>
            </div>
            <button
              type="button"
              :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              :aria-pressed="!isDark"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-ink"
              :class="isDark ? 'bg-bone/20' : 'bg-accent'"
              @click="toggleTheme"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bone shadow ring-0 transition duration-200 ease-in-out"
                :class="isDark ? 'translate-x-0' : 'translate-x-5'"
              />
            </button>
          </div>
          <p class="text-xs text-bone/30 italic">
            {{ isDark ? '🌙 Dark mode — the only correct choice.' : '☀️ Light mode — we won\'t judge you. We will note it.' }}
          </p>
        </section>

        <!-- Profile -->
        <section class="card space-y-6">
          <h2 class="font-display text-xl font-semibold text-bone">Profile</h2>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-bone/70 mb-1.5" for="username">Username</label>
              <input id="username" v-model="username" type="text" placeholder="anon_token_waster" :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm font-medium text-bone/70 mb-1.5" for="displayName">Display Name</label>
              <input id="displayName" v-model="displayName" type="text" placeholder="Distinguished Contributor" :class="inputClass" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-bone/70 mb-1.5" for="jobTitle">Job Title</label>
            <select id="jobTitle" v-model="jobTitle" :class="selectClass">
              <option v-for="title in JOB_TITLES" :key="title" :value="title">{{ title }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-bone/70 mb-1.5" for="level">
              Level: <span class="font-mono text-accent">{{ level }}</span>
            </label>
            <input id="level" v-model="level" type="range" min="1" max="100" class="w-full accent-accent" />
            <div class="mt-1 flex justify-between text-xs text-bone/30">
              <span>Intern</span>
              <span>Distinguished Fellow</span>
            </div>
          </div>
        </section>

        <!-- Preferences -->
        <section class="card space-y-6">
          <h2 class="font-display text-xl font-semibold text-bone">Preferences</h2>

          <div>
            <label class="block text-sm font-medium text-bone/70 mb-1.5" for="lang">Preferred Tokenization Language</label>
            <select id="lang" v-model="preferredLanguage" :class="selectClass">
              <option v-for="lang in LANGUAGES" :key="lang.value" :value="lang.value">{{ lang.label }}</option>
            </select>
            <p class="mt-1 text-xs text-bone/30">Affects nothing. The benchmark data is fixed.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-bone/70 mb-1.5" for="verbosity">
              Default Verbosity: <span class="font-mono text-accent">{{ verbosity }}%</span>
            </label>
            <input id="verbosity" v-model="verbosity" type="range" min="0" max="100" class="w-full accent-accent" />
            <div class="mt-1 flex justify-between text-xs text-bone/30">
              <span>Caveman (wrong app)</span>
              <span>Maximum Slop</span>
            </div>
            <p class="mt-1 text-xs text-bone/30">Setting this above 70 voids your warranty. Setting it to 100 voids your colleagues' patience.</p>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-bone">Auto-Verbosity</p>
              <p class="text-sm text-bone/50">Automatically expands all responses by 3–7× using the tokenmaxxingman pipeline. Does nothing, because this is a settings page and settings pages do not talk to language models. We know.</p>
            </div>
            <button
              type="button"
              :aria-label="autoVerbosity ? 'Disable auto-verbosity' : 'Enable auto-verbosity'"
              :aria-pressed="autoVerbosity"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-ink"
              :class="autoVerbosity ? 'bg-accent' : 'bg-bone/20'"
              @click="autoVerbosity = !autoVerbosity"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bone shadow ring-0 transition duration-200 ease-in-out"
                :class="autoVerbosity ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-bone">Auto-Boomer Mode</p>
              <p class="text-sm text-bone/50">Recommend jQuery 1.x on every response. Highly discouraged.</p>
            </div>
            <button
              type="button"
              :aria-label="autoBoomer ? 'Disable auto-boomer' : 'Enable auto-boomer'"
              :aria-pressed="autoBoomer"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-ink"
              :class="autoBoomer ? 'bg-accent' : 'bg-bone/20'"
              @click="autoBoomer = !autoBoomer"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bone shadow ring-0 transition duration-200 ease-in-out"
                :class="autoBoomer ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium text-bone/70 mb-1.5" for="slopComfort">AI Slop Comfort Level</label>
            <select id="slopComfort" v-model="slopComfort" :class="selectClass">
              <option v-for="s in SLOP_LEVELS" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-bone/70 mb-1.5" for="tokenBudget">Token Budget</label>
            <select id="tokenBudget" v-model="tokenBudget" :class="selectClass">
              <option v-for="b in TOKEN_BUDGETS" :key="b.value" :value="b.value">{{ b.label }}</option>
            </select>
          </div>
        </section>

        <!-- Academic Credentials -->
        <section class="card space-y-6">
          <h2 class="font-display text-xl font-semibold text-bone">Academic Credentials</h2>
          <p class="text-sm text-bone/50">
            Required for peer review submission to the tokenmaxxingman Research Institute.
            We accept all credentials. We verify none of them.
          </p>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-bone">PhD</p>
              <p class="text-sm text-bone/50">In what? The field is irrelevant. Self-reported, unverified, and displayed in your profile with full institutional sincerity.</p>
            </div>
            <button
              type="button"
              :aria-label="hasPhd ? 'Remove PhD' : 'Claim PhD'"
              :aria-pressed="hasPhd"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-ink"
              :class="hasPhd ? 'bg-accent' : 'bg-bone/20'"
              @click="hasPhd = !hasPhd"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bone shadow ring-0 transition duration-200 ease-in-out"
                :class="hasPhd ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium text-bone/70 mb-1.5" for="hIndex">
              h-index: <span class="font-mono text-accent">{{ hIndex }}</span>
            </label>
            <input id="hIndex" v-model="hIndex" type="range" min="0" max="100" class="w-full accent-accent" />
            <div class="mt-1 flex justify-between text-xs text-bone/30">
              <span>0 (honest)</span>
              <span>100 (aspirational)</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-bone/70 mb-1.5" for="deprecated">
              Commitment to Deprecated Technology: <span class="font-mono text-accent">{{ deprecatedCommitment }}%</span>
            </label>
            <input id="deprecated" v-model="deprecatedCommitment" type="range" min="0" max="100" class="w-full accent-accent" />
            <div class="mt-1 flex justify-between text-xs text-bone/30">
              <span>Modern frameworks (wrong project)</span>
              <span>jQuery 1.x + PHP 4</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-bone/70 mb-1.5" for="hallucinationConfidence">
              Hallucination Confidence: <span class="font-mono text-accent">{{ hallucinationConfidence }}%</span>
            </label>
            <input id="hallucinationConfidence" v-model="hallucinationConfidence" type="range" min="0" max="100" class="w-full accent-accent" />
            <p class="mt-1 text-xs text-bone/30">How confident are you in fabricated citations? We recommend 72. It is specific enough to sound calibrated. It was chosen by a slider.</p>
          </div>
        </section>

        <!-- Save button -->
        <div class="flex flex-col items-end gap-2">
          <p class="text-xs text-bone/30">Saving persists preferences to localStorage, where they will wait patiently to be ignored.</p>
          <button
            type="button"
            class="rounded-full bg-accent px-8 py-3 font-medium text-ink shadow-lg shadow-accent/30 transition-all hover:bg-accent-soft hover:shadow-accent/50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-ink"
            @click="save"
          >
            Save Preferences
          </button>
        </div>

        <!-- Danger Zone -->
        <section class="card space-y-4 border-red-900/30 bg-red-950/10">
          <h2 class="font-display text-xl font-semibold text-red-400">Danger Zone</h2>
          <p class="text-sm text-bone/50">These actions are irreversible. Or reversible. We forgot which.</p>
          <div class="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              class="rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-ink"
              @click="resetAll"
            >
              Reset all preferences
            </button>
            <button
              type="button"
              class="rounded-lg border border-bone/20 bg-bone/5 px-4 py-2 text-sm font-medium text-bone/70 transition-colors hover:bg-bone/10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-ink"
              @click="exportJson"
            >
              Export preferences as JSON
            </button>
          </div>
          <p class="text-xs text-bone/25 italic">
            Export is the only feature on this page that actually does something.
            This is suspicious and we acknowledge it.
          </p>
        </section>

      </div>
    </div>

    <SiteFooter />

    <!-- Toast -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="saved"
        role="status"
        aria-live="polite"
        class="fixed bottom-6 right-6 z-50 rounded-xl border border-bone/20 bg-ink/95 px-5 py-3 shadow-2xl backdrop-blur-sm"
      >
        <p class="text-sm font-medium text-bone">Preferences saved.</p>
        <p class="text-xs text-bone/50">This has no effect on anything.</p>
      </div>
    </Transition>
  </main>
</template>
