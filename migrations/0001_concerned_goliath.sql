ALTER TABLE "class_diary_entries" ADD COLUMN "topic" text NOT NULL;--> statement-breakpoint
ALTER TABLE "mock_tests" ADD COLUMN "total_questions" integer;--> statement-breakpoint
ALTER TABLE "mock_tests" ADD COLUMN "passing_score" integer DEFAULT 70;--> statement-breakpoint
ALTER TABLE "mock_tests" ADD COLUMN "scheduled_date" timestamp;