 function draw(data) {


	var metrices = ["sentiment","review_length","subjectivity","stars_rating"]
	var categories = ["topics","brand"];

	// Add info button

	var info_button = d3.select("body")
						.append("span")
						.attr("class","glyphicon glyphicon-question-sign")
						.attr("id","info_button");

	//Add drop down menue (Bottom)
	var dropdown = d3.select("body")
	  .append("select")
      .attr("name", "metric_list")
      .attr("id","metric_drop_down");

    var options = dropdown.selectAll("option")
               .data(metrices)
               .enter()
               .append("option");
	
	options.text(function (d) { return d; })
		   .attr("value",function (d) { return d; })
    
    

	//Add drop down menue (Right)
	var dropdown_2 = d3.select("body")
	  .append("label")
	  .attr("id","grouping")
	  .text("Group by: ")
	  .append("select")
	  .attr("id","grouping_drop_down")
      .attr("name", "grouping_list");

    var options_2 = dropdown_2.selectAll("option")
               .data(categories)
               .enter()
               .append("option");
	
	options_2.text(function (d) { return d; })
		   .attr("value",function (d) { return d; })

	// Add checkbox for extreme values
	var extremes_box = d3.select("body")
						 .append("label")
						 .append("div")
						 .attr("id","extremes")
						 .text("Remove extreme values ")
						 .append("input")
						 .attr("type","checkbox")
						 .attr("id","checkbox_1")



	// Initial set up

	draw_hist(metrices[0],categories[0])

	// Ad info_box interactivity
	info_button.on(
      "click", function() {
        var met = metrices[document.getElementById("metric_drop_down").selectedIndex];
		create_info(met);
      	});
	
	//Add drop down interactivity
	dropdown.on('change', function(d) {
		//Get current dropdown selection
		var newData = eval(d3.select(this));
		var cat = categories[document.getElementById("grouping_drop_down").selectedIndex];
		
		//Remove old chart
		d3.select("svg").remove()
		//draw new chart
		draw_hist(newData.property("value"),cat)
	});

	dropdown_2.on('change', function(d) {
		//Get current dropdown selection
		var newCat = eval(d3.select(this));
		var met = metrices[document.getElementById("metric_drop_down").selectedIndex];
		//Remove old chart
		d3.select("svg").remove()
		//draw new chart
		draw_hist(met,newCat.property("value"))
	});

	//Add checkbox interactivity

	extremes_box.on("change",function(d){
		//get values of dropdowns
		
		var met = metrices[document.getElementById("metric_drop_down").selectedIndex];
		var cat = categories[document.getElementById("grouping_drop_down").selectedIndex];
		
		//Remove old chart
		d3.select("svg").remove()
	
		//draw new chart
		draw_hist(met,cat)
	});
// Read in the description file

// function that creates an info box containing information on the currently selected metric
function create_info(metric){

	d3.csv("data/info_data.csv", function(info_data){
		
		var infopane = d3.select("body")
						.append("div")
						.attr("id","infopanel");

		var text_field = infopane.append("div").attr("class","text");

		//Add headertext
		var headertext = text_field.append("div")
								   .attr("class","headertext")
								   .append("span")
								   .text("Information Panel")

		//Add main info text
		var main_info = text_field.append("div")
								  .attr("class","description");

		var metric_name = main_info.append("div")
								   .attr("class","name")
								   .append("strong")
								   .text("Metric: ")
								   .append("span")
								   .text(metric);
		

		var description = main_info.append("div")
								   .attr("class","details")
								   .text(info_data.filter(function(d){return d.metric === metric})[0].description);

		//Add close button
		var close_button = d3.select("body").append("span")
						  .attr("class","glyphicon glyphicon-remove-circle")
						  .attr("id","close_button")
						  .on("click",function(){
						  	d3.selectAll("#infopanel").remove()
						  	d3.selectAll("#close_button").remove()
						  });
	    });

		}
						 

function draw_hist(metric, cat){
	
	// get all category levels
	var samples = data.length;
	function percentage_share(leaves){
        return (leaves.length)/samples;
    }

    var alllevels = d3.set();

    data.map(function(d){
		alllevels.add(d[cat])
        });


    var alllevels = alllevels.values();

    var share = d3.nest().key(function(d){
    				   	
    				   	return d[cat]
    				   })
    				   .rollup(percentage_share)
    				   .entries(data);

    var level_share = {};
    	share.forEach(function(d){

    		level_share[d.key]=d.value
    	})

	// Check if extreme values should be removed and return the data
	var mean = d3.mean(data,function(d){
		return +d[metric];
	});
	
	var std_dev = d3.deviation(data,function(d){
		return +d[metric];
	});

	var used_data = data.map(function(d){
		
		var remove_extremes = document.getElementById("checkbox_1").checked;
		
		var category = d[cat];
		var record = +d[metric];

		if (remove_extremes) {
			var z_value = Math.abs((record-mean)/std_dev);
			
			if (z_value<4.0) {
				return {"value":record,"key":category};
			} else {return null}

		} else {
			return {"value":record,"key":category};
		}	
	});
	

	var filtered_data = used_data.filter(function(d) { return d != null; })

	var numeric_data = filtered_data.map(function(d){ return d.value;});


	// category coloring

    var color = d3.scaleOrdinal().range(["rgb(0,203,155)","rgb(72,206,14)","rgb(197,160,0)","rgb(107,155,231)","rgb(67,124,97)","rgb(0,211,255)","rgb(255,136,255)",
                                        "rgb(152,86,79)","rgb(255,113,49)","rgb(255,102,167)"]);


	//Set up the svg element
	
	var formatCount = d3.format(",.0f");


	var svg = d3.select("body").append("svg"),
	    margin = {top: window.innerWidth*0.04, right: window.innerWidth*0.3, bottom: window.innerWidth*0.02, left: window.innerWidth*0.02},
	    width = window.innerWidth,
	    heigth = window.innerHeight*0.95,
	    no_bins = d3.thresholdScott(numeric_data,d3.min(numeric_data),d3.max(numeric_data))

	    


	svg.attr("width",width)
	   .attr("height",heigth)
	   
	var g = svg.append("g")
			   .attr("class","chart")
			   .attr("width",width-margin.right)
			   .attr("heigth",heigth-margin.bottom)
			   .append("g")
	   		   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// draw x-Axis

		// x range
    var x_extent = d3.extent(filtered_data, function(d) {
    	
          return d.value;
      });

	 	// Create x-axis scale mapping dates -> pixels
    var x = d3.scaleLinear()
        .range([margin.left, width-margin.right])
        .domain(x_extent);


    g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + (heigth-margin.bottom-margin.top) + ")")
    .call(d3.axisBottom(x));

    

    //Prepare data for drawing chart

    var stack = d3.stack()
	    .keys(alllevels)
	    .order(d3.stackOrderNone)
	    .offset(d3.stackOffsetNone);
   	

	var bins_func = d3.histogram()
		    .domain(x.domain())
		    .value(function(d){ return d.value;})
		    .thresholds(x.ticks(no_bins))

	var bins = bins_func(filtered_data);

    //Convert binned data into stack readable data array
    function counts(leaves){
        return leaves.length;
    }

    var stackableData = bins.map(function(d){
    	var bin = d.x0;
    	var nested = d3.nest()
    				   .key(function(d){
    				   	
    				   	return d.key
    				   })
    				   .rollup(counts)
    				   .entries(d);
    	var counts_data = nested.map(function(d){
    		
    		var key = d.key;
    		var anzahl = d.value;
    		return {"key":key,"count":anzahl}
    	});

    	
    	var daten = {};
    	daten["bin"]=bin
    	counts_data.forEach(function(d){

    		daten[d.key]=d.count
    	})
    	return daten
    });

    var layered = stack(stackableData);
    

    // draw stacked historgram

	var y = d3.scaleLinear()
	    .domain([0, d3.max(bins, function(d) { return d.length; })])
	    .range([heigth-margin.bottom-margin.top, 0]);

	// draw y-axis

	g.append("g")
		.attr("class","axis axis--y")
		.attr("transform", "translate(" + (margin.left) + ",0)")
    	.call(d3.axisLeft(y));

	  // text label for the y axis
	svg.append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 0)
	      .attr("x",0 - (heigth / 2))
	      .attr("dy", "1em")
	      .style("text-anchor", "middle")
	      .text("count"); 
	
	var bar = g.selectAll(".bar")
	  .data(layered)
	  .enter().append("g")
	    .attr("class", "bar")
	    .attr("fill",function(d){
	    	
	    	return color(d.key);})
	    .selectAll("rect")
	    .data(function(d){return d;})
	    .enter()
		.append("rect")
		.attr("x", function(d) {
			return x(d.data.bin); })
	    .attr("y", function(d) {
	     return y(d[1]); })
	    .attr("height", function(d) { return y(d[0]) - y(d[1]); })
	    .attr("width", ((width)/no_bins)*0.5);

    //add legend
    var radius = 8;

    var legend = svg.append("g")
          .attr("class","legend")
          .attr("transform","translate("+(width+40-margin.right) + "," + margin.top + ")")
          .selectAll("g")
          .data(alllevels)
          .enter().append("g")
          .attr("class","legend_element")
          .attr("id",function(d){return d;});


    legend.append("circle")
          .attr("cy",function(d,i){
            return i*30;
          })
          .attr("r",function(d){
              return radius;
          })
          .attr("fill",function(d){
              return color(d)
          });

    legend.append("text")
          .attr("y",function(d,i){
            return i*30+5;
          })
          .attr("x",radius*5)
          .text(function(d){
          	var percent = Math.round(level_share[d]*100);
            return d + " ("+percent+"%)";
          })

    //Change cursor on mouseover
    legend.on(
      "mouseover", function(d) {
        d3.select(this).style("cursor", "pointer")
      },
      "mouseout", function(d) {
        d3.select(this).style("cursor", "default")
      }
    );
    
    var filter = new Set();

    //Add Interactivity
    legend.on("click",function(d,i,nodes){
            

             if (filter.has(d)){
             	

             	if (filter.size>1){
             		filter.delete(d)
             		update(Array.from(filter))

             	} else {
             		update(Array.from(filter))
             	}
             } else {
             	filter.add(d)
             	update(Array.from(filter))
             }
            
            
            
            var arr_nodes = nodes.map(function(d){
            	if (filter.has(d.id)) {} 
            		else{
            		return d;}
            	})
            
            debugger;
       		nodes.forEach(function(d){
            	try{
            	d3.select(d).style("opacity",1)
            		}
            	catch(err){}
            		})
            	
       
            // Change legend styling
            arr_nodes.forEach(function(d){
            	try{
            	d3.select(d).style("opacity",0.4)
            		}
            	catch(err){}
            		})
            	})


    function check(string,array){

    	try {
    		if (array.indexOf(string) > -1) {
    		return true
			} else {
    		return false
				}	
		}
		catch(err) {
		    return false;
		}
				
    };

    //Update function for legend selection   	
    function update(level){
    	

		//Filter the data based on the level input    	
      	//Prepare data for drawing chart

	    var filtered_data_update = filtered_data.filter(function(d){

	    	return check(d.key,level)
	    });

	    

	     var bins_update = bins_func(filtered_data_update);
	    

	     //Convert binned data into stack readable data array

	    var stackableData_update = bins_update.map(function(d){
	    	var bin = d.x0;
	    	var nested = d3.nest()
	    				   .key(function(d){
	    				   	return d.key
	    				   })
	    				   .rollup(counts)
	    				   .entries(d);
	    	var counts_data = nested.map(function(d){
	    		var key = d.key;
	    		var anzahl = d.value;
	    		return {"key":key,"count":anzahl}
	    	});

	    	
	    	var data = {};
	    	data["bin"]=bin
	    	counts_data.forEach(function(d){

	    		data[d.key]=d.count
	    	})
	    	return data
	    });

	   
	    var stack_update = d3.stack()
		    .keys(level)
		    .order(d3.stackOrderNone)
		    .offset(d3.stackOffsetNone);
		

	    var layered_update = stack_update(stackableData_update);
	    
	    //Remove old data

	 	g.selectAll(".bar").remove()

	  	// Add new

	  	var bar = g.selectAll(".bar")
		  .data(layered_update)
		  .enter()
		  .append("g")
		    .attr("class", "bar")
		    .attr("fill",function(d){
		    	
		    	return color(d.key);})
		    .selectAll("rect")
		    .data(function(d){return d;})
		    .enter()
			.append("rect")
			.attr("x", function(d) {
				return x(d.data.bin); })
		    .attr("y", function(d) {
		     return y(d[1]); })
		    .attr("height", function(d) { return y(d[0]) - y(d[1]); })
		    .attr("width", ((width)/no_bins)*0.5)
		    .transition()
		    .duration(500);
		    
      	
      		}

		}
    
    }

