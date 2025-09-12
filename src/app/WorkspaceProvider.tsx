import { useEffect } from "react";
import { Provider, useSetAtom } from "jotai";

import defaultModel from "@/assets/default.ant?raw";

import { updateEditorContentAtom } from "@/globals/workspace/model";
import {
  nameAtom,
  timeCourseParametersAtom,
} from "@/globals/workspace/settings";
import {
  computeSteadyStateAtom,
  simulateTimeCourseAtom,
} from "@/globals/workspace/simulation";
import { readShareUrlFragment } from "@/features/share";

// simulation from share link will not be run if they use more number of points
// than this.
const UNREASONABLE_NUMBER_OF_POINTS = 2500;

const Initialize = ({
  didInitialLoadRef,
}: {
  didInitialLoadRef: React.RefObject<boolean>;
}) => {
  const updateEditorContent = useSetAtom(updateEditorContentAtom);
  const setWorkspaceName = useSetAtom(nameAtom);
  const setTimeCourseParameters = useSetAtom(timeCourseParametersAtom);
  const simulateTimeCourse = useSetAtom(simulateTimeCourseAtom);
  const computeSteadyState = useSetAtom(computeSteadyStateAtom);

  useEffect(() => {
    const load = async (model: string): Promise<boolean> => {
      return await updateEditorContent({ content: model, skipDebounce: true });
    };

    if (!didInitialLoadRef.current) {
      didInitialLoadRef.current = true;

      const loadWithInitial = async () => {
        const result = await readShareUrlFragment(
          decodeURIComponent(location.hash.slice(1)),
        );

        if (result.type === "success") {
          setWorkspaceName(result.data.name);
          if (await load(result.data.code)) {
            if (result.data.simulation.type === "timeCourse") {
              setTimeCourseParameters(result.data.simulation.parameters);
              if (
                result.data.simulation.parameters.numberOfPoints <
                UNREASONABLE_NUMBER_OF_POINTS
              ) {
                await simulateTimeCourse();
              }
            } else {
              await computeSteadyState();
            }
          }
        } else {
          await load(defaultModel);
        }
      };

      void loadWithInitial();
    } else {
      void load(defaultModel);
    }
  }, [
    didInitialLoadRef,
    updateEditorContent,
    computeSteadyState,
    setTimeCourseParameters,
    setWorkspaceName,
    simulateTimeCourse,
  ]);

  return null;
};

const WorkspaceProvider = ({
  didInitialLoadRef,
  children,
}: {
  didInitialLoadRef: React.RefObject<boolean>;
  children: React.ReactNode;
}) => {
  return (
    <Provider>
      <Initialize didInitialLoadRef={didInitialLoadRef} />
      {children}
    </Provider>
  );
};

export default WorkspaceProvider;
