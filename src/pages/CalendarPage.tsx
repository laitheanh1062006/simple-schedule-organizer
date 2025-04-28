
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

type ViewMode = "week" | "month";

const CalendarPage = () => {
  const { tasks } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  const tasksWithDeadline = tasks.filter((task) => task.deadline);
  
  const navigatePrevious = () => {
    if (viewMode === "week") {
      setCurrentDate((prev) => subWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => subMonths(prev, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === "week") {
      setCurrentDate((prev) => addWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => addMonths(prev, 1));
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRange = () => {
    if (viewMode === "week") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    } else {
      return format(currentDate, "MMMM yyyy");
    }
  };

  const getTasksForDate = (date: Date) => {
    return tasksWithDeadline.filter((task) => 
      task.deadline && isSameDay(new Date(task.deadline), date)
    );
  };

  const calculateStats = () => {
    const total = tasksWithDeadline.length;
    const completed = tasksWithDeadline.filter((task) => task.completed).length;
    const rate = total > 0 ? (completed / total * 100).toFixed(1) : "0.0";
    
    return { total, completed, rate };
  };

  const stats = calculateStats();

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="grid grid-cols-7 gap-4 mt-8">
        {days.map((day) => {
          const dayTasks = getTasksForDate(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div key={day.toISOString()} className="min-h-[150px]">
              <div className={cn(
                "text-center p-2 mb-2 rounded-t-md",
                isToday ? "bg-todoDesk-orange-accent text-white" : "bg-gray-100"
              )}>
                <div className="font-medium">{format(day, "EEE")}</div>
                <div className={isToday ? "font-bold" : ""}>{format(day, "d")}</div>
              </div>
              <div className="space-y-1">
                {dayTasks.map((task) => (
                  <div 
                    key={task.id}
                    className={cn(
                      "text-xs p-1 rounded truncate",
                      task.completed 
                        ? "bg-green-100 text-green-800" 
                        : "bg-todoDesk-orange-soft text-todoDesk-text"
                    )}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayTasks = getTasksForDate(cloneDay);
        const isCurrentMonth = cloneDay.getMonth() === currentDate.getMonth();
        const isToday = isSameDay(cloneDay, new Date());
        
        days.push(
          <div 
            key={cloneDay.toISOString()} 
            className={cn(
              "min-h-[100px] p-1 border",
              !isCurrentMonth && "bg-gray-50 text-gray-400",
              isToday && "bg-blue-50"
            )}
          >
            <div className={cn(
              "text-right text-sm mb-1",
              isToday && "font-bold text-todoDesk-orange-accent"
            )}>
              {format(cloneDay, "d")}
            </div>
            <div className="space-y-1">
              {dayTasks.slice(0, 3).map((task) => (
                <div 
                  key={task.id}
                  className={cn(
                    "text-xs p-1 rounded truncate",
                    task.completed 
                      ? "bg-green-100 text-green-800" 
                      : "bg-todoDesk-orange-soft text-todoDesk-text"
                  )}
                >
                  {task.title}
                </div>
              ))}
              {dayTasks.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{dayTasks.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={day.toISOString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    
    return (
      <>
        <div className="grid grid-cols-7 text-center py-2 bg-gray-100">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="mb-8">
          {rows}
        </div>
      </>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-todoDesk-text">Calendar</h1>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === "month" ? "default" : "outline"} 
            onClick={() => setViewMode("month")}
          >
            Month
          </Button>
          <Button 
            variant={viewMode === "week" ? "default" : "outline"}
            onClick={() => setViewMode("week")}
            className={viewMode === "week" ? "bg-gray-900" : ""}
          >
            Week
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={navigatePrevious}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={navigateToday}>Today</Button>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold ml-2">{getDateRange()}</h2>
        </div>
      </div>

      {viewMode === "week" && (
        <Card className="bg-white">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Weekly Task Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-gray-600">Total Tasks</div>
                <div className="text-3xl font-bold">{stats.total}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Completed</div>
                <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Completion Rate</div>
                <div className="text-3xl font-bold text-todoDesk-orange-accent">{stats.rate}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "week" ? renderWeekView() : renderMonthView()}
    </div>
  );
};

export default CalendarPage;
