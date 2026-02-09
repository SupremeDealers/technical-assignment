import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT } from "../utilities/config";


type TokenPayload = JwtPayload & {
    userId: string
}
export async function middleware(req: Request, res: Response, next: NextFunction) {

    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer')) {
        return res.status(400).json({
            message: "Header not found"
        })
    }

    const token = header.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT) as TokenPayload
        if (decoded) {
            req.userId = decoded.userId;
            next()
        } else {
            return res.status(400).json({ message: "You are not loggen in" })
        }
    } catch (e) {
        return res.status(500).json({ message: "Invalid token" })

    }
}