'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ToastDemo() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
      <Button
        variant="default"
        onClick={() => toast('Default notification')}
      >
        Default Toast
      </Button>
      
      <Button
        variant="outline"
        onClick={() => toast.success('Success notification', {
          description: 'Your action was completed successfully',
        })}
      >
        Success Toast
      </Button>
      
      <Button
        variant="secondary"
        onClick={() => toast.error('Error notification', {
          description: 'There was a problem with your request',
        })}
      >
        Error Toast
      </Button>
      
      <Button
        variant="destructive"
        onClick={() => toast.warning('Warning notification', {
          description: 'This action might have consequences',
        })}
      >
        Warning Toast
      </Button>
    </div>
  );
}
