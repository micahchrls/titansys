import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface CrudModalProps {
  trigger: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CrudModal({
  trigger,
  title,
  description,
  children,
  isOpen,
  onOpenChange,
}: CrudModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
          )}
          onClick={() => onOpenChange?.(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        {children}
      </DialogContent>
    </Dialog>
  );
}