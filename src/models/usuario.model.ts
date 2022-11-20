import {Entity, hasMany, model, property} from '@loopback/repository';
import {RolUsuario} from './rol-usuario.model';
import {Roles} from './roles.model';

@model()
export class Usuario extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  nombres: string; 

  @property({
    type: 'string',
    required: true,
  })
  correo: string;

  @property({
    type: 'string',
    required: true,
  })
  celular: string;

  @property({
    type: 'string',
  })
  clave?: string;

  @property({
    type: 'string',
  })
  perfil?: string;

  /*
  @property({
    type: 'string',
  })
  roles?: string;
*/
@hasMany(() => Roles,{through: {model: () => RolUsuario}})
roles: Roles[];




  constructor(data?: Partial<Usuario>) {
    super(data);
  }
}

export interface UsuarioRelations {
  // describe navigational properties here
}

export type UsuarioWithRelations = Usuario & UsuarioRelations;
