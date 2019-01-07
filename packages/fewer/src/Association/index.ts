import { Repository } from '../Repository';
import {
  INTERNAL_TYPES,
  Associations,
  CommonQuery,
  WhereType,
  CreateSelectionSet,
  ResolveAssociations,
  Subset,
} from '../types';

export enum AssociationType {
  HAS_ONE = 'hasOne',
  HAS_MANY = 'hasMany',
  BELONGS_TO = 'belongsTo',
}

export class Association<
  Type extends AssociationType = any,
  RepoType = any,
  SelectionSet = any,
  LoadAssociations extends Associations = {},
  JoinAssociations extends Associations = {}
> implements CommonQuery<RepoType, LoadAssociations & JoinAssociations> {
  [INTERNAL_TYPES.INTERNAL_TYPE]: RepoType;
  [INTERNAL_TYPES.RESOLVED_TYPE]: Subset<
    RepoType & ResolveAssociations<LoadAssociations>,
    SelectionSet,
    keyof LoadAssociations
  >;

  /**
   * The type of relationship that the association represents, such as "hasMany", and "belongsTo".
   */
  readonly type: Type;

  private associate: Repository;

  constructor(type: Type, associate: Repository) {
    this.type = type;
    this.associate = associate;
  }

  pluck<Key extends keyof RepoType>(
    ...fields: Key[]
  ): Association<
    Type,
    RepoType,
    CreateSelectionSet<SelectionSet, Key>,
    LoadAssociations,
    JoinAssociations
  > {
    // @ts-ignore
    return new Association(this.type, this.associate.pluck(...fields));
  }

  pluckAs<Key extends keyof RepoType, Alias extends string>(
    name: Key,
    alias: Alias,
  ): Association<
    Type,
    RepoType & { [P in Alias]: RepoType[Key] },
    CreateSelectionSet<SelectionSet, Alias>,
    LoadAssociations,
    JoinAssociations
  > {
    // @ts-ignore
    return new Association(this.type, this.associate.pluckAs(name, alias));
  }

  limit(amount: number) {
    return new Association(this.type, this.associate.limit(amount));
  }

  offset(amount: number) {
    return new Association(this.type, this.associate.offset(amount));
  }

  order() {
    throw new Error('not yet implemented');
    // return new Association(this.type, this.associate.order());
  }

  where(wheres: WhereType<RepoType>) {
    return new Association(this.type, this.associate.where(wheres));
  }

  load<Name extends string, LoadAssociation extends Association>(
    name: string,
    association: LoadAssociation,
  ): Association<
    Type,
    RepoType,
    SelectionSet,
    LoadAssociations & { [P in Name]: LoadAssociations },
    JoinAssociations
  > {
    return new Association(this.type, this.associate.load(name, association));
  }

  join<Name extends string, JoinAssociation extends Association>(
    name: Name,
    association: JoinAssociation,
  ): Association<
    Type,
    RepoType,
    SelectionSet,
    LoadAssociations,
    JoinAssociations & { [P in Name]: JoinAssociation }
  > {
    return new Association(this.type, this.associate.join(name, association));
  }
}

export function createAssociation<
  Type extends AssociationType,
  Associate extends Repository
>(
  type: Type,
  associate: Associate,
): Association<
  Type,
  Associate[INTERNAL_TYPES.INTERNAL_TYPE],
  INTERNAL_TYPES.ALL_FIELDS,
  {},
  {}
> {
  return new Association(type, associate);
}
