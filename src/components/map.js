import React, { Component } from 'react';
import * as d3 from 'd3';
import L from 'leaflet';

import Timeline from './timeline.js';

const MAXZOOM = 15;
const MINZOOM = 13;
const STARTLOC = [44.94, -93.10];

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
      projection: undefined,
      showChange: false
    }
  }

  // Type check for data types passed into map.js then create map if correct.
  componentDidMount() {
    let osmMap =
        L.map("osm-map",
              {
                //dragging: false,
                zoomControl: false,
                boxZoom: false,
                doubleClickZoom: false,
                //scrollWheelZoom: false,
                zoomDelta: 0
              })
        .setView(STARTLOC, 13);

    /* TODO: Don't use OSM's tile server. It is not intended for this. */
    L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>.',
      minZoom: MINZOOM,
      maxZoom: MAXZOOM
    }).addTo(osmMap);

    let that = this;
    let zoom_handler = function() { that.updatePointPositions(); };
    osmMap.on("zoom", zoom_handler);
    this.osmMap = osmMap;

    this.createMap();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.years.length !== 0 && (this.props.years[0] !== prevProps.years[0] || this.props.years[1] !== prevProps.years[1])) {
      const years = this.parseYearData(this.props.years);
      if (this.state.currentLocation === "create") {
        this.destroyMap();
        this.createMap(years);
      } else {
        if (this.state.currentLocation === "select") {
          this.selectMap(this.state.portion, this.state.projection, this.props.years);
        }
        this.updateMap(years);
      }
    }
  }

  createMap(years) {
    L.geoJSON(this.props.geodata.features, {
      style: (feature) => {
        return {fillOpacity: 1}
      }
    }).addTo(this.osmMap);

    d3.select("#osm-map").selectAll("path")
      .classed("map-piece", true)
      .data(this.props.geodata.features);

    this.updateMap(years);
  }

  updatePointPositions() {
    let osmMap = this.osmMap;
    let g = d3.select("#osm-map").select('g');
    g.selectAll(".map-point")
      .attr("cx", (d, i) =>
            osmMap.latLngToLayerPoint({lat: d.latitude, lon: d.longitude}).x)
      .attr("cy", (d, i) =>
            osmMap.latLngToLayerPoint({lat: d.latitude, lon: d.longitude}).y)
      .attr("r", 10);
  }

  updateMap(years) {
    const that = this;
    const projection = d3.geoMercator().fitSize([800, 800], this.props.geodata);
    const data = (years !== undefined) ? years : this.props.data;
    const amountAllocated = this.districtAllocated(data);

    const min_max = d3.extent(amountAllocated, function(d) {
      if (d.name !== "Citywide") {
        return d.value;
      }
    })

    let colors = this.state.showChange ? ["red", "green"] : ["white", "blue"];
    const colorScale =
          d3.scaleLinear().domain([0,min_max[1]])
          .range(colors);

    d3.selectAll("#osm-map path")
      .on("click", function (d, i) {
        that.setState({ currentLocation: "select", portion: d, projection:projection });
        that.selectMap(d, projection, that.props.years);
        d3.select("body").on("keydown", function() {
          if (d3.event.key === "Escape") {
            d3.select(".infobox")
    	      .classed("infobox-hidden", true);
            that.unSelectMap();
            that.setState({ currentLocation: "update", portion: undefined, projection:undefined });
          }
        });
      })
      .attr('fill', function (d, i) {
        return colorScale(amountAllocated[i].value)
      });
  }

  unSelectMap() {
    d3.select(".Map svg g").selectAll('.map-point').remove();
    d3.select(".Map svg g").selectAll('.map-text').remove();
    d3.selectAll('path')
    .attr("opacity",function(d,i) {
      return 1;
    });

    this.osmMap.flyTo(STARTLOC, MINZOOM, {animate: true, duration: 0.25});
  }

  // Set other paths to lower opacity.
  selectMap(portion, projection, year) {
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
    const map = d3.select("#osm-map");
    let g = map.select('g');

    g.selectAll('.map-point').remove();
    g.selectAll('.map-text').remove();

    let osmMap = this.osmMap;
    g.selectAll('circle')
      .data(districtPoints)
      .enter().append('circle')
      .classed("map-point", true)
      .attr("r", 7.5)
      .attr("fill", function(d,i) {
        return improvementsScale(d.service);
      })
      .on("click", function(d, i) {
        infobox.html("<p> Title: " + d.title + "</p>" +
                     "<p> Department: " + d.department + "</p>" +
                     "<p> Amount: " + formatter.format(d.amount) + "</p>" +
                     "<p> District: " + d.district + "</p>" +
                     "<p> Year: " + d.year + "</p>" +
                     "<p> Location: " + d.location + "</p>" +
                     "<p> Description: " + d.description + "</p>")
          .classed("infobox-hidden", false);
        osmMap.panTo([d.latitude, d.longitude],
                     {animate: true});

      });
    this.updatePointPositions();
  }

  destroyMap() {
    d3.selectAll("#osm-map path").remove();
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
	<div id="osm-map"></div>
        <svg viewBox="0 0 900 800" preserveAspectRatio="xMidYMax meet"/>
        <Timeline data={this.props.data} yearSelector={this.props.yearSelector}/>
      </div>
    );
  }
}
