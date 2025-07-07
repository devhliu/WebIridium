import { type TimeCourseParameters } from "@/features/simulation/Simulator";
import { type EditableTimeCourseParameters } from "@/globals/workspace/settings";

import PropertyList from "@/components/property-list/PropertyList";
import NumericProperty from "@/components/property-list/NumericProperty";

export interface TimeCoursePropertyListProps {
  parameters: EditableTimeCourseParameters;
  onParameterChange: (newParameters: EditableTimeCourseParameters) => void;
}

const MAX_PARAMETER_VALUE = 1_0000_000;

const isParameterInRange = (value: number) =>
  0 <= value && value <= MAX_PARAMETER_VALUE;

const TimeCoursePropertyList = ({
  parameters,
  onParameterChange,
}: TimeCoursePropertyListProps) => {
  const handleChangeFor = (parameter: keyof TimeCourseParameters) => {
    return (newValue: number) => {
      onParameterChange({
        ...parameters,
        [parameter]: newValue,
      });
    };
  };

  return (
    <PropertyList alignment="left">
      <NumericProperty
        name="Start Time"
        value={parameters.startTime}
        onChange={handleChangeFor("startTime")}
        validator={(value) =>
          isParameterInRange(value) && value < parameters.endTime
        }
      />
      <NumericProperty
        name="End Time"
        value={parameters.endTime}
        onChange={handleChangeFor("endTime")}
        validator={(value) =>
          isParameterInRange(value) && value > parameters.startTime
        }
      />
      <NumericProperty
        name="Number of Points"
        value={parameters.numberOfPoints}
        onChange={handleChangeFor("numberOfPoints")}
        validator={(value) =>
          isParameterInRange(value) && value === Math.floor(value)
        }
      />
    </PropertyList>
  );
};

export default TimeCoursePropertyList;
