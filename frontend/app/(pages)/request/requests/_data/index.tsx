import { CustomColumnDef } from "@/components/data-table/advanced/_types";
import { RequestRecord } from "@/lib/definitions";
import { Checkbox } from "@/components/ui/checkbox";

export function getColumns(
  setColumnFilters: React.Dispatch<React.SetStateAction<any>>
): CustomColumnDef<RequestRecord>[] {
  return [
    {
      id: "id",
      header: " ",
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Select row ${row.id}`}
        />
      ),
      meta: { isVisible: true },
    },
    {
      accessorKey: "requester",
      header: "Requester",
      meta: { enableInputFiltering: true, isVisible: true },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => row.getValue("title"),
      meta: {
        isVisible: true,
      },
    },
    {
      accessorKey: "requestTime",
      header: "Request Time",
      meta: { isVisible: true },
    },
    {
      accessorKey: "closedTime",
      header: "Closed Time",
      meta: { isVisible: true },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      meta: { isVisible: true },
    },
    {
      accessorKey: "mealType",
      header: "MealType",
      meta: { enableFiltering: true, isVisible: true },
    },
    {
      accessorKey: "requests",
      header: "Total Employees",
      meta: { isVisible: true },
    },
    {
      accessorKey: "accetpted",
      header: "Acceptance",
      meta: {isVisible: true },
    },
    {
      accessorKey: "requestStatus",
      header: "Status",
      meta: { enableFiltering: true, isVisible: true },
    },
  ];
}

// Sample data array of RequestRecord objects
export const data: RequestRecord[] = [
  {
    id: 1,
    requester: "Adel Farrag Ahmed",
    title: "Request for Dinner",
    requestTime: "requestTime",
    closedTime: "closedTime",
    notes: "",
    mealType: "Dinner",
    requests: 5,
    accetpted: 1,
    requestStatus: "Approved",
  },
];
