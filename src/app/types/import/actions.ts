"use server";

import { prisma } from "@/lib/prisma";
import { ActionResult, failure, success } from "@/lib/action-result";

// Type for the type data from CSV
interface ImportTypeData {
  name: string;
  description?: string;
}

/**
 * Server action to import item types from CSV data
 */
export async function importTypes(types: ImportTypeData[]): Promise<ActionResult<{ count: number }>> {
  try {
    // Create all types in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdTypes = await Promise.all(
        types.map(type => 
          tx.type.create({
            data: {
              name: type.name,
              description: type.description || null
            }
          })
        )
      );
      
      return createdTypes.length;
    });

    return success({ count: result });
  } catch (error) {
    console.error("Error importing types:", error);
    return failure(error instanceof Error ? error.message : "Unknown error occurred");
  }
}
