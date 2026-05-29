# Math Tutor

A small math tutor web app that:

- explain how to approach a math problem
- avoid revealing the answer at first
- ask the student whether they want the answer or want to solve it on their own
- reveal the answer only after the student asks for it
- hosted on https://www.samvarth-nhs-project.com/

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`.

4. Start the app:

```bash
npm start
```

5. Open `http://localhost:3000`.

## Environment variables

- `OPENAI_API_KEY`: required
- `OPENAI_MODEL`: optional, defaults to `gpt-4o-mini`
- `PORT`: optional, defaults to `3000`
- `HOST`: optional, defaults to `127.0.0.1`
- `ALLOWED_ORIGINS`: optional, comma-separated list of frontend origins allowed to call the API

## Notes

- The backend keeps your API key out of the browser.
- The explanation route uses structured outputs so the UI can render distinct tutoring sections cleanly.
- The frontend entry files for GitHub Pages now live at the repo root: `index.html`, `style.css`, and `app.js`.
- If you host the frontend and backend on different domains, set `window.APP_CONFIG.API_BASE_URL` in `config.js` to your backend URL, for example `https://your-api.onrender.com`.
- If your frontend is on a different domain, set `ALLOWED_ORIGINS` on the backend, for example `https://your-site.github.io` or your custom domain.
