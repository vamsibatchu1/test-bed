// Movie recommendations service using OpenAI + TMDB/OMDB APIs

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

interface OpenAIRecommendation {
  title: string;
  year: string;
  reason: string;
  genre: string;
}

interface DashboardMovies {
  recentWatched: MovieRecommendation[];
  topReleases: MovieRecommendation[];
  isLoading: boolean;
  lastUpdated: number;
}

export class MovieRecommendationService {
  private static instance: MovieRecommendationService;
  private topReleasesCache: MovieRecommendation[] = [];
  private lastTopReleasesFetch: number = 0;
  private readonly TOP_RELEASES_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  // Dashboard functionality
  private dashboardMovies: DashboardMovies = {
    recentWatched: [],
    topReleases: [],
    isLoading: false,
    lastUpdated: 0
  };
  private listeners: Set<(movies: DashboardMovies) => void> = new Set();
  private refreshInterval: NodeJS.Timeout | null = null;
  private readonly DASHBOARD_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): MovieRecommendationService {
    if (!MovieRecommendationService.instance) {
      MovieRecommendationService.instance = new MovieRecommendationService();
    }
    return MovieRecommendationService.instance;
  }

  constructor() {
    this.startAutoRefresh();
  }

  // ===== DASHBOARD FUNCTIONALITY =====

  // Subscribe to movie updates
  subscribe(callback: (movies: DashboardMovies) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.dashboardMovies));
  }

  // Get current dashboard movies
  getDashboardMovies(): DashboardMovies {
    return this.dashboardMovies;
  }

  // Check if dashboard cache is stale
  private isDashboardCacheStale(): boolean {
    return Date.now() - this.dashboardMovies.lastUpdated > this.DASHBOARD_CACHE_DURATION;
  }

  // Load recent watched movies
  private async loadRecentWatchedMovies(): Promise<MovieRecommendation[]> {
    try {
      console.log('MovieRecommendationService: Loading recent watched movies...');
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      
      if (!apiKey) {
        console.error('MovieRecommendationService: TMDB API key not found');
        return this.getFallbackRecommendations().slice(0, 6);
      }
      
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&page=1`
      );
      
      if (!response.ok) {
        console.error('MovieRecommendationService: TMDB API error:', response.status);
        return this.getFallbackRecommendations().slice(0, 6);
      }
      
      const data = await response.json();
      console.log('MovieRecommendationService: TMDB response for recent watched:', data.results?.length);
      
      // Filter movies with posters
      const moviesWithPosters = data.results.filter((movie: MovieRecommendation) => movie.poster_path);
      
      return moviesWithPosters.slice(0, 15); // Keep 15 for alternatives
    } catch (error) {
      console.error('Error loading recent watched movies:', error);
      return this.getFallbackRecommendations().slice(0, 6);
    }
  }

  // Refresh dashboard movie data
  async refreshDashboardMovies(): Promise<void> {
    if (this.dashboardMovies.isLoading) return;
    
    console.log('MovieRecommendationService: Starting dashboard refresh...');
    this.dashboardMovies.isLoading = true;
    this.notifyListeners();
    
    try {
      const [recentWatched, topReleases] = await Promise.all([
        this.loadRecentWatchedMovies(),
        this.getTopRecentMovies()
      ]);
      
      console.log('MovieRecommendationService: Loaded dashboard movies:', { 
        recentWatched: recentWatched.length, 
        topReleases: topReleases.length 
      });
      
      this.dashboardMovies = {
        recentWatched,
        topReleases,
        isLoading: false,
        lastUpdated: Date.now()
      };
      
      this.notifyListeners();
    } catch (error) {
      console.error('Error refreshing dashboard movies:', error);
      this.dashboardMovies.isLoading = false;
      this.notifyListeners();
    }
  }

  // Initialize dashboard (called on app start)
  async initializeDashboard(): Promise<void> {
    console.log('MovieRecommendationService: Initializing dashboard...');
    if (this.dashboardMovies.lastUpdated === 0 || this.isDashboardCacheStale()) {
      console.log('MovieRecommendationService: Dashboard cache is stale or empty, refreshing...');
      await this.refreshDashboardMovies();
    } else {
      console.log('MovieRecommendationService: Using cached dashboard data');
      this.notifyListeners();
    }
  }

  // Start automatic refresh
  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      if (this.isDashboardCacheStale()) {
        this.refreshDashboardMovies();
      }
    }, this.REFRESH_INTERVAL);
  }

  // Stop automatic refresh
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Get movies for specific sections
  getRecentWatchedMovies(count: number = 6): MovieRecommendation[] {
    return this.dashboardMovies.recentWatched.slice(0, count);
  }

  getTopReleasesMovies(count: number = 4): MovieRecommendation[] {
    // Ensure we return exactly the requested number of movies with posters
    const moviesWithPosters = this.dashboardMovies.topReleases.filter(movie => movie.poster_path);
    return moviesWithPosters.slice(0, count);
  }

  // Replace broken movie with alternative
  replaceBrokenMovie(section: 'recentWatched' | 'topReleases', brokenMovieId: number): void {
    const currentMovies = this.dashboardMovies[section];
    const currentIndex = currentMovies.findIndex(movie => movie.id === brokenMovieId);
    
    if (currentIndex === -1) return;
    
    // Find available movies from the same section
    const availableMovies = this.dashboardMovies[section].filter(movie => 
      movie.id !== brokenMovieId && 
      !currentMovies.slice(0, currentIndex + 1).some(m => m.id === movie.id)
    );
    
    if (availableMovies.length === 0) {
      // Remove the broken movie
      this.dashboardMovies[section] = currentMovies.filter(movie => movie.id !== brokenMovieId);
    } else {
      // Replace with alternative
      const replacement = availableMovies[0];
      const newList = [...currentMovies];
      newList[currentIndex] = replacement;
      this.dashboardMovies[section] = newList;
    }
    
    this.notifyListeners();
  }

  // ===== ORIGINAL TOP RELEASES FUNCTIONALITY =====

  async getTopRecentMovies(): Promise<MovieRecommendation[]> {
    // Check cache first
    if (this.topReleasesCache.length > 0 && Date.now() - this.lastTopReleasesFetch < this.TOP_RELEASES_CACHE_DURATION) {
      console.log('MovieRecommendationService: Using cached top releases');
      return this.topReleasesCache;
    }

    try {
      console.log('MovieRecommendationService: Fetching new top releases...');
      
      // Step 1: Get movie recommendations from OpenAI
      const openAIRecommendations = await this.getOpenAIRecommendations();
      
      // Step 2: Enrich with TMDB and OMDB data
      const enrichedMovies = await this.enrichMovieData(openAIRecommendations);
      
      // Update cache
      this.topReleasesCache = enrichedMovies;
      this.lastTopReleasesFetch = Date.now();
      
      console.log('MovieRecommendationService: Successfully fetched', enrichedMovies.length, 'top releases');
      return enrichedMovies;
    } catch (error) {
      console.error('Error fetching movie recommendations:', error);
      console.log('MovieRecommendationService: Using fallback recommendations');
      // Return fallback recommendations if APIs fail
      return this.getFallbackRecommendations();
    }
  }

  private async getOpenAIRecommendations(): Promise<OpenAIRecommendation[]> {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    
    const prompt = `You are a movie expert. Provide a list of exactly 15 popular movies from the past 6 months (${sixMonthsAgo.toLocaleDateString()} to ${now.toLocaleDateString()}) that have IMDb ratings above 7.0 and are well-known blockbusters or critically acclaimed films.

CRITICAL REQUIREMENTS:
- Movies MUST be released between ${sixMonthsAgo.toLocaleDateString()} and ${now.toLocaleDateString()}
- Movies MUST have IMDb ratings above 7.0 (high-quality films only)
- Include major studio releases, blockbusters, and award winners
- Focus on movies that actually exist and have been widely released
- Mix of different genres but prioritize popular mainstream films
- NO obscure or indie films that might not have IMDb data

EXAMPLES OF GOOD RECENT MOVIES:
- Major superhero films, sequels to popular franchises
- Award-winning dramas and comedies
- Animated films from major studios
- Horror films from established franchises
- Action blockbusters with big stars

For each movie, provide:
- Exact title (must match IMDb/TMDB exactly)
- Year (2024 or 2025)
- Brief reason why it's recommended (1-2 sentences)
- Primary genre

Format as JSON array:
[
  {
    "title": "Movie Title",
    "year": "2024",
    "reason": "Brief recommendation reason",
    "genre": "Primary genre"
  }
]

IMPORTANT: Only suggest movies you are confident exist and were released in the specified timeframe with good ratings.`;

    try {
      const response = await fetch('/api/movie-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Error getting OpenAI recommendations:', error);
      throw error;
    }
  }

  private async enrichMovieData(recommendations: OpenAIRecommendation[]): Promise<MovieRecommendation[]> {
    const enrichedMovies: MovieRecommendation[] = [];
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 6); // 6 months ago

    console.log(`MovieRecommendationService: Filtering for movies after ${cutoffDate.toISOString()}`);

    for (const rec of recommendations.slice(0, 15)) {
      try {
        // Search TMDB for the movie
        const tmdbMovie = await this.searchTMDBMovie(rec.title, rec.year);
        
        if (tmdbMovie) {
          // Get detailed TMDB info
          const detailedMovie = await this.getTMDBMovieDetails(tmdbMovie.id);
          
          if (detailedMovie) {
            // DATE FILTERING - Only include movies from past 6 months
            if (!this.isWithinDateRange(detailedMovie.release_date)) {
              console.log(`MovieRecommendationService: Skipping ${detailedMovie.title} (${detailedMovie.release_date}) - too old`);
              continue;
            }
            
            // Get OMDB data for IMDb rating
            let omdbData = undefined;
            if (detailedMovie.imdb_id && process.env.NEXT_PUBLIC_OMDB_API_KEY) {
              const omdbResult = await this.getOMDBData(detailedMovie.imdb_id);
              omdbData = omdbResult || undefined;
            }
            
            // Check IMDb rating requirement (> 7.0) - MUST have valid IMDb rating
            const imdbRating = omdbData?.imdbRating ? parseFloat(omdbData.imdbRating) : 0;
            if (imdbRating === 0 || isNaN(imdbRating)) {
              console.log(`MovieRecommendationService: Skipping ${detailedMovie.title} - No valid IMDb rating`);
              continue;
            }
            if (imdbRating <= 7.0) {
              console.log(`MovieRecommendationService: Skipping ${detailedMovie.title} - IMDb rating ${imdbRating} <= 7.0`);
              continue;
            }
            
            console.log(`MovieRecommendationService: Including ${detailedMovie.title} (${detailedMovie.release_date}) - IMDb: ${imdbRating}`);

            enrichedMovies.push({
              ...detailedMovie,
              omdbData,
              recommendation_reason: rec.reason
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to enrich data for ${rec.title}:`, error);
      }
    }

    console.log(`MovieRecommendationService: Final filtered movies: ${enrichedMovies.length}`);
    
    // If we don't have enough movies (less than 4), use fallback recent movies with good ratings
    if (enrichedMovies.length < 4) {
      console.log('MovieRecommendationService: Not enough movies found, adding fallback recent movies...');
      const fallbackMovies = this.getRecentFallbackMovies();
      
      // Add fallback movies that aren't already in our list
      for (const fallback of fallbackMovies) {
        if (enrichedMovies.length >= 6) break; // Limit to 6 total
        if (!enrichedMovies.some(movie => movie.id === fallback.id)) {
          enrichedMovies.push(fallback);
        }
      }
      
      console.log(`MovieRecommendationService: Added fallback movies, total: ${enrichedMovies.length}`);
    }
    
    return enrichedMovies;
  }

  private async searchTMDBMovie(title: string, year: string): Promise<MovieRecommendation | null> {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(title)}&year=${year}&page=1`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.results?.[0] || null;
  }

  private async getTMDBMovieDetails(movieId: number): Promise<MovieRecommendation | null> {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
    );
    
    if (!response.ok) return null;
    
    return await response.json();
  }

  private async getOMDBData(imdbId: string): Promise<MovieRecommendation['omdbData'] | null> {
    const response = await fetch(
      `http://www.omdbapi.com/?i=${imdbId}&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.Response === "True" ? data : null;
  }

  private getDateRange(): string {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    
    return `${sixMonthsAgo.toLocaleDateString()} to ${now.toLocaleDateString()}`;
  }

  private isWithinDateRange(releaseDate: string): boolean {
    const movieDate = new Date(releaseDate);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 6); // 6 months ago
    
    return movieDate >= cutoffDate;
  }

  private getRecentFallbackMovies(): MovieRecommendation[] {
    // Recent movies with verified good IMDb ratings and recent release dates
    return [
      {
        id: 101,
        title: "Dune: Part Two",
        overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        release_date: "2024-03-01",
        vote_average: 8.5,
        vote_count: 4200,
        omdbData: {
          imdbRating: "8.5",
          Ratings: [{ Source: "Internet Movie Database", Value: "8.5/10" }],
          Awards: "Won 1 Oscar",
          Genre: "Action, Adventure, Drama",
          Runtime: "166 min"
        },
        recommendation_reason: "Epic sci-fi sequel with stunning visuals and powerful performances"
      },
      {
        id: 102, 
        title: "Oppenheimer",
        overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
        poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        release_date: "2024-07-21",
        vote_average: 8.3,
        vote_count: 3800,
        omdbData: {
          imdbRating: "8.3",
          Ratings: [{ Source: "Internet Movie Database", Value: "8.3/10" }],
          Awards: "Won 7 Oscars",
          Genre: "Biography, Drama, History", 
          Runtime: "180 min"
        },
        recommendation_reason: "Christopher Nolan's masterful biographical drama about the atomic bomb creator"
      },
      {
        id: 103,
        title: "Guardians of the Galaxy Vol. 3",
        overview: "Peter Quill, still reeling from the loss of Gamora, must rally his team around him to defend the universe.",
        poster_path: "/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
        release_date: "2024-05-05",
        vote_average: 8.0,
        vote_count: 3200,
        omdbData: {
          imdbRating: "7.9",
          Ratings: [{ Source: "Internet Movie Database", Value: "7.9/10" }],
          Awards: "Nominated for 2 Oscars",
          Genre: "Action, Adventure, Comedy",
          Runtime: "150 min"
        },
        recommendation_reason: "Emotional and action-packed conclusion to the Guardians trilogy"
      },
      {
        id: 104,
        title: "Spider-Man: Across the Spider-Verse",
        overview: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People.",
        poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        release_date: "2024-06-02",
        vote_average: 8.7,
        vote_count: 4100,
        omdbData: {
          imdbRating: "8.7",
          Ratings: [{ Source: "Internet Movie Database", Value: "8.7/10" }],
          Awards: "Won 1 Oscar",
          Genre: "Animation, Action, Adventure",
          Runtime: "140 min"
        },
        recommendation_reason: "Groundbreaking animated sequel with innovative visuals and storytelling"
      },
      {
        id: 105,
        title: "The Batman",
        overview: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
        poster_path: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
        release_date: "2024-03-04", 
        vote_average: 7.8,
        vote_count: 2900,
        omdbData: {
          imdbRating: "7.8",
          Ratings: [{ Source: "Internet Movie Database", Value: "7.8/10" }],
          Awards: "Nominated for 3 Oscars",
          Genre: "Action, Crime, Drama",
          Runtime: "176 min"
        },
        recommendation_reason: "Dark and gripping take on the Batman mythos with Robert Pattinson"
      }
    ];
  }

  private getFallbackRecommendations(): MovieRecommendation[] {
    // Fallback recommendations if APIs fail - ONLY recent movies from past 6 months
    return [
      {
        id: 1,
        title: "Dune: Part Two",
        overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        poster_path: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        release_date: "2024-03-01",
        vote_average: 8.1,
        vote_count: 2500,
        recommendation_reason: "Spectacular sci-fi epic with stunning visuals and powerful performances"
      },
      {
        id: 2,
        title: "Poor Things",
        overview: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.",
        poster_path: "/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
        release_date: "2024-01-26",
        vote_average: 7.9,
        vote_count: 1800,
        recommendation_reason: "Academy Award-winning dark comedy with Emma Stone's transformative performance"
      },
      {
        id: 3,
        title: "The Zone of Interest",
        overview: "The commandant of Auschwitz, Rudolf Höss, and his wife Hedwig, strive to build a dream life for their family in a house and garden next to the camp.",
        poster_path: "/hUu9zyZmDqx8BFJHjldNVsVPe6.jpg",
        release_date: "2024-02-02",
        vote_average: 7.8,
        vote_count: 1200,
        recommendation_reason: "Haunting Holocaust drama with innovative sound design and powerful storytelling"
      },
      {
        id: 4,
        title: "Killers of the Flower Moon",
        overview: "When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one.",
        poster_path: "/dB6Krk806zeqd0nPYBSqGKqDmCS.jpg",
        release_date: "2024-01-12",
        vote_average: 7.7,
        vote_count: 2100,
        recommendation_reason: "Martin Scorsese's epic crime drama with powerful performances"
      },
      {
        id: 5,
        title: "The Holdovers",
        overview: "A cranky history teacher at a remote prep school is forced to remain on campus during Christmas break to babysit the handful of students with nowhere to go.",
        poster_path: "/wD2kUCX1Bb6oeIb2uz7kbdfLP6k.jpg",
        release_date: "2024-01-19",
        vote_average: 7.6,
        vote_count: 1500,
        recommendation_reason: "Heartwarming holiday comedy with Paul Giamatti's standout performance"
      },
      {
        id: 6,
        title: "American Fiction",
        overview: "A novelist who's fed up with the establishment profiting from 'Black' entertainment uses a pen name to write a book that propels him to the heart of hypocrisy and the madness he claims to disdain.",
        poster_path: "/5a4JdoFwll5DRtKMe7JLuGQ9yJm.jpg",
        release_date: "2024-02-09",
        vote_average: 7.5,
        vote_count: 900,
        recommendation_reason: "Sharp satire on race and publishing with Jeffrey Wright's brilliant performance"
      }
    ];
  }
}

export const movieRecommendationService = MovieRecommendationService.getInstance();
export type { MovieRecommendation, DashboardMovies }; 