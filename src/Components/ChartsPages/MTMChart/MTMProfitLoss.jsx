import { memo } from "react";
import ProfitLossGrid from "../../Tables/ProfitLossGrid";
import mtmStyle from "./MTMDonut.module.scss";


const MTMProfitLoss = ({ basecurrency }) => {
  return (
    <div style={{ height: "100%" }}>
      <div className={`row ${mtmStyle.mtmProfitSection}`} style={{ height: "100%" }} >
        <div className={`col-md-6 ${mtmStyle.mtmProfitTable}`}>
          <ProfitLossGrid
            PNL={"profit"}
            view={"group"}
            basecurrency={basecurrency}
          />
        </div>
        <div className="col-md-6">
          <ProfitLossGrid PNL={"loss"} view={""} basecurrency={basecurrency} />
        </div>
      </div>
    </div>
  );
};

export default memo(MTMProfitLoss);
