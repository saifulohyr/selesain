import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { connection } from "next/server";
import { Suspense } from "react";

import AuthControls from "@/components/auth-controls";
import KanbanFactory3D from "@/components/kanban-factory-3d";
import TodoDashboard from "@/components/todo-dashboard";
import { listTodos } from "@/lib/db/todos";
import { formatDateKey, isValidDateKey, todayDateKey } from "@/lib/date";

type HomeProps = {
  searchParams: Promise<{ date?: string | string[] }>;
};

function PageLoading() {
  return (
    <main className="page-container">
      <div className="loading-card" aria-label="Memuat daftar tugas" />
    </main>
  );
}

async function HomeContent({ searchParams }: HomeProps) {
  await connection();
  const params = await searchParams;
  const requestedDate = Array.isArray(params.date)
    ? params.date[0]
    : params.date;
  const selectedDate =
    requestedDate && isValidDateKey(requestedDate)
      ? requestedDate
      : todayDateKey();
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="factory-page">
        {/* SECTION 1: ELECTRIC BLUE HERO POSTER */}
        <section className="poster-section poster-blue">
          <div className="floating-steam steam-left" aria-hidden="true">
            <Image
              alt=""
              height={88}
              src="/assets/steam-cloud.svg"
              width={152}
            />
          </div>
          <div className="floating-steam steam-right" aria-hidden="true">
            <Image
              alt=""
              height={76}
              src="/assets/steam-cloud.svg"
              width={132}
            />
          </div>

          <div className="page-container hero-factory-grid">
            <div className="hero-factory-copy">
              <div className="sticker-tag-row">
                <span className="sticker-badge sticker-pink">
                  KANBAN 3D EDITION
                </span>
              </div>

              <div className="poster-title-box">
                <h1>PABRIK KANBAN HARIAN</h1>
              </div>

              <p className="poster-subtitle">
                Satu hal demi satu hal, selesai! Kelola tugas per tanggal dengan
                papan Kanban dua status: <strong>DIKERJAKAN</strong> &amp;{" "}
                <strong>SELESAI</strong>.
              </p>

              <div className="landing-actions">
                <AuthControls ctaOnly />
              </div>
            </div>

            <div className="hero-factory-stage">
              <KanbanFactory3D
                completedCount={2}
                inProgressCount={3}
                selectedDateLabel={formatDateKey(selectedDate)}
              />
            </div>
          </div>
        </section>

        {/* CONVEYOR BELT DIVIDER */}
        <div className="conveyor-strip" aria-hidden="true">
          <div className="conveyor-strip-inner">
            <span className="conveyor-arrow">▶ ▶ ▶</span>
            <div className="conveyor-center-pill">
              CARA KERJA MESIN KANBAN
            </div>
            <span className="conveyor-arrow">◀ ◀ ◀</span>
          </div>
        </div>

        {/* SECTION 2: YELLOW ARCADE SCREEN */}
        <section className="poster-section poster-yellow">
          <div className="page-container landing-screen-wrap">
            <div className="mascot-floating-left" aria-hidden="true">
              <Image
                alt=""
                className="mascot-eyes-img"
                height={70}
                src="/assets/eyes-mascot.svg"
                width={114}
              />
            </div>

            <div className="arcade-screen-box">
              <div className="arcade-screen-topbar">
                <span>MASTER-TODO MONITOR</span>
                <span>MODE: PER TANGGAL</span>
              </div>
              <div className="arcade-screen-body">
                <h2>Beda Tanggal, Beda Papan Kanban!</h2>
                <p>
                  Setiap hari punya daftar fokusnya sendiri. Pilih tanggal mana
                  pun, masukkan tugas ke kolom <strong>DIKERJAKAN</strong>, lalu
                  geser atau tekan tombol arkade untuk memindahkannya ke kubah{" "}
                  <strong>SELESAI</strong>.
                </p>
                <div className="sample-kanban-mini">
                  <div className="sample-col sample-col-working">
                    <span className="sample-col-badge">⚙ DIKERJAKAN</span>
                    <div className="sample-card">
                      Selesaikan satu hal penting
                    </div>
                    <div className="sample-card">
                      Review jadwal esok hari
                    </div>
                  </div>
                  <div className="sample-col sample-col-done">
                    <span className="sample-col-badge badge-green">
                      ✓ SELESAI
                    </span>
                    <div className="sample-card is-done-sample">
                      ✓ Rapikan meja kerja
                    </div>
                  </div>
                </div>
              </div>
              <div className="arcade-screen-deck">
                <div className="deck-arrows" aria-hidden="true">
                  <span>◀</span>
                  <span>▶</span>
                </div>
                <AuthControls ctaOnly />
              </div>
            </div>
          </div>
        </section>

        {/* CONVEYOR BELT DIVIDER */}
        <div className="conveyor-strip conveyor-strip-pink" aria-hidden="true">
          <div className="conveyor-strip-inner">
            <span className="conveyor-arrow">▶ ▶ ▶</span>
            <div className="conveyor-center-pill">FITUR UTAMA PABRIK</div>
            <span className="conveyor-arrow">◀ ◀ ◀</span>
          </div>
        </div>

        {/* SECTION 3: PINK CAPSULE SHOWCASE */}
        <section className="poster-section poster-pink">
          <div className="page-container capsule-showcase-grid">
            <article className="capsule-feature-card">
              <Image
                alt=""
                height={110}
                src="/assets/capsule-tube.svg"
                width={80}
              />
              <span className="capsule-step-badge">01</span>
              <h3>Pilih Tanggal</h3>
              <p>Beda tanggal beda isi todo, rapi tanpa bercampur.</p>
            </article>

            <article className="capsule-feature-card">
              <Image
                alt=""
                height={90}
                src="/assets/arcade-button.svg"
                width={116}
              />
              <span className="capsule-step-badge">02</span>
              <h3>Kolom Dikerjakan</h3>
              <p>Semua tugas aktif masuk ke jalur fokus utama.</p>
            </article>

            <article className="capsule-feature-card">
              <Image
                alt=""
                height={110}
                src="/assets/capsule-tube.svg"
                width={80}
              />
              <span className="capsule-step-badge">03</span>
              <h3>Kolom Selesai</h3>
              <p>Geser atau klik satu tombol untuk menuntaskan tugas.</p>
            </article>
          </div>
          <p className="panel-footnote">created by K1NGSIR</p>
        </section>
      </main>
    );
  }

  const todos = await listTodos(userId, selectedDate);

  return <TodoDashboard todos={todos} selectedDate={selectedDate} />;
}

export default function Home(props: HomeProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <HomeContent searchParams={props.searchParams} />
    </Suspense>
  );
}
