import ExportIcon from "@/assets/icons/ExportIcon.svg?react";

import IconButton from "@/components/IconButton";

export interface ExportButtonBaseProps {
  onClick: () => void;
}

const ExportButtonBase = ({ onClick }: ExportButtonBaseProps) => {
  return (
    <IconButton label="export" onClick={onClick}>
      <ExportIcon width="1em" height="1em" />
    </IconButton>
  );
};

export default ExportButtonBase;
