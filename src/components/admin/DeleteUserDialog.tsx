
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToDelete: User | null;
  onDelete: () => Promise<void>;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onOpenChange,
  userToDelete,
  onDelete
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the user account for {userToDelete?.name} and remove all associated data.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive" onClick={onDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
