// Dev-only test data. Usage: pnpm seed (on an empty database)
import { auth } from "../src/lib/auth";
import { db } from "../src/db";
import { assignment, category, exercise, exerciseCategory, group, groupMember, planExercise, trainingPlan } from "../src/db/schema";
import { slugify } from "../src/lib/slug";

const PASSWORD = "password123";
const mk = (handle: string, name: string, role?: "admin") =>
  auth.api.createUser({
    body: { name, password: PASSWORD, role, email: `${handle}@example.com` }, // example.com is reserved, never delivers
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
  { title: "Pirouetten-Grundlagen", youtubeId: "dQw4w9WgXcQ", description: "Kopf mitnehmen, Körpermitte fest halten." },
  { title: "Tägliches Dehnen", youtubeId: "dQw4w9WgXcQ", description: "10 Minuten vor jedem Training." },
  { title: "Walzer-Grundschritt", youtubeId: "dQw4w9WgXcQ" },
];
const [turns, stretch, waltz] = await db
  .insert(exercise)
  .values(exercises.map((e) => ({ ...e, slug: slugify(e.title) })))
  .returning();
await db.insert(exerciseCategory).values([
  { exerciseId: turns.id, categoryId: technique.id },
  { exerciseId: stretch.id, categoryId: flexibility.id },
  { exerciseId: waltz.id, categoryId: ballroom.id },
  { exerciseId: waltz.id, categoryId: technique.id }, // several categories
]);
const day = (offset: number) => new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10);
const [lastWeek, thisWeek, seniorsPlan] = await db
  .insert(trainingPlan)
  .values([
    { title: "Woche 1", dueDate: day(-7) },
    { title: "Woche 2", dueDate: day(7) },
    { title: "Walzer-Woche", dueDate: day(7) },
  ])
  .returning();
await db.insert(planExercise).values([
  { planId: lastWeek.id, exerciseId: stretch.id },
  { planId: thisWeek.id, exerciseId: stretch.id },
  { planId: thisWeek.id, exerciseId: turns.id },
  { planId: seniorsPlan.id, exerciseId: waltz.id },
]);
await db.insert(assignment).values([
  { planId: lastWeek.id, groupId: juniors.id },
  { planId: thisWeek.id, groupId: juniors.id },
  { planId: seniorsPlan.id, groupId: seniors.id },
]);
console.log("Seeded.");
