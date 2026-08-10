"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// 2one sample data (replaces the block placeholder demo content).
const data = {
  user: {
    name: "2one Team",
    email: "team@2one.solutions",
    avatar: "/avatars/2one.jpg",
  },
  teams: [
    {
      name: "2one",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "2one Labs",
      logo: AudioWaveform,
      plan: "Studio",
    },
    {
      name: "2one Client",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Components",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "#",
        },
        {
          title: "Forms",
          url: "#",
        },
        {
          title: "Overlays",
          url: "#",
        },
      ],
    },
    {
      title: "Templates",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Login",
          url: "#",
        },
        {
          title: "Dashboard",
          url: "#",
        },
        {
          title: "Sidebar",
          url: "#",
        },
      ],
    },
    {
      title: "Foundations",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Colour",
          url: "#",
        },
        {
          title: "Typography",
          url: "#",
        },
        {
          title: "Tokens",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design System",
      url: "#",
      icon: Frame,
    },
    {
      name: "Web",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Mobile",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
