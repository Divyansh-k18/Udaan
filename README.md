# Udaan

An accessible exam-preparation demo for independent learning: topic practice, timed mocks, optional speech and readable progress reports.

## Run locally (Windows / PowerShell)

Use Python 3.11+ and Node 20.19+ (or Node 22.12+). The old `backend/venv311` folder is machine-specific; create a fresh environment.

Terminal 1, from this project folder:

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
backend/.venv/Scripts/python.exe -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000
```

Terminal 2:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL (normally http://localhost:5173). The dev/preview server proxies `/health` and `/sessions` to port 8000. For a separately hosted frontend, set `VITE_API_URL` and configure the backend CORS origins.

If a restricted environment prevents Vite from bundling its config, `npm run build -- --configLoader runner` and `npm run preview -- --configLoader runner` are supported.

## A three-minute judge walkthrough

1. Start with accessibility setup. Show large text, high contrast and screen-reader/silent mode.
2. Choose **Continue as guest**. Explain the problem: practising independently without relying on sight or a helper.
3. Open an exam, choose **Prepare**, and answer a question to show immediate explanations.
4. Return to the exam and choose **Mock Test**. Select an answer, refresh to demonstrate recovery, mark a question and submit after reviewing the confirmation.
5. Show question-level results, topic statistics, progress and the downloadable semantic HTML report.
6. Demonstrate Tab/Shift+Tab navigation, visible focus, Help/Escape, and the reading toolbar. Voice recognition depends on browser support and microphone permission; keyboard operation is always available.

## Scope and accessibility

This is a practice demonstration, not an official examination system. The current frontend mock flow uses a local question bank, local scoring and browser storage. The separately implemented FastAPI session endpoints provide token-protected papers, server deadlines and scoring, and are tested independently. The frontend does not yet use these endpoints for its mock lifecycle. Demo sign-in creates no authenticated account and requires no real credentials.

The UI targets WCAG 2.1 AA with contrast-tested themes, text resizing, responsive reflow, semantic controls, a single main landmark, native dialogs, keyboard focus and status messages. Automated checks are evidence for the tested screens, not a conformance certificate. Manual NVDA/JAWS/VoiceOver testing and review by users with visual impairments are still needed; translations and browser speech voices also need human review.

Practice is untimed. Timed mocks offer extra time before starting. Do not claim formal exam accommodation or official exam-rule compliance.

## Verification

```powershell
cd frontend
npm run build
npm run lint
npm test
```

Backend tests use a disposable database and leave `backend/udaan.db` untouched:

```powershell
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements-dev.txt
backend/.venv/Scripts/python.exe -m unittest discover -s backend -p test_sessions.py -v
```

`UDAAN_DATABASE_URL` can override the default database path for isolated environments. Never commit exam-session databases or virtual environments.


## Modern layout and spoken startup guide

The interface uses the full desktop width with a landscape dashboard, four quick-action cards, a compact plane logo, navigation icons and scalable learning illustrations. It reflows in portrait and at 200% text instead of locking device orientation.

With **Udaan speaks** selected, startup announces keyboard instructions. Starting a mock includes the shortcuts before the first question; starting practice gives practice instructions. **Read keyboard guide** or **Alt+K** repeats the guide. **Escape** stops current speech. **Stop & mute** disables automatic narration and saves that preference. Screen-reader and silent modes do not auto-narrate; **Enable voice guide** explicitly turns narration on.

Speech output does not require a microphone. Browser autoplay restrictions may prevent an automatic first announcement: select **Read keyboard guide**, check device volume, and ensure a browser/system voice is installed. Failures now show visible recovery instructions. Written instructions remain available in the keyboard guidance panel. The introductory shortcut guide is currently in English.
