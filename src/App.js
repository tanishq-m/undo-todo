import TodoList from "./TodoList.js";

export default function App() {
  return (
    <div className="App">
      <h1 style={{ paddingTop: "50px" }}>Todo List </h1>
      <h2>With undo on timer</h2>
      <TodoList />
    </div>
  );
}
