import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ForumPost } from "@shared/schema";

export default function AdminForums() {
  const { toast } = useToast();

  const { data: posts, isLoading } = useQuery<
    (ForumPost & { author: { name: string } })[]
  >({
    queryKey: ["/api/forums"],
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/forums/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forums"] });
      toast({
        title: "Post deleted",
        description: "Forum post has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Moderate Forums</h1>
        <p className="text-muted-foreground">
          Review and moderate student forum posts
        </p>
      </div>

      {posts && posts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No forum posts yet</p>
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
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deletePostMutation.mutate(post.id)}
                    disabled={deletePostMutation.isPending}
                    data-testid={`button-delete-${post.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
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
