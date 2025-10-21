import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, MapPin, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type ActivityItem = {
  type: "user" | "place_added" | "place_updated";
  message: string;
  timestamp: string;
  color: string;
};

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalPlaces: 0,
    activePlaces: 0,
    totalUsers: 0,
    cities: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    const [placesResult, usersResult, citiesResult] = await Promise.all([
      supabase.from("places").select("id, is_active", { count: "exact" }),
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("places").select("city"),
    ]);

    const activePlaces = placesResult.data?.filter((p) => p.is_active).length || 0;
    const uniqueCities = new Set(
      citiesResult.data?.filter((p) => p.city).map((p) => p.city)
    ).size;

    setStats({
      totalPlaces: placesResult.count || 0,
      activePlaces,
      totalUsers: usersResult.count || 0,
      cities: uniqueCities,
    });
  };

  const fetchRecentActivity = async () => {
    const activities: ActivityItem[] = [];

    const [usersResult, placesResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("places")
        .select("name, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

    if (usersResult.data) {
      usersResult.data.forEach((user) => {
        activities.push({
          type: "user",
          message: `New user registered: ${user.full_name || "Unknown"}`,
          timestamp: user.created_at,
          color: "bg-purple-500",
        });
      });
    }

    if (placesResult.data) {
      placesResult.data.forEach((place) => {
        const isNew = new Date(place.created_at).getTime() === new Date(place.updated_at).getTime();
        activities.push({
          type: isNew ? "place_added" : "place_updated",
          message: isNew ? `New place added: ${place.name}` : `Place updated: ${place.name}`,
          timestamp: place.updated_at,
          color: isNew ? "bg-green-500" : "bg-blue-500",
        });
      });
    }

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentActivity(activities.slice(0, 5));
  };

  const statCards = [
    {
      title: "Total Places",
      value: stats.totalPlaces,
      description: `${stats.activePlaces} active`,
      icon: Building2,
      color: "text-blue-500",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered users",
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Cities",
      value: stats.cities,
      description: "Unique locations",
      icon: MapPin,
      color: "text-purple-500",
    },
    {
      title: "Growth",
      value: "↑ 12%",
      description: "Last 30 days",
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          View key metrics and statistics for your properties
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 text-sm">
                  <div className={`w-2 h-2 rounded-full ${activity.color}`} />
                  <span className="flex-1">{activity.message}</span>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No recent activity</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
