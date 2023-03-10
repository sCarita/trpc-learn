import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { CookieOptions } from 'express';
import { Context } from '../app';
import customConfig from '../config/default';
import { CreateUserInput, LoginUserInput } from '../schemas/user.schema';
import {
  createUser,
  findUniqueUser,
  findUser,
  signTokens,
} from '../services/user.service';
import redisClient from '../utils/connectRedis';
import { signJwt, verifyJwt } from '../utils/jwt';
// [...] Imports

// [...] Cookie Options
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: customConfig.env === 'production',
  sameSite: 'lax',
};

const accessTokenCookieOptions: CookieOptions = {
  ...cookieOptions,
  expires: new Date(Date.now() + customConfig.accessTokenExpiresIn * 60 * 1000),
};

const refreshTokenCookieOptions: CookieOptions = {
  ...cookieOptions,
  expires: new Date(
    Date.now() + customConfig.refreshTokenExpiresIn * 60 * 1000
  ),
};

// [...] Register User Handler
export const registerHandler = async ({
  input,
}: {
  input: CreateUserInput;
}) => {
  try {
    const hashedPassword = await bcrypt.hash(input.password, 12);
    const user = await createUser({
      email: input.email.toLowerCase(),
      name: input.name,
      password: hashedPassword,
      // photo: input.photo,
      provider: 'local',
    });

    return {
      status: 'success',
      data: {
        user,
      },
    };
  } catch (err: any) {
    if (err.code === "P2002") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Email already exists",
      });
    }
    throw err;
  }
};

// [...] Login User Handler
export const loginHandler = async ({
  input,
  ctx,
}: {
  input: LoginUserInput;
  ctx: Context;
}) => {
  try {
    // Get the user from the collection
    const user = await findUser({ email: input.email.toLowerCase() });

    // Check if user exist and password is correct
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid email or password',
      });
    }

    // Create the Access and refresh Tokens
    const { access_token, refresh_token } = await signTokens(user);

    // Send Access Token in Cookie
    ctx.res.cookie('access_token', access_token, accessTokenCookieOptions);
    ctx.res.cookie('refresh_token', refresh_token, refreshTokenCookieOptions);
    ctx.res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // Send Access Token
    return {
      status: 'success',
      access_token,
    };
  } catch (err: any) {
    throw err;
  }
};

// [...] Refresh Access Token Handler
export const refreshAccessTokenHandler = async ({ ctx }: { ctx: Context }) => {
  try {
    // Get the refresh token from cookie
    const refresh_token = ctx.req.cookies?.refresh_token as string;

    const message = 'Could not refresh access token';
    if (!refresh_token) {
      throw new TRPCError({ code: 'FORBIDDEN', message });
    }

    // Validate the Refresh token
    const decoded = verifyJwt<{ sub: string }>(
      refresh_token,
      'refreshTokenPublicKey'
    );

    if (!decoded) {
      throw new TRPCError({ code: 'FORBIDDEN', message });
    }

    // Check if the user has a valid session
    const session = await redisClient.get(decoded.sub);
    if (!session) {
      throw new TRPCError({ code: 'FORBIDDEN', message });
    }

    // Check if the user exist
    const user = await findUniqueUser({ id: JSON.parse(session).id });

    if (!user) {
      throw new TRPCError({ code: 'FORBIDDEN', message });
    }

    // Sign new access token
    const access_token = signJwt({ sub: user.id }, 'accessTokenPrivateKey', {
      expiresIn: `${customConfig.accessTokenExpiresIn}m`,
    });

    // Send the access token as cookie
    ctx.res.cookie('access_token', access_token, accessTokenCookieOptions);
    ctx.res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // Send response
    return {
      status: 'success',
      access_token,
    };
  } catch (err: any) {
    throw err;
  }
};

// [...] Logout User Handler
const logout = ({ ctx }: { ctx: Context }) => {
  ctx.res.cookie('access_token', '', { maxAge: -1 });
  ctx.res.cookie('refresh_token', '', { maxAge: -1 });
  ctx.res.cookie('logged_in', '', {
    maxAge: -1,
  });
};

export const logoutHandler = async ({ ctx }: { ctx: Context }) => {
  try {
    const user = ctx.user;
    await redisClient.del(user?.id as string);
    logout({ ctx });
    return { status: 'success' };
  } catch (err: any) {
    throw err;
  }
};