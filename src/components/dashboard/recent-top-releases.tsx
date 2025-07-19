"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Calendar, 
  Clock, 
  Award,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { movieRecommendationService } from "@/lib/movie-recommendations";
import { useRouter } from "next/navigation";

interface MovieRecommendation {
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
    Genre: string;
    Runtime: string;
  };
  recommendation_reason?: string;
}

export function RecentTopReleases() {
  const [movies, setMovies] = useState<MovieRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const recommendations = await movieRecommendationService.getTopRecentMovies();
      setMovies(recommendations);
    } catch (err) {
      setError('Failed to load movie recommendations');
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingValue = (ratings: Array<{ Source: string; Value: string }>, source: string) => {
    const rating = ratings.find(r => r.Source === source);
    return rating ? rating.Value : "N/A";
  };

  const getAwardsCount = (awards: string) => {
    if (!awards || awards === "N/A") return "0";
    
    const winsMatch = awards.match(/(\d+)\s+win/);
    const nominationsMatch = awards.match(/(\d+)\s+nomination/);
    
    const wins = winsMatch ? parseInt(winsMatch[1]) : 0;
    const nominations = nominationsMatch ? parseInt(nominationsMatch[1]) : 0;
    
    return (wins + nominations).toString();
  };

  const handleMovieClick = (movie: MovieRecommendation) => {
    // Navigate to search page with movie pre-selected
    router.push(`/dashboard/flick-search?movie=${encodeURIComponent(movie.title)}`);
  };

  if (loading) {
    return (
      <div className="h-fit">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Top Releases</h2>
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            Top-rated movies from the past 3-4 months
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex space-x-3 animate-pulse">
              <div className="w-16 h-24 bg-neutral-700 rounded flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-700 rounded w-1/2"></div>
                <div className="h-3 bg-neutral-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-fit">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Recent Top Releases</h2>
          <p className="text-muted-foreground text-sm">
            Top-rated movies from the past 3-4 months
          </p>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchMovies} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-fit">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Recent Top Releases</h2>
            <p className="text-muted-foreground text-sm">
              Top-rated movies from the past 3-4 months
            </p>
          </div>
          <Button 
            onClick={fetchMovies} 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
            <div className="grid grid-cols-2 gap-4">
        {(() => {
          const moviesWithPosters = movies.filter(movie => movie.poster_path);
          
          if (moviesWithPosters.length === 0) {
            return (
              <div className="col-span-2 text-center py-8">
                <p className="text-neutral-400 mb-4">No movies with posters available</p>
                <Button onClick={fetchMovies} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            );
          }
          
          return moviesWithPosters.slice(0, 4).map((movie) => (
            <div 
              key={movie.id}
              className="flex flex-row space-x-3 p-3 rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors"
              onClick={() => handleMovieClick(movie)}
            >
              {/* Movie Poster - First Column */}
              <div className="flex-shrink-0">
                <img
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt={movie.title}
                  className="w-16 h-24 object-cover rounded"
                />
              </div>

              {/* Movie Info - Second Column */}
              <div className="flex-1 min-w-0">
                <div className="text-left mb-2">
                  <h4 className="font-medium text-sm text-white truncate">
                    {movie.title}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                    {movie.recommendation_reason || movie.overview}
                  </p>
                </div>

                {/* Movie Details */}
                <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
                  {/* Release Date */}
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(movie.release_date)}</span>
                  </div>

                  {/* TMDB Rating */}
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>

                  {/* IMDb Rating */}
                  {movie.omdbData?.imdbRating && (
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-yellow-600">IMDb</span>
                      <span>{movie.omdbData.imdbRating}</span>
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-neutral-400">
                  {/* Runtime */}
                  {movie.omdbData?.Runtime && movie.omdbData.Runtime !== "N/A" && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{movie.omdbData.Runtime}</span>
                    </div>
                  )}

                  {/* Awards */}
                  {movie.omdbData?.Awards && movie.omdbData.Awards !== "N/A" && (
                    <div className="flex items-center space-x-1">
                      <Award className="h-3 w-3 text-yellow-600" />
                      <span>{getAwardsCount(movie.omdbData.Awards)}</span>
                    </div>
                  )}
                </div>

                {/* Genre Tags */}
                {movie.omdbData?.Genre && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {movie.omdbData.Genre.split(', ').slice(0, 2).map((genre) => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ));
        })()}
      </div>


    </div>
  );
} 