"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { deleteTaskAction, toggleTaskAction, updateTaskAction } from "@/app/actions";
import {
  formatDateTimeLabel,
  getDueState,
  getStatusLabel,
  getTaskKindLabel,
  toDateTimeInputValue,
  type TaskRecord,
} from "@/lib/taskflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function priorityVariant(priority: TaskRecord["priority"]) {
  if (priority === "high") return "destructive" as const;
  if (priority === "medium") return "outline" as const;
  return "secondary" as const;
}

export default function TaskCard({ task }: { task: TaskRecord }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [pending, startTransition] = useTransition();

  const dueState = getDueState(task);

  function refreshView() {
    router.refresh();
  }

  function handleDelete() {
    setError("");

    startTransition(async () => {
      const result = await deleteTaskAction(task.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      refreshView();
    });
  }

  function handleToggle() {
    setError("");

    startTransition(async () => {
      const result = await toggleTaskAction(task.id, task.is_completed);
      if (result?.error) {
        setError(result.error);
        return;
      }
      refreshView();
    });
  }

  function handleUpdate(formData: FormData) {
    setError("");

    startTransition(async () => {
      const result = await updateTaskAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpenEdit(false);
      refreshView();
    });
  }

  return (
    <Card className={task.is_completed ? "opacity-70" : undefined}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--muted)]">
              {getTaskKindLabel(task.task_type)}
            </p>
            <CardTitle className="text-xl font-bold">{task.title}</CardTitle>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Aksi task">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setOpenEdit(true)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-[color:var(--danger)]">
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-[color:var(--muted)]">
          {task.description?.trim() || "Belum ada catatan tambahan untuk task ini."}
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge variant={priorityVariant(task.priority)}>{task.priority}</Badge>
          <Badge variant="secondary">{getStatusLabel(task.status)}</Badge>
          {dueState ? <Badge variant="outline">{dueState.label}</Badge> : null}
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--muted)]">Tanggal</p>
            <p className="mt-1 font-medium">{formatDateTimeLabel(task.due_date)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--muted)]">Reminder</p>
            <p className="mt-1 font-medium">
              {task.reminder_days === null ? "Tanpa reminder" : `${task.reminder_days} hari`}
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-[color:var(--card-border)] bg-[color:var(--accent-soft)] px-3 py-2 text-sm">
            {error}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={handleToggle} disabled={pending} className="flex-1">
          {pending ? "Memproses..." : task.is_completed ? "Buka lagi" : "Tandai selesai"}
        </Button>
        <Button variant="secondary" onClick={() => setOpenEdit(true)} disabled={pending} className="flex-1">
          Edit
        </Button>
      </CardFooter>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
            <DialogDescription>Rapikan detail task supaya tetap relevan.</DialogDescription>
          </DialogHeader>

          <form action={handleUpdate} className="space-y-4">
            <input type="hidden" name="id" value={task.id} />

            <div className="space-y-2">
              <Label htmlFor={`title-${task.id}`}>Judul</Label>
              <Input id={`title-${task.id}`} name="title" defaultValue={task.title} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`description-${task.id}`}>Deskripsi</Label>
              <Textarea
                id={`description-${task.id}`}
                name="description"
                defaultValue={task.description ?? ""}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Jenis task</Label>
                <Select name="task_type" defaultValue={task.task_type}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Select name="priority" defaultValue={task.priority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={task.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To do</SelectItem>
                    <SelectItem value="progress">In progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`reminder-${task.id}`}>Reminder</Label>
                <Input
                  id={`reminder-${task.id}`}
                  name="reminder_days"
                  type="number"
                  min="0"
                  defaultValue={task.reminder_days ?? ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`due-date-${task.id}`}>Tanggal dan jam</Label>
              <Input
                id={`due-date-${task.id}`}
                name="due_date"
                type="datetime-local"
                defaultValue={toDateTimeInputValue(task.due_date)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpenEdit(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Menyimpan..." : "Simpan perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
