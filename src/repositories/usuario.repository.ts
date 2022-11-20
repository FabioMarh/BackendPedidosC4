import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Usuario, UsuarioRelations, Roles, RolUsuario} from '../models';
import {RolUsuarioRepository} from './rol-usuario.repository';
import {RolesRepository} from './roles.repository';

export class UsuarioRepository extends DefaultCrudRepository<
  Usuario,
  typeof Usuario.prototype.id,
  UsuarioRelations
> {

  public readonly roles: HasManyThroughRepositoryFactory<Roles, typeof Roles.prototype.id,
          RolUsuario,
          typeof Usuario.prototype.id
        >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('RolUsuarioRepository') protected rolUsuarioRepositoryGetter: Getter<RolUsuarioRepository>, @repository.getter('RolesRepository') protected rolesRepositoryGetter: Getter<RolesRepository>,
  ) {
    super(Usuario, dataSource);
    this.roles = this.createHasManyThroughRepositoryFactoryFor('roles', rolesRepositoryGetter, rolUsuarioRepositoryGetter,);
    this.registerInclusionResolver('roles', this.roles.inclusionResolver);
  }
}
