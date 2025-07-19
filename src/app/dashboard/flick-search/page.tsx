"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Award, Calendar, Clock, Loader2 } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  imdb_id?: string;
}

interface OmdbMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Poster: string;
  Awards: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  Response: string;
  Error?: string;
}

interface ApiResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

interface MovieWithDetails extends Movie {
  omdbData?: OmdbMovie;
}

export default function MovieSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<MovieWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Get credentials from environment variables
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
  const accessToken = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || "";
  const omdbApiKey = process.env.NEXT_PUBLIC_OMDB_API_KEY || "";

  const searchMovies = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      // Step 1: Search for movies using TMDB
      const searchResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
            "Content-Type": "application/json",
          },
          ...(apiKey && { method: "GET" }),
        }
      );

      if (!searchResponse.ok) {
        throw new Error(`Search failed: ${searchResponse.status}`);
      }

      const searchData: ApiResponse = await searchResponse.json();
      
      // Step 2: Get detailed information for each movie (including IMDb ID)
      const moviesWithDetails: MovieWithDetails[] = [];
      
      for (const movie of searchData.results.slice(0, 10)) { // Limit to first 10 movies
        try {
          // Get movie details to get IMDb ID
          const detailsResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}`,
            {
              headers: {
                Authorization: accessToken ? `Bearer ${accessToken}` : "",
                "Content-Type": "application/json",
              },
              ...(apiKey && { method: "GET" }),
            }
          );

          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            const movieWithDetails: MovieWithDetails = {
              ...movie,
              imdb_id: detailsData.imdb_id
            };

            // Step 3: Get OMDB data if we have IMDb ID and OMDB API key
            if (detailsData.imdb_id && omdbApiKey) {
              try {
                const omdbResponse = await fetch(
                  `http://www.omdbapi.com/?i=${detailsData.imdb_id}&apikey=${omdbApiKey}`
                );
                
                if (omdbResponse.ok) {
                  const omdbData: OmdbMovie = await omdbResponse.json();
                  if (omdbData.Response === "True") {
                    movieWithDetails.omdbData = omdbData;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movie Search</h1>
          <p className="text-muted-foreground">
            Discover your next favorite movie
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search for movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchMovies()}
                className="text-lg h-12"
              />
            </div>
            <Button 
              onClick={searchMovies} 
              disabled={loading || !searchQuery.trim()}
              className="h-12 px-8"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive font-medium">Error: {error}</p>
            </div>
          )}
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">
                {loading ? "Searching..." : `Found ${movies.length} movies`}
              </h2>
              {!loading && movies.length === 0 && (
                <p className="text-muted-foreground mt-2">
                  No movies found. Try a different search term.
                </p>
              )}
            </div>

            {movies.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                {movies.map((movie) => (
                  <Card key={movie.id} className="p-3 hover:shadow-lg transition-shadow">
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
                          ) : movie.omdbData?.Poster && movie.omdbData.Poster !== "N/A" ? (
                            <img
                              src={movie.omdbData.Poster}
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

                        {/* Row 2: Year, Time, and Rating */}
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{movie.release_date?.split('-')[0] || movie.omdbData?.Year || 'N/A'}</span>
                          </div>
                          {movie.omdbData?.Runtime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{movie.omdbData.Runtime}</span>
                            </div>
                          )}
                          {movie.omdbData?.Rated && (
                            <Badge variant="outline" className="text-xs">{movie.omdbData.Rated}</Badge>
                          )}
                        </div>

                        {/* Row 3: Overview and Description */}
                        <div>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {movie.omdbData?.Plot || movie.overview || "No overview available."}
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
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 