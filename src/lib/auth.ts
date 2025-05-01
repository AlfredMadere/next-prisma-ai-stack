"use server";

import { prisma } from "@/lib/prisma";
import { User } from "@/generated/prisma";

/**
 * Gets the victim user for development purposes
 * This app doesn't use authentication, so we use this to simulate a logged-in user
 */
export async function getVictimUser(): Promise<User | null> {
  try {
    // Get the victim user ID from environment variables
    const victimUserId = process.env.VICTIM_USER_ID;
    
    if (!victimUserId) {
      // If no victim user ID is set, get the first user or create one
      const firstUser = await prisma.user.findFirst();
      
      if (firstUser) {
        return firstUser;
      }
      
      // Create a default user if none exists
      return await prisma.user.create({
        data: {
          name: "Test User",
          email: "test@example.com"
        }
      });
    }
    
    // Try to find the user with the specified ID
    const user = await prisma.user.findUnique({
      where: {
        id: victimUserId
      }
    });
    
    if (user) {
      return user;
    }
    
    // If user not found with that ID, create a new one with that ID
    return await prisma.user.create({
      data: {
        id: victimUserId,
        name: "Victim User",
        email: "victim@example.com"
      }
    });
  } catch (error) {
    console.error("Error getting victim user:", error);
    return null;
  }
}
