import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/signout-button";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Authorized</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You need to log in to view this page.
            </p>

            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { user } = session;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
            <AvatarFallback>
              {user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>

          <div>
            <CardTitle>{user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardHeader>

        <CardContent>
          <p>Welcome back!</p>
          <SignOutButton />
        </CardContent>
      </Card>
    </main>
  );
}
