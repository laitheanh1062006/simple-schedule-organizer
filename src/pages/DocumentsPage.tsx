import { useState } from "react";
import { useAppContext, Document as DocumentType } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, FolderPlus, Plus, Trash2, Pencil, Save, FolderOpen, Upload, Download } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DocumentsPage = () => {
  const { documents, folders, addDocument, updateDocument, deleteDocument, addFolder, updateFolder, deleteFolder } = useAppContext();
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [isEditingDocument, setIsEditingDocument] = useState(false);
  
  const [fileContent, setFileContent] = useState<string | ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [newDocumentName, setNewDocumentName] = useState("");
  const [newDocumentContent, setNewDocumentContent] = useState("");
  const [newDocumentFolder, setNewDocumentFolder] = useState<string | undefined>(undefined);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
  const [documentEdits, setDocumentEdits] = useState({ name: "", content: "" });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target?.result || null);
        setFileName(file.name);
        setNewDocumentName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDocument = () => {
    if (newDocumentName.trim()) {
      addDocument({
        name: newDocumentName.trim(),
        content: fileContent ? String(fileContent) : newDocumentContent,
        folderId: newDocumentFolder,
      });
      toast.success("Document added successfully");
      setNewDocumentName("");
      setNewDocumentContent("");
      setNewDocumentFolder(undefined);
      setFileContent(null);
      setFileName("");
      setShowAddDocument(false);
    }
  };

  const handleDownloadDocument = (document: DocumentType) => {
    const isBase64 = document.content.startsWith('data:');
    
    if (isBase64) {
      const link = document.createElement('a');
      link.href = document.content;
      link.download = document.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const blob = new Blob([document.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${document.name}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      addFolder({ name: newFolderName.trim() });
      toast.success("Folder added successfully");
      setNewFolderName("");
      setShowAddFolder(false);
    }
  };

  const handleOpenDocument = (document: DocumentType) => {
    setSelectedDocument(document);
    setDocumentEdits({ name: document.name, content: document.content });
    setIsEditingDocument(false);
  };

  const handleSaveDocument = () => {
    if (selectedDocument) {
      updateDocument(selectedDocument.id, {
        name: documentEdits.name,
        content: documentEdits.content,
      });
      setSelectedDocument({
        ...selectedDocument,
        name: documentEdits.name,
        content: documentEdits.content,
        updatedAt: new Date(),
      });
      setIsEditingDocument(false);
      toast.success("Document saved successfully");
    }
  };

  const handleDeleteDocument = (id: string) => {
    deleteDocument(id);
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
    }
    toast.success("Document deleted successfully");
  };

  const handleDeleteFolder = (id: string) => {
    deleteFolder(id);
    if (selectedFolderId === id) {
      setSelectedFolderId(undefined);
    }
    toast.success("Folder deleted successfully");
  };

  const filteredDocuments = selectedFolderId
    ? documents.filter((doc) => doc.folderId === selectedFolderId)
    : documents.filter((doc) => !doc.folderId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-todoDesk-text">Documents</h1>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowAddFolder(true)}
            variant="outline"
            className="border-todoDesk-orange-accent text-todoDesk-orange-accent"
          >
            <FolderPlus className="mr-2 h-4 w-4" /> New Folder
          </Button>
          <Button
            onClick={() => setShowAddDocument(true)}
            className="bg-todoDesk-orange-accent text-white hover:bg-orange-600"
          >
            <Plus className="mr-2 h-4 w-4" /> New Document
          </Button>
        </div>
      </div>

      <Dialog open={showAddDocument} onOpenChange={setShowAddDocument}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
            <DialogDescription>
              Upload a Word document or create a text document.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Input
                placeholder="Document name"
                value={newDocumentName}
                onChange={(e) => setNewDocumentName(e.target.value)}
                className="mb-2"
              />
              {folders.length > 0 && (
                <Select onValueChange={(value) => setNewDocumentFolder(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a folder (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Word documents (DOC, DOCX)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".doc,.docx"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              {fileName && (
                <p className="text-sm text-gray-500">Selected file: {fileName}</p>
              )}
              {!fileContent && (
                <Textarea
                  placeholder="Or type document content here"
                  value={newDocumentContent}
                  onChange={(e) => setNewDocumentContent(e.target.value)}
                  className="min-h-[200px]"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDocument(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-todoDesk-orange-accent text-white hover:bg-orange-600"
              onClick={handleAddDocument}
              disabled={!newDocumentName.trim()}
            >
              Create Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddFolder} onOpenChange={setShowAddFolder}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFolder(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-todoDesk-orange-accent text-white hover:bg-orange-600"
              onClick={handleAddFolder}
              disabled={!newFolderName.trim()}
            >
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
        {selectedDocument && (
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              {isEditingDocument ? (
                <Input
                  value={documentEdits.name}
                  onChange={(e) => setDocumentEdits({ ...documentEdits, name: e.target.value })}
                  className="font-semibold text-lg"
                />
              ) : (
                <DialogTitle>{selectedDocument.name}</DialogTitle>
              )}
              <div className="text-sm text-gray-500">
                Last updated: {format(new Date(selectedDocument.updatedAt), "MMM d, yyyy 'at' h:mm a")}
              </div>
            </DialogHeader>
            
            <div className="py-4">
              {selectedDocument.content.startsWith('data:') ? (
                <div className="text-center">
                  <p className="mb-4">This is a Word document.</p>
                  <Button onClick={() => handleDownloadDocument(selectedDocument)}>
                    <Download className="mr-2 h-4 w-4" /> Download Document
                  </Button>
                </div>
              ) : (
                isEditingDocument ? (
                  <Textarea
                    value={documentEdits.content}
                    onChange={(e) => setDocumentEdits({ ...documentEdits, content: e.target.value })}
                    className="min-h-[300px]"
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{selectedDocument.content}</div>
                )
              )}
            </div>
            
            <DialogFooter>
              {!selectedDocument.content.startsWith('data:') && (
                isEditingDocument ? (
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setIsEditingDocument(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveDocument}>
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditingDocument(true)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Button>
                )
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <div className="flex gap-6">
        <div className="w-1/4 space-y-4">
          <h2 className="font-semibold text-lg border-b pb-2">Folders</h2>
          
          <div className="space-y-2">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                !selectedFolderId && "bg-todoDesk-orange-soft"
              )}
              onClick={() => setSelectedFolderId(undefined)}
            >
              <FolderOpen className="mr-2 h-4 w-4" /> All Documents
            </Button>
            
            {folders.map((folder) => (
              <div key={folder.id} className="flex items-center group">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    selectedFolderId === folder.id && "bg-todoDesk-orange-soft"
                  )}
                  onClick={() => setSelectedFolderId(folder.id)}
                >
                  <FolderOpen className="mr-2 h-4 w-4" /> {folder.name}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => handleDeleteFolder(folder.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="w-3/4">
          <h2 className="font-semibold text-lg border-b pb-2 mb-4">
            {selectedFolderId 
              ? `Documents in ${folders.find(f => f.id === selectedFolderId)?.name}`
              : "All Documents"
            }
          </h2>
          
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="hover:border-todoDesk-orange-accent transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex items-start space-x-2 cursor-pointer overflow-hidden"
                        onClick={() => handleOpenDocument(document)}
                      >
                        <FileText className="h-5 w-5 mt-1 text-todoDesk-orange-accent flex-shrink-0" />
                        <div>
                          <h3 className="font-medium truncate">{document.name}</h3>
                          <p className="text-sm text-gray-500 truncate">
                            {format(new Date(document.updatedAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDeleteDocument(document.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No documents in this folder. Create one to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
