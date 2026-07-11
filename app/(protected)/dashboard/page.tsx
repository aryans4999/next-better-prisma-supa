import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }
  const { user } = session;
  const notes = await prisma.note.findMany({
    where: {
      userId: user.id,
    },
  });
  return (
    <main>
      {user.email}
      Dashboard
      {notes.map((note) => (
        <div key={note.id}>{note.text}</div>
      ))}
    </main>
  );
}
