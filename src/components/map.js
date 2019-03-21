import React, { Component } from 'react';
import * as d3 from 'd3';

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.createMap = this.createMap.bind(this);
     
  }
  
  // Type check for data types passed into map.js then create map if correct.  
  componentDidMount() {
    this.createMap(); 
  }

  createMap() {

  }
  
  render() {
    return (
      <div className="Map">
        <p> Map Loaded In </p>
      </div>
    );
  }
}