const express = require("express");
const morgan  = require("morgan");
const axios   = require("axios");
const CircularJSON = require("circular-json");

const app = express()

app.use(morgan("dev"));

axios.interceptors.request.use((config)=>{
    config.headers["user-key"]="f30ebe79883d37d1124fef0147201917";
    return config;
})


app.get("/categories",(req,res)=>{
    axios.get("https://developers.zomato.com/api/v2.1/categories")
    .then(result=>{
        let result1 = JSON.parse(CircularJSON.stringify(result))
        res.status(202).send(result1["data"]["categories"])
    })
})

app.get("/geocode",(req,res)=>{
    axios.get("https://developers.zomato.com/api/v2.1/geocode?lat="+req.query.lat+"&lon="+req.query.lon)
    .then(result=>{
        let result1 = JSON.parse(CircularJSON.stringify(result));
        res.status(202).send(result1["data"])
    })
})

app.get("/search/city",async (req,res)=>{
    console.log(req.query.query)
    await axios.get("https://developers.zomato.com/api/v2.1/locations?query="+req.query.query)
    .then(async result=>{
        let result1 = JSON.parse(CircularJSON.stringify(result));
        await axios.get("https://developers.zomato.com/api/v2.1/location_details?entity_id="+result1.data.location_suggestions[0].entity_id+"&entity_type="+result1.data.location_suggestions[0].entity_type)
        .then(data=>{
            let data1 = JSON.parse(CircularJSON.stringify(data))
            let all_restaurant=(data1["data"].best_rated_restaurant);
                var details = [];
            for(var i of all_restaurant){
                var small_det = {};
                small_det.name = i.restaurant.name
                small_det.address = i.restaurant.location.address;
                small_det.cuisines = i.restaurant.cuisines;
                small_det.timings = i.restaurant.timings;
                small_det.cost_for_two = i.restaurant.average_cost_for_two;
                if(i.restaurant.has_online_delivery==1){
                    small_det.online_delivery="Yes"
                }else{
                    small_det.online_delivery = "No"
                }
                details.push(small_det)
            }
            res.send(details)    
            // res.send(all_restaurant)
        })
    })
})


const port =process.env.PORT || 5999;
app.listen(port);
console.log("server listening at "+port)