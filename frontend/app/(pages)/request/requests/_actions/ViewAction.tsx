import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeOpenIcon } from "@radix-ui/react-icons";

interface ViewActionProps {
  id: number;
  disableStatus: boolean;
}

const ViewAction: React.FC<ViewActionProps> = ({ id, disableStatus }) => {
  const handleView = () => {
    console.log(`View button clicked for row ${id}`);
  };

  return (
    <Dialog>
      {/* Dialog Trigger Button */}
      <DialogTrigger asChild>
        <Button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-green-200 hover:bg-green-300 text-black"
          title="View"
        >
          <EyeOpenIcon width={20} height={20} />
        </Button>
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>View Row Details</DialogTitle>
          <DialogDescription>
            You are viewing details for row ID: {id}.
          </DialogDescription>
        </DialogHeader>
        <span>IDDD</span>
        <DialogFooter>
          <Button type="submit" onClick={handleView}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAction;
