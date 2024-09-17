import React, { lazy, Suspense, useMemo } from 'react';

import { shallowEqual, useSelector } from "react-redux";
import CardFallback from '../../Fallback/CardFallback';
import winStyle from "./DashboardWindow.module.scss";

// import ABSWatch from "../../ChartsPages/ABSWatch/ABSWatch";
// import NewAlert from "../../ChartsPages/AlertCard/NewAlert";
// import CHistoricalData from "../../ChartsPages/CHistoricalDataChart/CHistoricalData";
// import CMtmChart from "../../ChartsPages/CMTMChart/CMtmChart";
// import CPositionProductWiseChart from "../../ChartsPages/CPositionProductWiseChart/CPositionProductWiseChart";
// import HistoricalDataChart from "../../ChartsPages/HistoricalDataChart/HistoricalDataChart";
// import MTMDonut from "../../ChartsPages/MTMChart/MTMDonut";
// import MarginAndExpoGroup from "../../ChartsPages/MarginAndExpoGroup/MarginAndExpoGroup";
// import Marketwatch from "../../ChartsPages/Marketwatch/Marketwatch";
// import PositionBar from "../../ChartsPages/PositionChart/PositionBar";
// import SymbolDonutChart from "../../ChartsPages/SymboleWiseLimits/SymbolDonutChart";
// import HedgePosition from "../../HedgePosition/HedgePosition";
// import OverallSummary from "../../OverallSummary/OverallSummary";
// import ServiceManager from "../../ServiceManager/ServiceManager";

const ABSWatch = lazy(() => import('../../ChartsPages/ABSWatch/ABSWatch'));
const NewAlert = lazy(() => import('../../ChartsPages/AlertCard/NewAlert'));
const CHistoricalData = lazy(() => import('../../ChartsPages/CHistoricalDataChart/CHistoricalData'));
const CMtmChart = lazy(() => import('../../ChartsPages/CMTMChart/CMtmChart'));
const CPositionProductWiseChart = lazy(() => import('../../ChartsPages/CPositionProductWiseChart/CPositionProductWiseChart'));
const HistoricalDataChart = lazy(() => import('../../ChartsPages/HistoricalDataChart/HistoricalDataChart'));
const MTMDonut = lazy(() => import('../../ChartsPages/MTMChart/MTMDonut'));
const MarginAndExpoGroup = lazy(() => import('../../ChartsPages/MarginAndExpoGroup/MarginAndExpoGroup'));
const Marketwatch = lazy(() => import('../../ChartsPages/Marketwatch/Marketwatch'));
const PositionBar = lazy(() => import('../../ChartsPages/PositionChart/PositionBar'));
const SymbolDonutChart = lazy(() => import('../../ChartsPages/SymboleWiseLimits/SymbolDonutChart'));
const HedgePosition = lazy(() => import('../../HedgePosition/HedgePosition'));
const OverallSummary = lazy(() => import('../../OverallSummary/OverallSummary'));
const C_Stress_Test = lazy(() => import('../../C_Stress_Test/C_Stress_Test'));
const ServiceManager = lazy(() => import('../../ServiceManager/ServiceManager'));
const DataSummary = lazy(() => import('../../DataSummary/DataSummary'));
const MT5Order = lazy(() => import('../../ChartsPages/MT5Order/MT5Order'));


//icons
// import { FaChartPie as FcPieChart } from "react-icons/fa";
import { Card } from 'react-bootstrap';
import { FcAreaChart, FcBarChart, FcComboChart, FcDoughnutChart, FcPieChart } from "react-icons/fc";

export default function Widget({ id }) {
  const userControlSettings = useSelector(
    (state) => state.userControlSettings,
    shallowEqual
  );

  const widgetNames = {
    a: { title: "ABS Watch", skeletonProps: {} },
    b: { title: "MTM", skeletonProps: { type: "graph", withContent: true, Icon: FcPieChart } },
    c: { title: "Position", skeletonProps: { type: "graph", Icon: FcBarChart } },
    d: { title: "Symbol wise Limits", skeletonProps: { type: "graph", withContent: true, Icon: FcDoughnutChart } },
    e: { title: "Historical Data", skeletonProps: { type: "graph", Icon: FcAreaChart } },
    f: { title: "Alert", skeletonProps: {} },
    g: { title: "C Position Product wise", skeletonProps: { type: "graph", Icon: FcBarChart } },
    h: { title: "Margin & Exposure Grouping", skeletonProps: { type: "graph", Icon: FcComboChart } },
    i: { title: "C Historical Data", skeletonProps: { type: "graph", Icon: FcAreaChart } },
    j: { title: "C MTM", skeletonProps: { type: "graph", withContent: true, Icon: FcDoughnutChart } },
    k: { title: "Service Manager", skeletonProps: {} },
    l: { title: "Nifty Hedge Position", skeletonProps: {} },
    n: { title: "C Overall Summary", skeletonProps: {} },
    o: { title: "Market Watch", skeletonProps: {} },
    q: { title: "C Stress Test", skeletonProps: {} },
    r: { title: "Data Summary", skeletonProps: {} },
    s: { title: "MT5 Order Logs", skeletonProps: {} }
  };
  const widgetBody = {
    a: userControlSettings?.card_control?.is_arb_watch && ABSWatch,
    b: userControlSettings?.card_control?.is_mtm && MTMDonut,
    c: userControlSettings?.card_control?.is_position && PositionBar,
    d: userControlSettings?.card_control?.is_symbol_limit && SymbolDonutChart,
    e: userControlSettings?.card_control?.is_historical && HistoricalDataChart,
    f: userControlSettings?.card_control?.is_c_alert && NewAlert,
    g: userControlSettings?.card_control?.is_c_position && CPositionProductWiseChart,
    h: userControlSettings?.card_control?.is_margin_and_exposure_grouping && MarginAndExpoGroup,
    i: userControlSettings?.card_control?.is_c_historical && CHistoricalData,
    j: userControlSettings?.card_control?.is_c_mtm && CMtmChart,
    k: userControlSettings?.card_control?.is_service_manager && ServiceManager,
    l: userControlSettings?.card_control?.is_hedge_position && HedgePosition,
    n: userControlSettings?.card_control?.is_overall_summary && OverallSummary,
    o: userControlSettings?.card_control?.is_marketwatch && Marketwatch,
    q: userControlSettings?.card_control?.is_c_stress_test && C_Stress_Test,
    r: userControlSettings?.card_control?.is_data_summary && DataSummary,
    s: userControlSettings?.card_control?.is_mt5order_logs && MT5Order
  };


  //   if (userControlSettings?.card_control?.is_arb_watch) {
  //     widgetBody["a"] = ABSWatch;
  //   }
  // })();

  // console.log("userControlSettings", userControlSettings);
  // const classes = useStyles();
  // console.log(id);
  const handleScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    }
    else {
      document.exitFullscreen()
    }
  }
  const CardD = useMemo(() => widgetBody[id], [])
  return (
    // <Card className={classes.root}>
    <Card className={`${winStyle.cardSection} windowCard `}>
      <Card.Header className={winStyle.cardHeader}>
        <p>{widgetNames[id].title}</p>

      </Card.Header>

      <Card.Body className={winStyle.cardBody}>
        <Suspense fallback={<CardFallback {...widgetNames[id].skeletonProps} />}>
          <CardD skeletonProps={widgetNames[id].skeletonProps} />
        </Suspense>
      </Card.Body>
    </Card>
  );
}
