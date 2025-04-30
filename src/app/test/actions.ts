"use server";

import type { User } from "@/generated/prisma/index";
import { prisma } from "@/lib/prisma";
import { failure, success } from "@/lib/utils";
import { ActionResult } from "@/lib/types";

/**
 * Server action to fetch all users from the database
 * @returns Promise containing users array or error message
 */
export async function fetchUsers(): Promise<ActionResult<User[]>> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return success(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return failure(error)
  }
}
