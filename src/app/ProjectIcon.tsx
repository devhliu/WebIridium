import styles from "./ProjectIcon.module.css";
import clsx from "clsx";
import type { Metadata } from "@/features/projectData";
import { getPropertyFromCssGradient } from "@/features/cssGradients";

export interface ProjectIconProps {
  metadata: Metadata;
  className?: string;
}

const getIconTextFromName = (name: string) => {
  const words = name.split(" ").filter((w) => w[0]?.match(/[a-zA-Z]/g));
  if (words.length === 0) {
    return "M";
  } else if (1 <= words.length && words.length <= 3) {
    return words[0][0].toUpperCase();
  } else {
    return words[0][0].toUpperCase() + words[1][0].toUpperCase();
  }
};

const ProjectIcon = ({ metadata, className }: ProjectIconProps) => {
  return (
    <div
      className={clsx(styles.icon, className)}
      style={{
        background: getPropertyFromCssGradient(metadata.icon.color),
      }}
    >
      <span className={styles.iconText}>
        {getIconTextFromName(metadata.name)}
      </span>
    </div>
  );
};

export default ProjectIcon;
