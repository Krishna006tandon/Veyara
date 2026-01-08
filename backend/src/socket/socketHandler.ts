import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../utils/database';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const initializeSocket = (io: Server) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
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

      if (!user || user.status !== 'VERIFIED') {
        return next(new Error('Authentication error'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);

    // Join role-based room
    socket.join(`${socket.userRole}-${socket.userId}`);
    
    // Join customer to their orders
    if (socket.userRole === 'CUSTOMER') {
      joinCustomerOrders(socket);
    }
    
    // Join store owner to their store
    if (socket.userRole === 'STORE_OWNER') {
      joinStoreRoom(socket);
    }
    
    // Join delivery partner to their deliveries
    if (socket.userRole === 'DELIVERY_PARTNER') {
      joinDeliveryPartnerRoom(socket);
    }

    // Handle order tracking
    socket.on('track-order', async (orderId: string) => {
      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: {
            id: true,
            userId: true,
            storeId: true,
            status: true
          }
        });

        if (!order) {
          socket.emit('error', { message: 'Order not found' });
          return;
        }

        // Only allow customer, store owner, or assigned delivery partner to track
        const canTrack = 
          (socket.userRole === 'CUSTOMER' && order.userId === socket.userId) ||
          (socket.userRole === 'STORE_OWNER') ||
          (socket.userRole === 'DELIVERY_PARTNER');

        if (!canTrack) {
          socket.emit('error', { message: 'Unauthorized to track this order' });
          return;
        }

        socket.join(`order-${orderId}`);
        socket.emit('tracking-joined', { orderId });
        
        // Send current order status
        socket.emit('order-status', { 
          orderId, 
          status: order.status,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Track order error:', error);
        socket.emit('error', { message: 'Failed to track order' });
      }
    });

    // Handle delivery partner location updates
    socket.on('location-update', async (data: { orderId: string; location: { lat: number; lng: number } }) => {
      try {
        if (socket.userRole !== 'DELIVERY_PARTNER') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const { orderId, location } = data;
        
        // Verify delivery partner is assigned to this order
        const delivery = await prisma.delivery.findFirst({
          where: {
            orderId,
            partnerId: socket.userId!,
            status: { in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'] }
          }
        });

        if (!delivery) {
          socket.emit('error', { message: 'Not assigned to this delivery' });
          return;
        }

        // Update delivery location in database
        await prisma.delivery.update({
          where: { id: delivery.id },
          data: {
            partnerLocation: location
          }
        });

        // Broadcast location to order tracking room
        socket.to(`order-${orderId}`).emit('delivery-location', {
          orderId,
          location,
          timestamp: new Date().toISOString()
        });

        socket.emit('location-updated', { orderId, location });
      } catch (error) {
        console.error('Location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle order status updates (store owner)
    socket.on('order-status-update', async (data: { orderId: string; status: string }) => {
      try {
        if (socket.userRole !== 'STORE_OWNER') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const { orderId, status } = data;
        
        // Verify store ownership
        const order = await prisma.order.findFirst({
          where: {
            id: orderId,
            store: {
              ownerId: socket.userId!
            }
          }
        });

        if (!order) {
          socket.emit('error', { message: 'Order not found or unauthorized' });
          return;
        }

        // Update order status
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status: status as any }
        });

        // Broadcast status update
        io.to(`order-${orderId}`).emit('order-status', {
          orderId,
          status: updatedOrder.status,
          timestamp: new Date().toISOString()
        });

        // Send notifications
        await sendOrderStatusNotification(orderId, updatedOrder.status);
      } catch (error) {
        console.error('Order status update error:', error);
        socket.emit('error', { message: 'Failed to update order status' });
      }
    });

    // Handle delivery acceptance
    socket.on('accept-delivery', async (data: { orderId: string; estimatedTime: number }) => {
      try {
        if (socket.userRole !== 'DELIVERY_PARTNER') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const { orderId, estimatedTime } = data;
        
        // Create or update delivery assignment
        const delivery = await prisma.delivery.upsert({
          where: { orderId },
          update: {
            partnerId: socket.userId!,
            status: 'ACCEPTED',
            estimatedTime,
            partnerEarnings: calculateDeliveryEarnings(estimatedTime)
          },
          create: {
            orderId,
            partnerId: socket.userId!,
            status: 'ACCEPTED',
            estimatedTime,
            pickupAddress: {}, // Will be populated from order
            deliveryAddress: {}, // Will be populated from order
            earnings: calculateDeliveryEarnings(estimatedTime),
            partnerEarnings: calculateDeliveryEarnings(estimatedTime) * 0.85, // 85% to partner
            platformFee: calculateDeliveryEarnings(estimatedTime) * 0.15, // 15% platform fee
            distance: 0 // Will be calculated
          }
        });

        // Update order status
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'OUT_FOR_DELIVERY' }
        });

        // Join delivery room
        socket.join(`delivery-${orderId}`);
        
        // Notify all parties
        io.to(`order-${orderId}`).emit('delivery-accepted', {
          orderId,
          partnerId: socket.userId,
          estimatedTime
        });

        socket.emit('delivery-assigned', { orderId, deliveryId: delivery.id });
      } catch (error) {
        console.error('Accept delivery error:', error);
        socket.emit('error', { message: 'Failed to accept delivery' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId} (${socket.userRole})`);
    });
  });
};

// Helper functions
async function joinCustomerOrders(socket: AuthenticatedSocket) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: socket.userId! },
      select: { id: true }
    });

    orders.forEach(order => {
      socket.join(`order-${order.id}`);
    });
  } catch (error) {
    console.error('Error joining customer orders:', error);
  }
}

async function joinStoreRoom(socket: AuthenticatedSocket) {
  try {
    const store = await prisma.store.findUnique({
      where: { ownerId: socket.userId! },
      select: { id: true }
    });

    if (store) {
      socket.join(`store-${store.id}`);
    }
  } catch (error) {
    console.error('Error joining store room:', error);
  }
}

async function joinDeliveryPartnerRoom(socket: AuthenticatedSocket) {
  try {
    const deliveries = await prisma.delivery.findMany({
      where: { partnerId: socket.userId! },
      select: { orderId: true }
    });

    deliveries.forEach(delivery => {
      socket.join(`delivery-${delivery.orderId}`);
      socket.join(`order-${delivery.orderId}`);
    });
  } catch (error) {
    console.error('Error joining delivery partner room:', error);
  }
}

function calculateDeliveryEarnings(estimatedTime: number): number {
  const baseFee = 20;
  const timeBonus = Math.max(0, (30 - estimatedTime) * 0.5);
  return baseFee + timeBonus;
}

async function sendOrderStatusNotification(orderId: string, status: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true }
    });

    if (order) {
      // Create notification (in a real app, this would also send push notification)
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: 'Order Update',
          message: `Your order status has been updated to: ${status}`,
          type: 'order',
          data: { orderId, status }
        }
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
