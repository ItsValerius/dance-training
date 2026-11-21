import { sql } from "drizzle-orm";
import { check, index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date());

export const group = sqliteTable("group", {
  id: id(),
  name: text("name").notNull().unique(),
  createdAt: createdAt(),
});

export const groupMember = sqliteTable(
  "group_member",
  {
    groupId: text("group_id").notNull().references(() => group.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.groupId, t.userId] }), index("group_member_user_idx").on(t.userId)],
);

export const category = sqliteTable("category", {
  id: id(),
  name: text("name").notNull().unique(),
  createdAt: createdAt(),
});

export const exercise = sqliteTable("exercise", {
  id: id(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  // restrict: a category in use can't be deleted
  categoryId: text("category_id").notNull().references(() => category.id, { onDelete: "restrict" }),
  youtubeId: text("youtube_id").notNull(),
  createdById: text("created_by_id").references(() => user.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

// One row per target: either a single student or a whole group.
export const assignment = sqliteTable(
  "assignment",
  {
    id: id(),
    exerciseId: text("exercise_id").notNull().references(() => exercise.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    groupId: text("group_id").references(() => group.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [
    check("assignment_one_target", sql`(${t.userId} is null) <> (${t.groupId} is null)`),
    index("assignment_exercise_idx").on(t.exerciseId),
    index("assignment_user_idx").on(t.userId),
    index("assignment_group_idx").on(t.groupId),
  ],
);

// A student marked an exercise as done; deleting the row un-checks it.
export const completion = sqliteTable(
  "completion",
  {
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id").notNull().references(() => exercise.id, { onDelete: "cascade" }),
    completedAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.exerciseId] }), index("completion_exercise_idx").on(t.exerciseId)],
);

// One-time invite link: the recipient picks name, username and password. Only the token's hash is stored.
export const invitation = sqliteTable("invitation", {
  id: id(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  createdById: text("created_by_id").references(() => user.id, { onDelete: "set null" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp_ms" }),
  createdAt: createdAt(),
});
