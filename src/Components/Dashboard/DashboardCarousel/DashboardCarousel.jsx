import { Card } from "react-bootstrap";
import { shallowEqual, useSelector } from "react-redux";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import ABSWatch from "../../ChartsPages/ABSWatch/ABSWatch";
import CMtmChart from "../../ChartsPages/CMTMChart/CMtmChart";
import CPositionProductWiseChart from "../../ChartsPages/CPositionProductWiseChart/CPositionProductWiseChart";
import MTMDonut from "../../ChartsPages/MTMChart/MTMDonut";
import PositionBar from "../../ChartsPages/PositionChart/PositionBar";
import HedgePosition from "../../HedgePosition/HedgePosition";
import NotificationAlert from "../../NotificationAlert/NotificationAlert";
import OverallSummary from "../../OverallSummary/OverallSummary";
import curStyle from "./DashboardCarousel.module.scss";
import C_Stress_Test from "../../C_Stress_Test/C_Stress_Test";
import DataSummary from "../../DataSummary/DataSummary";

const DashboardCarousel = ({ id }) => {
  const userControlSettings = useSelector(
    (state) => state.userControlSettings,
    shallowEqual
  );
  const isAdmin = useSelector(state => state?.userControlSettings?.role?.toLowerCase() == 'admin' ? true : false)

  const notificationAlertData = useSelector(
    (state) => state?.isNotificationAlert,
    shallowEqual
  );
  const curouselCom = [
    {
      a: <ABSWatch />,
      title: "ARB  Watch",
    },
    {
      a: <MTMDonut />,
      title: "MTM",
    },
    {
      a: <PositionBar />,
      title: "Position",
    },
    // {
    //   a: <SymbolDonutChart />,
    //   title: "Symbol wise Limits",
    // },
    // {
    //   a: <HistoricalDataChart />,
    //   title: "Historical Data ",
    // },
    {
      a: <CPositionProductWiseChart />,
      title: "C Position Product wise",
    },
    {
      a: <CMtmChart />,
      title: "C MTM",
    },
    // {
    //   a: <CHistoricalData />,
    //   title: "C Historical Data",
    // },
    // {
    //   a: <MarginAndExpoGroup />,
    //   title: "Margin & Expo Grouping",
    // },
    // {
    //   a: <ServiceManager />,
    //   title: "Service Manager"
    // },

    {
      a: <HedgePosition />,
      title: "Nifty Hedge Position"
    },
    {
      a: <OverallSummary />,
      title: "C Overall Summary"
    },
    {
      a: <C_Stress_Test />,
      title: "C Stress Test"
    },
    {
      a: <DataSummary />,
      title: "Data Summary"
    },
  ];
  const titleToControlSetting = {
    "ARB  Watch": "is_arb_watch",
    "MTM": "is_mtm",
    "Position": "is_position",
    // "Symbol wise Limits": "is_symbol_limit",
    // "Historical Data": "is_historical",
    "C Position Product wise": "is_c_position",
    "C MTM": "is_c_mtm",
    "C Stress Test": "is_c_stress_test",
    // "C Historical Data": "is_c_historical",
    // "Margin & Expo Grouping": "is_margin_and_exposure_grouping",
    // "Service Manager": "is_service_manager",
    "Nifty Hedge Position": "is_hedge_position",
    "Data Summary": "is_data_summary",
  };
  const curouselComFiltered = curouselCom.filter(item => {
    const controlSetting = titleToControlSetting[item.title];
    return controlSetting ? userControlSettings?.card_control?.[controlSetting] : true;
  });
  // const curouselComFiltered = curouselCom.filter(item => {
  //   if (item.title === "ARB  Watch") {
  //     return userControlSettings?.card_control?.is_arb_watch;
  //   } else if (item.title === "MTM") {
  //     return userControlSettings?.card_control?.is_mtm;

  //   } else if (item.title === "Position") {
  //     return userControlSettings?.card_control?.is_position;

  //   } else if (item.title === "Symbol wise Limits") {
  //     return userControlSettings?.card_control?.is_symbol_limit;
  //   } else if (item.title === "Historical Data") {
  //     return userControlSettings?.card_control?.is_historical;
  //   } else if (item.title === "C Position Product wise") {
  //     return userControlSettings?.card_control?.is_c_position;
  //   } else if (item.title === "C MTM") {
  //     return userControlSettings?.card_control?.is_c_mtm;
  //   } else if (item.title === "C Historical Data") {
  //     return userControlSettings?.card_control?.is_c_historical;
  //   } else if (item.title === "Margin & Expo Grouping") {
  //     return userControlSettings?.card_control?.is_margin_and_exposure_grouping;
  //   } else if (item.title === "Service Manager") {
  //     return userControlSettings?.card_control?.is_service_manager;
  //   } else if (item.title === "Nifty Hedge Position") {
  //     return userControlSettings?.card_control?.is_hedge_position;
  //   }
  //   return true;
  // });
  return (
    <div>
      <Slider
        slidesToShow={1}
        autoplaySpeed={2000}
        draggable={true}
        dots={false}
        infinite={true}
        lazyLoad="ondemand"
      >
        {curouselComFiltered.map((item, i) => {
          return (
            <Card key={i} className={`${curStyle.carousection} carousection`}>
              <Card.Header className={curStyle.cardHeader}>
                <p>{item.title}</p>
                {/* <div style={{flexGrow: 1}} /> */}
                {/* <div onClick={() => onRemoveItem(id)}>
                                <AiOutlineClose />
                            </div> */}
              </Card.Header>
              <Card.Body className={curStyle.cardBody}>{item.a}</Card.Body>
            </Card>
          );
        })}
      </Slider>
      {
        isAdmin &&
        <Card className={`${curStyle.carousection} ${curStyle.alertCardSection} carousection`}>
          <Card.Header className={curStyle.cardHeader}>Alert Notification
            <span
              style={{ paddingLeft: "1rem", color: "red", fontWeight: '500' }}
            >
              ({notificationAlertData && notificationAlertData.length})
            </span>
          </Card.Header>
          <Card.Body className={curStyle.cardBody}>
            <NotificationAlert />
          </Card.Body>
        </Card>
      }
    </div>
  );
};

export default DashboardCarousel;
