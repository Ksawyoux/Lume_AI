import { db } from "../db";
import { users, emotions, transactions, insights, healthData } from "../../shared/schema";
import { subDays } from "date-fns";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Create demo user if not exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.username, "demo"))
    .limit(1);

  let userId: number;

  if (existingUser.length === 0) {
    console.log("Creating demo user...");
    const [newUser] = await db
      .insert(users)
      .values({
        username: "demo",
        password: "password", // In a real app, this would be hashed
        name: "Youness",
        initials: "YS",
      })
      .returning();
    
    userId = newUser.id;
    console.log(`Created demo user with id: ${userId}`);
  } else {
    userId = existingUser[0].id;
    console.log(`Using existing demo user with id: ${userId}`);
  }

  // Check if we have emotions for this user
  const existingEmotions = await db
    .select()
    .from(emotions)
    .where(eq(emotions.userId, userId))
    .limit(1);

  if (existingEmotions.length === 0) {
    console.log("Adding emotions data...");
    // Create emotions
    const emotionData = [
      {
        userId,
        type: "stressed",
        notes: "Feeling overwhelmed with work",
        date: subDays(new Date(), 7)
      },
      {
        userId,
        type: "worried",
        notes: "Concerned about upcoming bills",
        date: subDays(new Date(), 6)
      },
      {
        userId,
        type: "happy",
        notes: "Got a promotion!",
        date: subDays(new Date(), 3)
      },
      {
        userId,
        type: "content",
        notes: "Feeling calm and balanced today",
        date: subDays(new Date(), 1)
      }
    ];

    for (const emotion of emotionData) {
      await db.insert(emotions).values(emotion);
    }
    console.log("Emotions data added.");
  } else {
    console.log("Emotions data already exists.");
  }

  // Check if we have transactions for this user
  const existingTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .limit(1);

  if (existingTransactions.length === 0) {
    console.log("Adding transactions data...");
    
    // Get emotion IDs
    const userEmotions = await db
      .select()
      .from(emotions)
      .where(eq(emotions.userId, userId));
    
    const transactionData = [
      {
        userId,
        amount: -64.32,
        description: "Whole Foods Market",
        category: "grocery",
        date: subDays(new Date(), 1),
        emotionId: userEmotions.find(e => e.type === "content")?.id || null
      },
      {
        userId,
        amount: -32.50,
        description: "Cinema City",
        category: "entertainment",
        date: subDays(new Date(), 3),
        emotionId: userEmotions.find(e => e.type === "worried")?.id || null
      },
      {
        userId,
        amount: 1450.00,
        description: "Paycheck Deposit",
        category: "income",
        date: subDays(new Date(), 3),
        emotionId: userEmotions.find(e => e.type === "happy")?.id || null
      },
      {
        userId,
        amount: -128.75,
        description: "Online Shopping",
        category: "shopping",
        date: subDays(new Date(), 5),
        emotionId: userEmotions.find(e => e.type === "stressed")?.id || null
      }
    ];

    for (const transaction of transactionData) {
      await db.insert(transactions).values(transaction);
    }
    console.log("Transactions data added.");
  } else {
    console.log("Transactions data already exists.");
  }

  // Check if we have insights for this user
  const existingInsights = await db
    .select()
    .from(insights)
    .where(eq(insights.userId, userId))
    .limit(1);

  if (existingInsights.length === 0) {
    console.log("Adding insights data...");
    
    const insightData = [
      {
        userId,
        type: "stress-triggered",
        title: "Stress-Triggered Spending",
        description: "You've spent $312 more than usual on online shopping when you were stressed. Try setting a 24-hour waiting period for purchases over $50 when feeling stressed.",
        date: new Date(),
        updatedDate: new Date()
      },
      {
        userId,
        type: "positive-pattern",
        title: "Positive Spending Pattern",
        description: "When you're happy, you tend to spend on healthier food options and activities. This month, 65% of your happy-state purchases were for long-term wellbeing.",
        date: new Date(),
        updatedDate: new Date()
      },
      {
        userId,
        type: "mood-boosting",
        title: "Mood-Boosting Activities",
        description: "Spending on outdoor activities correlates with a 27% improvement in your reported mood the following day. Consider budgeting $100/month for these activities.",
        date: new Date(),
        updatedDate: new Date()
      }
    ];

    for (const insight of insightData) {
      await db.insert(insights).values(insight);
    }
    console.log("Insights data added.");
  } else {
    console.log("Insights data already exists.");
  }

  // Check if we have health data for this user
  const existingHealthData = await db
    .select()
    .from(healthData)
    .where(eq(healthData.userId, userId))
    .limit(1);

  if (existingHealthData.length === 0) {
    console.log("Adding health data...");
    
    const today = new Date();
    
    // Heart rate data (bpm)
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      await db.insert(healthData).values({
        userId,
        type: "heartRate",
        value: 60 + Math.floor(Math.random() * 20), // Random between 60-80 bpm
        unit: "bpm",
        source: "appleWatch",
        timestamp: date,
        metadata: JSON.stringify({
          activityType: "resting",
          confidence: "high"
        })
      });
    }
    
    // Sleep data (hours)
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      await db.insert(healthData).values({
        userId,
        type: "sleepQuality",
        value: 5 + Math.random() * 3, // Random between 5-8 hours
        unit: "hours",
        source: "appleWatch",
        timestamp: date,
        metadata: JSON.stringify({
          deepSleep: (1 + Math.random() * 2).toFixed(1),
          remSleep: (1 + Math.random() * 2).toFixed(1),
          lightSleep: (3 + Math.random() * 1).toFixed(1)
        })
      });
    }
    
    // Recovery score (percentage)
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      await db.insert(healthData).values({
        userId,
        type: "recovery",
        value: 30 + Math.floor(Math.random() * 70), // Random between 30-100%
        unit: "percent",
        source: "appleWatch",
        timestamp: date,
        metadata: JSON.stringify({
          hrvScore: Math.floor(Math.random() * 100),
          sleepQualityFactor: Math.floor(Math.random() * 100),
          restingHeartRate: 55 + Math.floor(Math.random() * 10)
        })
      });
    }
    
    // Daily steps
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      await db.insert(healthData).values({
        userId,
        type: "steps",
        value: 5000 + Math.floor(Math.random() * 7000), // Random between 5k-12k steps
        unit: "count",
        source: "appleWatch",
        timestamp: date,
        metadata: JSON.stringify({
          activeMinutes: 30 + Math.floor(Math.random() * 60),
          distance: (3 + Math.random() * 6).toFixed(2)
        })
      });
    }
    
    console.log("Health data added.");
  } else {
    console.log("Health data already exists.");
  }

  console.log("Database seeding complete!");
}

seed()
  .catch(e => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seed script completed.");
    process.exit(0);
  });