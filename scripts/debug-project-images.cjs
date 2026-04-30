const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.project.findMany({
      take: 10,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        published: true,
        updatedAt: true,
        imageUrls: true,
      },
    });

    const out = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      published: r.published,
      updatedAt: r.updatedAt,
      imageUrls: r.imageUrls,
    }));

    console.log(JSON.stringify(out, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

