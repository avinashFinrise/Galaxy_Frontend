import React from 'react';
import { LiaSave } from "react-icons/lia";
import style from './DataSummary.module.scss';

function SaveBtn({ grid, onSave }) {
    return (
        <button onClick={() => onSave(grid.node.field, grid.node.key)} className={style.saveBtn}><LiaSave /></button>
    )
}

export default SaveBtn