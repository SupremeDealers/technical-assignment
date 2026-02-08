import React from 'react';
import { useCreateTask } from '../../hooks/useTasks';
import { useCreateTaskModal } from '../../hooks/useCreateTaskModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';

export const CreateTaskModal = () => {
  const isOpen = useCreateTaskModal((s) => s.open);
  const columnId = useCreateTaskModal((s) => s.columnId);
  const onClose = useCreateTaskModal((s) => s.onClose);

  const createTask = useCreateTask();

  const submitError =
    (createTask.error as any)?.response?.data?.error?.message ??
    (createTask.error as any)?.message;

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  React.useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
    }
  }, [isOpen]);

  const canSubmit = title.trim().length > 0 && typeof columnId === 'number';

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    createTask.mutate(
      { columnId: columnId!, data: { title: title.trim(), description: description.trim() || undefined, priority } },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>Add a new task to this column.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              placeholder="e.g. Fix login bug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              rows={3}
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>

          {submitError ? (
            <div role="alert" aria-live="polite" className="text-sm text-red-600">
              {submitError}
            </div>
          ) : null}

          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm"
              disabled={createTask.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || createTask.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {createTask.isPending ? 'Creating…' : 'Create'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};