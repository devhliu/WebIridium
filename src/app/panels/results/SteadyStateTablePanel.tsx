import { atom, useAtom, useAtomValue } from "jotai";

import { simulationResultAtom } from "@/globals/workspace/simulation";

import styles from "./results.module.css";

import DataTable from "@/components/DataTable";
import NumericSliderProperty from "@/components/property-list/NumericSliderProperty";

import { type SteadyStateResultItem } from "@/features/simulation/Simulator";

const decimalPlacesAtom = atom(2);

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
    values: item.rows,
  },
  ...item.columns.map((name, i) => ({
    title: name,
    values: item.values.map((v) => v[i]),
  })),
];

const SteadyStateResultPanel = () => {
  const simulationResults = useAtomValue(simulationResultAtom);
  const [decimalPlaces, setDecimalPlaces] = useAtom(decimalPlacesAtom);

  if (simulationResults?.type !== "steadyState") {
    return;
  }

  const concentrationColumns = [
    {
      title: "Symbol",
      values: simulationResults.concentrations.map((c) => c.name),
    },
    {
      title: "Value",
      values: simulationResults.concentrations.map((c) => c.value),
    },
  ];

  const eigenvalueColumns = [
    {
      title: "Real",
      values: simulationResults.eigenValues.map((e) => e[0]),
    },
    {
      title: "Imaginary",
      values: simulationResults.eigenValues.map((e) => e[1]),
    },
  ];

  const jacobianColumns = columnsFromSteadyStateItem(
    simulationResults.jacobian,
  );
  const fluxControlColumns = columnsFromSteadyStateItem(
    simulationResults.fluxControl,
  );
  const concentrationControlColumns = columnsFromSteadyStateItem(
    simulationResults.concentrationControl,
  );
  const elasticitiesColumns = columnsFromSteadyStateItem(
    simulationResults.elasticities,
  );

  return (
    <div className={styles.panel}>
      <div className={styles.steadyStateTables}>
        <NumericSliderProperty
          name="Decimal Places"
          value={decimalPlaces}
          onChange={setDecimalPlaces}
          min={0}
          max={100}
          step={1}
        />
        <p>Value: {simulationResults.value}</p>
        <Section title="Concentrations">
          <DataTable
            columns={concentrationColumns}
            decimalPlaces={decimalPlaces}
          />
        </Section>
        <Section title="Eigenvalues">
          <DataTable
            columns={eigenvalueColumns}
            decimalPlaces={decimalPlaces}
          />
        </Section>
        <Section title="Jacobian">
          <DataTable columns={jacobianColumns} decimalPlaces={decimalPlaces} />
        </Section>
        <Section title="Flux Control">
          <DataTable
            columns={fluxControlColumns}
            decimalPlaces={decimalPlaces}
          />
        </Section>
        <Section title="Concentration Control">
          <DataTable
            columns={concentrationControlColumns}
            decimalPlaces={decimalPlaces}
          />
        </Section>
        <Section title="Elasticities">
          <DataTable
            columns={elasticitiesColumns}
            decimalPlaces={decimalPlaces}
          />
        </Section>
      </div>
    </div>
  );
};

export default SteadyStateResultPanel;
