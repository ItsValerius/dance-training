// Who sees a plan and may tick it off: direct, via group, minus exclusions. Runs against a throwaway SQLite file.
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { before, test } from "node:test";
import { migrate } from "drizzle-orm/libsql/migrator";

// imported in before(): DATABASE_URL must be set before the db module reads it
let q: typeof import("@/lib/queries");

const ids = { kid: "u-kid", other: "u-other", outsider: "u-out", direct: "u-direct", group: "g-1", ex: "e-1", plan: "p-now", past: "p-past" };

before(async () => {
  process.env.DATABASE_URL = `file:${join(mkdtempSync(join(tmpdir(), "plans-test-")), "test.db")}`;
  const { db } = await import("@/db");
  const s = await import("@/db/schema");
  q = await import("@/lib/queries");
  await migrate(db, { migrationsFolder: "drizzle" }); // the real migrations, so they are tested too
  await db.insert(s.user).values(
    [ids.kid, ids.other, ids.outsider, ids.direct].map((id) => ({ id, name: id, email: `${id}@example.com`, role: "user" })),
  );
  await db.insert(s.group).values({ id: ids.group, name: "Kinder" });
  await db.insert(s.groupMember).values([ids.kid, ids.other].map((userId) => ({ groupId: ids.group, userId })));
  await db.insert(s.exercise).values({ id: ids.ex, title: "Dehnen", slug: "dehnen", youtubeId: "dQw4w9WgXcQ" });
  await db.insert(s.trainingPlan).values([
    { id: ids.plan, title: "Jetzt", dueDate: "2999-01-01" },
    { id: ids.past, title: "Früher", dueDate: "2000-01-01" },
  ]);
  await db.insert(s.planExercise).values([ids.plan, ids.past].map((planId) => ({ planId, exerciseId: ids.ex })));
  await db.insert(s.assignment).values([
    { planId: ids.plan, groupId: ids.group },
    { planId: ids.plan, userId: ids.direct },
    { planId: ids.plan, userId: ids.other, excluded: true },
    { planId: ids.past, groupId: ids.group },
  ]);
});

const current = async (userId: string) => (await q.plansForStudent(userId, "current")).map((p) => p.id);

test("a group member sees the plan and may tick it", async () => {
  assert.deepEqual(await current(ids.kid), [ids.plan]);
  assert.equal(await q.isAssigned(ids.kid, ids.plan, ids.ex), true);
});

test("past plans only show in the history", async () => {
  assert.deepEqual((await q.plansForStudent(ids.kid, "past")).map((p) => p.id), [ids.past]);
});

test("a direct assignment works without a group", async () => {
  assert.deepEqual(await current(ids.direct), [ids.plan]);
  assert.equal(await q.isAssigned(ids.direct, ids.plan, ids.ex), true);
});

test("an excluded group member neither sees nor ticks the plan", async () => {
  assert.deepEqual(await current(ids.other), []);
  assert.equal(await q.planForStudent(ids.other, ids.plan), undefined);
  assert.equal(await q.isAssigned(ids.other, ids.plan, ids.ex), false);
  // the exclusion is per plan: the same student still has the past plan via the group
  assert.ok(await q.planForStudent(ids.other, ids.past));
});

test("someone outside every target gets nothing", async () => {
  assert.deepEqual(await current(ids.outsider), []);
  assert.equal(await q.isAssigned(ids.outsider, ids.plan, ids.ex), false);
});

test("progress lists exactly the reached students", async () => {
  assert.deepEqual((await q.planProgress(ids.plan)).map((p) => p.id).sort(), [ids.direct, ids.kid].sort());
});
