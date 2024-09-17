
// const spanData = { 181344157: [-24.44, 60.91, 109.05, 109.05, -430.38, -397.31, 109.05, 109.05, -1000.7, -998.83, 109.05, 109.05, -1604.24, -1604.22, 54.73, -1197.14] }


export function calculateMargin(data, spanData, position) {
    // console.log(data, spanData, position);
    if (data) {
        const results = [];
        let qty = 0;
        let cfamt = 0;
        let underlinesymboltoken = 0;
        let ltp = 0;
        // console.log({ data });

        for (const i of data) {
            // console.log("spanDataToken", spanData[+(i.token)]?.spanval);
            const spval = spanData[+(i.token)]?.spanval;
            // console.log({ spval, i });
            underlinesymboltoken = spanData[+(i.token)]?.underlinesymboltoken;
            if (spval) {

                const result = spval.map(value => value * i.qty);
                results.push(result);
                cfamt += i.cfamt;

                if (i.qty < 0) {

                    qty += i.qty;
                }
            }
        }

        if (results.length > 0) {
            let ltpForExposure = 21558//position?.find(val => val.token == underlinesymboltoken && val.securitytype.includes("FUT"))?.ltp
            // console.log("position", position);
            // console.log("underlinesymboltoken", underlinesymboltoken);
            // console.log(position.find(val => val.token == underlinesymboltoken));
            // const feed = new Promise((resolve, reject) => {
            //     resolve(GET_LTP_API({
            //         event: "getltp",
            //         data: {
            //             token: underlinesymboltoken
            //         }
            //     }))
            // })
            // feed.then(res => {
            //     ltp = res.data.result.ltp;
            //     console.log('in get8888888', ltp);

            // }).catch(err => { console.log(err) })
            const combined_result = results.reduce((acc, curr) => acc.map((value, index) => value + curr[index]));
            const max_value = Math.abs(Math.max(...combined_result));

            const exposure = (((Math.abs(qty) * ltpForExposure) * 2) / 100);
            const margin = max_value + exposure
            // console.log("Combined Result:", combined_result);
            // console.log("MAX Value:", max_value);
            // console.log("Qty Value:", qty);
            // console.log("Exposure Value:", exposure);
            // console.log("Margin:", margin);
            return [margin, exposure]
        } else {
            console.log("No valid data found in spanData.");
            return [0, 0]
        }
    } else {
        return [0, 0]
    }

}

// const testData = [{ 'token': 181344157, 'qty': -100 }, { 'token': 181344157, 'qty': 50 }]
// calculateMargin(testData);



// Group data by userid and collect tokens in a list
export function createMarginDataset(columnname, data) {

    const groupedData = new Map();
    const temp = data?.reduce((acc, entry) => {
        const key = entry[columnname] + "_" + entry.token;
        if (!acc[key]) {
            acc[key] = {
                [columnname]: entry[columnname],
                token: entry.token,
                exchange: entry.exchange,
                qty: 0,
                cfamt: 0,

            };
        }
        acc[key].qty += entry.cfqty;
        acc[key].cfamt += entry.grossmtm;
        return acc;
    }, {});
    // console.log("temp", temp);
    data = Object.values(temp)

    data?.forEach(item => {
        const uniqueKey = item[columnname];
        const { token, exchange, qty, cfamt } = item;

        if (qty !== 0 && (exchange === 'NSEFO' || exchange === 'MCX')) {
            if (!groupedData.has(uniqueKey)) {
                groupedData.set(uniqueKey, []);
            }
            groupedData.get(uniqueKey).push({ 'token': token, 'qty': qty, 'cfamt': cfamt });
        }
    });
    const resultArray = Array.from(groupedData, ([key, value]) => ({
        [columnname]: key,
        data: value,
    }));
    return resultArray
}