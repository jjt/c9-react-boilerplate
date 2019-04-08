import React, { Component } from 'react';

export default class Legend extends Component {
  constructor(props) {
    super(props);
    this.parseLegend = this.parseLegend.bind(this);
  }

  componentDidMount() {
    this.setupLegend();
  }

  parseLegend() {
    /* Get the letters we use for the points on the map.
     * TODO: Not the fastest way of doing this. Maybe compute
     * this only in the map? */
    let serviceIndicators = this.props.data
      .map(d => d.charAt(0))
      .reduce((a, c) => {
        if (c != a[a.length - 1]) {
          return a.push(c);
        } else {
          return a;
        }
      }, []);

    return serviceIndicators;
  }

  render() {
    return (
        <div className="Legend">
         <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMax meet"/>
        </div>
    );
  }
}
