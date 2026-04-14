import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = 3000;
const SECRET = "clave_secreta";

// Usuarios ficticios
const users = [
  { username: "admin", password: "1234" },
  { username: "user", password: "abcd" }
];

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Credenciales incorrectas. No autorizado."
    });
  }

  const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false // cambiar a true si usas https
  });

  res.json({ message: "Login exitoso" });
});

// MIDDLEWARE
function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.sendStatus(403);
  }
}

// RUTA PRIVADA
app.get("/privado", verifyToken, (req, res) => {
  res.json({
    message: "Acceso permitido",
    user: req.user
  });
});

// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Sesión cerrada" });
});

// RUTA PARA PROBAR EN NAVEGADOR
app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});