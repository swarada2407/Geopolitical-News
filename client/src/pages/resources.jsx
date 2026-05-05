import { useEffect,useState } from "react"
import { Bar } from "react-chartjs-2"
import axios from "axios"

function Resources(){

const [data,setData] = useState([])

useEffect(()=>{

axios.get("https://api.worldbank.org/v2/country/all/indicator/EG.USE.PCAP.KG.OE?format=json")

.then(res=>{

const countries = res.data[1].slice(0,5)

const formatted = countries.map(c=>({

country:c.country.value,
value:c.value

}))

setData(formatted)

})

},[])

const chartData = {

labels:data.map(d=>d.country),

datasets:[
{
label:"Energy Consumption",
data:data.map(d=>d.value)
}
]

}

return(

<div>

<h1>Global Energy Consumption</h1>

<Bar data={chartData}/>

</div>

)

}

export default Resources