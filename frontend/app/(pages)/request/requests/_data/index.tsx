import { CustomColumnDef } from "@/app/(pages)/request/requests/_types";
import { RequestRecord } from "@/lib/definitions";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";

export function getColumns(
  setColumnFilters: React.Dispatch<React.SetStateAction<any>>
): CustomColumnDef<RequestRecord>[] {
  return [
    {
      id: "id",
      header: " ",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox.Root
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select row ${row.id}`}
            className="w-5 h-5 bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Checkbox.Indicator>
              <CheckIcon className="text-blue-500" />
            </Checkbox.Indicator>
          </Checkbox.Root>
        </div>
      ),
      meta: { isVisible: true },
    },
    {
      accessorKey: "requester",
      header: "Requester",
      meta: { enableInputFiltering: true, isVisible: true },
    },
    {
      accessorKey: "requester_title",
      header: "Title",
      meta: {
        isVisible: true,
      },
    },
    {
      accessorKey: "meal_type",
      header: "Meal",

      meta: { isVisible: true, enableFiltering: true },
    },
    {
      accessorKey: "status",
      header: "Status",
      meta: { isVisible: true, enableFiltering: true },
    },
    {
      accessorKey: "request_time",
      header: "Request Time",
      cell: ({ getValue }) => {
        const value = getValue<string>();
        return new Date(value).toLocaleString(); // Formats the date
      },
      meta: { isVisible: true },
    },
    {
      accessorKey: "closed_time",
      header: "Closed Time",
      cell: ({ getValue }) => {
        const value = getValue<string>();
        return value ? new Date(value).toLocaleString() : ""; // Formats the date
      },
      meta: { isVisible: true },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      meta: { isVisible: true },
    },
  ];
}
