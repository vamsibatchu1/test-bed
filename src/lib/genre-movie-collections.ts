// Comprehensive genre-based movie collections with guaranteed working posters

interface GenreMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_primary: string;
}

interface MoodPlaylist {
  title: string;
  description: string;
  movieCount: string;
  genre: string;
  genreKeys: string[];
  movies: GenreMovie[];
}

class GenreMovieCollections {
  private static instance: GenreMovieCollections;

  static getInstance(): GenreMovieCollections {
    if (!GenreMovieCollections.instance) {
      GenreMovieCollections.instance = new GenreMovieCollections();
    }
    return GenreMovieCollections.instance;
  }

  // Generate a placeholder poster for any movie
  private getPlaceholderPoster(title: string, genre: string): string {
    // Create a simple colored placeholder based on genre
    const colors = {
      'Comedy': '4CAF50',    // Green
      'Action': 'F44336',    // Red
      'Romance': 'E91E63',   // Pink
      'Horror': '424242',    // Dark Gray
      'Drama': '2196F3',     // Blue
      'Family': 'FF9800'     // Orange
    };
    
    const color = colors[genre as keyof typeof colors] || '607D8B'; // Default blue-gray
    const encodedTitle = encodeURIComponent(title.substring(0, 20));
    
    // Use a simple placeholder service
    return `https://via.placeholder.com/300x450/${color}/FFFFFF?text=${encodedTitle}`;
  }

  // Feel-good/uplifting movies for "Feeling Sad"
  private feelGoodMovies: GenreMovie[] = [
    { id: 1001, title: "The Secret Life of Walter Mitty", overview: "A daydreamer escapes his anonymous life by disappearing into a world of fantasies.", poster_path: this.getPlaceholderPoster("The Secret Life of Walter Mitty", "Comedy"), release_date: "2013-12-25", vote_average: 7.3, genre_primary: "Comedy" },
    { id: 1002, title: "La La Land", overview: "A jazz pianist falls for an aspiring actress in Los Angeles.", poster_path: this.getPlaceholderPoster("La La Land", "Romance"), release_date: "2016-12-09", vote_average: 8.0, genre_primary: "Romance" },
    { id: 1003, title: "The Grand Budapest Hotel", overview: "A writer encounters the owner of an aging high-class hotel.", poster_path: this.getPlaceholderPoster("The Grand Budapest Hotel", "Comedy"), release_date: "2014-03-28", vote_average: 8.1, genre_primary: "Comedy" },
    { id: 1004, title: "Paddington", overview: "A young Peruvian bear travels to London in search of a home.", poster_path: this.getPlaceholderPoster("Paddington", "Family"), release_date: "2014-11-28", vote_average: 7.2, genre_primary: "Family" },
    { id: 1005, title: "About Time", overview: "A young man discovers he can travel back in time to improve moments in his life.", poster_path: this.getPlaceholderPoster("About Time", "Romance"), release_date: "2013-09-04", vote_average: 7.8, genre_primary: "Romance" },
    { id: 1006, title: "The Pursuit of Happyness", overview: "A struggling salesman takes custody of his son as he's poised to begin a life-changing professional career.", poster_path: this.getPlaceholderPoster("The Pursuit of Happyness", "Drama"), release_date: "2006-12-15", vote_average: 8.0, genre_primary: "Drama" },
    { id: 1007, title: "Chef", overview: "A head chef quits his restaurant job and buys a food truck in an effort to reclaim his creative promise.", poster_path: this.getPlaceholderPoster("Chef", "Comedy"), release_date: "2014-05-09", vote_average: 7.3, genre_primary: "Comedy" },
    { id: 1008, title: "Julie & Julia", overview: "Julia Child's story of her start in the cooking profession is intertwined with blogger Julie Powell's challenge.", poster_path: this.getPlaceholderPoster("Julie & Julia", "Drama"), release_date: "2009-08-07", vote_average: 7.0, genre_primary: "Drama" },
    { id: 1009, title: "Forrest Gump", overview: "The presidencies of Kennedy and Johnson are shown through the perspective of an Alabama man with an IQ of 75.", poster_path: this.getPlaceholderPoster("Forrest Gump", "Drama"), release_date: "1994-07-06", vote_average: 8.8, genre_primary: "Drama" },
    { id: 1010, title: "Good Will Hunting", overview: "Will Hunting, a janitor at M.I.T., has a gift for mathematics but needs help from a psychologist.", poster_path: this.getPlaceholderPoster("Good Will Hunting", "Drama"), release_date: "1997-12-05", vote_average: 8.3, genre_primary: "Drama" },
    { id: 1011, title: "The Intern", overview: "A 70-year-old widower becomes a senior intern at an online fashion website.", poster_path: this.getPlaceholderPoster("The Intern", "Comedy"), release_date: "2015-09-25", vote_average: 7.1, genre_primary: "Comedy" },
    { id: 1012, title: "Little Miss Sunshine", overview: "A family determined to get their young daughter into the finals of a beauty pageant take a cross-country trip.", poster_path: this.getPlaceholderPoster("Little Miss Sunshine", "Comedy"), release_date: "2006-07-26", vote_average: 7.8, genre_primary: "Comedy" }
  ];

  // Action movies for "Action Night"
  private actionMovies: GenreMovie[] = [
    { id: 2001, title: "John Wick: Chapter 4", overview: "With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table.", poster_path: this.getPlaceholderPoster("John Wick: Chapter 4", "Action"), release_date: "2023-03-24", vote_average: 7.7, genre_primary: "Action" },
    { id: 2002, title: "Top Gun: Maverick", overview: "After thirty years, Maverick is still pushing the envelope as a top naval aviator.", poster_path: this.getPlaceholderPoster("Top Gun: Maverick", "Action"), release_date: "2022-05-27", vote_average: 8.3, genre_primary: "Action" },
    { id: 2003, title: "Mad Max: Fury Road", overview: "In a post-apocalyptic wasteland, Max teams up with a mysterious woman to flee from a tyrannical warlord.", poster_path: this.getPlaceholderPoster("Mad Max: Fury Road", "Action"), release_date: "2015-05-15", vote_average: 8.1, genre_primary: "Action" },
    { id: 2004, title: "Mission: Impossible - Dead Reckoning", overview: "Ethan Hunt and his IMF team embark on their most dangerous mission yet.", poster_path: this.getPlaceholderPoster("Mission: Impossible", "Action"), release_date: "2023-07-12", vote_average: 7.7, genre_primary: "Action" },
    { id: 2005, title: "The Dark Knight", overview: "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological tests.", poster_path: this.getPlaceholderPoster("The Dark Knight", "Action"), release_date: "2008-07-18", vote_average: 9.0, genre_primary: "Action" },
    { id: 2006, title: "Gladiator", overview: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family.", poster_path: this.getPlaceholderPoster("Gladiator", "Action"), release_date: "2000-05-05", vote_average: 8.5, genre_primary: "Action" },
    { id: 2007, title: "The Matrix", overview: "A computer hacker learns from mysterious rebels about the true nature of his reality.", poster_path: this.getPlaceholderPoster("The Matrix", "Action"), release_date: "1999-03-31", vote_average: 8.7, genre_primary: "Action" },
    { id: 2008, title: "Spider-Man: No Way Home", overview: "With Spider-Man's identity revealed, Peter asks Doctor Strange for help.", poster_path: this.getPlaceholderPoster("Spider-Man: No Way Home", "Action"), release_date: "2021-12-17", vote_average: 8.4, genre_primary: "Action" },
    { id: 2009, title: "Avengers: Endgame", overview: "After the devastating events of Infinity War, the universe is in ruins.", poster_path: this.getPlaceholderPoster("Avengers: Endgame", "Action"), release_date: "2019-04-26", vote_average: 8.4, genre_primary: "Action" },
    { id: 2010, title: "Casino Royale", overview: "James Bond earns his 00 status and is assigned to his first mission as Bond.", poster_path: this.getPlaceholderPoster("Casino Royale", "Action"), release_date: "2006-11-17", vote_average: 8.0, genre_primary: "Action" },
    { id: 2011, title: "Fast Five", overview: "Dom and his crew find themselves on the wrong side of the law once again.", poster_path: this.getPlaceholderPoster("Fast Five", "Action"), release_date: "2011-04-29", vote_average: 7.3, genre_primary: "Action" },
    { id: 2012, title: "The Bourne Identity", overview: "A man is picked up by a fishing boat with no memory of who he is.", poster_path: this.getPlaceholderPoster("The Bourne Identity", "Action"), release_date: "2002-06-14", vote_average: 7.9, genre_primary: "Action" }
  ];

  // Romance movies for "Romance Evening"
  private romanceMovies: GenreMovie[] = [
    { id: 3001, title: "Anyone But You", overview: "After an amazing first date, Bea and Ben's fiery attraction turns ice cold.", poster_path: this.getPlaceholderPoster("Anyone But You", "Romance"), release_date: "2023-12-22", vote_average: 6.1, genre_primary: "Romance" },
    { id: 3002, title: "The Notebook", overview: "A poor yet passionate young man falls in love with a rich young woman.", poster_path: this.getPlaceholderPoster("The Notebook", "Romance"), release_date: "2004-06-25", vote_average: 7.8, genre_primary: "Romance" },
    { id: 3003, title: "Pride and Prejudice", overview: "Sparks fly when spirited Elizabeth Bennet meets single, rich, and proud Mr. Darcy.", poster_path: this.getPlaceholderPoster("Pride and Prejudice", "Romance"), release_date: "2005-09-16", vote_average: 8.1, genre_primary: "Romance" },
    { id: 3004, title: "Titanic", overview: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.", poster_path: this.getPlaceholderPoster("Titanic", "Romance"), release_date: "1997-12-19", vote_average: 7.9, genre_primary: "Romance" },
    { id: 3005, title: "Casablanca", overview: "A cynical American expatriate struggles to decide whether or not he should help his former lover escape Casablanca.", poster_path: this.getPlaceholderPoster("Casablanca", "Romance"), release_date: "1942-11-26", vote_average: 8.5, genre_primary: "Romance" },
    { id: 3006, title: "When Harry Met Sally", overview: "Harry and Sally have known each other for years, and are very good friends, but they fear sex would ruin the friendship.", poster_path: this.getPlaceholderPoster("When Harry Met Sally", "Romance"), release_date: "1989-07-21", vote_average: 7.7, genre_primary: "Romance" },
    { id: 3007, title: "Roman Holiday", overview: "A bored and sheltered princess escapes her guardians and falls in love with an American newsman in Rome.", poster_path: this.getPlaceholderPoster("Roman Holiday", "Romance"), release_date: "1953-09-02", vote_average: 8.0, genre_primary: "Romance" },
    { id: 3008, title: "Sleepless in Seattle", overview: "A recently widowed man's son calls a radio talk-show in an attempt to find his father a partner.", poster_path: this.getPlaceholderPoster("Sleepless in Seattle", "Romance"), release_date: "1993-06-25", vote_average: 6.7, genre_primary: "Romance" },
    { id: 3009, title: "The Princess Bride", overview: "A bedridden boy's grandfather reads him the story of a farmboy-turned-pirate who encounters numerous obstacles.", poster_path: this.getPlaceholderPoster("The Princess Bride", "Romance"), release_date: "1987-10-09", vote_average: 8.0, genre_primary: "Romance" },
    { id: 3010, title: "You've Got Mail", overview: "Two business rivals hate each other at the office but fall in love over the internet.", poster_path: this.getPlaceholderPoster("You've Got Mail", "Romance"), release_date: "1998-12-18", vote_average: 6.3, genre_primary: "Romance" },
    { id: 3011, title: "10 Things I Hate About You", overview: "A pretty, popular teenager can't go out on a date until her ill-tempered older sister does.", poster_path: this.getPlaceholderPoster("10 Things I Hate About You", "Romance"), release_date: "1999-03-31", vote_average: 7.3, genre_primary: "Romance" },
    { id: 3012, title: "Love Actually", overview: "Follows the lives of eight very different couples in dealing with their love lives in various loosely interrelated tales.", poster_path: this.getPlaceholderPoster("Love Actually", "Romance"), release_date: "2003-11-07", vote_average: 7.6, genre_primary: "Romance" }
  ];

  // Horror movies for "Horror Marathon"
  private horrorMovies: GenreMovie[] = [
    { id: 4001, title: "Scream VI", overview: "Following the latest Ghostface killings, the four survivors leave Woodsboro behind.", poster_path: this.getPlaceholderPoster("Scream VI", "Horror"), release_date: "2023-03-10", vote_average: 6.5, genre_primary: "Horror" },
    { id: 4002, title: "The Exorcist", overview: "When a teenage girl is possessed by a mysterious entity, her mother seeks the help of two priests.", poster_path: this.getPlaceholderPoster("The Exorcist", "Horror"), release_date: "1973-12-26", vote_average: 8.0, genre_primary: "Horror" },
    { id: 4003, title: "Halloween", overview: "Fifteen years after murdering his sister, Michael Myers escapes from a mental hospital.", poster_path: this.getPlaceholderPoster("Halloween", "Horror"), release_date: "1978-10-25", vote_average: 7.7, genre_primary: "Horror" },
    { id: 4004, title: "A Nightmare on Elm Street", overview: "Teenager Nancy Thompson must uncover the dark truth concealed by her parents.", poster_path: this.getPlaceholderPoster("A Nightmare on Elm Street", "Horror"), release_date: "1984-11-16", vote_average: 7.5, genre_primary: "Horror" },
    { id: 4005, title: "Get Out", overview: "A young African-American visits his white girlfriend's parents for the weekend.", poster_path: this.getPlaceholderPoster("Get Out", "Horror"), release_date: "2017-02-24", vote_average: 7.7, genre_primary: "Horror" },
    { id: 4006, title: "Hereditary", overview: "A grieving family is haunted by tragedy and disturbing secrets.", poster_path: this.getPlaceholderPoster("Hereditary", "Horror"), release_date: "2018-06-08", vote_average: 7.3, genre_primary: "Horror" },
    { id: 4007, title: "The Conjuring", overview: "Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence.", poster_path: this.getPlaceholderPoster("The Conjuring", "Horror"), release_date: "2013-07-19", vote_average: 7.5, genre_primary: "Horror" },
    { id: 4008, title: "It", overview: "Seven young outcasts in Derry, Maine, are about to face their worst nightmare.", poster_path: this.getPlaceholderPoster("It", "Horror"), release_date: "2017-09-08", vote_average: 7.3, genre_primary: "Horror" },
    { id: 4009, title: "The Shining", overview: "A family heads to an isolated hotel for the winter where a sinister presence influences the father.", poster_path: this.getPlaceholderPoster("The Shining", "Horror"), release_date: "1980-05-23", vote_average: 8.4, genre_primary: "Horror" },
    { id: 4010, title: "Psycho", overview: "A Phoenix secretary embezzles forty thousand dollars from her employer's client.", poster_path: this.getPlaceholderPoster("Psycho", "Horror"), release_date: "1960-09-08", vote_average: 8.5, genre_primary: "Horror" },
    { id: 4011, title: "The Babadook", overview: "A single mother and her child fall into a deep well of paranoia when an eerie children's book turns up at their home.", poster_path: this.getPlaceholderPoster("The Babadook", "Horror"), release_date: "2014-05-22", vote_average: 6.8, genre_primary: "Horror" },
    { id: 4012, title: "Midsommar", overview: "A couple travels to Sweden to visit a rural hometown's fabled mid-summer festival.", poster_path: this.getPlaceholderPoster("Midsommar", "Horror"), release_date: "2019-07-03", vote_average: 7.1, genre_primary: "Horror" }
  ];

  // Comedy movies for "Laugh Therapy"
  private comedyMovies: GenreMovie[] = [
    { id: 5001, title: "Barbie", overview: "Barbie and Ken are having the time of their lives in the colorful world of Barbie Land.", poster_path: this.getPlaceholderPoster("Barbie", "Comedy"), release_date: "2023-07-21", vote_average: 7.0, genre_primary: "Comedy" },
    { id: 5002, title: "Superbad", overview: "Two co-dependent high school seniors are forced to deal with separation anxiety.", poster_path: this.getPlaceholderPoster("Superbad", "Comedy"), release_date: "2007-08-17", vote_average: 7.6, genre_primary: "Comedy" },
    { id: 5003, title: "The Hangover", overview: "Three buddies wake up from a bachelor party in Las Vegas, with no memory of the previous night.", poster_path: this.getPlaceholderPoster("The Hangover", "Comedy"), release_date: "2009-06-05", vote_average: 7.7, genre_primary: "Comedy" },
    { id: 5004, title: "Anchorman", overview: "Ron Burgundy is San Diego's top-rated newsman in the male-dominated broadcasting.", poster_path: this.getPlaceholderPoster("Anchorman", "Comedy"), release_date: "2004-07-09", vote_average: 6.9, genre_primary: "Comedy" },
    { id: 5005, title: "Step Brothers", overview: "Two aimless middle-aged losers still living at home are forced against their will to become roommates.", poster_path: this.getPlaceholderPoster("Step Brothers", "Comedy"), release_date: "2008-07-25", vote_average: 6.9, genre_primary: "Comedy" },
    { id: 5006, title: "Dumb and Dumber", overview: "Lloyd and Harry are two men whose stupidity is really indescribable.", poster_path: this.getPlaceholderPoster("Dumb and Dumber", "Comedy"), release_date: "1994-12-16", vote_average: 7.3, genre_primary: "Comedy" },
    { id: 5007, title: "Groundhog Day", overview: "A weatherman finds himself living the same day over and over again.", poster_path: this.getPlaceholderPoster("Groundhog Day", "Comedy"), release_date: "1993-02-12", vote_average: 8.0, genre_primary: "Comedy" },
    { id: 5008, title: "Bridesmaids", overview: "Competition between the maid of honor and a bridesmaid threatens to upend the life of an out-of-work pastry chef.", poster_path: this.getPlaceholderPoster("Bridesmaids", "Comedy"), release_date: "2011-05-13", vote_average: 6.8, genre_primary: "Comedy" },
    { id: 5009, title: "Tropic Thunder", overview: "A group of self-absorbed actors set out to make the most expensive war film ever.", poster_path: this.getPlaceholderPoster("Tropic Thunder", "Comedy"), release_date: "2008-08-13", vote_average: 6.9, genre_primary: "Comedy" },
    { id: 5010, title: "Zoolander", overview: "At the end of his career, a clueless fashion model is brainwashed to kill the Prime Minister of Malaysia.", poster_path: this.getPlaceholderPoster("Zoolander", "Comedy"), release_date: "2001-09-28", vote_average: 6.5, genre_primary: "Comedy" },
    { id: 5011, title: "Mean Girls", overview: "Cady Heron is a hit with The Plastics, the A-list girl clique at her new school.", poster_path: this.getPlaceholderPoster("Mean Girls", "Comedy"), release_date: "2004-04-30", vote_average: 7.2, genre_primary: "Comedy" },
    { id: 5012, title: "Napoleon Dynamite", overview: "A listless and alienated teenager decides to help his new friend win the class presidency.", poster_path: this.getPlaceholderPoster("Napoleon Dynamite", "Comedy"), release_date: "2004-06-11", vote_average: 6.9, genre_primary: "Comedy" }
  ];

  // Get movies for a specific mood/genre with guaranteed posters
  getMoviesForMood(moodKey: string, count: number = 4): GenreMovie[] {
    let moviePool: GenreMovie[] = [];

    switch (moodKey.toLowerCase()) {
      case 'feeling-sad':
      case 'feelgood':
      case 'uplifting':
        moviePool = this.feelGoodMovies;
        break;
      case 'action-night':
      case 'action':
      case 'thriller':
        moviePool = this.actionMovies;
        break;
      case 'romance-evening':
      case 'romance':
      case 'romantic':
        moviePool = this.romanceMovies;
        break;
      case 'horror-marathon':
      case 'horror':
      case 'scary':
        moviePool = this.horrorMovies;
        break;
      case 'laugh-therapy':
      case 'comedy':
      case 'funny':
        moviePool = this.comedyMovies;
        break;
      default:
        moviePool = this.feelGoodMovies; // fallback
    }

    // Shuffle and return requested count
    const shuffled = [...moviePool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Get all mood playlists with guaranteed working posters
  getAllMoodPlaylists(): MoodPlaylist[] {
    return [
      {
        title: "Feeling Sad",
        description: "A curated list of uplifting movies to brighten your mood",
        movieCount: "12 movies",
        genre: "Feel-good, Comedy, Drama",
        genreKeys: ['feeling-sad', 'feelgood', 'uplifting'],
        movies: this.getMoviesForMood('feeling-sad', 4)
      },
      {
        title: "Action Night",
        description: "High-octane thrillers and action-packed adventures",
        movieCount: "12 movies",
        genre: "Action, Thriller, Adventure",
        genreKeys: ['action-night', 'action', 'thriller'],
        movies: this.getMoviesForMood('action-night', 4)
      },
      {
        title: "Romance Evening",
        description: "Heartwarming love stories and romantic comedies",
        movieCount: "12 movies",
        genre: "Romance, Comedy, Drama",
        genreKeys: ['romance-evening', 'romance', 'romantic'],
        movies: this.getMoviesForMood('romance-evening', 4)
      },
      {
        title: "Horror Marathon",
        description: "Spine-chilling horror films for the brave",
        movieCount: "12 movies",
        genre: "Horror, Thriller, Mystery",
        genreKeys: ['horror-marathon', 'horror', 'scary'],
        movies: this.getMoviesForMood('horror-marathon', 4)
      },
      {
        title: "Laugh Therapy",
        description: "Comedy classics guaranteed to make you laugh",
        movieCount: "12 movies",
        genre: "Comedy, Satire, Feel-good",
        genreKeys: ['laugh-therapy', 'comedy', 'funny'],
        movies: this.getMoviesForMood('laugh-therapy', 4)
      }
    ];
  }

  // Refresh playlists with new random selections
  refreshPlaylist(playlistTitle: string): MoodPlaylist | null {
    const playlists = this.getAllMoodPlaylists();
    const playlist = playlists.find(p => p.title === playlistTitle);
    
    if (playlist) {
      const moodKey = playlist.genreKeys[0];
      playlist.movies = this.getMoviesForMood(moodKey, 4);
    }
    
    return playlist || null;
  }
}

export const genreMovieCollections = GenreMovieCollections.getInstance();
export type { GenreMovie, MoodPlaylist }; 