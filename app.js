const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const session = require('express-session');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session middleware untuk messages
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use((req, res, next) => {
  res.locals.messages = req.session.messages || {};
  delete req.session.messages;
  next();
});

// Load todos dari file
let todos = [];
const loadTodos = () => {
  if (fs.existsSync('todos.json')) {
    const data = fs.readFileSync('todos.json', 'utf8');
    todos = JSON.parse(data);
  }
};
const saveTodos = () => {
  fs.writeFileSync('todos.json', JSON.stringify(todos, null, 2));
};

// Panggil load saat pertama kali
loadTodos();

// Routes
app.get('/', (req, res) => {
  res.render('index', { todos });
});

// 🔧 MENAMPILKAN HALAMAN EDIT
app.get('/edit/:index', (req, res) => {
  const index = req.params.index;

  // Validate index
  if (!todos[index]) {
    req.session.messages = { error: ['To do tidak ditemukan!'] };
    return res.redirect('/');
  }

  // Render the edit page
  res.render('edit', { 
    todo: todos[index], 
    index: index 
  });
});

// 🔁 UPDATE HASIL EDIT
app.post('/edit/:index', (req, res) => {
  const index = req.params.index;
  const editedText = req.body.editedTodo;
  const editedDate = req.body.editedDate;

  if (todos[index]) {
    todos[index].text = editedText;
    todos[index].date = editedDate;
    saveTodos();
    req.session.messages = { success: ['To do berhasil diedit!'] };
  }

  res.redirect('/');
});

// Tambah todo
app.post('/add', (req, res) => {
  const { todo, date } = req.body;
  todos.push({ text: todo, date: date, completed: false });
  saveTodos();
  res.redirect('/');
});

// Selesai / belum selesai
app.post('/complete/:index', (req, res) => {
  const index = req.params.index;
  if (todos[index]) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    req.session.messages = { success: ['To do berhasil diubah statusnya!'] };
  }
  res.redirect('/');
});

// Hapus todo
app.post('/delete/:index', (req, res) => {
  const index = req.params.index;
  if (todos[index]) {
    todos.splice(index, 1);
    saveTodos();
    req.session.messages = { success: ['To do berhasil dihapus!'] };
  }
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});