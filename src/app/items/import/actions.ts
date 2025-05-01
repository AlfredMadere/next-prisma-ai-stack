"use server";

import { prisma } from "@/lib/prisma";
import { getVictimUser } from "@/lib/auth";
import { ActionResult, failure, success } from "@/lib/action-result";

// Type for the item data from CSV
interface ImportItemData {
  name: string;
  description?: string;
  type_id: string | number;
}

/**
 * Server action to import items from CSV data
 */
export async function importItems(items: ImportItemData[]): Promise<ActionResult<{ count: number }>> {
  try {
    // Get the current user
    const user = await getVictimUser();
    
    if (!user) {
      return failure("User not found");
    }

    // Validate that all required types exist
    const typeIds = [...new Set(items.map(item => String(item.type_id)))];
    const existingTypes = await prisma.type.findMany({
      where: {
        id: {
          in: typeIds
        }
      },
      select: {
        id: true
      }
    });

    const existingTypeIds = existingTypes.map(type => type.id);
    const missingTypeIds = typeIds.filter(id => !existingTypeIds.includes(id));

    // If there are missing types, create them with default names
    if (missingTypeIds.length > 0) {
      await Promise.all(
        missingTypeIds.map(typeId => 
          prisma.type.create({
            data: {
              id: typeId,
              name: `Type ${typeId}`,
              description: `Auto-generated type ${typeId}`
            }
          })
        )
      );
    }

    // Create all items in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdItems = await Promise.all(
        items.map(item => 
          tx.item.create({
            data: {
              name: item.name,
              description: item.description || null,
              userId: user.id,
              typeId: String(item.type_id)
            }
          })
        )
      );
      
      return createdItems.length;
    });

    return success({ count: result });
  } catch (error) {
    console.error("Error importing items:", error);
    return failure(error instanceof Error ? error.message : "Unknown error occurred");
  }
}
