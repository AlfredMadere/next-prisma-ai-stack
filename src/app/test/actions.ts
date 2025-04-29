"use server";

import type { User } from "@/generated/prisma/index";
import { prisma } from "@/lib/prisma";

// Define the return type for better type safety
export type UsersResult = { 
  users: User[] | null; 
  error: string | null 
};

/**
 * Server action to fetch all users from the database
 * @returns Promise containing users array or error message
 */
export async function fetchUsers(): Promise<UsersResult> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { users, error: null };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { users: null, error: "Failed to fetch users. Please try again later." };
  }
}
