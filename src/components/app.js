require('normalize.css');
require('styles/app.css');

import React from 'react';

import AppHeader from 'components/app-header';
import TodoList from 'components/todo-list';
import TodoInput from 'components/todo-input';

export default React.createClass({
  getInitialState: function () {
    return {
      todos: [
        {
          task: 'Write a workshop on React.js',
          done: false
        },
        {
          task: 'Enter example todos',
          done: true
        }
      ]
    };
  },

  addTodo: function (task) {
    var newTodo = {
      task: task,
      done: false
    };

    this.setState({
      todos: [
        ...this.state.todos,
        newTodo
      ]
    });
  },

  handleTodoItemClick: function (index) {
    var todos = this.state.todos;
    todos[index].done = !todos[index].done;
    this.setState({todos: todos});
  },

  render: function () {
    return (
      <div className="app">
        <AppHeader title="JJT's Todos" tagline="Get 'em todone"/>
        <TodoList
          todos={this.state.todos}
          handleTodoItemClick={this.handleTodoItemClick}
        />
        <TodoInput onSubmit={this.addTodo}/>
      </div>
    );
  }
});
