import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Clock, MapPin, Users } from "lucide-react"

const upcomingEvents = [
  {
    id: "1",
    title: "Team Meeting",
    date: "2024-01-20",
    time: "10:00 AM",
    duration: "1 hour",
    location: "Conference Room A",
    attendees: ["John Doe", "Jane Smith", "Bob Johnson"],
    type: "meeting",
  },
  {
    id: "2",
    title: "Product Launch",
    date: "2024-01-25",
    time: "2:00 PM",
    duration: "2 hours",
    location: "Virtual",
    attendees: ["Marketing Team", "Sales Team"],
    type: "event",
  },
  {
    id: "3",
    title: "Client Presentation",
    date: "2024-01-22",
    time: "11:30 AM",
    duration: "45 minutes",
    location: "Client Office",
    attendees: ["Alice Brown", "Charlie Wilson"],
    type: "presentation",
  },
  {
    id: "4",
    title: "Weekly Standup",
    date: "2024-01-21",
    time: "9:00 AM",
    duration: "30 minutes",
    location: "Slack",
    attendees: ["Development Team"],
    type: "standup",
  },
]

const recentEvents = [
  {
    id: "1",
    title: "Monthly Review",
    date: "2024-01-15",
    status: "completed",
    attendees: 8,
  },
  {
    id: "2",
    title: "Training Session",
    date: "2024-01-12",
    status: "completed",
    attendees: 12,
  },
  {
    id: "3",
    title: "Strategy Meeting",
    date: "2024-01-10",
    status: "completed",
    attendees: 6,
  },
]

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              Manage your schedule and upcoming events.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        {/* Calendar view */}
        <Card>
          <CardHeader>
            <CardTitle>January 2024</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] flex items-center justify-center text-muted-foreground border rounded-lg">
              Calendar component placeholder - Full calendar view would go here
            </div>
          </CardContent>
        </Card>

        {/* Upcoming events and recent events */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge
                            variant={
                              event.type === "meeting"
                                ? "default"
                                : event.type === "event"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {event.type}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{event.time} ({event.duration})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{event.attendees.length} attendees</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span>{event.date}</span>
                        <span>{event.attendees} attendees</span>
                      </div>
                    </div>
                    <Badge variant="outline">{event.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Events scheduled
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meetings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">
                Average attendance
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 