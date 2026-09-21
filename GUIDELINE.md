# Interactive Learning Resource — Guideline

A set of principles for turning any technical article, paper, or post into an interactive deep-dive. This is a *philosophy document*, not a spec sheet — the goal is to make decisions that feel obvious in retrospect.

---

## The Model: Colah-Style Writing, Made Interactive

The gold standard for this format is [Christopher Olah's blog](https://colah.github.io). Study it. What makes it work:

- **One idea at a time.** Every section has a single thesis. No section tries to teach two things simultaneously.
- **Intuition before formalism.** The reader should feel the concept before they see the equation.
- **Diagrams that do the explaining.** The prose sets up the picture; the picture does the heavy lifting.
- **Concrete before abstract.** Every abstract statement is grounded by a specific, tangible example first.
- **Honest about difficulty.** Hard things are called hard. Simplifications are labeled as simplifications.

The interactivity in these resources is an extension of that last principle: instead of a diagram you look at, you manipulate the diagram until the concept clicks.

---

## 1. Writing Style

### Lead with the problem, not the solution

The first thing a section should do is make the reader *feel* why the topic matters. Not "Here is how chunking works" — but "Here's what goes wrong when you don't think carefully about chunking." Establish the stakes, then introduce the mechanism.

### Short sentences. Active voice. No hedging.

Write the way you'd explain something on a whiteboard. Cut every sentence that exists only to transition to the next sentence. Cut qualifiers that aren't doing real work ("it's worth noting that", "essentially", "basically"). If a sentence can be removed without losing meaning, remove it.

### Concrete examples as the primary vehicle

Abstract statements should always follow a concrete example, never precede one. The example is the explanation — the abstract restatement is just a handle for remembering it.

> ❌ "Cosine similarity measures the angle between two vectors in high-dimensional space, which makes it useful for text because..."
>
> ✅ "The phrase 'hotel room after flight cancellation' and the sentence 'accommodation reimbursable following travel disruption' share almost no words. But an embedding model maps both to nearly the same point in vector space — because they mean the same thing. That proximity is what cosine similarity measures."

### Use a running scenario

Pick one concrete, unglamorous scenario and carry it through the entire resource. It creates a stable mental home for each new concept. The scenario should be:

- **Specific** — not "a query" but "an employee asking whether a cancelled-flight hotel is reimbursable"
- **Relatable** — not a toy example, something that plausibly exists in the real world
- **Elastic** — capable of illustrating every concept in the resource without feeling forced

When a new mechanic is introduced, the first question should be: *how does this apply to the running scenario?*

### Acknowledge tradeoffs explicitly

Every technical decision is a tradeoff. Name both sides. Don't soften the bad side. A reader who understands *why* a design decision has costs is more prepared than a reader who only understands the benefits.

---

## 2. Pedagogy: Start Simple, Build Up

### The three-layer rule

Every concept should be introduced in three layers:

1. **Intuition** — what it feels like, no jargon, often an analogy
2. **Mechanic** — what it actually does, precise but not formal
3. **Edge case / failure mode** — where the intuition breaks down, what the mechanic misses

Don't skip any layer. Most technical writing skips layer 1 (assumes the reader already has the right mental model) and layer 3 (pretends the mechanism always works cleanly). Those are exactly the layers that distinguish understanding from memorization.

### Section ordering mirrors understanding

Sections build on each other. The section ordering should follow the natural order of questions a curious reader would ask:

```
Why does this problem exist?
→ What's the naive solution, and why is it inadequate?
→ What's the better solution?
→ What are the knobs on the better solution?
→ What can still go wrong?
→ How do I choose?
```

Don't jump straight to the solution. The reader who understands *why the naive approach fails* will understand the real solution at a much deeper level.

### Never use a term before defining it

Every technical term appears for the first time exactly once. At that first appearance:
- Define it in plain language in the surrounding prose, or
- Add a `data-tip` hover tooltip with a one-sentence definition

After that, use it freely. This removes the friction of the reader holding an undefined token in working memory while trying to understand something else.

### The interactive is not decoration

The interactive component in each section is the *explanation* — not an illustration of the explanation. Design it so that a reader who only used the interactive (and read the callout beneath it) would still understand the concept. If the prose is necessary to interpret what the interactive does, the interactive isn't doing enough work.

---

## 3. The Interactive: What It Should Do

Every interactive should create one moment of genuine surprise or discovery. The reader should be able to say: *oh, I didn't expect that* — and that unexpected result should be exactly the thing the section is trying to teach.

Effective interactives:

- **Let the reader break something.** Set a parameter to its extreme and watch the output degrade. Understanding the failure mode is understanding the concept.
- **Show before and after.** The learner should be able to compare two states — not just see one.
- **Make cause and effect immediate.** Moving a slider should update the output in under 50ms. Anything slower breaks the causal link.
- **Reward exploration.** There should be a "right" configuration to find, but the path through "wrong" configurations should also be educational, not dead ends.

### What to avoid

- **Interactives that just animate.** If the user has no choices to make, it's a video, not an interactive. At minimum, the user should be able to pause, reset, or change an input.
- **Interactives that require reading instructions.** If it needs more than one sentence of explanation to operate, simplify the interface.
- **Fake precision.** Sliders that produce numbers like `recall = 94.7%` on made-up models aren't measurements — they're theater. Label simulated numbers as approximations, or make the estimation model explicit.

---

## 4. Visual Design Principles

The design exists to serve reading, not to impress. Every visual decision should pass the question: *does this make the content easier to understand, or does it make the page look designed?*

### Colour has semantic meaning

Colour is not decoration. Every colour in the palette has a meaning that is consistent across every resource:

- **Blue** (`--accent`) — the one thing in the viewport that needs your attention right now. Used once per view.
- **Green** (`--good`) — correct, safe, success, better option
- **Amber** (`--warn`) — caution, approximate, tradeoff to consider
- **Red** (`--danger`) — wrong, failure, expensive, danger
- **Grey** (`--muted`) — metadata, labels, supporting information

If you find yourself reaching for a colour because something "looks empty," that's a signal the content needs work, not more colour.

### Typography carries hierarchy, not decoration

Two fonts, two purposes — no exceptions:

- **Hanken Grotesk** — everything the reader reads: paragraphs, headings, navigation, buttons
- **JetBrains Mono** — everything the reader *identifies*: labels, codes, numbers, badges, timestamps

The moment a paragraph appears in monospace, the reader's brain shifts mode — they stop reading and start scanning for tokens. That's a useful mode, but only for the right content.

### Whitespace is not wasted space

Generous line-height (1.65) and paragraph widths capped at 640px aren't aesthetic choices — they're legibility choices. Text wider than ~75 characters per line causes the eye to lose its place at the line return. Reading fatigue compounds over a long page.

### Flat panels, not card soup

Boxes, borders, and panels should draw the reader's eye to *structure*, not to *chrome*. The goal is that the reader sees the content first and the container only when they need to understand where one thing ends and another begins. This is why:
- No rounded corners (softening signals friendliness, not clarity)
- No drop shadows (depth signals hierarchy without meaning)
- Borders only at 1px, colour `--hairline` — just enough to separate, not enough to compete

---

## 5. What "More Technical" Means

The source article is the floor, not the ceiling. "More technical" doesn't mean more jargon — it means being precise about the things the source glossed over.

Specifically:

| Source says | Resource should add |
|---|---|
| "Embeddings capture semantic meaning" | *What an embedding model actually does to produce a vector; why similar meaning → similar coordinates* |
| "HNSW is fast" | *Why it's fast — the multi-layer graph structure, the tradeoff between M and memory, what ef_search controls* |
| "Use pagination for large responses" | *Cursor vs. offset pagination, why offset fails on live data, what the client has to store* |
| "JWT is stateless authentication" | *The three-part structure, what the signature actually verifies, what it doesn't (revocation)* |

The test: could a senior engineer learn something they didn't already know from this resource? If the answer is no, it's not technical enough.

---

## 6. Quiz Design

The quiz is the last section. Its purpose is to test understanding of *mechanics and tradeoffs*, not recall of definitions. A reader who only skimmed the page should fail it; a reader who worked through the interactives should pass.

**Good questions ask:**
- Why does X cause Y? (causal reasoning)
- What breaks when you increase/decrease this parameter? (tradeoff reasoning)
- Given this scenario, which approach is correct and why? (applied reasoning)

**Bad questions ask:**
- What does X stand for? (vocabulary recall)
- Which of these is a type of X? (taxonomy recall)
- True or false: X is used for Y? (recognition)

Every wrong answer should be a *plausible misconception* — something a reasonable person might believe after a superficial reading. The explanation for each question should say not just why the correct answer is right, but why each wrong answer is wrong.

---

## 7. Quality Bar

Before finishing a resource, ask these four questions honestly:

**1. Would a smart person who'd never heard of this topic understand it after reading this?**
If yes: the intuition layers are working.

**2. Would a senior engineer who already knows this topic learn something, or at least have their understanding sharpened?**
If yes: the depth is adequate.

**3. Can the reader break every interactive in an instructive way?**
If yes: the interactives are teaching, not decorating.

**4. Is every sentence doing work?**
If not: cut the ones that aren't.

---

## 8. Metadata Conventions

Every resource has a fixed set of metadata displayed in the hero section. These fields must be present and accurate on every page.

### Required hero meta fields

| Field | Type | Example | Notes |
|---|---|---|---|
| **Published** | Date | `Sep 19, 2026` | Original publication date of the source newsletter or article. Format: `Mon DD, YYYY`. Always the first meta item. |
| **Source** | Text | `ByteByteGo Newsletter` | Name of the originating publication. Only present where the page uses the `meta-row` / `meta-item` pattern (ByteByteGo style). SemiAnalysis pages carry source in the eyebrow instead. |
| **Sections** | Number | `5` | Count of top-level content sections (excluding the quiz). |
| **Interactives** | Number | `4` | Count of interactive components on the page. |
| **Quiz** | Text | `6 questions` | Number of quiz questions. |

### Home page listing

On `index.html`, each post row in the All panel must show:
- A `<span class="post-date">` immediately after `<span class="post-desc">`, inside the `.post-body` column. Format: `Mon DD, YYYY`.
- The same date appears as a third `<span>` inside the `.email-meta` div on the subtab detail card.

### Date format rule

Use abbreviated month name + day (no leading zero) + full year: **`Sep 14, 2026`**. No ordinals, no ISO format, no slashes. This keeps it readable in the narrow mono context it appears in.

---

## Reference: Voices to Study

The resources in this collection are trying to occupy a space between:

- **[Colah's blog](https://colah.github.io)** — intuition-first, diagram-led, rigorous without being dry
- **[Bartosz Ciechanowski](https://ciechanow.ski)** — interactive as primary explanation, prose as framing
- **[Julia Evans' zines](https://wizardzines.com)** — short, concrete, honest about what's hard
- **[The Missing Semester](https://missing.csail.mit.edu)** — practical, tool-focused, teaching the thing under the thing

None of these are the exact format here, but each contributes something. Colah's writing structure, Ciechanowski's interactive-first approach, Evans' refusal to hand-wave, Missing Semester's focus on the mechanism behind the abstraction.
