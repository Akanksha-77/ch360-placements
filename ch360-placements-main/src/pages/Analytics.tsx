import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsApi } from "@/lib/api";
import { TrendsLineChart, MetricBarChart, MetricsPieChart } from "@/components/ui/chart";

export default function Analytics() {
  const { data: trends } = useQuery({
    queryKey: ["analytics-trends"],
    queryFn: () => analyticsApi.getTrends(),
  });
  const { data: nirf } = useQuery({
    queryKey: ["analytics-nirf"],
    queryFn: () => analyticsApi.getNirfReport(),
  });

  const trendData = useMemo(() => (trends as any)?.trends || (trends as any)?.data || [], [trends])
  const nirfMetrics = useMemo(() => (nirf as any)?.nirf_metrics || (nirf as any)?.metrics || [], [nirf])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Placement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendsLineChart data={trendData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>NIRF Metrics (Bar)</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricBarChart data={nirfMetrics} x="metric" y="value" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>NIRF Metrics (Breakdown)</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricsPieChart data={nirfMetrics} nameKey="metric" dataKey="value" />
        </CardContent>
      </Card>
    </div>
  );
}


