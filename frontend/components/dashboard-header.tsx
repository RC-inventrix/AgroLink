import { Search, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

//import logo from "../public/buyer-dashboard/agro-logo.png"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-primary text-primary-foreground">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Image src="/buyer-dashboard/agro-logo.png" alt="Agro Logo" width={120} height={40} className="h-10 w-auto" />
        </div>

        <div className="flex flex-1 items-center justify-center px-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vegetables..."
              className="pl-10 bg-white text-foreground placeholder:text-muted-foreground"
            />
            <Button
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Search
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-primary-foreground hover:text-primary-foreground hover:bg-primary/90"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-primary-foreground hover:text-primary-foreground hover:bg-primary/90"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/buyer-dashboard/diverse-user-avatars.png" />
                  <AvatarFallback>BU</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">My Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
