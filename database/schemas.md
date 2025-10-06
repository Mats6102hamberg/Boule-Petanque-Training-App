# Database Schemas - Boule Pétanque Training App

## MongoDB Collections

### 1. Users Collection

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  username: "johan_petanque",
  email: "johan@example.com",
  password: "$2a$10$...", // bcrypt hashed
  profile: {
    firstName: "Johan",
    lastName: "Andersson",
    avatar: "https://cloudinary.com/...",
    bio: "Passionate pétanque player from Stockholm",
    location: "Stockholm, Sweden"
  },
  stats: {
    accuracy: 78.5,
    sessionsCompleted: 45,
    bestScore: 13,
    totalThrows: 1250,
    gamesPlayed: 32,
    gamesWon: 18
  },
  achievements: [
    ObjectId("507f1f77bcf86cd799439012"),
    ObjectId("507f1f77bcf86cd799439013")
  ],
  friends: [
    ObjectId("507f1f77bcf86cd799439014"),
    ObjectId("507f1f77bcf86cd799439015")
  ],
  settings: {
    notifications: true,
    language: "sv",
    units: "metric"
  },
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  lastActive: ISODate("2024-10-06T21:45:00Z")
}
```

**Indexes:**
- `{ username: 1 }` - Unique
- `{ email: 1 }` - Unique
- `{ "stats.accuracy": -1 }` - För leaderboard

---

### 2. TrainingSessions Collection

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439020"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  date: ISODate("2024-10-06T14:00:00Z"),
  duration: 3600, // sekunder
  exercises: [
    {
      type: "pointing",
      result: {
        accuracy: 85.5,
        distance: 0.15, // meter från cochonnet
        angle: 28.5,    // grader
        speed: 4.2,     // m/s
        success: true
      },
      timestamp: ISODate("2024-10-06T14:05:00Z")
    },
    {
      type: "shooting",
      result: {
        accuracy: 72.0,
        distance: 0.35,
        angle: 32.0,
        speed: 6.8,
        success: false
      },
      timestamp: ISODate("2024-10-06T14:10:00Z")
    }
  ],
  statistics: {
    totalThrows: 25,
    successfulThrows: 18,
    averageDistance: 0.22,
    averageAccuracy: 78.5,
    bestThrow: {
      accuracy: 95.2,
      distance: 0.08
    }
  },
  videoUrl: "https://cloudinary.com/video/session_123.mp4",
  notes: "Fokuserade på pointing-teknik idag",
  weather: {
    temperature: 22,
    conditions: "Sunny",
    wind: "Light breeze"
  },
  location: {
    name: "Vasaparken Pétanque Court",
    coordinates: {
      latitude: 59.3293,
      longitude: 18.0686
    }
  }
}
```

**Indexes:**
- `{ userId: 1, date: -1 }`
- `{ date: -1 }`

---

### 3. Games Collection

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439030"),
  teams: [
    {
      id: "team_a",
      name: "Team Alpha",
      players: [
        ObjectId("507f1f77bcf86cd799439011"),
        ObjectId("507f1f77bcf86cd799439014")
      ],
      color: "#C0C0C0" // Silver
    },
    {
      id: "team_b",
      name: "Team Beta",
      players: [
        ObjectId("507f1f77bcf86cd799439015"),
        ObjectId("507f1f77bcf86cd799439016")
      ],
      color: "#FFD700" // Gold
    }
  ],
  rounds: [
    {
      roundNumber: 1,
      scores: {
        "team_a": 2,
        "team_b": 0
      },
      throws: [
        {
          playerId: ObjectId("507f1f77bcf86cd799439011"),
          teamId: "team_a",
          distance: 0.12,
          accuracy: 88.5,
          timestamp: ISODate("2024-10-06T15:05:00Z")
        }
      ],
      winner: "team_a",
      duration: 420
    },
    {
      roundNumber: 2,
      scores: {
        "team_a": 0,
        "team_b": 1
      },
      throws: [],
      winner: "team_b",
      duration: 380
    }
  ],
  currentRound: 3,
  status: "in_progress", // waiting, in_progress, completed, cancelled
  gameType: "doubles",
  targetScore: 13,
  location: {
    name: "Vasaparken",
    coordinates: {
      latitude: 59.3293,
      longitude: 18.0686
    }
  },
  weather: {
    temperature: 20,
    conditions: "Partly cloudy",
    wind: "Moderate"
  },
  startedAt: ISODate("2024-10-06T15:00:00Z"),
  completedAt: null,
  createdBy: ObjectId("507f1f77bcf86cd799439011"),
  createdAt: ISODate("2024-10-06T14:55:00Z"),
  updatedAt: ISODate("2024-10-06T15:30:00Z")
}
```

**Indexes:**
- `{ status: 1, createdAt: -1 }`
- `{ "teams.players": 1 }`

---

### 4. Achievements Collection

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439040"),
  name: "First Steps",
  description: "Complete your first training session",
  icon: "🎯",
  category: "training",
  criteria: {
    type: "count",
    metric: "sessionsCompleted",
    target: 1
  },
  rarity: "common",
  points: 10,
  unlockedBy: [
    {
      userId: ObjectId("507f1f77bcf86cd799439011"),
      unlockedAt: ISODate("2024-01-15T11:00:00Z")
    },
    {
      userId: ObjectId("507f1f77bcf86cd799439014"),
      unlockedAt: ISODate("2024-01-16T09:30:00Z")
    }
  ],
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-10-06T15:30:00Z")
}
```

**Exempel på achievements:**

```javascript
// Training Achievements
{
  name: "Dedicated Trainer",
  description: "Complete 50 training sessions",
  criteria: { type: "count", metric: "sessionsCompleted", target: 50 },
  rarity: "rare",
  points: 50
}

{
  name: "Sharpshooter",
  description: "Achieve 90% accuracy in a session",
  criteria: { type: "threshold", metric: "accuracy", target: 90 },
  rarity: "epic",
  points: 100
}

// Game Achievements
{
  name: "Champion",
  description: "Win 10 games",
  criteria: { type: "count", metric: "gamesWon", target: 10 },
  rarity: "rare",
  points: 75
}

// Social Achievements
{
  name: "Social Butterfly",
  description: "Add 10 friends",
  criteria: { type: "count", metric: "friendsCount", target: 10 },
  rarity: "common",
  points: 25
}
```

**Indexes:**
- `{ category: 1, rarity: 1 }`
- `{ "unlockedBy.userId": 1 }`

---

### 5. Challenges Collection

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439050"),
  challenger: ObjectId("507f1f77bcf86cd799439011"),
  challenged: ObjectId("507f1f77bcf86cd799439014"),
  type: "accuracy_challenge",
  description: "Who can achieve the highest accuracy in 10 throws?",
  status: "pending", // pending, accepted, declined, completed
  parameters: {
    throwCount: 10,
    timeLimit: 3600 // sekunder
  },
  results: {
    challenger: {
      score: 85.5,
      completedAt: ISODate("2024-10-06T16:00:00Z")
    },
    challenged: {
      score: null,
      completedAt: null
    }
  },
  winner: null,
  createdAt: ISODate("2024-10-06T15:00:00Z"),
  expiresAt: ISODate("2024-10-13T15:00:00Z")
}
```

---

## Redis Cache Structure

### Session Cache
```
Key: session:{userId}
Value: JSON string of user session data
TTL: 24 hours
```

### Leaderboard Cache
```
Key: leaderboard:global
Type: Sorted Set
Members: userId
Scores: accuracy score
TTL: 1 hour
```

### Active Games Cache
```
Key: game:{gameId}
Value: JSON string of game state
TTL: 24 hours
```

---

## Relationships

```
User (1) ─── (N) TrainingSession
User (1) ─── (N) Game (as player)
User (N) ─── (N) User (friends)
User (N) ─── (N) Achievement (unlocked)
User (1) ─── (N) Challenge (as challenger/challenged)
```

---

## Data Migration Scripts

### Initial Seed Data

```javascript
// Skapa default achievements
db.achievements.insertMany([
  {
    name: "First Steps",
    description: "Complete your first training session",
    icon: "🎯",
    category: "training",
    criteria: { type: "count", metric: "sessionsCompleted", target: 1 },
    rarity: "common",
    points: 10
  },
  // ... more achievements
]);

// Skapa test-användare
db.users.insertOne({
  username: "demo_user",
  email: "demo@example.com",
  password: "$2a$10$...", // hashed "password123"
  stats: {
    accuracy: 0,
    sessionsCompleted: 0,
    bestScore: 0,
    totalThrows: 0,
    gamesPlayed: 0,
    gamesWon: 0
  }
});
```
