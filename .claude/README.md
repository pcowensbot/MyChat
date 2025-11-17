# Claude Context System

This directory contains context files that help Claude maintain continuity across sessions for the MyChat project.

## 📁 Directory Structure

```
.claude/
├── CONTEXT.md              # Main project context (READ THIS FIRST!)
├── README.md               # This file - system documentation
├── sessions/               # Session logs (local only, not committed)
│   └── .gitkeep
└── templates/
    └── session-log.md      # Template for consistent session documentation
```

## 🤖 For Claude

### At the Start of Each Session

1. **Read `CONTEXT.md` thoroughly**
   - This contains the project's complete state, history, and patterns
   - Includes current priorities, known issues, and recent work
   - Contains critical configuration and architecture decisions

2. **Check recent session logs** (if they exist)
   - Look in `sessions/` for the most recent 1-2 session files
   - Session logs are dated: `YYYY-MM-DD-HHMM-description.md`
   - These contain granular details of recent work

3. **Verify current state**
   - Check git status for uncommitted changes
   - Review recent commits
   - Understand what was left in progress

4. **Greet the user with context awareness**
   ```
   Hi! I've read the context for MyChat.

   I can see:
   - The project is live at https://mychat.pcowens.com
   - Current priority: Fix registration button issue
   - Recent work: PGP key backup system integration

   What would you like to work on today?
   ```

### During the Session

- **Follow documented patterns** in CONTEXT.md
- **Ask questions** when requirements are unclear
- **Document decisions** as they're made
- **Test incrementally** - verify changes work before moving on
- **Commit frequently** with clear messages
- **Update notes** on significant discoveries

### Before Ending the Session

Offer to help document the session:

```
Before we wrap up, would you like me to:

1. Create a session log?
   - Document what we accomplished
   - Note decisions and discoveries
   - List items for next session

2. Update CONTEXT.md?
   - New features completed
   - Architecture changes
   - Updated priorities or known issues

3. Help commit changes?
   - Review uncommitted files
   - Create clear commit message(s)
```

## 👤 For Humans

### Keeping Context Updated

The context system works best when kept current. Update `CONTEXT.md` when:

- ✅ Major features are completed
- ✅ Architecture decisions are made
- ✅ Significant bugs are fixed or discovered
- ✅ Priorities change
- ✅ New patterns or conventions are established
- ✅ Dependencies are updated

### Session Logs

Session logs in `sessions/` are **local only** (gitignored). They contain:
- Detailed step-by-step work from specific sessions
- Decisions made and why
- Problems encountered and solutions tried
- Specific TODOs for next session

Create a session log when:
- Complex work was done
- Important decisions were made
- You want to remember specific details
- Multiple issues were tackled

### Using the Template

The session log template at `templates/session-log.md` provides a consistent format:
- Goals and accomplishments
- Decisions and reasoning
- Issues encountered
- Next steps

## 🔄 Workflow Example

### Session Start
```
Claude reads CONTEXT.md
Claude checks sessions/2025-11-16-1800-registration-fix.md
Claude understands: Registration button issue is critical
Claude: "Ready to continue debugging the registration button!"
```

### During Work
```
User: "Let's try a different approach to the button issue"
Claude: [Works on fix, tests, commits]
Claude: [Makes mental note of what was tried]
```

### Session End
```
Claude: "We made progress! Should I create a session log?"
User: "Yes please"
Claude: Creates sessions/2025-11-17-1400-button-debugging.md
Claude: "Should I update CONTEXT.md with the fix?"
User: "Yes, we solved it!"
Claude: Updates CONTEXT.md → marks issue as resolved
```

## 📊 Benefits

### For Claude
- **No repeated questions** - context carries over
- **Consistent patterns** - follows established conventions
- **Better decisions** - understands project history
- **Focused work** - knows current priorities

### For Users
- **Less explaining** - Claude already knows the project
- **Better continuity** - pick up where you left off
- **Preserved knowledge** - decisions and reasoning documented
- **Faster onboarding** - new Claude sessions start informed

## 🛠️ Maintenance

### Weekly Review (Suggested)

Every ~7 days or ~10 sessions:
- Review CONTEXT.md for outdated information
- Archive old session logs (>30 days)
- Update roadmap and priorities
- Refresh "Current State" section

### When Context Gets Large

If CONTEXT.md exceeds 500 lines:
- Consider splitting into multiple docs
- Move detailed specs to separate files
- Keep CONTEXT.md as high-level overview
- Create ARCHITECTURE.md, API.md, etc. as needed

## ⚠️ Important Notes

- **Session logs are local only** - they're in .gitignore
- **CONTEXT.md is committed** - it's part of the repository
- **Keep sensitive data out** - no passwords, secrets, or private keys
- **Update regularly** - stale context is worse than no context

## 🎯 Philosophy

This system exists because:
- **AI has no memory between sessions** - This provides it
- **Projects evolve constantly** - This tracks evolution
- **Patterns prevent chaos** - This enforces consistency
- **Context is everything** - This preserves it
- **Humans forget too** - This helps everyone

Claude is not just a code assistant - it's a **partner** in this project. The context system is Claude's **memory**, and maintaining it is part of the partnership.

---

*Claude Context System v1.0*
*Helping Claude remember, one session at a time.*
