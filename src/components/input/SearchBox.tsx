import clsx from "clsx";
import styles from "./SearchBox.module.css";
import SearchIcon from "@/assets/icons/SearchIcon.svg?react";

export interface SearchBoxProps {
  name: string;
  placeholder: string;
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
}

const SearchBox = ({
  name,
  placeholder: placeholderText,
  value,
  onChange,
  className,
}: SearchBoxProps) => {
  return (
    <div className={clsx(styles.root, className)}>
      <SearchIcon className={styles.icon} height="14" width="14" />
      <input
        className={styles.input}
        type="search"
        name={name}
        placeholder={placeholderText}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBox;
