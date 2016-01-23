import React from 'react';

import TodoItem from 'components/todo-item';

export default React.createClass({
  render: function () {
    var todoItems = this.props.todos.map((todo, index) => {
      var handleClick = () => {
        this.props.handleTodoItemClick(index);
      }

      return (
        <TodoItem
          task={todo.task}
          done={todo.done}
          key={todo.task}
          handleClick={handleClick}
        />
      );
    });

    return (
      <div>{todoItems}</div>
    );
  }
});
