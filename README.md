# Next.js Prisma AI Stack

## Overview
This repo has all the dependencies install that I typically use for rapid prototyping with Next.js, Prisma, and Task Master AI.

## Getting Started

1. Connect to postgres by setting the `DATABASE_URL` environment variable in `.env`. Use the `scripts/add-dev-postgres.sh` script to set it up with one command.
2. Add your `ANTHROPIC_API_KEY` to the `.env` file. Replace `projectName` with your project name.
3. Copy `scripts/example_prd.txt` to `scripts/prd.md` and fill it out


Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


