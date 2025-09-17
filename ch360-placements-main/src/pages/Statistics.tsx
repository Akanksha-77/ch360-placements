import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statisticsApi } from "@/lib/api";

export default function Statistics() {
  const { data: overview } = useQuery({
    queryKey: ["statistics-overview"],
    queryFn: () => statisticsApi.getOverview(),
  });

  const { data: allStats } = useQuery({
    queryKey: ["statistics-all"],
    queryFn: () => statisticsApi.getAll(),
  });

  const o = (overview as any) || {};
  const list = (allStats as any[]) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{o?.overview?.total_students ?? "-"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Placed Students</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{o?.overview?.placed_students ?? "-"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Placement %</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{o?.overview?.placement_percentage ?? "-"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg Salary</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{o?.overview?.average_salary ?? "-"}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Year-wise Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((s: any) => (
              <div key={s.id} className="border rounded p-3">
                <div className="font-semibold">{s.academic_year || "-"}</div>
                <div className="text-sm text-muted-foreground">Total: {s.total_students ?? "-"}</div>
                <div className="text-sm text-muted-foreground">Placed: {s.placed_students ?? "-"}</div>
                <div className="text-sm text-muted-foreground">Avg Salary: {s.average_salary ?? "-"}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


