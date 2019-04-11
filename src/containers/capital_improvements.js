import React, { Component } from 'react';
import * as d3 from 'd3';
import Map from '../components/map.js';
import Legend from '../components/legend.js'


export default class CapitalImprovement extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.selectedYears = this.selectedYears.bind(this);
    this.state = {
        district_map: [],
        capital_improvement_data: [],
        selectedYear: []
    }
  }
  
  componentDidMount() {
    this.loadData();
  }
  
  componentDidUpdate() {
    
  }
  
  loadData() {
    const that = this;
    d3.csv("https://raw.githubusercontent.com/davimchun45/datasets/master/capital_budgets_improvements.csv").then(function(data) {
      that.setState({
        capital_improvement_data: data
      });
    });
    
    d3.json("https://information.stpaul.gov/api/geospatial/dq4n-yj8b?method=export&format=GeoJSON").then(function(data) {
      that.setState({
        district_map: data
      });
    });
  }
  
  selectedYears(extent) {
    this.setState({
      selectedYear: extent
    })
  }

  ready() {
    return this.state.district_map.length === undefined
      && this.state.capital_improvement_data.length !== 0;
  }
    
  render() {
    return (
      <div className="CapitalImprovement">
        { this.ready() ? (<Map geodata={this.state.district_map} data={this.state.capital_improvement_data} years={this.state.selectedYear} yearSelector={this.selectedYears}/>) : (<p className="loading"> Loading Map Data...</p>) }
        <div className="container-fluid hud-ui">
          <div className="row">
            <div className="col-3">
              <div className="row">
                <div className="col-12 infobox-container">
                  <div className="infobox infobox-hidden"></div>
                </div>
              </div>
            </div>
            <div className="col-6 spacer">
              <h1>St.Paul Capital Improvements</h1>
            </div> 
            <div className="col-3"> 
              { this.ready() ? <Legend data={this.state.capital_improvement_data} /> : "" }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
