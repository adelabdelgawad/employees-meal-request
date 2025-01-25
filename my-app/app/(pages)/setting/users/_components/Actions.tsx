import React from "react";
import EditAction from "./_edit_user/EditAction";
import DeleteAction from "./DeleteAction";

interface ActionsProps {
  userId: number;
}

function Actions({ userId }: ActionsProps) {
  console.log("userId", userId);
  return (
    <div className="flex justify-center items-center gap-3">
      <EditAction />
      <DeleteAction />
    </div>
  );
}

export default Actions;
