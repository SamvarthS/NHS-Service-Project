# AI Math Tutor

A small math tutor web app that uses the OpenAI API to:

- explain how to approach a math problem
- avoid revealing the answer at first
- ask the student whether they want the answer or want to solve it on their own
- reveal the answer only after the student asks for it

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

## Notes

- The backend keeps your API key out of the browser.
- The explanation route uses structured outputs so the UI can render distinct tutoring sections cleanly.
