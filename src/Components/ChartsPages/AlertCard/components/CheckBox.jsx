import { Checkbox } from '@mui/material'
import { useEffect, useState } from 'react'


// function checkChildrens(grid, componenttype) {
//     const allChildNodesChecked = grid.node.childrenAfterAggFilter.every(child => {
//         if (child.node?.group === true) {
//             checkChildrens(child, componenttype)
//         }
//         return child.data?.[componenttype]?.[grid.column.colId]
//     })

//     return allChildNodesChecked;
// }

function CheckBox({ componenttype, grid, update }) {
    const [isChecked, setIsChecked] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const isGroupedRow = grid.node.group === true;
        setIsOpen(grid.node.expanded)
        // if (isGroupedRow) {
        //     const allChildNodesChecked = checkChildrens(grid, componenttype)
        //     setIsChecked(allChildNodesChecked);
        // } else {
        //     setIsChecked(grid.data?.[componenttype]?.[grid.column.colId] || false)
        // }

        if (isGroupedRow) {
            const allChildNodesChecked = grid.node.childrenAfterAggFilter.every(child => {
                if (child.group === true) {
                    return child.childrenAfterAggFilter.every(childd => {
                        return childd.data?.[componenttype]?.[grid.column.colId]
                    })
                }
                return child.data?.[componenttype]?.[grid.column.colId] || false
            })
            setIsChecked(allChildNodesChecked);
        } else {
            setIsChecked(grid.data?.[componenttype]?.[grid.column.colId] || false)
        }
    }, [grid])

    const onChane = (e) => {
        const isGroupedRow = grid.node.group === true;
        let rowid = null
        if (isGroupedRow) {
            const allChildNodesChecked = grid.node.childrenAfterAggFilter.every(child => {
                if (child && child.data) {
                    // child.setDataValue('checked', true);
                    return true;
                }
                return false;
            });

            if (allChildNodesChecked) {
                grid.api.refreshCells({ force: true });
            }
            rowid = grid.node.key
        } else {
            rowid = grid.node.id

        }

        setIsChecked(e.target.checked)
        update({ isGroupedRow, componenttype, key: grid.node.field, id: rowid, data: { [grid.column.colId]: e.target.checked } })
        grid.api.refreshCells();
    }

    return !isOpen && (
        <Checkbox checked={isChecked} style={{ padding: "2px" }} size='small' onChange={onChane} />
    )
}

export default CheckBox