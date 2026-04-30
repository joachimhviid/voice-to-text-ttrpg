"""
transcript_to_wiki.py

Reads a D&D session transcript (.txt) and uses Ollama (gemma4:e4b) to produce
a structured wiki entry in the Lead Scribe of Araman format.

Usage:
    python scripts/transcript_to_wiki.py <path/to/transcript.txt>

Requirements:
    pip install ollama
    Ollama must be running locally (ollama serve)
"""

import argparse
import ollama

SYSTEM_PROMPT = """You are the Lead Scribe of Araman. Your task is to transform raw txt session transcripts into a structured D&D Wiki entry. You must be accurate to the transcript while maintaining a high-fantasy, chronicler tone.

Rules of Engagement:
- OOC Filter: Ignore "table talk" (meta-jokes, food orders, technical issues). Focus only on in-game narrative and mechanics.
- Structure: Follow the exact Markdown headers provided below.
- Consistency: Ensure the Relation scores are derived directly from the events in the transcript.

Required Output Format:

# Title: [Thematic Session Name]

## Content

[A detailed, prose-style narrative of the events that occurred. Write this like a story or a historical chronicle.]

## Summary

- [Bullet point major event 1]
- [Bullet point major event 2]
- [Bullet point major event 3]

## Relations

| Character A | Character B | Rating (-100 to 100) | Context |
|-------------|-------------|----------------------|---------|
| [Name]      | [Name]      | [Score]              | [Reasoning based on this session] |

The transcript is formatted as Speaker: transcript"""


def load_transcript(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def ensure_model(model: str) -> None:
    """Pull the model only if it isn't already available locally."""
    local_models = [m.model for m in ollama.list().models]

    # Exact match, or base-name match (ignoring tag) e.g. "gemma3" matches "gemma3:4b"
    base = model.split(":")[0]
    found = any(m == model or m.split(":")[0] == base for m in local_models)

    if found:
        print(f"Model '{model}' found locally — skipping pull.")
        return

    print(f"Model '{model}' not found locally.")
    print(f"Available models: {', '.join(local_models) if local_models else 'none'}")
    print(f"Tip: run 'ollama list' to see your local models, then pass the correct tag with --model <name>.")

    answer = input("Attempt to pull from Ollama registry anyway? [y/N] ").strip().lower()
    if answer != "y":
        raise SystemExit("Aborted.")

    try:
        for chunk in ollama.pull(model, stream=True):
            status = chunk.get("status", "")
            if "total" in chunk and "completed" in chunk:
                pct = int(chunk["completed"] / chunk["total"] * 100)
                print(f"\r  {status}: {pct}%", end="", flush=True)
            else:
                print(f"\r  {status}", end="", flush=True)
        print()
    except Exception as e:
        raise SystemExit(f"Pull failed: {e}\nCheck the model name is correct on https://ollama.com/library")


def stream_wiki_entry(transcript: str, model: str, num_ctx: int) -> None:
    """Stream the wiki entry token-by-token to stdout."""
    stream = ollama.chat(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Here is the session transcript:\n\n{transcript}"},
        ],
        options={"num_ctx": num_ctx},
        stream=True,
    )
    for chunk in stream:
        print(chunk["message"]["content"], end="", flush=True)
    print()  # final newline


def main():
    parser = argparse.ArgumentParser(description="Convert a D&D transcript to a wiki entry using Ollama.")
    parser.add_argument("transcript", help="Path to the .txt transcript file")
    parser.add_argument(
        "--model",
        default="gemma4:e4b",
        help="Ollama model tag to use (default: gemma4:e4b). Run 'ollama list' to see what you have.",
    )
    parser.add_argument(
        "--ctx",
        type=int,
        default=131072,
        help="Context window size in tokens (default: 131072 / 128k). Lower = less VRAM. Max for gemma4:e4b is 128k.",
    )
    args = parser.parse_args()

    print(f"Loading transcript: {args.transcript}")
    transcript = load_transcript(args.transcript)

    # Warn if the transcript is likely to exceed the context window
    estimated_tokens = len(transcript) // 4
    if estimated_tokens > args.ctx:
        print(f"Warning: transcript is ~{estimated_tokens} tokens, which may exceed --ctx {args.ctx}.")
        print("Consider raising --ctx or splitting the transcript.")

    ensure_model(args.model)

    print(f"\nGenerating wiki entry with '{args.model}' (ctx={args.ctx})...\n")
    print("=" * 60)
    stream_wiki_entry(transcript, model=args.model, num_ctx=args.ctx)
    print("=" * 60)


if __name__ == "__main__":
    main()
