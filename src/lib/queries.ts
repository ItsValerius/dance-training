import { and, asc, desc, eq, gte, inArray, lt, notInArray, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import { assignment, category, completion, exercise, exerciseCategory, groupMember, planExercise, trainingPlan, user } from "@/db/schema";

const exclusion = alias(assignment, "exclusion");

/** Assignment rows that reach the student: direct or via a group, unless the student is excluded from that plan. */
const assignedTo = (userId: string) =>
  and(
    eq(assignment.excluded, false),
    or(eq(assignment.userId, userId), inArray(assignment.groupId, db.select({ id: groupMember.groupId }).from(groupMember).where(eq(groupMember.userId, userId)))),
    notInArray(assignment.planId, db.select({ id: exclusion.planId }).from(exclusion).where(and(eq(exclusion.userId, userId), eq(exclusion.excluded, true)))),
  );

/** Today as YYYY-MM-DD in the club's time zone, to compare with `trainingPlan.dueDate`. */
export const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });

export const formatDue = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Plans assigned to the student directly or via a group. Current: due today or later, soonest first. Past: newest first. */
export function plansForStudent(userId: string, when: "current" | "past") {
  const t = today();
  return db
    .selectDistinct({ id: trainingPlan.id, title: trainingPlan.title, dueDate: trainingPlan.dueDate, trainer: user.name })
    .from(trainingPlan)
    .innerJoin(assignment, eq(assignment.planId, trainingPlan.id))
    .leftJoin(user, eq(user.id, trainingPlan.createdById))
    .where(and(assignedTo(userId), when === "current" ? gte(trainingPlan.dueDate, t) : lt(trainingPlan.dueDate, t)))
    .orderBy(when === "current" ? asc(trainingPlan.dueDate) : desc(trainingPlan.dueDate));
}

/** The plan if it's assigned to the student, else undefined. */
export function planForStudent(userId: string, planId: string) {
  return db
    .select({ id: trainingPlan.id, title: trainingPlan.title, dueDate: trainingPlan.dueDate, trainer: user.name })
    .from(trainingPlan)
    .innerJoin(assignment, eq(assignment.planId, trainingPlan.id))
    .leftJoin(user, eq(user.id, trainingPlan.createdById))
    .where(and(eq(trainingPlan.id, planId), assignedTo(userId)))
    .get();
}

const firstCategory = sql<string | null>`min(${category.name})`;

/** A plan's exercises with the student's done state; `category` is the first of its categories (null if none). */
export function planExercisesForStudent(userId: string, planId: string) {
  return db
    .select({
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      category: firstCategory,
      youtubeId: exercise.youtubeId,
      completedAt: completion.completedAt,
    })
    .from(planExercise)
    .innerJoin(exercise, eq(exercise.id, planExercise.exerciseId))
    .leftJoin(exerciseCategory, eq(exerciseCategory.exerciseId, exercise.id))
    .leftJoin(category, eq(category.id, exerciseCategory.categoryId))
    .leftJoin(completion, and(eq(completion.planId, planId), eq(completion.exerciseId, exercise.id), eq(completion.userId, userId)))
    .where(eq(planExercise.planId, planId))
    .groupBy(exercise.id)
    .orderBy(sql`${firstCategory} is null`, firstCategory, asc(exercise.title));
}

/** Done-count per plan for one student. */
export async function doneCounts(userId: string, planIds: string[]) {
  if (!planIds.length) return new Map<string, { done: number; total: number }>();
  const rows = await db
    .select({ planId: planExercise.planId, done: completion.completedAt })
    .from(planExercise)
    .leftJoin(completion, and(eq(completion.planId, planExercise.planId), eq(completion.exerciseId, planExercise.exerciseId), eq(completion.userId, userId)))
    .where(inArray(planExercise.planId, planIds));
  const m = new Map(planIds.map((id) => [id, { done: 0, total: 0 }]));
  for (const r of rows) {
    const c = m.get(r.planId)!;
    c.total++;
    if (r.done) c.done++;
  }
  return m;
}

/** True if the exercise is part of a current plan that reaches the student, i.e. they may tick it off. Past plans are read-only. */
export async function isAssigned(userId: string, planId: string, exerciseId: string) {
  const row = await db
    .select({ id: assignment.id })
    .from(assignment)
    .innerJoin(planExercise, and(eq(planExercise.planId, assignment.planId), eq(planExercise.exerciseId, exerciseId)))
    .innerJoin(trainingPlan, eq(trainingPlan.id, assignment.planId))
    .where(and(eq(assignment.planId, planId), gte(trainingPlan.dueDate, today()), assignedTo(userId)))
    .get();
  return !!row;
}

/** Everyone the plan reaches (direct or via group, minus exclusions), with how many of its exercises they checked off. */
export async function planProgress(planId: string) {
  const people = await db
    .selectDistinct({ id: user.id, name: user.name })
    .from(assignment)
    .leftJoin(groupMember, eq(groupMember.groupId, assignment.groupId))
    .innerJoin(user, or(eq(user.id, assignment.userId), eq(user.id, groupMember.userId)))
    .where(and(eq(assignment.planId, planId), eq(assignment.excluded, false), eq(user.role, "user")))
    .orderBy(asc(user.name));
  const excluded = new Set(
    (await db.select({ userId: assignment.userId }).from(assignment).where(and(eq(assignment.planId, planId), eq(assignment.excluded, true)))).map((r) => r.userId),
  );
  const done = await db
    .select({ userId: completion.userId })
    .from(completion)
    .innerJoin(planExercise, and(eq(planExercise.planId, completion.planId), eq(planExercise.exerciseId, completion.exerciseId)))
    .where(eq(completion.planId, planId));
  return people.filter((p) => !excluded.has(p.id)).map((p) => ({ ...p, done: done.filter((d) => d.userId === p.id).length }));
}

/** Category names per exercise id, alphabetical. */
// shortcut: loads every exercise's categories; filter by ids once the library grows into the thousands
export async function categoriesByExercise() {
  const rows = await db
    .select({ exerciseId: exerciseCategory.exerciseId, id: category.id, name: category.name })
    .from(exerciseCategory)
    .innerJoin(category, eq(category.id, exerciseCategory.categoryId))
    .orderBy(asc(category.name));
  return Map.groupBy(rows, (r) => r.exerciseId);
}

export function categoryOptions() {
  return db.select({ value: category.id, label: category.name }).from(category).orderBy(asc(category.name));
}

export function students() {
  return db.query.user.findMany({
    where: eq(user.role, "user"),
    columns: { id: true, name: true, email: true },
    orderBy: asc(user.name),
  });
}

/** Plans due today or later, soonest first, as picker options ("Woche 3 · bis Fr., 28. November 2026"). */
export async function currentPlanOptions() {
  const rows = await db
    .select({ id: trainingPlan.id, title: trainingPlan.title, dueDate: trainingPlan.dueDate })
    .from(trainingPlan)
    .where(gte(trainingPlan.dueDate, today()))
    .orderBy(asc(trainingPlan.dueDate));
  return rows.map((p) => ({ value: p.id, label: `${p.title} · fällig ${formatDue(p.dueDate)}` }));
}

/** Which exercises each of the given plans holds. */
export async function planExerciseIds(planIds: string[]) {
  if (!planIds.length) return [];
  return db.select({ planId: planExercise.planId, exerciseId: planExercise.exerciseId }).from(planExercise).where(inArray(planExercise.planId, planIds));
}
