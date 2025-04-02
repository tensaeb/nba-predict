import mongoose, { Mongoose } from "mongoose"; // Import Mongoose type
import { TeamKey } from "./teams-config";

// Define the structure of the cached mongoose object
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// --- Define Interfaces for Documents (optional but recommended) ---
// These represent the plain JS object structure, useful for return types
interface UserDocument {
  _id: mongoose.Types.ObjectId | string; // Use string after .toString()
  name: string;
  phone: string;
  createdAt: Date;
}

interface PredictionDocument {
  _id: mongoose.Types.ObjectId | string;
  userId: UserDocument | mongoose.Types.ObjectId | string;
  predictions: Map<string, string>;
  // Ensure the schema potentially stores TeamKey or string, but define admin return type correctly
  champion: string | null; // Schema might store string, but we'll type the populated result
  createdAt: Date;
}

// Extend the NodeJS Global interface (or use 'globalThis' if preferred)
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

// MongoDB connection
const NEXT_PUBLIC_MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI || "";

if (!NEXT_PUBLIC_MONGODB_URI) {
  throw new Error(
    "Please define the NEXT_PUBLIC_MONGODB_URI environment variable"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Use the declared global type
let cached: MongooseCache = global.mongoose;

if (!cached) {
  // Initialize using the declared type
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<Mongoose> {
  // Add return type
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Ensure the promise resolves with the Mongoose instance
    cached.promise = mongoose
      .connect(NEXT_PUBLIC_MONGODB_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset promise on error to allow retry
    cached.promise = null;
    throw e;
  }

  if (!cached.conn) {
    // Handle potential null connection after await if error occurred but wasn't thrown
    throw new Error("MongoDB connection failed.");
  }
  return cached.conn;
}

// --- Mongoose Schemas ---
const UserSchema = new mongoose.Schema<UserDocument>({
  // Use interface as type hint
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PredictionSchema = new mongoose.Schema<
  Omit<PredictionDocument, "predictions"> & { predictions: Map<string, string> }
>({
  // Adjust for Map type
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  predictions: {
    type: Map,
    of: String,
    required: true, // Make sure predictions are actually saved
    default: () => new Map(), // Default to empty map
  },
  champion: {
    type: String,
    default: null, // Explicitly allow null
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// --- Mongoose Models ---
// Use the interfaces with the model types
export const User =
  (mongoose.models.User as mongoose.Model<UserDocument>) ||
  mongoose.model<UserDocument>("User", UserSchema);
export const Prediction =
  (mongoose.models.Prediction as mongoose.Model<PredictionDocument>) ||
  mongoose.model<PredictionDocument>("Prediction", PredictionSchema);

// --- Database Functions ---

// Save user info and return user ID
export async function saveUserInfo(
  name: string,
  phone: string
): Promise<string> {
  await connectToDatabase();

  const user = new User({
    name,
    phone,
  });

  await user.save();
  return user._id.toString();
}

// Save user predictions
export async function saveUserPredictions(
  userId: string,
  userPredictions: Record<string, string>
): Promise<boolean> {
  // Return type
  await connectToDatabase();

  // Find champion (F1 matchup winner)
  const champion = userPredictions.F1 || null;

  // Convert Record<string, string> to Map<string, string> for saving
  const predictionsMap = new Map(Object.entries(userPredictions));

  const prediction = new Prediction({
    userId,
    predictions: predictionsMap, // Save as Map
    champion,
  });

  await prediction.save();
  return true;
}

// Get user predictions
// Returns predictions as a plain object, or null if not found
export async function getUserPredictions(
  userId: string
): Promise<Record<string, string> | null> {
  await connectToDatabase();

  const prediction = await Prediction.findOne({ userId })
    .sort({
      createdAt: -1,
    })
    .lean(); // Use .lean() for plain JS object if not modifying

  if (!prediction || !prediction.predictions) return null;

  // If using .lean(), prediction.predictions might already be an object if Mongoose converts it.
  // If it's still a Map after .lean() (or if not using .lean()), convert it.
  if (prediction.predictions instanceof Map) {
    const predictionsObj: Record<string, string> = {};
    prediction.predictions.forEach((value: string, key: string) => {
      // Add types
      predictionsObj[key] = value; // Indexing is now safe
    });
    return predictionsObj;
  } else if (
    typeof prediction.predictions === "object" &&
    prediction.predictions !== null
  ) {
    // If .lean() converted it to a plain object already
    return prediction.predictions as Record<string, string>;
  }

  return null; // Should not happen if predictions field exists
}

// Get user info
export async function getUserInfo(
  userId: string
): Promise<UserDocument | null> {
  await connectToDatabase();
  // Use lean for performance if you only need the data
  const user = await User.findById(userId).lean();
  // No need for toObject() when using lean()
  return user ? user : null;
}

// Define the structure of the returned prediction object for admin
export interface AdminPrediction
  extends Omit<
    PredictionDocument,
    "userId" | "predictions" | "_id" | "champion"
  > {
  // Omit original champion type
  _id: string;
  userId: UserDocument | null;
  // Champion uses the specific TeamKey type now
  champion: TeamKey | null; // <<< Ensure this uses TeamKey
  predictions: Record<string, string>;
}

// Ensure getAllPredictions uses this interface in its return type Promise<AdminPrediction[]>
export async function getAllPredictions(): Promise<AdminPrediction[]> {
  await connectToDatabase();

  const predictions = await Prediction.find()
    .sort({ createdAt: -1 })
    .populate<{ userId: UserDocument | null }>("userId")
    .lean(); // Use lean for plain JS objects

  // Map and potentially assert/validate the champion field type if needed
  return predictions.map((prediction): AdminPrediction => {
    let predictionsObj: Record<string, string> = {};
    if (prediction.predictions instanceof Map) {
      // ... map conversion ...
    } else if (
      typeof prediction.predictions === "object" &&
      prediction.predictions !== null
    ) {
      predictionsObj = prediction.predictions as Record<string, string>;
    }

    // Perform a runtime check/assertion if necessary, though lean + schema default might handle it
    const championKey = prediction.champion as TeamKey | null;

    return {
      ...prediction,
      _id: prediction._id.toString(),
      userId: prediction.userId,
      // Use the potentially asserted champion key
      champion: championKey, // <-- Assign the value, ensure it aligns with TeamKey | null
      predictions: predictionsObj,
    };
  });
}
