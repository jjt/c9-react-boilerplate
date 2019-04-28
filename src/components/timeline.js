import React, { Component } from 'react';
import * as d3 from 'd3';

export default class Timeline extends Component {
  constructor(props) {
    super(props);
    this.parseTimeLine = this.parseTimeLine.bind(this);
    this.timelineScale = this.timelineScale.bind(this);
  }

  componentDidMount() {
    this.timelineScale();
  }

  componentDidUpdate() {
    if (this.props.selectedYears.length === 0) {
      this.removeTimeline();
      this.timelineScale();
    }
  }

  parseTimeLine() {
    let timeLine = [
      {year:2004,service:'Community Facilities',amount:0},{year:2004,service:'Internal Service',amount:0},{year:2004,service:'Streets and Utilities',amount:0},{year:2004,service:'Residential and Economic Development',amount:0},{year:2005,service:'Community Facilities',amount:0},{year:2005,service:'Internal Service',amount:0},{year:2005,service:'Streets and Utilities',amount:0},{year:2005,service:'Residential and Economic Development',amount:0},{year:2006,service:'Community Facilities',amount:0},{year:2006,service:'Internal Service',amount:0},{year:2006,service:'Streets and Utilities',amount:0},{year:2006,service:'Residential and Economic Development',amount:0},{year:2007,service:'Community Facilities',amount:0},{year:2007,service:'Internal Service',amount:0},{year:2007,service:'Streets and Utilities',amount:0},{year:2007,service:'Residential and Economic Development',amount:0},{year:2008,service:'Community Facilities',amount:0},{year:2008,service:'Internal Service',amount:0},{year:2008,service:'Streets and Utilities',amount:0},{year:2008,service:'Residential and Economic Development',amount:0},{year:2009,service:'Community Facilities',amount:0},{year:2009,service:'Internal Service',amount:0},{year:2009,service:'Streets and Utilities',amount:0},{year:2010,service:'Residential and Economic Development',amount:0},{year:2010,service:'Community Facilities',amount:0},{year:2010,service:'Internal Service',amount:0},{year:2010,service:'Streets and Utilities',amount:0},{year:2011,service:'Residential and Economic Development',amount:0},{year:2011,service:'Community Facilities',amount:0},{year:2011,service:'Internal Service',amount:0},{year:2011,service:'Streets and Utilities',amount:0},{year:2011,service:'Residential and Economic Development',amount:0},{year:2012,service:'Community Facilities',amount:0},{year:2012,service:'Internal Service',amount:0},{year:2012,service:'Streets and Utilities',amount:0},{year:2012,service:'Residential and Economic Development',amount:0},{year:2013,service:'Community Facilities',amount:0},{year:2013,service:'Internal Service',amount:0},{year:2013,service:'Streets and Utilities',amount:0},{year:2013,service:'Residential and Economic Development',amount:0},{year:2014,service:'Community Facilities',amount:0},{year:2014,service:'Internal Service',amount:0},{year:2014,service:'Streets and Utilities',amount:0},{year:2014,service:'Residential and Economic Development',amount:0},{year:2015,service:'Community Facilities',amount:0},{year:2015,service:'Internal Service',amount:0},{year:2015,service:'Streets and Utilities',amount:0},{year:2015,service:'Residential and Economic Development',amount:0},{year:2016,service:'Community Facilities',amount:0},{year:2016,service:'Internal Service',amount:0},{year:2016,service:'Streets and Utilities',amount:0},{year:2016,service:'Residential and Economic Development',amount:0},{year:2017,service:'Community Facilities',amount:0},{year:2017,service:'Internal Service',amount:0},{year:2017,service:'Streets and Utilities',amount:0},{year:2017,service:'Residential and Economic Development',amount:0},{year:2018,service:'Community Facilities',amount:0},{year:2018,service:'Internal Service',amount:0},{year:2018,service:'Streets and Utilities',amount:0},{year:2018,service:'Residential and Economic Development',amount:0},{year:2019,service:'Community Facilities',amount:0},{year:2019,service:'Internal Service',amount:0},{year:2019,service:'Streets and Utilities',amount:0},{year:2019,service:'Residential and Economic Development',amount:0},
    ];
    for(let i = 0; i < this.props.data.length; i++) {
      let dataPoint = this.props.data[i];
      for (let c = 0; c < timeLine.length; c++) {
        if (timeLine[c].year === parseInt(dataPoint.year) && timeLine[c].service === dataPoint.service) {
          timeLine[c].amount += parseInt(dataPoint.amount);
        }
      }
    }
    return timeLine;
  }

  removeTimeline() {
    const svg = d3.select(".Timeline svg");
    svg.selectAll("g").remove();
  }

  timelineScale() {
    const that = this;
    const timeScale = d3.scaleLinear().domain([2004,2019]).range([0, 600]);
    const serviceScale =  d3.scaleOrdinal()
      .domain(['Community Facilities', 'Internal Service', 'Streets and Utilities', 'Residential and Economic Development'])
      .range([-15,-7.5,0,7.5])
    const timeData = this.parseTimeLine();
    const range = d3.extent(timeData, function(d){ return d.amount });
    const timeRange = d3.scaleLog().base(Math.E).domain(range).range([0, 100]);
    const improvementsScale = d3.scaleOrdinal()
      .domain(['Community Facilities', 'Internal Service', 'Streets and Utilities', 'Residential and Economic Development'])
      .range(['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c']);

    const axis = d3.axisBottom().scale(timeScale).tickFormat(d3.format("d"));
    const svg = d3.select(".Timeline svg");
    const new_g = svg.append("g").attr("transform", "translate(155,0)");
    
    new_g.append("g").attr("transform", "translate(0, 90)").call(axis);
    new_g.selectAll('rect')
      .data(timeData)
    .enter().append("rect")
      .attr('x', function(d) { return timeScale(d.year) + serviceScale(d.service)})
      .attr('y', function(d) { return (90-timeRange(d.amount)) })
      .attr('width', 7.5)
      .attr('height', function (d) { return timeRange(d.amount) })
      .attr('fill', function(d) { return improvementsScale(d.service)});

    const brush = d3.brushX().extent([[-20, 0], [620, 90]]).on("brush", function() {
        var extent = d3.event.selection.map(timeScale.invert, timeScale);
        extent[0] = parseInt(extent[0]);
        extent[1] = parseInt(extent[1]);
        that.props.yearSelector(extent);
    });

    new_g.attr("class", "brush").call(brush);
  }

  render() {
    return (
      <div className="Timeline">
       <svg viewBox="0 0 900 120" preserveAspectRatio="xMidYMax meet"/>
      </div>
    );
  }
}
