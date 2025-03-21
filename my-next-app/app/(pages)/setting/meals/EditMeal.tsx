"use client";
import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import ScheduleChange, { Schedule } from "./ScheduleChange";
import ActivationSwitch from "./ActivationSwitch";
import { updateMealActivation, updateMealSchedules } from "@/lib/actions/meal";
import toast from "react-hot-toast";

interface EditMealSheetProps {
  recordId: number;
  initialSchedules?: Schedule[];
  isActive: boolean;
  mutate: () => void;
}

const EditMealSheet: React.FC<EditMealSheetProps> = ({
  recordId,
  isActive,
  initialSchedules = [],
  mutate,
}) => {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [addedSchedules, setAddedSchedules] = useState<Schedule[]>([]);
  const [removedSchedules, setRemovedSchedules] = useState<Schedule[]>([]);
  const [activeState, setActiveState] = useState<boolean>(isActive);

  // Reset added/removed arrays when initialSchedules change
  useEffect(() => {
    setSchedules(initialSchedules);
    setAddedSchedules([]);
    setRemovedSchedules([]);
  }, [initialSchedules]);

  const handleSave = async () => {
    // Only call updateMealActivation if the activation state changed
    if (activeState !== isActive) {
      await updateMealActivation(recordId, activeState);
    }

    // Only call updateMealSchedules if there are added or removed schedules
    if (addedSchedules.length > 0 || removedSchedules.length > 0) {
      await updateMealSchedules(recordId, {
        added: addedSchedules,
        removed: removedSchedules,
      });
    }

    mutate(); // Revalidate data after updates
    toast.success("Meal Updated Succefully")
  };

  const handleScheduleChange = (newSchedules: Schedule[]) => {
    const added: Schedule[] = [];
    const removed: Schedule[] = [];

    // Identify added schedules (not in initialSchedules)
    newSchedules.forEach((newS) => {
      if (
        !newS.isDeleted &&
        !initialSchedules.some(
          (initS) =>
            initS.schedule_from === newS.schedule_from &&
            initS.schedule_to === newS.schedule_to
        )
      ) {
        added.push(newS);
      }
    });

    // Identify removed schedules (in initialSchedules but marked deleted or missing)
    initialSchedules.forEach((initS) => {
      const stillExists = newSchedules.some(
        (newS) =>
          !newS.isDeleted &&
          newS.schedule_from === initS.schedule_from &&
          newS.schedule_to === initS.schedule_to
      );
      if (!stillExists) {
        removed.push(initS);
      }
    });

    setSchedules(newSchedules);
    setAddedSchedules(added);
    setRemovedSchedules(removed);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm">
          <Edit3 size={16} /> Edit Meal
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Edit Meal</SheetTitle>
          <SheetDescription>
            Modify the meal schedule and activation status.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Activation Switch Component */}
          <div className="flex justify-between items-center p-2">
            <span className="font-medium">Meal Activation</span>
            <ActivationSwitch
              isActive={activeState}
              onChange={setActiveState}
            />
          </div>
          {/* Schedule Change Component */}
          <ScheduleChange
            initialSchedules={schedules}
            onChange={handleScheduleChange}
            mealId={recordId}
          />

          {/* Footer Buttons */}
          <div className="flex flex-row space-y-2 pt-4">
            <SheetClose asChild>
              <Button variant="secondary" className="w-full">
                Cancel
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button onClick={handleSave} className="w-full">
                Save
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditMealSheet;
