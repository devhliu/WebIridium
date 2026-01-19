import { useAtomValue } from "jotai";
import { useState } from "react";

import styles from "./ProjectSection.module.css";
import buttonStyles from "@/components/Button.module.css";

import ProjectItem from "./ProjectItem";
import PlusIcon from "@/assets/icons/PlusIcon.svg?react";
import PulseLoader from "@/components/PulseLoader";
import { errorToDisplayString } from "@/features/formatUtils";
import type { ProjectId } from "@/features/projectData";
import { projectListAtom, useProjectActions } from "@/globals/project";

const ProjectSection = () => {
  const projectList = useAtomValue(projectListAtom);
  const {
    createNewProject,
    openProject,
    deleteProject,
    promptProjectFromFile,
    FileInput,
  } = useProjectActions();

  const [openingProject, setOpeningProject] = useState<ProjectId | null>(null);

  const handleSelectFor = (id: ProjectId) => async () => {
    if (openingProject) return;

    setOpeningProject(id);
    await openProject(id);
    setOpeningProject(null);
  };

  const handleDeleteFor = (id: ProjectId) => async () => {
    if (openingProject) return;

    await deleteProject(id);
  };

  return (
    <div className={styles.section}>
      <FileInput />
      <h3 className={styles.title}>
        My Projects
        <div className={styles.modelActions}>
          <button
            className={buttonStyles.default}
            onClick={() => promptProjectFromFile()}
          >
            Import File
          </button>
          <button
            className={buttonStyles.primary}
            onClick={() => createNewProject()}
          >
            <PlusIcon aria-hidden width="1em" height="1em" />
            New Project
          </button>
        </div>
      </h3>
      <div className={styles.modelList}>
        {projectList.state === "loading" ? (
          <div className={styles.loaderContainer}>
            <PulseLoader />
          </div>
        ) : projectList.state === "hasError" ? (
          <p className={styles.error}>
            Error: {errorToDisplayString(projectList.error)}
          </p>
        ) : projectList.data.size === 0 ? (
          <p className={styles.error}>You have no projects.</p>
        ) : (
          Array.from(projectList.data.entries()).map(([id, metadata]) => (
            <ProjectItem
              key={id}
              metadata={metadata}
              isLoading={openingProject === id}
              onSelect={handleSelectFor(id)}
              onDelete={handleDeleteFor(id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectSection;
