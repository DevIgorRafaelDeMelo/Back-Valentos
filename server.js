const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 6600;

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.get('/', (req, res) => {
    res.send('Servidor Node.js está rodando na porta 6600!');
});

app.post('/login', (req, res) => {
    const { user, password } = req.body;
    console.log(`Tentativa de login com usuário: ${user} e senha: ${password}`);

    if (user === "admin" && password === "1234") {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Usuário ou senha inválidos" });
    }
});


let registros = [];

app.post('/enviar', upload.single('conta'), (req, res) => {
    const { nome, telefone, cidade, estado } = req.body;
    const arquivo = req.file;

    const registro = {
        nome,
        telefone,
        cidade,
        estado,
        arquivo: arquivo.filename,
        data: new Date()
    };

    registros.push(registro);

    fs.writeFileSync('registros.json', JSON.stringify(registros, null, 2));

    res.send('Formulário enviado com sucesso!');
});

app.get('/uploads', (req, res) => {
    if (fs.existsSync('registros.json')) {
        const data = fs.readFileSync('registros.json');
        registros = JSON.parse(data);
    }
    res.json(registros);
});

app.get('/download/:filename', (req, res) => {
    const file = path.join(__dirname, 'uploads', req.params.filename);
    res.download(file);
});

const storageCurriculo = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'curriculos/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const uploadCurriculo = multer({ storage: storageCurriculo });

let candidatos = [];

function salvarJSON() {
    fs.writeFileSync('candidatos.json', JSON.stringify(candidatos, null, 2));
}

app.post('/trabalhe-conosco', uploadCurriculo.single('curriculo'), (req, res) => {
    const { nome, telefone, email, cidade, estado, cargo } = req.body;
    const arquivo = req.file;

    const candidato = {
        nome,
        telefone,
        email,
        cidade,
        estado,
        cargo,
        curriculo: arquivo.filename,
        data: new Date()
    };

    candidatos.push(candidato);
    salvarJSON();

    res.send('Currículo recebido e salvo com sucesso!');
});

app.get('/candidatos', (req, res) => {
    if (fs.existsSync('candidatos.json')) {
        const data = fs.readFileSync('candidatos.json');
        candidatos = JSON.parse(data);
    }
    res.json(candidatos);
});

app.get('/download-curriculo/:filename', (req, res) => {
    const file = path.join(__dirname, 'curriculos', req.params.filename);
    res.download(file);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
