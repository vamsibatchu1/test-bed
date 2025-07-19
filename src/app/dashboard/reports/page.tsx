"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Plus, 
  Folder, 
  Film, 
  MoreHorizontal, 
  Eye,
  Lock,
  Archive,
  Calendar,
  User
} from "lucide-react"

// Sample saved flicks data
const savedFlicks = [
  {
    id: "1",
    title: "Action Movies",
    count: 24,
    lastUpdated: "2d",
    coverImages: [
      "https://image.tmdb.org/t/p/w200/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
      "https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      "https://image.tmdb.org/t/p/w200/9PqD3wSIjntyJDBzMNuxuKHwpUD.jpg",
      "https://image.tmdb.org/t/p/w200/8Vt6mWEReuy4Of61L8kuCQOqJY5.jpg"
    ],
    isSecret: false
  },
  {
    id: "2",
    title: "Sci-Fi Classics",
    count: 18,
    lastUpdated: "1w",
    coverImages: [
      "https://image.tmdb.org/t/p/w200/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
      "https://image.tmdb.org/t/p/w200/2l05cFWJacyIsTpsqSgH0wQXe4V.jpg",
      "https://image.tmdb.org/t/p/w200/9PqD3wSIjntyJDBzMNuxuKHwpUD.jpg",
      "https://image.tmdb.org/t/p/w200/8Vt6mWEReuy4Of61L8kuCQOqJY5.jpg"
    ],
    isSecret: true
  },
  {
    id: "3",
    title: "Comedy Favorites",
    count: 32,
    lastUpdated: "3d",
    coverImages: [
      "https://image.tmdb.org/t/p/w200/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
      "https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      "https://image.tmdb.org/t/p/w200/9PqD3wSIjntyJDBzMNuxuKHwpUD.jpg",
      "https://image.tmdb.org/t/p/w200/8Vt6mWEReuy4Of61L8kuCQOqJY5.jpg"
    ],
    isSecret: false
  },
  {
    id: "4",
    title: "Horror Collection",
    count: 15,
    lastUpdated: "5d",
    coverImages: [
      "https://image.tmdb.org/t/p/w200/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
      "https://image.tmdb.org/t/p/w200/2l05cFWJacyIsTpsqSgH0wQXe4V.jpg",
      "https://image.tmdb.org/t/p/w200/9PqD3wSIjntyJDBzMNuxuKHwpUD.jpg",
      "https://image.tmdb.org/t/p/w200/8Vt6mWEReuy4Of61L8kuCQOqJY5.jpg"
    ],
    isSecret: false
  },
  {
    id: "5",
    title: "Drama Masterpieces",
    count: 28,
    lastUpdated: "1w",
    coverImages: [
      "https://image.tmdb.org/t/p/w200/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
      "https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      "https://image.tmdb.org/t/p/w200/9PqD3wSIjntyJDBzMNuxuKHwpUD.jpg",
      "https://image.tmdb.org/t/p/w200/8Vt6mWEReuy4Of61L8kuCQOqJY5.jpg"
    ],
    isSecret: false
  },
  {
    id: "6",
    title: "Animated Films",
    count: 12,
    lastUpdated: "4d",
    coverImages: [
      "https://image.tmdb.org/t/p/w200/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
      "https://image.tmdb.org/t/p/w200/2l05cFWJacyIsTpsqSgH0wQXe4V.jpg",
      "https://image.tmdb.org/t/p/w200/9PqD3wSIjntyJDBzMNuxuKHwpUD.jpg",
      "https://image.tmdb.org/t/p/w200/8Vt6mWEReuy4Of61L8kuCQOqJY5.jpg"
    ],
    isSecret: false
  },
  {
    id: "7",
    title: "Documentaries",
    count: 8,
    lastUpdated: "2w",
    coverImages: [
      "https://image.tmdb.org/t/p/w200/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
      "https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      "https://image.tmdb.org/t/p/w200/9PqD3wSIjntyJDBzMNuxuKHwpUD.jpg",
      "https://image.tmdb.org/t/p/w200/8Vt6mWEReuy4Of61L8kuCQOqJY5.jpg"
    ],
    isSecret: true
  },
  {
    id: "8",
    title: "Foreign Films",
    count: 21,
    lastUpdated: "1d",
    coverImages: [
      "https://image.tmdb.org/t/p/w200/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
      "https://image.tmdb.org/t/p/w200/2l05cFWJacyIsTpsqSgH0wQXe4V.jpg",
      "https://image.tmdb.org/t/p/w200/9PqD3wSIjntyJDBzMNuxuKHwpUD.jpg",
      "https://image.tmdb.org/t/p/w200/8Vt6mWEReuy4Of61L8kuCQOqJY5.jpg"
    ],
    isSecret: false
  },
  {
    id: "9",
    title: "Romance Classics",
    count: 16,
    lastUpdated: "6d",
    coverImages: [
      "https://image.tmdb.org/t/p/w200/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
      "https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      "https://image.tmdb.org/t/p/w200/9PqD3wSIjntyJDBzMNuxuKHwpUD.jpg",
      "https://image.tmdb.org/t/p/w200/8Vt6mWEReuy4Of61L8kuCQOqJY5.jpg"
    ],
    isSecret: false
  },
  {
    id: "10",
    title: "Thriller Collection",
    count: 19,
    lastUpdated: "3d",
    coverImages: [
      "https://image.tmdb.org/t/p/w200/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
      "https://image.tmdb.org/t/p/w200/2l05cFWJacyIsTpsqSgH0wQXe4V.jpg",
      "https://image.tmdb.org/t/p/w200/9PqD3wSIjntyJDBzMNuxuKHwpUD.jpg",
      "https://image.tmdb.org/t/p/w200/8Vt6mWEReuy4Of61L8kuCQOqJY5.jpg"
    ],
    isSecret: false
  }
]

// Carousel component for each folder
function FolderCarousel({ images, isSecret }: { images: string[], isSecret: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 500); // Change image every half second

    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentIndex(0); // Reset to first image when leaving
  };

  return (
    <div 
      className="relative w-32 h-48 rounded-lg overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Current poster */}
      <img
        src={images[currentIndex]}
        alt={`Cover ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-500"
      />
      
      {/* Secret badge */}
      {isSecret && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-black/70 text-white">
            <Lock className="h-3 w-3 mr-1" />
            Secret
          </Badge>
        </div>
      )}
      
      {/* More options button */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Carousel dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white shadow-sm' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MySavedFlicksPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your saved flicks</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-black hover:bg-black/90">
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          </div>
        </div>

        {/* Navigation tabs and filters */}
        <div className="flex items-center justify-between">
          <Tabs defaultValue="boards" className="w-full">
            <TabsList className="grid w-48 grid-cols-2">
              <TabsTrigger value="pins">Pins</TabsTrigger>
              <TabsTrigger value="boards">Boards</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Group
            </Button>
            <Button variant="outline" size="sm">
              <Lock className="h-4 w-4 mr-2" />
              Secret
            </Button>
            <Button variant="outline" size="sm">
              <Archive className="h-4 w-4 mr-2" />
              Archived
            </Button>
          </div>
        </div>

        {/* Boards grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedFlicks.map((flick) => (
            <Card key={flick.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group p-5">
              <div className="flex gap-3">
                {/* First Column: Carousel */}
                <div className="flex-shrink-0">
                  <FolderCarousel 
                    images={flick.coverImages} 
                    isSecret={flick.isSecret} 
                  />
                </div>

                {/* Second Column: Folder Details */}
                <div className="flex-1">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{flick.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Film className="h-4 w-4" />
                        <span>{flick.count} flicks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{flick.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
} 