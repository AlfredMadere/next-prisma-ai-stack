import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchUsers } from "./actions";
import type { User } from "@/generated/prisma/index";

export default async function TestPage() {
  const { users, error } = await fetchUsers();

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">User List</h1>
        
        {error && (
          <div className="p-4 mb-6 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
        
        {users && users.length === 0 && (
          <div className="p-4 text-muted-foreground bg-muted rounded-md">
            No users found in the database.
          </div>
        )}
        
        {users && users.length > 0 && (
          <div className="grid gap-4">
            {users.map((user: User) => (
              <Card key={user.id} className="bg-card border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
