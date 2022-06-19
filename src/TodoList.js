import React from "react";

const TodoListElementDelete = (props) => {
  const [timer, setTimer] = React.useState(props.timer);
  let _timeoutRef = React.useRef();

  function onClickUndoDelete() {
    clearTimeout(_timeoutRef.current);
    setTimer(props.timer);
    props.onClickUndoDelete();
  }

  // function ToDoItem(props) {
  //   const [isDone, setIsDone] = useState(false);

  //   function () {
  //     setIsDone((preValur) => {
  //       return !preValur;
  //     });
  //   }handleClick

  React.useEffect(() => {
    if (props.enable) {
      _timeoutRef.current = setTimeout(() => {
        if (timer > 0) {
          setTimer(timer - 1);
        } else {
          props.onEndTimerAction();
        }
      }, 1000);
    }

    return () => clearTimeout(_timeoutRef.current);
  });

  return (
    <div className={`alert alert-danger ${props.enable ? "" : "hidden"}`}>
      You want to undo the action? {timer}
      <button
        type="button"
        className="btn btn-warning"
        onClick={onClickUndoDelete}
      >
        Undo
      </button>
    </div>
  );
};

class TodoListElement extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDeleted: this.props.item.isDeleted
    };
    this.onClickDelete = this.onClickDelete.bind(this);
    this.onClickUndoDelete = this.onClickUndoDelete.bind(this);
    this.onClickPermanentDelete = this.onClickPermanentDelete.bind(this);
    this.onClickComplete = this.onClickComplete.bind(this);
  }

  onClickDelete() {
    let index = parseInt(this.props.item.index);
    this.props.removeItem(index);
  }

  onClickUndoDelete() {
    let item = this.props.item;
    this.props.undoRemoveItem(item);
  }

  onClickPermanentDelete() {
    this.setState({
      isDeleted: true
    });
    //this.props.definitiveRemoveItem(index);
  }

  onClickComplete() {
    let index = parseInt(this.props.item.index);
    this.props.completeItem(index);
  }

  render() {
    let isCompletedClass = this.props.item.isCompleted
      ? "list-group-item-success"
      : "";

    const btnActionComplete = this.props.item.isCompleted ? (
      ""
    ) : (
      <button
        type="button"
        className="btn btn-success btn-sm"
        onClick={this.onClickComplete}
      >
        Complete
      </button>
    );

    const btnActionDelete = (
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={this.onClickDelete}
      >
        Delete
      </button>
    );

    isCompletedClass = this.state.isDeleted ? "hidden" : isCompletedClass;

    return (
      <li className={"list-group-item " + isCompletedClass}>
        <div className="clarfix">
          {this.props.item.value}
          <span className="float-right">
            {btnActionComplete}
            {btnActionDelete}
          </span>
        </div>
        <TodoListElementDelete
          index={this.props.item.index}
          timer={this.props.timer}
          enable={this.props.item.isBeingDeleted}
          onClickUndoDelete={this.onClickUndoDelete}
          onEndTimerAction={this.onClickPermanentDelete}
        />
      </li>
    );
  }
}

class TodoListForm extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(event) {
    event.preventDefault();
    var newItemValue = this.refs.itemName.value;

    if (newItemValue) {
      this.props.addItem({ newItemValue });
      this.refs.form.reset();
    }
  }

  render() {
    return (
      <form ref="form" onSubmit={this.onSubmit} className="form-inline">
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            ref="itemName"
            placeholder="Write todo item"
          />
          <div className="input-group-append">
            <button className="btn btn-success" type="submit">
              Add
            </button>
          </div>
        </div>
      </form>
    );
  }
}

export default class TodoList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      _lastIndex: 0,
      todoItems: [],
      undoRemoveItems: [],
      timer: 10
    };

    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.undoRemoveItem = this.undoRemoveItem.bind(this);
    this.definitiveRemoveItem = this.definitiveRemoveItem.bind(this);
    this.completeItem = this.completeItem.bind(this);
  }

  getNewIndex() {
    return this.state._lastIndex + 1;
  }

  addItem(todoItem) {
    const newTodoItem = {
      index: this.getNewIndex(),
      value: todoItem.newItemValue,
      isBeingDeleted: false,
      isDeleted: false,
      isCompleted: false
    };

    this.setState({
      todoItems: [...this.state.todoItems, newTodoItem],
      _lastIndex: newTodoItem.index
    });
  }

  removeItem(itemIndex) {
    let itemToBeDeleted = this.state.todoItems.find(
      (x) => x.index === itemIndex
    );
    if (itemToBeDeleted) {
      itemToBeDeleted.isBeingDeleted = true;
    }
    this.setState({ todoItems: this.state.todoItems });
  }

  definitiveRemoveItem(itemIndex) {
    console.log("definitiveRemoveItem", itemIndex);

    let todoItems = this.state.todoItems;
    let undoTodoItem = this.state.undoRemoveItems;
    let itemToBeDeleted = todoItems.find(
      (x) => x.index === itemIndex && x.isBeingDeleted
    );
    let itemInUndo = undoTodoItem.find((x) => x.index === itemIndex);
    if (itemToBeDeleted && itemInUndo == null) {
      todoItems = todoItems.filter((x) => x.index !== itemIndex);
    } else {
      undoTodoItem = undoTodoItem.filter((x) => x.index !== itemIndex);
    }
    this.setState({
      todoItems: todoItems,
      undoRemoveItems: undoTodoItem
    });
  }

  undoRemoveItem(item) {
    let todoItems = this.state.todoItems;
    let itemToBeDeleted = todoItems.find((x) => x.index === item.index);
    itemToBeDeleted.isBeingDeleted = false;
    this.setState({
      todoItems: todoItems
    });
  }

  completeItem(itemIndex) {
    let todoItems = this.state.todoItems;
    let itemComplete = todoItems.find((x) => x.index === itemIndex);
    itemComplete.isCompleted = true;
    this.setState({
      todoItems: todoItems
    });
  }

  render() {
    let items = this.state.todoItems.map((item, index) => {
      return (
        <TodoListElement
          key={index}
          item={item}
          timer={this.state.timer}
          completeItem={this.completeItem}
          removeItem={this.removeItem}
          undoRemoveItem={this.undoRemoveItem}
          definitiveRemoveItem={this.definitiveRemoveItem}
        />
      );
    });

    return (
      <div>
        <div className="container">
          <TodoListForm addItem={this.addItem} />
          <ul className="list-group"> {items} </ul>
        </div>
      </div>
    );
  }
}
