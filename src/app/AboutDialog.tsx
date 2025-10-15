import Dialog from "@/components/Dialog";

export interface AboutDialogProps {
  onClose: () => void;
}

const AboutDialog = ({ onClose }: AboutDialogProps) => {
  return (
    <Dialog
      title="About Web Iridium"
      description="Information about Web Iridium"
      showDescription={false}
      onClose={onClose}
    >
      <p>
        Version: 0.0.1
        <br />
        Copyright: 2025
      </p>
    </Dialog>
  );
};

export default AboutDialog;
