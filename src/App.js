import * as React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

function EditableCellInput({ getValue, row, column, table, cellRef }) {
  const [value, setValue] = React.useState(getValue());

  return (
    <input
      ref={cellRef}
      className="table-cell w-full px-2 py-1"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => table.options.meta.updateRow(row.index, column.id, value)}
    />
  );
}

function RemoveButton({ row, table }) {
  return (
    <button
      className="font-mono font-semibold text-red-600 text-xs align-middle"
      onClick={() => table.options.meta.removeRow(row.index)}
    >
      x
    </button>
  );
}

const helper = createColumnHelper();

const columns = [
  helper.accessor("one", { header: "Column One", cell: EditableCellInput }),
  helper.accessor("two", { header: "Column Two", cell: EditableCellInput }),
  helper.accessor("three", { header: "Column Three", cell: EditableCellInput }),
  helper.display({ id: "remove", cell: RemoveButton }),
];

const defaultData = [
  { one: "ONE", two: "TWO", three: "THREE" },
  { one: "one", two: "two", three: "three" },
];

function App() {
  const [shouldFocus, setShouldFocus] = React.useState(false);
  const [data, setData] = React.useState(defaultData);
  const ref = React.useRef(new Map());

  React.useEffect(() => {
    if (!shouldFocus) return;

    const node = ref.current.get(`${data.length - 1}-0`);
    if (node) node.focus();
  }, [data, shouldFocus]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      addRow: () => {
        setShouldFocus(true);
        setData((data) => [...data, { one: "", two: "", three: "" }]);
      },
      updateRow: (rowIdx, columnId, value) => {
        setShouldFocus(false);
        setData((data) =>
          data.map((row, idx) =>
            idx === rowIdx ? { ...row, [columnId]: value } : row,
          ),
        );
      },
      removeRow: (rowIdx) => {
        setShouldFocus(false);
        setData((data) => data.filter((_, idx) => idx !== rowIdx));
      },
    },
  });

  return (
    <div className="border m-2 rounded-md relative">
      <table className="w-full overflow-auto">
        <thead className="border-b-2">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id} className="py-2 border-l first:border-0">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, rowIdx) => (
            <tr key={row.id} className="mt-4">
              {row.getVisibleCells().map((cell, cellIdx) => (
                <td key={cell.id} className="p-2 border-l first:border-0">
                  {flexRender(cell.column.columnDef.cell, {
                    ...cell.getContext(),
                    cellRef: (node) => {
                      const map = ref.current;
                      if (node) {
                        map.set(`${rowIdx}-${cellIdx}`, node);
                      } else {
                        map.delete(`${rowIdx}-${cellIdx}`);
                      }
                    },
                  })}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t">
          <tr>
            <th colSpan={table.getCenterLeafColumns().length}>
              <div className="float-right mr-4 my-2">
                <button
                  className="text-sm font-light"
                  onClick={table.options.meta.addRow}
                >
                  Add New +
                </button>
              </div>
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default App;
