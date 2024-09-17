import { useCallback, useState } from "react";
import { LiaSave } from "react-icons/lia";
import { PositionGrid } from "../../Tables";
import tableStyle from "../MTMChart/MtmPopupTable.module.scss";
import { DatePicker } from "antd";

import dayjs from "dayjs";
import { shallowEqual, useSelector } from "react-redux";
import { POST_COMPONENTSETTING_API } from "../../../API/ApiServices";

const PositionSymbolWiseTable = ({ exchange }) => {
  const [filterSetting, setFilterSetting] = useState({});
  const dateRange = useSelector((state) => state.dateRange, shallowEqual);

  const [date, setDate] = useState({
    fromdate: dateRange.fromdate,
    todate: dateRange.todate,
  });

  const handleDataFromTable = useCallback(async (data) => {
    setFilterSetting(data);
  }, [])

  const saveComponentSettings = async () => {
    const componentSetting = await POST_COMPONENTSETTING_API({
      data: filterSetting,
      event: filterSetting.id ? "update" : "create",
    });
    // console.log(componentSetting);
  };
  const handleDatePickerChange = (data, dateString) => {
    setDate((previous) => ({
      ...previous,
      fromdate: dateString[0],
      todate: dateString[1],
    }));
  };

  return (
    <div className={`popup-tableSection ${tableStyle.popupTableSection}`}>
      <div
        className={`${tableStyle.popupTableHeader} ${tableStyle.popupTableHeaderWithDate}`}
      >
        <div className={tableStyle.noteSection}>
          {/* <p>NOTE: As Per Product wise / Dollar MTM selection</p> */}
          <p>NOTE: As per Symbol wise /{exchange} selected</p>
        </div>
        <div
          className={`${tableStyle.dateSection} dateSection popupdateSection`}
        >
          <div className={tableStyle.datesinglesection}>
            <p>Select Date Range</p>
            <DatePicker.RangePicker
              disabled
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
          <button
            className={`column-save-btn ${tableStyle.columnSaveBtn}`}
            onClick={saveComponentSettings}
          >
            <span className={tableStyle.textBtnContent}> Save column </span>
            <span className={tableStyle.btnIcon}>
              <LiaSave />
            </span>
          </button>
        </div>
      </div>
      <div className="popup-custom-table">
        <PositionGrid
          view={"symbol"}
          table={"position"}
          dateRange={date}
          onDataFromTable={handleDataFromTable}
        />
      </div>
    </div>
  );
};

export default PositionSymbolWiseTable;
