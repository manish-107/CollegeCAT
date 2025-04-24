// components/DashboardSidebar.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/components/dashboard/lib/utils';
import {
  Star, ChevronDown, LayoutGrid, Clock,
  Settings, FileText, User2,
} from 'lucide-react';

const projects = [
  { name: "Over9k: Gamers app", favorite: true },
  { name: "AfterMidnight", favorite: true },
  { name: "Guitar Tuner", favorite: false },
  { name: "AfterMidnight", favorite: true },
  { name: "Doctor+", favorite: false },
];

const subItems = [
  { name: "Overview", path: "#overview" },
  { name: "Branding", path: "#branding" },
  { name: "Mobile app for iOS", path: "#mobile", active: true },
  { name: "Landing page", path: "#landing" },
  { name: "Development", path: "#development" },
];

export default function DashboardSidebar() {
  const [favoriteOpen, setFavoriteOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);

  return (
    <div className="w-[280px] flex-shrink-0 h-full bg-sidebar overflow-y-auto pb-6">
      <div className="p-4">
        <div className="flex items-center mb-5 px-2">
          <div className="h-6 w-6 bg-primary rounded-sm flex items-center justify-center text-white font-bold text-sm">
            Σ
          </div>
        </div>

        <div className="mb-4 space-y-1">
          <button className="flex items-center w-full text-sm p-2 text-sidebar-foreground rounded-md group hover:bg-sidebar-accent">
            <LayoutGrid size={16} className="mr-2 text-muted-foreground" />
            <span className="flex-1 text-left">Projects</span>
          </button>
          <button className="flex items-center w-full text-sm p-2 text-sidebar-foreground rounded-md group hover:bg-sidebar-accent">
            <Clock size={16} className="mr-2 text-muted-foreground" />
            <span className="flex-1 text-left">Recent</span>
          </button>
        </div>

        {/* Favorites */}
        <div className="mb-4">
          <button
            onClick={() => setFavoriteOpen(!favoriteOpen)}
            className="flex items-center w-full text-sm p-2 text-sidebar-foreground rounded-md hover:bg-sidebar-accent"
          >
            <ChevronDown size={16} className={cn("mr-1 transition-transform text-muted-foreground", favoriteOpen ? "" : "-rotate-90")} />
            <span className="flex-1 text-left font-medium">Favorites</span>
          </button>

          {favoriteOpen && (
            <div className="mt-1 pl-2 space-y-1">
              {projects.filter(p => p.favorite).map((project, i) => (
                <Link key={`fav-${i}`} href="#">
                  <div className="flex items-center px-2 py-1.5 text-sm text-sidebar-foreground rounded-md hover:bg-sidebar-accent group">
                    <FileText size={16} className="mr-2 text-blue-400" />
                    <span className="flex-1">{project.name}</span>
                    <Star size={16} className="opacity-0 group-hover:opacity-100 text-yellow-400 fill-yellow-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* All Projects */}
        <div className="mb-4">
          <button
            onClick={() => setProjectsOpen(!projectsOpen)}
            className="flex items-center w-full text-sm p-2 text-sidebar-foreground rounded-md hover:bg-sidebar-accent"
          >
            <ChevronDown size={16} className={cn("mr-1 transition-transform text-muted-foreground", projectsOpen ? "" : "-rotate-90")} />
            <span className="flex-1 text-left font-medium">All projects</span>
          </button>

          {projectsOpen && (
            <div className="mt-1 pl-2 space-y-1">
              {projects.map((project, i) => (
                <div key={`project-${i}`} className="mb-1">
                  <Link href="#">
                    <div className={cn(
                      "flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent group",
                      i === 0 ? "text-white bg-sidebar-accent" : "text-sidebar-foreground"
                    )}>
                      <FileText size={16} className="mr-2 text-blue-400" />
                      <span className="flex-1">{project.name}</span>
                      <Star
                        size={16}
                        className={cn(
                          "text-yellow-400",
                          project.favorite ? "fill-yellow-400" : "opacity-0 group-hover:opacity-100"
                        )}
                      />
                    </div>
                  </Link>

                  {i === 0 && (
                    <div className="mt-1 pl-4 space-y-1">
                      {subItems.map((item, j) => (
                        <Link key={`sub-${j}`} href={item.path}>
                          <div className={cn(
                            "flex items-center px-2 py-1 text-xs rounded-md",
                            item.active ? "text-white bg-primary" : "text-sidebar-foreground hover:bg-sidebar-accent"
                          )}>
                            {item.active && <div className="w-1 h-1 rounded-full bg-white mr-2"></div>}
                            <span>{item.name}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4">
          <button className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md text-sm font-medium">
            New project
          </button>
        </div>
      </div>
    </div>
  );
}
