import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ForumPost } from "@shared/schema";

export default function StudentForums() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    title: "",
    content: "",
  });

  const { data: posts, isLoading } = useQuery<
    (ForumPost & { author: { name: string } })[]
  >({
    queryKey: ["/api/forums"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/forums", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forums"] });
      setOpen(false);
      setFormData({ companyName: "", title: "", content: "" });
      toast({
        title: "Post created",
        description: "Your interview experience has been shared",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPostMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Interview Forums
          </h1>
          <p className="text-muted-foreground">
            Share and read interview experiences
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-post">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Share Interview Experience</DialogTitle>
              <DialogDescription>
                Share your interview experience to help fellow students
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  placeholder="e.g., Google, Microsoft"
                  required
                  data-testid="input-company-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Software Engineer Interview Experience"
                  required
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Experience</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Share your interview rounds, questions asked, tips, etc."
                  rows={6}
                  required
                  data-testid="input-content"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPostMutation.isPending}
                  data-testid="button-submit-post"
                >
                  {createPostMutation.isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {posts && posts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Be the first to share an interview experience
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts?.map((post) => (
            <Card key={post.id} data-testid={`card-post-${post.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-gold text-gold-foreground">
                        {post.companyName}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <span>By {post.author.name}</span>
                      <span>•</span>
                      <span>
                        {new Date(post.postedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {post.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
