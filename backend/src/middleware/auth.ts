import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { USER_ROLES } from '../utils/constants';
import prisma from '../utils/database';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ 
        success: false, 
        error: 'Access denied. No token provided.' 
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true
      }
    });

    if (!user) {
      res.status(401).json({ 
        success: false, 
        error: 'Invalid token.' 
      });
      return;
    }

    if (user.status !== 'VERIFIED') {
      res.status(401).json({ 
        success: false, 
        error: 'Account not verified.' 
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid token.' 
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: 'Access denied. User not authenticated.' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: 'Access denied. Insufficient permissions.' 
      });
      return;
    }

    next();
  };
};

// Role-specific middleware
export const requireCustomer = authorize(USER_ROLES.CUSTOMER);
export const requireStoreOwner = authorize(USER_ROLES.STORE_OWNER);
export const requireDeliveryPartner = authorize(USER_ROLES.DELIVERY_PARTNER);
export const requireAdmin = authorize(USER_ROLES.ADMIN);

// Multiple roles middleware
export const requireStoreOrAdmin = authorize(USER_ROLES.STORE_OWNER, USER_ROLES.ADMIN);
export const requireDeliveryOrAdmin = authorize(USER_ROLES.DELIVERY_PARTNER, USER_ROLES.ADMIN);
export const requireAnyUser = authorize(USER_ROLES.CUSTOMER, USER_ROLES.STORE_OWNER, USER_ROLES.DELIVERY_PARTNER, USER_ROLES.ADMIN);
