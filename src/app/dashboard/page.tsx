"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { RecentTopReleases } from "@/components/dashboard/recent-top-releases";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, 
  User, 
  FolderPlus, 
  Star, 
  Film,
  Heart,
  Zap,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { markFirstLibrary } from "@/lib/progress-tracker";

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

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showProfileBuilder, setShowProfileBuilder] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);

  useEffect(() => {
    // Load initial data
    loadDashboardData();
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

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
      onClick: () => router.push('/dashboard/settings')
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
      onClick: () => router.push('/dashboard/reports')
    }
  ];

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
          <h1 className="text-2xl font-bold text-white">{getGreeting()}, {user?.email?.split('@')[0] || 'Movie Lover'}!</h1>
          <p className="text-neutral-400 mt-1">{getSubGreeting()}</p>
        </div>

                {/* Getting Started Section */}
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

        {/* Recent Top Releases */}
        <div className="mb-8">
          <RecentTopReleases />
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


      </div>
    </DashboardLayout>
  );
}
