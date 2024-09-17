
const numberformatter = Intl.NumberFormat("en-IN", {
    // style: "currency",
    // currency: "INR",
    maximumFractionDigits: 0,
});
const InrFormater = Intl.NumberFormat("en-IN", {
    // style: "currency",
    // currency: "INR",
    maximumFractionDigits: 3,
});

const formattableColumns = ["rate", "price", "ltp", "parity", "parity", "bid", "ask"]

export const currencyFormater = (val) => numberformatter.format(val)


export const formatValue = (e) => {
    if (isNaN(e.value)) return

    if (e.column.colId == "bfqty") return e.value?.toFixed(2)
    if (e.column.colId.includes("qty") && import.meta.env.VITE_REACT_APP_COMPANY == "spectra") return e.value?.toFixed(2)

    if (formattableColumns.some(col => (e.column.colId.includes(col) && !e.column.colId.includes("qty")) && !e.column.colId.match("id$"))) {
        return InrFormater.format(e.value)
    } else {
        return numberformatter.format(e.value)
    }
}


export const redGreenRowText = (params) => {
    if (isNaN(params.value)) return
    if (params.value >= 0) {
        return { color: "green" };
    } else {
        return { color: "red" };
    }
}
export const redGreenRowBgColor = (params) => {
    if (params?.data?.event == 'add') {
        return { backgroundColor: "#a4eda4" };
    } else if (params?.data?.event == "delete") {
        return { backgroundColor: "#e38686" };
    } else {
        return { backgroundColor: "gray" };
    }
}

export const sideBar = [
    {
        id: 'columns',
        labelDefault: 'Hide Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',

    },
    {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
    },

]




export function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


export const redGreenColBasedOnPrev = (e, el) => {
    const oldVal = e.data.prev;
    if (oldVal && e.data[e.column.colId] > oldVal[e.column.colId])
        return { color: "green" }
    else return { color: "red" }
}


export function numToWords(num = 0) {
    if (num == 0) return "Zero";
    num = ("0".repeat(2 * (num += "").length % 3) + num).match(/.{3}/g);
    let out = "",
        T10s = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"],
        T20s = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"],
        sclT = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion"];
    return num.forEach((n, i) => {
        if (+n) {
            let hund = +n[0], ten = +n.substring(1), scl = sclT[num.length - i - 1];
            out += (out ? " " : "") + (hund ? T10s[hund] + " Hundred" : "") + (hund && ten ? " " : "") + (ten < 20 ? T10s[ten] : T20s[+n[1]] + (+n[2] ? "-" : "") + T10s[+n[2]]);
            out += (out && scl ? " " : "") + scl;
        }
    }), out;
}