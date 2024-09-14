import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest(); // request = { id: user.id }
    const user = request.user; // user: { id: user.id, email: user.email }
    return user;
  },
);
