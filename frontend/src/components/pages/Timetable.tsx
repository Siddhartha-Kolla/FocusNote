import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User } from "lucide-react";

export function Timetable() {
  const currentWeek = "March 18 - 22, 2024";
  const currentDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = new Date().getHours() * 60 + new Date().getMinutes(); // Current time in minutes

  const timeSlots = [
    { time: "08:00", minutes: 480 },
    { time: "09:00", minutes: 540 },
    { time: "10:00", minutes: 600 },
    { time: "11:00", minutes: 660 },
    { time: "12:00", minutes: 720 },
    { time: "13:00", minutes: 780 },
    { time: "14:00", minutes: 840 },
    { time: "15:00", minutes: 900 },
    { time: "16:00", minutes: 960 },
    { time: "17:00", minutes: 1020 }
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const subjects = {
    physics: { name: "Physics", color: "bg-blue-100 border-blue-300 text-blue-800", room: "Lab 1", teacher: "Dr. Smith" },
    math: { name: "Mathematics", color: "bg-green-100 border-green-300 text-green-800", room: "A-201", teacher: "Ms. Johnson" },
    chemistry: { name: "Chemistry", color: "bg-purple-100 border-purple-300 text-purple-800", room: "Lab 2", teacher: "Dr. Wilson" },
    english: { name: "English", color: "bg-orange-100 border-orange-300 text-orange-800", room: "B-105", teacher: "Mr. Brown" },
    history: { name: "History", color: "bg-red-100 border-red-300 text-red-800", room: "C-301", teacher: "Ms. Davis" },
    biology: { name: "Biology", color: "bg-emerald-100 border-emerald-300 text-emerald-800", room: "Lab 3", teacher: "Dr. Garcia" },
    german: { name: "German", color: "bg-yellow-100 border-yellow-300 text-yellow-800", room: "B-204", teacher: "Frau Mueller" },
    pe: { name: "Physical Education", color: "bg-indigo-100 border-indigo-300 text-indigo-800", room: "Gym", teacher: "Coach Miller" },
    art: { name: "Art", color: "bg-pink-100 border-pink-300 text-pink-800", room: "Art Room", teacher: "Ms. Taylor" },
    break: { name: "Break", color: "bg-gray-100 border-gray-300 text-gray-600", room: "", teacher: "" }
  };

  // Demo timetable data
  const timetable = {
    Monday: [
      { subject: "math", startTime: "08:00", endTime: "09:30", duration: 90 },
      { subject: "break", startTime: "09:30", endTime: "09:45", duration: 15 },
      { subject: "physics", startTime: "09:45", endTime: "11:15", duration: 90 },
      { subject: "break", startTime: "11:15", endTime: "11:30", duration: 15 },
      { subject: "english", startTime: "11:30", endTime: "12:30", duration: 60 },
      { subject: "break", startTime: "12:30", endTime: "13:30", duration: 60 },
      { subject: "chemistry", startTime: "13:30", endTime: "15:00", duration: 90 },
    ],
    Tuesday: [
      { subject: "german", startTime: "08:00", endTime: "09:00", duration: 60 },
      { subject: "history", startTime: "09:00", endTime: "10:30", duration: 90 },
      { subject: "break", startTime: "10:30", endTime: "10:45", duration: 15 },
      { subject: "math", startTime: "10:45", endTime: "12:15", duration: 90 },
      { subject: "break", startTime: "12:15", endTime: "13:15", duration: 60 },
      { subject: "biology", startTime: "13:15", endTime: "14:45", duration: 90 },
      { subject: "art", startTime: "14:45", endTime: "16:15", duration: 90 },
    ],
    Wednesday: [
      { subject: "physics", startTime: "08:00", endTime: "09:30", duration: 90 },
      { subject: "break", startTime: "09:30", endTime: "09:45", duration: 15 },
      { subject: "english", startTime: "09:45", endTime: "11:15", duration: 90 },
      { subject: "break", startTime: "11:15", endTime: "11:30", duration: 15 },
      { subject: "pe", startTime: "11:30", endTime: "13:00", duration: 90 },
      { subject: "break", startTime: "13:00", endTime: "14:00", duration: 60 },
      { subject: "math", startTime: "14:00", endTime: "15:30", duration: 90 },
    ],
    Thursday: [
      { subject: "chemistry", startTime: "08:00", endTime: "09:30", duration: 90 },
      { subject: "break", startTime: "09:30", endTime: "09:45", duration: 15 },
      { subject: "german", startTime: "09:45", endTime: "11:15", duration: 90 },
      { subject: "break", startTime: "11:15", endTime: "11:30", duration: 15 },
      { subject: "biology", startTime: "11:30", endTime: "13:00", duration: 90 },
      { subject: "break", startTime: "13:00", endTime: "14:00", duration: 60 },
      { subject: "history", startTime: "14:00", endTime: "15:00", duration: 60 },
      { subject: "art", startTime: "15:00", endTime: "16:00", duration: 60 },
    ],
    Friday: [
      { subject: "english", startTime: "08:00", endTime: "09:00", duration: 60 },
      { subject: "math", startTime: "09:00", endTime: "10:30", duration: 90 },
      { subject: "break", startTime: "10:30", endTime: "10:45", duration: 15 },
      { subject: "pe", startTime: "10:45", endTime: "12:15", duration: 90 },
      { subject: "break", startTime: "12:15", endTime: "13:15", duration: 60 },
      { subject: "physics", startTime: "13:15", endTime: "14:15", duration: 60 },
    ]
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const isCurrentTime = (startTime: string, endTime: string) => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    return currentTime >= start && currentTime <= end;
  };

  const getCurrentTimePosition = () => {
    const startOfDay = 8 * 60; // 8:00 AM in minutes
    const endOfDay = 17 * 60; // 5:00 PM in minutes
    const totalMinutes = endOfDay - startOfDay;
    const currentFromStart = currentTime - startOfDay;
    
    if (currentTime < startOfDay || currentTime > endOfDay) return null;
    
    return (currentFromStart / totalMinutes) * 100;
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2 text-3xl">Timetable</h1>
            <p className="text-muted-foreground">Your weekly class schedule</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="rounded-xl">
              <Calendar className="mr-2 h-4 w-4" />
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="rounded-lg p-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-2">
                <span className="text-sm">{currentWeek}</span>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg p-2">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Timetable Grid */}
        <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
          <div className="grid grid-cols-6 bg-muted/30">
            {/* Time column header */}
            <div className="p-4 border-r border-border">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Time</span>
              </div>
            </div>
            
            {/* Day headers */}
            {days.map((day, index) => (
              <div 
                key={day} 
                className={`p-4 border-r border-border text-center ${
                  index + 1 === currentDay ? 'bg-primary/10 text-primary' : ''
                }`}
              >
                <div className="text-sm mb-1">{day}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(2024, 2, 18 + index).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Timetable Body */}
          <div className="relative">
            {/* Current time indicator */}
            {currentTimePosition && currentDay > 0 && currentDay < 6 && (
              <div 
                className="absolute left-0 right-0 z-20 border-t-2 border-red-500"
                style={{ top: `${currentTimePosition}%` }}
              >
                <div className="absolute left-2 top-0 transform -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Now
                </div>
              </div>
            )}

            <div className="grid grid-cols-6 min-h-[600px]">
              {/* Time column */}
              <div className="border-r border-border bg-muted/10">
                {timeSlots.map((slot, index) => (
                  <div key={slot.time} className="h-16 border-b border-border p-2 text-sm text-muted-foreground">
                    {slot.time}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {days.map((day, dayIndex) => (
                <div key={day} className="border-r border-border relative">
                  {/* Time slot grid background */}
                  {timeSlots.map((slot, timeIndex) => (
                    <div key={`${day}-${slot.time}`} className="h-16 border-b border-border"></div>
                  ))}
                  
                  {/* Classes */}
                  <div className="absolute inset-0">
                    {timetable[day as keyof typeof timetable]?.map((classItem, classIndex) => {
                      const subject = subjects[classItem.subject as keyof typeof subjects];
                      const startMinutes = timeToMinutes(classItem.startTime);
                      const startOfTimetable = 8 * 60; // 8:00 AM
                      const minutesFromStart = startMinutes - startOfTimetable;
                      const topPosition = (minutesFromStart / 60) * 64; // 64px per hour
                      const height = (classItem.duration / 60) * 64; // Height based on duration
                      
                      const isCurrentClass = isCurrentTime(classItem.startTime, classItem.endTime) && 
                                           dayIndex + 1 === currentDay;

                      return (
                        <div
                          key={classIndex}
                          className={`absolute left-1 right-1 rounded-lg border-l-4 p-2 ${subject.color} ${
                            isCurrentClass ? 'ring-2 ring-primary shadow-lg' : 'shadow-sm'
                          }`}
                          style={{
                            top: `${topPosition}px`,
                            height: `${height - 4}px`,
                            minHeight: '32px'
                          }}
                        >
                          <div className="h-full flex flex-col justify-between">
                            <div>
                              <div className="text-xs mb-1">{subject.name}</div>
                              {classItem.duration >= 60 && subject.room && (
                                <div className="text-xs opacity-80 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {subject.room}
                                </div>
                              )}
                            </div>
                            <div className="text-xs opacity-75">
                              {classItem.startTime} - {classItem.endTime}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Today's Classes Summary */}
        <Card className="mt-8 p-6 rounded-2xl border-0 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3>Today's Schedule</h3>
            <Badge variant="secondary" className="rounded-full">
              {currentDay > 0 && currentDay < 6 ? days[currentDay - 1] : 'Weekend'}
            </Badge>
          </div>
          
          {currentDay > 0 && currentDay < 6 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timetable[days[currentDay - 1] as keyof typeof timetable]
                ?.filter(classItem => classItem.subject !== 'break')
                .map((classItem, index) => {
                  const subject = subjects[classItem.subject as keyof typeof subjects];
                  const isUpcoming = timeToMinutes(classItem.startTime) > currentTime;
                  const isCurrent = isCurrentTime(classItem.startTime, classItem.endTime);
                  
                  return (
                    <div key={index} className={`p-4 rounded-xl border ${
                      isCurrent ? 'border-primary bg-primary/5' : 
                      isUpcoming ? 'border-secondary bg-secondary/5' : 'border-border'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm">{subject.name}</h4>
                        <Badge 
                          variant={isCurrent ? "default" : isUpcoming ? "secondary" : "outline"}
                          className="text-xs rounded-full"
                        >
                          {isCurrent ? "Now" : isUpcoming ? "Upcoming" : "Past"}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {classItem.startTime} - {classItem.endTime}
                        </div>
                        {subject.room && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {subject.room}
                          </div>
                        )}
                        {subject.teacher && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {subject.teacher}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No classes scheduled for today. Enjoy your weekend!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}