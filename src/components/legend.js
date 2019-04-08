import React, { Component } from 'react';

export default class Legend extends Component {
  constructor(props) {
    super(props);
    this.parseLegend = this.parseLegend.bind(this);
  }

  componentDidMount() {
  }

  parseLegend() {
    /* Get the letters we use for the points on the map.
     * TODO: Not the fastest way of doing this. Maybe compute
     * this only in the map? */
    let services = this.props.data
      .map(d => d.service)
      .reduce((a, c) => {
        if (c.toLowerCase() !== a[a.length - 1].toLowerCase()) {
          return a.push(c);
        } else {
          return a;
        }
      }, []);

    return services;
  }

  render() {
    return (
        <div className="Legend">
        </div>
    );
  }
}
