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
        .reduce((a, c) => {
          if (a.length === 0 ||
              c.toLowerCase() !== a[a.length - 1].toLowerCase()) {
            a.push(c);
          }
          return a;
        }, []);

    return services;
  }

  makeTable() {
    return this.services.map(s =>
                             <tr>
                              <td>{s.charAt(0)}</td>
                              <td>{s}</td>
                             </tr>);
  }

  render() {
    return (
        <div className="Legend">
         <table className="table">
          {this.makeTable()}
         </table>
        </div>
    );
  }
}
