const { db } = require('../Connection');
const DaoObject = require('../DaoObject');
module.exports = class UsuarioDao extends DaoObject {
  constructor(db = null) {
    console.log('UsuarioDao db: ', db);
    super(db, 'usuarios');
  }
  
  async setup() {
    if (process.env.MONGODB_SETUP) {
      const indexExists = await this.collection.indexExists('userId_1');
      if (!indexExists) {
        await this.collection.createIndex({'userId': 1});
      }
    }
  }

    
  

  getAll() {
    return this.find();
  }
  getById({codigo}) {
    return this.findById(codigo);
  }

  getByEmail({ email }) {
    return this.findOne({email});
  }

  insertOne({ email, password, passtemp, exp, estado, nombre,avatar}) 
  {
    const nuevoUsuario={
      email,estado, password, passtemp, exp, nombre,avatar, created: new Date().toISOString(),
    }
    return super.insertOne(nuevoUsuario);
  }
  updateOne({ codigo, password,passtemp, exp,estado, nombre,avatar}) {
    const updateCommand = {
      '$set': {
        password,
        passtemp,
        exp,
        estado, 
        nombre,
        avatar,
       
        updated: new Date().toISOString()
      }
    };
    return super.updateOne(codigo, updateCommand);
  }

  updPassw({ codigo, passtemp}) {
    const date = new Date();
    date.setSeconds(28800);
    console.log(date);
    const updateCommand = {
      "$set": {
        passtemp,
        exp: date,
        updated: new Date().toISOString()
      }
    }
    return super.updateOne(codigo, updateCommand);
  }

  newPass({ codigo,password}){
    const updateCommand = {
      "$set": {
        password,
        updated: new Date().toISOString()
      }
    }
    return super.updateOne(codigo, updateCommand);
  }


  deleteOne({ codigo }) {
    return super.removeOne(codigo);
  }
}