import { DatePicker } from "antd";
import dayjs from "dayjs";
import React, { useCallback, useState } from "react";
import { LiaSave } from "react-icons/lia";
import { shallowEqual, useSelector } from "react-redux";
import { POST_COMPONENTSETTING_API } from "../../../API/ApiServices";
import { CompanyMtmGrid } from "../../Tables";
import tableStyle from "../MTMChart/MtmPopupTable.module.scss";

const CMTMGroupTable = ({ sharing, type, basecurrency}) => {
  const dateRange = useSelector((state) => state.dateRange, shallowEqual);
  const [filterSetting, setFilterSetting] = useState({});
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

  const handleDataFromTable = useCallback(async (data) => {
    setFilterSetting(data);
  }, [])

  const saveComponentSettings = async () => {
    const componentSetting = new Promise((resolve, reject) => {
      resolve(POST_COMPONENTSETTING_API({
        data: filterSetting,
        event: filterSetting.id ? "update" : "create",
      }))
    })
    componentSetting.then(res => {
      setFilterSetting(res.data.result)
    }).catch(err => {
      console.log(err);
    })
  };

  return (
    <div className={`popup-tableSection ${tableStyle.popupTableSection}`}>
      <div
        className={`${tableStyle.popupTableHeader} ${tableStyle.popupTableHeaderWithDate}`}
      >
        <div className={tableStyle.noteSection}>
          {/* <p>NOTE: As Per Product wise / Cos / CF selection</p> */}
          <p>NOTE: As Per {`Group/${sharing}/${type}`} selection</p>
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
      <div className="popup-cposition-table">
        <CompanyMtmGrid
          dateRange={date}
          table={"cmtm"}
          view={"group"}
          sharing={sharing}
          type={type}
          onDataFromTable={handleDataFromTable}
          basecurrency={basecurrency}
        />
      </div>
    </div>
  );
};

export default React.memo(CMTMGroupTable);
