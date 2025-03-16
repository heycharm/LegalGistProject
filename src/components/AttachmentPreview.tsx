
import { Button } from '@/components/ui/button';
import { FileTextIcon, XIcon, DownloadIcon } from 'lucide-react';
import { Attachment } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove?: () => void;
  showRemove?: boolean;
}

const AttachmentPreview = ({ attachment, onRemove, showRemove = false }: AttachmentPreviewProps) => {
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: `${attachment.name} is being downloaded`
    });
  };

  return (
    <div className="attachment-preview flex flex-col w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <FileTextIcon className="text-primary h-5 w-5 mr-2" />
          <span className="font-medium text-sm truncate max-w-[160px]">{attachment.name}</span>
          <span className="text-xs text-muted-foreground ml-2">({formatFileSize(attachment.size)})</span>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
            <DownloadIcon className="h-4 w-4" />
          </Button>
          {showRemove && onRemove && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onRemove}>
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttachmentPreview;
