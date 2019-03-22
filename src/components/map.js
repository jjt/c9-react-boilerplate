import React, { Component } from 'react';
import * as d3 from 'd3';

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.createMap = this.createMap.bind(this);
    this.destroyMap = this.destroyMap.bind(this);
    this.updateMap = this.updateMap.bind(this);
    this.districtAllocated = this.districtAllocated.bind(this);
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
      sum += amountAllocated[(i+1).toString()];
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
    
    g.selectAll('path')
      .data(this.props.geodata.features)
    .enter().append('path')
      .attr('d', path)
      .attr("class", "map-piece")
      .attr('fill', "rgb(102,178,255)")
      .on("click", function() {
        that.destroyMap();
        that.updateMap()
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
    const map = d3.select(".Map svg");
    const projection = d3.geoMercator().fitSize([800, 800], this.props.geodata);
    const path = d3.geoPath().projection(projection);  
    const amountAllocated = this.districtAllocated();
    
    const colorScale  = d3.scaleLinear().domain([0, 80691859.99999999])
    .range(["white", "blue"]);

    const heightScale = d3.scaleLinear().domain([0, 800])
    .range(["blue", "white"]);

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    
    const heightArr = [100, 160, 220, 280, 340, 400, 460, 520, 580, 640];
    let g = map.append("g");

    g.append("text")
      .text("Total Adopted Improvements By District")
      .attr("fill", "white")
      .attr("x", 235)
      .attr("y", 50);
    
      
    g.selectAll('path')
      .data(this.props.geodata.features)
    .enter().append('path')
      .attr("class", "map-piece")
      .on("mouseover", function(){ d3.select(this).attr("opacity", "0.8"); })
      .on("mouseout", function() { d3.select(this).attr("opacity", "1.0"); })
      .transition().delay(200)
      .attr('d', path)
      .attr('fill', function(d,i) {
        return colorScale(amountAllocated[(i+1).toString()])
      });     
    
    // Color Scale
    g.selectAll("rect")
      .data(heightArr)
    .enter().append("rect")
    .attr("x", 820)
    .attr("y", function(d,i) { return heightArr[i]; })
    .transition().delay(200)
    .attr("width", 50)
    .attr("height", 60)
    .attr("fill", function(d,i) {
      return heightScale(heightArr[i]);
    });
    
    const scaleFormatter = d3.format(".2s")
    
    g.append("text")
      .text(scaleFormatter(80691859))
      .attr("fill", "white")
      .attr("x", 820)
      .attr("y", 90);   
      
    g.append("text")
      .text(scaleFormatter(0))
      .attr("fill", "white")
      .attr("x", 830)
      .attr("y", 730);            
    
  }
  
  destroyMap() {
    const svg = d3.select(".Map svg");
    let g = svg.select("g").transition().style("opacity", 0);
    g.remove();
  }
  
  districtAllocated() {
    let districtAmount = { "1": 0, "2":0, "3":0, "4":0, "5":0, "6":0, "7":0, "8":0, "9":0, "10":0, "11":0, "12":0, "13":0, "14":0, "15":0, "16":0, "17":0, "Citywide":0}
    const financialData = this.props.data;
    for (let i = 0; i < financialData.length; i++) {
      let districts = financialData[i].district.split(",");
      for (let c = 0; c < districts.length;  c++) {
        if (!isNaN(parseInt(financialData[i].amount))) {
          districtAmount[districts[c].trim()] += parseInt(financialData[i].amount)/districts.length;
        }
      }
    }
    return districtAmount;
  }
  
  render() {
    return (
      <div className="Map">
       <svg width="900" height="800"/>
      </div>
    );
  }
}