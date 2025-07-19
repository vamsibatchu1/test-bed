"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  MoreHorizontal, 
  Star, 
  Calendar, 
  Clock,
  Sparkles,
  TrendingUp,
  Heart
} from "lucide-react";
import { useRouter } from "next/navigation";

interface MovieCard {
  id: number;
  title: string;
  poster_path: string;
  genre: string;
  rating: number;
  year: string;
}

const mockMovies: MovieCard[] = [
  {
    id: 1,
    title: "Dune: Part Two",
    poster_path: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    genre: "Sci-Fi",
    rating: 8.1,
    year: "2024"
  },
  {
    id: 2,
    title: "Poor Things",
    poster_path: "/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
    genre: "Comedy",
    rating: 7.9,
    year: "2024"
  },
  {
    id: 3,
    title: "The Zone of Interest",
    poster_path: "/hUu9zyZmDqx8BFJHjldNVsVPe6.jpg",
    genre: "Drama",
    rating: 7.8,
    year: "2024"
  },
  {
    id: 4,
    title: "Killers of the Flower Moon",
    poster_path: "/dB6Krk806zeqd0nPYBSqGKqDmCS.jpg",
    genre: "Crime",
    rating: 7.7,
    year: "2024"
  },
  {
    id: 5,
    title: "The Holdovers",
    poster_path: "/wD2kUCX1Bb6oeIb2uz7kbdfLP6k.jpg",
    genre: "Comedy",
    rating: 7.6,
    year: "2024"
  },
  {
    id: 6,
    title: "American Fiction",
    poster_path: "/5a4JdoFwll5DRtKMe7JLuGQ9yJm.jpg",
    genre: "Comedy",
    rating: 7.5,
    year: "2024"
  },
  {
    id: 7,
    title: "Oppenheimer",
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    genre: "Biography",
    rating: 8.4,
    year: "2023"
  },
  {
    id: 8,
    title: "Barbie",
    poster_path: "/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
    genre: "Comedy",
    rating: 7.0,
    year: "2023"
  }
];

export function MovieDiscovery() {
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();

  const handleMovieClick = (movie: MovieCard) => {
    router.push(`/dashboard/flick-search?movie=${encodeURIComponent(movie.title)}`);
  };

  return (
    <div className="space-y-6">
      {/* Meet AI Curator Section */}
      <div className="flex gap-6">
        <div className="w-1/2">
          <h2 className="text-2xl font-bold mb-4">Meet AI Curator</h2>
          <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-bold">AI Curator</h3>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      BETA
                    </Badge>
                  </div>
                  <p className="text-white/90 text-sm mb-4">
                    Personalized movie recommendations powered by AI, tailored to your taste.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" className="bg-white text-blue-600 hover:bg-white/90">
                      <Play className="w-4 h-4 mr-1" />
                      Get Recommendations
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Top Picks Section */}
        <div className="w-1/2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Top Picks</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Show all
            </Button>
          </div>
          <div className="space-y-3">
            {mockMovies.slice(0, 3).map((movie) => (
              <div 
                key={movie.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleMovieClick(movie)}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt={movie.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{movie.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {movie.genre} • {movie.year} • ⭐ {movie.rating}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recently Watched Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recently Watched</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Show all
          </Button>
        </div>
        <div className="grid grid-cols-8 gap-4">
          {mockMovies.slice(0, 8).map((movie) => (
            <div 
              key={movie.id}
              className="group cursor-pointer"
              onClick={() => handleMovieClick(movie)}
            >
              <div className="relative mb-2">
                <img
                  src={`https://image.tmdb.org/t/p/w154${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full aspect-[2/3] object-cover rounded-lg group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                  <Button 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h4 className="text-sm font-medium truncate">{movie.title}</h4>
              <p className="text-xs text-muted-foreground">{movie.year}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MovieCard({ movie, onClick }: { movie: MovieCard; onClick: () => void }) {
  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative mb-3">
        <img
          src={`https://image.tmdb.org/t/p/w154${movie.poster_path}`}
          alt={movie.title}
          className="w-full aspect-[2/3] object-cover rounded-lg group-hover:scale-105 transition-transform"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
          <Button 
            size="sm" 
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30"
          >
            <Play className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <h4 className="font-medium text-sm truncate">{movie.title}</h4>
      <p className="text-xs text-muted-foreground">{movie.genre} • {movie.year}</p>
    </div>
  );
} 