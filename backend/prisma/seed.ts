import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const secretariaUsername = process.env.SEED_SECRETARY_USER ?? 'secretaria';
  const secretariaPassword = process.env.SEED_SECRETARY_PASS ?? 'clinica123';

  await prisma.secretaria.upsert({
    where: { username: secretariaUsername },
    update: {},
    create: {
      username: secretariaUsername,
      passwordHash: await bcrypt.hash(secretariaPassword, 10),
      rol: 'SECRETARIA',
    },
  });
  console.log(`Usuario secretaria listo -> username: "${secretariaUsername}"`);

  const jefaUsername = process.env.SEED_JEFA_USER ?? 'marina';
  const jefaPassword = process.env.SEED_JEFA_PASS ?? 'benitez123';

  await prisma.secretaria.upsert({
    where: { username: jefaUsername },
    update: {},
    create: {
      username: jefaUsername,
      passwordHash: await bcrypt.hash(jefaPassword, 10),
      rol: 'JEFA',
    },
  });
  console.log(`Usuario jefa listo -> username: "${jefaUsername}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
