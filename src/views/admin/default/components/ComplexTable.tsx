// import Card from "components/card";
// import Progress from "components/progress";
// import React from "react";
// import { MdCancel, MdCheckCircle, MdOutlineError } from "react-icons/md";

// import {
//   createColumnHelper,
//   flexRender,
//   getCoreRowModel,
//   getSortedRowModel,
//   SortingState,
//   useReactTable,
// } from "@tanstack/react-table";

// type RowObj = {
//   name: string;
//   status: string;
//   date: string;
//   progress: number;
// };

// const columnHelper = createColumnHelper<RowObj>();

// // const columns = columnsDataCheck;
// export default function ComplexTable(props: { tableData: any }) {
//   const { tableData } = props;
//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   let defaultData = tableData;
//   const columns = [
//     columnHelper.accessor("name", {
//       id: "name",
//       header: () => (
//         <p className="text-sm font-bold text-gray-600 dark:text-white">NAME</p>
//       ),
//       cell: (info) => (
//         <p className="text-sm font-bold text-navy-700 dark:text-white">
//           {info.getValue()}
//         </p>
//       ),
//     }),
//     columnHelper.accessor("status", {
//       id: "status",
//       header: () => (
//         <p className="text-sm font-bold text-gray-600 dark:text-white">
//           STATUS
//         </p>
//       ),
//       cell: (info) => (
//         <div className="flex items-center">
//           {info.getValue() === "Approved" ? (
//             <MdCheckCircle className="text-green-500 me-1 dark:text-green-300" />
//           ) : info.getValue() === "Disable" ? (
//             <MdCancel className="text-red-500 me-1 dark:text-red-300" />
//           ) : info.getValue() === "Error" ? (
//             <MdOutlineError className="text-amber-500 me-1 dark:text-amber-300" />
//           ) : null}
//           <p className="text-sm font-bold text-navy-700 dark:text-white">
//             {info.getValue()}
//           </p>
//         </div>
//       ),
//     }),
//     columnHelper.accessor("date", {
//       id: "date",
//       header: () => (
//         <p className="text-sm font-bold text-gray-600 dark:text-white">DATE</p>
//       ),
//       cell: (info) => (
//         <p className="text-sm font-bold text-navy-700 dark:text-white">
//           {info.getValue()}
//         </p>
//       ),
//     }),
//     columnHelper.accessor("progress", {
//       id: "progress",
//       header: () => (
//         <p className="text-sm font-bold text-gray-600 dark:text-white">
//           PROGRESS
//         </p>
//       ),
//       cell: (info) => (
//         <div className="flex items-center">
//           <Progress width="w-[108px]" value={info.getValue()} />
//         </div>
//       ),
//     }),
//   ]; // eslint-disable-next-line
//   const [data, setData] = React.useState(() => [...defaultData]);
//   const table = useReactTable({
//     data,
//     columns,
//     state: {
//       sorting,
//     },
//     onSortingChange: setSorting,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     debugTable: true,
//   });
//   return (
//     <Card extra={"w-full h-full px-6 pb-6 sm:overflow-x-auto"}>
//       <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
//         <table className="w-full">
//           <thead>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <tr key={headerGroup.id} className="!border-px !border-gray-400">
//                 {headerGroup.headers.map((header) => {
//                   return (
//                     <th
//                       key={header.id}
//                       colSpan={header.colSpan}
//                       onClick={header.column.getToggleSortingHandler()}
//                       className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start"
//                     >
//                       <div className="items-center justify-between text-xs text-gray-200">
//                         {flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                         {{
//                           asc: "",
//                           desc: "",
//                         }[header.column.getIsSorted() as string] ?? null}
//                       </div>
//                     </th>
//                   );
//                 })}
//               </tr>
//             ))}
//           </thead>
//           <tbody>
//             {table
//               .getRowModel()
//               .rows.slice(0, 5)
//               .map((row) => {
//                 return (
//                   <tr key={row.id}>
//                     {row.getVisibleCells().map((cell) => {
//                       return (
//                         <td
//                           key={cell.id}
//                           className="min-w-[150px] border-white/0 py-3  pr-4"
//                         >
//                           {flexRender(
//                             cell.column.columnDef.cell,
//                             cell.getContext()
//                           )}
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 );
//               })}
//           </tbody>
//         </table>
//       </div>
//     </Card>
//   );
// }




import Card from "components/card";
import Progress from "components/progress";
import React from "react";
import { MdCancel, MdCheckCircle, MdOutlineError } from "react-icons/md";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";

type RowObj = {
  name: string | React.ReactNode;
  status: string | React.ReactNode;
  date: string | React.ReactNode;
  progress: number | React.ReactNode;
  action?: React.ReactNode;
};

const columnHelper = createColumnHelper<any>();

// === DEFAULT COLUMNS (jika tidak diberikan) ===
const defaultColumns: ColumnDef<any, any>[] = [
  columnHelper.accessor("name", {
    id: "name",
    header: () => <p className="text-sm font-bold text-gray-600 dark:text-white">NAMA</p>,
    cell: (info) => <p className="text-sm font-bold text-navy-700 dark:text-white">{info.getValue()}</p>,
  }),
  columnHelper.accessor("status", {
    id: "status",
    header: () => <p className="text-sm font-bold text-gray-600 dark:text-white">STATUS</p>,
    cell: (info) => {
      const value = info.getValue();
      if (typeof value === "string") {
        return (
          <div className="flex items-center">
            {value === "Diterima" ? (
              <MdCheckCircle className="text-green-500 me-1 dark:text-green-300" />
            ) : value === "Ditolak" ? (
              <MdCancel className="text-red-500 me-1 dark:text-red-300" />
            ) : value === "Diproses" ? (
              <MdOutlineError className="text-amber-500 me-1 dark:text-amber-300" />
            ) : null}
            <p className="text-sm font-bold text-navy-700 dark:text-white">{value}</p>
          </div>
        );
      }
      return value; // Jika sudah JSX
    },
  }),
  columnHelper.accessor("date", {
    id: "date",
    header: () => <p className="text-sm font-bold text-gray-600 dark:text-white">TANGGAL</p>,
    cell: (info) => <p className="text-sm font-bold text-navy-700 dark:text-white">{info.getValue()}</p>,
  }),
  columnHelper.accessor("progress", {
    id: "progress",
    header: () => <p className="text-sm font-bold text-gray-600 dark:text-white">PROGRESS</p>,
    cell: (info) => (
      <div className="flex items-center">
        <Progress width="w-[108px]" value={info.getValue() as number} />
      </div>
    ),
  }),
];

// === KOMPONEN UTAMA ===
export default function ComplexTable(props: {
  tableData: any[];
  columns?: ColumnDef<RowObj, any>[];
}) {
  const { tableData, columns = defaultColumns } = props;
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [data] = React.useState(() => [...tableData]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  return (
    <Card extra="w-full h-full px-6 pb-6 sm:overflow-x-auto">
      <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="!border-px !border-gray-400">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start"
                  >
                    <div className="items-center justify-between text-xs text-gray-200">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: " (↑)",
                        desc: " (↓)",
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="min-w-[150px] border-white/0 py-3 pr-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}