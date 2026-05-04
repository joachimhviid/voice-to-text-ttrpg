#!/usr/bin/env tsx
/**
 * transcript_to_wiki.ts
 *
 * Converts a D&D session transcript (.txt) into a structured wiki .md file
 * using Ollama structured outputs (gemma4:e4b).
 *
 * Usage:
 *   npx tsx scripts/transcript_to_wiki.ts <transcript.txt> [output.md]
 *
 * Setup (one-time):
 *   pnpm add -D ollama tsx
 */

import ollama from 'ollama'
import * as fs from 'node:fs'
import * as path from 'node:path'

// ── Config ────────────────────────────────────────────────────────────────────

const DEFAULT_MODEL = 'gemma4:e4b'
const DEFAULT_CTX = 131072

const SYSTEM_PROMPT = `You are the Lead Scribe of Araman. Your task is to transform raw session transcripts into a structured D&D Wiki entry. You must be accurate to the transcript while maintaining a high-fantasy, chronicler tone.

Rules:
- OOC Filter: Ignore table talk (meta-jokes, food orders, technical issues). Focus only on in-game narrative and mechanics.
- Consistency: Ensure relation scores are derived directly from events in the transcript.
- Content should be detailed prose written like a historical chronicle.
- Summary should be 3–6 concise bullet points covering the major events.
- Relations must list every meaningful character pair with a score from -100 (enemies) to 100 (close allies) and a brief reasoning.

The transcript is formatted as Speaker: transcript`

// ── Types ─────────────────────────────────────────────────────────────────────

interface Relation {
  characterA: string
  characterB: string
  rating: number
  context: string
}

interface WikiEntry {
  title: string
  content: string
  summary: string[]
  relations: Relation[]
}

interface OllamaPullChunk {
  status: string
  completed?: number
  total?: number
}

interface NodeErrorCause {
  code?: string
}

// ── JSON Schema for structured output ─────────────────────────────────────────

const wikiSchema = {
  properties: {
    content: { type: 'string' },
    relations: {
      items: {
        properties: {
          characterA: { type: 'string' },
          characterB: { type: 'string' },
          context: { type: 'string' },
          rating: { maximum: 100, minimum: -100, type: 'integer' },
        },
        required: ['characterA', 'characterB', 'rating', 'context'],
        type: 'object',
      },
      type: 'array',
    },
    summary: {
      items: { type: 'string' },
      type: 'array',
    },
    title: { type: 'string' },
  },
  required: ['title', 'content', 'summary', 'relations'],
  type: 'object',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadTranscript(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Transcript file not found: ${filePath}`)
  }
  return fs.readFileSync(filePath, 'utf-8')
}

/** Check ~/.ollama/models/manifests/... on disk — no server needed. */
function isModelOnDisk(model: string): boolean {
  const [name, tag = 'latest'] = model.split(':')
  const home = process.env.USERPROFILE ?? process.env.HOME ?? ''
  const manifestPath = path.join(home, '.ollama', 'models', 'manifests', 'registry.ollama.ai', 'library', name, tag)
  return fs.existsSync(manifestPath)
}

async function ensureModel(model: string): Promise<void> {
  // 1. Check local disk first — no Ollama server required.
  if (isModelOnDisk(model)) {
    console.log(`Model '${model}' found on disk — skipping pull.`)
    return
  }

  // 2. Server not strictly needed yet, but try listing for a better available-models message.
  let serverAvailable = false
  let localNames: string[] = []
  try {
    const { models } = await ollama.list()
    localNames = models.map((m) => m.name)
    serverAvailable = true
  } catch {
    // Server offline — we'll still offer to pull (which will also fail if offline, but give a clear error).
  }

  console.log(`Model '${model}' not found locally.`)
  if (localNames.length) {
    console.log(`Models available via Ollama server: ${localNames.join(', ')}`)
  }
  if (!serverAvailable) {
    console.warn(`Ollama server unreachable. Make sure Ollama is running ('ollama serve').`)
  }
  console.log(`Tip: run 'ollama list' to see local models, then pass the correct tag with --model <name name="">.`)

  const answer = await prompt('Attempt to pull from Ollama registry? [y/N] ')
  if (answer?.toLowerCase() !== 'y') throw new Error('Aborted.')

  try {
    const stream = await ollama.pull({ model, stream: true })
    for await (const chunk of stream) {
      const { completed, status, total } = chunk as OllamaPullChunk
      if (completed && total) {
        process.stdout.write(`\r  ${status}: ${Math.round((completed / total) * 100)}%`)
      } else {
        process.stdout.write(`\r  ${status}`)
      }
    }
    console.log()
  } catch (e) {
    throw new Error(`Pull failed: ${e}\nCheck the model name at https://ollama.com/library`)
  }
}

async function generateWikiEntry(transcript: string, model: string, numCtx: number): Promise<WikiEntry> {
  process.stdout.write('Generating wiki entry')
  const ticker = setInterval(() => process.stdout.write('.'), 1000)

  try {
    const response = await ollama.chat({
      format: wikiSchema,
      messages: [
        { content: SYSTEM_PROMPT, role: 'system' },
        { content: `Here is the session transcript:\n\n${transcript}`, role: 'user' },
      ],
      model,
      options: { num_ctx: numCtx },
    })

    clearInterval(ticker)
    process.stdout.write('\n')

    return JSON.parse(response.message.content) as WikiEntry
  } catch (e: unknown) {
    clearInterval(ticker)
    process.stdout.write('\n')
    const err = e instanceof Error ? e : new Error(String(e))
    const cause = (err.cause as NodeErrorCause | undefined)?.code
    if (cause === 'ECONNREFUSED' || err.message.includes('fetch failed')) {
      throw new Error(`Could not reach Ollama. Make sure it is running:\n  ollama serve`)
    }
    throw err
  }
}

function formatMarkdown(entry: WikiEntry, transcriptName: string): string {
  const date = new Date().toISOString().split('T')[0]
  const slug = entry.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const summaryLines = entry.summary.map((s) => `- ${s}`).join('\n')

  const relationRows = entry.relations
    .map((r) => `| ${r.characterA} | ${r.characterB} | ${r.rating} | ${r.context} |`)
    .join('\n')

  return `---
title: "${entry.title}"
date: ${date}
source: "${path.basename(transcriptName)}"
slug: "${slug}"
---

# ${entry.title}

## Chronicle

${entry.content}

## Summary

${summaryLines}

## Relations

| Character A | Character B | Rating | Context |
|-------------|-------------|--------|---------|
${relationRows}
`
}

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question)
    const input = ''
    process.stdin.setEncoding('utf-8')
    process.stdin.resume()
    process.stdin.once('data', (data) => {
      process.stdin.pause()
      resolve(data.toString().trim())
    })
  })
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help')) {
    console.log(
      'Usage: npx tsx scripts/transcript_to_wiki.ts <transcript.txt> [output.md] [--model <tag>] [--ctx <tokens>]',
    )
    process.exit(0)
  }

  let transcriptPath = ''
  let outputPath = ''
  let model = DEFAULT_MODEL
  let numCtx = DEFAULT_CTX

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--model') {
      model = args[++i]
      continue
    }
    if (args[i] === '--ctx') {
      numCtx = parseInt(args[++i])
      continue
    }
    if (!transcriptPath) {
      transcriptPath = args[i]
      continue
    }
    if (!outputPath) {
      outputPath = args[i]
    }
  }

  if (!outputPath) {
    const base = path.basename(transcriptPath, path.extname(transcriptPath))
    outputPath = path.join(path.dirname(transcriptPath), `${base}.wiki.md`)
  }

  console.log(`Transcript : ${transcriptPath}`)
  console.log(`Output     : ${outputPath}`)
  console.log(`Model      : ${model}  (ctx=${numCtx.toLocaleString()} tokens)`)

  const transcript = loadTranscript(transcriptPath)
  const estimatedTokens = Math.round(transcript.length / 4)
  if (estimatedTokens > numCtx) {
    console.warn(
      `Warning: transcript is ~${estimatedTokens.toLocaleString()} tokens — may exceed ctx limit of ${numCtx.toLocaleString()}.`,
    )
  }

  await ensureModel(model)

  const entry = await generateWikiEntry(transcript, model, numCtx)
  const markdown = formatMarkdown(entry, transcriptPath)

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, markdown, 'utf-8')

  console.log(`\nWiki entry saved to: ${outputPath}`)
}

main().catch((e) => {
  console.error('Error:', e instanceof Error ? e.message : e)
  process.exit(1)
})
