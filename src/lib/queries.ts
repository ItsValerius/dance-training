import { and, asc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { assignment, category, completion, exercise, groupMember, user } from "@/db/schema";

const assignedTo = (userId: string) =>
  or(eq(assignment.userId, userId), inArray(assignment.groupId, db.select({ id: groupMember.groupId }).from(groupMember).where(eq(groupMember.userId, userId))));

/** Exercises assigned to the student directly or via any of their groups, with their done state. */
export function exercisesForStudent(userId: string) {
  return db
    .selectDistinct({
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      category: category.name,
      youtubeId: exercise.youtubeId,
      completedAt: completion.completedAt,
      trainer: user.name,
    })
    .from(exercise)
    .innerJoin(category, eq(category.id, exercise.categoryId))
    .leftJoin(user, eq(user.id, exercise.createdById))
    .innerJoin(assignment, eq(assignment.exerciseId, exercise.id))
    .leftJoin(completion, and(eq(completion.exerciseId, exercise.id), eq(completion.userId, userId)))
    .where(assignedTo(userId))
    .orderBy(asc(category.name), asc(exercise.title));
}

export async function isAssigned(userId: string, exerciseId: string) {
  const row = await db
    .select({ id: assignment.id })
    .from(assignment)
    .where(and(eq(assignment.exerciseId, exerciseId), assignedTo(userId)))
    .get();
  return !!row;
}

/** Everyone the exercise reaches (direct or via group), with whether they checked it off. */
export async function exerciseProgress(exerciseId: string) {
  const rows = await db
    .selectDistinct({ id: user.id, name: user.name, completedAt: completion.completedAt })
    .from(assignment)
    .leftJoin(groupMember, eq(groupMember.groupId, assignment.groupId))
    .innerJoin(user, or(eq(user.id, assignment.userId), eq(user.id, groupMember.userId)))
    .leftJoin(completion, and(eq(completion.userId, user.id), eq(completion.exerciseId, exerciseId)))
    .where(and(eq(assignment.exerciseId, exerciseId), eq(user.role, "user")))
    .orderBy(asc(user.name));
  return rows;
}

export function categoryOptions() {
  return db.select({ value: category.id, label: category.name }).from(category).orderBy(asc(category.name));
}

export function students() {
  return db.query.user.findMany({
    where: eq(user.role, "user"),
    columns: { id: true, name: true, username: true, contactEmail: true },
    orderBy: asc(user.name),
  });
}

