import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download } from "lucide-react";
import type { Ppt } from "@shared/schema";

export default function StudentPPTs() {
  const { data: ppts, isLoading } = useQuery<Ppt[]>({
    queryKey: ["/api/ppts"],
  });

  const handleDownload = (fileUrl: string, companyName: string) => {
    window.open(fileUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Company Presentations
        </h1>
        <p className="text-muted-foreground">
          Download PPTs uploaded by the placement cell
        </p>
      </div>

      {ppts && ppts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No presentations available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ppts?.map((ppt) => (
            <Card
              key={ppt.id}
              className="hover-elevate transition-shadow"
              data-testid={`card-ppt-${ppt.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {ppt.companyName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(ppt.uploadedAt).toLocaleDateString()}
                    </p>
                    <Button
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() =>
                        handleDownload(ppt.fileUrl, ppt.companyName)
                      }
                      data-testid={`button-download-${ppt.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
