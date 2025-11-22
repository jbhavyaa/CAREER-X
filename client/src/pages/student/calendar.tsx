import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import type { Event } from "@shared/schema";

export default function StudentCalendar() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

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
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Placement Calendar
        </h1>
        <p className="text-muted-foreground">
          View upcoming placement events and deadlines
        </p>
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
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{eventDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{event.eventTime}</span>
                      </div>
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
