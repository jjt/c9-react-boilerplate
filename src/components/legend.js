import React, { Component } from 'react';

export default class Legend extends Component {
  constructor(props) {
    super(props);
    this.parseLegend = this.parseLegend.bind(this);
    this.services = this.parseLegend();
  }

  componentDidMount() {
  }

  parseLegend() {
    let services = this.props.data
        .map(d => d.service)
        .sort()
        .reduce((acc, svc) => {
          if (acc.length === 0 ||
              svc.toLowerCase() !== acc[acc.length - 1].toLowerCase()) {
            acc.push(svc);
          }
          return acc;
        }, []);

    return services;
  }

  makeIcon(letter) { 
    return (
        <svg width="30" height="30" viewBox="0 0 12 12">
         <circle className="legend-point" r="5" cx="6" cy="6" fill="white"/>
         <text className="legend-text" x="4" y="8">{letter}</text>
        </svg>
    );
  }

  makeTable() {
    return this.services.map(s =>
                             <tr>
                              <td>{this.makeIcon(s.charAt(0))}</td>
                              <td>{s}</td>
                             </tr>);
  }

  render() {
    return (
        <div className="Legend">
         <table className="table">
          <tbody>
           {this.makeTable()}
          </tbody>
         </table>
        </div>
    );
  }
}
