'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

const mainRoutes = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Projects', href: '/projects' },
  { name: 'Analytics', href: '/analytics' },
];

const resourceRoutes = [
  {
    title: 'Documentation',
    href: '/docs',
    description: 'Learn how to use the platform and its features.',
  },
  {
    title: 'API Reference',
    href: '/api-reference',
    description: 'Detailed API documentation for developers.',
  },
  {
    title: 'Examples',
    href: '/examples',
    description: 'View example projects and implementations.',
  },
  {
    title: 'Templates',
    href: '/templates',
    description: 'Ready-to-use templates for quick setup.',
  },
];

export function MainNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b backdrop-blur bg-background/50">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl">Stack</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:space-x-2">
            <NavigationMenu>
              <NavigationMenuList>
                {mainRoutes.map((route) => (
                  <NavigationMenuItem key={route.href}>
                      <NavigationMenuLink
                        href={route.href}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          pathname === route.href && 'bg-accent text-accent-foreground'
                        )}
                      >
                        {route.name}
                      </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-4">

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            
              <SheetContent side="right" className="w-[80%] max-w-[350px] pt-10 p-4">

                <SheetHeader className='aria-hidden hidden'>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <Link href="/" onClick={() => setIsOpen(false)}>
                      <span className="font-bold text-xl">Stack</span>
                    </Link>
                   
                  </div>
                  <nav className="flex flex-col gap-2">
                    {mainRoutes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'flex items-center py-2 text-base font-medium transition-colors hover:text-foreground/80',
                          pathname === route.href ? 'text-foreground' : 'text-foreground/60'
                        )}
                      >
                        {route.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
