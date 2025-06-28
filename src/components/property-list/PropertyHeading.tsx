import styles from "./PropertyList.module.css";

const PropertyHeading = ({ children }: { children: React.ReactNode }) => {
  return <h3 className={styles.heading}>{children}</h3>;
};

export default PropertyHeading;
