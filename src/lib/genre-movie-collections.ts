// Genre-based movie collections with TMDB/OMDB API integration for real posters

interface GenreMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_primary: string;
  imdb_id?: string;
  omdbData?: {
    imdbRating: string;
    Ratings: Array<{ Source: string; Value: string }>;
    Awards: string;
    Genre: string;
    Runtime: string;
  };
}

interface MoodPlaylist {
  title: string;
  description: string;
  movieCount: string;
  genre: string;
  genreKeys: string[];
  movies: GenreMovie[];
}

interface MovieSearchResult {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

class GenreMovieCollections {
  private static instance: GenreMovieCollections;
  private movieCache: Map<string, GenreMovie[]> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private cacheTimestamps: Map<string, number> = new Map();

  static getInstance(): GenreMovieCollections {
    if (!GenreMovieCollections.instance) {
      GenreMovieCollections.instance = new GenreMovieCollections();
    }
    return GenreMovieCollections.instance;
  }

  // Simple hash function for deterministic seeding
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Deterministic shuffle using seed for SSR consistency
  private deterministicShuffle<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    let currentSeed = seed;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Generate pseudo-random number using seed
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      const j = Math.floor((currentSeed / 233280) * (i + 1));
      
      // Swap elements
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }

  // Movie lists by genre with years for better API matching
  private readonly movieLists = {
    comedy: [
      { title: "The Secret Life of Walter Mitty", year: "2013" },
      { title: "La La Land", year: "2016" },
      { title: "The Grand Budapest Hotel", year: "2014" },
      { title: "Paddington", year: "2014" },
      { title: "About Time", year: "2013" },
      { title: "The Pursuit of Happyness", year: "2006" },
      { title: "Chef", year: "2014" },
      { title: "Julie & Julia", year: "2009" },
      { title: "Forrest Gump", year: "1994" },
      { title: "Good Will Hunting", year: "1997" },
      { title: "The Intern", year: "2015" },
      { title: "Little Miss Sunshine", year: "2006" },
      { title: "The Big Lebowski", year: "1998" },
      { title: "Groundhog Day", year: "1993" },
      { title: "Bridesmaids", year: "2011" },
      { title: "Superbad", year: "2007" },
      { title: "The Hangover", year: "2009" },
      { title: "Mean Girls", year: "2004" },
      { title: "Napoleon Dynamite", year: "2004" },
      { title: "Zoolander", year: "2001" }
    ],
    action: [
      { title: "John Wick: Chapter 4", year: "2023" },
      { title: "Top Gun: Maverick", year: "2022" },
      { title: "Mad Max: Fury Road", year: "2015" },
      { title: "Mission: Impossible - Dead Reckoning", year: "2023" },
      { title: "The Dark Knight", year: "2008" },
      { title: "Gladiator", year: "2000" },
      { title: "The Matrix", year: "1999" },
      { title: "Spider-Man: No Way Home", year: "2021" },
      { title: "Avengers: Endgame", year: "2019" },
      { title: "Casino Royale", year: "2006" },
      { title: "Fast Five", year: "2011" },
      { title: "The Bourne Identity", year: "2002" },
      { title: "Die Hard", year: "1988" },
      { title: "Terminator 2: Judgment Day", year: "1991" },
      { title: "Indiana Jones and the Raiders of the Lost Ark", year: "1981" },
      { title: "The Rock", year: "1996" },
      { title: "Speed", year: "1994" },
      { title: "Lethal Weapon", year: "1987" },
      { title: "Predator", year: "1987" },
      { title: "Aliens", year: "1986" }
    ],
    romance: [
      { title: "Anyone But You", year: "2023" },
      { title: "The Notebook", year: "2004" },
      { title: "Pride and Prejudice", year: "2005" },
      { title: "Titanic", year: "1997" },
      { title: "Casablanca", year: "1942" },
      { title: "When Harry Met Sally", year: "1989" },
      { title: "Roman Holiday", year: "1953" },
      { title: "Sleepless in Seattle", year: "1993" },
      { title: "The Princess Bride", year: "1987" },
      { title: "You've Got Mail", year: "1998" },
      { title: "10 Things I Hate About You", year: "1999" },
      { title: "Love Actually", year: "2003" },
      { title: "Notting Hill", year: "1999" },
      { title: "Pretty Woman", year: "1990" },
      { title: "Dirty Dancing", year: "1987" },
      { title: "Breakfast at Tiffany's", year: "1961" },
      { title: "Gone with the Wind", year: "1939" },
      { title: "An Affair to Remember", year: "1957" },
      { title: "The Way We Were", year: "1973" },
      { title: "Ghost", year: "1990" }
    ],
    horror: [
      { title: "Scream VI", year: "2023" },
      { title: "The Exorcist", year: "1973" },
      { title: "Halloween", year: "1978" },
      { title: "A Nightmare on Elm Street", year: "1984" },
      { title: "Get Out", year: "2017" },
      { title: "Hereditary", year: "2018" },
      { title: "The Conjuring", year: "2013" },
      { title: "It", year: "2017" },
      { title: "The Shining", year: "1980" },
      { title: "Psycho", year: "1960" },
      { title: "The Babadook", year: "2014" },
      { title: "Midsommar", year: "2019" }
    ],
    drama: [
      { title: "The Shawshank Redemption", year: "1994" },
      { title: "The Godfather", year: "1972" },
      { title: "Pulp Fiction", year: "1994" },
      { title: "Fight Club", year: "1999" },
      { title: "Inception", year: "2010" },
      { title: "The Silence of the Lambs", year: "1991" },
      { title: "Schindler's List", year: "1993" },
      { title: "The Green Mile", year: "1999" },
      { title: "The Departed", year: "2006" },
      { title: "No Country for Old Men", year: "2007" },
      { title: "There Will Be Blood", year: "2007" },
      { title: "The Social Network", year: "2010" }
    ]
  };

  // Search TMDB for movie data
  private async searchTMDBMovie(title: string, year: string): Promise<MovieSearchResult | null> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      if (!apiKey) {
        console.error('TMDB API key not found');
        return null;
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&year=${year}&page=1`
      );

      if (!response.ok) {
        console.error(`TMDB search failed for ${title}: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return data.results?.[0] || null;
    } catch (error) {
      console.error(`Error searching TMDB for ${title}:`, error);
      return null;
    }
  }

  // Get OMDB data for additional ratings
  private async getOMDBData(imdbId: string): Promise<GenreMovie['omdbData'] | null> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OMDB_API_KEY;
      if (!apiKey) {
        console.error('OMDB API key not found');
        return null;
      }

      const response = await fetch(
        `http://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`
      );

      if (!response.ok) {
        console.error(`OMDB request failed for ${imdbId}: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return data.Response === "True" ? data : null;
    } catch (error) {
      console.error(`Error fetching OMDB data for ${imdbId}:`, error);
      return null;
    }
  }

  // Get TMDB movie details with IMDB ID
  private async getTMDBMovieDetails(movieId: number): Promise<{ imdb_id?: string } | null> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      if (!apiKey) return null;

      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
      );

      if (!response.ok) return null;

      const data = await response.json();
      return { imdb_id: data.imdb_id };
    } catch (error) {
      console.error(`Error fetching TMDB details for ${movieId}:`, error);
      return null;
    }
  }

  // Load movies for a specific genre with real API data
  private async loadMoviesForGenre(genre: string): Promise<GenreMovie[]> {
    const cacheKey = `genre_${genre}`;
    const now = Date.now();
    const cacheTime = this.cacheTimestamps.get(cacheKey) || 0;

    // Return cached data if still valid
    if (now - cacheTime < this.CACHE_DURATION) {
      const cached = this.movieCache.get(cacheKey);
      if (cached) return cached;
    }

    const movieList = this.movieLists[genre as keyof typeof this.movieLists] || [];
    const movies: GenreMovie[] = [];

    console.log(`Loading ${movieList.length} movies for genre: ${genre}`);

    for (const movieInfo of movieList) {
      try {
        // Search TMDB first
        const tmdbResult = await this.searchTMDBMovie(movieInfo.title, movieInfo.year);
        
        if (tmdbResult && tmdbResult.poster_path) {
          // Get additional details including IMDB ID
          const details = await this.getTMDBMovieDetails(tmdbResult.id);
          let omdbData = null;

          // If we have IMDB ID, get OMDB data
          if (details?.imdb_id) {
            omdbData = await this.getOMDBData(details.imdb_id);
          }

                     const movie: GenreMovie = {
             id: tmdbResult.id,
             title: tmdbResult.title,
             overview: tmdbResult.overview,
             poster_path: tmdbResult.poster_path, // This will be prefixed with TMDB base URL
             release_date: tmdbResult.release_date,
             vote_average: tmdbResult.vote_average,
             genre_primary: genre.charAt(0).toUpperCase() + genre.slice(1),
             imdb_id: details?.imdb_id,
             omdbData: omdbData || undefined
           };

          movies.push(movie);
        } else {
          console.warn(`No TMDB result found for ${movieInfo.title} (${movieInfo.year})`);
        }
      } catch (error) {
        console.error(`Error processing ${movieInfo.title}:`, error);
      }
    }

    // Cache the results
    this.movieCache.set(cacheKey, movies);
    this.cacheTimestamps.set(cacheKey, now);

    console.log(`Loaded ${movies.length} movies for ${genre} genre`);
    return movies;
  }

  // Get movies for a specific mood/genre
  async getMoviesForMood(moodKey: string, count: number = 4): Promise<GenreMovie[]> {
    let genre: string;

    switch (moodKey.toLowerCase()) {
      case 'feeling-sad':
      case 'feelgood':
      case 'uplifting':
        genre = 'comedy';
        break;
      case 'action-night':
      case 'action':
      case 'thriller':
        genre = 'action';
        break;
      case 'romance-evening':
      case 'romance':
      case 'romantic':
        genre = 'romance';
        break;
      case 'horror-marathon':
      case 'horror':
      case 'scary':
        genre = 'horror';
        break;
      case 'laugh-therapy':
      case 'comedy':
      case 'funny':
        genre = 'comedy';
        break;
      default:
        genre = 'drama';
    }

    const movies = await this.loadMoviesForGenre(genre);
    const today = new Date().toDateString();
    const seed = this.hashCode(today + genre); // Add genre to make it unique
    const shuffled = this.deterministicShuffle([...movies], seed);
    return shuffled.slice(0, count);
  }

  // Get all mood playlists with real movie data - ensuring no duplicates across moods
  async getAllMoodPlaylists(): Promise<MoodPlaylist[]> {
    const [comedyMovies, actionMovies, romanceMovies, horrorMovies, dramaMovies] = await Promise.all([
      this.loadMoviesForGenre('comedy'),
      this.loadMoviesForGenre('action'),
      this.loadMoviesForGenre('romance'),
      this.loadMoviesForGenre('horror'),
      this.loadMoviesForGenre('drama')
    ]);

    // Use deterministic shuffling based on current date to ensure SSR consistency
    const today = new Date().toDateString();
    const seed = this.hashCode(today);
    
    const shuffledComedy = this.deterministicShuffle([...comedyMovies], seed);
    const shuffledAction = this.deterministicShuffle([...actionMovies], seed + 1);
    const shuffledRomance = this.deterministicShuffle([...romanceMovies], seed + 2);
    const shuffledHorror = this.deterministicShuffle([...horrorMovies], seed + 3);
    const shuffledDrama = this.deterministicShuffle([...dramaMovies], seed + 4);

    // Split comedy movies between "Feeling Sad" and "Laugh Therapy" to avoid duplicates
    const feelingSadMovies = shuffledComedy.slice(0, 4);
    const laughTherapyMovies = shuffledComedy.slice(4, 8);

    // If we don't have enough comedy movies, supplement with drama movies
    if (laughTherapyMovies.length < 4) {
      const neededDrama = 4 - laughTherapyMovies.length;
      laughTherapyMovies.push(...shuffledDrama.slice(0, neededDrama));
    }

    // Ensure "Feeling Sad" gets a mix of comedy and drama for variety
    if (feelingSadMovies.length < 4) {
      const neededDrama = 4 - feelingSadMovies.length;
      feelingSadMovies.push(...shuffledDrama.slice(0, neededDrama));
    }

    // Create a set to track used movie IDs and ensure no duplicates across all playlists
    const usedMovieIds = new Set<number>();
    
    const addUniqueMovies = (movies: GenreMovie[], count: number): GenreMovie[] => {
      const uniqueMovies: GenreMovie[] = [];
      for (const movie of movies) {
        if (uniqueMovies.length >= count) break;
        if (!usedMovieIds.has(movie.id)) {
          uniqueMovies.push(movie);
          usedMovieIds.add(movie.id);
        }
      }
      return uniqueMovies;
    };

    return [
      {
        title: "Feeling Sad",
        description: "A curated list of uplifting movies to brighten your mood",
        movieCount: `${comedyMovies.length} movies`,
        genre: "Feel-good, Comedy, Drama",
        genreKeys: ['feeling-sad', 'feelgood', 'uplifting'],
        movies: addUniqueMovies([...feelingSadMovies, ...shuffledDrama], 4)
      },
      {
        title: "Action Night",
        description: "High-octane thrillers and action-packed adventures",
        movieCount: `${actionMovies.length} movies`,
        genre: "Action, Thriller, Adventure",
        genreKeys: ['action-night', 'action', 'thriller'],
        movies: addUniqueMovies(shuffledAction, 4)
      },
      {
        title: "Romance Evening",
        description: "Heartwarming love stories and romantic comedies",
        movieCount: `${romanceMovies.length} movies`,
        genre: "Romance, Comedy, Drama",
        genreKeys: ['romance-evening', 'romance', 'romantic'],
        movies: addUniqueMovies(shuffledRomance, 4)
      },
      {
        title: "Horror Marathon",
        description: "Spine-chilling horror films for the brave",
        movieCount: `${horrorMovies.length} movies`,
        genre: "Horror, Thriller, Mystery",
        genreKeys: ['horror-marathon', 'horror', 'scary'],
        movies: addUniqueMovies(shuffledHorror, 4)
      },
      {
        title: "Laugh Therapy",
        description: "Comedy classics guaranteed to make you laugh",
        movieCount: `${comedyMovies.length} movies`,
        genre: "Comedy, Satire, Feel-good",
        genreKeys: ['laugh-therapy', 'comedy', 'funny'],
        movies: addUniqueMovies([...laughTherapyMovies, ...shuffledDrama], 4)
      }
    ];
  }

  // Refresh playlists with new random selections - maintaining uniqueness
  async refreshPlaylist(playlistTitle: string): Promise<MoodPlaylist | null> {
    const playlists = await this.getAllMoodPlaylists();
    const playlist = playlists.find(p => p.title === playlistTitle);
    
    if (playlist) {
      // Get all current movie IDs to avoid duplicates
      const currentMovieIds = new Set<number>();
      playlists.forEach(p => {
        if (p.title !== playlistTitle) {
          p.movies.forEach(movie => currentMovieIds.add(movie.id));
        }
      });

      // Get new movies for this playlist
      const moodKey = playlist.genreKeys[0];
      const newMovies = await this.getMoviesForMood(moodKey, 8); // Get more to filter from
      
      // Filter out movies that are already used in other playlists
      const uniqueMovies = newMovies.filter(movie => !currentMovieIds.has(movie.id));
      playlist.movies = uniqueMovies.slice(0, 4);
    }
    
    return playlist || null;
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.movieCache.clear();
    this.cacheTimestamps.clear();
  }
}

export const genreMovieCollections = GenreMovieCollections.getInstance();
export type { GenreMovie, MoodPlaylist }; 