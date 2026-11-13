export type SchemaValidationResult = {
  validator: "local-jsonld";
  valid: boolean;
  itemCount: number;
  errors: string[];
  warnings: string[];
};

type JsonLdNode = { value: unknown; context: unknown };

function collectJsonLdItems(value: unknown, inheritedContext?: unknown): JsonLdNode[] {
  if (Array.isArray(value)) return value.flatMap((item) => collectJsonLdItems(item, inheritedContext));
  if (typeof value !== "object" || value === null) return [{ value, context: inheritedContext }];

  const record = value as Record<string, unknown>;
  const context = record["@context"] ?? inheritedContext;
  if (record["@graph"] !== undefined) return collectJsonLdItems(record["@graph"], context);
  return [{ value, context }];
}

function contextIncludesSchemaOrg(context: unknown): boolean {
  if (typeof context === "string") return /https?:\/\/(?:www\.)?schema\.org\/?$/i.test(context);
  if (Array.isArray(context)) return context.some(contextIncludesSchemaOrg);
  if (typeof context === "object" && context !== null) {
    const value = (context as Record<string, unknown>)["@vocab"];
    return typeof value === "string" && /schema\.org\/?$/i.test(value);
  }
  return false;
}

function hasUsableType(value: unknown): boolean {
  return typeof value === "string"
    ? value.trim().length > 0
    : Array.isArray(value) && value.length > 0 && value.every((type) => typeof type === "string" && type.trim().length > 0);
}

export function validateJsonLd(items: unknown[]): SchemaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodes = items.flatMap((item) => collectJsonLdItems(item));

  if (nodes.length === 0) {
    return {
      validator: "local-jsonld",
      valid: false,
      itemCount: 0,
      errors: [],
      warnings: ["No JSON-LD structured data was found."],
    };
  }

  nodes.forEach(({ value: node, context }, index) => {
    if (typeof node !== "object" || node === null || Array.isArray(node)) {
      errors.push(`Structured data item ${index + 1} must be a JSON object.`);
      return;
    }

    const record = node as Record<string, unknown>;
    if (!hasUsableType(record["@type"])) {
      errors.push(`Structured data item ${index + 1} is missing a valid @type.`);
    }
    if (!contextIncludesSchemaOrg(record["@context"] ?? context)) {
      warnings.push(`Structured data item ${index + 1} does not declare a Schema.org @context.`);
    }

    const types = Array.isArray(record["@type"]) ? record["@type"] : [record["@type"]];
    const isBusinessType = types.some((type) =>
      typeof type === "string" && /(?:LocalBusiness|Dentist|MedicalOrganization)$/i.test(type),
    );
    if (isBusinessType && (typeof record.name !== "string" || !record.name.trim())) {
      warnings.push(`Business structured data item ${index + 1} is missing a name.`);
    }
  });

  return {
    validator: "local-jsonld",
    valid: errors.length === 0,
    itemCount: nodes.length,
    errors,
    warnings,
  };
}
