// Dev-only test data. Usage: pnpm seed (on an empty database)
import { auth } from "../src/lib/auth";
import { db } from "../src/db";
import { assignment, category, exercise, group, groupMember } from "../src/db/schema";
import { slugify } from "../src/lib/slug";

const PASSWORD = "password123";
const mk = (username: string, name: string, role?: "admin") =>
  auth.api.createUser({
    body: { name, password: PASSWORD, role, email: `${username}@${role ? "trainers" : "students"}.invalid`, data: { username, displayUsername: username, contactEmail: `${username}@example.com` } },
  }).then((r) => r.user);

await mk("coach", "Trainerin Anna", "admin");
const [mia, leo, ella] = await Promise.all([mk("mia", "Mia"), mk("leo", "Leo"), mk("ella", "Ella")]);

const [juniors, seniors] = await db.insert(group).values([{ name: "Kinder" }, { name: "Jugend" }]).returning();
await db.insert(groupMember).values([
  { groupId: juniors.id, userId: mia.id },
  { groupId: juniors.id, userId: leo.id },
  { groupId: seniors.id, userId: ella.id },
]);

const [technique, flexibility, ballroom] = await db
  .insert(category)
  .values([{ name: "Technik" }, { name: "Beweglichkeit" }, { name: "Gesellschaftstanz" }])
  .returning();
const exercises = [
  { title: "Pirouetten-Grundlagen", categoryId: technique.id, youtubeId: "dQw4w9WgXcQ", description: "Kopf mitnehmen, Körpermitte fest halten." },
  { title: "Tägliches Dehnen", categoryId: flexibility.id, youtubeId: "dQw4w9WgXcQ", description: "10 Minuten vor jedem Training." },
  { title: "Walzer-Grundschritt", categoryId: ballroom.id, youtubeId: "dQw4w9WgXcQ" },
];
const [turns, stretch, waltz] = await db
  .insert(exercise)
  .values(exercises.map((e) => ({ ...e, slug: slugify(e.title) })))
  .returning();
await db.insert(assignment).values([
  { exerciseId: stretch.id, groupId: juniors.id },
  { exerciseId: waltz.id, groupId: seniors.id },
  { exerciseId: turns.id, userId: mia.id },
]);
console.log("Seeded.");
