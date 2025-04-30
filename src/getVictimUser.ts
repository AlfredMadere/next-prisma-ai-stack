"use server";

export default async function getVictimUser() {
  const victimUserId = process.env.VICTIM_USER_ID;
  if (!victimUserId) {
    throw new Error("VICTIM_USER_ID is not defined");
  }
  return victimUserId;
}