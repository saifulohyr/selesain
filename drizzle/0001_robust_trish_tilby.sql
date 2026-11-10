ALTER TABLE "todos" ADD COLUMN "scheduled_date" date DEFAULT CURRENT_DATE NOT NULL;--> statement-breakpoint
CREATE INDEX "todos_user_date_idx" ON "todos" USING btree ("user_id","scheduled_date");