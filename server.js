const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();

const REG_TITLE = "";
const REG_ERROR = "";


app.use(cors({
    origin: 'http://localhost:5500'
  }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const PORT = 3000;
const photos = [
  { url: '/public/images/cake1.jpg' },
  { url: '/public/images/muffin1.jpg' },
  { url: '/public/images/cookie1.jpg' }
];

app.get('/api/portfolio', (req, res) => {
  res.json(photos);
});

app.post('/api/contact', (req, res) => {
  const message = req.body;
  console.log(message);



  // Validace dat
  if (!message.name || !message.email || !message.style || !message.message ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(message.email)) {
    return res.status(400).json({ success: false, error: 'Neplatná data.' });
  }



  
  /*fs.appendFile('messages.txt', JSON.stringify(message) + '\n', err => {
    if (err) return res.status(500).json({ success: false });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'lenatolmaceva20@gmail.com', 
        pass: 'process.env.MAIL_PASS'  
      }
    });

    const mailOptions = {
      from: 'lenatolmaceva20@gmail.com',
      to: 'lenatolmaceva20@gmail.com',
      subject: 'Nová objednávka sladkosti',
      text: `Jméno: ${message.name}\nEmail: ${message.email}\nTyp sladkosti: ${message.style}\nZpráva: ${message.message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return res.status(500).json({ success: false });
      res.json({ success: true, message: 'Objednávka byla úspěšně odeslána.' });
    });
  });*/
}); 

// статистика 

/*app.get('/api/statistics', (req, res) => {
  fs.readFile('messages.txt', 'utf8', (err, data) => {
    if (err) return res.status(500).json({});
    const styles = {};
    data.trim().split('\n').forEach(line => {
      try {
        const msg = JSON.parse(line);
        if (msg.style) {
          styles[msg.style] = (styles[msg.style] || 0) + 1;
        }
      } catch {}
    });
    res.json(styles);
  });
}); */

 // so here we go

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'sweety_sky'
});


const createTabels = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    order_type VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL
    
  );
  CREATE TABLE IF NOT EXISTS orders (
    user_id INT,
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order VARCHAR(255) NOT NULL,
  );
`

db.query(createTables, (err, results) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(results);
});

// sign up




app.post('/users', (req, res) => {
  const { email, password } = req.body;
  const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).send(REG_ERROR);
    res.send({ id: result.insertId, message: REG_TITLE });
  });
});

// cart 1

app.post('/orders', (req, res) => {
  const {order,user_id} = req.body;

  const sql = 'INSERT INTO orders (order, user_id) VALUES (?, ?)';
  values = [order,user_id];
  
  db.query(sql,values, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({order_id: result.insertId})
  })
});

// cart 2

app.post('/orders', (req, res) => {
  const { user_id } = req.body;
  const sql = 'SELECT `order` FROM orders WHERE user_id = ?';

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).send({ error: err.message });
    const orderList = result.map(row => row.order);
    res.send({ orders: orderList });
  });
});

// sign in




app.listen(PORT, () => console.log(`Server běží na http://localhost:${PORT}`));
