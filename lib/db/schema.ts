import {
  boolean,
  date,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const todos = pgTable(
  "todos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Clerk owns user identity; keep its stable user ID without duplicating auth data.
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    scheduledDate: date("scheduled_date", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_DATE`),
    completed: boolean("completed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("todos_user_id_idx").on(table.userId),
    index("todos_user_date_idx").on(table.userId, table.scheduledDate),
  ],
);
