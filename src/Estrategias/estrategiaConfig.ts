import {AuthenticationStrategy} from '@loopback/authentication';
import {service} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import parseBearerToken from 'parse-bearer-token';
import {AutenticacionService} from '../services';
var respuesta: Boolean = false;

export class EstrategiaConfig implements AuthenticationStrategy {
  name: string = 'config';

  constructor(
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    let token = parseBearerToken(request);
    if (token) {
      let datos = this.servicioAutenticacion.ValidarToken(token);
      if (datos) {
        if (datos.data.rol) {
          datos.data.roll.forEach(function (x: any) {
            if (x.nombres == 'configurador') {
              respuesta = true;
            }
          });
          if (respuesta) {
            let perfil: UserProfile = Object.assign({
              nombre: datos.data.nombre,
            });
            return perfil;
          } else {
            throw new HttpErrors[401]('Usted no es un configurador');
          }
        } else {
          throw new HttpErrors[401](
            'usted no tiene permiso de acceso a este recurso',
          );
        }
      } else {
        throw new HttpErrors[401]('El token no es valido ');
      }
    } else {
      throw new HttpErrors[401]('no hay un token para esta solicitud ');
    }
  }
}
