    
import React, { Component } from "react";
import * as d3 from "d3";


export default class HorizontalBarChart extends Component {
  constructor(props) {
    super(props);
    this.createGraph = this.createGraph.bind(this);
    this.destroyGraph = this.destroyGraph.bind(this);
  }

  componentDidMount() {
    if (this.exists(this.props.data) && this.props.data.length !== 0) {
      this.createGraph();
    } else {
      console.error("<HorizontalBoxPlot> Data inside of HorizontalBarChart is " + this.props.data)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.exists(this.props.data) && this.props.data.length !== 0) {
      if (prevProps.data !== this.props.data || prevProps.years !== this.props.years) {
        this.destroyGraph();
        this.createGraph();
      }
    }  
  }

  componentWillUnmount() {
    this.destroyGraph();
  }

  exists(obj) {
    return obj !== undefined && obj !== null;
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

  parseSum() {
    let deparmentAmount = [
        {name:"Parks and Recreation",value:0},{name:"General Government",value:0},{name:"Public Art",value:0},{name:"Public Works",value:0},{name:"Financial Services",value:0},{name:"Library",value:0},{name:"Fire & Safety Services",value:0},{name:"Safety and Inspections",value:0},{name:"Planning and Economic Development",value:0},{name:"Police",value:0}, {name:"Office of Technology",value:0}
    ]

    let deparmentKey = { 
        "Parks and Recreation": 0,
        "General Government": 1,
        "Public Art": 2,
        "Public Works": 3,
        "Financial Services": 4,
        "Library": 5,
        "Fire & Safety Services": 6,
        "Safety and Inspections": 7,
        "Planning and Economic Development": 8,
        "Police": 9,
        "Fire": 6,
        "Office of Technology": 10
    }
      const years = this.parseYearData(this.props.years);
      const financialData = (years !== undefined) ? years : this.props.data;
      for (let i = 0; i < financialData.length; i++) {
        let department = deparmentKey[financialData[i].department];

        if (department !== undefined && department !== null) {
            if (!isNaN(parseInt(financialData[i].amount))) {
                deparmentAmount[department].value += parseInt(financialData[i].amount);
            }
        }
      }

      deparmentAmount.sort(function(x,y){
        return d3.descending(x.value, y.value);
      });

      return deparmentAmount;
  }

  createGraph() {
    const svg = d3.select("." + this.props.name + " svg");
    const width = this.props.width;
    const height = this.props.height;
    const margin = 30;

    const departmentSum = this.parseSum(this.props.years);
    const departments = departmentSum.map(function(d) {
        return d.name;
    });
    // Scales
    const scaleLeft = d3.scalePoint()
      .domain(departments)
      .range([margin, height - (3 * margin)]);

    const scaleTop = d3.scaleLinear()
      .domain(d3.extent(departmentSum, function(d) {
        return d.value;
      }))
      .range([margin, width - (3 * margin)])
      .clamp(true);

    const colorScale = d3.scaleOrdinal()
      .domain(['Public Works', 'Parks and Recreation', 'Planning and Economic Development', 'Police', 'Fire & Safety Services', 'Library', 'General Government', 'Safety and Inspections', 'Financial Services', 'Office of Technology', 'Public Art'])
      .range(['#686c5e', '#b2df8a', '#33a02c', '#1f78b4', '#e31a1c', '#a6cee3', '#fdbf6f',  '#FF6700','#003366', '#ccc9c0', '#0f0f0f']);

    // Axis
    const axisLeft = d3.axisRight(scaleLeft);
    const axisTop = d3.axisBottom(scaleTop).ticks(6, "s");
    
    svg.append("g")
      .attr("transform", "translate(" + margin * 2 + ","  + margin / 2 + ")")
      .attr("class", "small")
      .call(axisLeft)
      .call(g => g.select(".domain").remove())
      .selectAll('text')
      .attr('dy', '-0.3em')
      .attr('dx', '-0.9em');

    svg.append("g")
      .attr("transform", "translate(" + margin + ","  + (height - 2 * margin) + ")")    
      .attr("class", "small")
      .call(axisTop);
    
    svg.append("g")
      .selectAll("g")
      .data(departmentSum)
      .enter()
      .append("rect")
      .attr("y", (d,i) => margin / 2 +  scaleLeft(departmentSum[i].name))
      .attr("x", margin * 2)
      .style("fill", (d,i) =>  { return colorScale(d.name); })
      .attr("width", (d,i) => scaleTop(departmentSum[i].value) - margin)
      .attr("height", 10);
    
    svg.append("text")
      .text("Capital Improvements by Department")
      .attr("class", "small b")
      .attr("y", 20)
      .attr("x", width / 4)
  }

  destroyGraph() {
    const svg = d3.select("." + this.props.name + " svg");
    svg.selectAll("*").remove();
  }

  render() {
    return (
      <div className={this.props.name}>
        <svg viewBox={"0 0 " + this.props.width + " " + this.props.height } preserveAspectRatio="xMidYMax meet"/>
      </div>
    );
  }
}