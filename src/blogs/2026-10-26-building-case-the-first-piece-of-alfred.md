---
title: "Building CASE: The First Piece of ALFRED"
description: How a thought about automating software development rituals turned
  into the first module of my personal AI assistant.
author: Courtney Fradreck
date: 2026-10-26T09:33:00.000+02:00
tags:
  - post
  - featured
image: /assets/blog-images/case/case.png
imageAlt: A glowing blue and gold brain surrounded by circular interface graphics,
  with CASE written beneath it.
---

I've wanted to build ALFRED for a while.

The idea was always to create a personal AI assistant that could help me manage the different things I work on, understand my context, and eventually become something much more capable than a chatbot I ask questions. I had the vision, or at least a rough picture of it, but I didn't have a clear starting point.

Then I came across a video that gave me something to think about.

The creator argued that one of the most valuable AI projects a software engineer could build would be a system that automates the work of a Scrum Master. His criticism was directed at the meetings, storyboards, administrative rituals, and documentation that can sometimes consume more time than the actual work of building software.

His argument was provocative, and I wouldn't agree that Agile methodology or Scrum Masters are inherently useless. Good planning, coordination, and communication matter, particularly when you're working with a team. But the underlying question stuck with me: **How much of the overhead surrounding software development could we automate so that engineers can spend more time engineering?**

<figure class="reel-embed">
    <div class="reel-embed__media">
        <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DHG5m-YuwcY/" data-instgrm-version="14">
            <a href="https://www.instagram.com/reel/DHG5m-YuwcY/" target="_blank" rel="noopener noreferrer">Watch the original Reel on Instagram</a>
        </blockquote>
    </div>
    <figcaption>
        The Reel that inspired CASE.
        <a href="https://www.instagram.com/reel/DHG5m-YuwcY/" target="_blank" rel="noopener noreferrer">Watch on Instagram</a>
    </figcaption>
</figure>
<script async src="https://www.instagram.com/embed.js"></script>

I had already been thinking about ALFRED. What I didn't have was a concrete first module to build.

This video gave me a direction. Rather than attempting to build an entire personal assistant from scratch, I could start with a specific problem in my own workflow, build something useful, and expand from there.

That is how CASE began.

## The problem: remembering where I left off

I work across several software projects, each with its own backlog of tasks, open pull requests, branches, ideas, bugs, and unfinished work.

The challenge isn't necessarily knowing what I've done. GitHub already records commits, pull requests, issues, and other activity. The challenge is reconstructing the context behind that activity.

What was I trying to accomplish? Which task was I working towards? What did I intend to do next? Is there an unfinished pull request I should revisit? Did I leave a task halfway through, or was I deliberately waiting for something else?

A commit tells me what changed. It doesn't always tell me what I was thinking when I made the change, or what I intended to do afterwards.

When I return to a project after a day, a week, or a longer break, I often have to reconstruct that context manually. I open repositories, inspect branches, read recent commits, check issues, and try to remember what mattered most.

Multiply that across several projects and the mental overhead becomes significant.

I wanted to eliminate as much of that reconstruction as possible.

Ideally, I wanted to begin my day with a useful answer to three questions:

- Where did I leave off?
- What needs my attention?
- What should I focus on next?

Not another dashboard to maintain. Not another task-management system requiring me to spend time updating it. Just a concise briefing assembled from the information my existing tools already contain.

That became CASE's first responsibility.

## Meet CASE

CASE stands for **Cognitive Assistant for Scheduling and Execution**. The name was inspired by CASE, one of the robotic assistants in _Interstellar_.

She is also the first module of ALFRED, the larger personal AI assistant I intend to build one piece at a time.

That distinction matters. CASE is not intended to be ALFRED in miniature, nor am I trying to cram every personal-assistant feature into her. She has a narrower responsibility: helping me maintain continuity across my software projects, understand what needs attention, and decide what to work on next.

I chose to begin with a Telegram bot because it gives me a practical way to interact with her without building an entirely new application interface. The morning brief comes to me where I can read it, and I can respond when I need to make a decision.

The first version was deliberately simple. Every morning at 7:00 AM, CASE would examine my GitHub activity and send me a summary of where I had left off.

That might not sound particularly ambitious, but it gave me something much more valuable than an elaborate prototype: a real problem, a concrete output, and a way to test whether the system was actually useful.

## How CASE works today

<p>
    <img src="/assets/blog-images/case/case_architecture_diagram.svg" alt="CASE architecture: GitHub, NEXT.md and Telegram feed into case-core, with n8n handling orchestration, PostgreSQL storing state, and Gemini generating the morning brief." width="680" height="400" loading="lazy">
</p>

As of 26 October 2026, CASE runs as a self-hosted system deployed through Docker Compose on Dokploy. Her stack includes Node.js 22, TypeScript, Hono, PostgreSQL 16, n8n, Telegram, and Google's Gemini model.

Each component has a specific responsibility.

n8n handles scheduling and forwards Telegram updates. The core service, which I call `case-core`, contains the application logic. PostgreSQL stores the data and state CASE needs to maintain across runs. GitHub provides project activity, while `NEXT.md` files in my tracked repositories communicate what I intend to do next.

The distinction between project activity and project intent is important. GitHub tells CASE what has happened. `NEXT.md` gives her a structured indication of what I plan to do.

Together, those sources allow her to build a more useful picture of my work.

### From a rule-based brief to a model-generated brief

I didn't want the first version to depend entirely on an LLM deciding what was important.

Language models are good at summarisation and prioritisation, but they can also omit important details, produce unsupported claims, or phrase something confidently when the evidence doesn't justify it.

For a tool intended to help me make decisions about my work, those aren't trivial problems.

So I separated the process into two responsibilities. The code collects the evidence and applies rules to establish the findings. The model can then help phrase and prioritise those findings, but it cannot invent its own source links. Instead, it references finding IDs, and the application resolves those references to real sources. Claims that fail validation are dropped.

If the model fails, CASE can fall back to a rule-based brief.

This architecture lets me use AI where it adds value without making the entire system dependent on the model behaving perfectly.

Milestone 1 established the rule-based morning brief. Milestone 2 introduced the model-generated brief and its citation validation. Both are now complete, although I continue to evaluate the behaviour of the model-generated output.

### What she actually does now

<picture class="morning-brief">
    <source media="(max-width: 768px)" srcset="/assets/blog-images/case/case_morning_brief_mobile.jpg" type="image/jpeg" width="1080" height="2496">
    <img src="/assets/blog-images/case/case_morning_brief_desktop.png" alt="CASE's morning brief in Telegram, showing recent activity, items needing attention, suggested focus tasks, and response buttons." width="878" height="702" loading="lazy" decoding="async">
</picture>

CASE's current capabilities go beyond summarising yesterday's commits.

**1. Reconstructing recent activity**

She reviews the most recent active day within the past week, using both weekend days for Monday's recap. She summarises activity across my tracked repositories, including commits, issues, and pull requests.

She also groups commits by their themes rather than simply pasting a long list of commit messages. This helps make a busy branch easier to understand at a glance.

**2. Identifying unfinished work**

CASE looks for things that may require attention, including open pull requests, unmerged branches, failing CI, and outstanding items recorded in `NEXT.md`.

She also tracks relevant state over time, allowing her to distinguish some persistent findings from new activity.

**3. Suggesting what to focus on**

This is the major step forward in Milestone 3, which is deployed and currently undergoing production testing.

CASE can suggest two or three things to focus on today, each accompanied by a reason grounded in the findings she collected. Rather than merely presenting a list of open tasks, she tries to turn those findings into actionable suggestions.

**4. Remembering my chosen focus**

I can select a suggested focus through Telegram buttons, or provide a different focus when none of the suggestions fits. CASE stores the selection so that it can carry forward into subsequent briefings.

The current implementation also includes commands such as `/focus` and `/next`, allowing me to inspect my selected focus and outstanding `NEXT.md` items.

**5. Reducing repetitive noise**

One of the challenges with a daily briefing system is that the same unfinished work can appear every morning until something changes.

CASE now has mechanisms for collapsing repeated medium- and low-priority findings, snoozing selected items, and tracking how long certain findings have persisted. A quiet-morning option is also implemented behind a feature flag, though it is not enabled in the shipped configuration.

These features are intended to make the brief useful without turning it into another stream of notifications I eventually learn to ignore.

All of this operates within a deliberate boundary: CASE is currently read-only with respect to my repositories. She can inspect information and help me decide what to do, but she cannot modify my code or push changes to GitHub.

That boundary is intentional. I want to establish reliable context and useful decision-making before expanding her responsibilities.

## The engineering lesson: building an assistant is more than connecting an LLM

<video class="case-demo" controls playsinline preload="metadata" aria-label="CASE demo: generating a morning brief, suggesting focus tasks, and responding to a selection in Telegram">
    <source src="/assets/videos/case.mp4" type="video/mp4">
    <a href="/assets/videos/case.mp4">Watch the CASE demo</a>.
</video>

One of the most interesting parts of this project has been discovering how much work exists outside the actual AI call.

Getting a model to summarise some JSON is relatively straightforward. Getting a system to produce a trustworthy, useful daily briefing repeatedly is a different problem.

The data has to be collected correctly. Old and irrelevant findings need to be handled sensibly. Suggestions need to be actionable. Every claim needs a traceable source. State must persist across runs. Buttons need to behave predictably. Failures need sensible fallbacks.

Even seemingly small details matter. If CASE says I made a certain number of commits yesterday, that number should agree with the activity she includes in the recap. If a merged pull request appears to have completed an item on my to-do list, she should not continue recommending that same item as if nothing happened.

These are the kinds of edge cases that separate a convincing demonstration from a dependable tool.

The project has also reinforced why I want the core logic to be independently testable, rather than burying everything in an orchestration workflow or an LLM prompt.

AI is one component of CASE, not the whole architecture.

I'm still testing the current milestone in production. The goal is not to claim that every suggestion is already perfect. It's to identify where the system's behaviour diverges from what I expect, correct those problems, and make each subsequent iteration more reliable.

That is part of the appeal of building in public: the project can show not just what works, but also how an idea becomes a system through testing, iteration, and engineering decisions.

## What comes next?

As I write this on 26 October 2026, Milestone 3 is in production testing. The next major milestone is M4, which will extend CASE beyond software activity.

### M4: Accounting for work that GitHub cannot see

Not everything I do during a working day produces a commit.

I might spend hours researching an idea, designing an architecture, reading documentation, planning a feature, or working through a difficult problem. Those activities can be just as important as writing code, but they are largely invisible to a system that only looks at GitHub.

The next milestone is intended to address that gap.

I plan to introduce a `/log` command so I can record non-code work, followed by an evening check-in where CASE asks how my chosen focus went. The planned responses include whether I completed it, made partial progress, or didn't get to it.

That information can then appear in the following morning's recap.

The objective is to give CASE a more complete account of my working day without requiring me to maintain a detailed manual diary.

### M5: Evaluating whether she is actually useful

The following milestone focuses on evaluation and feedback.

I want a set of known examples against which I can test CASE's output, alongside simple ways to report when something is wrong or missing. The planned `/wrong` and `/missed` commands will help capture those cases.

This matters because I don't want to judge progress solely by whether a message looks intelligent. I want to know whether CASE reliably identifies important work, avoids misleading claims, and helps me make better decisions about what to do next.

Beyond these milestones, I expect the project to continue evolving as I use it and discover what is missing. I would rather let real experience shape the roadmap than design a large system around assumptions I haven't tested.

## Where CASE fits into ALFRED

CASE is the first module of ALFRED, but she is not the entire vision.

ALFRED is the broader personal assistant I want to build over time. CASE gives me a practical starting point: one module with a clearly defined responsibility, real inputs, persistent state, and an interface I already use.

The long-term direction for CASE is to become better at maintaining project context, helping me choose priorities, remembering follow-ups, and accounting for work that happens outside code. She should be able to help me resume work without requiring me to reconstruct everything manually.

That does not mean I intend to turn her into an unrestricted autonomous agent. Her role is to help manage the context surrounding my work and support execution, while any expansion into actions should be deliberate.

ALFRED will eventually encompass the broader personal-assistant capabilities. I want to build that larger system through useful, independently developed modules rather than attempting to implement everything at once.

There is something appealing about that approach: build a working component, learn from it, and use those lessons to inform the next one.

I had the idea for ALFRED before I knew exactly how to begin. CASE is my answer to that problem.

## Building in public

I'm sharing CASE because I think other developers might find the problem familiar.

As our work becomes increasingly distributed across repositories, tools, conversations, and AI coding sessions, maintaining context becomes an important part of the engineering workflow. Generating code faster doesn't automatically solve the problem of knowing what to work on, remembering why a decision was made, or returning to unfinished work.

I want to explore how much of that overhead can be reduced through a small, practical assistant.

CASE is open source under the MIT licence, and the repository is available for anyone interested in examining the implementation, learning from the architecture, or contributing ideas.

**[Explore the CASE repository](https://github.com/CourtneyFradreck/case-ai)**

The project is still evolving. Milestone 3 is being tested, non-code activity logging is next, and evaluation remains part of the roadmap. There is plenty left to improve.

I don't see that as a weakness of the project. It is the reality of building something intended to be useful beyond a demonstration.

For now, CASE has a specific job: help me remember where I left off, understand what needs attention, and choose what comes next.

It is a modest beginning for a much larger idea.

And that's exactly where I wanted to start.

**Project links**

- **Source code:** [github.com/CourtneyFradreck/case-ai](https://github.com/CourtneyFradreck/case-ai)
- **Current development branch:** [feat/m3-intent](https://github.com/CourtneyFradreck/case-ai/tree/feat/m3-intent)
- **Current milestone:** M3, Intent, in production testing
- **Next milestone:** M4, non-code activity logging and evening check-ins

_This post describes CASE's state and roadmap as of 26 October 2026. Features under testing or planned for future milestones are identified as such and should not be interpreted as completed functionality._
