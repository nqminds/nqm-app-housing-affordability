function firstLoad(){
    $(window).load(function(){
        $("#welcomeTitle").html("Welcome to the Interactive Housing Affordability Map")
        $(".welcomeInfo").modal("show");
    });
};

firstLoad();

function findYearIndex(){
    var i = 0;
    while($("#yearList").val() != aYears[i]){
        i++;
    }
    return i
}

$(function () { //change year from list
    $("#yearList").change(function () {
        year = $("#yearList").val();
        polygonColors(year);
    });
});

function polygonColors(year){
    $('.loading').show();
    // if(oDeficiencyData.hasOwnProperty(year)) {
        // addPolygonColors(oDeficiencyData[year])
        // $('.loading').hide();
    // } 
    // else {
        $.ajax("/deficiency_data/" + year + "/").done(function (oDeficiencyDataNewYear) {
            oDeficiencyData[year] = {};
            oDeficiencyData[year] = oDeficiencyDataNewYear;
            addPolygonColors(oDeficiencyData[year])
            $('.loading').hide();
        });
    // };
    console.log(oDeficiencyData)
}

function addPolygonColors(oDeficiencyData){
    map.data.setStyle(function(feature) {
        var id = feature.getProperty('TTWA07CD');
        if(typeof id === 'undefined'){
            var id = feature.getProperty('LSOA11CD');
        }; 
        if(typeof id != "string"){
            var id = feature.getProperty('TTWA07CD');
        };
        if(typeof id === 'undefined'){
            var id = feature.getProperty('LSOA11CD');
        };         
        if (!oDeficiencyData.hasOwnProperty(id)) {
            return {
                fillColor: selectKeyColor("NA"),
                fillOpacity: 0.7,
                strokeWeight: 0.5,
                strokeOpacity: 0.7,
                strokeColor: "black"
            }
        } else {
            var n = oDeficiencyData[id];
            var color = selectKeyColor(n);
            return {
                fillColor: color,
                fillOpacity: 0.7,
                strokeWeight: 0.5,
                strokeOpacity: 0.7,
                strokeColor: "black"
            }
        }
    })
}

$(function() { //use pay Given
    $("#pay").keydown(function (event) {
        if (event.keyCode == 13) {
            var parameters = { search: $(this).val() };
           $.get("/deficiency_data/" + year + "/"+ $(this).val(), parameters, function(oDeficiencyDataYearVal) {
           addPolygonColors(oDeficiencyDataYearVal[year])}
        )}
    })
})

function drawSalesChart(salesDistribution, err){
    if (err) throw err;
    var margin = {top: 50, right: 150, bottom: 50, left: 75},
        width = 1200 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;
        
    // A formatter for counts.
    var formatCount = d3.format("d");
    
    var minY = d3.min(salesDistribution);
    var maxY = d3.max(salesDistribution);  

    var x = d3.scale.linear()
        .domain([0, maxY])
        .range([0, width]);
        
    var data = d3.layout.histogram()
        .bins(10)
        (salesDistribution);
        
    var y = d3.scale.linear()
              .domain([0, d3.max(data, function(d) { return d.y; })])
              .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(d3.format("s"))
        .orient("bottom");
        
    var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d; });
    
    d3.select("#featureInfoContainer").remove()
        
    var svg = d3.select("#featureInfoCanvas")
        .append("div")
        .classed("svg-container", true)
        .attr("id", "featureInfoContainer")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")   
        .classed("svg-content-responsive", true)
        .attr("viewBox", "0 0 1200 1600")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    svg.call(tip)
          
    var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; })
        // something here
        .on('mouseover', function(d) {tip.show("£ " + d, featureInfoContainer)})
	    .on('mouseout', function(d) {tip.hide("£ " + d, featureInfoContainer)});

    bar.append("rect")
        .attr("x", 3)
        .attr("width", x(data[0].dx) - 1)
        .attr("height", function(d) { return height - y(d.y); });

    bar.append("text")
        .attr("dy", "-.95em")
        .attr("y", 6)
        .attr("x", x(data[0].dx) / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("fill", "black")
        .text(function(d) { return formatCount(d.y); });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
        
    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + 60)
    .style("font-size", "30px")
    .text("House Price");
    
    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("x", -5)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .style("font-size", "30px")
    .text("Frequency");
}    


function drawScatterPlot(data, err) {
    if (err) throw err;
    
    var margin = {top: 80, right: 80, bottom: 0, left: 80},
        width = 1200 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;
  
    var x = d3.scale.linear()
              .domain([0, (5000 + d3.max(d3.entries(data), function(d) { return d.value[1] }))])
              .range([ 0, width ]);              
    
    var y = d3.scale.linear()
    	      .domain([0, (5000 + d3.max(d3.entries(data), function(d) { return d.value[0] }))])
    	      .range([ height, 0 ]);
    
    var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.key; });
    
    d3.select("#featureInfoContainer").remove()
    
    var svg = d3.select('#featureInfoCanvas')
                  .append("div")
                  .classed("svg-container", true)
                  .attr("id", "featureInfoContainer")
                  .append("svg")
                  .attr("preserveAspectRatio", "xMinYMin meet")   
                  .classed("svg-content-responsive", true)
                  .attr("viewBox", "0 0 1200 1600")
                  .append("g");
                  // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");                             

    svg.call(tip)
    
    var scatter = svg.append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                    .attr('width', width)
                    .attr('height', height)
                    .attr('class', 'scatter')   
                            
    // draw the x axis
    var xAxis = d3.svg.axis()
                  .scale(x)
                  .orient('bottom');

    scatter.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'scatter axis date')
        .call(xAxis);

    // draw the y axis
    var yAxis = d3.svg.axis()
                  .scale(y)
                  .orient('left');

    scatter.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'scatter axis')
        .call(yAxis);

    var g = scatter.append("svg:g"); 
    
    g.selectAll("scatter-dots")
          .data(d3.entries(data))
          .enter().append("svg:circle")
          .attr("cx", function (d) { return x(d.value[1]); } )
          .attr("cy", function (d) { return y(d.value[0]); } )
          .attr("r", 10)
          .attr("fill", "steelblue")
          .on('mouseover', function(d) {tip.show(d, featureInfoContainer)})
          .on('mouseout', function(d) {tip.hide(d, featureInfoContainer)});
          
    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width + 6)
    .attr("y", height + 60)
    .style("font-size", "40px")
    .text("Median Income for Area");
    
    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 100)
    .attr("x", -70)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .style("font-size", "40px")
    .text("Median Price of Housing");
    
    function getX(data){
        var arrX = [];
        for (var key in data) {
            if (data.hasOwnProperty(key) && key != "Whitehaven") {
            // if (data.hasOwnProperty(key)) {
                arrX.push(data[key][1]);
                }
        }
        return arrX;
    }
    
    function getY(data){
        var arrY = [];
        for (var key in data) {
            if (data.hasOwnProperty(key) && key != "Whitehaven") {
            // if (data.hasOwnProperty(key)) {
                arrY.push(data[key][0]);
                }
        }
        return arrY;
    }

    var xVal = getX(data);
    var yVal = getY(data);

    function linearRegress(xVal,yVal){
        var lr = {};
        var n = yVal.length;
        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_xx = 0;
        var sum_yy = 0;
        
        for (var i = 0; i < yVal.length; i++) {
            
            sum_x += xVal[i];
            sum_y += yVal[i];
            sum_xy += (xVal[i]*yVal[i]);
            sum_xx += (xVal[i]*xVal[i]);
            sum_yy += (yVal[i]*yVal[i]);
        } 
        
        lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
        lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
        lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
        
        return lr;
    }

    if(Object.keys(data).length > 160 && Object.keys(data).length < 170){
        // apply the reults of the least squares regression
        var linearRegression = linearRegress(xVal,yVal);
        var x1 = xVal.sort()[0];
        var y1 = linearRegression['slope'] * x1 + linearRegression['intercept'];
        var x2 = xVal.sort()[xVal.length - 1];
        var y2 = linearRegression['slope'] * x2 + linearRegression['intercept'];
        var trendData = [[x1,y1,x2,y2]];
    
    function pValue(xVal,yVal, linearRegression){
        var sum_xMINUSmeanx = 0;
        var sum_yMINUSesty = 0;
        var SE = 0;
        var n = xVal.length;
        for (var i = 0; i < yVal.length; i++) {            
            sum_xMINUSmeanx += xVal[i] - d3.mean(xVal);
            sum_yMINUSesty += yVal[i] - linearRegression['slope'] * xVal[i] + linearRegression['intercept'];
        } 
        SE = (Math.sqrt((Math.pow(sum_yMINUSesty, 2))/(n-2)))/(Math.sqrt(Math.pow(sum_xMINUSmeanx,2)))
        return SE;
    }
    
    console.log(linearRegression['slope']/(pValue(xVal,yVal, linearRegression)))
    console.log(linearRegression)

    var line = g.append('line')
        .attr("class", "line")
        .attr("x1", function(d) { return x(x1); })
        .attr("y1", function(d) { return y(y1); })
        .attr("x2", function(d) { return x(x2); })
        .attr("y2", function(d) { return y(y2); })
        .style("stroke", "black")
        .style("stroke-dasharray", "5,5");
    
    
        // g.append("text")
			// .text("eq: " + d3.round(linearRegression['slope'], 1) + "x house Price " + 
				// d3.round(linearRegression['intercept'], 1))
			// .attr("class", "text-label")
            // .style("font-size", "40px")
			// .attr("x", function(d) {return x(x2) + 60;})
			// .attr("y", function(d) {return y(y2) + 30;});
		
		// // display r-square on the chart
		// g.append("text")
			// .text("R-square: " + d3.round((linearRegression['r2']),1))
			// .attr("class", "text-label")
            // .style("font-size", "40px")
			// .attr("x", function(d) {return x(x2) + 60;})
			// .attr("y", function(d) {return y(y2) - 10;});
    }
    return linearRegression
}

function loadFeatureInfoBox(oSalesId) {
    drawSalesChart(oSalesId);
    $(".featureInfo").modal("show");
}

function loadScatterPlot(oScatterData) {
    drawScatterPlot(oScatterData);
    $(".featureInfo").modal("show");
}

function loadMapColours(idTTW){
    loadGeoData(topojson.feature(oLSOAarea[idTTW], oLSOAarea[idTTW]['objects'][idTTW]));
    addPolygonColors(oDeficiencyData[year]);
    }

function featureClick(event, lat, lng){
    if (event.feature.getProperty('TTWA07CD') != undefined) {
        map.setZoom(11);
        map.setCenter(new google.maps.LatLng(lat, lng));
        var id = event.feature.getProperty('TTWA07CD');
        var name = event.feature.getProperty('TTWA07NM');
        var idTTW = oLookUps[event.feature.getProperty('TTWA07CD')];
        thisTTW = idTTW;
        map.data.forEach(function (feature) {
            map.data.remove(feature);
        });
        $.ajax("/LSOA_Sales_map/" + idTTW ).done(function (oDeficiencyDataYear) {
            oDeficiencyData[year] = oDeficiencyDataYear;
            addPolygonColors(oDeficiencyData[year]);
        });
        loadMapColours(idTTW);
    } else { 
        var id = event.feature.getProperty('LSOA11CD');
        var name = event.feature.getProperty('LSOA11NM');
        $("#featureTitle").html(" Housing Sales Price Distribution " + name)
        $(".modal-header").attr("id", id)
        $("#featureIdTitle").html(" This histogram shows the house sales in " + name + " in "+year+". The average for the larger area of " + oTTWName[oLookUps[thisTTW]] + " was £" + d3.format(",")(oAverages['sales'][year][oLookUps[thisTTW]]) + " and the National average house price was " + d3.format(",")(oAverages['sales'][year]['nationalAverage']))
        idTTW = thisTTW;
        $.ajax("/sales_data/" + year + "/" + idTTW + "/" + id ).done(function (oSalesYearTTWID) {
        loadFeatureInfoBox(oSalesYearTTWID);
        })
    }
}

$(function() { // BACK BUTTON
    $("#goBACK").click(function(){
        $.ajax("/reset" ).done(function () {
            var mapFlag = 0;
        });
        map.data.forEach(function (feature) {
            map.data.remove(feature);
        });
        map.setZoom(7);
        map.setCenter(new google.maps.LatLng(52.477568, -1.685511));
        oDeficiencyData = {};
        loadGeoData(topojson.feature(oTTWarea, oTTWarea.objects.TTW));
        $.ajax("/map_reset/" ).done(function (data) {
            oDeficiencyData[year] = data
            addPolygonColors(oDeficiencyData[year]);
        });
    })
})

$(function() { // TTW BUTTON
    $("#useTTWPay").click(function(){
        $.ajax("/TTW_pay/" + year ).done(function (oDeficiencyDataYear) {
            oDeficiencyData[year] = oDeficiencyDataYear;
            addPolygonColors(oDeficiencyData[year]);
        });
    })
})

$(function() { // SCATTER PLOT BUTTON
    $("#SCATTERPLOT").click(function(){
        $.ajax("/SCATTER_PLOT/").done(function (oScatterData) {
            console.log(Object.keys(oScatterData).length)
            if(Object.keys(oScatterData).length > 160 && Object.keys(oScatterData).length < 170){
            var linearRegression = drawScatterPlot(oScatterData);
            $("#featureTitle").html(" Scatter Plot of Median House prices and Median earnings per Area")
            $("#featureIdTitle").html(" This plot shows median house prices compared to median income for each of the TTW (travel to work areas). A line of best fit is added to the plot which is estimated using linear regression (discussed later). Moreover this line helps to see the trend between income and prices. Linear regression is a method to see how well we can use the variable median income to predict house prices. It turns out that median income is a significant factor for predicting median sales and can explains 20% of the variation in house prices. For those who are statistic geeks: the equation for the line is calculated as: median house price = " + d3.round(linearRegression['slope'], 1) + "x median income " + d3.round(linearRegression['intercept'], 1) + ". Furthermore the R-Squared value is " + d3.round((linearRegression['r2']),1) + " meaning that median income explains " + d3.round((linearRegression['r2']),1)*10 + "% of the variation in house prices. It is worth noting that this is a very crude model and there are a multitude of factors that should be taken into account to calculate house pricing more accurately.")
            loadScatterPlot(oScatterData);
            };
            if(typeof thisTTW !== 'undefined'){
            if(Object.keys(oScatterData).length < 160 || Object.keys(oScatterData).length > 170){
            var houseDif = ((oAverages['sales'][year][oLookUps[thisTTW]] - oAverages['sales'][year]['nationalAverage'])/oAverages['sales'][year]['nationalAverage']*100).toFixed()
            var payDif = ((oAverages['pay'][year][oLookUps[thisTTW]] - oAverages['pay'][year]['nationalAverage'])/oAverages['pay'][year]['nationalAverage']*100).toFixed()
            $("#featureTitle").html(" Scatter Plot of Median House prices in " + oTTWName[oLookUps[thisTTW]])
            if(houseDif > 0 && payDif >0){
            $("#featureIdTitle").html(" This plot shows the areas in " + oTTWName[oLookUps[thisTTW]] + " ordered by the median house price. In " + year + " the average house price in this area was £" + d3.format(",")(oAverages['sales'][year][oLookUps[thisTTW]]) + " which is " + houseDif + "% greater than the National Average (£" + d3.format(",")(oAverages['sales'][year]['nationalAverage']) + "). Equally, people who work in this area earned £" + d3.format(",")(oAverages['pay'][year][oLookUps[thisTTW]]) + " per year, which is " + payDif + "% greater than the National Average (£" + d3.format(",")(oAverages['pay'][year]['nationalAverage']) + ").")
            };
            if(houseDif > 0 && payDif < 0){
            $("#featureIdTitle").html(" This plot shows the areas in " + oTTWName[oLookUps[thisTTW]] + " ordered by the median house price. In " + year + " the average house price in this area was £" + d3.format(",")(oAverages['sales'][year][oLookUps[thisTTW]]) + " which is " + houseDif + "% greater than the National Average (£" + d3.format(",")(oAverages['sales'][year]['nationalAverage']) + "). However, people who work in this area earned £" + d3.format(",")(oAverages['pay'][year][oLookUps[thisTTW]]) + " per year, which is " + payDif + "% less than the National Average (£" + d3.format(",")(oAverages['pay'][year]['nationalAverage']) + ").")
            };
            if(houseDif < 0 && payDif > 0){
            $("#featureIdTitle").html(" This plot shows the areas in " + oTTWName[oLookUps[thisTTW]] + " ordered by the median house price. In " + year + " the average house price in this area was £" + d3.format(",")(oAverages['sales'][year][oLookUps[thisTTW]]) + " which is " + houseDif + "% less than the National Average (£" + d3.format(",")(oAverages['sales'][year]['nationalAverage']) + "). However, people who work in this area earned £" + d3.format(",")(oAverages['pay'][year][oLookUps[thisTTW]]) + " per year, which is " + payDif + "% greater than the National Average (£" + d3.format(",")(oAverages['pay'][year]['nationalAverage']) + ").")
            };
            if(houseDif < 0 && payDif < 0){
            $("#featureIdTitle").html(" This plot shows the areas in " + oTTWName[oLookUps[thisTTW]] + " ordered by the median house price. In " + year + " the average house price in this area was £" + d3.format(",")(oAverages['sales'][year][oLookUps[thisTTW]]) + " which is " + houseDif + "% less than the National Average (£" + d3.format(",")(oAverages['sales'][year]['nationalAverage']) + "). Equally, people who work in this area earned £" + d3.format(",")(oAverages['pay'][year][oLookUps[thisTTW]]) + " per year, which is " + payDif + "% less than the National Average (£" + d3.format(",")(oAverages['pay'][year]['nationalAverage']) + ").")
            };
            loadScatterPlot(oScatterData);
            };
        }
        });
    })
})