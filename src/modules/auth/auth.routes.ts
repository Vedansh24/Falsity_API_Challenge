import type { FastifyInstance, RouteShorthandOptions } from 'fastify';

import { authenticate } from '../../middlewares/authenticate';

import {
  loginBodyJsonSchema,
  loginResponseJsonSchema,
  meResponseJsonSchema,
  registerBodyJsonSchema,
  registerResponseJsonSchema
} from './auth.schema';
import {
  loginController,
  meController,
  registerController
} from './auth.controller';

const registerRouteOptions: RouteShorthandOptions = {
  schema: {
    body: registerBodyJsonSchema,
    response: {
      201: registerResponseJsonSchema
    }
  }
};

const loginRouteOptions: RouteShorthandOptions = {
  schema: {
    body: loginBodyJsonSchema,
    response: {
      200: loginResponseJsonSchema
    }
  }
};

const meRouteOptions: RouteShorthandOptions = {
  preHandler: authenticate,
  schema: {
    response: {
      200: meResponseJsonSchema
    }
  }
};

export function registerAuthRoutes(fastify: FastifyInstance): void {
  fastify.register(async (instance) => {
    instance.post('/register', registerRouteOptions, registerController);
    instance.post('/login', loginRouteOptions, loginController);
    instance.get('/me', meRouteOptions, meController);
  }, { prefix: '/api/v1/auth' });
}
