import React, { Component } from 'react';
import * as d3 from "d3";
import regression from 'regression';

export default class Legend extends Component {
  componentDidMount() {
    this.createLegend();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.changed !== prevProps.changed) {
      this.removeLegend();
      this.createLegend();
    }
  }

  removeLegend() {
    const svg = d3.select("." + this.props.name + " svg");
    svg.selectAll("g").remove();
  }

  createLegend() {
    const svg = d3.select("." + this.props.name + " svg");
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
    
    this.colorScale(svg);
  }

  districtChanged(data) {
    return data.reduce((a, c) => {
      let dists = c.district.split(",");
      for (let d of dists) {
        let i = Number(d);
        if (!isNaN(i) && Number(c.amount) > 0) {
          let pair = [Number(c.year), Number(c.amount)];
          if (a[i - 1] === undefined) {
            a[i - 1] = [pair];
          } else {
            a[i - 1].push(pair);
          }
        }
      }
      return a;
    }, []).map((vs, i) => {
      return {
        name: String(i + 1),
        value: regression.linear(vs).equation[0]
      };
    });
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

  colorScale(g) {
    const widthArr = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180];
    const years = this.parseYearData(this.props.years); 
    const data = (years !== undefined) ? years : this.props.data;
    const amountAllocated = this.props.changed ? this.districtChanged(data) : this.districtAllocated(data);
    
    const min_max = d3.extent(amountAllocated,
      d => (d !== undefined && d.name !== "Citywide") ?
      d.value : 0);
    
    if (!this.props.changed) {
      min_max[0] = 0;
    } else {
      min_max.splice(1, 0, 0);
    }

    let colors = this.props.changed ? ["#ca0020", "#f4a582", "#f7f7f7", "#92c5de", "#0571b0"] : ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"];
    const widthScale = d3.scaleLinear().domain([0, 45, 90, 135, 180]).range(colors);

    // Color Scale
    const colorScale =
          d3.scaleLinear().domain(min_max)
          .range(colors);

    g.append('g').selectAll("rect")
    .attr('class', 'cScale')
      .data(widthArr)
    .enter().append("rect")
    .attr("x", function(d,i) { return 50 + d })
    .attr("y", 135)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", function(d,i) {
      return widthScale(d);
    });
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