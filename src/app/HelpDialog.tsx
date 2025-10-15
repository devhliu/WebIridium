import Dialog from "@/components/Dialog";

export interface HelpDialogProps {
  onClose: () => void;
}

const HelpDialog = ({ onClose }: HelpDialogProps) => {
  return (
    <Dialog
      title="Help"
      description="Help for Web Iridium"
      showDescription={false}
      onClose={onClose}
    >
      <p>There is no help yet.</p>
    </Dialog>
  );
};

export default HelpDialog;
