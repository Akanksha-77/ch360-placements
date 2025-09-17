import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { feedbacksApi } from "@/lib/api";

export default function Feedbacks() {
  const { data } = useQuery({
    queryKey: ["feedbacks"],
    queryFn: () => feedbacksApi.getAll(),
  });
  const list = (data as any[]) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((f: any) => (
              <div key={f.id} className="border rounded p-3 space-y-1">
                <div className="font-semibold">Company: {f.company?.name || f.company || '-'}</div>
                <div className="text-sm">Overall: {f.overall_rating ?? '-'}/5</div>
                <div className="text-sm">Student Quality: {f.student_quality_rating ?? '-'}/5</div>
                {f.positive_feedback && <div className="text-sm">+ {f.positive_feedback}</div>}
                {f.improvement_areas && <div className="text-sm">- {f.improvement_areas}</div>}
                <div className="text-xs text-muted-foreground">Would visit again: {f.would_visit_again ? 'Yes' : 'No'}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


