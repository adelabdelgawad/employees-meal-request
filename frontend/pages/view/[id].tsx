import React, { useState } from "react";
import { GetServerSideProps } from "next";
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
import { EyeOpenIcon } from "@radix-ui/react-icons";
import DialogTable from "@/components/_request-lines/DialogTable";

interface ViewActionProps {
  id: number;
  initialData: any[];
  disableStatus: boolean;
}

const ViewAction: React.FC<ViewActionProps> = ({ id, initialData, disableStatus }) => {
  const [data, setData] = useState(initialData);
  const [changedStatus, setChangedStatus] = useState<
    { id: number; is_accepted: boolean }[]
  >([]);

  const handleSave = async () => {
    if (changedStatus.length > 0) {
      // Example POST request to save the changes
      try {
        const response = await fetch(`/api/update-request-lines`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(changedStatus),
        });

        if (!response.ok) {
          throw new Error("Failed to save changes");
        }

      } catch (error) {
        console.error("Error saving changes:", error);
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-green-200 hover:bg-green-300 text-black"
          title="View"
        >
          <EyeOpenIcon width={20} height={20} />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[75vh] max-w-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>View Row Details</DialogTitle>
          <DialogDescription>
            You are viewing details for row ID: {id}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto border-t border-b border-gray-300 my-2">
          <DialogTable
            data={data}
            disableStatus={disableStatus}
            onSwitchChange={(lineId, checked) => {
              setData((prevData) =>
                prevData.map((line) =>
                  line.id === lineId ? { ...line, is_accepted: checked } : line
                )
              );

              setChangedStatus((prevChanged) => {
                const isChanged = prevChanged.find((item) => item.id === lineId);

                if (isChanged) {
                  return prevChanged.map((item) =>
                    item.id === lineId ? { ...item, is_accepted: checked } : item
                  );
                } else {
                  return [...prevChanged, { id: lineId, is_accepted: checked }];
                }
              });
            }}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={disableStatus || changedStatus.length === 0}>
            Save
          </Button>
          <Button variant="secondary">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAction;

// Server-side function to fetch data
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const res = await fetch(`http://localhost:8000/request-lines?request_id=${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await res.json();

    return {
      props: {
        id: parseInt(id),
        initialData: data,
        disableStatus: false,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        id: parseInt(id),
        initialData: [],
        disableStatus: false,
      },
    };
  }
};
