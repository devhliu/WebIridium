import styles from "./PropertyList.module.css";

export interface PropertyListProps {
  children: React.ReactNode;
  alignment: "left" | "leftSmall" | "center";
}

const PropertyList = ({ children, alignment }: PropertyListProps) => {
  return (
    <div className={styles.propertyList} data-alignment={alignment}>
      {children}
    </div>
  );
};

export default PropertyList;
