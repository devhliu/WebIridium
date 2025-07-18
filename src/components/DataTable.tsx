import { memo } from "react";
import styles from "./DataTable.module.css";

export interface DataTableProps {
  columns: {
    title: string;
    values: (number | string)[];
  }[];
  decimalPlaces: number;
}

const DataTable = memo(({ columns, decimalPlaces }: DataTableProps) => {
  if (columns.length === 0) {
    return null;
  }

  const allNumericValues = columns
    .map((c) => c.values)
    .flat()
    .map(Number)
    .filter((v) => !isNaN(v));
  const maxAbsValue = Math.max(...allNumericValues.map(Math.abs)) || 1;

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead className={styles.header}>
          <tr className={styles.row}>
            {columns.map((col) => (
              <th key={col.title} className={styles.cell} scope="col">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {columns[0].values.map((_, rowIndex) => (
            <tr key={rowIndex} className={styles.row}>
              {columns.map((column, colIndex) => {
                const cellValue = column.values[rowIndex];
                if (typeof cellValue === "number") {
                  const targetColor =
                    cellValue >= 0
                      ? "var(--color-data-table-positive)"
                      : "var(--color-data-table-negative)";
                  const maxPercent = Math.abs(cellValue / maxAbsValue) * 100;
                  return (
                    <td
                      key={colIndex}
                      className={styles.cell}
                      style={{
                        color: "var(--color-data-table-fg)",
                        backgroundColor: `color-mix(in oklch, ${targetColor} ${maxPercent}%, var(--color-data-table-neutral))`,
                      }}
                    >
                      {cellValue === 0
                        ? "0.0"
                        : cellValue.toFixed(decimalPlaces)}
                    </td>
                  );
                } else {
                  return (
                    <td key={colIndex} className={styles.cell}>
                      {cellValue}
                    </td>
                  );
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

DataTable.displayName = "DataTable";

export default DataTable;
