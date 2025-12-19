// Dummy data for Explore Destination Page
// Use this data to add via Postman to your backend

export const dummyPopularDestinations = [
  {
    name: "Goa",
    description: "Famous for its beaches, nightlife, and Portuguese heritage",
    location: "Goa, India",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    images: [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
    ],
    bestTimeToVisit: "November to February",
    topAttractions: ["Calangute Beach", "Fort Aguada", "Basilica of Bom Jesus"],
    activities: ["Beach Hopping", "Water Sports", "Nightlife"],
    hotels: ["Taj Exotica", "The Leela", "Park Hyatt"],
    foodAndCuisine: ["Fish Curry", "Bebinca", "Feni"],
    nearbyDestinations: ["Mumbai", "Pune"],
    status: "active"
  },
  {
    name: "Manali",
    description: "Hill station known for snow-capped mountains and adventure sports",
    location: "Himachal Pradesh, India",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
    ],
    bestTimeToVisit: "March to June, October to December",
    topAttractions: ["Rohtang Pass", "Hadimba Temple", "Solang Valley"],
    activities: ["Skiing", "Trekking", "Paragliding"],
    hotels: ["The Himalayan", "Manali Heights", "Snow Valley"],
    foodAndCuisine: ["Siddu", "Aktori", "Babru"],
    nearbyDestinations: ["Shimla", "Kullu"],
    status: "active"
  },
  {
    name: "Rajasthan",
    description: "Land of kings with magnificent palaces and forts",
    location: "Rajasthan, India",
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800",
    images: [
      "https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800",
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800"
    ],
    bestTimeToVisit: "October to March",
    topAttractions: ["Jaipur City Palace", "Udaipur Lake Palace", "Jaisalmer Fort"],
    activities: ["Camel Safari", "Palace Tours", "Cultural Shows"],
    hotels: ["Taj Lake Palace", "Rambagh Palace", "Umaid Bhawan"],
    foodAndCuisine: ["Dal Baati Churma", "Laal Maas", "Gatte ki Sabzi"],
    nearbyDestinations: ["Delhi", "Agra"],
    status: "active"
  },
  {
    name: "Kerala",
    description: "God's own country with backwaters and lush greenery",
    location: "Kerala, India",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800"
    ],
    bestTimeToVisit: "October to March",
    topAttractions: ["Alleppey Backwaters", "Munnar Tea Gardens", "Kochi Fort"],
    activities: ["Houseboat Cruise", "Ayurveda Spa", "Wildlife Safari"],
    hotels: ["Taj Malabar", "Kumarakom Lake Resort", "The Leela"],
    foodAndCuisine: ["Appam with Stew", "Puttu", "Kerala Fish Curry"],
    nearbyDestinations: ["Bangalore", "Coimbatore"],
    status: "active"
  },
  {
    name: "Varanasi",
    description: "Spiritual capital of India on the banks of Ganges",
    location: "Uttar Pradesh, India",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800",
    images: [
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800",
      "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800"
    ],
    bestTimeToVisit: "October to March",
    topAttractions: ["Ganga Aarti", "Kashi Vishwanath Temple", "Sarnath"],
    activities: ["Boat Ride on Ganges", "Temple Visits", "Meditation"],
    hotels: ["Taj Ganges", "BrijRama Palace", "Hotel Surya"],
    foodAndCuisine: ["Kachori Sabzi", "Malaiyo", "Banarasi Paan"],
    nearbyDestinations: ["Allahabad", "Bodh Gaya"],
    status: "active"
  },
  {
    name: "Ladakh",
    description: "High-altitude desert with stunning landscapes and monasteries",
    location: "Jammu & Kashmir, India",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"
    ],
    bestTimeToVisit: "May to September",
    topAttractions: ["Pangong Lake", "Nubra Valley", "Leh Palace"],
    activities: ["Biking", "Trekking", "Monastery Visits"],
    hotels: ["The Grand Dragon", "Ladakh Sarai", "Hotel Shambhala"],
    foodAndCuisine: ["Thukpa", "Momos", "Butter Tea"],
    nearbyDestinations: ["Srinagar", "Manali"],
    status: "active"
  }
];

export const dummyCategories = [
  {
    name: "Beach",
    locations: "Goa, Andaman, Kerala",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    placesDetails: [
      {
        placeName: "Calangute Beach",
        description: "Queen of beaches in Goa with golden sand and water sports",
        weatherInfo: "Tropical climate, best visited November to February"
      },
      {
        placeName: "Radhanagar Beach",
        description: "Asia's best beach in Andaman with crystal clear waters",
        weatherInfo: "Tropical climate, best visited December to March"
      },
      {
        placeName: "Kovalam Beach",
        description: "Famous beach in Kerala with lighthouse and coconut palms",
        weatherInfo: "Tropical climate, best visited October to March"
      }
    ],
    status: "active"
  },
  {
    name: "Mountain",
    locations: "Himachal, Uttarakhand, Sikkim",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    placesDetails: [
      {
        placeName: "Manali",
        description: "Adventure capital with snow-capped peaks and valleys",
        weatherInfo: "Cold climate, best visited March to June"
      },
      {
        placeName: "Shimla",
        description: "Queen of hills with colonial architecture and scenic views",
        weatherInfo: "Cool climate, best visited April to June, October to November"
      },
      {
        placeName: "Darjeeling",
        description: "Tea gardens and mountain views with toy train",
        weatherInfo: "Cool climate, best visited March to May, October to November"
      }
    ],
    status: "active"
  },
  {
    name: "Heritage",
    locations: "Rajasthan, Delhi, Agra",
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800",
    placesDetails: [
      {
        placeName: "Taj Mahal",
        description: "Iconic white marble mausoleum, symbol of love",
        weatherInfo: "Best visited October to March"
      },
      {
        placeName: "Red Fort",
        description: "Historic fort in Delhi, UNESCO World Heritage Site",
        weatherInfo: "Best visited October to March"
      },
      {
        placeName: "Amber Fort",
        description: "Magnificent fort in Jaipur with intricate architecture",
        weatherInfo: "Best visited October to March"
      }
    ],
    status: "active"
  },
  {
    name: "Wildlife",
    locations: "Madhya Pradesh, Karnataka, Assam",
    image: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800",
    placesDetails: [
      {
        placeName: "Ranthambore",
        description: "Famous tiger reserve with historic fort",
        weatherInfo: "Best visited October to April"
      },
      {
        placeName: "Bandipur",
        description: "National park in Karnataka with diverse wildlife",
        weatherInfo: "Best visited October to May"
      },
      {
        placeName: "Kaziranga",
        description: "Home to one-horned rhinoceros in Assam",
        weatherInfo: "Best visited November to April"
      }
    ],
    status: "active"
  },
  {
    name: "Spiritual",
    locations: "Varanasi, Rishikesh, Haridwar",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800",
    placesDetails: [
      {
        placeName: "Varanasi",
        description: "Spiritual capital on Ganges with ancient temples",
        weatherInfo: "Best visited October to March"
      },
      {
        placeName: "Rishikesh",
        description: "Yoga capital with ashrams and adventure activities",
        weatherInfo: "Best visited February to May, September to November"
      },
      {
        placeName: "Haridwar",
        description: "Holy city with Ganga Aarti and temples",
        weatherInfo: "Best visited October to April"
      }
    ],
    status: "active"
  },
  {
    name: "Desert",
    locations: "Rajasthan, Gujarat",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    placesDetails: [
      {
        placeName: "Jaisalmer",
        description: "Golden city with sand dunes and fort",
        weatherInfo: "Best visited October to March"
      },
      {
        placeName: "Bikaner",
        description: "Desert city with palaces and camel safaris",
        weatherInfo: "Best visited October to March"
      },
      {
        placeName: "Kutch",
        description: "White desert with Rann Utsav and cultural heritage",
        weatherInfo: "Best visited November to February"
      }
    ],
    status: "active"
  }
];

export const dummySeasons = [
  {
    title: "January",
    color: "#3460DC",
    places: "Goa, Kerala, Andaman",
    desc: "Perfect weather for beach destinations and southern India",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    placesDetails: [
      {
        placeName: "Goa",
        description: "Ideal beach weather with clear skies",
        weatherInfo: "Temperature: 20-30°C, Perfect for beach activities"
      },
      {
        placeName: "Kerala",
        description: "Best time for backwaters and houseboat cruises",
        weatherInfo: "Temperature: 18-28°C, Pleasant weather"
      },
      {
        placeName: "Andaman",
        description: "Perfect for water sports and island hopping",
        weatherInfo: "Temperature: 22-30°C, Clear waters"
      }
    ],
    status: "active"
  },
  {
    title: "February",
    color: "#FF6B6B",
    places: "Rajasthan, Goa, Kerala",
    desc: "Great weather across India, perfect for travel",
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800",
    placesDetails: [
      {
        placeName: "Rajasthan",
        description: "Comfortable weather for palace tours",
        weatherInfo: "Temperature: 10-25°C, Ideal for sightseeing"
      },
      {
        placeName: "Goa",
        description: "Peak season with festivals and events",
        weatherInfo: "Temperature: 20-32°C, Perfect beach weather"
      },
      {
        placeName: "Kerala",
        description: "Best time for Ayurveda and wellness",
        weatherInfo: "Temperature: 20-30°C, Pleasant climate"
      }
    ],
    status: "active"
  },
  {
    title: "March",
    color: "#4ECDC4",
    places: "Himachal, Uttarakhand, Rajasthan",
    desc: "Spring season, perfect for hill stations",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    placesDetails: [
      {
        placeName: "Manali",
        description: "Spring blooms and pleasant weather",
        weatherInfo: "Temperature: 5-18°C, Perfect for trekking"
      },
      {
        placeName: "Shimla",
        description: "Beautiful spring weather with flowers",
        weatherInfo: "Temperature: 8-20°C, Ideal for sightseeing"
      },
      {
        placeName: "Rajasthan",
        description: "Comfortable weather before summer",
        weatherInfo: "Temperature: 15-30°C, Good for travel"
      }
    ],
    status: "active"
  },
  {
    title: "April",
    color: "#FFE66D",
    places: "Himachal, Kashmir, Sikkim",
    desc: "Perfect for mountain destinations",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    placesDetails: [
      {
        placeName: "Srinagar",
        description: "Tulip season and beautiful gardens",
        weatherInfo: "Temperature: 8-20°C, Spring weather"
      },
      {
        placeName: "Darjeeling",
        description: "Tea gardens in full bloom",
        weatherInfo: "Temperature: 10-18°C, Pleasant weather"
      },
      {
        placeName: "Manali",
        description: "Adventure activities begin",
        weatherInfo: "Temperature: 8-20°C, Good for outdoor activities"
      }
    ],
    status: "active"
  },
  {
    title: "May",
    color: "#95E1D3",
    places: "Himachal, Ladakh, Sikkim",
    desc: "Best time for high-altitude destinations",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    placesDetails: [
      {
        placeName: "Ladakh",
        description: "Roads open, perfect for biking",
        weatherInfo: "Temperature: 5-20°C, Clear skies"
      },
      {
        placeName: "Spiti Valley",
        description: "Remote valley opens for tourists",
        weatherInfo: "Temperature: 0-15°C, Cold but accessible"
      },
      {
        placeName: "Sikkim",
        description: "Rhododendron blooms and clear views",
        weatherInfo: "Temperature: 10-20°C, Beautiful weather"
      }
    ],
    status: "active"
  },
  {
    title: "June",
    color: "#A8E6CF",
    places: "Ladakh, Spiti, Himachal",
    desc: "Peak season for mountain adventures",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    placesDetails: [
      {
        placeName: "Ladakh",
        description: "Peak tourist season with festivals",
        weatherInfo: "Temperature: 10-25°C, Perfect weather"
      },
      {
        placeName: "Manali",
        description: "Adventure sports in full swing",
        weatherInfo: "Temperature: 12-25°C, Ideal for activities"
      },
      {
        placeName: "Spiti",
        description: "Best time to visit remote valley",
        weatherInfo: "Temperature: 5-18°C, Accessible and beautiful"
      }
    ],
    status: "active"
  }
];

export const dummyRegions = [
  {
    name: "North India",
    description: "Explore the majestic Himalayas, historic cities, and rich culture",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    status: "active"
  },
  {
    name: "South India",
    description: "Discover backwaters, beaches, temples, and delicious cuisine",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    status: "active"
  },
  {
    name: "East India",
    description: "Experience tea gardens, wildlife, and spiritual destinations",
    image: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800",
    status: "active"
  },
  {
    name: "West India",
    description: "Enjoy beaches, forts, and vibrant culture",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    status: "active"
  },
  {
    name: "Central India",
    description: "Visit historic sites, wildlife sanctuaries, and heritage cities",
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800",
    status: "active"
  },
  {
    name: "Northeast India",
    description: "Explore untouched beauty, diverse cultures, and adventure",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    status: "active"
  }
];

export const dummyActivities = [
  {
    name: "Trekking",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    status: "active"
  },
  {
    name: "Water Sports",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    status: "active"
  },
  {
    name: "Wildlife Safari",
    image: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800",
    status: "active"
  },
  {
    name: "Paragliding",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    status: "active"
  },
  {
    name: "Rock Climbing",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    status: "active"
  },
  {
    name: "River Rafting",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    status: "active"
  }
];

export const dummyHeritage = [
  {
    name: "Taj Mahal",
    description: "Iconic white marble mausoleum, symbol of eternal love",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800",
    status: "active"
  },
  {
    name: "Red Fort",
    description: "Historic fort in Delhi, UNESCO World Heritage Site",
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800",
    status: "active"
  },
  {
    name: "Hampi",
    description: "Ancient ruins of Vijayanagara Empire",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    status: "active"
  },
  {
    name: "Khajuraho",
    description: "Famous for intricate temple sculptures",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800",
    status: "active"
  },
  {
    name: "Ajanta Ellora",
    description: "Ancient rock-cut caves with Buddhist, Hindu, and Jain art",
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800",
    status: "active"
  },
  {
    name: "Fatehpur Sikri",
    description: "Mughal city with stunning architecture",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    status: "active"
  }
];








