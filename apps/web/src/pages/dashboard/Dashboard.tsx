import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/api/client";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, LayoutGrid, Search, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, type FormEvent } from "react";
import { Board } from "@/types";

export function Dashboard() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: boards, isLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const res = await client.get<{ boards: Board[] }>("/boards");
      return res.data.boards;
    },
  });

  const createBoard = useMutation({
    mutationFn: async (name: string) => {
      await client.post("/boards", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      setOpen(false);
      setNewBoardName("");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      createBoard.mutate(newBoardName);
    }
  };

  const filteredBoards = boards?.filter((board) =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading)
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-64 rounded-xl" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50"
            />
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-8 border-b border-stone-200 dark:border-stone-800">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
            My Projects
          </h1>
          <p className="text-stone-500 dark:text-stone-400 font-medium">
            Craft, organize, and ship your best work.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-stone-800 transition-colors" />
            <Input
              placeholder="Find a board..."
              className="pl-11 h-12 bg-white dark:bg-stone-900 border-2 border-stone-100 dark:border-stone-800 rounded-2xl focus-visible:ring-0 focus-visible:border-stone-300 dark:focus-visible:border-stone-700 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white shadow-lg shadow-stone-900/20 transition-all hover:scale-105 active:scale-95">
                <Plus className="mr-2 h-5 w-5" />
                Create Board
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-stone-900">
                  Create New Board
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-stone-600 font-medium">
                    Board Name
                  </Label>
                  <Input
                    id="name"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="e.g. Q4 Marketing Plan"
                    className="h-12 rounded-xl border-2 border-stone-100 focus-visible:border-stone-900 transition-colors"
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-lg font-bold"
                    disabled={createBoard.isPending || !newBoardName.trim()}
                  >
                    {createBoard.isPending ? "Creating..." : "Create Board"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content Grid */}
      {filteredBoards?.length === 0 ? (
        <div className="py-32 text-center rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/20">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 mx-auto bg-white dark:bg-stone-800 rounded-full flex items-center justify-center shadow-sm border border-stone-100 dark:border-stone-700">
              <Sparkles className="w-8 h-8 text-stone-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-xl text-stone-900 dark:text-stone-100">
                {searchQuery
                  ? "No matching boards"
                  : "Start your First Project"}
              </h3>
              <p className="text-stone-500">
                {searchQuery
                  ? `We couldn't find anything matching "${searchQuery}"`
                  : "Create a board to clarify your vision and track progress."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBoards?.map((board, index) => {
            // Color styling based on index/name hook
            const themes = [
              {
                bg: "bg-orange-50",
                text: "text-orange-700",
                border: "border-orange-100",
                icon: "bg-orange-100",
                ring: "text-orange-500",
              },
              {
                bg: "bg-blue-50",
                text: "text-blue-700",
                border: "border-blue-100",
                icon: "bg-blue-100",
                ring: "text-blue-500",
              },
              {
                bg: "bg-emerald-50",
                text: "text-emerald-700",
                border: "border-emerald-100",
                icon: "bg-emerald-100",
                ring: "text-emerald-500",
              },
              {
                bg: "bg-purple-50",
                text: "text-purple-700",
                border: "border-purple-100",
                icon: "bg-purple-100",
                ring: "text-purple-500",
              },
              {
                bg: "bg-pink-50",
                text: "text-pink-700",
                border: "border-pink-100",
                icon: "bg-pink-100",
                ring: "text-pink-500",
              },
              {
                bg: "bg-indigo-50",
                text: "text-indigo-700",
                border: "border-indigo-100",
                icon: "bg-indigo-100",
                ring: "text-indigo-500",
              },
            ];
            const theme = themes[index % themes.length];

            const totalTasks =
              board.columns?.reduce(
                (acc, col) => acc + (col._count?.tasks || 0),
                0,
              ) || 0;
            const totalColumns = board.columns?.length || 0;

            return (
              <Link
                key={board.id}
                to={`/boards/${board.id}`}
                className="group block h-full"
              >
                <Card
                  className={`h-full border-2 ${theme.border} bg-white dark:bg-stone-900 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col`}
                >
                  <CardHeader className="p-0">
                    <div
                      className={`h-32 w-full p-6 relative overflow-hidden ${theme.bg} dark:bg-stone-800/50 flex flex-col justify-between`}
                    >
                      <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                        <LayoutGrid className="w-48 h-48" />
                      </div>

                      <div className="flex justify-between items-start relative z-10">
                        <div
                          className={`p-2.5 rounded-xl ${theme.icon} bg-white/80 dark:bg-stone-800/80 backdrop-blur shadow-sm`}
                        >
                          <LayoutGrid className={`w-5 h-5 ${theme.text}`} />
                        </div>
                        <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-stone-600 dark:text-stone-300 shadow-sm border border-white/50">
                          {new Date(board.createdAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </div>
                      </div>

                      <div className="relative z-10">
                        <CardTitle className="text-xl font-bold text-stone-900 dark:text-stone-50 line-clamp-1 leading-tight">
                          {board.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 flex-grow flex flex-col justify-end">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800/50 group-hover:bg-white group-hover:border-stone-200 transition-colors">
                        <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                          {totalTasks}
                        </p>
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                          Tasks
                        </p>
                      </div>
                      <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800/50 group-hover:bg-white group-hover:border-stone-200 transition-colors">
                        <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                          {totalColumns}
                        </p>
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                          Columns
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900/50 group-hover:bg-stone-50 transition-colors">
                    <span className="text-xs font-bold text-stone-400 group-hover:text-stone-600 transition-colors">
                      Manage Project
                    </span>
                    <div
                      className={`p-1.5 rounded-full ${theme.bg} text-stone-600 group-hover:scale-110 transition-transform`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
