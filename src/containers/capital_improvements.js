import React, { Component } from 'react';
import * as d3 from 'd3';
import Map from '../components/map.js';


export default class CapitalImprovement extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.state = {
        district_map: [],
        capital_improvement_data: []
    }
  }
  
  componentDidMount() {
    this.loadData();
  }
  
  componentDidUpdate() {
    console.log(this.state);
  }
  
  loadData() {
    const that = this;
    d3.csv("https://information.stpaul.gov/api/views/c6jd-rwmu/rows.csv?accessType=DOWNLOAD").then(function(data) {
      that.setState({
        capital_improvement_data: data
      });
    });
    
    d3.json("https://information.stpaul.gov/api/geospatial/dq4n-yj8b?method=export&format=GeoJSON").then(function(data) {
      that.setState({
        district_map: data
      })
    });
  }

    
  render() {
    return (
      <div className="CapitalImprovement">
        <h1> St.Paul Capital Improvements </h1>
        <Map/>
      </div>
    );
  }
}