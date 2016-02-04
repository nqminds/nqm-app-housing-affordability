var express = require("express");
var jade = require("jade");
var bodyParser = require("body-parser");
var app = express();
var aMapStyles = require("./public/stylesheets/styledMap.json");
var aMapStylesLocal = require("./public/stylesheets/styledMapLocal.json");
var oTTWarea = require("./data/TTW.json");
var oLSOAarea = require("./data/LSOAbyTTW.json");
var oPay = require("./data/TTWpayDataAll.json");
var oSales = require("./data/TTWSalesDataAll.json");
var oLSOApay = require("./data/LSOApayDataByTTWAll.json");
var oLSOASales = require("./data/LSOASalesByTTWAll.json");
var oLookUps = require("./data/TTWlookup.json");
var oAverages = require("./data/averages.json");
var homeYear = "2014";
var year;
var thisTTW = 'undefined';
var mapFlag = 0;
var val = 21851;
var oLSOAName = require("./data/LSOAname.json");
var oTTWName = require("./data/TTWname.json");
var oDeficiencyData = {};

app.set("views", __dirname + "/views");
app.set("view engine","jade");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({limit: (5*1024*1000) }));

year = homeYear;

function calculateDeficiency(oSales, payGiven){
    var oDeficiencyData = {};
    var id;
    var payGiven;
    if(typeof(payGiven) == 'string'){payGiven = Number(payGiven);}
    if(typeof(payGiven) == 'number'){
    for(id in oSales){
        var deficiencyfactor = 0;
        if(!(oDeficiencyData.hasOwnProperty(year))){oDeficiencyData[year] = {}}
        if(!(oDeficiencyData[year].hasOwnProperty(id))){oDeficiencyData[year][id] = {}}
        var one;
        var count = 0;
        for(one in oSales[id]){
            if(Number(payGiven)*3.4 >= oSales[id][one]){
                count += 1
            }           
        }
        deficiencyfactor = 100*count/(oSales[id].length)
        oDeficiencyData[year][id] = deficiencyfactor;
        }
    }
    else if(typeof(payGiven) == 'object') {
    for(id in oSales){
        var deficiencyfactor = 0;
        if(!(oDeficiencyData.hasOwnProperty(year))){oDeficiencyData[year] = {}}
        if(!(oDeficiencyData[year].hasOwnProperty(id))){oDeficiencyData[year][id] = {}}
        var one;
        var count = 0;
        for(one in oSales[id]){
            if(payGiven[id]['percentile50']*3.4 >= oSales[id][one]){
                count += 1
            }           
        }
        deficiencyfactor = 100*count/(oSales[id].length)
        oDeficiencyData[year][id] = deficiencyfactor;
        }
    }
return oDeficiencyData
}
        
app.get('/references', function(req, res){
    res.render('references');
})

app.get('/deficiency_data/:year/:val' , function(req, res){
    year = req.params["year"];
    val = req.query.search;
    val = val.replace(/,/g, "");
    val = val.replace(/ /g,"");
    app.get( '/reset', function(data) {
    mapFlag = data;
    });
    if(mapFlag == 1){
    var oDeficiencyData = calculateDeficiency(oLSOASales[year][thisTTW], val);
    res.json(oDeficiencyData);
    }
    else{
    var oDeficiencyData = calculateDeficiency(oSales[year], val);
    res.json(oDeficiencyData);
}});

app.get('/deficiency_data/:year/' , function(req, res){
    year = req.params["year"];
    app.get( '/reset', function(flagData) {
    mapFlag = flagData;
    });
    if(mapFlag == 1){
    var oDeficiencyData = calculateDeficiency(oLSOASales[year][thisTTW], val);
    res.json(oDeficiencyData[year]);
    }
    else{
    var oDeficiencyData = calculateDeficiency(oSales[year], val);
    res.json(oDeficiencyData[year]);
}});

app.get("/LSOA_Sales_map/:idTTW/", function(req, res){
    mapFlag = 1;
    var idTTW = req.params["idTTW"];
    thisTTW = idTTW;
    var oDeficiencyData = calculateDeficiency(oLSOASales[year][thisTTW], val);
    res.json(oDeficiencyData[year]);
});


app.get("/sales_data/:year/:idTTW/:id", function(req, res){
    var id = req.params["id"];
    var idTTW = req.params["idTTW"];
    var year = req.params["year"];
    res.json(oLSOASales[year][idTTW][id])
});

app.get("/pay_data/:year/:idTTW/:id", function(req, res){
    var id = req.params["id"];
    var idTTW = req.params["idTTW"];
    var year = req.params["year"];
    res.json(oLSOApay[year][idTTW][id])
});

app.get("/TTW_pay/:year/", function(req,res){
    var idTTW = req.params["idTTW"];
    var year = req.params["year"];
    app.get( '/reset', function(flagData) {
    mapFlag = flagData;
    });
    if(mapFlag == 1){
    var oDeficiencyData = calculateDeficiency(oLSOASales[year][thisTTW], oLSOApay[year][thisTTW]);
    res.json(oDeficiencyData[year]);
    }
    else{
    var oDeficiencyData = calculateDeficiency(oSales[year], oPay[year]);
    res.json(oDeficiencyData[year]);
    }
});

app.get('/SCATTER_PLOT/' , function(req, res){
    app.get( '/reset', function(data) {
    mapFlag = data;
    });
    var scatterData = {};
    var id;
    if(mapFlag == 1){
        var val;
    for(id in oLSOASales[year][thisTTW]){
            if(!(scatterData.hasOwnProperty(year))){scatterData[year] = {}}
            if(!(scatterData[year].hasOwnProperty(id))){scatterData[year][oLSOAName[id]] = {}}
            val = oLSOASales[year][thisTTW][id][Math.floor(oLSOASales[year][thisTTW][id].length/2)]
            scatterData[year][oLSOAName[id]] = [val, oPay[year][oLookUps[thisTTW]]['median']]
            }
    }
    else{
        var val;
        for(id in oSales[year]){
            if(oPay[year][id]['median'] != 'x'){
            if(!(scatterData.hasOwnProperty(year))){scatterData[year] = {}}
            if(!(scatterData[year].hasOwnProperty(id))){scatterData[year][oTTWName[id]] = {}}
            val = oSales[year][id][Math.floor(oSales[year][id].length/2)]
            scatterData[year][oTTWName[id]] = [val, oPay[year][id]['median']]
        }}
    }
    res.json(scatterData[year]);
});

app.get('/map_reset/' , function(req, res){
    year = 2014;
    val = 21851;
    mapFlag = 0;
    oDeficiencyData = calculateDeficiency(oSales[year], val);
    res.json(oDeficiencyData[year]);
});

var oDeficiencyData = calculateDeficiency(oSales[year], val);

app.get('/', function(req, res){
    console.log(year)
    res.render('index', {
                        title: "Housing"
                        , year: homeYear
                        , mapStyle: aMapStyles
                        , mapStyleLocal: aMapStylesLocal
                        , TTWarea : oTTWarea
                        , LSOAarea: oLSOAarea
                        , deficiencyData : oDeficiencyData[homeYear]
                        , Pay : oPay[homeYear] 
                        , Sales : oSales[homeYear]
                        , LSOAPay: oLSOApay[homeYear]
                        , LSOASales: oLSOASales[homeYear]
                        , LookUps: oLookUps
                        , LSOAName: oLSOAName
                        , TTWName: oTTWName
                        , averages: oAverages
                        }
    )
});

app.listen(3001);