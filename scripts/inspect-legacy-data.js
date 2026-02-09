const { PrismaClient } = require('../prisma/generated/client-legacy');

const prisma = new PrismaClient();

async function main() {
  console.log('--- PROJECTS ---');
  const projects = await prisma.projects.findMany();
  console.log(projects);

  console.log('\n--- VIDEOS (Count) ---');
  const count = await prisma.videos.count();
  console.log(count);

  console.log('\n--- SEARCHING FOR NPG/VEX ---');
  const npgVideos = await prisma.videos.findMany({
    where: {
        OR: [
            { filename: { contains: 'npg', mode: 'insensitive' } },
            { filename: { contains: 'ninja', mode: 'insensitive' } },
            { url: { contains: 'npg', mode: 'insensitive' } },
            { url: { contains: 'ninja', mode: 'insensitive' } }
        ]
    },
    take: 5
  });
  console.log('NPG Matches:', npgVideos.length);
  console.log(JSON.stringify(npgVideos, (k,v) => typeof v === 'bigint' ? v.toString() : v, 2));

  const vexVideos = await prisma.videos.findMany({
      where: {
          OR: [
              { filename: { contains: 'vex', mode: 'insensitive' } },
              { filename: { contains: 'void', mode: 'insensitive' } },
              { url: { contains: 'vex', mode: 'insensitive' } },
              { url: { contains: 'v3xv0id', mode: 'insensitive' } }
          ]
      },
      take: 5
  });
  console.log('Vex Matches:', vexVideos.length);
  console.log(JSON.stringify(vexVideos, (k,v) => typeof v === 'bigint' ? v.toString() : v, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
