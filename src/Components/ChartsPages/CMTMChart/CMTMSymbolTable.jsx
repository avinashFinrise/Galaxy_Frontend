import { useState } from "react";
import { CompanyMtmGrid } from "../../Tables";
import tableStyle from "../MTMChart/MtmPopupTable.module.scss";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { shallowEqual, useSelector } from "react-redux";
// import { POST_COMPONENTSETTING_API } from "../../../API/ApiServices";

const CMTMSymbolTable = ({ sharing, type,basecurrency }) => {
  // const [filterSetting, setFilterSetting] = useState({});
  const dateRange = useSelector((state) => state.dateRange, shallowEqual);
  const [date, setDate] = useState({
    fromdate: dateRange.fromdate,
    todate: dateRange.todate,
  });

  const handleDatePickerChange = (data, dateString) => {
    setDate((previous) => ({
      ...previous,
      fromdate: dateString[0],
      todate: dateString[1],
    }));
  };

  // const handleDataFromTable = useCallback(async (data) => {
  //   setFilterSetting(data);
  // }, [])

  // const saveComponentSettings = async () => {
  //   const componentSetting = new Promise((resolve, reject) => {
  //     resolve(POST_COMPONENTSETTING_API({
  //       data: filterSetting,
  //       event: filterSetting.id ? "update" : "create",
  //     }))
  //   })
  //   componentSetting.then(res => {
  //     setFilterSetting(res.data.result)
  //   }).catch(err => {
  //     console.log(err);
  //   })
  // };

  return (
    <div className={`popup-tableSection ${tableStyle.popupTableSection}`}>
      <div
        className={`${tableStyle.popupTableHeader} ${tableStyle.popupTableHeaderWithDate}`}
      >
        <div className={tableStyle.noteSection}>
          {/* <p>NOTE: As Per Product wise / Cos / CF selection</p> */}
          <p>NOTE: As Per {`Symbol/${sharing}/${type}`} selection</p>
        </div>
        <div
          className={`${tableStyle.dateSection} dateSection popupdateSection`}
        >
          <div className={tableStyle.datesinglesection}>
            <p>Select Date Range</p>
            <DatePicker.RangePicker
              onChange={handleDatePickerChange}
              format="YYYY-MM-DD" // Specify the date format
              placeholder={["Start Date", "End Date"]}
              defaultValue={[dayjs(date.fromdate), dayjs(date.todate)]}
              // renderExtraFooter={() => "extra footer"}
              allowClear={true} // Set to true if you want to allow clearing the
              className={tableStyle.datePicker}
            />
          </div>
        </div>
        {/* <div className={tableStyle.selectionSection}>
        <Form.Select name="" id="" className={tableStyle.formSelect}>
          <option value="">Exchange</option>
          <option value="">sgx</option>
        </Form.Select>
        <Form.Select name="" id="" className={tableStyle.formSelect}>
          <option value="">Segmanet</option>
          <option value="">sgx</option>
        </Form.Select>
        <Form.Select name="" id="" className={tableStyle.formSelect}>
          <option value="">group</option>
          <option value="">sgx</option>
        </Form.Select>
        <Form.Select name="" id="" className={tableStyle.formSelect}>
          <option value="">client</option>
          <option value="">sgx</option>
        </Form.Select>
        <Form.Select name="" id="" className={tableStyle.formSelect}>
          <option value="">product</option>
          <option value="">sgx</option>
        </Form.Select>
      </div> */}

        <div>
          {/* <button
            className={`column-save-btn ${tableStyle.columnSaveBtn}`}
            onClick={saveComponentSettings}>
            <span className={tableStyle.textBtnContent}> Save column </span>
            <span className={tableStyle.btnIcon}>
              <LiaSave />
            </span>
          </button> */}
        </div>
      </div>
      <div className="popup-cposition-table">
        <CompanyMtmGrid
          dateRange={date}
          table={"cmtm"}
          view={"symbol"}
          sharing={sharing}
          type={type}
          basecurrency={basecurrency}
        // onDataFromTable={handleDataFromTable}
        />
      </div>
    </div>
  );
};

export default CMTMSymbolTable;
