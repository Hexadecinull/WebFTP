// Model Layer - FTP Repository

// TODO: The FtpRepositoryImpl below is a fully in-memory virtual filesystem used for
// demo/preview purposes only. Real protocol support (FTP, FTPS, SFTP, SMB, WebDAV)
// requires a backend proxy server (e.g. Node.js + basic-ftp / ssh2-sftp-client).
// See CONTRIBUTING.md for architecture notes on implementing real connections.

/* eslint-disable no-useless-escape */

import { FtpEntry, ConnectOptions, Session } from '@/types/ftp';

export type ProgressCallback = (loaded: number, total?: number) => void;

export interface FtpRepository {
  connect(options: ConnectOptions): Promise<Session>;
  list(session: Session, path: string): Promise<FtpEntry[]>;
  download(session: Session, remotePath: string, onProgress?: ProgressCallback): Promise<Blob>;
  upload(session: Session, remotePath: string, file: File, onProgress?: ProgressCallback): Promise<void>;
  rename(session: Session, oldPath: string, newPath: string): Promise<void>;
  delete(session: Session, path: string): Promise<void>;
  mkdir(session: Session, path: string): Promise<void>;
  readFile(session: Session, path: string): Promise<string>;
  writeFile(session: Session, path: string, content: string): Promise<void>;
  disconnect(session: Session): Promise<void>;
}

interface VFSNode {
  name: string;
  isDirectory: boolean;
  content?: string;
  size?: number;
  permissions: string;
  modifiedAt: string;
  children?: Map<string, VFSNode>;
}

function mkDir(name: string, children?: Map<string, VFSNode>): VFSNode {
  return {
    name,
    isDirectory: true,
    permissions: 'rwxr-xr-x',
    modifiedAt: new Date().toISOString(),
    children: children ?? new Map(),
  };
}

function mkFile(name: string, content: string, permissions = 'rw-r--r--'): VFSNode {
  return {
    name,
    isDirectory: false,
    content,
    size: new TextEncoder().encode(content).length,
    permissions,
    modifiedAt: new Date().toISOString(),
  };
}

// Sample file contents for many languages
const SAMPLE_FILES: Record<string, string> = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello World</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <h1>Hello, World!</h1>
    <p>This is a sample HTML page.</p>
  </div>
  <script src="app.js"></script>
</body>
</html>`,

  'styles.css': `/* Global Styles */
:root {
  --primary: #3b82f6;
  --bg: #0f172a;
  --text: #e2e8f0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

#app {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}

h1 {
  color: var(--primary);
  margin-bottom: 1rem;
}`,

  'app.js': `// Main application entry point
'use strict';

class App {
  constructor() {
    this.name = 'WebFTP Demo';
    this.version = '1.0.0';
    this.init();
  }

  init() {
    console.log(\`\${this.name} v\${this.version} initialized\`);
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      const app = document.getElementById('app');
      if (app) {
        app.addEventListener('click', this.handleClick.bind(this));
      }
    });
  }

  handleClick(event) {
    console.log('Clicked:', event.target.tagName);
  }
}

const app = new App();
export default app;`,

  'app.ts': `// TypeScript application module
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

class UserService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    const response = await fetch(\`\${this.baseUrl}/users/\${id}\`);
    return response.json();
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await fetch(\`\${this.baseUrl}/users\`);
    return response.json();
  }
}

export { UserService, User, ApiResponse };`,

  'component.tsx': `// React Component with TypeScript
import React, { useState, useEffect } from 'react';

interface Props {
  title: string;
  items: string[];
  onSelect: (item: string) => void;
}

const ItemList: React.FC<Props> = ({ title, items, onSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSelect = (item: string) => {
    setSelected(item);
    onSelect(item);
  };

  return (
    <div className="item-list">
      <h2>{title}</h2>
      <input
        type="text"
        placeholder="Filter items..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <ul>
        {filteredItems.map(item => (
          <li
            key={item}
            className={item === selected ? 'active' : ''}
            onClick={() => handleSelect(item)}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ItemList;`,

  'component.jsx': `// React JSX Component
import React, { useState } from 'react';

function Counter({ initialCount = 0, step = 1 }) {
  const [count, setCount] = useState(initialCount);

  return (
    <div className="counter">
      <h3>Counter: {count}</h3>
      <div className="buttons">
        <button onClick={() => setCount(c => c - step)}>-{step}</button>
        <button onClick={() => setCount(initialCount)}>Reset</button>
        <button onClick={() => setCount(c => c + step)}>+{step}</button>
      </div>
    </div>
  );
}

export default Counter;`,

  'server.py': `#!/usr/bin/env python3
"""Simple HTTP server with REST API."""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from datetime import datetime

class APIHandler(BaseHTTPRequestHandler):
    """Handle API requests."""

    data_store = {
        "users": [
            {"id": 1, "name": "Alice", "email": "alice@example.com"},
            {"id": 2, "name": "Bob", "email": "bob@example.com"},
        ]
    }

    def do_GET(self):
        if self.path == "/api/users":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(self.data_store["users"]).encode())
        elif self.path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            response = {"status": "ok", "timestamp": datetime.now().isoformat()}
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_error(404, "Not found")

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(content_length))
        body["id"] = len(self.data_store["users"]) + 1
        self.data_store["users"].append(body)
        self.send_response(201)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8080), APIHandler)
    print("Server running on http://0.0.0.0:8080")
    server.serve_forever()`,

  'main.go': `package main

import (
\t"encoding/json"
\t"fmt"
\t"log"
\t"net/http"
\t"sync"
)

type Task struct {
\tID     int    \`json:"id"\`
\tTitle  string \`json:"title"\`
\tDone   bool   \`json:"done"\`
}

type TaskStore struct {
\tmu    sync.RWMutex
\ttasks []Task
\tnextID int
}

func NewTaskStore() *TaskStore {
\treturn &TaskStore{nextID: 1}
}

func (s *TaskStore) Add(title string) Task {
\ts.mu.Lock()
\tdefer s.mu.Unlock()
\ttask := Task{ID: s.nextID, Title: title}
\ts.nextID++
\ts.tasks = append(s.tasks, task)
\treturn task
}

func (s *TaskStore) List() []Task {
\ts.mu.RLock()
\tdefer s.mu.RUnlock()
\treturn s.tasks
}

func main() {
\tstore := NewTaskStore()
\tstore.Add("Learn Go")
\tstore.Add("Build a REST API")

\thttp.HandleFunc("/tasks", func(w http.ResponseWriter, r *http.Request) {
\t\tw.Header().Set("Content-Type", "application/json")
\t\tjson.NewEncoder(w).Encode(store.List())
\t})

\tfmt.Println("Server listening on :8080")
\tlog.Fatal(http.ListenAndServe(":8080", nil))
}`,

  'Main.java': `package com.example;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    record Person(String name, int age, String city) {}

    public static void main(String[] args) {
        List<Person> people = new ArrayList<>(List.of(
            new Person("Alice", 30, "New York"),
            new Person("Bob", 25, "London"),
            new Person("Charlie", 35, "Tokyo"),
            new Person("Diana", 28, "Paris")
        ));

        // Filter and transform
        List<String> names = people.stream()
            .filter(p -> p.age() >= 28)
            .sorted((a, b) -> a.name().compareTo(b.name()))
            .map(Person::name)
            .collect(Collectors.toList());

        System.out.println("People aged 28+: " + names);

        // Group by city
        var byCity = people.stream()
            .collect(Collectors.groupingBy(Person::city));

        byCity.forEach((city, residents) ->
            System.out.printf("%s: %s%n", city,
                residents.stream().map(Person::name).collect(Collectors.joining(", ")))
        );
    }
}`,

  'Program.cs': `using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebFTPDemo
{
    public record Product(string Name, decimal Price, string Category);

    public class ProductService
    {
        private readonly List<Product> _products = new()
        {
            new("Laptop", 999.99m, "Electronics"),
            new("Headphones", 79.99m, "Electronics"),
            new("Coffee Maker", 49.99m, "Kitchen"),
            new("Desk Chair", 299.99m, "Furniture"),
        };

        public IEnumerable<Product> GetByCategory(string category) =>
            _products.Where(p => p.Category == category)
                     .OrderBy(p => p.Price);

        public decimal GetTotal() => _products.Sum(p => p.Price);
    }

    class Program
    {
        static async Task Main(string[] args)
        {
            var service = new ProductService();

            Console.WriteLine("Electronics:");
            foreach (var product in service.GetByCategory("Electronics"))
            {
                Console.WriteLine("  " + product.Name + ": $" + product.Price);
            }

            Console.WriteLine("Total inventory value: $" + service.GetTotal());
            await Task.Delay(100);
        }
    }
}`,

  'main.rs': `use std::collections::HashMap;

#[derive(Debug, Clone)]
struct Config {
    host: String,
    port: u16,
    options: HashMap<String, String>,
}

impl Config {
    fn new(host: &str, port: u16) -> Self {
        Config {
            host: host.to_string(),
            port,
            options: HashMap::new(),
        }
    }

    fn set_option(&mut self, key: &str, value: &str) {
        self.options.insert(key.to_string(), value.to_string());
    }
}

fn fibonacci(n: u64) -> Vec<u64> {
    let mut fib = vec![0, 1];
    for i in 2..n as usize {
        let next = fib[i - 1] + fib[i - 2];
        fib.push(next);
    }
    fib
}

fn main() {
    let mut config = Config::new("localhost", 8080);
    config.set_option("timeout", "30");
    config.set_option("retries", "3");

    println!("Config: {:?}", config);
    println!("Fibonacci(10): {:?}", fibonacci(10));
}`,

  'script.rb': `#!/usr/bin/env ruby
# frozen_string_literal: true

# A simple task manager in Ruby
class TaskManager
  attr_reader :tasks

  def initialize
    @tasks = []
    @next_id = 1
  end

  def add(title, priority: :normal)
    task = { id: @next_id, title: title, priority: priority, done: false, created_at: Time.now }
    @next_id += 1
    @tasks << task
    task
  end

  def complete(id)
    task = @tasks.find { |t| t[:id] == id }
    raise "Task ##{id} not found" unless task
    task[:done] = true
    task[:completed_at] = Time.now
    task
  end

  def pending
    @tasks.reject { |t| t[:done] }
           .sort_by { |t| [:high, :normal, :low].index(t[:priority]) }
  end

  def summary
    total = @tasks.size
    done = @tasks.count { |t| t[:done] }
    "Tasks: #{done}/#{total} completed"
  end
end

manager = TaskManager.new
manager.add("Set up Ruby environment", priority: :high)
manager.add("Write unit tests", priority: :normal)
manager.add("Update docs", priority: :low)
manager.complete(1)

puts manager.summary
manager.pending.each { |t| puts "  [#{t[:priority]}] #{t[:title]}" }`,

  'main.php': `<?php
declare(strict_types=1);

namespace App;

class Router
{
    private array $routes = [];

    public function get(string $path, callable $handler): self
    {
        $this->routes['GET'][$path] = $handler;
        return $this;
    }

    public function post(string $path, callable $handler): self
    {
        $this->routes['POST'][$path] = $handler;
        return $this;
    }

    public function dispatch(string $method, string $path): mixed
    {
        $handler = $this->routes[$method][$path] ?? null;

        if ($handler === null) {
            http_response_code(404);
            return ['error' => 'Not found'];
        }

        return $handler();
    }
}

// Usage
$router = new Router();

$router->get('/api/status', fn() => [
    'status' => 'running',
    'php_version' => PHP_VERSION,
    'time' => date('c'),
]);

$router->get('/api/users', fn() => [
    ['id' => 1, 'name' => 'Alice'],
    ['id' => 2, 'name' => 'Bob'],
]);

header('Content-Type: application/json');
echo json_encode($router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']));`,

  'query.sql': `-- Database schema and sample queries
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active   BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS posts (
    id          SERIAL PRIMARY KEY,
    author_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    body        TEXT,
    published   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_published ON posts(published) WHERE published = TRUE;

-- Get top authors by post count
SELECT u.username, COUNT(p.id) AS post_count
FROM users u
JOIN posts p ON p.author_id = u.id
WHERE p.published = TRUE
GROUP BY u.username
ORDER BY post_count DESC
LIMIT 10;`,

  'Dockerfile': `# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system app && adduser --system --ingroup app app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]`,

  'config.yaml': `# Application Configuration
app:
  name: WebFTP Demo
  version: 1.0.0
  environment: production

server:
  host: 0.0.0.0
  port: 8080
  cors:
    origins:
      - https://example.com
      - https://app.example.com
    methods: [GET, POST, PUT, DELETE]

database:
  host: localhost
  port: 5432
  name: webftp_db
  pool:
    min: 5
    max: 20
    idle_timeout: 30s

logging:
  level: info
  format: json
  output: stdout

cache:
  driver: redis
  host: localhost
  port: 6379
  ttl: 3600`,

  'package.json': `{
  "name": "webftp-demo-project",
  "version": "2.0.0",
  "description": "A full-stack demo project",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc && vite build",
    "start": "node dist/server.js",
    "test": "vitest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "eslint": "^8.55.0"
  }
}`,

  'README.md': `# WebFTP Sample Project

A collection of sample files demonstrating various programming languages and configurations.

## Structure

\`\`\`
├── src/           # Source files (JS, TS, JSX, TSX)
├── backend/       # Server-side code (Python, Go, Java, C#, Rust, Ruby, PHP)
├── config/        # Configuration files (YAML, JSON, TOML, Dockerfile)
├── database/      # SQL scripts and schemas
├── styles/        # CSS and SCSS stylesheets
├── scripts/       # Shell and utility scripts
└── docs/          # Documentation (Markdown)
\`\`\`

## Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Start the dev server: \`npm run dev\`

## Languages Included

JavaScript, TypeScript, JSX, TSX, Python, Go, Java, C#, Rust, Ruby, PHP, SQL, CSS, SCSS, HTML, Markdown, YAML, TOML, Dockerfile, Shell scripts, and more.

## License

MIT License - see [LICENSE](LICENSE) for details.`,

  'setup.sh': `#!/bin/bash
set -euo pipefail

# Project setup script
echo "=== Setting up project ==="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js required"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "Git required"; exit 1; }

NODE_VERSION=$(node --version)
echo "Node.js version: $NODE_VERSION"

# Install dependencies
echo "Installing dependencies..."
npm ci

# Setup environment
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

# Run database migrations
echo "Running migrations..."
npm run db:migrate

# Build project
echo "Building project..."
npm run build

echo "=== Setup complete ===\"""`,

  'theme.scss': `// SCSS Theme with variables, mixins, and nesting
$colors: (
  primary: #3b82f6,
  secondary: #8b5cf6,
  success: #22c55e,
  danger: #ef4444,
  warning: #f59e0b,
);

@mixin flex-center($direction: row) {
  display: flex;
  flex-direction: $direction;
  align-items: center;
  justify-content: center;
}

@mixin responsive($breakpoint) {
  @if $breakpoint == mobile { @media (max-width: 640px) { @content; } }
  @else if $breakpoint == tablet { @media (max-width: 1024px) { @content; } }
  @else if $breakpoint == desktop { @media (min-width: 1025px) { @content; } }
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  &__header {
    @include flex-center;
    margin-bottom: 1rem;
    gap: 0.5rem;
  }

  &__body {
    color: #475569;
    line-height: 1.7;
  }

  @include responsive(mobile) {
    padding: 1rem;
  }
}`,

  'config.toml': `# TOML Configuration
[project]
name = "webftp-demo"
version = "1.0.0"
authors = ["WebFTP Team"]

[server]
host = "0.0.0.0"
port = 8080
workers = 4
keep_alive = 30

[database]
url = "postgres://localhost:5432/demo"
max_connections = 20
timeout = 30

[logging]
level = "info"
file = "/var/log/app.log"
rotate = true
max_size = "100MB"

[features]
dark_mode = true
file_preview = true
drag_and_drop = true`,

  'test.spec.ts': `import { describe, it, expect, vi, beforeEach } from 'vitest';

interface Calculator {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
  multiply(a: number, b: number): number;
  divide(a: number, b: number): number;
}

class BasicCalculator implements Calculator {
  add(a: number, b: number): number { return a + b; }
  subtract(a: number, b: number): number { return a - b; }
  multiply(a: number, b: number): number { return a * b; }
  divide(a: number, b: number): number {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }
}

describe('Calculator', () => {
  let calc: BasicCalculator;

  beforeEach(() => {
    calc = new BasicCalculator();
  });

  it('should add two numbers', () => {
    expect(calc.add(2, 3)).toBe(5);
    expect(calc.add(-1, 1)).toBe(0);
  });

  it('should subtract two numbers', () => {
    expect(calc.subtract(5, 3)).toBe(2);
  });

  it('should multiply two numbers', () => {
    expect(calc.multiply(4, 3)).toBe(12);
  });

  it('should throw on division by zero', () => {
    expect(() => calc.divide(10, 0)).toThrow('Division by zero');
  });

  it('should divide correctly', () => {
    expect(calc.divide(10, 2)).toBe(5);
  });
});`,

  'main.kt': `// Kotlin data classes and coroutines
data class User(val name: String, val age: Int, val email: String)

sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

fun <T> Result<T>.getOrNull(): T? = when (this) {
    is Result.Success -> data
    else -> null
}

class UserRepository {
    private val users = mutableListOf(
        User("Alice", 30, "alice@example.com"),
        User("Bob", 25, "bob@example.com"),
    )

    fun findByName(name: String): Result<User> {
        val user = users.find { it.name.equals(name, ignoreCase = true) }
        return if (user != null) Result.Success(user) else Result.Error("User not found")
    }

    fun add(user: User): Result<User> {
        users.add(user)
        return Result.Success(user)
    }

    fun getAll(): List<User> = users.toList()
}

fun main() {
    val repo = UserRepository()
    
    when (val result = repo.findByName("Alice")) {
        is Result.Success -> println("Found: \${result.data}")
        is Result.Error -> println("Error: \${result.message}")
        is Result.Loading -> println("Loading...")
    }
    
    println("All users: \${repo.getAll()}")
}`,

  'app.swift': `import Foundation

// Swift structs, protocols, and enums
protocol Describable {
    var description: String { get }
}

enum Priority: Comparable, Describable {
    case low, medium, high, critical
    
    var description: String {
        switch self {
        case .low: return "Low"
        case .medium: return "Medium"
        case .high: return "High"
        case .critical: return "Critical"
        }
    }
}

struct Task: Describable {
    let id: UUID
    var title: String
    var priority: Priority
    var isComplete: Bool
    let createdAt: Date
    
    var description: String {
        let status = isComplete ? "✓" : "○"
        return "\\(status) [\\(priority.description)] \\(title)"
    }
}

class TaskManager {
    private var tasks: [Task] = []
    
    func add(_ title: String, priority: Priority = .medium) -> Task {
        let task = Task(id: UUID(), title: title, priority: priority, isComplete: false, createdAt: Date())
        tasks.append(task)
        return task
    }
    
    func pending() -> [Task] {
        tasks.filter { !$0.isComplete }.sorted { $0.priority > $1.priority }
    }
}

let manager = TaskManager()
manager.add("Design UI", priority: .high)
manager.add("Write tests", priority: .medium)
manager.add("Deploy", priority: .critical)

for task in manager.pending() {
    print(task.description)
}`,

  '.env.example': `# Environment Variables
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
DATABASE_POOL_SIZE=10

# Auth
JWT_SECRET=change-me-in-production
SESSION_TIMEOUT=3600

# External APIs
API_KEY=your-api-key-here
WEBHOOK_URL=https://hooks.example.com/webhook`,

  '.gitignore': `# Dependencies
node_modules/
vendor/

# Build output
dist/
build/
*.o
*.exe

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Coverage
coverage/
.nyc_output/`,

  'nginx.conf': `# Nginx configuration
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile    on;
    tcp_nopush  on;
    keepalive_timeout 65;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    server {
        listen 80;
        server_name example.com;

        root /var/www/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://localhost:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location ~* \\.(jpg|jpeg|png|gif|ico|css|js)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
}`,

  'Makefile': `# Makefile for the project
.PHONY: all build run test clean

APP_NAME := webftp
VERSION := $(shell git describe --tags --always)
BUILD_DIR := ./build

all: build

build:
\t@echo "Building $(APP_NAME) $(VERSION)..."
\tgo build -ldflags "-X main.Version=$(VERSION)" -o $(BUILD_DIR)/$(APP_NAME) ./cmd/

run: build
\t$(BUILD_DIR)/$(APP_NAME)

test:
\tgo test -v -race ./...

clean:
\trm -rf $(BUILD_DIR)

docker:
\tdocker build -t $(APP_NAME):$(VERSION) .

lint:
\tgolangci-lint run ./...`,

  'LICENSE': `MIT License

Copyright (c) 2026 WebFTP

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`,
};

function buildInitialFS(): VFSNode {
  const root = mkDir('');

  // /src folder
  const src = mkDir('src');
  src.children!.set('app.js', mkFile('app.js', SAMPLE_FILES['app.js']));
  src.children!.set('app.ts', mkFile('app.ts', SAMPLE_FILES['app.ts']));
  src.children!.set('component.tsx', mkFile('component.tsx', SAMPLE_FILES['component.tsx']));
  src.children!.set('component.jsx', mkFile('component.jsx', SAMPLE_FILES['component.jsx']));
  src.children!.set('index.html', mkFile('index.html', SAMPLE_FILES['index.html']));
  src.children!.set('test.spec.ts', mkFile('test.spec.ts', SAMPLE_FILES['test.spec.ts']));
  root.children!.set('src', src);

  // /styles folder
  const styles = mkDir('styles');
  styles.children!.set('styles.css', mkFile('styles.css', SAMPLE_FILES['styles.css']));
  styles.children!.set('theme.scss', mkFile('theme.scss', SAMPLE_FILES['theme.scss']));
  root.children!.set('styles', styles);

  // /backend folder
  const backend = mkDir('backend');
  backend.children!.set('server.py', mkFile('server.py', SAMPLE_FILES['server.py'], 'rwxr-xr-x'));
  backend.children!.set('main.go', mkFile('main.go', SAMPLE_FILES['main.go']));
  backend.children!.set('Main.java', mkFile('Main.java', SAMPLE_FILES['Main.java']));
  backend.children!.set('Program.cs', mkFile('Program.cs', SAMPLE_FILES['Program.cs']));
  backend.children!.set('main.rs', mkFile('main.rs', SAMPLE_FILES['main.rs']));
  backend.children!.set('script.rb', mkFile('script.rb', SAMPLE_FILES['script.rb'], 'rwxr-xr-x'));
  backend.children!.set('main.php', mkFile('main.php', SAMPLE_FILES['main.php']));
  backend.children!.set('main.kt', mkFile('main.kt', SAMPLE_FILES['main.kt']));
  backend.children!.set('app.swift', mkFile('app.swift', SAMPLE_FILES['app.swift']));
  root.children!.set('backend', backend);

  // /config folder
  const config = mkDir('config');
  config.children!.set('config.yaml', mkFile('config.yaml', SAMPLE_FILES['config.yaml']));
  config.children!.set('config.toml', mkFile('config.toml', SAMPLE_FILES['config.toml']));
  config.children!.set('Dockerfile', mkFile('Dockerfile', SAMPLE_FILES['Dockerfile']));
  config.children!.set('nginx.conf', mkFile('nginx.conf', SAMPLE_FILES['nginx.conf']));
  root.children!.set('config', config);

  // /database folder
  const database = mkDir('database');
  database.children!.set('query.sql', mkFile('query.sql', SAMPLE_FILES['query.sql']));
  root.children!.set('database', database);

  // /scripts folder
  const scripts = mkDir('scripts');
  scripts.children!.set('setup.sh', mkFile('setup.sh', SAMPLE_FILES['setup.sh'], 'rwxr-xr-x'));
  scripts.children!.set('Makefile', mkFile('Makefile', SAMPLE_FILES['Makefile']));
  root.children!.set('scripts', scripts);

  // /docs folder
  const docs = mkDir('docs');
  docs.children!.set('README.md', mkFile('README.md', SAMPLE_FILES['README.md']));
  docs.children!.set('LICENSE', mkFile('LICENSE', SAMPLE_FILES['LICENSE']));
  root.children!.set('docs', docs);

  // Root files
  root.children!.set('package.json', mkFile('package.json', SAMPLE_FILES['package.json']));
  root.children!.set('.env.example', mkFile('.env.example', SAMPLE_FILES['.env.example']));
  root.children!.set('.gitignore', mkFile('.gitignore', SAMPLE_FILES['.gitignore']));
  root.children!.set('README.md', mkFile('README.md', SAMPLE_FILES['README.md']));

  return root;
}

// Normalize paths to avoid double slashes and trailing slashes
function normalizePath(p: string): string {
  return ('/' + p).replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

// Resolve a node from the VFS tree given an absolute path
function resolveNode(root: VFSNode, path: string): VFSNode | null {
  const normalized = normalizePath(path);
  if (normalized === '/') return root;

  const parts = normalized.split('/').filter(Boolean);
  let current = root;

  for (const part of parts) {
    if (!current.isDirectory || !current.children) return null;
    const child = current.children.get(part);
    if (!child) return null;
    current = child;
  }

  return current;
}

// Resolve parent node and return [parentNode, childName]
function resolveParent(root: VFSNode, path: string): [VFSNode | null, string] {
  const normalized = normalizePath(path);
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length === 0) return [null, ''];

  const childName = parts.pop()!;
  const parentPath = '/' + parts.join('/');
  const parent = resolveNode(root, parentPath);

  return [parent, childName];
}

export class FtpRepositoryImpl implements FtpRepository {
  private sessions: Map<string, Session> = new Map();
  private fileSystems: Map<string, VFSNode> = new Map();

  async connect(options: ConnectOptions): Promise<Session> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const session: Session = {
      id: Math.random().toString(36).substring(7),
      host: options.host,
      connected: true,
      currentPath: '/',
    };

    this.sessions.set(session.id, session);
    this.fileSystems.set(session.id, buildInitialFS());
    return session;
  }

  private getFS(session: Session): VFSNode {
    let fs = this.fileSystems.get(session.id);
    if (!fs) {
      fs = buildInitialFS();
      this.fileSystems.set(session.id, fs);
    }
    return fs;
  }

  async list(session: Session, path: string): Promise<FtpEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const root = this.getFS(session);
    const node = resolveNode(root, path);

    if (!node || !node.isDirectory || !node.children) {
      throw new Error(`Directory not found: ${path}`);
    }

    const normalized = normalizePath(path);
    const entries: FtpEntry[] = [];

    // Add parent directory entry
    if (normalized !== '/') {
      const parentPath = normalized.split('/').slice(0, -1).join('/') || '/';
      entries.push({
        name: '..',
        path: parentPath,
        isDirectory: true,
      });
    }

    // Add children
    for (const [name, child] of node.children) {
      entries.push({
        name,
        path: normalizePath(`${normalized}/${name}`),
        isDirectory: child.isDirectory,
        size: child.isDirectory ? undefined : child.size,
        modifiedAt: child.modifiedAt,
        permissions: child.permissions,
      });
    }

    // Sort: directories first, then alphabetical
    entries.sort((a, b) => {
      if (a.name === '..') return -1;
      if (b.name === '..') return 1;
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return entries;
  }

  async download(session: Session, remotePath: string, onProgress?: ProgressCallback): Promise<Blob> {
    const content = await this.readFile(session, remotePath);
    const encoded = new TextEncoder().encode(content);
    const total = encoded.length;
    const steps = 10;

    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      onProgress?.(Math.min((i / steps) * total, total), total);
    }

    return new Blob([content], { type: 'application/octet-stream' });
  }

  async upload(session: Session, remotePath: string, file: File, onProgress?: ProgressCallback): Promise<void> {
    const total = file.size;
    const steps = 10;

    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      onProgress?.(Math.min((i / steps) * total, total), total);
    }

    // Actually store the uploaded file
    const content = await file.text();
    await this.writeFile(session, remotePath, content);
  }

  async rename(session: Session, oldPath: string, newPath: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 150));

    const root = this.getFS(session);
    const [oldParent, oldName] = resolveParent(root, oldPath);
    const [newParent, newName] = resolveParent(root, newPath);

    if (!oldParent?.isDirectory || !oldParent.children || !oldParent.children.has(oldName)) {
      throw new Error(`Source not found: ${oldPath}`);
    }
    if (!newParent?.isDirectory || !newParent.children) {
      throw new Error(`Destination directory not found`);
    }

    const node = oldParent.children.get(oldName)!;
    node.name = newName;
    node.modifiedAt = new Date().toISOString();
    oldParent.children.delete(oldName);
    newParent.children.set(newName, node);
  }

  async delete(session: Session, path: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 150));

    const root = this.getFS(session);
    const [parent, name] = resolveParent(root, path);

    if (!parent?.isDirectory || !parent.children || !parent.children.has(name)) {
      throw new Error(`Not found: ${path}`);
    }

    parent.children.delete(name);
  }

  async mkdir(session: Session, path: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 150));

    const root = this.getFS(session);
    const [parent, name] = resolveParent(root, path);

    if (!parent?.isDirectory || !parent.children) {
      throw new Error(`Parent directory not found`);
    }
    if (parent.children.has(name)) {
      throw new Error(`Already exists: ${name}`);
    }

    parent.children.set(name, mkDir(name));
  }

  async readFile(session: Session, path: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 150));

    const root = this.getFS(session);
    const node = resolveNode(root, path);

    if (!node) throw new Error(`File not found: ${path}`);
    if (node.isDirectory) throw new Error(`Cannot read a directory: ${path}`);

    return node.content ?? '';
  }

  async writeFile(session: Session, path: string, content: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 150));

    const root = this.getFS(session);
    const node = resolveNode(root, path);

    if (node && !node.isDirectory) {
      // Update existing file
      node.content = content;
      node.size = new TextEncoder().encode(content).length;
      node.modifiedAt = new Date().toISOString();
      return;
    }

    // Create new file
    const [parent, name] = resolveParent(root, path);
    if (!parent?.isDirectory || !parent.children) {
      throw new Error(`Parent directory not found`);
    }

    parent.children.set(name, mkFile(name, content));
  }

  async disconnect(session: Session): Promise<void> {
    this.sessions.delete(session.id);
    this.fileSystems.delete(session.id);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
