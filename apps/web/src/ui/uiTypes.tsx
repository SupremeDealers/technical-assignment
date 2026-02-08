export type ColumnProps = {
  column: {
    id: string;
    title: string;
  };
  search: string;
}

export type TaskCardProps = {
  task: {
    id: string;
    title: string;
    _count?: {
      comments: number;
    };
  };
  onClick: () => void;
}

export type TaskModalProps = {
  task: {
    id: string;
    title: string;
    columnId: string;
  };
  onClose: () => void;
}

export type ColumnProp = {
  column: {
    id: string;
    title: string;
  };
  search: string;
  onAddTask: () => void;
}