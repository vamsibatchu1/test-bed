"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Star, Award, Calendar, Clock } from "lucide-react";

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

export default function ApiTestPage() {
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState<MovieWithDetails[]>([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [testResults, setTestResults] = useState<{ [key: string]: unknown }>({});

  // Get credentials from environment variables
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
  const accessToken = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || "";
  const omdbApiKey = process.env.NEXT_PUBLIC_OMDB_API_KEY || "";

  const testApiConnection = async () => {
    if (!apiKey && !accessToken) {
      setError("No TMDB API credentials found. Please set NEXT_PUBLIC_TMDB_API_KEY or NEXT_PUBLIC_TMDB_ACCESS_TOKEN in your .env.local file.");
      return;
    }

    setLoading(true);
    setError("");
    setTestResults({});

    try {
      // Test 1: Popular Movies
      const popularResponse = await fetch(
        "https://api.themoviedb.org/3/movie/popular",
        {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
            "Content-Type": "application/json",
          },
          ...(apiKey && { method: "GET" }),
        }
      );

      if (!popularResponse.ok) {
        throw new Error(`Popular movies test failed: ${popularResponse.status}`);
      }

      const popularData = await popularResponse.json();
      setTestResults(prev => ({ ...prev, popularMovies: popularData }));
      setMovies(popularData.results || []);

      // Test 2: Search Movies
      if (searchQuery) {
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

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          setTestResults(prev => ({ ...prev, searchResults: searchData }));
        }
      }

      // Test 3: Movie Details (using first movie from popular)
      if (popularData.results && popularData.results.length > 0) {
        const movieId = popularData.results[0].id;
        const detailsResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}`,
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
          setTestResults(prev => ({ ...prev, movieDetails: detailsData }));
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");

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
      
      for (const movie of searchData.results.slice(0, 5)) { // Limit to first 5 movies
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
      setTestResults(prev => ({ ...prev, searchResults: searchData }));
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Movie API Test Page</h1>
        <p className="text-muted-foreground">
          Test TMDB and OMDB API integration for GoodFlicks
        </p>
      </div>

      {/* API Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration Status</CardTitle>
          <CardDescription>
            Current API credentials status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>TMDB API Key (v3)</Label>
              <div className="flex items-center gap-2">
                <Badge variant={apiKey ? "default" : "secondary"}>
                  {apiKey ? "Configured" : "Not Set"}
                </Badge>
                {apiKey && (
                  <span className="text-xs text-muted-foreground">
                    {apiKey.substring(0, 8)}...
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>TMDB Access Token (v4)</Label>
              <div className="flex items-center gap-2">
                <Badge variant={accessToken ? "default" : "secondary"}>
                  {accessToken ? "Configured" : "Not Set"}
                </Badge>
                {accessToken && (
                  <span className="text-xs text-muted-foreground">
                    {accessToken.substring(0, 8)}...
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>OMDB API Key</Label>
              <div className="flex items-center gap-2">
                <Badge variant={omdbApiKey ? "default" : "secondary"}>
                  {omdbApiKey ? "Configured" : "Not Set"}
                </Badge>
                {omdbApiKey && (
                  <span className="text-xs text-muted-foreground">
                    {omdbApiKey.substring(0, 8)}...
                  </span>
                )}
              </div>
            </div>
          </div>

          {(!apiKey && !accessToken) && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>TMDB Setup Required:</strong> Set either <code>NEXT_PUBLIC_TMDB_API_KEY</code> or <code>NEXT_PUBLIC_TMDB_ACCESS_TOKEN</code> in your .env.local file.
              </AlertDescription>
            </Alert>
          )}

          {!omdbApiKey && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>OMDB Setup Required:</strong> Set <code>NEXT_PUBLIC_OMDB_API_KEY</code> in your .env.local file to get IMDb, Rotten Tomatoes, and Metacritic ratings.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Search and Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Test Controls</CardTitle>
          <CardDescription>
            Search for movies or run comprehensive API tests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="searchQuery">Search Query</Label>
              <Input
                id="searchQuery"
                placeholder="Enter a movie title to search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchMovies()}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={searchMovies} 
                disabled={loading || !searchQuery.trim() || (!apiKey && !accessToken)}
                variant="outline"
                className="whitespace-nowrap"
              >
                {loading ? "Searching..." : "Search Movies"}
              </Button>
              <Button 
                onClick={testApiConnection} 
                disabled={loading || (!apiKey && !accessToken)}
              >
                {loading ? "Testing..." : "Run All Tests"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive font-medium">Error: {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Movies Display with Comprehensive Details */}
      {movies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Movies Found ({movies.length})</CardTitle>
            <CardDescription>
              Comprehensive movie details with ratings and awards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {movies.map((movie) => (
                <Card key={movie.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Movie Poster */}
                    <div className="md:w-48 flex-shrink-0">
                      <div className="aspect-[2/3] bg-muted relative">
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
                            <span className="text-muted-foreground">No poster</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Movie Details */}
                    <div className="flex-1 p-6">
                      <div className="space-y-4">
                        {/* Title and Basic Info */}
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{movie.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{movie.release_date?.split('-')[0] || movie.omdbData?.Year || 'N/A'}</span>
                            </div>
                            {movie.omdbData?.Runtime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{movie.omdbData.Runtime}</span>
                              </div>
                            )}
                            {movie.omdbData?.Rated && (
                              <Badge variant="outline">{movie.omdbData.Rated}</Badge>
                            )}
                          </div>
                        </div>

                        {/* Overview */}
                        <div>
                          <h4 className="font-semibold mb-2">Overview</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {movie.omdbData?.Plot || movie.overview || "No overview available."}
                          </p>
                        </div>

                        {/* Ratings Grid */}
                        <div>
                          <h4 className="font-semibold mb-3">Ratings</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-yellow-50 rounded-lg border">
                              <div className="text-2xl font-bold text-yellow-600">★</div>
                              <div className="text-sm font-medium">IMDb</div>
                              <div className="text-lg font-bold">
                                {movie.omdbData?.imdbRating || "N/A"}
                              </div>
                              {movie.omdbData?.imdbVotes && (
                                <div className="text-xs text-muted-foreground">
                                  {movie.omdbData.imdbVotes} votes
                                </div>
                              )}
                            </div>
                            
                            <div className="text-center p-3 bg-red-50 rounded-lg border">
                              <div className="text-2xl font-bold text-red-600">🍅</div>
                              <div className="text-sm font-medium">Rotten Tomatoes</div>
                              <div className="text-lg font-bold">
                                {getRatingValue(movie.omdbData?.Ratings || [], "Rotten Tomatoes")}
                              </div>
                            </div>
                            
                            <div className="text-center p-3 bg-blue-50 rounded-lg border">
                              <div className="text-2xl font-bold text-blue-600">M</div>
                              <div className="text-sm font-medium">Metacritic</div>
                              <div className="text-lg font-bold">
                                {getRatingValue(movie.omdbData?.Ratings || [], "Metacritic")}
                              </div>
                            </div>
                            
                            <div className="text-center p-3 bg-green-50 rounded-lg border">
                              <div className="text-2xl font-bold text-green-600">🎬</div>
                              <div className="text-sm font-medium">TMDB</div>
                              <div className="text-lg font-bold">
                                {movie.vote_average?.toFixed(1) || "N/A"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {movie.vote_count?.toLocaleString() || "0"} votes
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Awards */}
                        {movie.omdbData?.Awards && movie.omdbData.Awards !== "N/A" && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              Awards
                            </h4>
                            <div className="flex items-center gap-4">
                              <Badge variant="secondary" className="text-sm">
                                {getAwardsCount(movie.omdbData.Awards)} total
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                {movie.omdbData.Awards}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Additional Info */}
                        {movie.omdbData && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Director:</span> {movie.omdbData.Director}
                            </div>
                            <div>
                              <span className="font-medium">Genre:</span> {movie.omdbData.Genre}
                            </div>
                            <div className="md:col-span-2">
                              <span className="font-medium">Cast:</span> {movie.omdbData.Actors}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>TMDB API Test Results</CardTitle>
            <CardDescription>
              Raw JSON responses from TMDB API calls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(testResults).map(([testName, result]) => (
              <div key={testName} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{testName}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {(result as { results?: unknown[] }).results ? `${(result as { results: unknown[] }).results.length} results` : "Details loaded"}
                  </span>
                </div>
                <div className="p-3 bg-muted rounded-md max-h-40 overflow-auto">
                  <pre className="text-xs">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 