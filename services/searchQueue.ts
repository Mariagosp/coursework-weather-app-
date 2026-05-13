interface QueueItem<T> {
  item: T;
  priority: number;
  insertedAt: number;
}

export class BiDirectionalPriorityQueue<T> {
  private items: QueueItem<T>[] = [];

  enqueue(item: T, priority: number) {
    this.items.push({
      item,
      priority,
      insertedAt: Date.now(),
    });
  }

  peek(type: "highest" | "lowest" | "oldest" | "newest") {
    if (this.items.length === 0) {
      return null;
    }

    switch (type) {
      case "highest":
        return [...this.items].sort(
          (a, b) => b.priority - a.priority
        )[0];

      case "lowest":
        return [...this.items].sort(
          (a, b) => a.priority - b.priority
        )[0];

      case "oldest":
        return this.items[0];

      case "newest":
        return this.items[this.items.length - 1];
    }
  }

  dequeue(type: "highest" | "lowest" | "oldest" | "newest") {
    const target = this.peek(type);

    if (!target) {
      return null;
    }

    this.items = this.items.filter(
      (i) => i.insertedAt !== target.insertedAt
    );

    return target;
  }
}