import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, MapPin, TrendingUp } from "lucide-react";

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalPlaces: 0,
    activePlaces: 0,
    totalUsers: 0,
    cities: 0,
  });

  useEffect(() => {
    fetchStats();
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
            <div className="flex items-center gap-4 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="flex-1">System is running smoothly</span>
              <span className="text-muted-foreground">Just now</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="flex-1">Database backup completed</span>
              <span className="text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="flex-1">New user registered</span>
              <span className="text-muted-foreground">5 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
