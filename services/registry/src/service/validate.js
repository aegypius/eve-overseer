import tv4 from 'tv4';

export const schema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Service',
  description: 'Describe micro-service registry format',
  type: 'object',
  properties: {
    service: {
      description: 'The name of your service',
      type: 'string'
    },
    version: {
      description: 'A semantic version number.',
      type: 'string'
    },
    routes: {
      description: 'The gateway routes to use',
      type: 'object',
      patternProperties: {
        '.{1,}': {
          $ref: '#/definitions/route'
        }
      }
    }
  },
  required: [
    'service',
    'version'
  ],
  definitions: {
    route: {
      title: 'Route',
      description: 'Describe a route',
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          format: 'uri'
        },
        methods: {
          type: ['array'],
          items: {
            enum: [
              'GET',
              'POST',
              'PUT',
              'DELETE',
              'HEAD',
              'OPTIONS'
            ]
          }
        }
      },
      required: [
        'pattern'
      ]
    }
  }
}
;

export default async(data = {}) => {
  const {errors, valid} = await tv4.validateMultiple(data, schema);

  if (!valid) {
    throw errors;
  }
  return valid;
};
