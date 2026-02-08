/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum MODAL_COMPONENTS {
  CREATE_BOARD = "create-board",
  HANDLE_TASK = "handle-task",
  HANDLE_COLUMN = "handle-column",
}

export interface ModalState {
  props?: Record<string, any>;
}

interface ModalStore extends ModalState {
  openModal: (modal: Partial<ModalState>) => void;
  closeModal: () => void;
  setModalProps: (props: Record<string, any>) => void;
  resetModal: () => void;
}

const initialState: ModalState = {
  props: {},
};

export const useModalStore = create<ModalStore>()(
  persist(
    (set) => ({
      ...initialState,
      openModal: (modal) =>
        set((state) => ({
          ...state,
          ...modal,
          is_open: true,
        })),
      closeModal: () =>
        set((state) => ({
          ...state,
          is_open: false,
          is_fullscreen_open: false,
          component_name: null,
          modal_function: "",
        })),
      setModalProps: (props) =>
        set((state) => ({
          ...state,
          props: { ...state.props, ...props },
        })),
      resetModal: () => set(() => ({ ...initialState })),
    }),
    {
      name: "modal-storage",
    },
  ),
);
