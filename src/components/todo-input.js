import React from 'react';

export default React.createClass({
  getInitialState: function () {
    return {
      value: ''
    };
  },

  onChange: function (ev) {
    this.setState({value: ev.target.value});
  },

  onKeyDown: function (ev) {
    // 13 is the ENTER key
    if (ev.keyCode === 13) {
      this.props.onSubmit(this.state.value);
      this.setState({value: ''});
    }
  },

  render: function () {
    return (
      <input
        value={this.state.value}
        type="text"
        placeholder="Hit 'enter' to submit"
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
      />
    );
  }
});
