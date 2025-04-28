
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  deadline?: Date;
  documentIds?: string[];
};

export type Document = {
  id: string;
  name: string;
  content: string;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Folder = {
  id: string;
  name: string;
};

type AppContextType = {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  documents: Document[];
  addDocument: (document: Omit<Document, "id" | "createdAt" | "updatedAt">) => void;
  updateDocument: (id: string, updates: Partial<Omit<Document, "id" | "createdAt" | "updatedAt">>) => void;
  deleteDocument: (id: string) => void;
  folders: Folder[];
  addFolder: (folder: Omit<Folder, "id">) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  attachDocumentToTask: (taskId: string, documentId: string) => void;
  removeDocumentFromTask: (taskId: string, documentId: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  // Initialize state from localStorage or use defaults
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("todoDesk_tasks");
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      // Convert string dates back to Date objects
      return parsedTasks.map((task: any) => ({
        ...task,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
      }));
    }
    return [];
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    const savedDocuments = localStorage.getItem("todoDesk_documents");
    if (savedDocuments) {
      const parsedDocs = JSON.parse(savedDocuments);
      // Convert string dates back to Date objects
      return parsedDocs.map((doc: any) => ({
        ...doc,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      }));
    }
    return [];
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    const savedFolders = localStorage.getItem("todoDesk_folders");
    return savedFolders ? JSON.parse(savedFolders) : [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("todoDesk_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("todoDesk_documents", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem("todoDesk_folders", JSON.stringify(folders));
  }, [folders]);

  // Task Functions
  const addTask = (task: Omit<Task, "id">) => {
    const newTask = {
      ...task,
      id: `task_${Date.now()}`,
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Document Functions
  const addDocument = (document: Omit<Document, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date();
    const newDocument = {
      ...document,
      id: `doc_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setDocuments([...documents, newDocument]);
  };

  const updateDocument = (id: string, updates: Partial<Omit<Document, "id" | "createdAt" | "updatedAt">>) => {
    setDocuments(
      documents.map((doc) =>
        doc.id === id
          ? { ...doc, ...updates, updatedAt: new Date() }
          : doc
      )
    );
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
    
    // Also remove document reference from any tasks
    setTasks(
      tasks.map((task) => {
        if (task.documentIds?.includes(id)) {
          return {
            ...task,
            documentIds: task.documentIds.filter((docId) => docId !== id),
          };
        }
        return task;
      })
    );
  };

  // Folder Functions
  const addFolder = (folder: Omit<Folder, "id">) => {
    const newFolder = {
      ...folder,
      id: `folder_${Date.now()}`,
    };
    setFolders([...folders, newFolder]);
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders(
      folders.map((folder) =>
        folder.id === id ? { ...folder, ...updates } : folder
      )
    );
  };

  const deleteFolder = (id: string) => {
    setFolders(folders.filter((folder) => folder.id !== id));
    
    // Set documents in this folder to have no folder
    setDocuments(
      documents.map((doc) =>
        doc.folderId === id ? { ...doc, folderId: undefined } : doc
      )
    );
  };

  // Document-Task Relationship Functions
  const attachDocumentToTask = (taskId: string, documentId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const documentIds = task.documentIds || [];
          if (!documentIds.includes(documentId)) {
            return {
              ...task,
              documentIds: [...documentIds, documentId],
            };
          }
        }
        return task;
      })
    );
  };

  const removeDocumentFromTask = (taskId: string, documentId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId && task.documentIds) {
          return {
            ...task,
            documentIds: task.documentIds.filter((id) => id !== documentId),
          };
        }
        return task;
      })
    );
  };

  const value = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    documents,
    addDocument,
    updateDocument,
    deleteDocument,
    folders,
    addFolder,
    updateFolder,
    deleteFolder,
    attachDocumentToTask,
    removeDocumentFromTask,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
