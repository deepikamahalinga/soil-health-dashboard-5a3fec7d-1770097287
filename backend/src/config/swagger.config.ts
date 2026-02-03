export interface SwaggerDefinition {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
    license?: {
      name: string;
      url: string;
    };
  };
  servers: {
    url: string;
    description: string;
  }[];
  components: {
    schemas: {
      [key: string]: any;
    };
    securitySchemes?: {
      [key: string]: any;
    };
  };
}