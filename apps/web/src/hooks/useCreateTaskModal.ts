import { create } from 'zustand';

type CreateTaskModalState = {
  open: boolean;
  columnId: number | null;
  onOpen: (columnId: number) => void;
  onClose: () => void;
};

export const useCreateTaskModal = create<CreateTaskModalState>((set) => ({
  open: false,
  columnId: null,
  onOpen: (columnId) => set({ open: true, columnId }),
  onClose: () => set({ open: false, columnId: null }),
}));

export const useCreateTaskModalActions = () => {
  const onOpen = useCreateTaskModal((s) => s.onOpen);
  const onClose = useCreateTaskModal((s) => s.onClose);
  return { onOpen, onClose };
};