"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { RecentTopReleases } from "@/components/dashboard/recent-top-releases";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Search, 
  User, 
  FolderPlus, 
  Star, 
  Film,
  Heart,
  Zap,
  Sparkles,
  Mic,
  Send,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { markFirstLibrary } from "@/lib/progress-tracker";
import { movieRecommendationService, type MovieRecommendation, type DashboardMovies } from "@/lib/movie-recommendations";
import { genreMovieCollections, type MoodPlaylist } from "@/lib/genre-movie-collections";

interface ProfileQuestion {
  id: string;
  title: string;
  description: string;
  options: string[];
  multiSelect: boolean;
}

interface PersonalityProfile {
  nickname: string;
  description: string;
  personality_traits: string[];
  movie_style: string;
}

// Extended MovieRecommendation interface for AI search results
interface ExtendedMovieRecommendation extends MovieRecommendation {
  reason?: string;
  genre?: string;
  year?: string;
}

// Using MovieRecommendation interface from the service

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showProfileBuilder, setShowProfileBuilder] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [recentMovies, setRecentMovies] = useState<MovieRecommendation[]>([]);
  const [moodPlaylists, setMoodPlaylists] = useState<MoodPlaylist[]>([]);
  const [moodPlaylistsLoaded, setMoodPlaylistsLoaded] = useState(false);
  
  // Ask for Movies section state
  const [showMovieBottomSheet, setShowMovieBottomSheet] = useState(false);
  const [movieQuery, setMovieQuery] = useState("");
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");
  const [isSearchingMovies, setIsSearchingMovies] = useState(false);
  const [movieSearchResults, setMovieSearchResults] = useState<ExtendedMovieRecommendation[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize dashboard movie service
    movieRecommendationService.initializeDashboard();
    
    // Subscribe to movie updates
    const unsubscribe = movieRecommendationService.subscribe((movies: DashboardMovies) => {
      setRecentMovies(movies.recentWatched);
      setLoading(false);
    });
    
    // Load initial data
    loadDashboardData();
    
    // Load mood playlists with real API data - client side only
    const loadMoodPlaylists = async () => {
      try {
        const playlists = await genreMovieCollections.getAllMoodPlaylists();
        setMoodPlaylists(playlists);
        setMoodPlaylistsLoaded(true);
      } catch (error) {
        console.error('Error loading mood playlists:', error);
      }
    };
    loadMoodPlaylists();
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load recent movies
      await loadRecentMovies();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshMoodPlaylists = async () => {
    // Refresh all playlists with new random movies
    try {
      const playlists = await genreMovieCollections.getAllMoodPlaylists();
      setMoodPlaylists(playlists);
    } catch (error) {
      console.error('Error refreshing mood playlists:', error);
    }
  };

  const loadRecentMovies = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=1`
      );
      const data = await response.json();
      setRecentMovies(data.results.slice(0, 6));
    } catch (error) {
      console.error('Error loading recent movies:', error);
    }
  };

  const [greeting, setGreeting] = useState("Good morning");

  // Set greeting on client side only to avoid hydration mismatch
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const getGreeting = () => greeting;

  const getSubGreeting = () => {
    if (personalityProfile) {
      return `Welcome back, ${personalityProfile.nickname}!`;
    }
    return "Ready to discover your next favorite movie?";
  };

  const profileQuestions: ProfileQuestion[] = [
    {
      id: "genres",
      title: "What genres do you love?",
      description: "Select all that apply",
      options: ["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi", "Thriller", "Documentary"],
      multiSelect: true
    },
    {
      id: "watchHabits",
      title: "How do you discover movies?",
      description: "Choose your preferred method",
      options: ["IMDB Top 250", "Hidden Gems", "New Releases", "Friend Recommendations", "Critic Reviews"],
      multiSelect: true
    },
    {
      id: "mood",
      title: "What mood are you usually in when watching?",
      description: "Select your typical mood",
      options: ["Relaxed", "Excited", "Thoughtful", "Social", "Escapist"],
      multiSelect: true
    }
  ];

  const handleOptionToggle = (questionId: string, option: string) => {
    setSelectedOptions(prev => {
      const current = prev[questionId] || [];
      const updated = current.includes(option)
        ? current.filter(item => item !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < profileQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleCompleteProfile = async () => {
    try {
      const profile = await generatePersonalityProfile(selectedOptions);
      setPersonalityProfile(profile);
      setShowProfileBuilder(false);
      // Mark first library as completed
      markFirstLibrary();
    } catch (error) {
      console.error('Error generating personality profile:', error);
      // Fallback to local generation
      const fallbackProfile = generateLocalPersonality(selectedOptions);
      setPersonalityProfile(fallbackProfile);
      setShowProfileBuilder(false);
      markFirstLibrary();
    }
  };

  const generatePersonalityProfile = async (selections: Record<string, string[]>) => {
    try {
      const prompt = `Based on these movie preferences, create a fun and engaging personality profile:

Genres: ${selections.genres?.join(', ') || 'None selected'}
Watch Habits: ${selections.watchHabits?.join(', ') || 'None selected'}
Mood: ${selections.mood?.join(', ') || 'None selected'}

Please respond with a JSON object in this exact format:
{
  "nickname": "Creative nickname based on preferences",
  "description": "Fun description of their movie personality",
  "personality_traits": ["trait1", "trait2", "trait3"],
  "movie_style": "Description of their movie watching style"
}

Make it fun, creative, and personalized to their selections. The nickname should be memorable and reflect their preferences. Be creative with the personality traits and make the description engaging.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a creative movie personality generator. Generate fun, engaging, and personalized movie personality profiles based on user preferences.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`Failed to generate personality profile: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Unexpected OpenAI API response:', data);
        throw new Error('Invalid response from OpenAI API');
      }
      
      const generatedText = data.choices[0].message.content;
      
      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        console.error('No JSON found in OpenAI response:', generatedText);
        throw new Error('No valid JSON in OpenAI response');
      }
    } catch (error) {
      console.error('Error generating personality profile:', error);
      throw error; // Re-throw to trigger fallback
    }
  };

  const generateLocalPersonality = (selections: Record<string, string[]>) => {
    const genres = selections.genres || [];
    const watchHabits = selections.watchHabits || [];
    
    // Simple logic to determine personality type
    let nickname = "Movie Enthusiast";
    let description = "You have a diverse taste in movies and love exploring different genres and styles.";
    let traits = ["Adventurous", "Open-minded", "Curious"];
    let style = "You enjoy a variety of cinematic experiences";
    
    // Genre-based nicknames
    if (genres.includes("Horror")) {
      nickname = "Horror Hound";
      description = "You love the thrill of scary movies and enjoy being on the edge of your seat.";
      traits = ["Brave", "Thrill-seeking", "Adventurous"];
      style = "You prefer intense, spine-chilling experiences";
    } else if (genres.includes("Comedy")) {
      nickname = "Comedy Connoisseur";
      description = "You have a great sense of humor and love films that make you laugh.";
      traits = ["Cheerful", "Optimistic", "Fun-loving"];
      style = "You enjoy feel-good, entertaining experiences";
    } else if (genres.includes("Action") || genres.includes("Adventure")) {
      nickname = "Action Aficionado";
      description = "You crave excitement and love high-energy, adrenaline-pumping films.";
      traits = ["Energetic", "Bold", "Dynamic"];
      style = "You prefer fast-paced, thrilling experiences";
    } else if (genres.includes("Drama")) {
      nickname = "Drama Devotee";
      description = "You appreciate deep, meaningful stories that touch your heart and mind.";
      traits = ["Thoughtful", "Emotional", "Reflective"];
      style = "You enjoy profound, character-driven experiences";
    }
    
    // Watch habits influence
    if (watchHabits.includes("Hidden Gems")) {
      nickname = "Cult Classic Collector";
      description = "You have a taste for the unique and love discovering underrated masterpieces.";
      traits = ["Explorer", "Individualistic", "Curious"];
      style = "You enjoy discovering hidden cinematic treasures";
    } else if (watchHabits.includes("IMDB Top 250")) {
      nickname = "Cinema Connoisseur";
      description = "You appreciate the finest films and have a deep love for cinematic excellence.";
      traits = ["Discerning", "Appreciative", "Knowledgeable"];
      style = "You enjoy the best that cinema has to offer";
    }
    
    return {
      nickname,
      description,
      personality_traits: traits,
      movie_style: style
    };
  };

  const actionCards = [
    {
      title: "Build Your Flick Profile",
      description: "Create your personalized movie profile and get better recommendations.",
      icon: User,
      buttonText: "Build Profile",
      onClick: () => router.push('/dashboard/profile')
    },
    {
      title: "Search for Movies",
      description: "Discover new films, check ratings, and find your next favorite movie.",
      icon: Search,
      buttonText: "Search Movies",
      onClick: () => router.push('/dashboard/flick-search')
    },
    {
      title: "Create Your Library",
      description: "Organize your movies into custom folders and collections.",
      icon: FolderPlus,
      buttonText: "Create Library",
      onClick: () => router.push('/dashboard/library')
    }
  ];

  // Suggestion cards for Ask for Movies section
  const movieSuggestionCards = [
    "90s Bollywood hits",
    "French New Wave classics",
    "Mind-bending sci-fi",
    "Cozy autumn movies",
    "Korean thrillers",
    "80s horror gems",
    "Feel-good comedies",
    "Epic fantasy adventures"
  ];

  // Function to search for movies using AI
  const searchMoviesWithAI = async (query: string) => {
    setIsSearchingMovies(true);
    setSearchError(null);
    setMovieSearchResults([]); // Clear previous results immediately
    setLastSearchedQuery(query); // Store the query being searched
    try {
      // Debug: Check if API keys are available
      if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        console.error('OpenAI API key is missing');
        throw new Error('OpenAI API key is not configured');
      }
      
      if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
        console.error('TMDB API key is missing');
        throw new Error('TMDB API key is not configured');
      }

      console.log('Starting AI movie search for:', query);
      console.log('OpenAI API key available:', !!process.env.NEXT_PUBLIC_OPENAI_API_KEY);
      console.log('TMDB API key available:', !!process.env.NEXT_PUBLIC_TMDB_API_KEY);

      const prompt = `Based on this movie request: "${query}"

Please recommend exactly 8 movies that match this request. For each movie, provide:
- Exact title (must match TMDB exactly)
- Year
- Brief reason why it fits the request (1-2 sentences)
- Primary genre

Format as JSON array:
[
  {
    "title": "Movie Title",
    "year": "2020",
    "reason": "Brief explanation why this fits the request",
    "genre": "Primary genre"
  }
]

Focus on popular, well-known movies that are likely to be in movie databases. Prioritize quality and relevance to the request.`;

      console.log('Making OpenAI API request...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a movie recommendation expert. Provide accurate, relevant movie suggestions based on user requests.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      console.log('OpenAI response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('OpenAI response received:', data);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid OpenAI response structure:', data);
        throw new Error('Invalid response from OpenAI API');
      }
      
      const aiRecommendations = JSON.parse(data.choices[0].message.content);
      console.log('AI recommendations parsed:', aiRecommendations);

      // Enrich AI recommendations with TMDB data
      const enrichedMovies: ExtendedMovieRecommendation[] = [];
      
      console.log('Starting TMDB enrichment for', aiRecommendations.length, 'movies');
      
      for (const rec of aiRecommendations) {
        try {
          console.log('Searching TMDB for:', rec.title, rec.year);
          
          // Search TMDB for the movie
          const tmdbResponse = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(rec.title)}&year=${rec.year}`
          );
          
          if (!tmdbResponse.ok) {
            console.error(`TMDB API error for ${rec.title}:`, tmdbResponse.status);
            continue;
          }
          
          const tmdbData = await tmdbResponse.json();
          console.log(`TMDB results for ${rec.title}:`, tmdbData.results?.length || 0);
          
          if (tmdbData.results && tmdbData.results.length > 0) {
            const movie = tmdbData.results[0];
            enrichedMovies.push({
              id: movie.id,
              title: movie.title,
              overview: movie.overview,
              poster_path: movie.poster_path,
              release_date: movie.release_date,
              vote_average: movie.vote_average,
              vote_count: movie.vote_count,
              reason: rec.reason,
              genre: rec.genre,
              year: rec.year
            });
            console.log('Successfully enriched:', movie.title);
          } else {
            console.log('No TMDB results found for:', rec.title);
          }
        } catch (error) {
          console.error(`Error fetching TMDB data for ${rec.title}:`, error);
        }
      }
      
      console.log('Final enriched movies count:', enrichedMovies.length);
      
      setMovieSearchResults(enrichedMovies);
    } catch (error) {
      console.error('Error searching movies with AI:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSearchError(errorMessage);
      setMovieSearchResults([]);
    } finally {
      setIsSearchingMovies(false);
    }
  };

  // Handle suggestion card click
  const handleSuggestionClick = (suggestion: string) => {
    setMovieQuery(`Show me ${suggestion.toLowerCase()}`);
    setShowMovieBottomSheet(true);
    searchMoviesWithAI(`Show me ${suggestion.toLowerCase()}`);
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (movieQuery.trim()) {
      setShowMovieBottomSheet(true);
      searchMoviesWithAI(movieQuery.trim());
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-3 mt-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Profile Builder Widget
  if (showProfileBuilder) {
    const currentQuestion = profileQuestions[currentQuestionIndex];
    const currentSelections = selectedOptions[currentQuestion.id] || [];
    const canProceed = currentSelections.length > 0;

    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Tell Us What You Like</h1>
              <p className="text-muted-foreground mt-1">
                Help us build your personalized movie profile
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{currentQuestion.title}</CardTitle>
                    <p className="text-muted-foreground mt-1">{currentQuestion.description}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentQuestionIndex + 1} of {profileQuestions.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.options.map((option) => {
                    const isSelected = currentSelections.includes(option);
                    return (
                      <Badge
                        key={option}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                        onClick={() => handleOptionToggle(currentQuestion.id, option)}
                      >
                        {option}
                      </Badge>
                    );
                  })}
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  {currentQuestionIndex === profileQuestions.length - 1 ? (
                    <Button onClick={handleCompleteProfile} disabled={!canProceed}>
                      Complete Profile
                    </Button>
                  ) : (
                    <Button onClick={handleNext} disabled={!canProceed}>
                      Next
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 bg-neutral-950 min-h-screen overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            {user ? `${getGreeting()}, ${user.email?.split('@')[0] || 'Movie Lover'}!` : 'Welcome to Good Flicks'}
          </h1>
          <p className="text-neutral-400 mt-1">{getSubGreeting()}</p>
        </div>

        {/* Login/Signup Card for Non-Authenticated Users */}
        {!user && (
          <div className="mb-8">
            <Card className="bg-gradient-to-br from-neutral-800 to-neutral-900 border-neutral-700">
              <CardContent className="px-6 py-3">
                <div className="text-center">
                  <div className="w-16 h-16 bg-neutral-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Unlock Your Movie Journey
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>AI-powered movie recommendations</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>Save and organize your favorite movies</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span>Discover hidden gems and classics</span>
                    </div>
                  </div>
                  <Button 
                    className="mt-6 bg-white hover:bg-gray-100 text-black font-medium px-8 py-3 rounded-full"
                    onClick={() => router.push('/auth')}
                  >
                    Login / Sign Up
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Getting Started Section - Only for Authenticated Users */}
        {user && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Getting Started</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
              {actionCards.map((card, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-start justify-start p-4 rounded-lg cursor-pointer transition-all flex-shrink-0 bg-neutral-800 hover:bg-neutral-700"
                  style={{ width: '200px' }}
                  onClick={card.onClick}
                >
                  <div className="mb-3">
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-sm mb-1 text-white">
                      {card.title}
                    </h4>
                    <p className="text-xs text-gray-300">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Top Releases */}
        <div className="mb-8">
          <RecentTopReleases />
        </div>

        {/* Done Your Mode */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Done Your Mode</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {!moodPlaylistsLoaded ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-80 bg-neutral-800 rounded-lg overflow-hidden">
                  <div className="p-4">
                    <div className="h-6 bg-neutral-700 rounded mb-2"></div>
                    <div className="h-4 bg-neutral-700 rounded mb-3"></div>
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, movieIndex) => (
                        <div key={movieIndex} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-12 h-16 bg-neutral-700 rounded"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-neutral-700 rounded mb-1"></div>
                            <div className="h-3 bg-neutral-700 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              moodPlaylists.map((playlist, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 bg-neutral-800 rounded-lg overflow-hidden cursor-pointer hover:bg-neutral-700 transition-colors"
                onClick={() => router.push(`/dashboard/flick-search?playlist=${playlist.title.toLowerCase().replace(/\s+/g, '-')}`)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold text-lg truncate">
                      {playlist.title}
                    </h3>
                    <p className="text-neutral-400 text-sm flex-shrink-0 ml-2">
                      {playlist.movieCount}
                    </p>
                  </div>
                  <p className="text-neutral-300 text-xs leading-relaxed mb-3">
                    {playlist.description}
                  </p>
                  
                  <div className="space-y-3">
                    {playlist.movies.slice(0, 3).map((movie, movieIndex) => (
                      <div key={`${playlist.title}-${movieIndex}`} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-12 h-16 bg-neutral-700 rounded overflow-hidden">
                          <img
                            src={movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium truncate">
                            {movie.title}
                          </h4>
                          <p className="text-neutral-400 text-xs leading-relaxed line-clamp-2">
                            {movie.overview}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <button 
                      className="w-full bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/flick-search?playlist=${playlist.title.toLowerCase().replace(/\s+/g, '-')}`);
                      }}
                    >
                      View the entire list
                    </button>
                  </div>
                  
                  <p className="text-neutral-500 text-xs mt-3">
                    {playlist.genre}
                  </p>
                </div>
              </div>
            ))
            )}
          </div>
        </div>

                {/* Ask for Movies */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Ask for Movies</h2>
          </div>
          
          {/* Suggestion Cards Carousel */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide mb-4">
            {movieSuggestionCards.map((suggestion, index) => (
              <div
                key={index}
                className="flex-shrink-0 px-6 py-4 rounded-2xl cursor-pointer transition-all"
                style={{
                  background: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 50%, #EC4899 100%)',
                  minWidth: '160px'
                }}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 text-white mr-2" />
                  <span className="text-white font-medium text-sm whitespace-nowrap">
                    {suggestion}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              type="text"
              placeholder="Ask any way you like"
              value={movieQuery}
              onChange={(e) => setMovieQuery(e.target.value)}
              className="w-full bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 pr-12 py-6 rounded-full text-center focus:border-neutral-600"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
                disabled={!movieQuery.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Quick Genres */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Quick Genres</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Action", icon: Zap },
              { name: "Comedy", icon: Heart },
              { name: "Drama", icon: Film },
              { name: "Horror", icon: Sparkles }
            ].map((genre) => (
              <div
                key={genre.name}
                className="flex items-center p-4 rounded-lg bg-neutral-900 border-neutral-700 cursor-pointer hover:bg-neutral-800 transition-colors"
                onClick={() => router.push(`/dashboard/flick-search?genre=${genre.name}`)}
              >
                <genre.icon className="h-4 w-4 text-white mr-2" />
                <span className="text-white font-medium">{genre.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Watched */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recently Watched</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {recentMovies.slice(0, 6).map((movie) => (
              <div
                key={movie.id}
                className="flex-shrink-0 w-20"
              >
                <div className="w-20 h-32 bg-neutral-800 rounded-lg overflow-hidden mb-2">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-neutral-400 text-xs text-center px-1">
                        {movie.title}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-medium text-white truncate mb-1">
                    {movie.title}
                  </h4>
                  <div className="flex items-center gap-1">
                    <Star className="h-2 w-2 text-yellow-500" />
                    <span className="text-xs text-neutral-400">
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Movie Recommendations Bottom Sheet */}
        <Sheet open={showMovieBottomSheet} onOpenChange={(open) => {
          setShowMovieBottomSheet(open);
          if (!open) {
            setMovieQuery("");
            setLastSearchedQuery("");
            setMovieSearchResults([]);
            setSearchError(null);
          }
        }}>
          <SheetContent 
            side="bottom" 
            className="h-[80vh] bg-neutral-950 border-neutral-800 rounded-t-[24px] [&_.fixed]:bg-black/60 [&>button]:hidden"
          >
            {/* Header and Search Bar Container */}
            <div className="mx-6 py-4 space-y-3">
              {/* Header with Title and Close Button */}
              <div className="flex items-center justify-between">
                <h2 className="text-white text-lg font-semibold">
                  Ask for Movies
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMovieBottomSheet(false)}
                  className="h-8 w-8 p-0 text-neutral-400 hover:text-white bg-transparent border-none focus:bg-transparent focus:ring-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Search Bar */}
              <div>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (movieQuery.trim()) {
                  searchMoviesWithAI(movieQuery);
                }
              }} className="relative">
                <Input
                  type="text"
                  placeholder="Refine your search..."
                  value={movieQuery}
                  onChange={(e) => setMovieQuery(e.target.value)}
                  className="w-full bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 pr-12 py-6 rounded-xl focus:border-neutral-600"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Button
                    type="submit"
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
                    disabled={!movieQuery.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 px-6">
              {lastSearchedQuery && (
                <div className="mb-4">
                  <div className="text-neutral-400 text-sm">
                    {isSearchingMovies ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-neutral-400"></div>
                        {(() => {
                          const loadingTexts = [
                            "Finding the best movies for you...",
                            "Grabbing some popcorn...",
                            "Scanning movie databases...",
                            "Consulting the film critics...",
                            "Dusting off classic reels...",
                            "Mixing the perfect movie cocktail...",
                            "Searching through cinema history...",
                            "Curating your perfect watchlist..."
                          ];
                          return loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
                        })()}
                      </div>
                    ) : (
                      `Results for "${lastSearchedQuery}"`
                    )}
                  </div>
                </div>
              )}
              {searchError ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="text-red-400 text-center">
                    <p className="font-medium mb-2">Error loading recommendations</p>
                    <p className="text-sm text-neutral-400">{searchError}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchError(null);
                      if (movieQuery) {
                        searchMoviesWithAI(movieQuery);
                      }
                    }}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              ) : isSearchingMovies ? (
                <div className="space-y-4">
                  {/* Skeleton Loaders */}
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex space-x-4 p-4 bg-neutral-900 rounded-lg animate-pulse">
                      <div className="flex-shrink-0 w-16 h-24 bg-neutral-700 rounded"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-5 bg-neutral-700 rounded mb-2 w-3/4"></div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-4 bg-neutral-700 rounded w-12"></div>
                          <div className="h-4 bg-neutral-700 rounded w-16"></div>
                        </div>
                        <div className="flex gap-1 mb-2">
                          <div className="h-6 bg-neutral-700 rounded w-16"></div>
                          <div className="h-6 bg-neutral-700 rounded w-20"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-4 bg-neutral-700 rounded w-full"></div>
                          <div className="h-4 bg-neutral-700 rounded w-5/6"></div>
                        </div>
                        <div className="space-y-1 mt-2">
                          <div className="h-3 bg-neutral-700 rounded w-full"></div>
                          <div className="h-3 bg-neutral-700 rounded w-4/5"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : movieSearchResults.length > 0 ? (
                <div className="space-y-4">
                  {movieSearchResults.map((movie) => (
                    <div key={movie.id} className="flex space-x-4 p-4 bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
                      <div className="flex-shrink-0 w-16 h-24 bg-neutral-800 rounded overflow-hidden">
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="h-6 w-6 text-neutral-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-base mb-1 truncate">
                          {movie.title}
                        </h3>
                        
                        <div className="flex items-center gap-3 mb-2">
                          {movie.year && (
                            <span className="text-neutral-400 text-sm">{movie.year}</span>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-neutral-400 text-sm">
                              {movie.vote_average?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        {movie.genre && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {movie.genre.split(',').map((genre, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="text-xs border-neutral-600 text-neutral-300 px-2 py-0.5"
                              >
                                {genre.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {movie.reason && (
                          <p className="text-neutral-300 text-sm mb-2 leading-relaxed">
                            {movie.reason}
                          </p>
                        )}
                        
                        <p className="text-neutral-400 text-xs leading-relaxed line-clamp-2">
                          {movie.overview}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Film className="h-12 w-12 text-neutral-600" />
                  <p className="text-neutral-400 text-center">
                    No movies found. Try a different search query.
                  </p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </DashboardLayout>
  );
}
