// Set up the chart
//= ================================
var svgWidth = 700;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 85,
  left: 85
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper,
// append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
// =================================
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Census data in CSV stored as: 
// id,state,abbr,poverty,povertyMoe,age,ageMoe,income,incomeMoe,healthcare,healthcareLow,
// healthcareHigh,obesity,obesityLow,obesityHigh,smokes,smokesLow,smokesHigh,-0.385218228

// Create variable for what to plot on each axis, so we can choose what to plot later
// Set default values
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis] * 0.92), d3.max(censusData, d => d[chosenXAxis] * 1.05)])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis] * 0.8), d3.max(censusData, d => d[chosenYAxis] * 1.1)])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles when x axis is changed
function renderXCircles(circlesGroup, stateGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  stateGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]) + 1);

  return circlesGroup, stateGroup;
}

// function used for updating circles group with a transition to
// new circles when y axis is changed
function renderYCircles(circlesGroup, stateGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  stateGroup.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]) + 4);

  return circlesGroup, stateGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, stateGroup) {
  var xLabel;
  var yLabel;

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([100, -60])
    .html(function(d) {
      // Create labels for the different options
	  if (chosenXAxis === "poverty") {
	    xLabel = `Poverty: ${d[chosenXAxis]}%`;
	  }
	  else if (chosenXAxis === "age")
	    xLabel = `Median Age: ${d[chosenXAxis]}`;
	  else {
	  	// create this to format number
	  	var nf = new Intl.NumberFormat();
	  	// create variable for income so we can format it with commas
	  	var medianIncome = nf.format(d[chosenXAxis]);
	    xLabel = `Median Household Income: $${medianIncome}`;
	  }

	  if (chosenYAxis === "healthcare") {
	    yLabel = "Lacks Healthcare:";
	  }
	  else if (chosenYAxis === "smokes")
	    yLabel = "Smokes:";
	  else {
	    yLabel = "Obesity:";
	  }
      return (`<strong>${d.state}</strong><br>${yLabel} ${d[chosenYAxis]}%<br>${xLabel}`);
    });

  chartGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
    d3.select(this)
      .classed("circleActive", true)
      .classed("stateCircle", false);
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    d3.select(this)
      .classed("circleActive", false)
      .classed("stateCircle", true);
    });

  stateGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });

  return circlesGroup, stateGroup;
}

// Import data from the csv file
// =================================
d3.csv("assets/data/data.csv").then(function(censusData, err) {
  if (err) throw err;

  // N.B. data stored as: 
  // id,state,abbr,poverty,povertyMoe,age,ageMoe,income,incomeMoe,healthcare,healthcareLow,
  // healthcareHigh,obesity,obesityLow,obesityHigh,smokes,smokesLow,smokesHigh,-0.385218228

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);

  // yLinearScale function above csv import
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .classed("stateCircle", true);

  // append state labels on circles
  var stateGroup = chartGroup.selectAll(".stateText")
    .data(censusData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis])+1)
    .attr("y", d => yLinearScale(d[chosenYAxis])+3)
    .attr("font-size", "6pt")
    .classed("stateText", true)
    .text(d => d.abbr);

  // Create group for x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Create group for y-axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  var healthcareLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left + 45)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left + 25)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesityLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left + 5)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obesity (%)");

  // updateToolTip function above csv import
  var circlesGroup, stateGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, stateGroup);
  // Need to check if this works #HELP

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        //console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup, stateGroup = renderXCircles(circlesGroup, stateGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup, stateGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, stateGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age"){
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  // x axis labels event listener
  yLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        //console.log(chosenYAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(censusData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup, stateGroup = renderYCircles(circlesGroup, stateGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup, stateGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, stateGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes"){
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });


}).catch(function(error) {
  console.log(error);
});