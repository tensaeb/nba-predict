import mongoose, { Mongoose, Model, Document, Schema } from "mongoose";
import type { TeamKey, NbaTeamKey } from "./teams-config"; // Import specific key types

// --- Type Definitions ---

// For Mongoose connection caching
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Base Document Interface (adding common Mongoose fields)
interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the User data structure (as stored/retrieved)
export interface UserData extends BaseDocument {
  _id: mongoose.Types.ObjectId; // Keep as ObjectId internally
  name: string;
  phone?: string; // Make optional
}

// Interface for the Prediction data structure (as stored/retrieved)
export interface PredictionData extends BaseDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | UserData | null; // Populated type
  predictions: Map<string, string>; // Stored as Map
  champion: NbaTeamKey | null; // Use the specific NbaTeamKey
}

// Interface for User data returned to client (Lean & Serializable)
export interface UserInfo {
  _id: string;
  name: string;
  phone?: string;
  createdAt: string; // Use ISO string for serialization
  updatedAt: string;
}

// Interface for Admin page data (Lean & Serializable)
export interface AdminPrediction {
  _id: string;
  // UserInfo can be null if population fails or user deleted
  userId: Pick<UserInfo, "_id" | "name" | "phone"> | null; // Only include needed fields, string IDs
  predictions: Record<string, string>; // Use plain object for client
  champion: NbaTeamKey | null; // Use the specific NbaTeamKey
  createdAt: string; // Use ISO string for serialization
  updatedAt: string;
}

// --- Global Declaration for Mongoose Cache ---
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

// --- MongoDB Connection ---

// --- CRITICAL SECURITY FIX: Use non-public environment variable ---
const NEXT_PUBLIC_MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI;

if (!NEXT_PUBLIC_MONGODB_URI) {
  // Update error message
  throw new Error(
    "Please define the NEXT_PUBLIC_MONGODB_URI environment variable (not NEXT_PUBLIC_NEXT_PUBLIC_MONGODB_URI)"
  );
}

// Initialize cache using the declared global type
let cached: MongooseCache = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<Mongoose> {
  if (cached.conn) {
    // console.log("Using cached DB connection.");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    // console.log("Creating new DB connection.");
    // Use the correct, non-public URI
    cached.promise = mongoose
      .connect(NEXT_PUBLIC_MONGODB_URI as string, opts)
      .then((mongooseInstance) => {
        // console.log("DB Connected.");
        return mongooseInstance;
      })
      .catch((error) => {
        console.error("DB Connection Error:", error);
        cached.promise = null; // Reset promise on error
        throw error; // Re-throw
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Ensure promise is reset on await error too
    throw e;
  }

  if (!cached.conn) {
    // This case should ideally be covered by the catch block, but good failsafe
    throw new Error("MongoDB connection failed after attempting connection.");
  }

  return cached.conn;
}

// --- Mongoose Schemas ---
// Use 'timestamps: true' for automatic createdAt/updatedAt
const UserSchema = new Schema<UserData>(
  {
    name: { type: String, required: true, trim: true },
    // Make phone optional and unique only if provided (sparse index)
    phone: {
      type: String,
      required: false,
      trim: true,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

const PredictionSchema = new Schema<PredictionData>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    predictions: {
      type: Map,
      of: String,
      required: true,
      default: () => new Map(), // Ensure default is a function returning new Map
    },
    // Store as String, validate type on retrieval if needed
    champion: { type: String, default: null },
  },
  { timestamps: true }
);

// --- Mongoose Models ---
// Use the interfaces for type hinting the models
export const User: Model<UserData> =
  mongoose.models.User || mongoose.model<UserData>("User", UserSchema);

// Similar logic for Prediction model:
export const Prediction: Model<PredictionData> =
  mongoose.models.Prediction ||
  mongoose.model<PredictionData>("Prediction", PredictionSchema);

// --- Helper: Convert Map to Record ---
function mapToRecord(
  map: Map<string, string> | undefined | null
): Record<string, string> {
  const record: Record<string, string> = {};
  if (map instanceof Map) {
    map.forEach((value, key) => {
      record[key] = value;
    });
  }
  // If lean already converted it or it's null/undefined, return the (potentially empty) record
  else if (typeof map === "object" && map !== null) {
    // Assume it's already a Record-like object from .lean()
    return map as Record<string, string>;
  }
  return record;
}

// --- Database Functions (Server-Side Usage Only) ---

/** Saves user info and returns the new user's ID as a string. */
export async function saveUserInfo(
  name: string,
  phone?: string
): Promise<string> {
  await connectDB();
  // Only include phone if it's provided
  const userData: Partial<UserData> = { name };
  if (phone) {
    userData.phone = phone;
  }
  const user = new User(userData);
  await user.save();
  return user._id.toString();
}

/** Saves user predictions. */
export async function saveUserPredictions(
  userId: string,
  userPredictions: Record<string, string> // Input is plain object
): Promise<void> {
  // Return void; throw errors on failure
  await connectDB();

  const champion = (userPredictions.F1 as NbaTeamKey) || null; // Extract and type champion

  // Convert input Record to Map for saving
  const predictionsMap = new Map(Object.entries(userPredictions));

  const prediction = new Prediction({
    userId,
    predictions: predictionsMap, // Save the Map
    champion,
  });

  await prediction.save();
  // No return needed on success, error will be thrown on failure
}

/** Gets the latest predictions for a user as a plain object. */
export async function getUserPredictions(
  userId: string
): Promise<Record<string, string> | null> {
  await connectDB();

  const prediction = await Prediction.findOne({ userId })
    .sort({ createdAt: -1 })
    .lean<PredictionData>() // Use lean and type the result
    .exec();

  if (!prediction) return null;

  // Convert Map (or potentially object from lean) to Record
  return mapToRecord(prediction.predictions);
}

/** Gets user info as a plain, serializable object. */
export async function getUserInfo(userId: string): Promise<UserInfo | null> {
  await connectDB();
  const user = await User.findById(userId)
    .lean<UserData>() // Type the lean result
    .exec();

  if (!user) return null;

  // Map to the serializable UserInfo interface
  return {
    _id: user._id.toString(),
    name: user.name,
    phone: user.phone,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/** Gets all predictions, populated with user info, for the admin page. */
export async function getAllPredictions(): Promise<AdminPrediction[]> {
  await connectDB();

  // Execute the query and explicitly type the expected result array
  const predictionsData: PredictionData[] | null = await Prediction.find()
    .sort({ createdAt: -1 })
    .populate<{ userId: UserData | null }>(
      "userId",
      "name phone _id createdAt updatedAt"
    )
    .lean<PredictionData[]>() // Ensure this returns an array
    .exec();

  // --- FIX: Check if the result is actually an array before mapping ---
  if (!predictionsData || !Array.isArray(predictionsData)) {
    return []; // Return an empty array if exec returned null or not an array
  }

  // --- FIX: Explicitly type 'p' in the map callback ---
  // Now that predictionsData is confirmed as PredictionData[], map over it.
  return predictionsData.map((p: PredictionData): AdminPrediction => {
    // Type 'p' explicitly as PredictionData for clarity and to resolve the 'any' type error.
    const populatedUser = p.userId as UserData | null; // userId is already typed via populate

    // Ensure required fields exist before accessing them (though lean should include them)
    const createdAt = p.createdAt
      ? p.createdAt.toISOString()
      : new Date().toISOString();
    const updatedAt = p.updatedAt
      ? p.updatedAt.toISOString()
      : new Date().toISOString();
    const id = p._id ? p._id.toString() : ""; // Add fallback if needed, though unlikely

    return {
      _id: id,
      userId: populatedUser
        ? {
            _id: populatedUser._id.toString(), // Ensure populated user fields exist
            name: populatedUser.name,
            phone: populatedUser.phone,
          }
        : null,
      // Use the specific NbaTeamKey type for champion
      champion: p.champion as NbaTeamKey | null,
      predictions: mapToRecord(p.predictions), // Use helper
      createdAt: createdAt,
      updatedAt: updatedAt,
    };
  });
}
