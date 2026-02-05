const TodoApp = {
    // 1. 초기 상태: 항상 비어있는 리스트로 시작 (파이썬: todos = [])
    todos: [],
    currentFilter: 'all',

    init() {
        this.displayCurrentDate();
        this.renderTodos(); // 첫 접속 시 빈 화면 렌더링
    },

    displayCurrentDate() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        document.getElementById('current-date').textContent = now.toLocaleDateString('ko-KR', options);
    },

    addTodo() {
        const input = document.getElementById('todo-input');
        const text = input.value.trim();
        if (!text) { alert('할 일을 입력해 주세요!'); return; }

        // 데이터 추가 (파이썬: todos.append({...}))
        this.todos.push({ id: Date.now(), text: text, completed: false });
        input.value = '';
        this.renderTodos();
    },

    toggleComplete(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.renderTodos();
        }
    },

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.renderTodos();
    },

    filterTodos(type, btn) {
        this.currentFilter = type;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderTodos();
    },

    renderTodos() {
        const container = document.getElementById('todo-list');

        // 필터링 처리
        let list = this.todos;
        if (this.currentFilter === 'active') list = this.todos.filter(t => !t.completed);
        if (this.currentFilter === 'completed') list = this.todos.filter(t => t.completed);

        if (list.length === 0) {
            container.innerHTML = `<div class="todo-item" style="justify-content: center; color: #999; height: 60px;">일정이 없습니다.</div>`;
        } else {
            container.innerHTML = list.map(todo => `
                <div class="todo-item">
                    <div class="todo-text" onclick="TodoApp.toggleComplete(${todo.id})" style="${todo.completed ? 'text-decoration: line-through; color: #bbb;' : ''}">
                        <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                        ${todo.text}
                    </div>
                    <button class="delete-btn" onclick="TodoApp.deleteTodo(${todo.id})">삭제</button>
                </div>
            `).join('');
        }
        this.updateStats();
    },

    updateStats() {
        const total = this.todos.length;
        const done = this.todos.filter(t => t.completed).length;
        document.getElementById('stats').innerHTML = `📊 전체 ${total} | 완료 ${done} | 남은 ${total - done}`;
    }
};

// 페이지 로드 시 앱 시작 (여기서 이전에 저장된 데이터를 불러오는 loadTodos()를 뺐습니다!)
document.addEventListener('DOMContentLoaded', () => {
    TodoApp.init();
    document.getElementById('todo-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') TodoApp.addTodo();
    });
});

// 전역 함수 연결
function addTodo() { TodoApp.addTodo(); }
function filterTodos(type, btn) { TodoApp.filterTodos(type, btn); }