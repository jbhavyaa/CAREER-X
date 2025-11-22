import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Upload, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Ppt } from "@shared/schema";

export default function AdminPPTs() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: ppts, isLoading } = useQuery<Ppt[]>({
    queryKey: ["/api/ppts"],
  });

  const uploadPptMutation = useMutation({
    mutationFn: async (data: { companyName: string; file: File }) => {
      const formData = new FormData();
      formData.append("companyName", data.companyName);
      formData.append("ppt", data.file);
      const response = await fetch("/api/ppts", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ppts"] });
      setOpen(false);
      setCompanyName("");
      setSelectedFile(null);
      toast({
        title: "PPT uploaded",
        description: "Company presentation has been uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePptMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/ppts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Delete failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ppts"] });
      toast({
        title: "PPT deleted",
        description: "Company presentation has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && companyName) {
      uploadPptMutation.mutate({ companyName, file: selectedFile });
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage PPTs</h1>
          <p className="text-muted-foreground">
            Upload company presentations for students
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-ppt">
              <Plus className="h-4 w-4 mr-2" />
              Upload PPT
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Company PPT</DialogTitle>
              <DialogDescription>
                Upload a presentation file (PDF, max 10MB)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Google, Microsoft"
                  required
                  data-testid="input-company-name"
                />
              </div>

              <div className="space-y-2">
                <Label>PPT File</Label>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover-elevate transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="input-file"
                  />
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm">
                    {selectedFile ? selectedFile.name : "Click to select file"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF only, max 10MB
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setCompanyName("");
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedFile || uploadPptMutation.isPending}
                  data-testid="button-submit-ppt"
                >
                  {uploadPptMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {ppts && ppts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No presentations uploaded yet</p>
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
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deletePptMutation.mutate(ppt.id)}
                    disabled={deletePptMutation.isPending}
                    data-testid={`button-delete-${ppt.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
