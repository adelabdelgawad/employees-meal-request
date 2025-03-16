import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ActionEdit from './ActionEdit';
import toast from 'react-hot-toast';
import { TrashIcon } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import clientAxiosInstance from '@/lib/clientAxiosInstance';
import { useSettingUserContext } from '@/hooks/SettingUserContext';

interface ActionButtonsProps {
  recordId: number;
}

export default function ActionButtons({ recordId }: ActionButtonsProps) {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { setUsers } = useSettingUserContext(); // Access users state

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await clientAxiosInstance.delete(`/users/${recordId}`);
      toast.success('Record deleted successfully!');
        
      // **Remove user from UI without reloading**
      setUsers(prevUsers => prevUsers.filter(user => user.id !== recordId));

      setDeleteDialogOpen(false);

    } catch (error) {
      console.error(error);
      toast.error('Failed to delete the record. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex space-x-2 items-center">
      {/* Edit Button */}
      <ActionEdit userId={recordId} />

      {/* Delete Button */}
      <Button
        onClick={() => setDeleteDialogOpen(true)}
        variant="outline"
        color="red"
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : <><TrashIcon className="mr-1" /> Delete</>}
      </Button>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Record"
        message={`Are you sure you want to delete record #${recordId}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}
