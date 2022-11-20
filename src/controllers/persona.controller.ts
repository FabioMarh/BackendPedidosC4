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
import {Credenciales, Persona} from '../models';
import {PersonaRepository} from '../repositories';
import {AutenticacionService} from '../services';

const fetch = require('node-fetch'); //importar el paquete de nodeferch en una constante para la notificacion del usuario via correo

export class PersonaController {
  constructor(
    @repository(PersonaRepository)
    public personaRepository: PersonaRepository,
    @service(AutenticacionService) //*para hacer la autenticacion
    public servicioautenticacion: AutenticacionService, //Este objeto sirve para llamar el servicio
  ) {}

  @post('/Registro')
  @response(200, {
    description: 'Persona model instance',
    content: {'application/json': {schema: getModelSchemaRef(Persona)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {
            title: 'NewPersona',
            exclude: ['id'],
          }),
        },
      },
    })
    persona: Omit<Persona, 'id'>,
    //Sobre este metodo post se deben de agregar los metodos para la funcionalidad de la generacion de la clave y su encriptacion
  ): Promise<Persona> {
    let password = this.servicioautenticacion.GenerarPassword();
    let passwordE = this.servicioautenticacion.EncriptarPassword(password);
    persona.clave = passwordE;
    let p = await this.personaRepository.create(persona);

    // Incluir Notificacion
    let destino = p.correo;
    let asunto = 'Registro en la APP - PEDIDOS';
    let contenido = `Hola, ${p.nombres}, su nombre de usuario es: ${p.correo} y su contraseña de acceso a nuestra app es: ${password} `; //string template(cocatenar de otra manera)__ tener en cuenta que usa tildes invertidas

    fetch(
      `${Keys.ulrNotificaciones}/e-mail?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`,
    ).then((data: any) => {
      console.log(data);
    }); // sirve para conectarse a un servidor externo y consumir estos recursos ofrecidos por los servicios, este debe ser previamente instalado
    return p;
  }

  @get('/personas/count')
  @response(200, {
    description: 'Persona model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Persona) where?: Where<Persona>): Promise<Count> {
    return this.personaRepository.count(where);
  }

  @get('/personas')
  @response(200, {
    description: 'Array of Persona model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Persona, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Persona) filter?: Filter<Persona>,
  ): Promise<Persona[]> {
    return this.personaRepository.find(filter);
  }

  @patch('/personas')
  @response(200, {
    description: 'Persona PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
    @param.where(Persona) where?: Where<Persona>,
  ): Promise<Count> {
    return this.personaRepository.updateAll(persona, where);
  }

  @get('/personas/{id}')
  @response(200, {
    description: 'Persona model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Persona, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Persona, {exclude: 'where'})
    filter?: FilterExcludingWhere<Persona>,
  ): Promise<Persona> {
    return this.personaRepository.findById(id, filter);
  }

  @patch('/personas/{id}')
  @response(204, {
    description: 'Persona PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
  ): Promise<void> {
    await this.personaRepository.updateById(id, persona);
  }

  @put('/personas/{id}')
  @response(204, {
    description: 'Persona PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() persona: Persona,
  ): Promise<void> {
    await this.personaRepository.replaceById(id, persona);
  }

  @del('/personas/{id}')
  @response(204, {
    description: 'Persona DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.personaRepository.deleteById(id);
  }

  /*
   * Metodos propios  ---
   */

  @post('/Login', {
    responses: {
      '200': {
        description: 'Identificación de las personas',
      },
    },
  })
  async identificar(
    @requestBody() credenciales: Credenciales,
  ): Promise<Persona | null> {
    let clavecifrada = this.servicioautenticacion.EncriptarPassword(
      credenciales.password,
    );
    let persona = await this.personaRepository.findOne({
      where: {
        correo: credenciales.usuario,
        clave: clavecifrada,
      },
    });
    return persona;
  }

  @post('/LoginT')
  @response(200, {
    description: 'Identificacion de personas con generación de token',
  })
  async identificarT(@requestBody() credenciales: Credenciales) {
    credenciales.password = this.servicioautenticacion.EncriptarPassword(
      credenciales.password,
    );
    let p = await this.servicioautenticacion.IdentificarUsuario(credenciales);
    if (p) {
      let token = this.servicioautenticacion.GeneracionToken(p);
      return {
        datos: {
          nombres: p.nombres,
          id: p.id,
        },
        tk: token,
      };
    } else {
      throw new HttpErrors[401]('Datos Invalidos');
    }
  }
}
