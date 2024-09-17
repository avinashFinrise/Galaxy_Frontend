export const hedgePosition = (data) => {
    try {
        // Filter rows based on conditions
        let filteredData = data.filter(row => row.symbol.startsWith('NIFTY') || row.symbol.startsWith('IN'));

        // Add new columns and set values based on conditions
        filteredData.forEach(row => {
            row.NSEIFSCQTY = row.exchange === 'SGXFO' || (row.exchange === 'NSEIFSC' ? row.cfqty : 0);
            row.NSEFOQTY = (row.exchange.startsWith('NSEFO') && row.symbol === 'NIFTY' && row.opttype === 'XX') ? row.cfqty : 0;
            row.NSECEQTY = (row.exchange.startsWith('NSEFO') && row.opttype === 'CE') ? row.cfqty : 0;
            row.NSEPEQTY = (row.exchange.startsWith('NSEFO') && row.opttype === 'PE') ? row.cfqty : 0;
        });

        // Group by userid and userid_id and aggregate sum for each column
        let result = {};
        filteredData.forEach(row => {
            let key = row.userid + '_' + row.userid_id;
            if (!result[key]) {
                result[key] = {
                    userid: row.userid,
                    userid_id: row.userid_id,
                    NSEIFSCQTY: 0,
                    NSEFOQTY: 0,
                    NSECEQTY: 0,
                    NSEPEQTY: 0,
                    hedge_ratio: 0,
                    out_qty: 0
                };
            }
            result[key].NSEIFSCQTY += row.NSEIFSCQTY;
            result[key].NSEFOQTY += row.NSEFOQTY;
            result[key].NSECEQTY += row.NSECEQTY;
            result[key].NSEPEQTY += row.NSEPEQTY;
        });

        // Convert result object to array
        result = Object.values(result);

        return result;
    } catch (e) {
        console.error("Error processing data: ", e);
        return null;
    }
}