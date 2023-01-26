const express = require('express');
const https = require('https');
const path = require('path');
const fs = require('fs');
const app = express();
const tempReport = fs.readFileSync("result.ejs", "utf-8");

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
// load static assets
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname,'public/assets')));
//home route
app.get('/', (req, res) => {
    res.render('base', {title: "Weather App"});
});

// replace function
const replaceVal = (tempVal, orgVal) => {
    let temperature = tempVal.replace("{%cityName%}", orgVal.name);
    temperature = temperature.replace("{%tempVal%}", orgVal.main.temp);
    temperature = temperature.replace("{%windSpeed%}", orgVal.wind.speed);
    temperature = temperature.replace("{%humidity%}", orgVal.main.humidity);
    temperature = temperature.replace("{%countryName%}", orgVal.sys.country);
    temperature = temperature.replace("{%desc%}", orgVal.weather[0].description);
    const icon = orgVal.weather[0].icon;
    const imageUrl = "http://openweathermap.org/img/wn/"+ icon +"@2x.png"; 
    temperature = temperature.replace("{%imgUrl%}", imageUrl);
    return temperature;
}

// post funtion
app.post("/",(req, res)=>{
    const query = req.body.cityName;
    const apiKey = "20539eae26d6403da9bd76f8903897a4";
    const unit = "metric";
    const url = "https://api.openweathermap.org/data/2.5/weather?q="+query+"&appid="+apiKey+"&units="+unit;

    https.get(url , (response) => {
        console.log(response.statusCode);
        response.on("data", (data) => {
            const objData = JSON.parse(data);
            const arrData = [objData];
            const realTimeData = arrData.map((val) => replaceVal(tempReport,val)).join("");
            res.write(realTimeData);
        })
    })
})

app.listen(3000, () => {
    console.log("Server is running on localhost:3000")
})