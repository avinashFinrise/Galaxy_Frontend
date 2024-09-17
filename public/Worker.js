let flag=false
let obj={}
let netposition={}
onmessage=(e)=>{
    if(e.data=='stop'){
        flag=false
    }else{
        flag=true
        netposition[e.data.positionno]=e.data
        Object.values(netposition).forEach(val=>{
        obj[val.groupname]=obj[val.groupname] ? obj[val.groupname]+val.netmtm : 0+val.netmtm
        })
    }

// obj[sampleData.data.groupname]=obj[sampleData.data.groupname] ? obj[sampleData.data.groupname]+sampleData.data.netmtm : 0+sampleData.data.netmtm

}

const convertedFormat=(myObj)=>{
    let temp=[];
    for(let key in myObj){
        temp.push({groupname:key,netmtm:obj[key]})
    }
    return temp
}

setInterval(()=>{
    if(flag){
        postMessage({result:obj})
    }
},1000)



