// src/app/actions.ts
"use server";

import {
  getUserPredictions,
  saveUserInfo,
  saveUserPredictions,
} from "@/lib/mongodb";
import { z } from "zod";

// Optional: Define schema here too for validation within the action
const registerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
});

// Define or import a common ActionResult type if desired
interface ActionResultBase {
  success: boolean;
  error?: string;
}

// Define the return type for better handling in the component
interface ActionResult {
  success: boolean;
  userId?: string;
  error?: string;
}

interface RegisterActionResult extends ActionResultBase {
  userId?: string;
}

interface GetPredictionsResult extends ActionResultBase {
  predictions?: Record<string, string> | null;
}

export async function registerUserAction(
  formData: FormData
): Promise<ActionResult> {
  // Extract data (alternative: pass plain object instead of FormData)
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  // Validate using Zod (server-side validation is crucial)
  const validation = registerSchema.safeParse({ name, phone });
  if (!validation.success) {
    // Combine errors for a user-friendly message
    const errorMessages = validation.error.errors
      .map((e) => e.message)
      .join(", ");
    return { success: false, error: `Invalid input: ${errorMessages}` };
  }

  try {
    const userId = await saveUserInfo(
      validation.data.name,
      validation.data.phone
    );
    return { success: true, userId: userId };
  } catch (error) {
    console.error("Error in registerUserAction:", error);
    // Return a generic error message to the client
    return {
      success: false,
      error: "Failed to register user. Please try again.",
    };
  }
}

// Action to save predictions
export async function savePredictionsAction(
  userId: string,
  predictions: Record<string, string>
): Promise<Omit<ActionResult, "userId">> {
  // Omit userId as it's not returned here
  console.log("--- savePredictionsAction started ---");
  if (!userId || !predictions || Object.keys(predictions).length === 0) {
    console.log("Action: Invalid input - Missing userId or predictions");
    return { success: false, error: "Invalid data provided." };
  }

  try {
    // Add validation if needed for the predictions object structure/content
    console.log(`Action: Calling saveUserPredictions for userId: ${userId}`);
    await saveUserPredictions(userId, predictions);
    console.log("Action: saveUserPredictions successful.");
    console.log("--- savePredictionsAction returning success ---");
    return { success: true };
  } catch (error) {
    console.error("--- savePredictionsAction ERROR ---:", error);
    console.log("--- savePredictionsAction returning failure ---");
    return {
      success: false,
      error: "Failed to save predictions. Please try again.",
    };
  }
}

export async function getPredictionsAction(
  userId: string
): Promise<GetPredictionsResult> {
  console.log("--- getPredictionsAction started ---");
  if (!userId) {
    console.log("Action: Invalid input - Missing userId");
    return { success: false, error: "User ID is required." };
  }

  try {
    console.log(`Action: Calling getUserPredictions for userId: ${userId}`);
    const predictions = await getUserPredictions(userId); // Call the original function
    console.log("Action: getUserPredictions successful.");
    console.log("--- getPredictionsAction returning success ---");
    // Return the predictions along with success status
    return { success: true, predictions: predictions };
  } catch (error) {
    console.error("--- getPredictionsAction ERROR ---:", error);
    console.log("--- getPredictionsAction returning failure ---");
    // Return an error indication
    return {
      success: false,
      error: "Failed to load predictions. Please try again.",
    };
  }
}
