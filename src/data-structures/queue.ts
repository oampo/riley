export interface Queue<T> {
  length: number;
  enqueue(item: T): void;
  dequeue(): T | undefined;
}

export class QueueImpl<T> implements Queue<T> {
  length: number = 0;

  private arr: T[];
  private start: number = 0;
  private end: number = 0;

  constructor(private capacity: number = 8) {
    this.arr = new Array<T>(capacity);
  }

  enqueue(item: T): void {
    if (this.length === this.capacity) {
      const newCapacity = this.capacity * 2;
      const newArr = new Array<T>(newCapacity);

      // Copy elements over in correct order, resetting start to 0
      for (let i = 0; i < this.length; i++) {
        newArr[i] = this.arr[(this.start + i) % this.capacity];
      }

      this.arr = newArr;
      this.start = 0;
      this.end = this.length;
      this.capacity = newCapacity;
    }

    this.arr[this.end] = item;
    this.end = (this.end + 1) % this.capacity;
    this.length++;
  }

  dequeue(): T | undefined {
    if (this.length === 0) {
      return;
    }
    const item = this.arr[this.start];
    this.start = (this.start + 1) % this.capacity;
    this.length--;
    return item;
  }
}

export function queue<T>(capacity?: number): Queue<T> {
  return new QueueImpl<T>(capacity);
}
