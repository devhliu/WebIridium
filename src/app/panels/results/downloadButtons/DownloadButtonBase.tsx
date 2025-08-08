import DownloadIcon from "@/assets/icons/DownloadIcon.svg?react";

import IconButton from "@/components/IconButton";

export interface DownloadButtonBaseProps {
  onClick: () => void;
}

const DownloadButtonBase = ({ onClick }: DownloadButtonBaseProps) => {
  return (
    <IconButton label="export" onClick={onClick}>
      <DownloadIcon width="1em" height="1em" />
    </IconButton>
  );
};

export default DownloadButtonBase;
