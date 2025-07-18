'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, BrainCircuit, LayoutDashboard, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// import { useAddEntry } from '@/components/add-entry-dialog';
 import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
];

export function BottomNav() {
  const pathname = usePathname();
//   const { setOpen } = useAddEntry();

  return (
    <TooltipProvider>
      <footer className="fixed bottom-0 left-0 right-0 flex justify-center p-4 z-50">
        <nav className="flex items-center gap-2 p-2 rounded-full bg-card border border-border shadow-lg">
          <Link
            href="/"
            className="flex items-center gap-2 font-headline font-semibold text-foreground p-2 rounded-full hover:bg-muted"
          >
            <BrainCircuit className="h-6 w-6 text-primary" />
          </Link>
          <div className="h-8 w-px bg-border mx-2" />
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center justify-center h-10 w-10 rounded-full text-muted-foreground transition-all hover:text-primary hover:bg-muted',
                    pathname === item.href && 'bg-muted text-primary'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          <div className="h-8 w-px bg-border mx-2" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                // onClick={() => setOpen(true)}
                className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90"
              >
                <Plus className="h-6 w-6" />
                <span className="sr-only">New Entry</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>New Entry</p>
            </TooltipContent>
          </Tooltip>
        </nav>
      </footer>
    </TooltipProvider>
  );
}
