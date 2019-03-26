import React, { Component } from 'react';
import * as d3 from 'd3';

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.createMap = this.createMap.bind(this);
    this.destroyMap = this.destroyMap.bind(this);
    this.updateMap = this.updateMap.bind(this);
    this.districtAllocated = this.districtAllocated.bind(this);
    this.parseTimeLine = this.parseTimeLine.bind(this);
  }
  
  // Type check for data types passed into map.js then create map if correct.  
  componentDidMount() {
    this.createMap(); 
  }

  createMap() {
    const that = this;
    const map = d3.select(".Map svg");
    const projection = d3.geoMercator().fitSize([900, 800], this.props.geodata);
    const path = d3.geoPath()
      .projection(projection);  
    const amountAllocated = this.districtAllocated();
    
    let sum = 0;
    
    for (let i = 0; i < 17; i++) {
      sum += amountAllocated[i].value;
    }
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    
    let g = map.append("g");  
    g.append("text")
      .text("Total Adopted Improvements of St.Paul")
      .attr("fill", "white")
      .attr("x", 235)
      .attr("y", 50);    
    
    g.append('g').selectAll('path')
      .data(this.props.geodata.features)
    .enter().append('path')
      .attr('d', path)
      .attr("class", "map-piece")
      .attr('fill', "rgb(102,178,255)")
      .on("click", function() {
        that.destroyMap();
        that.updateMap();
      })
      .on("mouseover", function(){
        d3.selectAll('path').attr("opacity", "0.8");
      })
      .on("mouseout", function() {
        d3.selectAll('path').attr("opacity", "1.0");
      });
      
    g.append("text")
      .text(formatter.format(sum))
      .attr("fill", "white")
      .attr("x", 390)
      .attr("y", 300);    
    g.append("text")
      .text("(Click Me)")
      .attr("fill", "white")
      .attr("x", 425)
      .attr("y", 325);       
  }

  updateMap() {
    const that = this;
    const map = d3.select(".Map svg");
    const projection = d3.geoMercator().fitSize([800, 800], this.props.geodata);
    const path = d3.geoPath().projection(projection);  
    const amountAllocated = this.districtAllocated();
    const tooltip = d3.select(".Map div")
    let selectedIndex = -1;
    
    const min_max = d3.extent(amountAllocated, function(d) {
      if (d.name !== "Citywide") {
        return d.value;
      }
    })
  
    const colorScale  = d3.scaleLinear().domain([0,min_max[1]])
    .range(["white", "blue"]);

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    
    let g = map.append("g");

    g.append("text")
      .text("Total Adopted Improvements By District")
      .attr("fill", "white")
      .attr("x", 235)
      .attr("y", 50);
    
      
    g.append("g").selectAll('path')
      .data(this.props.geodata.features)
    .enter().append('path')
      .attr("class", "map-piece")
      .on("click", function(d,i){
        selectedIndex = i;
        let centroid = path.centroid(d);
        if (i === 15) {
          g.transition()
            .duration(750)
            .attr("transform", "translate(" + 800 / 2 + "," + 800 / 2 + ")scale(" + 2 + ")translate(" + -centroid[0] + "," + -centroid[1] + ")");                 
        } else {
          g.transition()
            .duration(750)
            .attr("transform", "translate(" + 800 / 2 + "," + 800 / 2 + ")scale(" + 3 + ")translate(" + -centroid[0] + "," + -centroid[1] + ")");          
        }
        return that.selectMap(d);
      })
      .on("mousemove", function(d,i){ 
        d3.select(this).attr("opacity", "0.8"); 
        tooltip.html("<p>" + d.properties.name2 + ": " + formatter.format(amountAllocated[i].value) + "</p>")
          .style("opacity", "1.0")
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 80 + "px");
      })
      .on("mouseout", function(d, i) {
        if (selectedIndex !== -1 && selectedIndex !== i) {
          d3.select(this).attr("opacity", "0.3"); 
        } else {
          d3.select(this).attr("opacity", "1.0"); 
        }
        tooltip.style("opacity", "0.0"); 
      })
      .transition().delay(200)
      .attr('d', path)
      .attr('fill', function(d,i) {
        return colorScale(amountAllocated[i].value)
      });     

      this.colorScale(g, min_max);
      this.timelineScale(g);
  }
  
  // Set other paths to lower opacity.
  selectMap(portion) {
    d3.selectAll('path')
    .attr("opacity",function(d,i) {
      if (d.properties.district !== portion.properties.district) {
        return 0.3;
      }
      return 1;
    })
    
  }
  
  destroyMap() {
    const svg = d3.select(".Map svg");
    let g = svg.select("g").transition().style("opacity", 0);
    g.remove();
  }

  timelineScale(g) {
    // const timeData = this.parseTimeLine();
    const timeScale = d3.scaleLinear().domain([2004, 2019]).range(["blue", "white"]);
  
  }

  colorScale(g, min_max) {
    const heightScale = d3.scaleLinear().domain([0, 800]).range(["blue", "white"]);
    const heightArr = [100, 160, 220, 280, 340, 400, 460, 520, 580, 640];    
    // Color Scale
    g.append('g').selectAll("rect")
      .data(heightArr)
    .enter().append("rect")
    .attr("x", 820)
    .attr("y", function(d,i) { return d })
    .transition().delay(200)
    .attr("width", 50)
    .attr("height", 60)
    .attr("fill", function(d,i) {
      return heightScale(d);
    });
    
    const scaleFormatter = d3.format(".2s")
    
    g.append("text")
      .text(scaleFormatter(min_max[1]))
      .attr("fill", "white")
      .attr("x", 820)
      .attr("y", 90);   
      
    g.append("text")
      .text(scaleFormatter(0))
      .attr("fill", "white")
      .attr("x", 830)
      .attr("y", 730);            
    
  }
  
  districtAllocated() {
    // TODO: Redo district amount.
    let districtAmount = [
      { name: "1", value: 0 }, 
      { name: "2", value: 0 }, 
      { name: "3", value: 0 }, 
      { name: "4", value: 0 }, 
      { name: "5", value: 0 }, 
      { name: "6", value: 0 }, 
      { name: "7", value: 0 }, 
      { name: "8", value: 0 }, 
      { name: "9", value: 0 }, 
      { name: "10", value: 0 }, 
      { name: "11", value: 0 },
      { name: "12", value: 0 }, 
      { name: "13", value: 0 }, 
      { name: "14", value: 0 }, 
      { name: "15", value: 0 }, 
      { name: "16", value: 0 },
      { name: "17", value: 0 }, 
      { name: "Citywide", value: 0 }
    ]
    
    const map_key = {
      "1":0,
      "2":1,
      "3":2,
      "4":3,
      "5":4,
      "6":5,
      "7":6,
      "8":7,
      "9":8,
      "10":9,
      "11":10,
      "12":11,
      "13":12,
      "14":13,
      "15":14,
      "16":15,
      "17":16,
      "Citywide":17,
    }
    
    const financialData = this.props.data;
    for (let i = 0; i < financialData.length; i++) {
      let districts = financialData[i].district.split(",");
      for (let c = 0; c < districts.length;  c++) {
        if (!isNaN(parseInt(financialData[i].amount))) {
          const index = map_key[districts[c].trim()];
          if (index !== undefined) {
            districtAmount[index].value += parseInt(financialData[i].amount)/districts.length;
          }    
        }
      }
    }
    return districtAmount;
  }
  
  parseTimeLine(g) {
    console.log(this.props.data);
    let timeLine = [];
    for(let i = 0; i < this.props.data.length; i++) {
      let dataPoint = this.props.data[i];
      // if(timeLine.filter((entry) => { entry.year === dataPoint.year })) {
        
      // }
    }
  }
  
  render() {
    return (
      <div className="Map">
       <svg width="900" height="800"/>
       <div className="tooltip"></div>
      </div>
    );
  }
}