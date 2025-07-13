import clsx from "clsx";
import styles from "./PropertyList.module.css";

export interface PropertyListProps {
  children: React.ReactNode;
  alignment: "left" | "leftSmall" | "center";
  className?: string;
}

const PropertyList = ({
  children,
  alignment,
  className,
}: PropertyListProps) => {
  return (
    <div
      className={clsx(styles.propertyList, className)}
      data-alignment={alignment}
    >
      {children}
    </div>
  );
};

export default PropertyList;
