"use client";
import { useStore } from "../../stores/useStore";

export default function Counter() {
  const { count, increase, decrease } = useStore();
  return (
    <div>
      <button onClick={decrease}>-</button>
      <span style={{ margin: "0 8px" }}>{count}</span>
      <button onClick={increase}>+</button>
    </div>
  );
}
