import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, LayoutGrid } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BoardCardSkeleton } from '@/components/ui/skeleton-loader';
import { EmptyState } from '@/components/ui/empty-state';
import { boardsApi } from '@/services/api';
import type { Board } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const BoardsPage: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [newBoard, setNewBoard] = useState({ name: ''});
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const data = await boardsApi.getAll();
      setBoards(data);
    } catch (error) {
      toast.error('Failed to load boards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoard.name.trim()) {
      toast.error('Please enter a board name');
      return;
    }

    setIsCreating(true);
    try {
      const board = await boardsApi.create({
        name: newBoard.name.trim(),
      });
      setBoards([...boards, board]);
      setNewBoard({ name: '' });
      setIsCreateDialogOpen(false);
      toast.success('Board created successfully');
    } catch (error) {
      toast.error('Failed to create board');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (!boardToDelete) return;

    setIsDeleting(true);
    try {
      await boardsApi.delete(boardToDelete.id);
      setBoards(boards.filter((b) => b.id !== boardToDelete.id));
      setBoardToDelete(null);
      toast.success('Board deleted successfully');
    } catch (error) {
      toast.error('Failed to delete board');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Boards</h1>
            <p className="text-muted-foreground mt-1">Manage your Kanban boards</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Board
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Board</DialogTitle>
                <DialogDescription>
                  Create a new Kanban board to organize your tasks.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Board Title</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Project Alpha"
                    value={newBoard.name}
                    onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                    className="focus-ring"
                  />
                </div>
                
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBoard} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Board'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <BoardCardSkeleton key={i} />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <EmptyState
            icon={<LayoutGrid className="h-8 w-8" />}
            title="No boards yet"
            description="Create your first board to get started organizing your tasks."
            action={
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Board
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <div
                key={board.id}
                className="group relative rounded-lg border bg-card p-5 card-shadow hover:card-shadow-hover transition-all duration-200 fade-scale-in"
              >
                <Link to={`/boards/${board.id}`} className="block">
                  <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {board.name}
                  </h3>
              
                  <p className="text-xs text-muted-foreground">
                    Created {format(new Date(board.createdAt), 'MMM d, yyyy')}
                  </p>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    setBoardToDelete(board);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!boardToDelete} onOpenChange={() => setBoardToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{boardToDelete?.name}"? This action cannot be undone
              and all columns and tasks will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBoard}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BoardsPage;
