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
}

export class MovieRecommendationService {
  private static instance: MovieRecommendationService;
  private cache: MovieRecommendation[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): MovieRecommendationService {
    if (!MovieRecommendationService.instance) {
      MovieRecommendationService.instance = new MovieRecommendationService();
    }
    return MovieRecommendationService.instance;
  }

  async getTopRecentMovies(): Promise<MovieRecommendation[]> {
    // Check cache first
    if (this.cache.length > 0 && Date.now() - this.lastFetch < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      // Step 1: Get movie recommendations from OpenAI
      const openAIRecommendations = await this.getOpenAIRecommendations();
      
      // Step 2: Enrich with TMDB and OMDB data
      const enrichedMovies = await this.enrichMovieData(openAIRecommendations);
      
      // Update cache
      this.cache = enrichedMovies;
      this.lastFetch = Date.now();
      
      return enrichedMovies;
    } catch (error) {
      console.error('Error fetching movie recommendations:', error);
      // Return fallback recommendations if APIs fail
      return this.getFallbackRecommendations();
    }
  }

  private async getOpenAIRecommendations(): Promise<OpenAIRecommendation[]> {
    const prompt = `You are a movie expert. Provide a list of exactly 6 top-rated movies from the past 3-4 months (${this.getDateRange()}) that have received critical acclaim, high audience ratings, or significant buzz. 

For each movie, provide:
- Exact title
- Year (2024)
- Brief reason why it's recommended (1-2 sentences)

Format as JSON array:
[
  {
    "title": "Movie Title",
    "year": "2024", 
    "reason": "Brief recommendation reason"
  }
]

Focus on movies with high ratings, awards buzz, or significant cultural impact. Include a mix of genres.`;

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

          for (const rec of recommendations.slice(0, 6)) {
      try {
        // Search TMDB for the movie
        const tmdbMovie = await this.searchTMDBMovie(rec.title, rec.year);
        
        if (tmdbMovie) {
          // Get detailed TMDB info
          const detailedMovie = await this.getTMDBMovieDetails(tmdbMovie.id);
          
          if (detailedMovie) {
            // Get OMDB data if we have IMDb ID
            let omdbData = undefined;
            if (detailedMovie.imdb_id && process.env.NEXT_PUBLIC_OMDB_API_KEY) {
              const omdbResult = await this.getOMDBData(detailedMovie.imdb_id);
              omdbData = omdbResult || undefined;
            }

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
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    
    return `${threeMonthsAgo.toLocaleDateString()} to ${now.toLocaleDateString()}`;
  }

  private getFallbackRecommendations(): MovieRecommendation[] {
    // Fallback recommendations if APIs fail
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