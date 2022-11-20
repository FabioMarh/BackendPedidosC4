import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Keys} from '../configuracion/Keys'; //Llave importada para la autenticación
import {Credenciales, Usuario} from '../models';
import {PersonaRepository, UsuarioRepository} from '../repositories';

const xx = require('generate-password');
const cryptoJS = require('crypto-js');
const JWT = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(
    @repository(PersonaRepository)
    public repositorioPersona: PersonaRepository,
    @repository(UsuarioRepository)
    public userRepo: UsuarioRepository,
  ) {}

  /*
   * Add service methods here
   */
  GenerarPassword() {
    let password = xx.generate({
      length: 10,
      numbers: true,
    });
    return password;
  }

  EncriptarPassword(password: string) {
    let passwordE = cryptoJS.MD5(password);
    return passwordE;
  }

  //?Sesión 11

  //*------------metodo para identificar un usuario
  IdentificarUsuario(credenciales: Credenciales) {
    try {
      let p = this.userRepo.findOne({
        where: {
          correo: credenciales.usuario,
          clave: credenciales.password,
        },
        include: ['roles'], //Esto para incluir la lista de roles
      });
      if (p) {
        return p;
      }
      return false;
    } catch {
      return false;
    }
  }
  //----------------metodo para generar un token jwt
  GeneracionToken(usuario: Usuario) {
    let token = JWT.sign(
      {
        data: {
          id: usuario.id,
          correo: usuario.correo,
          nombres: usuario.nombres,
          rol: usuario.roles,
        },
      },
      Keys.LlaveJWT,
    );

    return token;
  }
  //*---- validacion del token
  ValidarToken(token: string) {
    try {
      let datos = JWT.verify(token, Keys.LlaveJWT);
      return datos;
    } catch {
      return false;
    }
  }
}
