const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const singJwt = require('./index');
describe('Testing JWT Token Generation', ()=>{
    let env;

    beforeAll(()=>{
    process.env={ 
    ...env,
    JWT_SECRET : 'cuandoLosGatosNoEstanLosRatonesFiestaDan',
    JWT_PASS_TEMP_SECOND :1000,
    }
    });

    afterAll(()=>{
        process.env={  ...env};
        
    });

    test('CREANDO JWT',()=>{
        const jwt = singJwt({Prueba:'Prueba','temp': 'Temp Data'});
        console.log(jwt);
        expect(jwt).toBeDefined();
    })
})