"use client";

import { useEffect, useEffectEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markTaskInProgressAction } from "@/app/actions";

type DeepWorkTask = {
  id: string;
  title: string;
  status: string;
  is_completed: boolean;
};

type DeepWorkModalProps = {
  tasks: DeepWorkTask[];
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function DeepWorkModal({ tasks }: DeepWorkModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"setup" | "running" | "finished">("setup");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [preset, setPreset] = useState<"30" | "60" | "90" | "custom">("30");
  const [customMinutes, setCustomMinutes] = useState("45");
  const [remainingSeconds, setRemainingSeconds] = useState(30 * 60);
  const [isPaused, setIsPaused] = useState(false);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  function closeAll() {
    setOpen(false);
    setMode("setup");
    setSelectedTaskId("");
    setPreset("30");
    setCustomMinutes("45");
    setRemainingSeconds(30 * 60);
    setIsPaused(false);
  }

  function getSelectedMinutes() {
    if (preset === "custom") {
      const parsed = Number(customMinutes);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 45;
    }

    return Number(preset);
  }

  function playDoneSound() {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.value = 720;
      gain.gain.value = 0.035;

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      window.setTimeout(() => {
        osc.frequency.value = 540;
      }, 160);

      window.setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 340);
    } catch {}
  }

  const finishSession = useEffectEvent(() => {
    setMode("finished");
    setIsPaused(false);
    playDoneSound();

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([160, 100, 200]);
    }
  });

  function startSession() {
    const seconds = getSelectedMinutes() * 60;
    setRemainingSeconds(seconds);
    setMode("running");
    setIsPaused(false);

    if (!selectedTaskId || !selectedTask || selectedTask.is_completed) {
      return;
    }

    if (selectedTask.status === "progress" || selectedTask.status === "done") {
      return;
    }

    startTransition(async () => {
      await markTaskInProgressAction(selectedTaskId);
      router.refresh();
    });
  }

  function restartSameSession() {
    setRemainingSeconds(getSelectedMinutes() * 60);
    setMode("running");
    setIsPaused(false);
  }

  useEffect(() => {
    if (!open || mode !== "running" || isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          finishSession();
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open, mode, isPaused]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary">
        Mulai focus
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-8 backdrop-blur-md">
          {mode === "setup" ? (
            <div className="form-card surface-strong w-full max-w-3xl p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="hero-label">Focus mode</p>
                  <h2 className="mt-3 text-4xl font-black">Deep work session</h2>
                  <p className="section-copy">
                    Pilih task utama lalu tentukan durasi fokus tanpa distraksi.
                  </p>
                </div>

                <button type="button" onClick={closeAll} className="btn-secondary">
                  Tutup
                </button>
              </div>

              <div className="inline-form mt-8">
                <div className="field">
                  <label htmlFor="focus-task">Task yang ingin dikerjakan</label>
                  <select
                    id="focus-task"
                    value={selectedTaskId}
                    onChange={(event) => setSelectedTaskId(event.target.value)}
                    className="field-select"
                  >
                    <option value="">Session tanpa task spesifik</option>
                    {tasks
                      .filter((task) => !task.is_completed)
                      .map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.title}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="field">
                  <label>Durasi session</label>
                  <div className="grid gap-3 md:grid-cols-4">
                    {[
                      { label: "30 menit", value: "30" },
                      { label: "60 menit", value: "60" },
                      { label: "90 menit", value: "90" },
                      { label: "Custom", value: "custom" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setPreset(item.value as "30" | "60" | "90" | "custom")
                        }
                        className={preset === item.value ? "theme-pill is-active" : "theme-pill"}
                      >
                        <span>{item.label}</span>
                        <small>Fokus penuh tanpa pindah konteks</small>
                      </button>
                    ))}
                  </div>
                </div>

                {preset === "custom" ? (
                  <div className="field">
                    <label htmlFor="custom-minutes">Custom menit</label>
                    <input
                      id="custom-minutes"
                      type="number"
                      min="1"
                      value={customMinutes}
                      onChange={(event) => setCustomMinutes(event.target.value)}
                      className="field-input"
                    />
                  </div>
                ) : null}

                <div className="section-card surface">
                  <p className="hero-label">Ringkasan</p>
                  <h3 className="mt-3 text-3xl font-black">{getSelectedMinutes()} menit</h3>
                  <p className="section-copy">
                    {selectedTask ? selectedTask.title : "Tanpa task spesifik, cocok untuk catch up."}
                  </p>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <button type="button" onClick={closeAll} className="btn-secondary">
                    Batal
                  </button>
                  <button type="button" onClick={startSession} className="btn-primary">
                    {pending ? "Menyiapkan..." : "Mulai session"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {mode === "running" ? (
            <div className="surface-strong w-full max-w-4xl rounded-[38px] p-8 text-center md:p-12">
              <p className="hero-label">Deep work running</p>
              <h2 className="mt-6 text-[clamp(4rem,12vw,8rem)] font-black leading-none">
                {formatTime(remainingSeconds)}
              </h2>
              <p className="section-copy mt-4">
                {selectedTask ? selectedTask.title : "Session fokus umum"}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaused((current) => !current)}
                  className="btn-secondary"
                >
                  {isPaused ? "Lanjutkan" : "Jeda"}
                </button>
                <button type="button" onClick={restartSameSession} className="btn-secondary">
                  Ulangi
                </button>
                <button type="button" onClick={closeAll} className="btn-primary">
                  Stop session
                </button>
              </div>

              <p className="section-copy mt-5">
                {isPaused
                  ? "Timer dijeda. Ambil ruang sebentar lalu lanjut lagi."
                  : "Pertahankan satu konteks kerja sampai timer habis."}
              </p>
            </div>
          ) : null}

          {mode === "finished" ? (
            <div className="surface-strong w-full max-w-2xl rounded-[36px] p-8 text-center">
              <p className="hero-label">Session selesai</p>
              <h2 className="mt-4 text-5xl font-black">Kerja yang rapi.</h2>
              <p className="section-copy mt-4">
                {selectedTask
                  ? `Session untuk ${selectedTask.title} selesai.`
                  : "Session fokus kamu selesai."}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={restartSameSession} className="btn-secondary">
                  Ulangi lagi
                </button>
                <button type="button" onClick={closeAll} className="btn-primary">
                  Tutup
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
