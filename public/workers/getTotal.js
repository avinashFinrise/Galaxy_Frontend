function calculateTotals(colDef) {
    let totals = {};
    colDef.forEach((e) => {
        if (["qty", "mtm", "amt", "charges"].some((s) => e.includes(s))) {
            totals = { ...totals, [e]: 0 };
        }
    });

    return totals;
}


self.onmessage = (event) => {
    // const start = performance.now()
    const { gridRows, colDefString } = event.data;

    const totals = calculateTotals(Object.keys(gridRows[0]))

    if (gridRows.length) {
        gridRows.forEach((node) => {
            Object.keys(totals).forEach((e, i) => {
                if (isNaN(node[e])) return
                totals[e] += (parseFloat(node[e]))

            })
        });
    }
    // console.log({ grossmtm: totals.grossmtm, netmtm: totals.netmtm, charges: totals.charges })
    // const end = performance.now()
    // console.log(`GetTotal took ${end - start} milliseconds`);
    self.postMessage({ symbol: "Total", ...totals });
}
