const express =require('express');
let router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Usuario = require('../../../../libs/usuarios');
const UsuarioDao = require('../../../../dao/mongodb/models/UsuarioDao');
const userDao = new UsuarioDao();
const user = new Usuario(userDao);
user.init();

const {jwtSign} = require('../../../../libs/security');

router.post('/login', async (req, res)=>{
  try {
    const {email, password} = req.body;
    const userData = await user.getUsuarioByEmail({email});
    const date = new Date();
    if(password == userData.passtemp && userData.exp > date){
      console.log("Contraseña Correcta");
    } else if(! user.comparePasswords(password, userData.password)) {
      console.error('Inicio de seguridad: ', {error:`Acreditaciones de Usuario ${userData._id} ${userData.email} incorrectas.`});
      return res.status(403).json({ "error": "Acreditaciones Invalidadas" });
    }
    const {password: passwordDb, created, updated, ...jwtUser} = userData;
    const jwtToken = await jwtSign({jwtUser, generated: new Date().getTime()});
    return res.status(200).json({token: jwtToken});
  } catch (ex) {
    console.error('security login: ', {ex});
    return res.status(500).json({"error":"No es posible procesar la solicitud."});
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email = '',
      password = ''
    } = req.body;
    if (/^\s*$/.test(email)) {
      return res.status(400).json({
        error: 'Se espera valor de correo'
      });
    }

    if (/^\s*$/.test(password)) {
      return res.status(400).json({
        error: 'Se espera valor de contraseña correcta'
      });
    }
    const newUsuario = await user.addUsuarios({
      email,
      nombre : 'John Doe',
      avatar: '',
      password,
      estado: 'ACT'
    });
    return res.status(200).json(newUsuario);
  } catch (ex) {
    console.error('security signIn: ', ex);
    return res.status(502).json({ error: 'Error al procesar solicitud' });
  }
});

router.post('/recu', async (req, res)=>{
  try {
    let testAccount = await nodemailer.createTestAccount();
    const {email} = req.body;
    const userData = await user.getUsuarioByEmail({email});
    const codigo = userData._id;
    if(!userData) {
      return res.status(403).json({ "error": "Correo inexistente" });
    }
    let transp = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth:{
        user: process.env.APP_CORREO,
        pass: process.env.CORREO_CONTRA
    },
    STARTTLS: {
      rejectUnauthorized: false
  }
    });

    const MIN = "abcdefghijklmnñopqrstuvwxyz";
    const MAY = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    var passtemp = '';
    for (var i = 1; i <= 8; i++) {
      var seleccion = Math.floor(Math.random() * 3 + 1);
      if (seleccion == 1) {
        var character = MIN.charAt(Math.floor(Math.random() * MIN.length));
        passtemp += character;
      } else {
        if (seleccion == 2) {
          var char = MAY.charAt(Math.floor(Math.random() * MAY.length));
          passtemp += char;
        } else {
          var n = Math.floor(Math.random() * 10);
          passtemp += n;
        }
      }
    }
    let info = transp.sendMail({
      from: process.env.APP_CORREO, 
      to: email, 
      subject: "Recuperar contraseña", 
      text: 'Contraseña funcionaria: '+passtemp,
      html: "Contraseña temporal: "+passtemp,
    });
    const userDataa = await user.updPass({codigo,passtemp});
    return res.status(200).json("Procesamiento Enviado");
  } catch (ex) {
    console.error('security login: ', {ex});
    return res.status(500).json({"error":"No es posible procesar la solicitud."});
  }
});

router.put('/updpass', async (req, res) => {
  try {
    const date = new Date();
    const {email,password,passantigua} = req.body;
    if (/^\s*$/.test(passantigua)) {
      return res.status(400).json({
        error: 'Se requiere un valor de contraseña correcto'
      });
    }
  
    if (/^\s*$/.test(password)) {
      return res.status(400).json({
        error: 'Se requiere un valor de contraseña correcto'
      });
    }
 
    const userData = await user.getUsuarioByEmail({email});
    const codigo = userData._id;
    if(passantigua == userData.passtemp && userData.exp > date){
      console.log("Contraseña Correcta");
    }else
    {
    return res.status(403).json("Contraseña o correo electronico incorrecto");
    }
    const newPswd = await user.newPasswd({codigo,password});
    return res.status(200).json("Nueva contraseña guardada con éxito");
  } catch (ex) {
    console.error('security signIn: ', ex);
    return res.status(502).json({ error: 'Error al procesar solicitud' });
  }
});


module.exports = router;
