import { useToast } from "@/components/Toast";

export const ToastTest = () => {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: "this is a test toast",
      description: "hello world!",
      type: "success",
    });
  };

  return <button onClick={handleClick}>test toast</button>;
};

export default ToastTest;
