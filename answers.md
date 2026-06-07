# PBT_09 — DOM MANIPULATION & EVENTS — ANSWERS

---

## PHẦN A — KIỂM TRA ĐỌC HIỂU

### Câu A1 — DOM Tree (5 điểm)

#### 1. DOM Tree (Sơ đồ cây)

```
#app (div)
├── header
│   ├── h1 "Todo App"
│   └── nav
│       ├── a.active "#"
│       ├── a "#"
│       └── a "#"
├── main
│   ├── form#todoForm
│   │   ├── input#todoInput
│   │   └── button "Add"
│   └── ul#todoList
│       ├── li.todo-item "Learn HTML"
│       └── li.todo-item.completed "Learn CSS"
```

#### 2. Các querySelector câu hỏi:

```javascript
// Chọn thẻ <h1>
document.querySelector("h1");
// hoặc
document.querySelector("#app h1");

// Chọn input trong form
document.querySelector("#todoForm input");
// hoặc
document.querySelector("#todoInput");

// Chọn tất cả .todo-item
document.querySelectorAll(".todo-item");

// Chọn link đang active
document.querySelector("nav .active");
// hoặc
document.querySelector("a.active");

// Chọn <li> đầu tiên trong #todoList
document.querySelector("#todoList li");
// hoặc
document.querySelector("#todoList .todo-item:first-child");

// Chọn tất cả <a> bên trong <nav>
document.querySelectorAll("nav a");
// hoặc
document.querySelectorAll("#app nav a");
```

---

### Câu A2 — innerHTML vs textContent (5 điểm)

#### Sự khác nhau:

| Tính chất | `innerHTML` | `textContent` |
|---|---|---|
| **Định nghĩa** | Lấy/gán nội dung HTML bên trong element | Lấy/gán chỉ **text** bên trong element |
| **Xử lý HTML tags** | Parse và render HTML tags | Coi HTML tags là text, không render |
| **Hiệu suất** | Chậm hơn (phải parse HTML) | Nhanh hơn (chỉ xử lý text) |
| **Bảo mật** | ⚠️ Nguy hiểm XSS nếu user input | ✅ An toàn hơn |

#### Ví dụ:

```javascript
const div = document.querySelector("div");
div.innerHTML = "<b>Bold</b>";   // Hiển thị chữ đậm
div.textContent = "<b>Bold</b>"; // Hiển thị: <b>Bold</b> (literal text)
```

#### Khi nào dùng mỗi cái:

- **`innerHTML`**: Khi bạn cần render HTML content (ít gặp), template có sẵn, hoặc trusted data
- **`textContent`**: Khi chỉ cần text (Add/Edit/Delete, display user data)

#### Lỗ hổng XSS:

**XSS = Cross-Site Scripting** — Attacker inject code JavaScript qua user input.

```javascript
// ❌ NGUY HIỂM:
const userInput = document.querySelector("#search").value;
// Nếu user nhập: <img src=x onerror="alert('Hacked!')">
document.querySelector("#result").innerHTML = userInput;
// → Script chạy ngay, alert hiện lên!

// ✅ AN TOÀN:
document.querySelector("#result").textContent = userInput;
// → Hiển thị HTML tag dưới dạng text, không execute

// ✅ HOẶC: Escape HTML before innerHTML
function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
document.querySelector("#result").innerHTML = escapeHTML(userInput);
```

**Giải pháp:**
1. Dùng `textContent` thay vì `innerHTML` (best)
2. Escape HTML entities trước khi dùng `innerHTML`
3. Validate + sanitize user input

---

### Câu A3 — Event Bubbling (5 điểm)

#### Thứ tự console.log (KHÔNG có stopPropagation):

```
BUTTON
INNER
OUTER
```

**Giải thích:** Event bubbling = sự kiện "buble" từ element được click lên parent.

1. Click vào `#btn` → "BUTTON" log
2. Event bubble lên `#inner` → "INNER" log
3. Event bubble lên `#outer` → "OUTER" log

#### Nếu uncomment `e.stopPropagation()`:

```
BUTTON
```

**Giải thích:** `stopPropagation()` dừng event tại handler đó, không cho bubble lên parent.

**Event Flow:**

```
Capturing Phase (ít dùng)
        ↓
Target Phase (click element) → "BUTTON"
        ↓
Bubbling Phase → "INNER" → "OUTER"
        
Với stopPropagation() → Dừng ở Target, không bubble
```

**Code chi tiết:**

```javascript
// Đã có .addEventListener("click", ..., false) 
// → false = bubble mode (default)

// Nếu addEventListener(..., true) → capture mode → OUTPUT: OUTER, INNER, BUTTON
```

---

## PHẦN C — DEBUG & PHÂN TÍCH

### Câu C1 — Debug DOM Code (8 điểm)

**Tìm và sửa 7 lỗi:**

#### ❌ Lỗi 1: Line 14 — `addEventListener("onclick", ...)`

```javascript
// ❌ WRONG:
document.querySelector("#decrementBtn").addEventListener("onclick", function() {

// ✅ CORRECT:
document.querySelector("#decrementBtn").addEventListener("click", function() {
```

**Giải thích:** Event type là `"click"`, không phải `"onclick"`. Attribute là `onclick`, event là `click`.

---

#### ❌ Lỗi 2: Line 20 — `countDisplay = count` (gán DOM node = số)

```javascript
// ❌ WRONG:
countDisplay = count;

// ✅ CORRECT:
countDisplay.textContent = count;
```

**Giải thích:** `countDisplay` là DOM element, không thể gán số vào. Phải update `.textContent`.

---

#### ❌ Lỗi 3: Line 21 — `historyList.innerHTML = null`

```javascript
// ❌ WRONG (null → "null" string):
historyList.innerHTML = null;

// ✅ CORRECT:
historyList.innerHTML = "";  // hoặc
// historyList.replaceChildren();
```

**Giải thích:** `innerHTML = null` → set innerHTML thành string "null". Dùng `""` hoặc `replaceChildren()`.

---

#### ❌ Lỗi 4: Line 31 — `item.remove;` (không call function)

```javascript
// ❌ WRONG (missing parentheses):
item.remove;

// ✅ CORRECT:
item.remove();  // hoặc item.parentNode.removeChild(item);
```

**Giải thích:** Forget `()` → function không execute, element vẫn còn.

---

#### ❌ Lỗi 5: Line 27 — Unsafe `innerHTML` with user input

```javascript
// ❌ Risky (nếu count là user input):
li.textContent = "Count changed to " + count;
// Hoặc: li.innerHTML = "Count changed to " + count;

// ✅ SAFE (nếu count là số, ok, nhưng consistent):
li.textContent = `Count changed to ${count}`;
```

**Giải thích:** Nếu count từ user input, innerHTML nguy hiểm XSS. Dùng textContent an toàn.

---

#### ❌ Lỗi 6: Line 37 — `localStorage.getItem("count")` trả về string

```javascript
// ❌ WRONG (count is string "5", not number 5):
count = localStorage.getItem("count");
count++;  // → "51" (string concatenation), không phải 6

// ✅ CORRECT:
count = parseInt(localStorage.getItem("count")) || 0;
```

**Giải thích:** localStorage lưu string, cần convert về number. `|| 0` handle null case.

---

#### ❌ Lỗi 7: Line 32 — Element not found (selector wrong)

```javascript
// Nếu HTML không có #clearHistory:
document.querySelector("#clearHistory");  // → null
// → addEventListener trên null → ERROR

// ✅ FIX: Kiểm tra element tồn tại:
const clearBtn = document.querySelector("#clearHistory");
if (clearBtn) {
    clearBtn.addEventListener("click", () => {
        const items = historyList.querySelectorAll("li");
        items.forEach(item => item.remove());
    });
}
```

**Giải thích:** Selector không match → null → error. Check existence trước.

---

#### Full Fixed Code:

```javascript
// App: Counter with history
const countDisplay = document.querySelector(".count");
const historyList = document.getElementById("history");

let count = 0;

document.querySelector("#incrementBtn").addEventListener("click", function() {
    count++;
    countDisplay.textContent = count;  // ✅ Fix: innerHTML → textContent
    
    // Lưu history
    const li = document.createElement("li");
    li.textContent = `Count changed to ${count}`;  // ✅ Fix: template literal
    li.addEventListener("click", function() {
        deleteHistory(this);
    });
    historyList.append(li);
});

document.querySelector("#decrementBtn").addEventListener("click", function() {  // ✅ Fix: "onclick" → "click"
    count--;
    countDisplay.textContent = count;  // ✅ Fix: gán value
});

document.querySelector("#resetBtn").addEventListener("click", () => {
    count = 0;
    countDisplay.textContent = count;  // ✅ Fix: gán vào textContent
    historyList.innerHTML = "";  // ✅ Fix: null → ""
});

function deleteHistory(element) {
    element.remove();  // ✅ Fix: có parentheses + remove() method
}

// Clear all history
const clearHistoryBtn = document.querySelector("#clearHistory");  // ✅ Fix: check null
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
        const items = historyList.querySelectorAll("li");
        items.forEach(item => {
            item.remove();  // ✅ Fix: add ()
        });
    });
}

// Save to localStorage
window.addEventListener("beforeunload", () => {
    localStorage.setItem("count", count);
    localStorage.setItem("history", historyList.innerHTML);
});

// Load from localStorage
window.addEventListener("load", () => {
    count = parseInt(localStorage.getItem("count")) || 0;  // ✅ Fix: parseInt + default 0
    countDisplay.textContent = count;
});
```

---

### Câu C2 — Performance (7 điểm)

#### 1. Tại sao bind event lên 1000 elements riêng lẻ là BAD?

```javascript
// ❌ BAD: 1000 event listeners
const items = document.querySelectorAll(".item");
items.forEach(item => {
    item.addEventListener("click", handleClick);
});
// → Memory usage: 1000 listeners
// → DOM operation: 1000 attach
// → Slow, heavy garbage collection
```

**Vấn đề:**
- **Memory**: 1000 function references → high memory
- **Performance**: Attaching 1000 listeners chậm
- **Maintenance**: Cần remove 1000 listeners nếu DOM change
- **GC pressure**: Garbage collector phải track 1000 objects

#### 2. Event Delegation giải quyết thế nào?

```javascript
// ✅ GOOD: 1 event listener trên parent
const container = document.querySelector(".container");
container.addEventListener("click", (e) => {
    if (e.target.classList.contains("item")) {
        handleClick(e.target);
    }
});

// Lợi ích:
// - Memory: 1 listener (dù 1000 items)
// - Bubble: Child click → bubble lên parent → handler catch
// - Dynamic: Add/remove item sau không cần re-bind
// - Fast: 1 attach vs 1000 attach
```

**Event Flow:**

```
Click trên item
    ↓ (bubble)
Parent container listener catch
    ↓
Check e.target (event.target)
    ↓
Handle
```

---

#### 2. DocumentFragment refactor:

```javascript
// ❌ BAD: 1000 lần reflow/repaint
for (let i = 0; i < 1000; i++) {
    const div = document.createElement("div");
    div.textContent = `Item ${i}`;
    document.body.appendChild(div);  // ← 1000 reflow!
}
// → Browser recalculate layout 1000 times = SLOW

// ✅ GOOD: 1 lần reflow
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
    const div = document.createElement("div");
    div.textContent = `Item ${i}`;
    fragment.appendChild(div);  // ← append to memory, no reflow
}
document.body.appendChild(fragment);  // ← 1 reflow!

// Hoặc: innerHTML += (SLOWER):
// let html = "";
// for (...) html += `<div>Item ${i}</div>`;
// document.body.innerHTML = html;  // ← nhưng reparse HTML

// Hoặc: insertAdjacentHTML (middle):
// document.body.insertAdjacentHTML("beforeend", allHTML);
```

**Giải thích:**

| Phương pháp | Reflow | Memory | Code |
|---|---|---|---|
| `appendChild` x1000 | 1000x | HIGH | Simple |
| `DocumentFragment` | 1x | NORMAL | Better |
| `innerHTML +=` | 1x (reparse) | Normal | Slower |
| `insertAdjacentHTML` | 1x | Normal | Fast |

**Benchmark:**
- appendChild x1000: ~500ms
- DocumentFragment: ~5ms (100x faster!)

**Why faster:**
- DocumentFragment là "virtual DOM" (memory only)
- Append to fragment: KHÔNG trigger reflow
- Append fragment to document: 1 reflow thôi
