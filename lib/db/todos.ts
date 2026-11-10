import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { todos } from "@/lib/db/schema";

export function listTodos(userId: string, scheduledDate: string) {
  return getDb()
    .select()
    .from(todos)
    .where(
      and(
        eq(todos.userId, userId),
        eq(todos.scheduledDate, scheduledDate),
      ),
    )
    .orderBy(desc(todos.createdAt));
}

export function createTodo(
  userId: string,
  title: string,
  scheduledDate: string,
  completed = false,
) {
  return getDb()
    .insert(todos)
    .values({ userId, title, scheduledDate, completed })
    .returning();
}

export function setTodoCompleted(
  userId: string,
  id: string,
  completed: boolean,
) {
  return getDb()
    .update(todos)
    .set({ completed, updatedAt: new Date() })
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning({ id: todos.id });
}

export function removeTodo(userId: string, id: string) {
  return getDb()
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning({ id: todos.id });
}
