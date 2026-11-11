"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import {
  countTodosForDate,
  createTodo,
  removeTodo,
  setTodoCompleted,
} from "@/lib/db/todos";
import { isValidDateKey } from "@/lib/date";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_TODOS_PER_DATE = 200;

async function requireUserId() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

export async function createTodoAction(formData: FormData) {
  const userId = await requireUserId();
  const title = String(formData.get("title") ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim();
  const scheduledDate = String(formData.get("scheduledDate") ?? "");
  const initialStatus = String(formData.get("status") ?? "dikerjakan");

  if (
    !title ||
    title.length > 200 ||
    !isValidDateKey(scheduledDate) ||
    (initialStatus !== "dikerjakan" && initialStatus !== "selesai")
  ) {
    return;
  }

  const currentCount = await countTodosForDate(userId, scheduledDate);
  if (currentCount >= MAX_TODOS_PER_DATE) {
    return;
  }

  const completed = initialStatus === "selesai";

  await createTodo(userId, title, scheduledDate, completed);
  revalidatePath("/");
}

export async function moveTodoStatusAction(todoId: string, completed: boolean) {
  const userId = await requireUserId();

  if (!uuidPattern.test(todoId)) {
    return;
  }

  await setTodoCompleted(userId, todoId, completed);
  revalidatePath("/");
}

export async function toggleTodoAction(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("todoId") ?? "");
  const completed = formData.get("completed") === "true";

  if (!uuidPattern.test(id)) {
    return;
  }

  await setTodoCompleted(userId, id, completed);
  revalidatePath("/");
}

export async function deleteTodoAction(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("todoId") ?? "");

  if (!uuidPattern.test(id)) {
    return;
  }

  await removeTodo(userId, id);
  revalidatePath("/");
}
