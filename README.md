# WorkFlow AI

Build an AI-Powered Workplace Productivity Assistant

Build a complete, modern, responsive web application called WorkFlow AI — AI-Powered Workplace Productivity Assistant.

The application must function as ONE integrated workplace productivity platform, not as separate mini-projects. All AI tools must exist within one consistent dashboard, share the same design system, and provide a seamless user experience.

The purpose of WorkFlow AI is to help professionals save time, organise workplace information, automate repetitive tasks, and make everyday work more efficient using AI.

The application should demonstrate:

Practical AI implementation

Strong prompt engineering

Real-world workplace problem solving

Responsible AI usage

Modern UI/UX design

Responsive web design

Clear and editable AI-generated outputs

1. APPLICATION CONCEPT

WorkFlow AI follows a simple productivity workflow:

Capture → Understand → Plan → Act → Track

Users should be able to enter workplace information such as emails, meeting notes, tasks, research topics, or general questions. The AI analyses the information and produces useful, structured outputs that the user can review, edit, copy, regenerate, or act upon.

The application should feel like a professional SaaS productivity platform rather than a collection of AI demos.

2. TARGET USERS

Design the application for:

Office professionals

Employees

Managers

Team leaders

Entrepreneurs

Freelancers

Students entering the workplace

Small business owners

The interface should be intuitive enough for a non-technical user.

3. MAIN APPLICATION STRUCTURE

Create a persistent sidebar navigation on desktop and a responsive navigation system on mobile.

The sidebar should contain:

WorkFlow AI

Dashboard
Smart Email
Meeting Summarizer
Task Planner
Research Assistant
AI Workplace Assistant
Settings

Include a user/profile area at the bottom of the sidebar.

The main content area should change dynamically depending on the selected feature while maintaining the same visual design system.

4. DASHBOARD

Create a professional dashboard homepage.

At the top display:

Good morning!

Let's get your work organised.

Add a short description:

“Use AI to manage workplace communication, meetings, tasks, research and everyday productivity.”

Create productivity overview cards:

Today's Tasks
Display the number of pending tasks.

Completed
Display completed tasks.

High Priority
Display high-priority tasks.

AI Actions
Display the number of AI actions performed.

Create a Quick Actions section containing buttons/cards for:

Generate an Email

Summarise Meeting Notes

Plan My Day

Research a Topic

Ask AI

Create a Today's Priorities section displaying the user's most important tasks.

Create a Recent AI Activity section showing recent actions such as:

“Meeting notes summarised”

“Email generated”

“Daily schedule created”

“Research completed”

The dashboard should feel useful and functional rather than decorative.

5. SMART EMAIL GENERATOR

Create a dedicated Smart Email Generator page.

The purpose is to help users quickly create professional workplace emails.

Include:

Email Purpose / Instructions

A large text input where the user can describe what they want to communicate.

Example placeholder:

“Describe what you want to communicate. For example: Ask my manager for two days of leave next week.”

Include fields for:

Recipient / Audience

Email Subject

Tone

Tone options:

Formal

Friendly

Professional

Persuasive

Apologetic

Include an optional Additional Context field.

Add a prominent:

Generate Email button.

The AI output should appear in an editable text editor.

Include buttons:

Copy

Regenerate

Clear

The generated email should be professional, grammatically correct, concise and appropriate for the selected tone.

Email AI prompt

Use structured prompt engineering.

The AI should be instructed to:

Act as an expert workplace communication assistant.

Understand the user's intended purpose.

Generate a professional email.

Follow the selected tone.

Avoid unnecessary wording.

Maintain appropriate workplace etiquette.

Never invent facts, dates, names or commitments that were not provided.

Ask for clarification when essential information is missing.

Produce an appropriate subject line when one has not been provided.

6. MEETING NOTES SUMMARIZER

Create a Meeting Notes Summarizer page.

Include a large input area:

Paste your meeting notes here...

Add an optional field:

Meeting Title

Add a button:

Summarise Meeting

The AI output must be structured into clearly separated sections:

Meeting Summary

A concise summary of the meeting.

Key Discussion Points

The major topics discussed.

Decisions Made

Important decisions explicitly identified in the notes.

Action Items

Tasks identified from the meeting.

For each action item, display where possible:

Task

Person responsible

Deadline

Priority

Deadlines

List all deadlines explicitly mentioned.

Important Follow-ups

Identify anything that requires additional attention.

The output must be editable.

Add:

Copy Summary

Regenerate

Clear

Meeting AI prompt

Use a structured prompt that instructs the AI to:

“Act as an expert workplace meeting analyst. Analyse the meeting notes provided by the user. Extract information without inventing facts. Identify the purpose of the meeting, key discussion points, decisions, action items, owners and deadlines.”

Important responsible AI rule:

If a responsible person or deadline is not explicitly stated, do not invent one. Display “Not specified” instead.

7. AI TASK PLANNER / SCHEDULER

Create a Task Planner page.

The user should be able to enter multiple tasks.

Provide fields for:

Task

Deadline

Estimated Duration

Importance

Allow users to add multiple tasks.

Also provide:

Available Working Hours

Planning Date

Allow the user to select:

Daily Plan

Weekly Plan

Add:

Generate My Plan

The AI should:

Analyse all tasks.

Consider deadlines.

Consider importance.

Consider estimated duration.

Prioritise tasks.

Organise tasks into a realistic schedule.

Avoid scheduling overlapping tasks.

Include reasonable breaks where appropriate.

Highlight urgent or overdue tasks.

Explain why important tasks were prioritised.

Display the result as a professional schedule/timeline.

Each task should show:

Task name
Time
Duration
Priority
Status

Allow users to mark tasks as:

Not Started

In Progress

Completed

Include the ability to edit or delete tasks.

Task Planner AI prompt

The AI should act as an expert workplace productivity planner.

It should prioritise tasks using factors such as:

Urgency + Importance + Deadline + Estimated Effort

The AI must not create impossible schedules.

If the user's workload cannot realistically fit into the available time, clearly communicate this and recommend what should be postponed.

Never invent deadlines.

8. AI RESEARCH ASSISTANT

Create a Research Assistant page.

The user should be able to enter:

Research Topic / Question

Provide an optional:

Context

and:

Desired Depth

Options:

Quick Overview

Standard

Detailed

Add:

Research with AI

The output should contain:

Executive Summary

Key Insights

Important Considerations

Recommendations

Suggested Next Steps

The AI should clearly distinguish between established information, assumptions and recommendations.

Important responsible AI requirement:

Display a visible message reminding users that AI-generated research may contain inaccuracies and should be verified using reliable sources before being used for important workplace decisions.

If the application does not have live web-search functionality, do not claim that the AI has searched the internet.

9. AI WORKPLACE ASSISTANT

Create a conversational AI chatbot interface.

The page should look similar to a professional workplace messaging application.

Include:

Conversation history

User messages

AI responses

Text input

Send button

Clear conversation button

The assistant should be designed specifically as a workplace productivity assistant.

It should be able to help users with:

Productivity

Workplace communication

Planning

Brainstorming

Meeting preparation

Task organisation

Writing assistance

General workplace questions

The AI should maintain a professional, helpful and concise tone.

The assistant should not pretend to be a human employee or claim to have performed actions it cannot actually perform.

10. AI PROMPT ENGINEERING

Prompt engineering is a major requirement of this project.

Do not use simplistic prompts such as:

“Summarise this.”

Every AI feature should use a structured prompt containing:

Role

Objective

Context

Instructions

Constraints

Output Format

The prompts should be designed to produce consistent, structured and useful results.

Where appropriate, use variables such as:

{{user_input}}

{{tone}}

{{deadline}}

{{available_hours}}

{{meeting_notes}}

{{research_topic}}

Ensure user-provided information is clearly separated from system instructions.

11. AI OUTPUT CONTROLS

All major AI-generated content should be editable.

Users must be able to:

Edit

Copy

Regenerate

Clear

Do not make AI output read-only.

Show loading states while AI responses are being generated.

Display useful error messages if an AI request fails.

Do not expose API keys or sensitive credentials in frontend code.

12. RESPONSIBLE AI

Create a visible Responsible AI section in Settings and include a subtle disclaimer throughout the application.

Use wording similar to:

“AI-generated content may contain errors or omissions. Always review and verify AI-generated information before using it for important workplace, business, legal or financial decisions.”

Also include:

“Do not enter confidential, sensitive, personal, financial or proprietary information into the application unless appropriate safeguards are in place.”

The AI should follow these principles:

Do not fabricate information.

Do not claim certainty when information is uncertain.

Do not invent names, dates, deadlines, sources or decisions.

Clearly identify missing information.

Encourage verification for important decisions.

13. UI/UX DESIGN

Use a clean, modern SaaS aesthetic.

Design characteristics:

Professional

Minimal

Modern

Spacious

Easy to navigate

Strong visual hierarchy

Accessible

Consistent

Use cards, subtle borders, rounded corners and clear typography.

Avoid excessive decoration.

Use consistent buttons and form components throughout the platform.

AI-generated content should be visually distinct from user input.

Use clear status indicators for:

Success

Loading

Error

Completed

Pending

High Priority

14. RESPONSIVE DESIGN

The application must work properly on:

Desktop

Laptop

Tablet

Mobile

On mobile, convert the sidebar into a responsive navigation menu.

Ensure:

Inputs resize correctly.

Buttons remain accessible.

Tables/schedules remain usable.

AI outputs do not overflow the screen.

Cards stack appropriately.

Typography remains readable.

15. ACCESSIBILITY

Follow modern accessibility principles.

Ensure:

Sufficient text contrast.

Clearly labelled form inputs.

Keyboard-accessible controls.

Descriptive buttons.

Visible focus states.

Logical heading hierarchy.

16. ERROR HANDLING

Provide professional error states.

For example:

“If the AI service is temporarily unavailable, please try again.”

“If your request is missing important information, please provide additional context.”

Do not expose technical errors, API keys or internal system information to users.

17. DATA PERSISTENCE

Where technically possible, allow users to retain:

Tasks

Completed tasks

Recent AI activity

Saved emails

Meeting summaries

Research results

Provide a simple way to delete saved information.

18. SETTINGS

Create a Settings page containing:

Profile

Appearance

AI Preferences

Responsible AI

Data & Privacy

Include a responsible AI explanation.

19. EMPTY STATES

Create helpful empty states rather than showing blank screens.

For example:

“No tasks yet. Add your first task to start planning your day.”

“No recent AI activity.”

“Your generated email will appear here.”

“Paste your meeting notes above to generate a structured summary.”

20. DASHBOARD INTEGRATION

The features must feel interconnected.

For example:

After summarising meeting notes, provide an option:

Create Tasks from Action Items

This should transfer extracted action items into the Task Planner.

After generating an email, allow:

Edit Email

Copy Email

After creating a task plan, allow the user to mark tasks as completed.

The dashboard should update based on task activity.

This integration is important because the project must demonstrate that this is ONE productivity platform, not five unrelated tools.

21. NAVIGATION

Use clear page titles and breadcrumbs where appropriate.

Every major page should have:

Page title

Short description

Main input section

AI action button

Output section

Relevant actions

Maintain the same layout and design language across all pages.

22. DEMO DATA

Include realistic sample data so the application looks functional during demonstration.

Example tasks:

“Prepare quarterly marketing report”

“Reply to client proposal”

“Attend team meeting”

“Complete project presentation”

“Review campaign performance”

Example meeting content should demonstrate:

Decisions

Action items

Deadlines

Responsibilities

Do not make the demo data excessive.

23. PERFORMANCE

Keep the application lightweight and responsive.

Use loading indicators during AI operations.

Avoid unnecessary animations.

Use subtle transitions where they improve the experience.

24. SECURITY

Never expose API keys or secret credentials in frontend code.

Use secure server-side handling for AI API calls where required.

Do not store sensitive user information unnecessarily.

25. FINAL QUALITY REQUIREMENT

Before considering the application complete, check that:

The application is one integrated platform.

All navigation works.

The dashboard works.

At least three AI features are functional.

Preferably all five AI features are implemented.

AI outputs are editable.

AI prompts are structured.

Loading states work.

Error states work.

Responsive design works.

Responsible AI messaging is visible.

The UI looks professional.

The application is suitable for a workplace environment.

No placeholder buttons or fake functionality remain.

No broken links or navigation routes remain.

26. FINAL PRODUCT EXPERIENCE

The final application should communicate this value proposition:

“Work smarter. Communicate faster. Plan better.”

WorkFlow AI should feel like a realistic workplace SaaS product that an employee could actually use to manage everyday work.

Prioritise functionality, usability, AI quality, responsible AI and professional presentation over unnecessary visual complexity.

Build the application as a polished MVP that is ready to demonstrate and present.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cogni-work.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/463159f8-09b0-4e9c-b74b-7b767d0a9cc1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
