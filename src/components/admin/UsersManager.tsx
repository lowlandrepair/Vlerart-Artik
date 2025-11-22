import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, ShieldOff, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

export default function UsersManager() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const [profilesResult, rolesResult] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);

      if (profilesResult.error) {
        console.error("Error fetching users:", profilesResult.error);
        toast.error(`Error fetching users: ${profilesResult.error.message}`);
      } else {
        setProfiles(profilesResult.data || []);
      }

      if (rolesResult.error) {
        console.error("Error fetching roles:", rolesResult.error);
        toast.error(`Error fetching roles: ${rolesResult.error.message}`);
      } else {
        const rolesMap: Record<string, string[]> = {};
        rolesResult.data?.forEach((role: UserRole) => {
          if (!rolesMap[role.user_id]) {
            rolesMap[role.user_id] = [];
          }
          rolesMap[role.user_id].push(role.role);
        });
        setRoles(rolesMap);
      }
    } catch (error) {
      console.error("Unexpected error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    // First, remove all existing roles for this user
    const { error: deleteError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      toast.error("Error updating role");
      return;
    }

    // Then add the new role (if not 'user', as that's the default)
    if (newRole !== "user") {
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role: newRole as "admin" | "moderator" | "user" }]);

      if (insertError) {
        toast.error("Error updating role");
        return;
      }
    }

    toast.success("Role updated successfully");
    fetchUsers();
  };

  const getCurrentRole = (userId: string): string => {
    const userRoles = roles[userId] || [];
    if (userRoles.includes("admin")) return "admin";
    if (userRoles.includes("moderator")) return "moderator";
    return "user";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">User Management</h2>
        <p className="text-muted-foreground">
          Manage user roles and permissions
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No users found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {profiles.map((profile) => {
            const currentRole = getCurrentRole(profile.id);
            return (
              <Card key={profile.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      currentRole === "admin" ? "bg-red-500/10 text-red-500" :
                      currentRole === "moderator" ? "bg-blue-500/10 text-blue-500" :
                      "bg-gray-500/10 text-gray-500"
                    }`}>
                      {currentRole === "admin" ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        {profile.full_name || "No name"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile.email || "No email"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Select
                      value={currentRole}
                      onValueChange={(value) => handleRoleChange(profile.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
