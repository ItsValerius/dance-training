-- Training plans, plan exclusions, several categories per exercise. Hand-written (drizzle-kit cannot ask its
-- rename questions in CI). Order matters: nothing may reference `exercise` when it is dropped, or the
-- ON DELETE cascades would delete rows of the referencing tables.

-- 1. keep each exercise's category before its column goes
CREATE TABLE `__exercise_category_copy` AS SELECT `id` AS `exercise_id`, `category_id` FROM `exercise`;--> statement-breakpoint

-- 2. assignments and done states now belong to a plan; old rows can't be mapped to one
DROP TABLE `assignment`;--> statement-breakpoint
DROP TABLE `completion`;--> statement-breakpoint

-- 3. exercise without category_id (SQLite can't drop a column used in a foreign key)
CREATE TABLE `__new_exercise` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`youtube_id` text NOT NULL,
	`created_by_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`created_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);--> statement-breakpoint
INSERT INTO `__new_exercise` (`id`, `title`, `slug`, `description`, `youtube_id`, `created_by_id`, `created_at`)
	SELECT `id`, `title`, `slug`, `description`, `youtube_id`, `created_by_id`, `created_at` FROM `exercise`;--> statement-breakpoint
DROP TABLE `exercise`;--> statement-breakpoint
ALTER TABLE `__new_exercise` RENAME TO `exercise`;--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_slug_unique` ON `exercise` (`slug`);--> statement-breakpoint

-- 4. categories as a link table, filled from the copy
CREATE TABLE `exercise_category` (
	`exercise_id` text NOT NULL,
	`category_id` text NOT NULL,
	PRIMARY KEY(`exercise_id`, `category_id`),
	FOREIGN KEY (`exercise_id`) REFERENCES `exercise`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE restrict
);--> statement-breakpoint
CREATE INDEX `exercise_category_category_idx` ON `exercise_category` (`category_id`);--> statement-breakpoint
INSERT INTO `exercise_category` (`exercise_id`, `category_id`) SELECT `exercise_id`, `category_id` FROM `__exercise_category_copy`;--> statement-breakpoint
DROP TABLE `__exercise_category_copy`;--> statement-breakpoint

-- 5. plans
CREATE TABLE `training_plan` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`due_date` text NOT NULL,
	`created_by_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`created_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);--> statement-breakpoint
CREATE INDEX `training_plan_due_idx` ON `training_plan` (`due_date`);--> statement-breakpoint
CREATE TABLE `plan_exercise` (
	`plan_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	PRIMARY KEY(`plan_id`, `exercise_id`),
	FOREIGN KEY (`plan_id`) REFERENCES `training_plan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercise`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE INDEX `plan_exercise_exercise_idx` ON `plan_exercise` (`exercise_id`);--> statement-breakpoint
CREATE TABLE `assignment` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`user_id` text,
	`group_id` text,
	`excluded` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `training_plan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "assignment_one_target" CHECK(("assignment"."user_id" is null) <> ("assignment"."group_id" is null))
);--> statement-breakpoint
CREATE INDEX `assignment_plan_idx` ON `assignment` (`plan_id`);--> statement-breakpoint
CREATE INDEX `assignment_user_idx` ON `assignment` (`user_id`);--> statement-breakpoint
CREATE INDEX `assignment_group_idx` ON `assignment` (`group_id`);--> statement-breakpoint
CREATE TABLE `completion` (
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `plan_id`, `exercise_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`plan_id`) REFERENCES `training_plan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercise`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE INDEX `completion_plan_idx` ON `completion` (`plan_id`);
