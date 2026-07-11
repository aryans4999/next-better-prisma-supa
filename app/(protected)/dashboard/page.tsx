import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-interactive";
import { DataTable } from "@/components/data-table";
import data from "./data.json";

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
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </main>
  );
}
