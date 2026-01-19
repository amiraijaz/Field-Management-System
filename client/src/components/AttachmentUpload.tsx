'use client';

import { useState, useRef } from 'react';
import { attachmentsApi, Attachment } from '@/lib/attachments';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  File,
  Image,
  FileText,
  Download,
  Trash2,
  Paperclip,
  X,
} from 'lucide-react';
import { format } from 'date-fns';

interface AttachmentUploadProps {
  jobId: string;
  attachments: Attachment[];
  onAttachmentsChange: () => void;
}

export default function AttachmentUpload({
  jobId,
  attachments,
  onAttachmentsChange,
}: AttachmentUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      await attachmentsApi.upload(jobId, file);
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
      onAttachmentsChange();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      await attachmentsApi.download(attachment.id);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    if (!confirm(`Are you sure you want to delete "${attachment.file_name}"?`)) {
      return;
    }

    try {
      await attachmentsApi.delete(attachment.id);
      toast({
        title: 'Success',
        description: 'File deleted successfully',
      });
      onAttachmentsChange();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Attachments</CardTitle>
            <span className="text-sm text-muted-foreground">({attachments.length})</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No attachments yet</p>
            <p className="text-sm mt-1">Upload images, PDFs, or documents</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">{getFileIcon(attachment.mime_type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{attachment.file_name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{formatFileSize(attachment.file_size)}</span>
                    <span>•</span>
                    <span>{format(new Date(attachment.created_at), 'MMM d, yyyy HH:mm')}</span>
                    {attachment.uploader_name && (
                      <>
                        <span>•</span>
                        <span>by {attachment.uploader_name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(attachment)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(attachment)}
                    title="Delete"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
