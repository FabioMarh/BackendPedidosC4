import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Keys} from '../configuracion/Keys';
import {CambioPass, Credenciales, Usuario} from '../models';
import {PersonaRepository, UsuarioRepository} from '../repositories';
import {AutenticacionService} from '../services/autenticacion.service';
//Importar la constante  fetch
const fetch = require('node-fetch');
/*
export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository : UsuarioRepository,
  ) {}

  @post('/usuarios')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, 'id'>,
  ): Promise<Usuario> {
    return this.usuarioRepository.create(usuario);
  }

  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }
}
*/
export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService,
    @repository(PersonaRepository)
    public personaRepo: PersonaRepository,
  ) {}

  @post('/Registro')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, 'id'>,
  ): Promise<Usuario> {
    let clave = this.servicioAutenticacion.GenerarPassword();
    let clavecifrada = this.servicioAutenticacion.EncriptarPassword(clave);
    usuario.clave = clavecifrada;
    let user = await this.usuarioRepository.create(usuario);
    /*Se modifica para obtener funcionalidad con la notificacion via correo
    if (usuario.perfil == 'persona') {
      let p = await this.personaRepo.create(usuario);
    }
    return user;*/

    // Incluir Notificacion
    let destino = user.correo;
    let asunto = 'Registro en la APP - PEDIDOS';
    let contenido = `Hola, ${user.nombres}, su nombre de usuario es: ${user.correo} y su contraseña de acceso a nuestra app es: ${clave} `; //string template(cocatenar de otra manera)__ tener en cuenta que usa tildes invertidas

    fetch(
      `${Keys.ulrNotificaciones}/e-mail?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`,
    ).then((data: any) => {
      console.log(data);
    }); // sirve para conectarse a un servidor externo y consumir estos recursos ofrecidos por los servicios, este debe ser previamente instalado
    return user;
  }

  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Usuario) where?: Where<Usuario>): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'})
    filter?: FilterExcludingWhere<Usuario>,
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }

  /**
   * metodos propios
   *
   */
  @post('/Login')
  @response(200, {
    description: 'Logueo de usuario a la app',
  })
  async identificar(@requestBody() credenciales: Credenciales) {
    let u = await this.servicioAutenticacion.IdentificarUsuario(credenciales);
    if (u) {
      let token = this.servicioAutenticacion.GeneracionToken(u);
      return {
        info: {
          nombre: u.nombres,
          id:u.id,
          correo:u.correo,
          roles:u.roles
        },
        tk: token,
      };
    } else {
      throw new HttpErrors[401]('datos invalidos');
    }
  }
  //sesion 14
  @post('/RecuperarPass')
  @response(200, {
    description: 'Recuperacion de la contraseña del usuario',
  })
  async recuperar(@requestBody() email: string): Promise<Boolean> {
    let user = await this.usuarioRepository.findOne({
      where: {
        correo: email,
      },
    });
    if (user) {
      let clave = this.servicioAutenticacion.GenerarPassword();
      let clavecifrada = this.servicioAutenticacion.EncriptarPassword(clave);
      user.clave = clavecifrada;
      await this.usuarioRepository.updateById(user.id, user);

      //*notificar el cambio de contraseña al usuario /

      let destino = user.correo;
      let asunto = 'Recuperacion de clave desde la APP-PEDIDOS';
      let contenido = `Hola ${user.nombres}, se ha realizado una recuperación de su contraseña para el ingreso a nuestra app, su nueva contraseña es:${clave}`;

      fetch(
        `http://localhost:5000/e-mail?email_destino=${destino}&asunto=${asunto}&mensaje=${contenido}`,
      ).then((data: any) => {
        console.log(data);
      });
      console.log('Se ha enviado la nueva contraseña al usuario');
      return true;
    } else {
      console.log('el usuario no fue encontrado');
      return false;
    }
  }
  @post('/ModificarPass')
  @response(200, {
    description: 'Modificar clave de parte del usuario',
  })
  async modificar(@requestBody() datos: CambioPass): Promise<Boolean> {
    let user = await this.usuarioRepository.findOne({
      where: {
        clave: datos.cActual,
      },
    });
    if (user) {
      if (datos.cNueva == datos.cValidada) {
        user.clave = this.servicioAutenticacion.EncriptarPassword(datos.cNueva);
        await this.usuarioRepository.updateById(user.id, user);
        //* Notificar Usuario Cambio contraseña
        let destino = user.correo;
        let asunto = 'Modificacion de la contraseña APP-PEDIDOS';
        let contenido = `Hola, ${user.nombres}, usted a realizado un cambio en su contraseña; su nueva contraseña es:${datos.cNueva}, siga el siguiente link para modificarla: http://google.com`;

        fetch(
          `http://localhost:5000/e-mail?email_destino=${destino}&asunto=${asunto}&mensaje=${contenido}`,
        ).then((data: any) => {
          console.log(data);
        });
        console.log('el cambio fue exitoso');
        return true;
      } else {
        console.log('las contraseñas no coinciden');
        return false;
      }
    } else {
      console.log('El usuario no existe en la BD');
      return false;
    }
  }
}
