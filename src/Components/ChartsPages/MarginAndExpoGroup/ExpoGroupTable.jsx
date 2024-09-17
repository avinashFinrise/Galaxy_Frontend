import { Form } from "react-bootstrap";
import { MdAdd } from "react-icons/md";
import mgStyle from "./MarginAndExpoGroup.module.scss";

const ExpoGroupTable = () => {
  return (
    <div className={mgStyle.groupSection}>
      <div className={mgStyle.groupContent}>
        <Form.Check
          type="checkbox"
          id="all"
          label="all"
          // onClick={handleChange}
          // checked=
          name="all"
          className={mgStyle.formCheck}
          // className="col-md-3 "
        />
        <Form.Check
          type="checkbox"
          id="flag-only"
          label="Flag Only"
          // onClick={handleChange}
          // checked=
          name="flag-only"
          className={mgStyle.formCheck}

          // className="col-md-3 "
        />
        <div>
          <button className={mgStyle.columnSaveBtn}>
            <span className={mgStyle.textBtnContent}>Add NEW</span>
            <span className={mgStyle.btnIcon}>
              <MdAdd />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpoGroupTable;
