<script setup lang="ts">
import AnimatedCode from './AnimatedCode.vue';
import {
  MCP_TOOLS,
  MCP_RESOURCES,
  MCP_PROMPT_NAMES,
  MCP_REGISTER_CLI,
  MCP_REGISTER_JSON,
} from '../data/mcp';
</script>

<template>
  <section id="mcp" aria-labelledby="mcp-heading" class="mb-16 scroll-mt-24">
    <!-- Why -->
    <div v-reveal="'fade-up'" class="mb-8 flex flex-col gap-4">
      <div class="flex flex-wrap gap-2">
        <span class="pill !border-accent/30 !text-accent">New</span>
        <span class="pill">MCP · stdio</span>
        <span class="pill">@modelcontextprotocol/sdk v1.30.0</span>
      </div>
      <h2 id="mcp-heading" class="font-display text-2xl font-bold text-bone">
        The <span class="text-accent">MCP server.</span>
      </h2>
      <p class="max-w-3xl text-sm text-bone/60 leading-relaxed">
        MCP — the Model Context Protocol — is an open JSON-RPC standard through which an AI client
        calls tools, reads resources, and loads prompts from a separate server process. The package
        now ships one. It runs over stdio and it is the reason the skills stopped guessing.
      </p>
      <p class="max-w-3xl text-sm text-bone/60 leading-relaxed">
        Previously a skill had to <em class="italic">estimate</em> a token count and
        <em class="italic">approximate</em> an expansion from inside the model, which is a polite way
        of saying it made the numbers up and hoped they were close. With the server connected, the
        skills call the same deterministic, tested pipeline the CLI calls. The numbers are real, the
        output is reproducible, and the difference between the two situations is the entire point of
        having built it.
      </p>
    </div>

    <!-- Register it -->
    <div v-reveal="'fade-up'" class="mb-8">
      <h3 class="mb-2 font-display text-lg font-semibold text-bone">Register it</h3>
      <p class="mb-4 text-sm text-bone/40">
        One command for Claude Code. Or the equivalent config block, for clients that prefer to be
        configured in writing.
      </p>
      <div class="grid gap-4 lg:grid-cols-2">
        <AnimatedCode :code="MCP_REGISTER_CLI" prompt />
        <AnimatedCode :code="MCP_REGISTER_JSON" filename=".mcp.json" :animate="false" />
      </div>
    </div>

    <!-- Tools -->
    <div v-reveal="'fade-up'" class="mb-8">
      <h3 class="mb-2 font-display text-lg font-semibold text-bone">Tools</h3>
      <p class="mb-4 text-sm text-bone/40">
        Seven. Each one computes rather than estimates, which is a lower bar than it sounds and a
        higher bar than the previous arrangement cleared.
      </p>
      <div class="surface overflow-hidden rounded-2xl border border-bone/10 bg-bone/[0.02]">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[40rem] border-collapse text-left text-sm">
            <caption class="sr-only">
              Tools exposed by the tokenmaxxingman MCP server, with their parameters and return values
            </caption>
            <thead>
              <tr class="border-b border-bone/10 text-xs uppercase tracking-wider text-bone/40">
                <th scope="col" class="px-5 py-3 font-medium">Tool</th>
                <th scope="col" class="px-5 py-3 font-medium">Parameters</th>
                <th scope="col" class="px-5 py-3 font-medium">Returns</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="tool in MCP_TOOLS"
                :key="tool.name"
                class="border-b border-bone/[0.06] align-top last:border-b-0"
              >
                <th
                  scope="row"
                  class="whitespace-nowrap px-5 py-4 font-mono text-sm font-semibold text-accent"
                >
                  {{ tool.name }}
                </th>
                <td class="px-5 py-4">
                  <span v-if="tool.params.length === 0" class="text-xs text-bone/35">
                    no parameters
                  </span>
                  <div v-else class="flex flex-wrap gap-1.5">
                    <code
                      v-for="param in tool.params"
                      :key="param.name"
                      class="rounded border border-bone/10 bg-bone/[0.04] px-2 py-0.5 font-mono text-[11px]"
                      :class="param.optional ? 'text-bone/40' : 'text-bone/70'"
                    ><span>{{ param.name }}</span><span v-if="param.optional" aria-hidden="true">?</span><span
                      v-if="param.optional"
                      class="sr-only"
                    > (optional)</span></code>
                  </div>
                  <p v-if="tool.note" class="mt-2 text-xs text-cool/80">{{ tool.note }}</p>
                </td>
                <td class="px-5 py-4 leading-relaxed text-bone/55">{{ tool.summary }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Resources + prompts -->
    <div v-reveal="'fade-up'" class="mb-8 grid gap-4 md:grid-cols-2">
      <div class="card flex flex-col gap-3">
        <h3 class="font-display text-lg font-semibold text-bone">Resources</h3>
        <p class="text-sm text-bone/45 leading-relaxed">
          Read-only documents, addressed by URI. The client fetches them; the server does not push
          them, having no opinion on when they are wanted.
        </p>
        <ul class="mt-1 space-y-3">
          <li v-for="resource in MCP_RESOURCES" :key="resource.uri" class="flex flex-col gap-1">
            <code class="font-mono text-xs font-semibold text-cool">{{ resource.uri }}</code>
            <span class="text-xs text-bone/45 leading-relaxed">{{ resource.detail }}</span>
          </li>
        </ul>
      </div>

      <div class="card flex flex-col gap-3">
        <h3 class="font-display text-lg font-semibold text-bone">Prompts</h3>
        <p class="text-sm text-bone/45 leading-relaxed">
          One MCP prompt per bundled skill, each named after the skill it invokes. The naming scheme
          was reviewed, found to be the obvious one, and approved on that basis.
        </p>
        <div class="mt-auto flex flex-wrap gap-1.5 pt-2">
          <code
            v-for="name in MCP_PROMPT_NAMES"
            :key="name"
            class="rounded border border-bone/10 bg-bone/[0.04] px-2 py-0.5 font-mono text-[11px] text-bone/45"
          >
            {{ name }}
          </code>
        </div>
      </div>
    </div>

    <!-- Offline / safety -->
    <div v-reveal="'fade-up'" class="surface rounded-2xl border border-cool/20 bg-cool/[0.04] p-8">
      <span class="pill !border-cool/30 !text-cool">Offline by construction</span>
      <h3 class="mt-4 mb-4 font-display text-xl font-bold text-bone">
        It reads and it computes. That is the <span class="text-cool">whole</span> capability list.
      </h3>
      <p class="max-w-3xl text-sm text-bone/60 leading-relaxed">
        No file writes. No process spawning. No network access of any kind. The corpus and both
        tokenizer vocabularies are bundled with the package and version-pinned, so the server
        produces identical output on an aeroplane and in a datacentre, which is the property that
        makes the benchmark a benchmark rather than an anecdote.
      </p>
      <p class="mt-4 max-w-3xl text-sm text-bone/40 leading-relaxed">
        The organisation notes that a tool designed to consume tokens without limit and a tool
        granted no ability to touch anything are, on reflection, a reassuring combination. This was
        deliberate. We would like credit for it.
      </p>
    </div>
  </section>
</template>
