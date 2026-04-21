"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTaskAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AddTaskModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function closeModal() {
    setOpen(false);
    setError("");
  }

  function handleSubmit(formData: FormData) {
    setError("");

    startTransition(async () => {
      const result = await createTaskAction(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      closeModal();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tambah task</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah agenda baru</DialogTitle>
          <DialogDescription>
            Simpan task, project, event, atau reminder dalam satu tempat.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Judul</Label>
            <Input
              id="task-title"
              name="title"
              type="text"
              required
              placeholder="Contoh: Review desain atau booking makan malam"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Deskripsi</Label>
            <Textarea
              id="task-description"
              name="description"
              placeholder="Tambahkan catatan singkat biar jelas saat dibuka lagi."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Jenis task</Label>
              <Select name="task_type" defaultValue="task">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioritas</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-due-date">Tanggal dan jam</Label>
              <Input id="task-due-date" name="due_date" type="datetime-local" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-reminder">Reminder sebelum deadline</Label>
              <Input
                id="task-reminder"
                name="reminder_days"
                type="number"
                min="0"
                placeholder="Misal 1 atau 2"
              />
            </div>
          </div>

          <input type="hidden" name="status" value="todo" />

          {error ? (
            <div className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--accent-soft)] px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Simpan task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
