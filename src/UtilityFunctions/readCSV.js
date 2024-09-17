export const readCSV = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const content = event.target.result;
            const rows = content.split('\n');

            const headers = rows[0].split(',');

            const data = rows.slice(1).map((row) => {
                const cells = row.split(',');

                return headers.reduce((obj, header, index) => {
                    obj[header.replace(/^"(.*)"$/, '$1').trim()] = cells[index].replace(/^"(.*)"$/, '$1').trim();
                    return obj;
                }, {});
            });
            resolve(data)
        };
        reader.onerror = (error) => {
            reject(error)
        }
        reader.readAsText(file);
    })
}