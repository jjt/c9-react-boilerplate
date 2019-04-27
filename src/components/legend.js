import React, { Component } from 'react';
import * as d3 from "d3";

export default class Legend extends Component {
  componentDidMount() {
    this.createLegend();
  }

  createLegend() {
    const svg = d3.select("." + this.props.name + " svg");
    const width = this.props.width;
    const height = this.props.height;
    const margin = 30;
    const colorMap = [
      {
        name: "Community Facilities",
        color: '#a6cee3'
      },
      {
        name: "Internal Service",
        color: '#1f78b4',
      },
      {
        name: "Streets and Utilities",
        color: '#b2df8a',        
      },
      {
        name: "Residential and Economic Development",
        color: '#33a02c'        
      },
    ];

    svg.append("g").selectAll("rect")
      .attr("transform", "translate(" + margin * 2 + ","  + margin * 2 + ")")
      .data(colorMap)
      .enter() 
      .append("rect")
      .attr("fill", function(d,i) { return d.color; })
      .attr("y", (d,i) => margin * i + 10)
      .attr("x", margin * 1.2)
      .attr("width", 10)
      .attr("height", 10);
  

    svg.append("g").selectAll("text")
      .attr("transform", "translate(" + margin * 2 + ","  + margin * 2 + ")")
      .data(colorMap)
      .enter() 
      .append("text")
      .text(function(d,i) { return d.name; })
      .attr("class", "small")
      .attr("y", (d,i) => margin * i + 19)
      .attr("x", margin * 1.2 + 20)
  }

  render() {
    return (
        <div className={this.props.name}>
          <b className="center"> Types of Services </b>
          <svg viewBox="0 0 300 200"></svg>
        </div>
    );
  }
}