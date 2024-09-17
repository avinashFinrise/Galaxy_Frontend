import { useState, useEffect } from "react";
import symbCard from "./SymbolCard.module.scss";
import { useSelector } from "react-redux";
import { BsCurrencyDollar, BsCurrencyRupee } from "react-icons/bs";
import { currencyFormater } from "../../../../UtilityFunctions/grid";
const dummyData = [
  {
    SymbolName: "NOT FOUND!",
    symbolprice: 0,
    "Current Pos": 0,
    "Change in pos": 0,
    percent: "0%",
  },
];

const SymbolCard = ({ fontSize }) => {
  const [symbolIndex, setSymbolIndex] = useState(0);
  const [marginData, setMarginData] = useState([]);
  const PositionChartData = useSelector(state => state?.positionChart);



  useEffect(() => {
    const updateDataInterval = setInterval(() => {
      const newIndex = symbolIndex < marginData.length - 1 ? symbolIndex + 1 : 0
      setSymbolIndex(newIndex);
    }, 5000);

    return () => {
      clearInterval(updateDataInterval);
    };
  }, [symbolIndex, marginData.length]);







  useEffect(() => {
    if (PositionChartData && PositionChartData.length > 0) {
      // console.log("sending to ");
      // worker.postMessage({data:PositionChartData,type:groupOrProduct})
      // const filteredPositionChartData = PositionChartData.filter((item) => {
      //   if (dollarMtmORarbMtmState === "dollarMtm") {
      //     // If dollarMtmORarbMtmState is "dollarMtm", only return items with basecurrency "USD".
      //     return item.basecurrency === "USD";
      //   } else {
      //     // If dollarMtmORarbMtmState is not "dollarMtm", return everything.
      //     return true;
      //   }
      // })
      const result = {}
      PositionChartData.forEach(obj => {
        const symbol = obj["symbol"];
        const expirydateAndOpttype = obj["expirydate"] + obj["opttype"];

        const { netqty, cfqty, netmtm, bfqty, bfamt, basecurrency } = obj

        let percent = 0;
        if (!isNaN(netmtm) && isFinite(netmtm) && !isNaN(bfqty) && isFinite(bfamt) && bfamt !== 0) {
          percent = Math.abs((netmtm / bfamt) * 100);
        }

        if (result[symbol]) {
          result[symbol].netqty += netqty;
          result[symbol].cfqty += cfqty;
          result[symbol].bfqty += bfqty;
          result[symbol].netmtm += netmtm;
          result[symbol].bfamt += bfamt;
        } else {
          result[symbol] = { symbol, expirydateAndOpttype, netqty, cfqty, bfqty, percent, netmtm, bfamt, basecurrency };
        }
      })


      const MTMDATA = result && Object.values(result);
      setMarginData(MTMDATA);
    }

  }, [PositionChartData]);

  // console.log("symbolData", symbolData);

  const symbolData = marginData[symbolIndex]

  return (
    <div className={`${symbCard.symbolchangingSection} symbolchangingSection`}>
      <div style={{ fontSize: `${fontSize}px` }}>
        {symbolData && (
          <div>
            <div className={symbCard.SymbolNPercentage} >
              <div className={symbCard.symbolContainer}>
                <p className={symbCard.symbolname}
                  style={{ fontSize: `${fontSize}px` }}>{symbolData["symbol"]}</p>
                <p className={symbCard.symbolname} style={{ fontSize: `${fontSize}px` }}>
                  {symbolData["expirydateAndOpttype"]}
                </p>
              </div>
              <p className={symbCard.percentage} style={{ fontSize: `${fontSize}px` }}>
                {Math.floor(symbolData["percent"])}%
              </p>
            </div>
            <p className={symbCard.symbolPrice} style={{ fontSize: `${fontSize}px` }}>
              <span
                style={{
                  color:
                    Math.floor(symbolData["netmtm"]) > 0
                      ? "#06BE71"
                      : "rgb(255, 0, 0)",
                }}
              >
                {currencyFormater(symbolData["netmtm"])}
              </span>
              <span style={{ verticalAlign: "text-bottom", color: "#848484" }}>
                {symbolData["basecurrency"] == "USD" ? (
                  <BsCurrencyDollar />
                ) : (
                  <BsCurrencyRupee />
                )}
              </span>
            </p>
            <div>
              <p className={symbCard.currentPos} style={{ fontSize: `${fontSize}px` }}>Carry Forword Pos</p>
              <p
                className={symbCard.currentPosValue}
                style={{
                  color: symbolData["cfqty"] > 0 ? "#06BE71" : "rgb(255, 0, 0)", fontSize: `${fontSize}px`
                }}
              >
                {currencyFormater(symbolData["cfqty"])}
              </p>
            </div>
            <div>
              <p className={symbCard.ChangeInPosition} style={{ fontSize: `${fontSize}px` }}>Today Net Pos</p>
              <p
                className={symbCard.ChangeInPositionValue}
                style={{
                  color:
                    symbolData["netqty"] > 0 ? "#06BE71" : "rgb(255, 0, 0)", fontSize: `${fontSize}px`
                }}
              >
                {currencyFormater(symbolData["netqty"])}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymbolCard;
