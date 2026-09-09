import { NgClass, NgFor } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface TodoItem {
  id: number;
  task: string;
  completed: boolean;
}

@Component({
  imports: [RouterOutlet, FormsModule, NgFor, NgClass],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  todoList = signal<TodoItem[]>([]);
  newTask: string = '';
  private apiUrl = 'http://localhost:3000/todos';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.http.get<TodoItem[]>(this.apiUrl).subscribe(data => {
      this.todoList.set(data);
    });
  }

  addTask(): void {
    if (this.newTask.trim() !== '') {
      const newTodoItem = {
        task: this.newTask,
        completed: false
      };
      this.http.post<TodoItem>(this.apiUrl, newTodoItem).subscribe(created => {
        this.todoList.update(list => [...list, created]);
        this.newTask = '';
      });
    }
  }

  toggleComplete(index: number): void {
    const item = this.todoList()[index];
    const updated = { ...item, completed: !item.completed };
    this.http.patch<TodoItem>(`${this.apiUrl}/${item.id}`, updated).subscribe(() => {
      this.todoList.update(list =>
        list.map((t, i) => i === index ? updated : t)
      );
    });
  }

  deleteTask(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.todoList.update(list => list.filter(item => item.id !== id));
    });
  }
}