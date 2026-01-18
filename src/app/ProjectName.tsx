import { useRef, useState } from "react";
import styles from "./ProjectName.module.css";
import ProjectIcon from "./ProjectIcon";
import type { Metadata } from "@/features/projectData";
import IconButton from "@/components/IconButton";
import CrossIcon from "@/assets/icons/CrossIcon.svg?react";

export interface ProjectNameProps {
  metadata: Metadata;
  onNameChange: (newName: string) => void;
}

const ProjectName = ({ metadata, onNameChange }: ProjectNameProps) => {
  const [input, setInput] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = () => {
    setInput(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    if (e.key === "Escape") {
      input.blur();
    } else if (e.key === "Enter") {
      onNameChange(input.value);
      input.blur();
    }
  };

  return (
    <div className={styles.main}>
      {input === null ? (
        <button
          className={styles.trigger}
          onClick={() => setInput(metadata.name)}
        >
          <ProjectIcon metadata={metadata} />
          <span className={styles.name}>{metadata.name}</span>
        </button>
      ) : (
        <div className={styles.inputContainer}>
          <input
            ref={inputRef}
            id="project-name"
            type="text"
            placeholder="Project Name"
            className={styles.input}
            autoFocus
            autoComplete="off"
            value={input}
            onFocus={(e) => e.target.select()}
            onBlur={handleBlur}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <IconButton label="Cancel" onClick={() => inputRef?.current?.blur()}>
            <CrossIcon width="1em" height="1em" />
          </IconButton>
        </div>
      )}
    </div>
  );
};

export default ProjectName;
