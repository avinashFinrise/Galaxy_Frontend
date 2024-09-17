self.addEventListener('message', function (e) {
    const start = performance.now();
    const { data, excludeColumns, gridname, colD } = e.data;
    const colDefs = JSON.parse(colD)
    const newColDef = []
    Object.keys(data || []).map(e => {
        if (excludeColumns[gridname]?.some(i => i.includes(e))) return //excluding columns
        if (colDefs.map(def => def.field).includes(e)) return   // check if column with same field already exists
        newColDef.push({ field: e })
    })
    const end = performance.now();
    //console.log(`GetColDef ${gridname} took ${end - start} milliseconds`);
    self.postMessage({ grid: gridname, data: newColDef });
});