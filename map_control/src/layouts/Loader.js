import React from "react";
import styles from "./Loader.module.css";
import { Spinner } from "reactstrap";

const Loader = () => (
  <div className={styles.fallbackSpinner}>
    <div className={styles.loading}>
      <Spinner color="primary" />
    </div>
  </div>
);
export default Loader;
