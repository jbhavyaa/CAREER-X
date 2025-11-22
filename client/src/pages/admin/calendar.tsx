import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Edit } from "lucide-react";
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
import type { Event } from "@shared/schema";

export default function AdminCalendar() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
  });

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/events", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setOpen(false);
      resetForm();
      toast({
        title: "Event created",
        description: "Calendar event has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return await apiRequest("PATCH", `/api/events/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setOpen(false);
      resetForm();
      setEditingEvent(null);
      toast({
        title: "Event updated",
        description: "Calendar event has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/events/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event deleted",
        description: "Calendar event has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      eventDate: "",
      eventTime: "",
    });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data: formData });
    } else {
      createEventMutation.mutate(formData);
    }
  };

  const sortedEvents = events?.sort(
    (a, b) =>
      new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
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
          <h1 className="text-3xl font-bold text-foreground">
            Manage Calendar
          </h1>
          <p className="text-muted-foreground">
            Schedule placement events and deadlines
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              resetForm();
              setEditingEvent(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button data-testid="button-new-event">
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Edit Event" : "Create New Event"}
              </DialogTitle>
              <DialogDescription>
                Add event details for the placement calendar
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Google Campus Drive"
                  required
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Event details, venue, requirements..."
                  rows={4}
                  required
                  data-testid="input-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) =>
                      setFormData({ ...formData, eventDate: e.target.value })
                    }
                    required
                    data-testid="input-date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventTime">Time</Label>
                  <Input
                    id="eventTime"
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) =>
                      setFormData({ ...formData, eventTime: e.target.value })
                    }
                    required
                    data-testid="input-time"
                  />
                </div>
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
                  disabled={
                    createEventMutation.isPending ||
                    updateEventMutation.isPending
                  }
                  data-testid="button-submit-event"
                >
                  {editingEvent ? "Update Event" : "Create Event"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {events && events.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No events scheduled yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedEvents?.map((event) => {
            const eventDate = new Date(event.eventDate);
            const isUpcoming = eventDate >= new Date();

            return (
              <Card
                key={event.id}
                className="hover-elevate transition-shadow"
                data-testid={`card-event-${event.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {isUpcoming && (
                          <Badge className="bg-gold text-gold-foreground">
                            Upcoming
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end gap-1 mr-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{eventDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{event.eventTime}</span>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(event)}
                        data-testid={`button-edit-${event.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteEventMutation.mutate(event.id)}
                        disabled={deleteEventMutation.isPending}
                        data-testid={`button-delete-${event.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
