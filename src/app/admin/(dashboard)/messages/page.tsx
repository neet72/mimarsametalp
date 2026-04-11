import { prisma } from "@/lib/db/prisma";
import { MessageReadToggle } from "@/components/admin/MessageReadToggle";

export default async function AdminMessagesPage() {
  let messages: Awaited<ReturnType<typeof prisma.message.findMany>> = [];
  try {
    messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    /* DB yok */
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">Mesajlar</h1>
        <p className="mt-1 text-sm text-zinc-500">İletişim formundan gelen talepler.</p>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-12 text-center text-zinc-500">
            Henüz mesaj yok veya veritabanı bağlı değil.
          </p>
        ) : (
          messages.map((m) => (
            <article
              key={m.id}
              className={`rounded-xl border p-5 ${
                m.read ? "border-zinc-800 bg-zinc-950/30" : "border-[rgb(166,124,82)]/25 bg-zinc-950/60"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-100">
                    {m.firstName} {m.lastName}
                  </p>
                  <a
                    href={`mailto:${m.email}`}
                    className="text-sm text-[rgb(200,170,130)] hover:underline"
                  >
                    {m.email}
                  </a>
                  <p className="mt-1 text-xs text-zinc-500">
                    {m.createdAt.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
                <MessageReadToggle id={m.id} read={m.read} />
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{m.body}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
