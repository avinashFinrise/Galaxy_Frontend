import React, { useCallback, useState } from "react";
import { LiaSave } from "react-icons/lia";
import tableStyle from "./MtmPopupTable.module.scss";
import { DatePicker } from "antd";
import { shallowEqual, useSelector } from "react-redux";
import {
  POST_COMPONENTSETTING_API,
} from "../../../API/ApiServices";

import dayjs from "dayjs";
import MtmGrid from "../../TableComponent/MtmGrid";

let defaultGroupingByGroup = [
  // "clustername",
  "groupname",
  "userid",
  "exchange",
  "symbol",
  "expirydate",
  "opttype",
  "strikeprice",
];

const MtmGroupWiseTable = ({ basecurrency, bftd }) => {
  const dateRange = useSelector((state) => state.dateRange, shallowEqual);
  const [date, setDate] = useState({
    fromdate: dateRange.fromdate,
    todate: dateRange.todate,
  });
  const [filterSetting, setFilterSetting] = useState({});
  // const mtm = useSelector((state) => state.mtm, shallowEqual);
  // const positionType = useSelector(
  //   (state) => state.positionTypeInMtm,
  //   shallowEqual
  // );


  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const componentSettingfetch = await GET_COMPONENTSETTING_API({
  //         componentname: "mtm_group",
  //       });
  //       setFilterSetting(componentSettingfetch?.data?.result?.table);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   })();
  // }, []);


  const handleDataFromTable = useCallback(async (data) => {
    setFilterSetting(data);
  }, [])

  const saveComponentSettings = async () => {
    const componentSetting = await POST_COMPONENTSETTING_API({
      data: filterSetting,
      event: filterSetting.id ? "update" : "create",
    });
  };

  const handleDatePickerChange = (data, dateString) => {
    setDate((previous) => ({
      ...previous,
      fromdate: dateString[0],
      todate: dateString[1],
    }));
  };
  // useEffect(() => {
  //   (async () => {
  //     const positionApi = await GET_NETPOSITION_API({
  //       event: "getnetposition",
  //       data: date,
  //     });

  //     if (positionApi) {
  //       setPositionData(positionApi.data.result);
  //     }
  //   })();
  // }, [date]);

  console.log("render====>");
  return (
    <div className={`popup-tableSection ${tableStyle.popupTableSection}`}>
      <div
        className={`${tableStyle.popupTableHeader} ${tableStyle.popupTableHeaderWithDate}`}
      >
        <div className={tableStyle.noteSection}>
          <p>
            NOTE: As Per Group wise /{" "}
            {`${basecurrency.toUpperCase()}/${bftd?.toUpperCase()}`}
          </p>
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
      <div className="popup-custom-table">
        {/* <PositionGrid
          view={"group"}
          table={"mtm"}
          onDataFromTable={handleDataFromTable}
          dateRange={date}
        /> */}
        <MtmGrid
          bftd={bftd}
          view={"group"}
          defaultGroupingBySymbol={defaultGroupingByGroup}
          dateRange={date}
          onDataFromTable={handleDataFromTable}
          basecurrency={basecurrency}
        />
      </div>
    </div>
  );
};

export default React.memo(MtmGroupWiseTable);
