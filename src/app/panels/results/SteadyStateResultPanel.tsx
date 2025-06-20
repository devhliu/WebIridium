import { useAtomValue } from "jotai";
import { simulationResultAtom } from "@/stores/workspace";
import styles from "./results.module.css";
import DataTable from "@/components/DataTable";
import { type SteadyStateResultItem } from "@/features/simulation/Simulator";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className={styles.steadyStateSection}>
      <h2>{title}</h2>
      {children}
    </div>
  );
};

const columnsFromSteadyStateItem = (item: SteadyStateResultItem) => [
  {
    // first column for row names so title is empty
    title: "",
    rows: item.rows,
  },
  ...item.columns.map((name, i) => ({
    title: name,
    rows: item.values.map((v) => v[i]),
  })),
];

const SteadyStateResultPanel = () => {
  const simulationResults = useAtomValue(simulationResultAtom);

  if (simulationResults?.type !== "steadyState") {
    return <div>nothing yet...</div>;
  }

  const { data } = simulationResults;

  const initialValueColumns = [
    {
      title: "Symbol",
      rows: data.initialConcentrations.map((c) => c.name),
    },
    {
      title: "Value",
      rows: data.initialConcentrations.map((c) => c.value),
    },
  ];

  const eigenvalueColumns = [
    {
      title: "Real",
      rows: data.eigenValues.map((e) => e[0]),
    },
    {
      title: "Imaginary",
      rows: data.eigenValues.map((e) => e[1]),
    },
  ];

  const jacobianColumns = columnsFromSteadyStateItem(data.jacobian);
  const fluxControlColumns = columnsFromSteadyStateItem(data.fluxControl);
  const concentrationControlColumns = columnsFromSteadyStateItem(
    data.concentrationControl,
  );
  const elasticitiesColumns = columnsFromSteadyStateItem(data.elasticities);

  return (
    <div className={styles.panel}>
      <div className={styles.steadyStateContainer}>
        <p>Value: {simulationResults.data.value}</p>
        <Section title="Initial Concentrations">
          <DataTable columns={initialValueColumns} decimalPlaces={8} />
        </Section>
        <Section title="Eigenvalues">
          <DataTable columns={eigenvalueColumns} decimalPlaces={8} />
        </Section>
        <Section title="Jacobian">
          <DataTable columns={jacobianColumns} decimalPlaces={8} />
        </Section>
        <Section title="Flux Control">
          <DataTable columns={fluxControlColumns} decimalPlaces={8} />
        </Section>
        <Section title="Concentration Control">
          <DataTable columns={concentrationControlColumns} decimalPlaces={8} />
        </Section>
        <Section title="Elasticities">
          <DataTable columns={elasticitiesColumns} decimalPlaces={8} />
        </Section>
      </div>
    </div>
  );
};

export default SteadyStateResultPanel;
