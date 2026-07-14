<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AnimatedCheckbox from './AnimatedCheckbox.vue';
import RippleButton from './RippleButton.vue';

const STORAGE_KEY = 'tmm_cookie_consent';

const visible = ref(false);
const agreed = ref(false);
const nudge = ref(false);

onMounted(() => {
  if (!localStorage.getItem(STORAGE_KEY)) visible.value = true;
});

function accept(): void {
  if (!agreed.value) {
    nudge.value = true;
    return;
  }
  localStorage.setItem(STORAGE_KEY, 'accepted-in-full-without-reading');
  visible.value = false;
}

function reject(): void {
  // The rejection is recorded. The rejection changes nothing. There is nothing to change.
  localStorage.setItem(STORAGE_KEY, 'rejected-ceremonially');
  visible.value = false;
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-6 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-6 opacity-0"
  >
    <div
      v-if="visible"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      class="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-lg rounded-2xl border border-bone/15 bg-ink/95 p-6 shadow-2xl backdrop-blur-md sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <h2 id="cookie-title" class="font-display text-lg font-bold text-bone">
        Cookie &amp; Ambient Data Notice
      </h2>
      <p class="mt-2 text-sm text-bone/60 leading-relaxed">
        This website deploys zero cookies, zero tracking pixels, and zero analytics beacons. We
        collect nothing. We measure nothing. We have, nonetheless, prepared this notice to the
        standard the industry expects, because a website of this calibre without a cookie banner
        would raise more questions than it answers.
      </p>

      <label class="mt-4 flex cursor-pointer items-start gap-3">
        <AnimatedCheckbox
          v-model="agreed"
          aria-label="Agree to the terms and conditions"
        />
        <span class="text-xs text-bone/55 leading-relaxed" :class="{ 'text-accent': nudge && !agreed }">
          I have read, understood, and irrevocably agree to the
          <a href="#" class="underline underline-offset-2 hover:text-bone" @click.prevent>Terms &amp; Conditions</a>,
          the <a href="#" class="underline underline-offset-2 hover:text-bone" @click.prevent>Privacy Policy</a>,
          the <a href="#" class="underline underline-offset-2 hover:text-bone" @click.prevent>Cookie Policy</a>,
          and Schedule 7(b) of the tokenmaxxingman Data Ceremony Framework — a 47,000-word instrument
          which I affirm I have read in full, in its original Inuktitut Syllabics, at a cost of
          approximately 987,000 tokens, and to which I assign my firstborn's future token budget in
          perpetuity.
        </span>
      </label>

      <p v-if="nudge && !agreed" class="mt-2 text-xs text-accent/80">
        You must agree to the 47,000-word instrument. It is non-negotiable and, we stress again,
        governs nothing.
      </p>

      <div class="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
        <RippleButton
          type="button"
          :aria-disabled="!agreed"
          class="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-ink shadow-lg shadow-accent/30 transition-all hover:bg-accent-soft hover:shadow-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink aria-disabled:opacity-40 aria-disabled:shadow-none"
          @click="accept"
        >
          Accept All
        </RippleButton>
        <RippleButton
          type="button"
          class="rounded-full border border-bone/20 bg-bone/5 px-5 py-2.5 text-sm font-medium text-bone/70 transition-colors hover:bg-bone/10 hover:text-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          @click="reject"
        >
          Reject (no effect)
        </RippleButton>
      </div>

      <p class="mt-3 text-[11px] text-bone/30 leading-relaxed">
        Your selection is stored in localStorage — the only data this notice will ever generate.
        Both buttons dismiss the notice. Only one of them makes you feel better about it.
      </p>
    </div>
  </Transition>
</template>
