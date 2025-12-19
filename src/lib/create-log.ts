import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function createLog(tenantId: string, action: string, entityType: string, entityId: string, details: string) {
  try {
    const user = await currentUser();
    
    if (!user) return;

    await db.auditLog.create({
      data: {
        tenantId,
        action,
        entityType,
        entityId,
        details,
        userId: user.id,
        userEmail: user.emailAddresses[0].emailAddress
      }
    });
  } catch (error) {
    console.log("Error al crear log:", error);
  }
}