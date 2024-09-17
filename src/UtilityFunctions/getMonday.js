export const getMonday=()=>{
    const currentDate=new Date();
    const currentDayOfWeek=currentDate.getDay();
    const daysToMonday=(currentDayOfWeek===0)?6:(1-currentDayOfWeek);

    const mondayOfCurrentWeek=new Date(currentDate);
    mondayOfCurrentWeek.setDate(currentDate.getDate()+daysToMonday);

    const year=mondayOfCurrentWeek.getFullYear();
    const month=String(mondayOfCurrentWeek.getMonth()+1).padStart(2,'0');
    const day=String(mondayOfCurrentWeek.getDate()).padStart(2,'0');

    return `${year}-${month}-${day}`;
  }