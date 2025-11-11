# QuoSona

A modern Next.js application built with TypeScript and Tailwind CSS.

This project is recreating the workflow builder page from [Quo (OpenPhone)](https://my.openphone.com/settings/phone-numbers/PN1lNZ0Si4/workflow-builder?workflowDefinitionId=WD6dd9a5ebf788477a94b314625e100dc8&blockId=WSinsideBusinessHours).

<img width="1461" height="718" alt="Screenshot 2025-11-10 at 8 19 02 PM" src="https://github.com/user-attachments/assets/113c0061-40e2-4f46-a738-80b0c688e16a" />


## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) - React framework for production
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework
- **React**: Version 19.2.0
- **Fonts**: [Geist](https://vercel.com/font) - Optimized font family from Vercel
- **React Flow**: For building interactive node-based workflows
- **ELK.js**: For automatic graph layout

## Features

- ⚡️ Next.js 16 with App Router
- 🎨 Tailwind CSS v4 for styling
- 🌙 Dark mode support
- 📱 Responsive design
- 🔒 TypeScript for type safety
- ⚙️ ESLint for code quality

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone git@github.com:dsomel21/QuoSona.git
cd QuoSona
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
sona/
├── app/              # Next.js App Router directory
│   ├── layout.tsx   # Root layout component
│   ├── page.tsx     # Home page
│   └── globals.css  # Global styles
├── public/          # Static assets
├── next.config.ts   # Next.js configuration
├── tsconfig.json    # TypeScript configuration
└── package.json     # Dependencies and scripts
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn about Tailwind CSS

## Deploy

The easiest way to deploy your Next.js app is using the [Vercel Platform](https://vercel.com/new):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dsomel21/QuoSona)

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

This project is private and proprietary.
