"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";

import KanbanFactory3D from "@/components/kanban-factory-3d";
import type { todos as todoTable } from "@/lib/db/schema";
import {
  createTodoAction,
  deleteTodoAction,
  moveTodoStatusAction,
  toggleTodoAction,
} from "@/lib/todo-actions";
import { formatDateKey, shiftDateKey, todayDateKey } from "@/lib/date";

type Todo = typeof todoTable.$inferSelect;
type BoardFilter = "all" | "dikerjakan" | "selesai";

export default function TodoDashboard({
  todos,
  selectedDate,
}: {
  todos: Todo[];
  selectedDate: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pulseKey, setPulseKey] = useState(0);
  const [dragOverColumn, setDragOverColumn] = useState<
    "dikerjakan" | "selesai" | null
  >(null);
  const [boardFilter, setBoardFilter] = useState<BoardFilter>("all");

  const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
    todos,
    (
      currentTodos: Todo[],
      action: { type: "move"; id: string; completed: boolean },
    ) =>
      currentTodos.map((item) =>
        item.id === action.id ? { ...item, completed: action.completed } : item,
      ),
  );

  const today = todayDateKey();
  const isToday = selectedDate === today;

  const inProgressTodos = optimisticTodos.filter((todo) => !todo.completed);
  const completedTodos = optimisticTodos.filter((todo) => todo.completed);
  const totalCount = optimisticTodos.length;
  const completedCount = completedTodos.length;
  const inProgressCount = inProgressTodos.length;
  const progress = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  const formattedDate = formatDateKey(selectedDate, { weekday: "long" });

  function handleDrop(targetCompleted: boolean, todoId: string) {
    setDragOverColumn(null);
    if (!todoId) return;

    const existing = optimisticTodos.find((t) => t.id === todoId);
    if (!existing || existing.completed === targetCompleted) return;

    setPulseKey((prev) => prev + 1);
    startTransition(async () => {
      updateOptimisticTodos({
        type: "move",
        id: todoId,
        completed: targetCompleted,
      });
      await moveTodoStatusAction(todoId, targetCompleted);
    });
  }

  return (
    <main className="factory-page">
      {/* SECTION 1: ELECTRIC BLUE HERO & 3D FACTORY DECK */}
      <section className="poster-section poster-blue">
        <div className="floating-steam steam-left" aria-hidden="true">
          <Image
            alt=""
            height={84}
            src="/assets/steam-cloud.svg"
            width={145}
          />
        </div>
        <div className="floating-steam steam-right" aria-hidden="true">
          <Image
            alt=""
            height={74}
            src="/assets/steam-cloud.svg"
            width={128}
          />
        </div>

        <div className="page-container hero-factory-grid">
          <div className="hero-factory-copy">
            <div className="sticker-tag-row">
              <span className="sticker-badge sticker-pink">
                MODE TANGGAL AKTIF
              </span>
            </div>

            <div className="poster-title-box">
              <h1>PABRIK TUGAS HARIAN</h1>
            </div>

            <p className="poster-subtitle">
              {isToday
                ? "Fokus hari ini! Masukkan tugas ke jalur produksi, kerjakan satu per satu, lalu pindahkan ke kubah Selesai."
                : `Merencanakan daftar tugas untuk ${formattedDate}. Setiap tanggal punya papan Kanbannya sendiri!`}
            </p>

            {/* DATE CONTROL DECK */}
            <div className="date-control-deck" aria-label="Navigasi tanggal">
              <div className="date-deck-top">
                <span className="deck-label">TANGGAL PRODUKSI:</span>
                {!isToday && (
                  <Link className="today-jump-btn" href={`/?date=${today}`}>
                    ↺ KEMBALI KE HARI INI
                  </Link>
                )}
              </div>

              <div className="date-controls">
                <Link
                  aria-label="Tanggal sebelumnya"
                  className="arcade-icon-btn"
                  href={`/?date=${shiftDateKey(selectedDate, -1)}`}
                >
                  ◀
                </Link>

                <div className="date-chip">
                  <span className="date-dot" />
                  <span>{formattedDate}</span>
                </div>

                <Link
                  aria-label="Tanggal berikutnya"
                  className="arcade-icon-btn"
                  href={`/?date=${shiftDateKey(selectedDate, 1)}`}
                >
                  ▶
                </Link>

                <form action="/" className="date-picker" method="get">
                  <label className="sr-only" htmlFor="todo-date">
                    Pilih tanggal todo
                  </label>
                  <input
                    aria-label="Pilih tanggal todo"
                    id="todo-date"
                    name="date"
                    onChange={(event) => {
                      const nextDate = event.currentTarget.value;
                      if (nextDate) {
                        router.push(`/?date=${nextDate}`);
                      }
                    }}
                    type="date"
                    value={selectedDate}
                  />
                  <button
                    aria-label="Buka tanggal"
                    className="date-submit"
                    type="submit"
                  >
                    GO
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="hero-factory-stage">
            <KanbanFactory3D
              completedCount={completedCount}
              inProgressCount={inProgressCount}
              pulseKey={pulseKey}
              selectedDateLabel={formatDateKey(selectedDate)}
            />
          </div>
        </div>
      </section>

      {/* CONVEYOR BELT BANNER DIVIDER */}
      <div className="conveyor-strip" aria-hidden="true">
        <div className="conveyor-strip-inner">
          <span className="conveyor-arrow">▶ ▶ ▶</span>
          <div className="conveyor-center-pill">
            MESIN INPUT &amp; MONITOR PROGRES
          </div>
          <span className="conveyor-arrow">◀ ◀ ◀</span>
        </div>
      </div>

      {/* SECTION 2: BRIGHT YELLOW INPUT MACHINE & PROGRESS MONITOR */}
      <section className="poster-section poster-yellow">
        <div className="page-container yellow-deck-grid">
          {/* Mascot eyes + Progress Screen */}
          <div className="monitor-card">
            <div className="monitor-header">
              <div className="mascot-eyes-wrap" aria-hidden="true">
                <Image
                  alt=""
                  className="mascot-eyes-img"
                  height={48}
                  src="/assets/eyes-mascot.svg"
                  width={78}
                />
              </div>
              <div>
                <span className="eyebrow">STATUS MESIN TANGGAL INI</span>
                <strong>
                  {completedCount} / {totalCount} TUGAS SELESAI
                </strong>
              </div>
              <span className="progress-pct-badge">{progress}%</span>
            </div>

            <div
              aria-label={`${progress}% selesai`}
              className="progress-track"
            >
              <span style={{ width: `${progress}%` }} />
            </div>

            <div className="monitor-stats-row">
              <div className="stat-capsule stat-working">
                <span className="stat-label">DIKERJAKAN</span>
                <strong>{inProgressCount}</strong>
              </div>
              <div className="stat-capsule stat-done">
                <span className="stat-label">SELESAI</span>
                <strong>{completedCount}</strong>
              </div>
            </div>
          </div>

          {/* Add Task Console */}
          <div className="input-console-card">
            <div className="console-top-bar">
              <span className="console-dot dot-red" />
              <span className="console-dot dot-yellow" />
              <span className="console-dot dot-green" />
              <span className="console-title">
                TERMINAL TAMBAH TUGAS ({formatDateKey(selectedDate)})
              </span>
            </div>

            <form
              action={async (formData) => {
                setPulseKey((prev) => prev + 1);
                await createTodoAction(formData);
              }}
              className="add-form-brutal"
            >
              <input name="scheduledDate" type="hidden" value={selectedDate} />

              <label className="sr-only" htmlFor="todo-title">
                Tugas baru
              </label>
              <input
                autoComplete="off"
                className="brutal-text-input"
                id="todo-title"
                maxLength={200}
                name="title"
                placeholder="Ketik misi atau tugas baru untuk tanggal ini..."
                required
              />

              <div className="add-form-controls">
                <label className="sr-only" htmlFor="todo-status">
                  Status awal
                </label>
                <select
                  aria-label="Status awal tugas"
                  className="brutal-select"
                  defaultValue="dikerjakan"
                  id="todo-status"
                  name="status"
                >
                  <option value="dikerjakan">⚙ Masuk: DIKERJAKAN</option>
                  <option value="selesai">★ Masuk: SELESAI</option>
                </select>

                <button
                  className="button button-arcade-red add-button"
                  type="submit"
                >
                  <span aria-hidden="true">＋</span> MASUKKAN TUGAS
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* CONVEYOR BELT BANNER DIVIDER */}
      <div className="conveyor-strip conveyor-strip-pink" aria-hidden="true">
        <div className="conveyor-strip-inner">
          <span className="conveyor-arrow">▶ ▶ ▶</span>
          <div className="conveyor-center-pill">
            PAPAN KANBAN: DIKERJAKAN &amp; SELESAI
          </div>
          <span className="conveyor-arrow">◀ ◀ ◀</span>
        </div>
      </div>

      {/* SECTION 3: KANBAN BOARD (PINK & GREEN POSTER ZONES) */}
      <section className="poster-section poster-kanban-zone">
        <div className="page-container">
          <div className="kanban-toolbar">
            <div className="kanban-toolbar-title">
              <span className="eyebrow">KANBAN WORKFLOW</span>
              <h2>Geser kartu atau klik tombol status</h2>
            </div>

            <div
              aria-label="Filter tampilan kolom Kanban"
              className="kanban-filter-tabs"
              role="tablist"
            >
              <button
                aria-selected={boardFilter === "all"}
                className={`filter-tab ${boardFilter === "all" ? "is-active" : ""}`}
                onClick={() => setBoardFilter("all")}
                role="tab"
                type="button"
              >
                SEMUA ({totalCount})
              </button>
              <button
                aria-selected={boardFilter === "dikerjakan"}
                className={`filter-tab ${boardFilter === "dikerjakan" ? "is-active" : ""}`}
                onClick={() => setBoardFilter("dikerjakan")}
                role="tab"
                type="button"
              >
                ⚙ DIKERJAKAN ({inProgressCount})
              </button>
              <button
                aria-selected={boardFilter === "selesai"}
                className={`filter-tab ${boardFilter === "selesai" ? "is-active" : ""}`}
                onClick={() => setBoardFilter("selesai")}
                role="tab"
                type="button"
              >
                ✓ SELESAI ({completedCount})
              </button>
            </div>
          </div>

          <div
            className={`kanban-grid ${boardFilter !== "all" ? "kanban-single-col" : ""}`}
          >
            {/* COLUMN 1: DIKERJAKAN */}
            {(boardFilter === "all" || boardFilter === "dikerjakan") && (
              <section
                aria-label="Kolom Dikerjakan"
                className={`kanban-column kanban-col-working ${
                  dragOverColumn === "dikerjakan" ? "is-drag-over" : ""
                }`}
                onDragLeave={() => setDragOverColumn(null)}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverColumn("dikerjakan");
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const todoId = event.dataTransfer.getData("text/plain");
                  handleDrop(false, todoId);
                }}
              >
                <header className="kanban-col-header">
                  <div className="kanban-col-title-wrap">
                    <Image
                      alt=""
                      height={44}
                      src="/assets/arcade-button.svg"
                      width={56}
                    />
                    <div>
                      <span className="col-tag">STATUS 01</span>
                      <h3>DIKERJAKAN</h3>
                    </div>
                  </div>
                  <span className="col-count-badge">{inProgressCount}</span>
                </header>

                {inProgressTodos.length === 0 ? (
                  <div className="kanban-empty">
                    <Image
                      alt=""
                      className="empty-mascot"
                      height={46}
                      src="/assets/eyes-mascot.svg"
                      width={74}
                    />
                    <h4>Tidak ada tugas yang sedang dikerjakan</h4>
                    <p>
                      Tambahkan tugas baru di atas atau geser kartu dari kolom
                      Selesai ke sini.
                    </p>
                  </div>
                ) : (
                  <ul className="kanban-card-list">
                    {inProgressTodos.map((todo, idx) => (
                      <li
                        className="kanban-card card-working"
                        draggable
                        key={todo.id}
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", todo.id);
                          event.dataTransfer.effectAllowed = "move";
                        }}
                      >
                        <div className="kanban-card-top">
                          <span className="card-index-pill">
                            #{String(idx + 1).padStart(2, "0")} · DIKERJAKAN
                          </span>
                          <form action={deleteTodoAction}>
                            <input name="todoId" type="hidden" value={todo.id} />
                            <button
                              aria-label={`Hapus ${todo.title}`}
                              className="delete-button"
                              type="submit"
                            >
                              ×
                            </button>
                          </form>
                        </div>

                        <p className="todo-title">{todo.title}</p>

                        <div className="kanban-card-footer">
                          <form
                            action={async (formData) => {
                              setPulseKey((prev) => prev + 1);
                              await toggleTodoAction(formData);
                            }}
                            className="move-form"
                          >
                            <input name="todoId" type="hidden" value={todo.id} />
                            <input name="completed" type="hidden" value="true" />
                            <button
                              aria-label={`Pindahkan ${todo.title} ke Selesai`}
                              className="move-status-btn move-to-done"
                              disabled={isPending}
                              type="submit"
                            >
                              SELESAIKAN ✓ →
                            </button>
                          </form>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* COLUMN 2: SELESAI */}
            {(boardFilter === "all" || boardFilter === "selesai") && (
              <section
                aria-label="Kolom Selesai"
                className={`kanban-column kanban-col-done ${
                  dragOverColumn === "selesai" ? "is-drag-over" : ""
                }`}
                onDragLeave={() => setDragOverColumn(null)}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverColumn("selesai");
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const todoId = event.dataTransfer.getData("text/plain");
                  handleDrop(true, todoId);
                }}
              >
                <header className="kanban-col-header">
                  <div className="kanban-col-title-wrap">
                    <Image
                      alt=""
                      height={48}
                      src="/assets/capsule-tube.svg"
                      width={38}
                    />
                    <div>
                      <span className="col-tag">STATUS 02</span>
                      <h3>SELESAI</h3>
                    </div>
                  </div>
                  <span className="col-count-badge badge-done">
                    {completedCount}
                  </span>
                </header>

                {completedTodos.length === 0 ? (
                  <div className="kanban-empty">
                    <Image
                      alt=""
                      height={64}
                      src="/assets/capsule-tube.svg"
                      width={48}
                    />
                    <h4>Kubah Selesai masih kosong</h4>
                    <p>
                      Klik tombol <strong>SELESAIKAN ✓ →</strong> atau tarik
                      kartu ke kolom ini setelah tugas beres!
                    </p>
                  </div>
                ) : (
                  <ul className="kanban-card-list">
                    {completedTodos.map((todo, idx) => (
                      <li
                        className="kanban-card card-done is-done"
                        draggable
                        key={todo.id}
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", todo.id);
                          event.dataTransfer.effectAllowed = "move";
                        }}
                      >
                        <div className="kanban-card-top">
                          <span className="card-index-pill pill-done">
                            ✓ #{String(idx + 1).padStart(2, "0")} · SELESAI
                          </span>
                          <form action={deleteTodoAction}>
                            <input name="todoId" type="hidden" value={todo.id} />
                            <button
                              aria-label={`Hapus ${todo.title}`}
                              className="delete-button"
                              type="submit"
                            >
                              ×
                            </button>
                          </form>
                        </div>

                        <p className="todo-title">{todo.title}</p>

                        <div className="kanban-card-footer">
                          <form
                            action={async (formData) => {
                              setPulseKey((prev) => prev + 1);
                              await toggleTodoAction(formData);
                            }}
                            className="move-form"
                          >
                            <input name="todoId" type="hidden" value={todo.id} />
                            <input
                              name="completed"
                              type="hidden"
                              value="false"
                            />
                            <button
                              aria-label={`Kembalikan ${todo.title} ke Dikerjakan`}
                              className="move-status-btn move-to-working"
                              disabled={isPending}
                              type="submit"
                            >
                              ← KEMBALI DIKERJAKAN
                            </button>
                          </form>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>

          <p className="panel-footnote">created by K1NGSIR</p>
        </div>
      </section>
    </main>
  );
}
