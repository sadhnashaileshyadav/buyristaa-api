import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import Razorpay = require('razorpay');
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private razorpay: Razorpay;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(createPaymentDto: CreatePaymentDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: createPaymentDto.userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.is_active) {
      throw new BadRequestException('User is already active');
    }

    const options = {
      amount: createPaymentDto.amount,
      currency: 'INR',
      receipt: createPaymentDto.receipt,
    };

    const order = await this.razorpay.orders.create(options);

    // Save payment record
    const payment = this.paymentRepository.create({
      userId: createPaymentDto.userId,
      orderId: order.id,
      amount: createPaymentDto.amount,
      status: 'pending',
    });
    await this.paymentRepository.save(payment);

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
  }

  async verifyPayment(verifyPaymentDto: VerifyPaymentDto): Promise<any> {
    let payment = await this.paymentRepository.findOne({
      where: { orderId: verifyPaymentDto.razorpay_order_id },
      relations: ['user'],
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${verifyPaymentDto.razorpay_order_id}|${verifyPaymentDto.razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== verifyPaymentDto.razorpay_signature) {
      // Update payment status to failed
      await this.paymentRepository.update(
        { id: payment.id },
        { status: 'failed' },
      );
      throw new BadRequestException('Invalid signature');
    }

    // Update payment with all fields
    await this.paymentRepository.update(
      { id: payment.id },
      {
        status: 'completed',
        paymentId: verifyPaymentDto.razorpay_payment_id,
        signature: verifyPaymentDto.razorpay_signature,
      },
    );

    // Reload payment to ensure all fields are updated
    payment = await this.paymentRepository.findOne({
      where: { id: payment.id },
      relations: ['user'],
    });

    // Activate user
    const user = payment.user;
    user.is_active = true;
    await this.userRepository.save(user);

    // Handle referral points
    await this.handleReferralPoints(user);

    return {
      message: 'Payment verified and user activated',
      payment: payment,
    };
  }

  private async handleReferralPoints(user: User): Promise<void> {
    if (user.referredBy && user.referredBy !== 0) {
      // First level: referrer gets 100
      const referrer = await this.userRepository.findOne({ where: { id: user.referredBy } });
      if (referrer) {
        referrer.totalPoint = (referrer.totalPoint || 0) + 100;
        await this.userRepository.save(referrer);

        // Second level: referrer's referrer gets 150
        if (referrer.referredBy && referrer.referredBy !== 0) {
          const secondLevelReferrer = await this.userRepository.findOne({ where: { id: referrer.referredBy } });
          if (secondLevelReferrer) {
            secondLevelReferrer.totalPoint = (secondLevelReferrer.totalPoint || 0) + 150;
            await this.userRepository.save(secondLevelReferrer);
          }
        }
      }
    }
  }
}