import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {RolUsuario} from '../models';
import {RolUsuarioRepository} from '../repositories';

export class RolUsuarioController {
  constructor(
    @repository(RolUsuarioRepository)
    public rolUsuarioRepository : RolUsuarioRepository,
  ) {}

  @post('/rol-usuarios')
  @response(200, {
    description: 'RolUsuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(RolUsuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RolUsuario, {
            title: 'NewRolUsuario',
            exclude: ['id'],
          }),
        },
      },
    })
    rolUsuario: Omit<RolUsuario, 'id'>,
  ): Promise<RolUsuario> {
    return this.rolUsuarioRepository.create(rolUsuario);
  }

  @get('/rol-usuarios/count')
  @response(200, {
    description: 'RolUsuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(RolUsuario) where?: Where<RolUsuario>,
  ): Promise<Count> {
    return this.rolUsuarioRepository.count(where);
  }

  @get('/rol-usuarios')
  @response(200, {
    description: 'Array of RolUsuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(RolUsuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(RolUsuario) filter?: Filter<RolUsuario>,
  ): Promise<RolUsuario[]> {
    return this.rolUsuarioRepository.find(filter);
  }

  @patch('/rol-usuarios')
  @response(200, {
    description: 'RolUsuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RolUsuario, {partial: true}),
        },
      },
    })
    rolUsuario: RolUsuario,
    @param.where(RolUsuario) where?: Where<RolUsuario>,
  ): Promise<Count> {
    return this.rolUsuarioRepository.updateAll(rolUsuario, where);
  }

  @get('/rol-usuarios/{id}')
  @response(200, {
    description: 'RolUsuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(RolUsuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(RolUsuario, {exclude: 'where'}) filter?: FilterExcludingWhere<RolUsuario>
  ): Promise<RolUsuario> {
    return this.rolUsuarioRepository.findById(id, filter);
  }

  @patch('/rol-usuarios/{id}')
  @response(204, {
    description: 'RolUsuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RolUsuario, {partial: true}),
        },
      },
    })
    rolUsuario: RolUsuario,
  ): Promise<void> {
    await this.rolUsuarioRepository.updateById(id, rolUsuario);
  }

  @put('/rol-usuarios/{id}')
  @response(204, {
    description: 'RolUsuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() rolUsuario: RolUsuario,
  ): Promise<void> {
    await this.rolUsuarioRepository.replaceById(id, rolUsuario);
  }

  @del('/rol-usuarios/{id}')
  @response(204, {
    description: 'RolUsuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.rolUsuarioRepository.deleteById(id);
  }
}
