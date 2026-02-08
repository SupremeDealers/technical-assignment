import { useNavigate, useSearchParams } from "react-router-dom";
import { useModalStore } from "../store/state/modal.store";

export const useModal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const openModal = useModalStore((state) => state.openModal);
  const closeModalStore = useModalStore((state) => state.closeModal);

  const open = ({
    modal_name,
    props,
    ref,
  }: {
    modal_name: string;
    ref?: string | Record<string, any>;
    props?: Record<string, any>;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", modal_name);
    if (ref) {
      if (typeof ref === "string") {
        params.set("ref", ref);
      } else if (typeof ref === "object" && ref !== null) {
        Object.entries(ref).forEach(([key, value]) => {
          if (typeof value === "string" || typeof value === "number") {
            params.set(key, String(value));
          }
        });
      }
    }
    navigate(`?${params.toString()}`, { replace: true });
    openModal({
      props,
    });
  };

  const close = () => {
    // Remove all search parameters
    navigate("?", { replace: true });
    closeModalStore();
  };

  return {
    openModal: open,
    closeModal: close,
  };
};
