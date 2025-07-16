import { createQueryStrLazy } from "@hrbolek/uoisfrontend-gql-shared";

/**
 * GraphQL query for loading group types
 * Returns an array of group types with id and name
 * @type {Function}
 */
export const groupTypePageQuery = createQueryStrLazy(`
query {
  groupTypePage {
    id
    name
  }
}
`);

/**
 * GraphQL mutation for inserting a new group
 * Uses variables for name and grouptypeId
 * Returns either GroupGQLModel or InsertError
 * @type {Function}
 */
export const groupInsertQuery = createQueryStrLazy(`
mutation GroupInsert($name: String!, $grouptypeId: UUID!) {
  groupInsert(
    group: {name: $name, grouptypeId: $grouptypeId}
  ) {
    __typename
    ... on GroupGQLModel {
      id
      name
      nameEn
      lastchange
      mastergroup {
        id
        name
      }
      grouptype {
        id
        name
      }
    }
    ... on InsertError {
      input
      failed
      msg
    }
  }
}
`);