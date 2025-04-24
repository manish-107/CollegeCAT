'use client';

import Link from 'next/link';
import { Search, Bell, ChevronLeft, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/dashboard/ui/avatar";
import { Button } from "@/components/dashboard/ui/button";

export default function ProjectHeader() {
  return (
    <div className="flex flex-col border-b border-border">
      {/* Top navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center">
          <Button variant="default" size="icon" className="mr-2">
            <ChevronLeft size={18} />
          </Button>
          <div className="relative w-[240px]">
            <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-secondary/50 border-0 rounded-md pl-8 h-9 text-sm focus:ring-1 focus:ring-primary" 
            />
          </div>
        </div>
        
        <h1 className="text-xl font-semibold flex items-center gap-2">
          Over9k: Gamers app
          <Share2 size={16} className="text-muted-foreground cursor-pointer hover:text-primary" />
        </h1>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
            </Button>
            <div className="h-8 w-8 rounded-full overflow-hidden border border-border">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
      
      {/* Project navigation */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1">
          <Button variant="default" className="text-muted-foreground text-sm px-3 rounded-md">
            Overview
          </Button>
          <Button variant="ghost" className="text-muted-foreground text-sm px-3 rounded-md">
            Branding
          </Button>
          <Button variant="secondary" className="text-white text-sm px-3 rounded-md bg-primary">
            Mobile app for iOS
          </Button>
          <Button variant="ghost" className="text-muted-foreground text-sm px-3 rounded-md">
            Landing page
          </Button>
          <Button variant="ghost" className="text-muted-foreground text-sm px-3 rounded-md">
            Development
          </Button>
        </div>
      </div>
    </div>
  );
}
