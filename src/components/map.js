import React, { Component } from 'react';
import * as d3 from 'd3';

import Timeline from './timeline.js';

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.createMap = this.createMap.bind(this);
    this.destroyMap = this.destroyMap.bind(this);
    this.selectMap = this.selectMap.bind(this);
    this.updateMap = this.updateMap.bind(this);
    this.districtAllocated = this.districtAllocated.bind(this);
    this.state = {
      currentLocation: "create",
      portion: undefined,
      projection: undefined
    }
  }
  
  // Type check for data types passed into map.js then create map if correct.  
  componentDidMount() {
    this.createMap(); 
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (this.props.years.length !== 0 && (this.props.years[0] !== prevProps.years[0] || this.props.years[1] !== prevProps.years[1])) {
      const years = this.parseYearData(this.props.years);
      if (this.state.currentLocation === "create") {
        this.destroyMap();
        this.createMap(years);
      } else  if (this.state.currentLocation === "update"){
        this.destroyMap();
        this.updateMap(years);
      } else {
        this.selectMap(this.state.portion, this.state.projection, this.props.years);
      }
    }
  }

  createMap(years) {
    const that = this;
    const map = d3.select(".Map svg");
    const projection = d3.geoMercator().fitSize([900, 800], this.props.geodata);
    const path = d3.geoPath()
      .projection(projection);  
    const data = (years !== undefined) ? years : this.props.data;
    const amountAllocated = this.districtAllocated(data);
    
    let sum = 0;
    
    for (let i = 0; i < 17; i++) {
      sum += amountAllocated[i].value;
    }
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    
    let g = map.append("g");  
    
    g.append('g').selectAll('path')
      .data(this.props.geodata.features)
    .enter().append('path')
      .attr('d', path)
      .attr("class", "map-piece")
      .attr('fill', "rgb(102,178,255)")
      .on("click", function() {
        that.setState({ currentLocation: "update" });
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

  updateMap(years) {
    const that = this;
    const map = d3.select(".Map svg");
    const bounds = map.node().getBoundingClientRect();;
    const projection = d3.geoMercator().fitSize([800, 800], this.props.geodata);
    const path = d3.geoPath().projection(projection);  
    const data = (years !== undefined) ? years : this.props.data;
    const amountAllocated = this.districtAllocated(data);
    const infobox = d3.select("infobox");
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
      
    g.append("g").selectAll('path')
      .data(this.props.geodata.features)
    .enter().append('path')
      .attr("class", "map-piece")
      .on("click", function(d,i){
        selectedIndex = i;
        let centroid = path.centroid(d);
        that.setState({ currentLocation: "select", portion: d, projection:projection });
        that.selectMap(d, projection, that.props.years);
        d3.select("body").on("keydown", function() {
          if(d3.event.key === "Escape"){
            that.unSelectMap();
            that.setState({ currentLocation: "update", portion: undefined, projection:undefined });
            selectedIndex = -1;
            g.transition()
              .duration(750)
              .attr("transform", "translate(" + 900 / 2 + "," + 900 / 2 + ")scale(" + 1 + ")translate(" + -450 + "," + -450 + ")");
          }
        });
        
        g.transition()
          .duration(750)
          .attr("transform", "translate(" + 900 / 2 + "," + 900 / 2 + ")scale(" + 2 + ")translate(" + -centroid[0] + "," + -centroid[1] + ")");                 

      })
      .on("mousemove", function(d,i){ 
        d3.select(this).attr("opacity", "0.8"); 
        infobox.html("<p>" + d.properties.name2 + ": " + formatter.format(amountAllocated[i].value) + "</p>")
      })
      .on("mouseout", function(d, i) {
        if (selectedIndex !== -1 && selectedIndex !== i) {
          d3.select(this).attr("opacity", "0.3"); 
        } else {
          d3.select(this).attr("opacity", "1.0"); 
        }
      })
      .attr('d', path)
      .attr('fill', function(d,i) {
        return colorScale(amountAllocated[i].value)
      });     

      this.colorScale(g, min_max);
  }

  unSelectMap() {
    d3.select(".Map svg g").selectAll('.map-point').remove();
    d3.select(".Map svg g").selectAll('.map-text').remove();
    d3.selectAll('path')
    .attr("opacity",function(d,i) {
      return 1;
    });    
  }
    
  // Set other paths to lower opacity.
  selectMap(portion, projection, year) {
    const bounds = d3.select(".Map svg").node().getBoundingClientRect();;
    const improvementsScale = d3.scaleOrdinal()
      .domain(['Community Facilities', 'Internal Service', 'Streets and Utilities', 'Residential and Economic Development'])
      .range(['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c']);

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
      
    const infobox = d3.select(".infobox");
    const years = this.parseYearData(year);
    const data = (years !== undefined) ? years : this.props.data;
    const districtPoints = this.parseDistrict(data, portion);
    const map = d3.select(".Map svg");
    let g = map.select('g');
    
    d3.selectAll('path')
    .attr("opacity",function(d,i) {
      if (d !== null && d.properties.district !== portion.properties.district) {
        return 0.3;
      }
      return 1;
    });
    
    g.selectAll('.map-point').remove();
    g.selectAll('.map-text').remove();
    
    g.selectAll('circle')
      .data(districtPoints)
    .enter().append('circle')
      .attr("class", "map-point")
      .attr("cx", function(d,i) { return projection([d.longitude, d.latitude])[0]; })
      .attr("cy", function(d,i) { return projection([d.longitude, d.latitude])[1]; })
      .attr("r", 7.5)
      .attr("fill", function(d,i) {
        return improvementsScale(d.service);
      })
      .on("mousemove", function(d,i){
        infobox.html(
          "<p> Title: " + d.title + "</p>" +
          "<p> Department: " + d.department + "</p>" +
          "<p> Amount: " + formatter.format(d.amount) + "</p>" +
          "<p> District: " + d.district + "</p>" +
          "<p> Year: " + d.year + "</p>" +
          "<p> Location: " + d.location + "</p>" +
          "<p> Description: " + d.description + "</p>"
        );
      });
  }
  
  destroyMap() {
    const svg = d3.select(".Map svg");
    let g = svg.selectAll("g").transition().style("opacity", 0);
    g.remove();
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
  
  districtAllocated(data) {
    // TODO: Redo district amount.
    let districtAmount = [
      {name:"1",value:0},{name:"2",value:0},{name:"3",value:0},{name:"4",value:0},{name:"5",value:0},{name:"6",value:0},{name:"7",value:0},{name:"8",value:0},{name:"9",value:0},{name:"10",value:0},{name:"11",value:0},{name:"12",value:0},{name:"13",value:0},{name:"14",value:0},{name:"15",value:0},{name:"16",value:0},{name:"17",value:0},{name:"Citywide",value:0}
    ]
    
    const map_key = {
      "1":0,"2":1,"3":2,"4":3,"5":4,"6":5,"7":6,"8":7,"9":8,"10":9,"11":10,"12":11,"13":12,"14":13,"15":14,"16":15,"17":16,"Citywide":17,
    }
    
    const financialData = data;
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

  parseDistrict(data, portion) {
    let districtData = [];
    for (let i = 0; i < data.length; i++) {
      const latitude = parseFloat(data[i].latitude);
      const longitude = parseFloat(data[i].longitude);
      if (d3.geoContains(portion, [longitude, latitude])) {
        districtData.push(data[i]);
      }
    }
    return districtData;
  }
  
  parseYearData(years) {
    if (years !== undefined && years.length !== 0) {
      if (years[0] === 2003) {
        years[0] = 2004; 
      }
      if (years[0] === 2020) {
        years[0] = 2019;
      }
      if (years[1] === 2003) {
        years[1] = 2004; 
      }
      if (years[1] === 2020) {
        years[1] = 2019;
      }
      
      let i = years[0];
      let yearlyData = [];
      while (i <= years[1]) {
        for (let x = 0; x < this.props.data.length; x++) {
          if(parseInt(this.props.data[x].year) === i) {
            yearlyData.push(this.props.data[x]);
          }
        }
        i++;
      }
      return yearlyData;
    }
  }
  
  render() {
    return (
      <div className="Map">
       <h2> Total Capital Improvements St. Paul </h2>
       <svg viewBox="0 0 900 800" preserveAspectRatio="xMidYMax meet"/>
       <Timeline data={this.props.data} yearSelector={this.props.yearSelector}/>
      </div>
    );
  }
}
