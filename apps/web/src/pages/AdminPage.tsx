import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  useBoards, useCreateBoard, useDeleteBoard,
  useColumns, useCreateColumn, useUpdateColumn, useDeleteColumn 
} from '../hooks/useAdmin';
import { 
  Plus, Trash2, Edit2, Check, X, LayoutDashboard, Loader2 
} from 'lucide-react';

export default function AdminPage() {
  const { data: boards, isLoading } = useBoards();
  const createBoard = useCreateBoard();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    createBoard.mutate(data.name, {
      onSuccess: () => reset()
    });
  };

  if (isLoading) return <div className="p-10 text-center">Loading boards...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your boards and column structures</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-blue-600" />
          Create New Board
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
          <input
            {...register('name', { required: true })}
            placeholder="e.g., Engineering Sprint"
            className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button 
            disabled={createBoard.isPending}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {createBoard.isPending ? <Loader2 className="animate-spin h-4 w-4"/> : <Plus className="h-4 w-4"/>}
            Create Board
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {boards?.map((board: any) => (
          <BoardCard key={board.id} board={board} />
        ))}
        {boards?.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            No boards found. Create one above!
          </div>
        )}
      </div>
    </div>
  );
}

function BoardCard({ board }: { board: any }) {
  const { data: columns, isLoading } = useColumns(board.id);
  const deleteBoard = useDeleteBoard();
  const createColumn = useCreateColumn();
  const { register, handleSubmit, reset } = useForm();

  const onAddColumn = (data: any) => {
    createColumn.mutate({ boardId: board.id, name: data.name }, {
      onSuccess: () => reset()
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-800 text-lg">{board.name}</h3>
        <button 
          onClick={() => {
            if(confirm('Delete this board? All tasks will be lost.')) deleteBoard.mutate(board.id);
          }}
          className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
          title="Delete Board"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 flex-1 space-y-3">
        {isLoading ? (
          <div className="text-sm text-gray-400">Loading columns...</div>
        ) : columns?.length === 0 ? (
          <div className="text-sm text-gray-400 italic">No columns yet.</div>
        ) : (
          columns?.map((col: any) => <ColumnItem key={col.id} column={col} />)
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <form onSubmit={handleSubmit(onAddColumn)} className="flex gap-2">
          <input 
            {...register('name', { required: true })}
            placeholder="New Column Name"
            className="flex-1 text-sm p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <button 
            disabled={createColumn.isPending}
            className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
          >
            {createColumn.isPending ? <Loader2 className="animate-spin h-4 w-4"/> : <Plus className="h-4 w-4"/>}
          </button>
        </form>
      </div>
    </div>
  );
}

function ColumnItem({ column }: { column: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(column.name);
  
  const updateColumn = useUpdateColumn();
  const deleteColumn = useDeleteColumn();

  const handleSave = () => {
    if (!editName.trim()) return;
    updateColumn.mutate({ id: column.id, name: editName }, {
      onSuccess: () => setIsEditing(false)
    });
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
        <input 
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="flex-1 text-sm bg-transparent outline-none font-medium text-blue-900"
          autoFocus
        />
        <button onClick={handleSave} className="text-green-600 hover:bg-green-100 p-1 rounded">
          <Check className="h-4 w-4" />
        </button>
        <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:bg-gray-200 p-1 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group transition-colors border border-transparent hover:border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
        <span className="text-sm font-medium text-gray-700">{column.name}</span>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => {
            setEditName(column.name);
            setIsEditing(true);
          }}
          className="text-gray-400 hover:text-blue-600 p-1 rounded"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button 
          onClick={() => deleteColumn.mutate(column.id)}
          className="text-gray-400 hover:text-red-600 p-1 rounded"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}