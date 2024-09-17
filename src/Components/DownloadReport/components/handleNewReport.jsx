import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CREATE_GROUP_API, DOWNLOAD_DETAILED_REPORT } from '../../../API/ApiServices.js';
import logo from "../../../assets/logo/Spectra-global-light.png";
import { font } from "./AnonymousPro-Regular-normal.js";


const PADDING = 5
const headerStart = 20
const HEADERHEGIHT = headerStart + 25
const tototal = ["qty", "mtm", "debit", "credit"]

export const DrowTable = (doc, data, start, aulternateGroup, groupnames) => {
    let curr = start;

    let isFirstTableDrown = false;
    Object.keys(data).forEach((key) => {
        const d = data[key];

        if (d.length) {
            if (isFirstTableDrown) {
                curr = HEADERHEGIHT
                doc.addPage()
                doc.setPage(doc.internal.getNumberOfPages() + 1)
            }

            let buySellIndex = -1
            let groupNameIndex = -1

            const colDefs = Object.keys(d[0]).map((e, ind) => {
                if (e == "buysell") buySellIndex = ind
                if (e == "groupname") groupNameIndex = ind
                return e.toUpperCase()
            })
            const isTableHalf = colDefs.length <= 3;

            isFirstTableDrown = true
            const width = (doc.internal.pageSize.width - PADDING) / (isTableHalf ? 2 : 1)

            const backgroundColor = '#f0f0f0'; // Light grey color
            doc.setFillColor(backgroundColor);
            doc.rect(PADDING, curr, width - PADDING, 10, 'F');

            doc.setFontSize(10);
            doc.line(PADDING, curr, width, curr);

            curr += 5
            doc.text(key.toUpperCase().split('').join(" "), (width + PADDING) / 2, curr, { align: 'center' });

            curr += 2
            doc.line(PADDING, curr, width, curr);
            doc.setFontSize(8);

            const total = ["Total"]




            const tradesData = d.map((trade) => {
                const data = Object.values(trade).map((e, i) => {
                    return typeof e === 'number' ? e.toFixed(["TRADEPRICE", "SETTLEMENT_PRICE"].includes(colDefs[i]) ? 4 : 0) : e
                })
                data.forEach((e, i) => {
                    if (buySellIndex != -1) data[buySellIndex] = data[buySellIndex] == 1 ? "BUY" : "SELL"

                    if (groupNameIndex != -1) {
                        data[groupNameIndex] = `${aulternateGroup ? aulternateGroup.alternate_name : groupnames || "N/A"}`.toUpperCase()
                    }
                    if (tototal.some(e => colDefs[i]?.toLocaleLowerCase().includes(e))) {
                        if (isNaN(total[i])) total[i] = 0
                        total[i] += +e
                    }
                })
                return data
            });

            curr += 0.3
            doc.autoTable({
                startY: curr,
                head: [colDefs],
                body: total.length > 1 ? [...tradesData, total.map(e => typeof e === 'number' ? e.toFixed(2) : e)] : tradesData,
                margin: { left: PADDING, right: PADDING, top: HEADERHEGIHT, bottom: 20 },
                styles: { fontSize: 7 },
                tableWidth: (width - PADDING),
                didParseCell: function (data) {
                    var rows = data.table.body;
                    if (total.length > 1 && data.row.index === rows.length - 1) {
                        data.cell.styles.fontStyle = 'bold'; // Make text bold
                        data.cell.styles.fontSize = 8; // Increase font size
                        data.cell.styles.fillColor = [255, 234, 145]; // Set background color
                    }
                }
            });
        }

    })


}

export const downloadNewReport = async (body, date, setNotifyData, wise) => {

    const usernames = []
    const userids = []

    body.username.forEach(e => {
        const [uername, id] = e.split("-")
        usernames.push(uername)
        userids.push(+id)
    });

    const groupnames = []
    const groupids = []


    body.group.forEach(e => {
        const [groupname, groupid] = e.split("-")
        groupnames.push(groupname)
        groupids.push(+groupid)
    });

    const clusternames = []
    const clusterid = []

    body.cluster.forEach(e => {
        const [cluster, id] = e.split("-")
        clusternames.push(cluster)
        clusterid.push(+id)
    });


    try {

        const newData = { ...body }
        delete newData.exchange
        delete newData.group
        delete newData.cluster

        let payload = {
            fromdate: date[0], todate: date[1],
            userid_id: userids,
            exchange_id: body.exchange.map(e => +e.split("-")[1]),
            group_id: groupids,
            cluster_id: clusterid,
            wise: wise,
            ...newData

        }
        if (wise != "user") {
            delete payload.userid_id

        }
        setNotifyData((data) => ({ ...data, loadingFlag: true, loadingMsg: "Fetching  Reports Data...", }));

        let groupInfo
        try {
            groupInfo = await CREATE_GROUP_API({
                "event": "getalternatename",
                data: { "group": groupids[0] }
            });
            groupInfo = groupInfo.data.result
        } catch (error) {
            groupInfo = null
        }

        const { data } = await DOWNLOAD_DETAILED_REPORT(payload)
        setNotifyData((data) => ({ ...data, loadingFlag: true, loadingMsg: "Generating Reports pdf...", }));

        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [297, 210], // A4 size in landscape
            fontSize: 8, // Set the desired font size
        });


        doc.addFileToVFS("WorkSans-normal.ttf", font);
        doc.addFont("WorkSans-normal.ttf", "WorkSans", "normal");
        doc.setFont("WorkSans");


        // doc.text(`Company Name: `.toUpperCase(), PADDING, headerStart + 20);


        DrowTable(doc, data.result, 45, groupInfo, groupnames)

        const pageCount = doc.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            //header
            doc.setFontSize(10);
            // doc.text('Spectra Global the Financial Services Commission of the Republic of Mauritius with an Investment Dealer License.', doc.internal.pageSize.width / 2, 10, { align: 'center' });
            doc.setFont("WorkSans", "bold");
            doc.text(`TRADING ACTIVITY STATEMENT`, PADDING, headerStart,);
            doc.setFont("WorkSans", "normal");
            doc.setFontSize(8);


            doc.addFileToVFS("WorkSans-normal.ttf", font);
            doc.addFont("WorkSans-normal.ttf", "WorkSans", "normal");
            doc.setFont("WorkSans");

            // doc.text(`Client Code: ${ usernames } `.toUpperCase(), PADDING, headerStart + 5);
            doc.text(`Date: ${date.join(" to ") ?? "N/A"} `.toUpperCase(), PADDING, headerStart + 4);

            doc.addImage(logo, 'PNG', 190, 12, 90, 22);

            doc.setFont("WorkSans", "bold");
            doc.setFontSize(8.5);
            doc.text(`Company Name: ${groupInfo ? groupInfo.alternate_name : groupnames || "N/A"} `.toUpperCase(), PADDING, headerStart + 14);
            doc.setFont("WorkSans", "normal");
            doc.text(groupInfo ? groupInfo.address : 'C/O IQEQ Fund services (Mauritius) Ltd. , 33 Edith Cavell street, 11324, Port Louis, Mauritius', PADDING, headerStart + 18);
            //footer
            const footerY = doc.internal.pageSize.height - 10;

            doc.text(`Page: ${i} `, doc.internal.pageSize.width - PADDING, footerY - 5, { align: 'right' });

            doc.text(`Spectra Global LTD(MU) is regulated by the Financial Services Commission of the Republic of Mauritius with an Investment Dealer License.`, doc.internal.pageSize.width / 2, footerY, { align: 'center' });
            doc.text(`Registration Number 198453 & License Number GB22201302`, doc.internal.pageSize.width / 2, footerY - 5, { align: 'center' });
            doc.text('spectragloballtd.com', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 5, { align: 'center' });
        }

        doc.save(`TradingActivityStatement_${usernames}_${date.join(" to ")}.pdf`);

        setNotifyData((data) => ({ ...data, loadingFlag: false, loadingMsg: "Generating Reports pdf...", }));

    } catch (error) {
        setNotifyData((data) => ({ ...data, loadingFlag: false, errorFlag: true, errorMsg: error.response?.data.reason || "Failed to downlaod reports", loadingMsg: "Generating Reports pdf...", }));
        console.log(error)
    }
};

