import React from 'react';
import classnames from 'classnames';

export default React.createClass({
  render: function () {
    var className = classnames('todo-item', {'done': this.props.done});

    return (
      <div className={className} onClick={this.props.handleClick}>
        {this.props.task}
      </div>
    );
  }
});
