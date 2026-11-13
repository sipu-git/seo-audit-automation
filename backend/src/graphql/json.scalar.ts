import {
  GraphQLError,
  GraphQLScalarType,
  Kind,
  type ValueNode,
} from "graphql";

function parseLiteral(node: ValueNode): unknown {
  switch (node.kind) {
    case Kind.NULL:
      return null;
    case Kind.BOOLEAN:
      return node.value;
    case Kind.INT:
      return Number.parseInt(node.value, 10);
    case Kind.FLOAT:
      return Number.parseFloat(node.value);
    case Kind.STRING:
    case Kind.ENUM:
      return node.value;
    case Kind.LIST:
      return node.values.map(parseLiteral);
    case Kind.OBJECT:
      return Object.fromEntries(node.fields.map((field) => [field.name.value, parseLiteral(field.value)]));
    default:
      throw new GraphQLError(`JSON cannot represent literal "${node.kind}".`);
  }
}

export const jsonScalar = new GraphQLScalarType({
  name: "JSON",
  description: "Arbitrary JSON value.",
  serialize: (value: unknown) => value,
  parseValue: (value: unknown) => value,
  parseLiteral,
});
