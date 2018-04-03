var dataviz = document.getElementById('dataviz'),
    dataUrl = dataviz.getAttribute('data');
      
      function resize() {
       var width0 = d3.select("#dataviz").node().getBoundingClientRect().width,
       margin = { top: width0*0.007, left: width0*0.25, bottom: width0*0.03, right: width0*0.03 },
           width = d3.select("#dataviz").node().getBoundingClientRect().width- margin.left - margin.right,
           height = d3.select("#dataviz").node().getBoundingClientRect().width*0.55- margin.top - margin.bottom,
           rad = width*0.005,
           yName = "Treaty Topic";

      var format = d3.time.format("%m/%d/%Y");
       
       var x = function(d) { return d["Date Received From President"]; },
           y = function(d) { return d[yName]; },
           area = width*0.5;

       var xScale = d3.time.scale()
             .range([0, width]),

           yScale = d3.scale.ordinal()
             .rangeBands([height, 0]);
          
           colorScale = d3.scale.ordinal()
            .range(["#01786F","#7F1734","#B768A2","#1fabb4","#e31a1c","#6F4E37","#299617","#F2AC28","#30BFBF","#002E63","#DE3163","#87FF2A","#FFDB00","#1f78b4","#299617","#2D5DA1","#84DE02","#FD5240","#4BC7CF","#000000","#B31B1B","#A6A6A6","#50BFE6","#0000ff","#2243B6","#9C51B6"]);
       
       var xValue = function(d) { return xScale(format.parse(x(d))); },
           yValue = function(d) { return yScale(y(d)) + yScale.rangeBand()/2; };
       
       var xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
           yAxis = d3.svg.axis().scale(yScale).orient("left");
       
       var bubbleChart = d3.forceChart()
        .size([width, height])
        .x(xValue)
        .y(yValue)
        .r(rad)
        .xGravity(3)    // make the x-position more accurate
        .yGravity(2); // ...and the y-position more flexible

       var tooltip = d3.select("#dataviz").append("div")
                        .attr("id","tooltip");

       var svg = d3.select("#dataviz").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
       
       d3.json(dataUrl, function(error, treaty) {
         if (error) throw error;
         
        var allDomain = treaty.map(function(d) {return d[yName];} );

        var yDomain = allDomain.filter(function(elem, index, self) {
            return index === self.indexOf(elem);
             })

        var xDomain = d3.extent(treaty, function(d) { return format.parse(d["Date Received From President"]); })
        yScale.domain(yDomain);
        xScale.domain(xDomain);

        colorScale.domain(yDomain);

  ////////////////////////////////////////////////////////////// 
  ///////////////////// Create Search Box ////////////////////// 
  ////////////////////////////////////////////////////////////// 

  //Create options - all the trials
  var filterednodes = treaty.filter(function(d) {return d["countries"];
});
   var options = []
   var arr = filterednodes.forEach(function(d) {
    
    d["countries"].forEach(function(m, i) { options.push(m);})
    });
  options.sort();
  options.unshift("All","Bilateral","Multilateral, International Organizations, Other");
  var nodupoptions = options.filter(function(elem, index, self) {
            return index === self.indexOf(elem);
             })
  //nodupoptions.sort();
  
  
  var select = document.getElementById("searchBox"); 
  //Put new options into select box
  for(var i = 0; i < nodupoptions.length; i++) {
    var opt = nodupoptions[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
  }

  //Create search combo box
  $('.combobox').combobox();

// Draw axes
         svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

         svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .selectAll(".tick line")
            .attr("x2", width)
            .attr("stroke-dasharray", "1, 2")
            .style("stroke", "lightgrey");

          svg.selectAll(".x.axis, .y.axis")
              .selectAll("text")
              .style("font-size", width*0.02 + "px"); //To change the font size of texts
            
         // Draw bubbles
         svg.append("g").call(bubbleChart, treaty)
            .attr("class", "bubbles " )
          .selectAll(".node").append("circle")
          .attr("class", function(d) {return d["countries"]} )
            .attr("r", rad + "px")
            .attr("fill", function(d) {return colorScale(d["Treaty Topic"]);})
            .attr("stroke", "#f6f6f6")
            .on("mouseover", function(d) {
              d3.select(this)
                .attr("r",rad*2+"px");

                var html = "<strong>" + d["Title"] + "</strong><br/>" +
                          "<span>Date Received From President: " + d["Date Received From President"]+ "</span><br/><br/>  Latest Senate Action: " +
                          d["Latest Senate Action"]+ "<br/><span> Latest Senate Action Date: " +
                          d["Latest Senate Action Date"] + "</span>";

                tooltip.style("display", "inline-block")
                        .style("left", (d3.event.pageX - 250) + "px")     
                        .style("top", (d3.event.pageY + 15) + "px")
                        .html(html)
                      })

          .on("mouseout",function(){
          d3.select(this).attr("r",rad+"px");
          tooltip.style("display","none");
        })
          .on("click", function(d) {window.open(d["URL"]);});

       });
  //Function to call once the search box is filled in
  window.searchEvent = function(country) { 

if (country && country != "All") {
    d3.selectAll("circle")
    .style("opacity",function(d) {
      if (d["countries"].includes(country) == true ) {return 1;}
      else {return 0.051;}
    })
    .on("mouseover", function(d) {
      if (d["countries"].includes(country) == true ) {
      d3.select(this)
      .attr("r",rad*2+"px");
      var html = "<strong>" + d["Title"] + "</strong><br/>" +
              "<span>Date Received From President: " + d["Date Received From President"]+ "</span><br/><br/>  Latest Senate Action: " +
              d["Latest Senate Action"]+ "<br/><span> Latest Senate Action Date: " +
              d["Latest Senate Action Date"] + "</span>";
      tooltip.style("display", "inline-block")
              .style("left", (d3.event.pageX - 250) + "px")     
              .style("top", (d3.event.pageY + 15) + "px")
              .html(html)
            };
            })
    .on("mouseout",function(){
          d3.select(this).attr("r",rad+"px");
          tooltip.style("display","none");
        })
  }
else {
  d3.selectAll("circle")
    .style("opacity",1)
    .on("mouseover", function(d) {
      d3.select(this)
        .attr("r",rad*2+"px");
          var html = "<strong>" + d["Title"] + "</strong><br/>" +
                    "<span>Date Received From President: " + d["Date Received From President"]+ "</span><br/><br/>  Latest Senate Action: " +
                    d["Latest Senate Action"]+ "<br/><span> Latest Senate Action Date: " +
                    d["Latest Senate Action Date"] + "</span>";

          tooltip.style("display", "inline-block")
                  .style("left", (d3.event.pageX - 250) + "px")     
                  .style("top", (d3.event.pageY + 15) + "px")
                  .html(html)
                })
    .on("mouseout",function(){
      d3.select(this).attr("r",rad+"px");
      tooltip.style("display","none");
      })

  };
}
};

var resizeId;
d3.select(window)
.on('resize', function() {
    clearTimeout(resizeId);
    resizeId = setTimeout(function() {
        //console.log("resize event called");
        currentFrame = 0;
        d3.select("#searchBox").selectAll("option").remove();
        d3.select(".combobox-container").remove();
        d3.select("#dataviz").select("svg").remove().call(resize);

  }, 500);
})
.call(resize);