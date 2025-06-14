import styles from "./DataTable.module.css";

interface DataTableProps {
  columns: {
    title: string;
    rows: number[];
  }[];
  decimalPlaces: number;
}

const DataTable = ({ columns, decimalPlaces }: DataTableProps) => {
  if (columns.length === 0) {
    return null;
  }

  const allNumericValues = columns
    .map((c) => c.rows)
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
          {columns[0].rows.map((_, rowIndex) => (
            <tr key={rowIndex} className={styles.row}>
              {columns.map((column, colIndex) => {
                const cellValue = column.rows[rowIndex];

                const targetColor =
                  cellValue >= 0
                    ? "color-data-table-positive"
                    : "color-data-table-negative";
                const maxPercent = Math.abs(cellValue / maxAbsValue) * 100;
                return (
                  <td
                    key={colIndex}
                    className={styles.cell}
                    style={{
                      color: "var(--color-data-table-foreground)",
                      backgroundColor: `color-mix(in hsl, var(--${targetColor}) ${maxPercent}%, var(--color-data-table-neutral))`,
                    }}
                  >
                    {cellValue.toFixed(decimalPlaces).replace(/^-0/, "0")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
