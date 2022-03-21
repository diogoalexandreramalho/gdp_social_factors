var center, countries, height, path, projection, scale, width;
const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)

width = 650;
height = 600;
center = [5, 70];
scale = 350;
var padding = 50;

currentYear=2008
var dataset, full_dataset;
var firstLineDataset;

var flagDrawPP = false;
var flagFirstTime = true;
var isEducationFlag = false;

var svg_line_chart, svg_parallel, svg_map, svg_criminality, svg_unemployment;

var dispatch;


var colors = ["Gold","Yellowgreen","Orange","orchid"];
var selected = [];
var dimensions = ["GDP" , "EM_P" , "UNE_TOTAL" , "CRI_TOT"] 
var x,y;
var countriesSelectedYear = []
var countriesSelectedYearTotal = []
document.getElementById("buttonAge").style.backgroundColor="#9fe8ff"


var bgdp, bem, bcri, bune;

var parallel_padding = 53;

    
var tooltipDiv = d3.select("#map").append("div")
    .attr("class", "tooltip")     
    .style("opacity", 0);
var tooltipDiv2 = d3.select("#line_chart").append("div")    
  .attr("class", "tooltip")               
  .style("opacity", 0);
var tooltipDiv3 = d3.select("#map").append("div")    
  .attr("class", "tooltipGDP")               
  .style("opacity", 0);
var tooltipDiv4 = d3.select("#map").append("div")    
  .attr("class", "tooltipGDP")               
  .style("opacity", 0);

/* /////////////////////////
#
#   GENERATE CHART FUNCTIONS
#
//////////////////////////*/



function gen_line_chart() {
  
  var datasetFiltered = dataset.filter(function (d) {
    if (selected.includes(d.Country) || d.Country === "EU28"){
      d.Year = parseInt(d.Year);
      d.GDP = parseInt(d.GDP);
      return d;
    }
  });

  var newselected = selected.concat(["EU28"]);
  var newDataset = newselected.map(function (sel) { 
    return dataset.filter(function (d) {
      if (d.Country === sel){
        d.Year = parseInt(d.Year);
        d.GDP = parseInt(d.GDP);
        return d;
      }
    })
  });
  

  let line_width = parseInt(d3.select("#line_chart").style("width"));
  let line_height = parseInt(d3.select("#line_chart").style("height"));
  let line_padding = 50;

  if(flagFirstTime){
    flagFirstTime = false;
    firstLineDataset = datasetFiltered;
  }

  var xscaleData = firstLineDataset.map(function (a) { return a.Year});
  
  var xscale = d3
    .scalePoint()
    .domain(xscaleData)
    .range([line_padding, line_width - line_padding]);


  var hscale = d3
    .scaleLinear()
    .domain([ 0, d3.max(datasetFiltered, function (d) { return parseInt(d.GDP); })*1.2,])
    .range([line_height - line_padding, line_padding]);

  svg_line_chart = d3
    .select("#line_chart")
    .append("svg") // we are appending an svg to the div 'line_chart_2'
      .attr("transform", "translate(" + 5 + "," + -15 +")")
      .attr("width", line_width)
      .attr("height", line_height);

    
      
  
  
  var lines = svg_line_chart
                .append("g")
                  .attr("class", "lines")
    
  for (line_idx in newDataset) {
    let line = newDataset[line_idx];
    lines
      .append("g")
        .attr("class","line")
        .selectAll("teste")
        .data([line]).enter()
        .append("path")
          .attr("fill", "none")
          .attr("stroke", function(d){ 
            if(d[0].Country === "EU28"){ return "blue"}
            else{return colors[selected.indexOf(d[0].Country)]; }})
          .attr("stroke-width", 4.5)
          .attr("stroke-dasharray", function(d){
            if(d[0].Country === "EU28") {
              return "10"
            } else {
              return "none";
            }
          })
          .attr("d", d3.line()
            .x(function(d) { return xscale(d.Year) })
            .y(function(d) { return hscale(d.GDP) })
          )
          .attr('id', function(d) {
            return d[0].Country
          })
          .on("mouseover", function(d) {   
            if(this.id.toString().length !== 3){
              let xy = d3.pointer(event,lines.node())
            tooltipDiv2.transition()     
                .duration(200)      
                .style("opacity", 1);      
            tooltipDiv2.html(this.id)  
                .style("left", xy[0]  + "px")     
                .style("top", xy[1] - 20 + "px"); 
            }
               
            })                  
        .on("mouseout", function() {       
          tooltipDiv2.transition()        
                .duration(500)      
                .style("opacity", 0);   
        })
  }

  if(flagDrawPP){
    var circles = svg_line_chart
                .append("g")
                    .attr("class", "circles")
    for (line_idx in newDataset) {
      let line = newDataset[line_idx];
      if (line[0].Country != "EU28"){
        circles
        .append("g")
          .attr("class", "line-circles")
          .selectAll("circle")
          .data(line).enter()
          .append("circle")
            .attr("class", "circle")
            .attr("r", function(d) { return d.Year == currentYear ? 5 : 3 })
            .attr("cx", function(d) { return xscale(d.Year) })
            .attr("cy", function(d) { return hscale(d.GDP) })
            .attr("fill", function (d){
              if(d.PP < 5){
                return "#DD0000"
              }
              else{
                return "#002BFF"
              }
            })
            .attr("stroke", "black")
            .attr("stroke-dasharray", function(d){
              if(d.Country === "EU28") {
                return "10"
              } else {
                return "none";
              }
            });
      }
      
            
    }
  }

  var axis = svg_line_chart
                .append("g")
                  .attr("class","axis")

  var yaxis = d3
    .axisLeft() // we are creating a d3 axis
    .scale(hscale) // fit to our scale
    .tickFormat(d3.format(".2s")) // format of each year
    .tickSizeOuter(0);

  
    axis
      .append("g") // we are creating a 'g' element to match our yaxis
      .attr("transform", "translate(" + line_padding + ",0)")
      .attr("class", "yaxis") // we are giving it a css style
      .call(yaxis);

    axis
      .select("yaxis")
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0 - line_height / 2)
        .attr("dy", "1em")
        .attr("class", "label")
        .text("GDP");
  

  var xaxis = d3
    .axisBottom() // we are creating a d3 axis
    .scale(xscale) // we are adding our padding
    .tickValues(xscaleData)
    .tickSizeOuter(0);
  
  
    axis
      .append("g") // we are creating a 'g' element to match our x axis
        .attr("transform", "translate(0," + (line_height - line_padding) + ")")
        .attr("class", "xaxis") // we are giving it a css style
        .call(xaxis);

    // text label for the x axis

    axis
      .select("xaxis")
      .append("text")
        .attr("transform", "translate(" + line_width / 2 + " ," + (line_height - padding / 3) + ")")
        .attr("class", "label")
        .text("Year");

   
}

function gen_parallel(){
  parallel_width = parseInt(d3.select("#catarina").style("width"));
  parallel_height = parseInt(d3.select("#catarina").style("height"));
 
  bgdp = [parallel_padding, parallel_height-parallel_padding];
  bem = [parallel_padding, parallel_height-parallel_padding];
  bcri = [parallel_padding, parallel_height-parallel_padding];
  bune = [parallel_padding, parallel_height-parallel_padding];

  // Build the X scale -> it find the best position for each Y axis
  x = d3.scalePoint()
	.range([parallel_padding, parallel_width-parallel_padding])
	.domain(dimensions);

  y = {}
  for (i in dimensions) {
    name = dimensions[i]
    y[name] = d3.scaleLinear()
	  .domain( d3.extent(dataset, function(d) { return +d[name]; }) )
	  .range([parallel_height-parallel_padding, parallel_padding])
	}
  // append the svg object to the body of the page
  svg_parallel = d3.select("#catarina")
  .append("svg")
    .attr("width", parallel_width)
    .attr("height", parallel_height)
    .append("g")
      .attr("transform","translate(5,0)")

    
      data = dataset.filter(function(d) { return d.Year == currentYear;})

    

  function path(d) {
    return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
  }


  var  axis = d3.axisLeft(parallel_height);


  svg_parallel
    .append("g")
      .attr("class", "par-lines")
      .selectAll("myPath")//myPath   
      .data(data)
      .enter()
      .append("path")
        .attr("d",  path)
        .style("fill", "none")
        .style("opacity", 0.5)
        .style("cursor", "pointer")
        .style("stroke",function(d){ 
            if (selected.includes(d.Country)) {
                return colors[selected.indexOf(d.Country)];
            } else if (d.Country === "EU28") {
                return "blue";
            } else{
                return "#ccc";
            }
          })
        .attr("stroke-width", function(d){ 
          if (selected.includes(d.Country)) {
              return "3px"
          } else if (d.Country === "EU28") {
            return "3px";
            }
          else{
              return "1px";
          }
        })
        .attr("stroke-dasharray", function(d){
          if(d.Country === "EU28") {
            return "10"
          } else {
            return "none";
          }
        })
        .attr('id', function(eachCountry) {
          return eachCountry.Country
        })
        .on("mouseover", function(d) {   
          if(this.id.toString().length !== 3){
            let xy = d3.pointer(event,countries.node())
          tooltipDiv.transition()     
              .duration(200)      
              .style("opacity", 1);      
          tooltipDiv.html(this.id)  
              .style("left", xy[0] - 10  + "px")     
              .style("top", xy[1] + "px"); 
          }
             
          })                  
      .on("mouseout", function() {       
        tooltipDiv.transition()        
              .duration(500)      
              .style("opacity", 0);   
      })



    var g = svg_parallel.selectAll(".dimension")
     .data(dimensions)
     .enter().append("g")
     .attr("class", "dimension")
     .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

     // Add an axis and title.
     g.append("g")
     .attr("class", "axis")
     .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
     .append("text")
            .style("text-anchor", "middle")
            .attr("y", 40)
            .text(function(d) {
              return d==="EM_P"?"Emigration":d==="UNE_TOTAL"?"Unemployement":d==="CRI_TOT"?"Criminality":
              d})
            .style("fill", "black")
            .style("font-size", "13px");

     g.append("g")
     .attr("class", "brush")
     .each(function(d) { d3.select(this).call(y[d].brush = d3.brushY().extent([[-8,parallel_padding], [8,parallel_height-parallel_padding]]).on("brush", brush).on("end", brush)); })
     .selectAll("rect");



  function brush(event, dim){
    if(event.selection == null){
      if(dim == "GDP"){
        bgdp[0] = parallel_padding;
        bgdp[1] = parallel_height-parallel_padding;
        fgdp = true;
      }if(dim == "EM_P"){
        bem[0] = parallel_padding;
        bem[1] = parallel_height-parallel_padding;
        fem = true;
      }if(dim == "UNE_TOTAL"){
        bune[0] = parallel_padding;
        bune[1] = parallel_height-parallel_padding;
        fune = true;
      }if(dim == "CRI_TOT"){
        bcri[0] = parallel_padding;
        bcri[1] = parallel_height-parallel_padding;
        fcri = true;
      }
      //	update();
    }
    else if(event.selection != null){
       if(dim == "GDP"){
          bgdp[0] = event.selection[0];
          bgdp[1] = event.selection[1];
        }if(dim == "EM_P"){
          bem[0] = event.selection[0];
          bem[1] = event.selection[1];
        }if(dim == "UNE_TOTAL"){
          bune[0] = event.selection[0];
          bune[1] = event.selection[1];
        }if(dim == "CRI_TOT"){
          bcri[0] = event.selection[0];
          bcri[1] = event.selection[1];
        }
        //update();
    }
	//update();      
    updateParallel();
    prepare_event();

  }  
}

function gen_map() {
  let width = 650;
  countriesSelectedYear = []
  countriesSelectedYearTotal = []
  for(const el of dataset){
    if(el.Year === currentYear.toString()){
        countriesSelectedYear.push(el.Country)
        countriesSelectedYearTotal.push(el)
    }
  }

  projection = d3.geoMercator().scale(scale).translate([width / 2, 0]).center(center);
  path = d3.geoPath().projection(projection);
  
  map_width = parseInt(d3.select("#mapDiv").style("width"));
  map_height = parseInt(d3.select("#mapDiv").style("height"));

  svg_map = d3.select("#mapDiv")
                .append("svg")
                  .attr("height",map_height)
                  .attr("width", map_width);

  countries = svg_map.append("g")
                      .attr("transform","translate(-100,0)")
                      .attr("height","100%")
                      .attr("width", "100%");



  d3.json("eu.topojson").then( (data) => {
    
    countries.selectAll('.country')
    .data(topojson.feature(data, data.objects.europe).features)
    .enter()
    .append('path')
      .attr('class', function(eachCountry) {
        for(const el of countriesSelectedYearTotal){
          if(eachCountry.properties.iso_a3 === el.Country){
            if (flagDrawPP) {
              if(el.PP < 5){
                return "country2"
              } else {
                return "country4"
              }
            } else {
              if(el.GDP < 10000){
                return "country1"
                }
                else if(el.GDP >= 10001 && el.GDP < 20000){
                    return "country3"
                }
                else if(el.GDP >= 20001 && el.GDP < 30000){
                    return "country5"
                }
                else{
                    return "country7"
                }
            }
          }            
      }
          return "country8"
      })
      .attr('d', path)
      .attr('id', function(eachCountry) {
          return eachCountry.properties.iso_a3       
      })
      .attr('gdp', function(eachCountry) {
        for(const el of countriesSelectedYearTotal){
          if(eachCountry.properties.iso_a3 === el.Country){
              return el.GDP
          }            
        }
    })
      .on("click", function(){
        if(countriesSelectedYear.includes(this.id)){
          if (!selected.includes(this.id)) {
            if(selected.length<4){
              selected.push(this.id);
            } else {
              selected.push(this.id);   
              selected.shift();
              var rotC = colors.shift();    
              colors.push(rotC);
            }
          } else {
            index = selected.indexOf(this.id);
            selected.splice(index,1);
            const takenColor = colors[index]
            colors.splice(index,1);
            colors.push(takenColor);
          }
        
        update()
        } 
      })
      .on("mouseover", function(d) {   
        let gdp = null
        for(const el of countriesSelectedYearTotal){
          if(this.id === el.Country){
              gdp = el.GDP
          }            
        }
        gdp += "€"
        if(this.id.toString().length !== 3){
          let xy = d3.pointer(event,countries.node())
          tooltipDiv.transition()     
              .duration(200)      
              .style("opacity", 1);      
          tooltipDiv.html(this.id)  
            .style("left", xy[0] - 10  + "px")     
            .style("top", xy[1] + "px"); 
          tooltipDiv3.transition()     
            .duration(200)      
            .style("opacity", 1);      
          tooltipDiv3.html(gdp)  
            .style("left", xy[0] - 10  + "px")     
            .style("top", xy[1] + 20 + "px"); 
        }
           
        })                  
      .on("mouseout", function() {       
        tooltipDiv.transition()        
          .duration(500)      
          .style("opacity", 0);   
        tooltipDiv3.transition()        
          .duration(500)      
          .style("opacity", 0);   
      })
      .style("stroke",function(d){ 
        if (selected.includes(d.properties.iso_a3)) {
            return colors[selected.indexOf(d.properties.iso_a3)];
        }
        else{
            return "#ccc";
        }
      })
      .attr("stroke-width", function(d){ 
        if (selected.includes(d.properties.iso_a3)) {
            return "4px"
        }
        else if(countriesSelectedYear.includes(d.properties.iso_a3)){
            return "1px";
        }
        else{
          return "0"
        }
      })
      return;
  });

  if(flagDrawPP) {
    document.getElementById("legenda").style.visibility = "hidden";
    document.getElementById("PP_legenda").style.visibility = "visible";
  } else {
    document.getElementById("PP_legenda").style.visibility = "hidden";
    document.getElementById("legenda").style.visibility = "visible";
  }

  
}

function gen_criminality(){

  var datasetFiltered = dataset.filter(function (d) {
    if ((selected.includes(d.Country) || d.Country === "EU28") && Number(d.Year) === Number(currentYear)){
      d.Year = parseInt(d.Year);
      d.CRI_A60 = parseFloat(d.CRI_A60);
      d.CRI_B60 = parseFloat(d.CRI_B60);
      return d;
    }
  });
  

  let cri_width = parseInt(d3.select("#criminality").style("width"));
  let cri_height = parseInt(d3.select("#criminality").style("height"));
  let cri_padding = 50;



  var xscaleData = datasetFiltered.map(function (a) { return a.Country});
  
  var xscale = d3
    .scalePoint()
    .domain(xscaleData)
    .range([cri_padding, cri_width - cri_padding]);



  svg_criminality = d3
    .select("#criminality")
    .append("svg") // we are appending an svg to the div 'line_chart_2'
      .attr("width", cri_width)
      .attr("height", cri_height);

  svg_criminality
  .append("g")
    .attr("class","circles")
    .selectAll("circle")
    .data(datasetFiltered).enter()
    .append("circle")
      .attr("class", "circle")
      .attr("r", function(d) { 
        if (d.CRI_A60 > d.CRI_B60) {
          return d.CRI_A60 * 1.4;
        } else {
          return d.CRI_B60 * 1.4;
        }
      
      })
      .attr("cx", function(d) { return xscale(d.Country) })
      .attr("cy", function(d) { return cri_height/2 })
      .attr("fill", function (d){ 
        if (d.CRI_A60 > d.CRI_B60) {
          return "white";
        } else {
          if (d.Country === "EU28") {
            return "blue";
          }
          return colors[selected.indexOf(d.Country)];
        }
      })
      .attr("stroke", "black")
      .attr("stroke-width", "0.5px")
      .attr('id', function(d) {
        return d.Country
      })
      .on("mouseover", function(d) {   
        let val = null
          for(const el of countriesSelectedYearTotal){
            if(this.id === el.Country){
                console.log(el)
                val = el['CRI_B60'] + "%"
            }            
          }
        if(this.id.toString().length !== 3){
          let xy = d3.pointer(event,countries.node())
        tooltipDiv.transition()     
            .duration(200)      
            .style("opacity", 1);      
        tooltipDiv.html(this.id)  
            .style("left", xy[0] - 10  + "px")     
            .style("top", xy[1] + "px"); 
        tooltipDiv4.transition()     
          .duration(200)      
          .style("opacity", 1);      
        tooltipDiv4.html(val)  
            .style("left", xy[0] - 10  + "px")     
            .style("top", xy[1] + 20 + "px"); 
        }
           
        })                  
      .on("mouseout", function() {       
        tooltipDiv.transition()        
              .duration(500)      
              .style("opacity", 0);   
        tooltipDiv4.transition()        
        .duration(500)      
        .style("opacity", 0);   
      })
      .on("click", function(){
        if(this.id !== "EU28"){
          index = selected.indexOf(this.id);
          selected.splice(index,1);
          const takenColor = colors[index]
          colors.splice(index,1);
          colors.push(takenColor);
          tooltipDiv.transition()        
            .duration(500)      
            .style("opacity", 0);   
          tooltipDiv4.transition()        
          .duration(500)      
          .style("opacity", 0);
          update()
        }
        
      })

  svg_criminality
  .append("g")
    .attr("class","circles")
    .selectAll("circle")
    .data(datasetFiltered).enter()
    .append("circle")
      .attr("class", "circle")
      .attr("r", function(d) { 
        if (d.CRI_A60 > d.CRI_B60) {
          return d.CRI_B60 * 1.4;
        } else {
          return d.CRI_A60 * 1.4;
        }
      
      })
      .attr("cx", function(d) { return xscale(d.Country) })
      .attr("cy", function(d) { return cri_height/2 })
      .attr("fill", function (d){ 
        if (d.CRI_A60 > d.CRI_B60) {
          if (d.Country === "EU28") {
            return "blue";
          }
          return colors[selected.indexOf(d.Country)];
        } else {
          return "white";
        }
      })
      .attr("stroke", "black")
      .attr("stroke-width", "0.5px")
      .attr('id', function(d) {
        return d.Country
      })
      .on("mouseover", function(d) {   
        let val = null
          for(const el of countriesSelectedYearTotal){
            if(this.id === el.Country){
                console.log(el)
                val = el['CRI_A60'] + "%"
            }            
          }
        if(this.id.toString().length !== 3){
          let xy = d3.pointer(event,countries.node())
        tooltipDiv.transition()     
            .duration(200)      
            .style("opacity", 1);      
        tooltipDiv.html(this.id)  
            .style("left", xy[0] - 10  + "px")     
            .style("top", xy[1] + "px"); 
        tooltipDiv4.transition()     
          .duration(200)      
          .style("opacity", 1);      
        tooltipDiv4.html(val)  
            .style("left", xy[0] - 10  + "px")     
            .style("top", xy[1] + 20 + "px"); 
        }
           
        })                  
      .on("mouseout", function() {       
        tooltipDiv.transition()        
              .duration(500)      
              .style("opacity", 0);   
        tooltipDiv4.transition()        
        .duration(500)      
        .style("opacity", 0);   
      })
      .on("click", function(){
        if(this.id !== "EU28"){
          index = selected.indexOf(this.id);
          selected.splice(index,1);
          const takenColor = colors[index]
          colors.splice(index,1);
          colors.push(takenColor);
          tooltipDiv.transition()        
            .duration(500)      
            .style("opacity", 0);   
          tooltipDiv4.transition()        
          .duration(500)      
          .style("opacity", 0);
          update()
        }
        
      })
  

  var axis = svg_criminality
                .append("g")
                  .attr("class","axis")



  var xaxis = d3
    .axisBottom() // we are creating a d3 axis
    .scale(xscale) // we are adding our padding
    .tickValues(xscaleData)
    .tickSizeOuter(0);
  
  
    axis
      .append("g") // we are creating a 'g' element to match our x axis
        .attr("transform", "translate(0," + (cri_height - cri_padding) + ")")
        .attr("class", "xaxis") // we are giving it a css style
        .call(xaxis);

    // text label for the x axis

    axis
      .select("xaxis")
      .append("text")
        .attr(
          "transform",
          "translate(" + cri_width / 2 + " ," + (cri_height - cri_padding / 3) + ")"
        )
        .attr("class", "label")
        .text("Country");

}

function gen_unemployment() {

  var datasetFiltered = dataset.filter(function (d) {
    if ((selected.includes(d.Country) || d.Country === "EU28") && Number(d.Year) === Number(currentYear)){
      d.Year = parseInt(d.Year);
      d['UNE_Y15-24'] = parseFloat(d['UNE_Y15-24']);
      d['UNE_Y25-39'] = parseFloat(d['UNE_Y25-39']);
      d['UNE_Y40-64'] = parseFloat(d['UNE_Y40-64']);
      d['UNE_EDL0-2'] = parseFloat(d['UNE_EDL0-2']);
      d['UNE_EDL3_4'] = parseFloat(d['UNE_EDL3_4']);
      d['UNE_EDL5-8'] = parseFloat(d['UNE_EDL5-8']);
      return d;
    }
  });

  var maxAxisDataset = dataset.filter(function (d) {
    if (selected.includes(d.Country) || d.Country === "EU28"){
      d.Year = parseInt(d.Year);
      d['UNE_Y15-24'] = parseFloat(d['UNE_Y15-24']);
      d['UNE_Y25-39'] = parseFloat(d['UNE_Y25-39']);
      d['UNE_Y40-64'] = parseFloat(d['UNE_Y40-64']);
      d['UNE_EDL0-2'] = parseFloat(d['UNE_EDL0-2']);
      d['UNE_EDL3_4'] = parseFloat(d['UNE_EDL3_4']);
      d['UNE_EDL5-8'] = parseFloat(d['UNE_EDL5-8']);
      return d;
    }
  });



  
  let une_width = parseInt(d3.select("#unemployment").style("width"));
  let une_height = parseInt(d3.select("#unemployment").style("height"));
  let une_padding = 55;



  var xscaleData = datasetFiltered.map(function (a) { return a.Country});
  
  var xscale = d3
    .scalePoint()
    .domain(xscaleData)
    .padding(0.5)
    .range([une_padding, une_width - une_padding]);



  svg_unemployment = d3
    .select("#unemployment")
    .append("svg") // we are appending an svg to the div 'line_chart_2'
      .attr("transform", "translate(" + -15 + "," + -5 +")")
      .attr("width", une_width)
      .attr("height", une_height);


  if (isEducationFlag) {

    document.getElementById("une_info_circle").innerHTML = "Primary";
    document.getElementById("une_info_square").innerHTML = "Secondary";
    document.getElementById("une_info_triangle").innerHTML = "Tertiary";

    var hscale = d3
    .scaleLinear()
    .domain([ 0, d3.max(maxAxisDataset, function (d) { 
            return Math.max(d['UNE_EDL0-2'], d['UNE_EDL3_4'], d['UNE_EDL5-8']); 
      }) * 1.1 ,])
    .range([une_height - une_padding, 45]);


    svg_unemployment
    .append("g")
      .attr("class","circles")
      .selectAll("circle")
      .data(datasetFiltered).enter()
      .append("circle")
        .attr("class", "circle")
        .style("cursor","pointer")
        .attr("r", "7")
        .attr("cx", function(d) { return xscale(d.Country) })
        .attr("cy", function(d) { return hscale(d['UNE_EDL0-2']) })
        .attr("fill", function (d){ 
          if (d.Country === "EU28") {
            return "blue"
          }
          return colors[selected.indexOf(d.Country)] 
        })
        .attr("stroke", "black")
        .attr('id', function(d) {
          return d.Country
        })
        .on("mouseover", function(d) {  
          let val = null
          for(const el of countriesSelectedYearTotal){
            if(this.id === el.Country){
                val = el['UNE_EDL0-2'] + "%"
            }            
          }
          console.log(val)
          if(this.id.toString().length !== 3){
            let xy = d3.pointer(event,countries.node())
          tooltipDiv.transition()     
              .duration(200)      
              .style("opacity", 1);      
          tooltipDiv.html(this.id)  
              .style("left", xy[0] - 10  + "px")     
              .style("top", xy[1] + "px"); 
          tooltipDiv4.transition()     
            .duration(200)      
            .style("opacity", 1);      
          tooltipDiv4.html(val)  
              .style("left", xy[0] - 10  + "px")     
              .style("top", xy[1] + 20 + "px");   
          }
          
             
          })                  
        .on("mouseout", function() {       
          tooltipDiv.transition()        
                .duration(500)      
                .style("opacity", 0);   
          tooltipDiv4.transition()        
            .duration(500)      
            .style("opacity", 0);   
        })
        .on("click", function(){
          if(this.id !== "EU28"){
            index = selected.indexOf(this.id);
            selected.splice(index,1);
            const takenColor = colors[index]
            colors.splice(index,1);
            colors.push(takenColor);
            tooltipDiv.transition()        
              .duration(500)      
              .style("opacity", 0);   
              tooltipDiv4.transition()        
              .duration(500)      
              .style("opacity", 0);  
            update()
          }
          
        })


    svg_unemployment
    .append("g")
      .attr("class","squares")
      .selectAll("rect")
      .data(datasetFiltered).enter()
      .append("rect")
        .attr("class", "rect")
        .style("cursor","pointer")
        .attr("width", "12")
        .attr("height", "12")
        .attr("x", function(d) { return xscale(d.Country)-6 })
        .attr("y", function(d) { return hscale(d['UNE_EDL3_4']) })
        .attr("fill", function (d){ 
          if (d.Country === "EU28") {
            return "blue"
          }
          return colors[selected.indexOf(d.Country)] 
        })
        .attr("stroke", "black")
        .attr('id', function(d) {
          return d.Country
        })
        .on("mouseover", function(d) {   
          if(this.id.toString().length !== 3){
            let xy = d3.pointer(event,countries.node())
          tooltipDiv.transition()     
              .duration(200)      
              .style("opacity", 1);      
          tooltipDiv.html(this.id)  
              .style("left", xy[0] - 10  + "px")     
              .style("top", xy[1] + "px"); 
          }
             
          })                  
          .on("mouseover", function(d) {  
            let val = null
            for(const el of countriesSelectedYearTotal){
              if(this.id === el.Country){
                  console.log(el)
                  val = el['UNE_EDL3_4'] + "%"
              }            
            }
            console.log(val)
            if(this.id.toString().length !== 3){
              let xy = d3.pointer(event,countries.node())
            tooltipDiv.transition()     
                .duration(200)      
                .style("opacity", 1);      
            tooltipDiv.html(this.id)  
                .style("left", xy[0] - 10  + "px")     
                .style("top", xy[1] + "px"); 
            tooltipDiv4.transition()     
              .duration(200)      
              .style("opacity", 1);      
            tooltipDiv4.html(val)  
                .style("left", xy[0] - 10  + "px")     
                .style("top", xy[1] + 20 + "px");   
            }
            
               
            })                  
          .on("mouseout", function() {       
            tooltipDiv.transition()        
                  .duration(500)      
                  .style("opacity", 0);   
            tooltipDiv4.transition()        
              .duration(500)      
              .style("opacity", 0);   
          })
          .on("click", function(){
            if(this.id !== "EU28"){
              index = selected.indexOf(this.id);
              selected.splice(index,1);
              const takenColor = colors[index]
              colors.splice(index,1);
              colors.push(takenColor);
              tooltipDiv.transition()        
                .duration(500)      
                .style("opacity", 0);   
                tooltipDiv4.transition()        
                .duration(500)      
                .style("opacity", 0);  
              update()
            }
            
          })
  

    svg_unemployment
    .append("g")
      .attr("class","triangles")
      .selectAll("triangle")
      .data(datasetFiltered).enter()
      .append('path')
        .attr("d", d3.symbol().type(d3.symbolTriangle).size(100))
        .style("cursor","pointer")
        .attr("transform", function(d) { return "translate(" + xscale(d.Country) + "," + hscale(d['UNE_EDL5-8']) + ")"; })
        .attr("fill", function (d){ 
          if (d.Country === "EU28") {
            return "blue"
          }
          return colors[selected.indexOf(d.Country)] 
        })
        .attr("stroke", "black")
        .attr('id', function(d) {
          return d.Country
        })
        .on("mouseover", function(d) {   
          if(this.id.toString().length !== 3){
            let xy = d3.pointer(event,countries.node())
          tooltipDiv.transition()     
              .duration(200)      
              .style("opacity", 1);      
          tooltipDiv.html(this.id)  
              .style("left", xy[0] - 10  + "px")     
              .style("top", xy[1] + "px"); 
          }
             
          })                  
          .on("mouseover", function(d) {  
            let val = null
            for(const el of countriesSelectedYearTotal){
              if(this.id === el.Country){
                  console.log(el)
                  val = el['UNE_EDL5-8'] + "%"
              }            
            }
            console.log(val)
            if(this.id.toString().length !== 3){
              let xy = d3.pointer(event,countries.node())
            tooltipDiv.transition()     
                .duration(200)      
                .style("opacity", 1);      
            tooltipDiv.html(this.id)  
                .style("left", xy[0] - 10  + "px")     
                .style("top", xy[1] + "px"); 
            tooltipDiv4.transition()     
              .duration(200)      
              .style("opacity", 1);      
            tooltipDiv4.html(val)  
                .style("left", xy[0] - 10  + "px")     
                .style("top", xy[1] + 20 + "px");   
            }
            
               
            })                  
          .on("mouseout", function() {       
            tooltipDiv.transition()        
                  .duration(500)      
                  .style("opacity", 0);   
            tooltipDiv4.transition()        
              .duration(500)      
              .style("opacity", 0);   
          })
          .on("click", function(){
            if(this.id !== "EU28"){
              index = selected.indexOf(this.id);
              selected.splice(index,1);
              const takenColor = colors[index]
              colors.splice(index,1);
              colors.push(takenColor);
              tooltipDiv.transition()        
                .duration(500)      
                .style("opacity", 0);   
                tooltipDiv4.transition()        
                .duration(500)      
                .style("opacity", 0);  
              update()
            }
            
          })
  } else {

    document.getElementById("une_info_circle").innerHTML = "15-24";
    document.getElementById("une_info_square").innerHTML = "25-39";
    document.getElementById("une_info_triangle").innerHTML = "40-64";

    var hscale = d3
    .scaleLinear()
    .domain([ 0, d3.max(maxAxisDataset, function (d) { 
            return Math.max(d['UNE_Y15-24'], d['UNE_Y25-39'], d['UNE_Y40-64']); 
      }) * 1.1 ,])
    .range([une_height - une_padding, une_padding]);


    svg_unemployment
    .append("g")
      .attr("class","circles")
      .selectAll("circle")
      .data(datasetFiltered).enter()
      .append("circle")
        .attr("class", "circle")
        .style("cursor","pointer")
        .attr("r", "7")
        .attr("cx", function(d) { return xscale(d.Country) })
        .attr("cy", function(d) { return hscale(d['UNE_Y15-24']) })
        .attr("fill", function (d){ 
          if (d.Country === "EU28") {
            return "blue"
          }
          return colors[selected.indexOf(d.Country)] 
        })
        .attr("stroke", "black")
        .attr('id', function(d) {
          return d.Country
        })
        .on("mouseover", function(d) {   
          if(this.id.toString().length !== 3){
            let xy = d3.pointer(event,countries.node())
          tooltipDiv.transition()     
              .duration(200)      
              .style("opacity", 1);      
          tooltipDiv.html(this.id)  
              .style("left", xy[0] - 10  + "px")     
              .style("top", xy[1] + "px"); 
          }
             
          })                  
        .on("mouseout", function() {       
          tooltipDiv.transition()        
                .duration(500)      
                .style("opacity", 0);   
        })
        .on("click", function(){
          if(this.id !== "EU28"){
            index = selected.indexOf(this.id);
            selected.splice(index,1);
            const takenColor = colors[index]
            colors.splice(index,1);
            colors.push(takenColor);
            tooltipDiv.transition()        
              .duration(500)      
              .style("opacity", 0);   
            update()
          }
          
        })

    svg_unemployment
    .append("g")
      .attr("class","squares")
      .selectAll("rect")
      .data(datasetFiltered).enter()
      .append("rect")
        .attr("class", "rect")
        .style("cursor","pointer")
        .attr("width", "12")
        .attr("height", "12")
        .attr("x", function(d) { return xscale(d.Country)-6 })
        .attr("y", function(d) { return hscale(d['UNE_Y25-39']) })
        .attr("fill", function (d){ 
          if (d.Country === "EU28") {
            return "blue"
          }
          return colors[selected.indexOf(d.Country)] 
        })
        .attr("stroke", "black")
        .attr('id', function(d) {
          return d.Country
        })
        .on("mouseover", function(d) {   
          if(this.id.toString().length !== 3){
            let xy = d3.pointer(event,countries.node())
          tooltipDiv.transition()     
              .duration(200)      
              .style("opacity", 1);      
          tooltipDiv.html(this.id)  
              .style("left", xy[0] - 10  + "px")     
              .style("top", xy[1] + "px"); 
          }
             
          })                  
        .on("mouseout", function() {       
          tooltipDiv.transition()        
                .duration(500)      
                .style("opacity", 0);   
        })
        .on("click", function(){
          if(this.id !== "EU28"){
            index = selected.indexOf(this.id);
            selected.splice(index,1);
            const takenColor = colors[index]
            colors.splice(index,1);
            colors.push(takenColor);
            tooltipDiv.transition()        
              .duration(500)      
              .style("opacity", 0);   
            update()
          }
          
        })

    svg_unemployment
    .append("g")
      .attr("class","triangles")
      .selectAll("triangle")
      .data(datasetFiltered).enter()
      .append('path')
        .attr("d", d3.symbol().type(d3.symbolTriangle).size(100))
        .style("cursor","pointer")
        .attr("transform", function(d) { return "translate(" + xscale(d.Country) + "," + hscale(d['UNE_Y40-64']) + ")"; })
        .attr("fill", function (d){ 
          if (d.Country === "EU28") {
            return "blue"
          }
          return colors[selected.indexOf(d.Country)] 
        })
        .attr("stroke", "black")
        .attr('id', function(d) {
          return d.Country
        })
        .on("mouseover", function(d) {   
          if(this.id.toString().length !== 3){
            let xy = d3.pointer(event,countries.node())
          tooltipDiv.transition()     
              .duration(200)      
              .style("opacity", 1);      
          tooltipDiv.html(this.id)  
              .style("left", xy[0] - 10  + "px")     
              .style("top", xy[1] + "px"); 
          }
             
          })                  
        .on("mouseout", function() {       
          tooltipDiv.transition()        
                .duration(500)      
                .style("opacity", 0);   
        })
        .on("click", function(){
          if(this.id !== "EU28"){
            index = selected.indexOf(this.id);
            selected.splice(index,1);
            const takenColor = colors[index]
            colors.splice(index,1);
            colors.push(takenColor);
            tooltipDiv.transition()        
              .duration(500)      
              .style("opacity", 0);   
            update()
          }
          
        })
        
  }
  




  var axis = svg_unemployment
                .append("g")
                  .attr("class","axis")

  var yaxis = d3
    .axisLeft() // we are creating a d3 axis
    .scale(hscale) // fit to our scale
    .tickFormat(d3.format(".2s")) // format of each year
    .tickSizeOuter(0);

  
    axis
      .append("g") // we are creating a 'g' element to match our yaxis
      .attr("transform", "translate(" + une_padding + ",0)")
      .attr("class", "yaxis") // we are giving it a css style
      .call(yaxis);

    axis
      .select("yaxis")
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0 - une_height / 2)
        .attr("dy", "1em")
        .attr("class", "label")
        .text("Unemployment");


  var xaxis = d3
    .axisBottom() // we are creating a d3 axis
    .scale(xscale) // we are adding our padding
    .tickValues(xscaleData)
    .tickSizeOuter(0);
  
  
    axis
      .append("g") // we are creating a 'g' element to match our x axis
        .attr("transform", "translate(0," + (une_height - une_padding) + ")")
        .attr("class", "xaxis") // we are giving it a css style
        .call(xaxis);

    // text label for the x axis

    axis
      .select("xaxis")
      .append("text")
        .attr(
          "transform",
          "translate(" + une_width / 2 + " ," + (une_height - une_padding / 3) + ")"
        )
        .attr("class", "label")
        .text("Country"); 

        
}

/* /////////////////////////
#
#   UPDATE FUNCTIONS
#
//////////////////////////*/



function begin() {

  d3.csv("datasets/final_dataset2.csv").then( (data) => {
      
      full_dataset = data;
      dataset = data;
      
      updateColorTab();
      gen_map()
      gen_parallel()
      gen_line_chart()
      gen_criminality()
      gen_unemployment()
      prepare_event()
    
  })
}

function update(){
  //addToSelected();
  updateLine();
  updateParallel()
  updateMap();
  updateCriminality();
  updateUnemployment();
  updateColorTab();
  prepare_event();
}

function updateUnemployment() {
  d3.selectAll("#unemployment").select("svg").remove()
  gen_unemployment();
}

function updateCriminality(){
  d3.selectAll("#criminality").select("svg").remove()
  gen_criminality();
}

function updateMap() {

  d3.csv("datasets/final_dataset2.csv").then( (data) => {
      
    full_dataset = data;
    dataset = data;
    countriesSelectedYear = []
      countriesSelectedYearTotal = []
      for(const el of full_dataset){
        if(el.Year === currentYear.toString()){
            countriesSelectedYear.push(el.Country)
            countriesSelectedYearTotal.push(el)
        }
      }
  
	})
  


  projection = d3.geoMercator().scale(scale).translate([width / 2, 0]).center(center);
  path = d3.geoPath().projection(projection);
  


  d3.select("#mapDiv").select("svg").selectAll("g").remove();


  countries = svg_map.append("g")
                      .attr("transform","translate(-100,0)")
                      .attr("height","100%")
                      .attr("width", "100%");
  
  d3.json("eu.topojson").then( (data) => {
    
    countries.selectAll('.country')
    .data(topojson.feature(data, data.objects.europe).features)
    .enter()
    .append('path')
    .attr('id', function(eachCountry) {
      return eachCountry.properties.iso_a3       
    })
    .attr('class', function(eachCountry) {
          for(const el of countriesSelectedYearTotal){
              if(eachCountry.properties.iso_a3 === el.Country){
                if (flagDrawPP) {
                  if(el.PP < 5){
                    return "country2"
                  } else {
                    return "country4"
                  }
                } else {
                  if(el.GDP < 10000){
                    return "country1"
                    }
                    else if(el.GDP >= 10001 && el.GDP < 20000){
                        return "country3"
                    }
                    else if(el.GDP >= 20001 && el.GDP < 30000){
                        return "country5"
                    }
                    else{
                        return "country7"
                    }
                }
                  
              }            
          }
          return "country8"
      })
      .attr('d', path)

      .on("click", function(){
        if(countriesSelectedYear.includes(this.id)){
          if (!selected.includes(this.id)) {
            if(selected.length<4){
              selected.push(this.id);
            } else {
              selected.push(this.id);   
              selected.shift();
              var rotC = colors.shift();    
              colors.push(rotC);
            }
          } else {
            index = selected.indexOf(this.id);
            selected.splice(index,1);
            const takenColor = colors[index]
            colors.splice(index,1);
            colors.push(takenColor);
          }
        
        update()
        } 
      })
      .on("mouseover", function(d) {   
        let gdp = null
        for(const el of countriesSelectedYearTotal){
          if(this.id === el.Country){
              gdp = el.GDP
          }            
        }
        gdp += "€"
        if(this.id.toString().length !== 3){
          let xy = d3.pointer(event,countries.node())
          tooltipDiv.transition()     
              .duration(200)      
              .style("opacity", 1);      
          tooltipDiv.html(this.id)  
            .style("left", xy[0] - 10  + "px")     
            .style("top", xy[1] + "px"); 
          tooltipDiv3.transition()     
            .duration(200)      
            .style("opacity", 1);      
          tooltipDiv3.html(gdp)  
            .style("left", xy[0] - 10  + "px")     
            .style("top", xy[1] + 20 + "px"); 
        }
           
        })                  
      .on("mouseout", function() {       
        tooltipDiv.transition()        
          .duration(500)      
          .style("opacity", 0);   
        tooltipDiv3.transition()        
          .duration(500)      
          .style("opacity", 0);   
      })
      .style("stroke",function(d){ 
        if (selected.includes(d.properties.iso_a3)) {
            return colors[selected.indexOf(d.properties.iso_a3)];
        }
        else{
            return "#ccc";
        }
      })
      .attr("stroke-width", function(d){ 
        if (selected.includes(d.properties.iso_a3)) {
            return "4px"
        }
        else if(countriesSelectedYear.includes(d.properties.iso_a3)){
            return "1px";
        }
        else{
          return "0"
        }
      })
      return;
  });

  if(flagDrawPP) {
    document.getElementById("legenda").style.visibility = "hidden";
    document.getElementById("PP_legenda").style.visibility = "visible";
  } else {
    document.getElementById("PP_legenda").style.visibility = "hidden";
    document.getElementById("legenda").style.visibility = "visible";
  }
  
}

function updateParallel(){
  d3.select(".par-lines").remove();

  function path(d) {
    return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
  }

  data = dataset.filter(function(d) { return d.Year == currentYear;})
  
  svg_parallel
    .append("g")
      .attr("class", "par-lines")
      .selectAll("myPath")//myPath   
      .data(data)
      .enter()
      .append("path")
        .attr("d",  path)
        .style("fill", "none")
        .style("opacity", 0.5)
        .style("cursor", "pointer")
        .style("stroke",function(d){ 
        if (selected.includes(d.Country)) {
              return colors[selected.indexOf(d.Country)];
        }else if (d.Country === "EU28") {
              return "blue";
        }
        else if (
               bgdp[0] == parallel_padding && (parallel_height-parallel_padding) == bgdp[1] 
            && bem[0] == parallel_padding && (parallel_height-parallel_padding) == bem[1] 
            && bune[0] == parallel_padding && (parallel_height-parallel_padding) == bune[1]
            && bcri[0] == parallel_padding && (parallel_height-parallel_padding) == bcri[1]) {
             return "#ccc";
        }
        else if (
             bgdp[0] < y["GDP"](d.GDP) && y["GDP"](d.GDP) < bgdp[1] 
          && bem[0] < y["EM_P"](d.EM_P) && y["EM_P"](d.EM_P) < bem[1] 
          && bune[0] < y["UNE_TOTAL"](d.UNE_TOTAL) && y["UNE_TOTAL"](d.UNE_TOTAL) < bune[1]
          && bcri[0] < y["CRI_TOT"](d.CRI_TOT) && y["CRI_TOT"](d.CRI_TOT) < bcri[1]) {
           return "#414141";
        }
        else return "#ccc";
        })
        .attr("stroke-width", function(d){ 
            if (selected.includes(d.Country)) {
                return "3px"
            }else if (d.Country === "EU28") {
              return "3px";
              }
             else if (
             bgdp[0] < y["GDP"](d.GDP) && y["GDP"](d.GDP) < bgdp[1] 
          && bem[0] < y["EM_P"](d.EM_P) && y["EM_P"](d.EM_P) < bem[1] 
          && bune[0] < y["UNE_TOTAL"](d.UNE_TOTAL) && y["UNE_TOTAL"](d.UNE_TOTAL) < bune[1]
          && bcri[0] < y["CRI_TOT"](d.CRI_TOT) && y["CRI_TOT"](d.CRI_TOT) < bcri[1]) {
           return "1px";
        }
            else{
                return "1px";
            }
        })
        .attr("stroke-dasharray", function(d){
          if(d.Country === "EU28") {
            return "10"
          } else {
            return "none";
          }
        })
        .attr('id', function(eachCountry) {
          return eachCountry.Country
        })
        .on("mouseover", function(d) {   
          if(this.id.toString().length !== 3){
            let xy = d3.pointer(event,countries.node())
          tooltipDiv.transition()     
              .duration(200)      
              .style("opacity", 1);      
          tooltipDiv.html(this.id)  
              .style("left", xy[0] - 10  + "px")     
              .style("top", xy[1] + "px"); 
          }
             
          })                  
      .on("mouseout", function() {       
        tooltipDiv.transition()        
              .duration(500)      
              .style("opacity", 0);   
      })

        
}

function updateLine() {
  d3.selectAll("#line_chart").select("svg").remove()
  gen_line_chart()
}

function updateColorTab() {

  for(let i=0; i<4; i++) {
    if (selected[i]) {
      document.getElementById(colors[i]).style.backgroundColor=colors[i]
      document.getElementById(colors[i]+"Text").innerHTML=selected[i]
    }
    else{
      document.getElementById(colors[i]).style.backgroundColor=colors[i]
      document.getElementById(colors[i]+"Text").innerHTML= ""
    }
  }
}


/* /////////////////////////
#
#   HANDLER FUNCTIONS
#
//////////////////////////*/

function play() {
	var temp = 1000
	for (var i = 2008; i <=  2018; i++) {
		timeoutHandler(i,temp)
		temp += 1000
	}
	

}

function timeoutHandler (ano,temp) {
	setTimeout(()=>{
    currentYear=ano
    document.getElementById("anoYear").innerHTML=currentYear
		document.getElementById("myRange").value=currentYear
    update()
	}, temp)
}

function prepare_event(){
      

  dispatch = d3.dispatch("parallelEvent");


  svg_parallel.selectAll("path").on("click", function (event, d) {
	    dispatch.call("parallelEvent", this, d);
	  });

    dispatch.on("parallelEvent", function (d) {
    if (!selected.includes(d.Country)) {
        if(selected.length<4){
          selected.push(d.Country);
        } else {
          selected.push(d.Country);   
          selected.shift();
          var rotC = colors.shift();    
          colors.push(rotC);
        }
      } else {
        index = selected.indexOf(d.Country);
        selected.splice(index,1);
        const takenColor = colors[index]
        colors.splice(index,1);
        colors.push(takenColor);
      }

  update()

  });

  if (flagDrawPP){
    line_dispatch = d3.dispatch("lineEvent");

      svg_line_chart.selectAll("circle").on("click", function (event, d) {
        line_dispatch.call("lineEvent", this, d);
      });


      line_dispatch.on("lineEvent", function (d) {
        currentYear = d.Year;
        update()
        handleYearSlider(currentYear)
        document.getElementById("myRange").value = d.Year;
    });
  }

}

function bubbles (dataCSV,countriesSelectedYearTotal) {
  svg_map.append("g")
  .selectAll("circle")
  .data(dataCSV)
  .enter()
  .append("circle")
  .attr("cx", function (eachCircle) {
      return projection([eachCircle.homelon-12.5,eachCircle.homelat])[0]
  })
  .attr("cy", function (eachCircle) {
      return projection([eachCircle.homelon,eachCircle.homelat])[1]
  })
  .attr("r", 5)
  .attr("stroke", "#ccc")
  .attr("fill", function (eachCircle){
    for(const c of countriesSelectedYearTotal){
      if(c.Country === eachCircle.homecontinent){
        if(c.PP < 5){
          return "#DD0000"
        }
        else{
          return "#002BFF"
        }
      }
    }
  })
}

function handleYearSlider (value){
  currentYear=value
  document.getElementById("anoYear").innerHTML=value
  update()
}

function PPHandler(){
  flagDrawPP = !flagDrawPP
  flagDrawPP?document.getElementById("buttonPP").style.backgroundColor="#9fe8ff":document.getElementById("buttonPP").style.backgroundColor="#fff"
  update()
}

function ageUneHandler(){
  isEducationFlag = false;
  document.getElementById("buttonAge").style.backgroundColor="#9fe8ff"
  document.getElementById("buttonEducation").style.backgroundColor="#fff"
  updateUnemployment();
}

function educationUneHandler(){
  isEducationFlag = true;
  document.getElementById("buttonAge").style.backgroundColor="#fff"
  document.getElementById("buttonEducation").style.backgroundColor="#9fe8ff"
  updateUnemployment();
}

function clearHandler () {
  selected = []
  update()
}


/* /////////////////////////
#
#   SUPPORT FUNCTIONS
#
//////////////////////////*/

function addToSelected () {
  if(selected.length===4){
    selected.shift();
    var rotC = colors.shift();    
    colors.push(rotC);
  }
  else if(selected.length<4){
    document.getElementById("map-EU").style.borderStyle = "solid"
    document.getElementById("map-EU").style.borderWidth = "4px"
    document.getElementById("map-EU").style.borderColor = colors[selected.indexOf("EU28")]
 }

}


function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}

function searchAdd(val){
  console.log(val)
  document.getElementById("myDropdown").classList.toggle("show");
  if (!selected.includes(val)) {
    if(selected.length<4){
      selected.push(val);
    } else {
      selected.push(val);   
      selected.shift();
      var rotC = colors.shift();    
      colors.push(rotC);
    }
  } else {
    index = selected.indexOf(val);
    selected.splice(index,1);
    const takenColor = colors[index]
    colors.splice(index,1);
    colors.push(takenColor);
  }
  update()
}