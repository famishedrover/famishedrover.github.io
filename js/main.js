// To avoid CORS error for Chrome & other browsers.

DATA_PATH = "https://raw.githubusercontent.com/famishedrover/dataViz2_data/master/";
var ORDER = {"Final":2.2, "semi":2, "quarter":1.5, "Fourth":1.3, "Third":1};
var ORDERING = {"Final":0, "semi":1, "quarter":2, "Fourth":3, "Third":4};
var BACKORDERING = {0:"Final", 1:"semi", 2:"quarter", 3:"Fourth", 4:"Third"};
// MASTERPATH = "https://raw.githubusercontent.com/famishedrover/dataViz2_data/master/graphs/2008_data_graph.json"

// https://raw.githubusercontent.com/famishedrover/dataViz2_data/master/graphs/2004_data_graph.json

// set the dimensions and margins of the graph

function getplot(year, image_choice, reset= true){
	// console.log("Image Choice " + image_choice)
// console.log("call for year "+ year.toString())

  var width = 550
  var height = 650

  // append the svg object to the body of the page
  d3.select("#svgplot")
  	.html("")

  var svg = d3.select("#svgplot")
	.append("svg")
	  .attr("width", width)
	  .attr("height", height)
	.append("g")
	  .attr("transform", "translate(40,0)");  // bit of margin on the left = 40



	var winner_ele = d3.select("p#player_name")
	var winner_name = winner_ele.text()

	var winner_player_name = winner_name.split(" / ")[0]
	var winner_flag_name = winner_name.split(" / ")[1]


	if (reset) {
		var durationTime = 250;
		d3.select('p#player_name').transition().duration(durationTime).text("Hover Over Image").style("font-size","14px");
		d3.select('p#win_against').transition().duration(durationTime).text("Hover Over Image").style("font-size","14px");
		d3.select('p#round').transition().duration(durationTime).text("Hover Over Image").style("font-size","14px");
		d3.select('p#score').transition().duration(durationTime).text("Hover Over Image").style("font-size","14px");

		d3.select("#radarplot")
		.html("")
	}


	d3.select("#showWinnerImg")
	.html("")



	var image_width = 100 ;
	var image_height = 100 ;
	var svgImg = d3.select("#showWinnerImg")
				.append("svg")
				.append('image')
			    .attr('xlink:href', function(){
			    
			    	if (reset == false) {
			    		if (image_choice == "country"){

							if (!(winner_player_name in player_paths)){
									return DATA_PATH + "images/default_this.png";
								}else{
									return player_paths[winner_player_name];
							}
			    			
			    		}else{
							return countryFlags[winner_flag_name];
			    		}
			    	}
			    return DATA_PATH + "images/default_this.png";
			    })
			    .attr('width', image_width)
			    .attr('height', image_height)

	// svgImg.append('rect')
	//   .attr('class', 'image-border')
	//   .attr('width', image_width)
	//   .attr('height', image_height);
				

  // read json data
  d3.json(DATA_PATH + "graphs_na/"+year.toString()+"_data_graph.json", function(data) {


		// Create the cluster layout:
		var cluster = d3.cluster()
		  .size([height, width - 100]);  // 100 is the margin I will have on the right side

		// Give the data to this cluster layout:
		var root = d3.hierarchy(data, function(d) {
			return d.children;
		});
		cluster(root);





		// Add the links between nodes:
		svg.selectAll('path')
		  .data( root.descendants().slice(1) )
		  .enter()
		  .append('path')
		  .attr("d", function(d) {
			  return "M" + d.y + "," + d.x
					  + "C" + (d.parent.y + 20) + "," + d.x
					  + " " + (d.parent.y + 30) + "," + d.parent.x // 50 and 150 are coordinates of inflexion, play with it to change links shape
					  + " " + d.parent.y + "," + d.parent.x;
					})
		  .style("fill", 'none')
		  .attr("stroke", '#fff')
		  .attr("stroke-width", 0.5)
			// .attr("opacity", 0)
			.transition()   // another transition
			.delay(100)
			.duration(500)
			// .attr("opacity", 1)
		  .attr("stroke-width", function(d){
		  	return 4*ORDER[d.data.data.round];
		  })




		// Add a circle for each node.
		svg.selectAll("g")
			.data(root.descendants())
			.enter()
			.append("g")
			.attr("transform", function(d) {
				// console.log(d)
				// console.log(d.data.data.winner)
				// console.log(d.data.data.country1)
				return "translate(" + d.y + "," + d.x + ")"
			})
			.append("image")
			.attr("xlink:href", function(d) {

				var name = d.data.data.player1;


				if (image_choice == "country") {
					return countryFlags[d.data.data.country1];

				}else{
					if (!(name in player_paths)){
						return DATA_PATH + "images/default_this.png";
					}else{
						return player_paths[name];
					}
				}
				
			})
			.on("mouseover", handleMouseOver)
			.on("mouseout", handleMouseOut)
			.attr("x", function(d){
				return -15*ORDER[d.data.data.round];
			})
			.attr("y", function(d){
				return -20*ORDER[d.data.data.round];
			})
			.attr("width", function(d){
				return 40*ORDER[d.data.data.round];
			})
			.attr("height", function(d){
				return 40*ORDER[d.data.data.round];
			})
			.attr("opacity", 0)
		    .transition()   // another transition
  			.delay(100)
  			.duration(500)
  			.attr("opacity", 1)



// showWinnerImg




		// svg.selectAll("g")
		// 	.data(root.descendants())
		// 	.enter()
		// 	.append("circle")
		// 	.attr("transform", function(d) {
		// 		// console.log(d)
		// 		// console.log(d.data.data.winner)
		// 		// console.log(d.data.data.country1)
		// 		return "translate(" + d.y + "," + d.x + ")"
		// 	})
		// 	.attr("r", 30)
		// 	.style("fill", "#69b3a2")
		// 	.attr("stroke", "black")
		// 	.style("stroke-width", 2)

      // Create Event Handlers for mouse
      function handleMouseOver(d, i) {  // Add interactivity
			// console.log("Logging Current Match");
      		// console.log(d);
            // Use D3 to select element, change color and size
            // console.log(this)
            d3.select(this)
            .transition()
            .duration(500)
            .attr("width", 60*ORDER[d.data.data.round])
            .attr("height",60*ORDER[d.data.data.round])
            .attr("x",-30*ORDER[d.data.data.round])
            .attr("y",-30*ORDER[d.data.data.round]);


            d3.select("#showWinnerImg")
			.transition()
			.duration(500)
			.attr("width", 200)
			.attr("height", 200)
			.attr("xlink:href", function() {

				var name = d.data.data.player1;


				if (image_choice == "country") {

					if (!(name in player_paths)){
						svgImg.attr('xlink:href', DATA_PATH + "images/default_this.png")
					}else{
						svgImg.attr('xlink:href', player_paths[name])
					}

					
					return countryFlags[d.data.data.country1];


				}else{
					svgImg.attr('xlink:href', countryFlags[d.data.data.country1])
					if (!(name in player_paths)){
						return DATA_PATH + "images/default_this.png";
					}else{
						return player_paths[name];
					}
				}
				
			})


            // Specify where to put label of text
            // svg.append("text").attr({
            //    id: "t" + d.x + "-" + d.y + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
            //     x: function() { return xScale(d.x) - 30; },
            //     y: function() { return yScale(d.y) - 15; }
            // })
            // .text(function() {
            //   return [d.x, d.y];  // Value of the text
            // });
			d3.select('p#player_name').transition().duration(500).text(d.data.data.player1 + " / " + d.data.data.country1).style("font-size","20px");
			d3.select('p#win_against').transition().duration(500).text(d.data.data.player2 + " / " + d.data.data.country2).style("font-size","20px");
			d3.select('p#round').transition().duration(500).text(d.data.data.round).style("font-size","24px");
			d3.select('p#score').transition().duration(500).text(d.data.data.results).style("font-size","20px");

			// var svg = d3.select("#singleplot")
			// 	.append("svg")
			// 	.attr("width", 100)
			// 	.attr("height", 100)
			// 	.append("g")
			// 	.attr("transform", "translate(0,0)");  // bit of margin on the left = 40

			


			d3.select("#svgplot")
				.selectAll('path')
				.data( root.descendants().slice(1) )
				.style("fill", 'none')
				.attr("stroke",       function (td){
					// if round and person the same then make green
					if((ORDERING[d.data.data.round]+1 == ORDERING[td.data.data.round]) && ((d.data.data.player1 == td.data.data.player1) || (d.data.data.player2 == td.data.data.player1))) {
						return "#009d00";
					}else{
						return "#fff";
					}
				})
				// // .attr("opacity", 0)
				// .transition()   // another transition
				// .delay(100)
				// .duration(500)



			plotRadar(d)

          }



      function handleMouseOut(d, i) {
      		var durationTime = 500
            // Use D3 to select element, change color back to normal
            d3.select(this)
            .transition()
            .duration(500)
            .attr("width", 40*ORDER[d.data.data.round])
            .attr("height",40*ORDER[d.data.data.round])
            .attr("x",-15*ORDER[d.data.data.round])
            .attr("y",-20*ORDER[d.data.data.round]);

            // Select text by id and then remove
            // d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
            // console.log("outot");


   //          d3.select("#showWinnerImg")
   //          .transition()
   //          .duration(500)
			// .attr("xlink:href", DATA_PATH + "images/default_this.png");


			d3.select('p#player_name').transition().duration(durationTime).style("font-size","14px");
			d3.select('p#win_against').transition().duration(durationTime).style("font-size","14px");
			d3.select('p#round').transition().duration(durationTime).style("font-size","14px");
			d3.select('p#score').transition().duration(durationTime).style("font-size","14px");
          }
			




 			

  })
}












// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------

// SLIDER 

var dataTime = d3.range(0, 11).map(function(d) {
	return new Date(2004 + d, 10, 3);
	});

var sliderTime = d3
	.sliderBottom()
	.min(d3.min(dataTime))
	.max(d3.max(dataTime))
	.step(1000 * 60 * 60 * 24 * 365)
	.width(400)
	.tickFormat(d3.timeFormat('%Y'))
	.tickValues(dataTime)
	.default(new Date(2009, 10, 3))
	.on('onchange', val => {
	  d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
	  //add the change stuff here.
	  getplot( 

	  	year = d3.timeFormat('%Y')(val), 

	  	image_choice = checkRadioButton(), 
	  	reset = true )
	});


function checkRadioButton() { 
    var ele = document.getElementsByTagName('input'); 
    var ans = "country";

    for(i = 0; i < ele.length; i++) { 
        if(ele[i].type="radio") {     
            if(ele[i].checked) {
            	// console.log(ele[i].value)
                ans = ele[i].value; 
            }
        } 
    } 
	return ans;
}

var gTime = d3
	.select('div#slider-time')
	.append('svg')
	.attr('width', 500)
	.attr('height', 80)
	.append('g')
	.attr('transform', 'translate(30,30)');

gTime.call(sliderTime);

getplot(2009, "country", true)
d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));


// d3.selectAll(("input[name='choice']")).on("change", function(){
// 	getplot(d3.timeFormat('%Y')(sliderTime.value()), this.value);
// 	console.log("Changed");
// });


d3.selectAll("input[name='radiobtn']").on("change", function(){
	getplot(d3.timeFormat('%Y')(sliderTime.value()), this.value, reset=false);
});



// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------

function plotRadar(d){

// Taken from https://gist.github.com/nbremer/21746a9668ffdf6d8242#file-radarchart-js
// HOWEVER IT WAS ONLY FOR D3 V3 -- I HAD TO PORT IT TO D3 V4

/* Radar chart design created by Nadieh Bremer - VisualCinnamon.com */

	////////////////////////////////////////////////////////////// 
	//////////////////////// Set-Up ////////////////////////////// 
	////////////////////////////////////////////////////////////// 

	var margin = {top: 100, right: 100, bottom: 100, left: 100},
		width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
		height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);
			
	////////////////////////////////////////////////////////////// 
	////////////////////////// Data ////////////////////////////// 
	////////////////////////////////////////////////////////////// 



	var data = [

			[
				// {axis:"Error", value: d.data.data.error1},
				{axis:"First Serve", value: parseInt(d.data.data.firstServe1.replace("%", ""))},
				{axis:"First Point Won", value: parseInt(d.data.data.firstPointWon1.replace("%", ""))},
				{axis:"Second Point Won", value: parseInt(d.data.data.secPointWon1.replace("%", ""))},
				{axis:"Total", value: d.data.data.total1},
				{axis:"Winner", value: d.data.data.winner1},
				{axis:"Return", value: parseInt(d.data.data.return1.replace("%", ""))},
				{axis:"Break", value: parseInt(d.data.data.break1.replace("%", ""))}
			],
			[
				// {axis:"Error", value: d.data.data.error2},
				{axis:"First Serve", value: parseInt(d.data.data.firstServe2.replace("%", ""))},
				{axis:"First Point Won", value: parseInt(d.data.data.firstPointWon2.replace("%", ""))},
				{axis:"Second Point Won", value: parseInt(d.data.data.secPointWon2.replace("%", ""))},
				{axis:"Total", value: d.data.data.total2},
				{axis:"Winner", value: d.data.data.winner2},
				{axis:"Return", value: parseInt(d.data.data.return2.replace("%", ""))},
				{axis:"Break", value: parseInt(d.data.data.break2.replace("%", ""))}
			]
	];



	// console.log(data)
	////////////////////////////////////////////////////////////// 
	//////////////////// Draw the Chart ////////////////////////// 
	////////////////////////////////////////////////////////////// 

	// var color = d3.scale.ordinal()
	// 	.range(["#EDC951","#CC333F","#00A0B0"]);


	var color = d3.scaleOrdinal(d3.schemeCategory10);
		
	var radarChartOptions = {
	  w: 250,
	  h: 250,
	  margin: margin,
	  maxValue: 0.5,
	  levels: 5,
	  roundStrokes: true,
	  color:  color,
	  player1: d.data.data.player1,
	  player2: d.data.data.player2
	};
	//Call function to draw the Radar chart
	RadarChart(".radarChart", data, radarChartOptions);

}







