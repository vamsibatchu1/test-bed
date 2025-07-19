"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MoreHorizontal, 
  Star, 
  Calendar,
  Clock,
  Bookmark,
  Eye,
  Plus,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { markFirstSearch, markFirstSave } from "@/lib/progress-tracker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  imdb_id?: string;
  omdbData?: {
    imdbRating: string;
    Ratings: Array<{ Source: string; Value: string }>;
    Awards: string;
  };
}

interface Folder {
  id: string;
  title: string;
  is_secret: boolean;
  created_at: string;
}

export default function FlickSearchPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderTitle, setNewFolderTitle] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(new Set());
  const [existingSaves, setExistingSaves] = useState<Set<string>>(new Set());

  // Check for movie parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieParam = urlParams.get('movie');
    if (movieParam) {
      setSearchQuery(movieParam);
      searchMovies(movieParam);
    }
  }, []);

  // Fetch user's folders
  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const searchMovies = async (query: string) => {
    if (!query.trim()) {
      setMovies([]);
      return;
    }

    setLoading(true);
    try {
      // Step 1: Search for movies using TMDB
      const searchResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
      );
      const searchData = await searchResponse.json();
      
      // Step 2: Get detailed information for each movie (including IMDb ID)
      const moviesWithDetails: Movie[] = [];
      
      for (const movie of searchData.results.slice(0, 10)) { // Limit to first 10 movies
        try {
          // Get movie details to get IMDb ID
          const detailsResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
          );

          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            const movieWithDetails: Movie = {
              ...movie,
              imdb_id: detailsData.imdb_id
            };

            // Step 3: Get OMDB data if we have IMDb ID
            if (detailsData.imdb_id && process.env.NEXT_PUBLIC_OMDB_API_KEY) {
              try {
                const omdbResponse = await fetch(
                  `http://www.omdbapi.com/?i=${detailsData.imdb_id}&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`
                );
                
                if (omdbResponse.ok) {
                  const omdbData = await omdbResponse.json();
                  if (omdbData.Response === "True") {
                    movieWithDetails.omdbData = {
                      imdbRating: omdbData.imdbRating,
                      Ratings: omdbData.Ratings || [],
                      Awards: omdbData.Awards
                    };
                  }
                }
              } catch (omdbErr) {
                console.warn(`Failed to fetch OMDB data for ${movie.title}:`, omdbErr);
              }
            }

            moviesWithDetails.push(movieWithDetails);
          }
        } catch (detailsErr) {
          console.warn(`Failed to fetch details for ${movie.title}:`, detailsErr);
          moviesWithDetails.push(movie);
        }
      }

      setMovies(moviesWithDetails);
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchMovies(searchQuery);
    // Mark first search as completed
    markFirstSearch();
  };

  const checkExistingSaves = async (movieId: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_movies')
        .select('folder_id')
        .eq('user_id', user.id)
        .eq('movie_id', movieId);

      if (error) throw error;
      
      const folderIds = new Set(data?.map(item => item.folder_id) || []);
      setExistingSaves(folderIds);
      setSelectedFolderIds(folderIds); // Initialize with existing saves
    } catch (error) {
      console.error('Error checking existing saves:', error);
    }
  };

  const handleToggleFolder = async (folderId: string) => {
    if (!selectedMovie || !user) return;

    const newSelectedIds = new Set(selectedFolderIds);
    const isCurrentlySelected = newSelectedIds.has(folderId);
    const wasPreviouslySaved = existingSaves.has(folderId);

    if (isCurrentlySelected) {
      // Remove from selection
      newSelectedIds.delete(folderId);
      setSelectedFolderIds(newSelectedIds);

      // If it was previously saved, remove from database
      if (wasPreviouslySaved) {
        try {
          const { error } = await supabase
            .from('saved_movies')
            .delete()
            .eq('user_id', user.id)
            .eq('folder_id', folderId)
            .eq('movie_id', selectedMovie.id);

          if (error) {
            console.error('Error removing movie from folder:', error);
            // Re-add to selection if removal failed
            newSelectedIds.add(folderId);
            setSelectedFolderIds(newSelectedIds);
          } else {
            // Update existing saves set
            const newExistingSaves = new Set(existingSaves);
            newExistingSaves.delete(folderId);
            setExistingSaves(newExistingSaves);
          }
        } catch (error) {
          console.error('Error removing movie from folder:', error);
          // Re-add to selection if removal failed
          newSelectedIds.add(folderId);
          setSelectedFolderIds(newSelectedIds);
        }
      }
    } else {
      // Add to selection and save immediately
      newSelectedIds.add(folderId);
      setSelectedFolderIds(newSelectedIds);

      // Only save if it wasn't previously saved
      if (!wasPreviouslySaved) {
        try {
          const { error } = await supabase
            .from('saved_movies')
            .insert({
              user_id: user.id,
              folder_id: folderId,
              movie_id: selectedMovie.id,
              movie_title: selectedMovie.title,
              movie_poster: selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` : null,
              movie_overview: selectedMovie.overview,
              movie_release_date: selectedMovie.release_date,
              movie_rating: selectedMovie.vote_average,
            });

          if (error) {
            console.error('Error saving movie:', error);
            // Remove from selection if save failed
            newSelectedIds.delete(folderId);
            setSelectedFolderIds(newSelectedIds);
          } else {
            // Update existing saves set
            const newExistingSaves = new Set(existingSaves);
            newExistingSaves.add(folderId);
            setExistingSaves(newExistingSaves);
            // Mark first save as completed
            markFirstSave();
          }
        } catch (error) {
          console.error('Error saving movie:', error);
          // Remove from selection if save failed
          newSelectedIds.delete(folderId);
          setSelectedFolderIds(newSelectedIds);
        }
      }
    }
  };

  const handleCloseSaveModal = () => {
    setShowSaveModal(false);
    setSelectedMovie(null);
    setSelectedFolderIds(new Set());
    setExistingSaves(new Set());
  };

  const createNewFolderAndSave = async () => {
    if (!selectedMovie || !user || !newFolderTitle.trim()) return;

    try {
      setCreating(true);
      
      // Create new folder
      const { data: folderData, error: folderError } = await supabase
        .from('folders')
        .insert({
          title: newFolderTitle.trim(),
          is_secret: isSecret,
          user_id: user.id,
        })
        .select()
        .single();

      if (folderError) throw folderError;

      // Save movie to new folder
      const { error: movieError } = await supabase
        .from('saved_movies')
        .insert({
          user_id: user.id,
          folder_id: folderData.id,
          movie_id: selectedMovie.id,
          movie_title: selectedMovie.title,
          movie_poster: selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` : null,
          movie_overview: selectedMovie.overview,
          movie_release_date: selectedMovie.release_date,
          movie_rating: selectedMovie.vote_average,
        });

      if (movieError) throw movieError;

      // Reset form and close modals
      setNewFolderTitle("");
      setIsSecret(false);
      setShowNewFolderModal(false);
      setShowSaveModal(false);
      setSelectedMovie(null);
      setSelectedFolderIds(new Set());
      setExistingSaves(new Set());
      
      // Mark first save as completed
      markFirstSave();
      
      // Refresh folders
      await fetchFolders();
    } catch (error) {
      console.error('Error creating folder and saving movie:', error);
    } finally {
      setCreating(false);
    }
  };

  const getRatingValue = (ratings: Array<{ Source: string; Value: string }>, source: string) => {
    const rating = ratings.find(r => r.Source === source);
    return rating ? rating.Value : "N/A";
  };

  const getAwardsCount = (awards: string) => {
    if (!awards || awards === "N/A") return "0";
    
    // Count wins and nominations
    const winsMatch = awards.match(/(\d+)\s+win/);
    const nominationsMatch = awards.match(/(\d+)\s+nomination/);
    
    const wins = winsMatch ? parseInt(winsMatch[1]) : 0;
    const nominations = nominationsMatch ? parseInt(nominationsMatch[1]) : 0;
    
    return (wins + nominations).toString();
  };

  const handleMarkAsWatched = async () => {
    // TODO: Implement watched functionality
    console.log('Mark as watched:', selectedMovie?.title);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Flick Search</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Button type="submit" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8">
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Searching movies...</p>
          </div>
        )}

        {!loading && movies.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {movies.map((movie) => (
              <Card key={movie.id} className="p-3 hover:shadow-lg transition-shadow group relative">
                {/* 3-dot Menu - positioned at top right of entire card */}
                <div className="absolute top-2 right-2 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white border border-gray-200"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                                              <DropdownMenuItem
                          onClick={async () => {
                            setSelectedMovie(movie);
                            setShowSaveModal(true);
                            await checkExistingSaves(movie.id);
                          }}
                        >
                        <Bookmark className="mr-2 h-4 w-4" />
                        Save to library
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleMarkAsWatched}>
                        <Eye className="mr-2 h-4 w-4" />
                        I have watched this movie already
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex gap-3">
                  {/* First Column: Poster */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-48 bg-muted relative rounded-lg overflow-hidden">
                      {movie.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">No poster</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Second Column: Details */}
                  <div className="flex-1 flex flex-col space-y-2">
                    {/* Row 1: Title */}
                    <div>
                      <h3 className="font-bold text-lg line-clamp-2">{movie.title}</h3>
                    </div>

                    {/* Row 2: Year and Rating */}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Row 3: Overview */}
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {movie.overview || "No overview available."}
                      </p>
                    </div>

                    {/* Row 4: IMDb and Rotten Tomatoes Ratings */}
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded border">
                        <Star className="h-3 w-3 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-600">IMDb</span>
                        <span className="text-sm font-bold">
                          {movie.omdbData?.imdbRating || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded border">
                        <span className="text-xs font-medium text-red-600">🍅</span>
                        <span className="text-xs font-medium text-red-600">RT</span>
                        <span className="text-sm font-bold">
                          {getRatingValue(movie.omdbData?.Ratings || [], "Rotten Tomatoes")}
                        </span>
                      </div>
                    </div>

                    {/* Row 5: Awards Details */}
                    {movie.omdbData?.Awards && movie.omdbData.Awards !== "N/A" && (
                      <div className="flex items-center gap-2">
                        <Award className="h-3 w-3 text-amber-600" />
                        <Badge variant="secondary" className="text-xs">
                          {getAwardsCount(movie.omdbData.Awards)} awards
                        </Badge>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {movie.omdbData.Awards}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

                 {!loading && searchQuery && movies.length === 0 && (
           <div className="text-center py-8">
             <p className="text-gray-600">No movies found for &quot;{searchQuery}&quot;</p>
           </div>
         )}
      </div>

      {/* Save to Library Modal */}
      <Dialog open={showSaveModal} onOpenChange={handleCloseSaveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to a library</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                <Checkbox
                  checked={selectedFolderIds.has(folder.id)}
                  onCheckedChange={() => handleToggleFolder(folder.id)}
                />
                <div className="flex-1">
                  <p className="font-medium">{folder.title}</p>
                  <p className="text-sm text-gray-500">
                    {folder.is_secret ? "Secret" : "Public"} • Created {new Date(folder.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowSaveModal(false);
                  setShowNewFolderModal(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to a new library
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create New Library Modal */}
      <Dialog open={showNewFolderModal} onOpenChange={setShowNewFolderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Library</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newFolderTitle">Library Name</Label>
              <Input
                id="newFolderTitle"
                value={newFolderTitle}
                onChange={(e) => setNewFolderTitle(e.target.value)}
                placeholder="Enter library name..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="newSecret"
                checked={isSecret}
                onCheckedChange={setIsSecret}
              />
              <Label htmlFor="newSecret">Secret library (only you can see)</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowNewFolderModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createNewFolderAndSave}
                disabled={creating || !newFolderTitle.trim()}
              >
                {creating ? "Creating..." : "Create & Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
} 