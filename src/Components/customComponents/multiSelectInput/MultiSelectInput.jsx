
import { useState } from "react"
import style from "./multiSelect.module.scss"
import { RxCross1 } from "react-icons/rx"
import { v4 as uuid } from "uuid"
const Id = uuid()


const MAX_DATA_TO_DISPLAY = 100

const MultiSelectInput = ({ maxOptionHeight = 200, options = [], value = [], label, onChange, selectAllOption = true, maxHeight = 100 }) => {
    // const [formSelectedOptions, setFormatedSelectedOptions] = useState([])
    const [defaultOptions, setDefaultOptions] = useState(options)
    const [finalOptions, setFinalOptions] = useState(options)

    // useEffect(() => {
    //     setFormatedSelectedOptions(value.map(e => ({  })))
    // },[value])


    const handleRemove = (elem, index) => {
        onChange(value.filter(e => e.label !== elem.label))
        setFinalOptions(p => [...p, elem])
    }

    const handleSearch = (event) => {
        console.log(event.target.value, defaultOptions)

        if (!event.target.value) return setFinalOptions(defaultOptions)
        setFinalOptions(defaultOptions.filter(e => {
            return e.label.toLowerCase().includes(event.target.value.toLowerCase())
        }))
    }

    const handleSelectAll = () => {
        onChange([...value, ...finalOptions])
        setFinalOptions([])
    }

    const handleAdd = (e, index) => {
        onChange([...value, e])
        setFinalOptions(p => p.filter(ev => ev.label.toLowerCase() !== e.label.toLowerCase()))
        setDefaultOptions(p => p.filter(ev => ev.label.toLowerCase() !== e.label.toLowerCase()))
    }

    const [isOpen, setIsOpen] = useState()


    const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    console.log({ finalOptions })

    return (
        <div style={{ position: "relative", maxHeight }} onFocus={() => setIsOpen(true)} onBlur={() => setIsOpen(false)}>
            <div className={style.inputWrapper}  >
                <div className="primaryInput" >
                    {value.slice(0, MAX_DATA_TO_DISPLAY).map((elem, i) => <div className={style.singleElement} key={elem.value} >{elem.label} <RxCross1 onClick={() => handleRemove(elem, i)} /></div>)}
                    {value.length >= MAX_DATA_TO_DISPLAY && <p>...{value.length - MAX_DATA_TO_DISPLAY} more</p>}
                    <input onChange={handleSearch} placeholder={label && label} />
                </div>
            </div>
            {isOpen && <div style={{ maxHeight: maxOptionHeight }} className={style.options} onMouseDown={handleMouseDown} >
                {selectAllOption && finalOptions.length > 1 && <p tabIndex={0} onClick={handleSelectAll} >Select All</p>}
                {finalOptions.map((e, index) => <p tabIndex={0} className={e.isSelected && style.active} onMouseDown={() => handleAdd(e, index)} >{e.label}</p>)}
            </div>}
        </div>
    )
}

export default MultiSelectInput