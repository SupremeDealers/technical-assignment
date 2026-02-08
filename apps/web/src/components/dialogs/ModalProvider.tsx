import { useSearchParams } from "react-router-dom";
import { MODAL_COMPONENTS } from "../../store/state/modal.store";
import { useModal } from "../../hooks/useModal";
import CreateBoard from "./components/CreateBoard";
import HandleTask from "./components/HandleTask";
import HandleColumn from "./components/HandleColumn";

const ModalProvider = () => {
  const [searchParams] = useSearchParams();
  const { closeModal } = useModal();

  const modal_name = searchParams.get("modal");

  const handleClose = () => {
    closeModal();
  };

  const renderModal = () => {
    switch (modal_name) {
      case MODAL_COMPONENTS.CREATE_BOARD:
        return <CreateBoard onClose={handleClose} />;
      case MODAL_COMPONENTS.HANDLE_TASK:
        return <HandleTask onClose={handleClose} />;
      case MODAL_COMPONENTS.HANDLE_COLUMN:
        return <HandleColumn onClose={handleClose} />;
      default:
        return null;
    }
  };
  if (!modal_name) {
    return null;
  }
  return <>{renderModal()}</>;
};

export default ModalProvider;
