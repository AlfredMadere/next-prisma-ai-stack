import { Card, CardContent } from "@/components/ui/card";

const dependencies = [
  { name: "Next.js", description: "The React framework for production apps", url: "https://nextjs.org/" },
  { name: "Prisma", description: "Strongly typed ORM for Node.js & TypeScript", url: "https://www.prisma.io/" },
  { name: "@tanstack/react-query", description: "Data fetching and mutation", url: "https://tanstack.com/query/latest" },
  { name: "zod", description: "Schema validation", url: "https://zod.dev/" },
  { name: "task-master-ai", description: "Task management for AI-driven development", url: "https://www.npmjs.com/package/task-master-ai" },
  { name: "react-hook-form", description: "Performant, flexible forms", url: "https://react-hook-form.com/" },
  { name: "shadcn/ui", description: "Beautiful, accessible components", url: "https://ui.shadcn.com/" },
  { name: "tailwindcss", description: "Utility-first CSS framework", url: "https://tailwindcss.com/" },
  { name: "lucide-react", description: "Beautiful, consistent icons", url: "https://lucide.dev/" },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6 md:p-12">
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Next.js & Prisma AI Template
        </h1>
        <p className="text-lg md:text-xl mb-6 text-muted-foreground">
          by Alfred Madere
        </p>
        <div className="h-1 w-24 mx-auto bg-primary/20 rounded-full mb-8"></div>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          A modern, AI-driven full stack starter with all the tools you need to build
          beautiful, performant, and type-safe web applications.
        </p>
      </div>
      
      <section className="w-full max-w-4xl mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Key Dependencies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {dependencies.map((dep) => (
            <a
              key={dep.name}
              href={dep.url}
              target="_blank"
              rel="noopener noreferrer"
              className="focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
            >
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 bg-card border border-border">
                <CardContent className="p-5 flex flex-col gap-2">
                  <h3 className="font-semibold text-lg text-foreground">{dep.name}</h3>
                  <p className="text-sm text-muted-foreground">{dep.description}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Built with Next.js 15 and Prisma 6</p>
      </div>
    </main>
  );
}
