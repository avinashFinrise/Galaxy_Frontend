import { Form } from "react-bootstrap";
import sprdStyle from "./SpreadBook.module.scss";
import { Input } from "antd";

const compareValuesKeys = [
  "Greater Than (>)",
  "Less Than (<)",
  "Equal",
  "Between",
]

const EditSpreadBook = ({ editSpreadBook, setEditSpreadBook }) => {
  const onChangeHandle = (e) => {
    console.log("e", e.target.id);
    // let updatedFlag = "";
    if (e.target.id == "input") {
      setEditSpreadBook((previous) => ({
        ...previous,
        inputvalue: e.target.value,
      }));
    }
    if (e.target.id == "compareByDropDown") {
      // setCompareByValue(e.target.value)
      setEditSpreadBook((previous) => ({
        ...previous,
        compareByValue: e.target.value,
      }));
    }
    if (e.target.id == "inputTo") {
      setEditSpreadBook((previous) => ({
        ...previous,
        inputvalueTo: e.target.value,
      }));
    }
    if (e.target.id == "flagCheckbox") {
      // updatedFlag = editSpreadBook?.flag.includes(e.target.value)
      //     ? editSpreadBook?.flag.filter(
      //         (flag) => flag !== e.target.value
      //     )
      //     : [...editSpreadBook?.flag, e.target.value];

      // updatedFlag = editSpreadBook.flag == e.target.name ? "" : e.target.name
      setEditSpreadBook((previous) => ({
        ...previous,
        flag: previous?.flag == e.target.value ? "" : e.target.value,
      }));
    }
    // if (e.target.name == "flag-only") {
    //     updatedFlag = editSpreadBook.flag.includes(e.target.value)
    //     ? editSpreadBook.flag.filter(
    //       (flag) => flag !== e.target.value
    //     )
    //     : [...editSpreadBook.flag, e.target.value];

    //   setEditSpreadBook((previous) => ({
    //     ...previous,
    //     flag: updatedFlag,
    //   }));

    // }
  };
  return (
    <div className={`${sprdStyle.editSprdBookSection} alertTableSection`}>
      <div className={sprdStyle.editSprdBookHeader}>
        {editSpreadBook?.flag != "allflag" &&
          <>
            <Input
              placeholder="disparity value"
              id="input"
              value={editSpreadBook?.inputvalue}
              onChange={(e) => onChangeHandle(e)}
              type="number"
              style={{ width: "20%" }}
            ></Input>
            {editSpreadBook?.compareByValue == "Between" && (
              <Input
                placeholder="To value"
                id="inputTo"
                value={editSpreadBook?.inputvalueTo}
                onChange={(e) => onChangeHandle(e)}
                type="number"
                style={{ width: "20%" }}
              ></Input>
            )}
            <div>
              <Form.Select
                onChange={(e) => onChangeHandle(e)}
                value={editSpreadBook?.compareByValue}
                id="compareByDropDown"
                className={sprdStyle.selectForm}
              >
                {compareValuesKeys?.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </Form.Select>
            </div>

            <Form.Check
              type="checkbox"
              id="flagCheckbox"
              label="Flag Only"
              checked={editSpreadBook?.flag == "flagonly"}
              // onClick={handleChange}
              // checked=
              name="selectflag"
              value="flagonly"
              className={sprdStyle.formCheck}
              onChange={(e) => onChangeHandle(e)}
            // className="col-md-3 "
            // onChange={(e) => { setEditSpreadBook(prev => ({ ...prev, flag: e.target.value })) }}
            />
          </>
        }

        <Form.Check
          type="checkbox"
          id="flagCheckbox"
          label="all"
          // onClick={handleChange}
          // checked=
          name="selectflag"
          value="allflag"
          checked={editSpreadBook?.flag == "allflag"}
          onChange={(e) => onChangeHandle(e)}
          className={sprdStyle.formCheck}
        // className="col-md-3 "
        />
      </div>
    </div>
  );
};

export default EditSpreadBook;
