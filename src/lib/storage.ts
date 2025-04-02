// Local storage implementation to replace Firebase

// Save user info and return user ID
export const saveUserInfo = async (name: string, phone: string) => {
  const userId = Math.random().toString(36).substring(2, 15);
  const userData = { name, phone, createdAt: new Date().toISOString() };

  // Store in localStorage
  localStorage.setItem(`user_${userId}`, JSON.stringify(userData));

  // Also maintain a list of all users
  const userList = JSON.parse(localStorage.getItem("userList") || "[]");
  userList.push(userId);
  localStorage.setItem("userList", JSON.stringify(userList));

  return userId;
};

// Save user predictions
export const saveUserPredictions = async (
  userId: string,
  userPredictions: Record<string, string>
) => {
  // Check if user exists
  const userData = localStorage.getItem(`user_${userId}`);
  if (!userData) {
    throw new Error("User not found");
  }

  // Store predictions
  localStorage.setItem(
    `predictions_${userId}`,
    JSON.stringify(userPredictions)
  );
  return true;
};

// Get user predictions
export const getUserPredictions = async (userId: string) => {
  const predictionsData = localStorage.getItem(`predictions_${userId}`);
  return predictionsData ? JSON.parse(predictionsData) : null;
};

// Get user info
export const getUserInfo = async (userId: string) => {
  const userData = localStorage.getItem(`user_${userId}`);
  return userData ? JSON.parse(userData) : null;
};

// Get all users (for admin purposes if needed)
export const getAllUsers = async () => {
  const userList = JSON.parse(localStorage.getItem("userList") || "[]");
  return userList
    .map((userId: string) => {
      const userData = localStorage.getItem(`user_${userId}`);
      return userData ? { id: userId, ...JSON.parse(userData) } : null;
    })
    .filter(Boolean);
};
