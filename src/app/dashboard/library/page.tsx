"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Lock, Unlock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { markFirstLibrary } from "@/lib/progress-tracker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Folder {
  id: string;
  title: string;
  is_secret: boolean;
  created_at: string;
  saved_movies: SavedMovie[];
}

interface SavedMovie {
  id: string;
  movie_id: number;
  movie_title: string;
  movie_poster: string;
  movie_overview: string;
  movie_release_date: string;
  movie_rating: number;
}

export default function MySavedFlicks() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFolderTitle, setNewFolderTitle] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  // Show login message if user is not authenticated
  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-4 bg-neutral-950 min-h-screen overflow-y-auto scrollbar-hide">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Lock className="w-16 h-16 text-neutral-400 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Login Required</h2>
            <p className="text-neutral-400">Login to access saved libraries</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('folders')
        .select(`
          *,
          saved_movies (*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderTitle.trim()) return;
    
    try {
      setCreating(true);
      const { error } = await supabase
        .from('folders')
        .insert({
          title: newFolderTitle.trim(),
          is_secret: isSecret,
          user_id: user?.id,
        });

      if (error) throw error;
      
      // Mark first library as completed
      markFirstLibrary();
      
      // Reset form and close dialog
      setNewFolderTitle("");
      setIsSecret(false);
      setIsCreateDialogOpen(false);
      
      // Refresh folders
      await fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 bg-[#F0EFEB] overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">My Library</h1>
              <p className="text-neutral-400 text-sm mt-1">
                Organize your movies into custom folders and collections
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (folders.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-4 bg-[#F0EFEB] overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">My Library</h1>
              <p className="text-neutral-400 text-sm mt-1">
                Organize your movies into custom folders and collections
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="p-2 h-auto bg-transparent hover:bg-transparent">
                  <Plus className="w-8 h-8 text-white" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Create New Folder</DialogTitle>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Folder Name</Label>
                    <Input
                      id="title"
                      value={newFolderTitle}
                      onChange={(e) => setNewFolderTitle(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="secret"
                      checked={isSecret}
                      onCheckedChange={setIsSecret}
                    />
                    <Label htmlFor="secret">Secret folder (only you can see)</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createFolder}
                      disabled={creating || !newFolderTitle.trim()}
                    >
                      {creating ? "Creating..." : "Create Folder"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No folders yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first folder to start saving your favorite movies
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Folder
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
              <div className="p-4 overflow-y-auto scrollbar-hide">
                  <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">My Library</h1>
              <p className="text-neutral-400 text-sm mt-1">
                Organize your movies into custom folders and collections
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="p-2 h-auto bg-transparent hover:bg-transparent">
                  <Plus className="w-8 h-8 text-white" />
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Folder Name</Label>
                  <Input
                    id="title"
                    value={newFolderTitle}
                    onChange={(e) => setNewFolderTitle(e.target.value)}
                    placeholder="Enter folder name..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="secret"
                    checked={isSecret}
                    onCheckedChange={setIsSecret}
                  />
                  <Label htmlFor="secret">Secret folder (only you can see)</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createFolder}
                    disabled={creating || !newFolderTitle.trim()}
                  >
                    {creating ? "Creating..." : "Create Folder"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-4">
          {folders.map((folder) => (
            <Card key={folder.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <CardTitle className="text-lg font-semibold truncate">
                      {folder.title}
                    </CardTitle>
                    <span className="text-sm text-gray-600">
                      ({folder.saved_movies?.length || 0})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {folder.is_secret ? (
                      <Lock className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Unlock className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {folder.saved_movies && folder.saved_movies.length > 0 ? (
                    folder.saved_movies.slice(0, 5).map((movie) => (
                      <div
                        key={movie.id}
                        className="flex-shrink-0 w-16 h-24 bg-gray-200 rounded-lg overflow-hidden"
                      >
                        {movie.movie_poster ? (
                          <img
                            src={movie.movie_poster}
                            alt={movie.movie_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-500 text-center px-1">
                              {movie.movie_title}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-gray-500">No movies yet</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
} 