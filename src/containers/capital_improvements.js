import React, { Component } from 'react';
import * as d3 from 'd3';
import Map from '../components/map.js';


export default class CapitalImprovement extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.state = {
        district_map: {},
        capital_improvement_data: {}
    }
  }
  
  componentDidMount() {
    this.loadData();
  }
  
  loadData() {
    d3.csv("https://information.stpaul.gov/api/views/c6jd-rwmu/rows.csv?accessType=DOWNLOAD", function(err, data) {
      if (err) {
        console.log(err);
      }
      console.log(data);
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