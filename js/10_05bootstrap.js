 class TodoApp {
    constructor() {
        this.todos = this.loadFromStorage();
        this.currentFilter = 'all';
        this.draggedElement = null;
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    // 로컬 스토리지에서 불러오기
    loadFromStorage() {
        const data = localStorage.getItem('todos');
        return data ? JSON.parse(data) : [];
    }

    // 로컬 스토리지에 저장하기
    saveToStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // 할일 추가
    addTodo(text) {
        if (!text.trim()) {
            alert('할일을 입력해주세요.');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.saveToStorage();
        this.render();
        $('#todoInput').val('');
    }

    // 할일 삭제
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToStorage();
        this.render();
    }

    // 완료 상태 토글
    toggleComplete(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    // 필터링된 할일 가져오기
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    // 통계 업데이트
    updateStats() {
        const total = this.todos.length;
        const active = this.todos.filter(todo => !todo.completed).length;
        const completed = this.todos.filter(todo => todo.completed).length;

        $('#totalCount').text(total);
        $('#activeCount').text(active);
        $('#completedCount').text(completed);
    }

    // 화면 렌더링
    render() {
        const filteredTodos = this.getFilteredTodos();
        const $todoList = $('#todoList');
        $todoList.empty();

        if (filteredTodos.length === 0) {
            $todoList.append(`
                <div class="text-center text-muted py-5">
                    <p>할일이 없습니다.</p>
                </div>
            `);
        } else {
            filteredTodos.forEach(todo => {
                const $item = $(`
                    <div class="list-group-item todo-item ${todo.completed ? 'completed' : ''}"
                         data-id="${todo.id}" draggable="true">
                        <div class="d-flex align-items-center">
                            <input type="checkbox" class="form-check-input me-3 toggle-complete"
                                   ${todo.completed ? 'checked' : ''}>
                            <span class="todo-text flex-grow-1">${todo.text}</span>
                            <button class="btn btn-sm btn-danger delete-btn">삭제</button>
                        </div>
                    </div>
                `);
                $todoList.append($item);
            });
        }

        this.updateStats();
    }

    // 이벤트 바인딩
    bindEvents() {
        // 할일 추가
        $('#addBtn').on('click', () => {
            const text = $('#todoInput').val();
            this.addTodo(text);
        });

        $('#todoInput').on('keydown', (e) => {
            if (e.key === 'Enter') {
                const text = $('#todoInput').val();
                this.addTodo(text);
            }
        });

        // 필터 버튼
        $('[data-filter]').on('click', (e) => {
            const $btn = $(e.currentTarget);
            this.currentFilter = $btn.data('filter');
            $('[data-filter]').removeClass('active');
            $btn.addClass('active');
            this.render();
        });

        // 동적 이벤트 위임
        $('#todoList').on('change', '.toggle-complete', (e) => {
            const id = parseInt($(e.target).closest('.todo-item').data('id'));
            this.toggleComplete(id);
        });

        $('#todoList').on('click', '.delete-btn', (e) => {
            const id = parseInt($(e.target).closest('.todo-item').data('id'));
            if (confirm('정말 삭제하시겠습니까?')) {
                this.deleteTodo(id);
            }
        });

        // 드래그 앤 드롭 이벤트
        this.bindDragEvents();
    }

    // 드래그 앤 드롭 이벤트 바인딩
    bindDragEvents() {
        const $todoList = $('#todoList');

        $todoList.on('dragstart', '.todo-item', (e) => {
            this.draggedElement = e.currentTarget;
            $(e.currentTarget).addClass('dragging');
        });

        $todoList.on('dragend', '.todo-item', (e) => {
            $(e.currentTarget).removeClass('dragging');
            $('.drag-over').removeClass('drag-over');
        });

        $todoList.on('dragover', '.todo-item', (e) => {
            e.preventDefault();
            const $item = $(e.currentTarget);

            if (this.draggedElement !== e.currentTarget) {
                $item.addClass('drag-over');
            }
        });

        $todoList.on('dragleave', '.todo-item', (e) => {
            $(e.currentTarget).removeClass('drag-over');
        });

        $todoList.on('drop', '.todo-item', (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            $target.removeClass('drag-over');

            if (this.draggedElement !== e.currentTarget) {
                const draggedId = parseInt($(this.draggedElement).data('id'));
                const targetId = parseInt($target.data('id'));

                this.reorderTodos(draggedId, targetId);
            }
        });
    }

    // 할일 순서 변경
    reorderTodos(draggedId, targetId) {
        const draggedIndex = this.todos.findIndex(todo => todo.id === draggedId);
        const targetIndex = this.todos.findIndex(todo => todo.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        // 배열에서 요소 이동
        const [draggedTodo] = this.todos.splice(draggedIndex, 1);
        this.todos.splice(targetIndex, 0, draggedTodo);

        this.saveToStorage();
        this.render();
    }
}

// 앱 시작
$(document).ready(function() {
    const app = new TodoApp();
});


function updateDateTime() {
    const now = new Date();

    // 날짜: 2026. 02. 06 (금)
    const dateStr = now.toLocaleDateString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
    });

    // 시간: 오후 4:30
    const timeStr = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    document.getElementById('current-date2').textContent = dateStr;
    document.getElementById('current-time').textContent = timeStr;
}

// 1초마다 업데이트
setInterval(updateDateTime, 1000);
updateDateTime(); // 처음 실행 시 즉시 표시



/*
"구조화"

1. [창고] 데이터 보관소 (Storage)
변수: this.todos (파이썬의 list)
핵심 기능: JSON.stringify (리스트를 문자열로 바꿔서 저장), JSON.parse (저장된 문자열을 다시 리스트로 복구)

2. [두뇌] 데이터 조작 (Logic)
"리스트를 어떻게 바꿀까?" (화면 생각하지 말고 오직 리스트만 생각하는 곳)
추가: push() (파이썬의 append)
삭제: filter() (조건에 맞는 놈만 남기기)
토글: find() (아이디로 찾아서 True/False 뒤집기)

3. [눈] 화면 그리기 (Render)
"리스트를 HTML로 번역하자!"
비우기: empty() (바구니 싹 비우기)
반복문: forEach() (파이썬의 for todo in todos:)
채우기: append() (만든 HTML 덩어리를 바구니에 넣기)

4. [신경] 버튼 연결 (Events)
"어떤 버튼을 누르면 무슨 함수를 실행할까?"
클릭: on('click', ...)
키보드: on('keydown', ...) (엔터키 감지)
위임: on('click', '.delete-btn', ...) (나중에 새로 생길 '삭제' 버튼까지 미리 감시하기)
*/
