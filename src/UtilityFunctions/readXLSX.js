import readXlsxFile from 'read-excel-file'
export const readXLSX = (file) => {
    return new Promise((resolve, reject) => {
        const schema = {
            'CLUSTERNAME': {
                prop: 'clustername'
            },
            'GROUPNAME': {
                prop: 'groupname'
            },
            'USERID': {
                prop: 'userid'
            },
        }

        readXlsxFile(file, { schema }).then(({ rows, errors }) => {
            resolve(rows)
            if (errors) reject(errors)
        })
    })

}