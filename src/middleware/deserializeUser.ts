import { Request, Response, NextFunction } from "express";
import { omit } from "lodash";
import { excludedFields, findUniqueUser, generateNewAccessToken } from "../services/user.service";
import ErrorHandler from "../utils/ErrorHandler";
import redisClient from "../utils/connectRedis";
import { verifyJwt } from "../utils/jwt";

export const deserializeUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        let access_token = req.headers.authorization?.split(' ')[1] ?? req.cookies.access_token;

        if (!access_token) {
            const refresh_token = req.cookies.refresh_token;

            if (!refresh_token) {
                return next(new ErrorHandler(401, "You are not logged in"));
            }

            // validate the refresh token
            const decodedRefresh = verifyJwt<{ sub: string }>(
                refresh_token,
                "refreshTokenPublicKey"
            )

            if (!decodedRefresh) {
                return next(new ErrorHandler(401, "Invalid token or session has expired"));
            }

            const newAccessToken = generateNewAccessToken(decodedRefresh.sub);
            res.setHeader('Authorization', `Bearer ${newAccessToken}`);
            access_token = newAccessToken;
        }

        // validate the access token
        const decoded = verifyJwt<{ sub: string }>(
            access_token,
            "accessTokenPublicKey"
        );

        if (!decoded) {
            return next(new ErrorHandler(401, "Invalid token or session has expired"));
        }

        const session = await redisClient.get(decoded.sub);

        if (!session) {
            return next(new ErrorHandler(401, "Session has expired"));
        }

        const user = await findUniqueUser({ id: JSON.parse(session).id });

        if (!user) {
            return next(new ErrorHandler(401, "Invalid token or session has expired"));
        }

        res.locals.user = omit(user, excludedFields);

        next();
    } catch (error) {
        next(error)
    }
}
