import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing; run `neon env pull` first.");
}

const sql = neon(databaseUrl);
const [result] = await sql`
  select to_regclass('public.todos') is not null as todos_table_exists
`;

if (!result?.todos_table_exists) {
  throw new Error("Connected to Neon, but public.todos was not found.");
}

const testId = randomUUID();
const otherDateTestId = randomUUID();
const testUserId = `neon-e2e-${testId}`;
const testTitle = "Neon date-scoped CRUD smoke test";
const firstDate = "2030-01-01";
const secondDate = "2030-01-02";

const [inserted, insertedOtherDate, listed, listedOtherDate, updated, deleted] = await sql.transaction([
  sql`
    insert into todos (id, user_id, title, scheduled_date)
    values (${testId}, ${testUserId}, ${testTitle}, ${firstDate})
    returning id, title, completed, scheduled_date
  `,
  sql`
    insert into todos (id, user_id, title, scheduled_date)
    values (${otherDateTestId}, ${testUserId}, 'Another day', ${secondDate})
    returning id, scheduled_date
  `,
  sql`
    select id, title, completed, scheduled_date
    from todos
    where user_id = ${testUserId} and scheduled_date = ${firstDate}
  `,
  sql`
    select id, title, completed, scheduled_date
    from todos
    where user_id = ${testUserId} and scheduled_date = ${secondDate}
  `,
  sql`
    update todos
    set completed = true, updated_at = now()
    where id = ${testId} and user_id = ${testUserId} and scheduled_date = ${firstDate}
    returning id, completed
  `,
  sql`
    delete from todos
    where user_id = ${testUserId}
    returning id
  `,
]);

const checks = {
  insertTitle: inserted?.[0]?.title === testTitle,
  insertOtherDate: insertedOtherDate?.[0]?.id === otherDateTestId,
  list: listed?.length === 1 && listed?.[0]?.id === testId,
  listOtherDate: listedOtherDate?.length === 1 && listedOtherDate?.[0]?.id === otherDateTestId,
  update: updated?.[0]?.completed === true,
  cleanup: deleted?.length === 2 && deleted.some((row) => row.id === testId) && deleted.some((row) => row.id === otherDateTestId),
};

if (Object.values(checks).some((passed) => !passed)) {
  throw new Error(`Neon todo CRUD smoke test failed: ${JSON.stringify(checks)}`);
}

console.log("Neon date-scoped CRUD OK; both smoke-test rows were deleted.");
