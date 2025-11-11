import { IRowRelationshipsDb } from "@/db/interfaces/entityBuilder/IRowRelationshipsDb";
import { prisma } from "@/db/config/prisma/database";
export class RowRelationshipsDbPrisma implements IRowRelationshipsDb {
  async getRowRelationship(id: string) {
    return await prisma.rowRelationship.findUnique({
      where: { id },
      include: {
        relationship: true,
      },
    });
  }

  async getRowsRelationship({ parentId, childId }: { parentId: string; childId: string }) {
    return await prisma.rowRelationship.findFirst({
      where: { parentId, childId },
    });
  }

  async createRowRelationship({
    parentId,
    childId,
    relationshipId,
    metadata,
  }: {
    parentId: string;
    childId: string;
    relationshipId: string;
    metadata: string | null;
  }) {
    return await prisma.rowRelationship
      .create({
        data: {
          parentId,
          childId,
          relationshipId,
          metadata,
        },
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log("Error creating row relationship: " + e.message);
      });
  }

  async deleteRowRelationship({ parentId, childId }: { parentId: string; childId: string }) {
    return await prisma.rowRelationship.deleteMany({
      where: {
        parentId,
        childId,
      },
    });
  }

  async deleteRowRelationshipById(id: string) {
    return await prisma.rowRelationship.delete({
      where: {
        id,
      },
    });
  }
}
