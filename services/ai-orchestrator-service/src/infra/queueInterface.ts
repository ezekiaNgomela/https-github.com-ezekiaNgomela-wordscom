export interface Queue<T = any> {
  enqueue(task: T): void;
  dequeue(): T | undefined;
  size(): number;
}
