import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronsUpDown } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

const AppSidebar = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return redirect("/login");
  const { user } = session;
  return (
    <Sidebar variant="inset">
      <SidebarHeader></SidebarHeader>
      <SidebarContent></SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <Avatar>
                      <AvatarImage
                        src={user.image ?? ""}
                        alt={user.name ?? "User"}
                      />
                      <AvatarFallback>
                        {user.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <p>{user.name}</p>
                    <ChevronsUpDown />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <p>Profile</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <p>Logout</p>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
