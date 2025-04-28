
import { useState } from "react";
import { useAppContext, Task } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Trash2, FileText, Plus } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const TasksPage = () => {
  const { tasks, documents, addTask, updateTask, deleteTask, attachDocumentToTask, removeDocumentFromTask } = useAppContext();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle.trim(),
        completed: false,
        deadline: selectedDate,
      });
      setNewTaskTitle("");
      setSelectedDate(undefined);
      setShowAddTask(false);
    }
  };

  const handleToggleComplete = (taskId: string, completed: boolean) => {
    updateTask(taskId, { completed });
  };

  const getTaskDocuments = (task: Task) => {
    if (!task.documentIds?.length) return [];
    return documents.filter((doc) => task.documentIds?.includes(doc.id));
  };

  const handleAttachDocument = (taskId: string, documentId: string) => {
    attachDocumentToTask(taskId, documentId);
    setSelectedTask(null); // Close dialog
  };

  const handleRemoveDocument = (taskId: string, documentId: string) => {
    removeDocumentFromTask(taskId, documentId);
  };

  const availableDocumentsForTask = (task: Task) => {
    const taskDocIds = task.documentIds || [];
    return documents.filter((doc) => !taskDocIds.includes(doc.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-todoDesk-text">Tasks</h1>
        <Button
          onClick={() => setShowAddTask(true)}
          className="bg-todoDesk-orange-accent text-white hover:bg-orange-600"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Set deadline"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTask(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-todoDesk-orange-accent text-white hover:bg-orange-600"
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
            >
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Attachment Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        {selectedTask && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Manage Documents for "{selectedTask.title}"</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              <h3 className="font-medium">Attached Documents</h3>
              {getTaskDocuments(selectedTask).length > 0 ? (
                <div className="space-y-2">
                  {getTaskDocuments(selectedTask).map((doc) => (
                    <div key={doc.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <FileText size={16} className="mr-2" />
                        <span>{doc.name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveDocument(selectedTask.id, doc.id)}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents attached</p>
              )}

              <h3 className="font-medium pt-4">Available Documents</h3>
              {availableDocumentsForTask(selectedTask).length > 0 ? (
                <div className="space-y-2">
                  {availableDocumentsForTask(selectedTask).map((doc) => (
                    <div key={doc.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <FileText size={16} className="mr-2" />
                        <span>{doc.name}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAttachDocument(selectedTask.id, doc.id)}
                      >
                        Attach
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents available to attach</p>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <Card key={task.id} className={cn(task.completed ? "bg-gray-50" : "")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={task.completed}
                      onCheckedChange={(checked) => 
                        handleToggleComplete(task.id, checked as boolean)
                      }
                    />
                    <span className={cn(task.completed ? "line-through text-gray-500" : "text-todoDesk-text")}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {task.deadline && (
                      <span className="text-sm text-gray-500">
                        {format(new Date(task.deadline), "MMM d")}
                      </span>
                    )}
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedTask(task)}
                      >
                        <FileText size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:text-red-500"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
                {getTaskDocuments(task).length > 0 && (
                  <div className="ml-7 mt-2 flex flex-wrap gap-2">
                    {getTaskDocuments(task).map((doc) => (
                      <div key={doc.id} className="flex items-center text-xs bg-gray-100 rounded-full px-2 py-1">
                        <FileText size={10} className="mr-1" />
                        {doc.name}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
