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
  Heart,
  Film
} from "lucide-react";
import { useRouter } from "next/navigation";

interface MovieCard {
  id: number;
  title: string;
  poster_path: string;
  genre: string;
  rating: number;
  year: string;
  imdbRating: string;
  rottenTomatoes: string;
}

const mockMovies: MovieCard[] = [
  {
    id: 1,
    title: "Dune: Part Two",
    poster_path: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    genre: "Sci-Fi",
    rating: 8.1,
    year: "2024",
    imdbRating: "8.1",
    rottenTomatoes: "93%"
  },
  {
    id: 2,
    title: "Poor Things",
    poster_path: "/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
    genre: "Comedy",
    rating: 7.9,
    year: "2024",
    imdbRating: "7.9",
    rottenTomatoes: "92%"
  },
  {
    id: 3,
    title: "The Zone of Interest",
    poster_path: "/hUu9zyZmDqx8BFJHjldNVsVPe6.jpg",
    genre: "Drama",
    rating: 7.8,
    year: "2024",
    imdbRating: "7.8",
    rottenTomatoes: "91%"
  },
  {
    id: 4,
    title: "Killers of the Flower Moon",
    poster_path: "/dB6Krk806zeqd0nPYBSqGKqDmCS.jpg",
    genre: "Crime",
    rating: 7.7,
    year: "2024",
    imdbRating: "7.7",
    rottenTomatoes: "89%"
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
      <div>
        <h2 className="text-2xl font-bold mb-4">Meet AI Curator</h2>
        <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 text-white border border-neutral-700 rounded-lg p-6">
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
                <Button size="sm" className="bg-white text-gray-900 hover:bg-white/90">
                  <Play className="w-4 h-4 mr-1" />
                  Get Recommendations
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Genres Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Quick Genres</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Browse all
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="flex flex-col items-center justify-center p-6 rounded-lg bg-neutral-800 hover:bg-neutral-700 cursor-pointer transition-colors border border-neutral-700"
            onClick={() => router.push('/dashboard/flick-search?genre=action')}
          >
            <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center mb-3">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-center text-white">Action & Adventure</span>
          </div>
          
          <div 
            className="flex flex-col items-center justify-center p-6 rounded-lg bg-neutral-800 hover:bg-neutral-700 cursor-pointer transition-colors border border-neutral-700"
            onClick={() => router.push('/dashboard/flick-search?genre=comedy')}
          >
            <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center mb-3">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-center text-white">Comedy & Romance</span>
          </div>
          
          <div 
            className="flex flex-col items-center justify-center p-6 rounded-lg bg-neutral-800 hover:bg-neutral-700 cursor-pointer transition-colors border border-neutral-700"
            onClick={() => router.push('/dashboard/flick-search?genre=drama')}
          >
            <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center mb-3">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-center text-white">Drama & Thriller</span>
          </div>
          
          <div 
            className="flex flex-col items-center justify-center p-6 rounded-lg bg-neutral-800 hover:bg-neutral-700 cursor-pointer transition-colors border border-neutral-700"
            onClick={() => router.push('/dashboard/flick-search?genre=sci-fi')}
          >
            <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-center text-white">Sci-Fi & Fantasy</span>
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
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
            {mockMovies.map((movie) => (
              <div 
                key={movie.id}
                className="group cursor-pointer flex-shrink-0"
                style={{ width: '120px' }}
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
                <h4 className="text-sm font-medium truncate mb-1">{movie.title}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{movie.year}</span>
                  <Badge variant="secondary" className="text-xs">
                    RT {movie.rottenTomatoes}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
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