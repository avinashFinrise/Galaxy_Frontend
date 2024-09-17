import { useState } from "react";
import { CompanyPositionGrid } from "../../Tables";
import tableStyle from "../MTMChart/MtmPopupTable.module.scss";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { shallowEqual, useSelector } from "react-redux";

const CPositionGroupWiseTable = ({ sharing }) => {
  const dateRange = useSelector((state) => state.dateRange, shallowEqual);
  const [date, setDate] = useState({
    fromdate: dateRange.fromdate,
    todate: dateRange.todate,
  });
  return (
    <div className={`popup-tableSection ${tableStyle.popupTableSection}`}>
      <div className={`${tableStyle.popupTableHeader} ${tableStyle.popupTableHeaderWithDate}`} >
        <div className={tableStyle.noteSection}>
          <p>NOTE: As per Group/{sharing} selection</p>
        </div>
        <div className={`${tableStyle.dateSection} dateSection popupdateSection`} >
          <div className={tableStyle.datesinglesection}>
            <p>Select Date Range</p>
            <DatePicker.RangePicker
              disabled
              format="YYYY-MM-DD" // Specify the date format
              placeholder={["Start Date", "End Date"]}
              defaultValue={[dayjs(date.fromdate), dayjs(date.todate)]}
              className={tableStyle.datePicker}
            />
          </div>
        </div>

        {/* <div>
          <button className={`column-save-btn ${tableStyle.columnSaveBtn}`}>
            <span className={tableStyle.textBtnContent}> Save column </span>
            <span className={tableStyle.btnIcon}>
              <LiaSave />
            </span>
          </button>
        </div> */}
      </div>
      <div className="popup-cposition-table">
        <CompanyPositionGrid
          view={"group"}
          table={"position"}
          dateRange={date}
        />
      </div>
    </div>
  );
};

export default CPositionGroupWiseTable;
