"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Calendar, 
  RefreshCw
} from "lucide-react";
import { movieRecommendationService, type MovieRecommendation, type DashboardMovies } from "@/lib/movie-recommendations";
import { useRouter } from "next/navigation";

export function RecentTopReleases() {
  const [movies, setMovies] = useState<MovieRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('RecentTopReleases: Subscribing to movie service...');
    
    // Subscribe to movie recommendation service
    const unsubscribe = movieRecommendationService.subscribe((dashboardMovies: DashboardMovies) => {
      console.log('RecentTopReleases: Received movies:', dashboardMovies.topReleases.length);
      setMovies(dashboardMovies.topReleases);
      setLoading(false);
    });
    
    // Initialize if needed
    movieRecommendationService.initializeDashboard();
    
    return () => {
      unsubscribe();
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <Button onClick={() => movieRecommendationService.refreshDashboardMovies()} variant="outline">
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
            onClick={() => movieRecommendationService.refreshDashboardMovies()} 
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
          if (movies.length === 0) {
            return (
              <div className="col-span-2 text-center py-8">
                <p className="text-neutral-400 mb-4">No movies with posters available</p>
                <Button onClick={() => movieRecommendationService.refreshDashboardMovies()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            );
          }
          
          return movies.filter(movie => movie.poster_path).slice(0, 4).map((movie) => (
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
                  onError={() => {
                    // Use the service to replace broken movie
                    movieRecommendationService.replaceBrokenMovie('topReleases', movie.id);
                  }}
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

                {/* Movie Details - Only Date and Rating */}
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
                </div>
              </div>
            </div>
          ));
        })()}
      </div>


    </div>
  );
} 