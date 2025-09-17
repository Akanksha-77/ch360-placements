import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { documentsApi } from "@/lib/api";

export default function Documents() {
  const { data } = useQuery({
    queryKey: ["documents"],
    queryFn: () => documentsApi.getAll(),
  });
  const list = (data as any[]) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((d: any) => (
              <div key={d.id} className="border rounded p-3 space-y-1">
                <div className="font-semibold">{d.title}</div>
                <div className="text-sm text-muted-foreground">Category: {d.category || '-'}</div>
                <div className="text-sm text-muted-foreground">Version: {d.version || '-'}</div>
                {d.file_url && (
                  <a className="text-blue-600 underline text-sm" href={d.file_url} target="_blank" rel="noreferrer">View</a>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


